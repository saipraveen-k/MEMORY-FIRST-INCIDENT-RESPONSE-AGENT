from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.models.incident import (
    Incident,
    IncidentCreate,
    IncidentFeedback,
    IncidentStatusEnum,
    SeverityEnum,
    AgentRecommendationOutput
)
from app.services.incident_service import incident_service
from app.services.agent_service import agent_service
from app.services.feedback_service import feedback_service
from app.services.hindsight_service import hindsight_service
from app.services.hydradb_service import hydradb_service
from app.services.rocketride_service import rocketride_service
from app.services.demo_service import demo_service

router = APIRouter()


# ---------------------------------------------------------
# HEALTH ENDPOINT
# ---------------------------------------------------------
@router.get("/health", summary="Health check endpoint for all system dependencies")
async def get_health() -> Dict[str, Any]:
    """Inspect application, Hindsight, RocketRide, and HydraDB health status."""
    hindsight_health = await hindsight_service.check_health()
    rocketride_health = await rocketride_service.check_health()
    hydradb_health = await hydradb_service.check_health()

    all_healthy = all(
        dep.get("status") in ("healthy", "fallback_local", "local_orchestrator")
        for dep in [hindsight_health, rocketride_health, hydradb_health]
    )

    return {
        "status": "healthy" if all_healthy else "degraded",
        "system": "IncidentOS",
        "dependencies": {
            "hindsight": hindsight_health,
            "rocketride": rocketride_health,
            "hydradb": hydradb_health
        }
    }


# ---------------------------------------------------------
# INCIDENTS API
# ---------------------------------------------------------
@router.post("/incidents", response_model=Incident, status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentCreate):
    """Create a new incident."""
    return await incident_service.create_incident(payload)


@router.get("/incidents", response_model=List[Incident])
async def list_incidents(
    service: Optional[str] = Query(None),
    severity: Optional[SeverityEnum] = Query(None),
    status: Optional[IncidentStatusEnum] = Query(None)
):
    """List all incidents with optional filter by service, severity, or status."""
    return await incident_service.list_incidents(service=service, severity=severity, status=status)


@router.get("/incidents/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str):
    """Get incident details by ID."""
    incident = await incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")
    return incident


@router.post("/incidents/{incident_id}/analyze", response_model=AgentRecommendationOutput)
async def analyze_incident(incident_id: str):
    """Trigger agent reasoning loop: HydraDB graph context + Hindsight memories + RocketRide execution."""
    incident = await incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")

    rec = await agent_service.analyze_incident(incident)
    incident.agent_output = rec
    incident.status = IncidentStatusEnum.REMEDIATION_PROPOSED
    return rec


@router.post("/incidents/{incident_id}/recommend", response_model=AgentRecommendationOutput)
async def recommend_incident(incident_id: str):
    """Get current agent recommendation for incident."""
    return await analyze_incident(incident_id)


@router.post("/incidents/{incident_id}/feedback")
async def record_feedback(incident_id: str, feedback: IncidentFeedback):
    """Record engineer feedback and store durable operational lesson in Hindsight memory."""
    try:
        return await feedback_service.record_feedback(incident_id, feedback)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str, resolution_notes: Optional[str] = None):
    """Mark incident as RESOLVED."""
    incident = await incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")
    
    incident.resolution = resolution_notes or "Resolved by engineer action."
    updated = await incident_service.update_status(incident_id, IncidentStatusEnum.RESOLVED)
    return {"status": "SUCCESS", "incident": updated}


@router.get("/incidents/{incident_id}/memory")
async def get_incident_memory(incident_id: str):
    """Get Hindsight memories recalled for this incident."""
    incident = await incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")
    
    query = f"{incident.service} {incident.title}"
    return await hindsight_service.recall(query=query, top_k=5)


@router.get("/incidents/{incident_id}/graph")
async def get_incident_graph(incident_id: str):
    """Get HydraDB graph context linked to this incident."""
    incident = await incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")
    
    return await hydradb_service.get_incident_graph_context(incident_id, incident.service)


# ---------------------------------------------------------
# MEMORY & GRAPH EXPLORER APIs
# ---------------------------------------------------------
@router.get("/memory")
async def list_all_memories():
    """List all stored Hindsight memories for Memory Explorer UI."""
    return await hindsight_service.list_memories()


@router.get("/graph")
async def get_full_graph():
    """Export full HydraDB graph topology for Graph Explorer UI."""
    return await hydradb_service.get_full_graph()


@router.get("/agent/traces")
async def list_agent_traces():
    """List RocketRide pipeline execution traces for Agent Trace UI."""
    return await rocketride_service.get_execution_traces()


# ---------------------------------------------------------
# DEMO MODE APIs
# ---------------------------------------------------------
@router.post("/demo/reset")
async def reset_demo():
    """Reset system state, clearing memories, graph, and incidents."""
    return await demo_service.reset_demo()


@router.post("/demo/seed")
async def seed_demo():
    """Seed 20+ realistic synthetic incidents."""
    return await demo_service.seed_synthetic_data()


@router.post("/demo/run")
async def run_demo_step(step: int = Query(1, ge=1, le=4)):
    """Run step 1, 2, 3, or 4 of the 4-Day Memory Learning Demo Narrative."""
    return await demo_service.run_learning_demo_step(step)
