import logging
from typing import Any, Dict, List, Optional

from app.models.incident import (
    AgentRecommendationOutput,
    Incident,
    RecommendedAction,
    RiskLevelEnum,
    SeverityEnum,
)
from app.services.hindsight_service import hindsight_service
from app.services.hydradb_service import hydradb_service
from app.services.rocketride_service import rocketride_service

logger = logging.getLogger(__name__)


class AgentService:
    """Core Memory-First AI Incident Response Orchestrator.
    
    Combines:
    1. HydraDB graph context (dependencies, deployments, topology)
    2. Hindsight long-term memories (facts, past incident experience, engineer feedback)
    3. RocketRide pipeline execution (observable multi-step agent reasoning)
    4. Safety & Risk Analysis (human-in-the-loop protection)
    """

    async def analyze_incident(self, incident: Incident) -> AgentRecommendationOutput:
        """Run full agent reasoning loop for an incoming or active incident."""
        logger.info(f"Agent analyzing incident #{incident.id}: {incident.title}")

        # 1. Fetch HydraDB Graph Context
        graph_ctx = await hydradb_service.get_incident_graph_context(incident.id, incident.service)
        
        # 2. Fetch Hindsight Memory Recall
        recall_query = f"{incident.service} {incident.title} {' '.join(incident.symptoms)}"
        recalled_memories = await hindsight_service.recall(query=recall_query, top_k=5)

        # 3. Execute RocketRide Pipeline Run
        pipeline_trace = await rocketride_service.run_pipeline(
            pipeline_name="incident_response_workflow",
            input_data=incident.model_dump(),
            graph_context=graph_ctx,
            memories=recalled_memories
        )

        # 4. Fuse Memory + Graph Context for Context Synthesis
        graph_evidence = []
        if graph_ctx.get("service_dependencies"):
            deps_str = ", ".join([d.get("id", d.get("name", "")) for d in graph_ctx["service_dependencies"]])
            graph_evidence.append(f"Service '{incident.service}' depends on: {deps_str}")
        if incident.deployment_version:
            graph_evidence.append(f"Current active deployment is version {incident.deployment_version}")

        memory_evidence = []
        historical_lessons = []
        specific_transaction_lesson = False

        for mem in recalled_memories:
            content = mem.get("content", "")
            memory_evidence.append(f"Memory (id={mem.get('id')}): {content}")
            if "lesson" in mem.get("type", "").lower() or "feedback" in mem.get("metadata", {}) or "check" in content.lower():
                historical_lessons.append(content)
            if "transaction" in content.lower() or "active transaction" in content.lower() or "check active" in content.lower():
                specific_transaction_lesson = True

        # 5. Formulate Hypotheses & Actions based on learned context
        root_cause_hypotheses = [
            f"Database connection pool exhaustion on dependency '{graph_ctx.get('service_dependencies', [{}])[0].get('id', 'database')}'",
            f"Regression introduced by deployment {incident.deployment_version or 'v3.2'}"
        ]

        recommended_actions = []

        # Action 1: Inspection (LOW Risk)
        recommended_actions.append(
            RecommendedAction(
                id="act-001",
                action_type="INSPECT_DIAGNOSTICS",
                description=f"Inspect active connection count and active transactions on {incident.service} database",
                risk_level=RiskLevelEnum.LOW,
                requires_approval=False,
                command_preview=f"kubectl exec -it deployment/{incident.service} -- check-db-connections --active-tx",
                rationale="Non-destructive telemetry inspection to verify if connection leaks or active long-running transactions are consuming pool capacity.",
                graph_evidence=graph_evidence,
                memory_evidence=memory_evidence,
                simulated_outcome="Telemetry captured: 98/100 connections active, 12 long-running uncommitted transactions detected."
            )
        )

        # Action 2: Safe Rollback (MEDIUM Risk)
        recommended_actions.append(
            RecommendedAction(
                id="act-002",
                action_type="ROLLBACK_DEPLOYMENT",
                description=f"Roll back {incident.service} from {incident.deployment_version or 'v3.2'} to previous stable release v3.1",
                risk_level=RiskLevelEnum.MEDIUM,
                requires_approval=True,
                command_preview=f"kubectl rollout undo deployment/{incident.service}",
                rationale="Roll back recent deployment which introduced connection pool leak regression.",
                graph_evidence=graph_evidence,
                memory_evidence=memory_evidence,
                simulated_outcome="Simulation successful. Service would be rolled back from v3.2 -> v3.1. Connection pool pressure expected to drop to normal levels."
            )
        )

        # Action 3: Restart (HIGH Risk)
        restart_rationale = "Restarting service pods terminates stuck threads, but carries risk of dropping active transactions if executed prematurely."
        if specific_transaction_lesson:
            restart_rationale += " WARNING: Historical lesson explicitly instructs checking active transactions BEFORE initiating a restart."

        recommended_actions.append(
            RecommendedAction(
                id="act-003",
                action_type="RESTART_SERVICE",
                description=f"Perform rolling restart of {incident.service} pods",
                risk_level=RiskLevelEnum.HIGH,
                requires_approval=True,
                command_preview=f"kubectl rollout restart deployment/{incident.service}",
                rationale=restart_rationale,
                graph_evidence=graph_evidence,
                memory_evidence=memory_evidence,
                simulated_outcome="Pod restart simulated. 3 pods cycled. WARNING: Check active transactions first."
            )
        )

        # 6. Build Explanation WHY
        why_explanation = {
            "graph_evidence": graph_evidence,
            "memory_evidence": memory_evidence,
            "learned_lessons": historical_lessons,
            "conclusion": (
                "Based on historical memory of previous incidents and HydraDB dependency graph, "
                "there is a strong pattern linking deployment regressions to database connection pool leaks. "
                "Inspect connection lifecycle and active transactions first before considering restart."
                if specific_transaction_lesson else
                "HydraDB topology shows Payment API dependency on Payment DB. Hindsight recalls past connection exhaustion issues. Inspect diagnostics first."
            )
        }

        safety_notes = [
            "HIGH-RISK action (production restart/rollback) requires explicit human approval.",
            "No dangerous automated production commands will be executed without engineer verification."
        ]
        if specific_transaction_lesson:
            safety_notes.insert(0, "CRITICAL LESSON APPLIED: Do not restart service before checking active transactions.")

        summary_text = (
            f"IncidentOS Memory-First Analysis: Historical pattern recognized for {incident.service}. "
            + ("Applied learned operational lesson: Check active transactions before restart." if specific_transaction_lesson else "No previous specific lesson recorded for this exact error pattern.")
        )

        return AgentRecommendationOutput(
            summary=summary_text,
            severity=incident.severity,
            root_cause_hypotheses=root_cause_hypotheses,
            graph_context=[graph_ctx],
            memory_context=recalled_memories,
            recommended_actions=recommended_actions,
            historical_lessons=historical_lessons,
            safety_notes=safety_notes,
            requires_human_approval=True,
            explanation_why=why_explanation,
            conflicts_detected=[]
        )


agent_service = AgentService()
