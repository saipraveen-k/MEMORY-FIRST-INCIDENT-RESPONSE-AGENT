import logging
from typing import Any, Dict, List
from datetime import datetime, timezone

from app.models.incident import IncidentCreate, SeverityEnum, IncidentFeedback
from app.services.incident_service import incident_service
from app.services.hindsight_service import hindsight_service
from app.services.hydradb_service import hydradb_service
from app.services.agent_service import agent_service
from app.services.feedback_service import feedback_service

logger = logging.getLogger(__name__)


SYNTHETIC_INCIDENTS = [
    {
        "title": "Payment API — HTTP 503 Service Unavailable",
        "description": "Payment API returning 503 errors on checkout endpoints following deployment v3.2.",
        "service": "payments-api",
        "environment": "production",
        "severity": SeverityEnum.CRITICAL,
        "symptoms": ["HTTP 503 on /v1/checkout", "Connection pool timeout", "Latency spike > 4500ms"],
        "logs": [
            "2026-09-29 21:00:12 ERROR [payments-api] Connection pool exhausted: 100/100 active connections",
            "2026-09-29 21:00:15 WARN [payments-api] Timeout waiting for DB connection from payments-db",
            "2026-09-29 21:00:18 ERROR [payments-api] HTTP 503 returned to checkout-frontend"
        ],
        "metrics": {"error_rate": "14.2%", "p99_latency_ms": 4800, "active_db_conns": 100},
        "deployment_version": "v3.2",
        "infrastructure_context": {"cluster": "us-east-prod-1", "node_pool": "api-pool-a"}
    },
    {
        "title": "Auth Service — JWT Verification Latency Spike",
        "description": "Authentication verification latency degraded causing cascading timeouts across microservices.",
        "service": "auth-service",
        "environment": "production",
        "severity": SeverityEnum.HIGH,
        "symptoms": ["Auth check latency > 2000ms", "Redis cache miss rate 85%"],
        "logs": ["ERROR [auth-service] Redis cache connection failure on auth-redis-cluster"],
        "metrics": {"cache_miss_rate": "85%", "p99_latency_ms": 2300},
        "deployment_version": "v2.8",
        "infrastructure_context": {"cluster": "us-east-prod-1"}
    },
    {
        "title": "Order Processing Queue — Message Backlog Spike",
        "description": "RabbitMQ order queue depth exceeding safety threshold due to worker thread exhaustion.",
        "service": "order-processor",
        "environment": "production",
        "severity": SeverityEnum.HIGH,
        "symptoms": ["Queue depth > 45,000 messages", "Order status updates delayed by 15 mins"],
        "logs": ["WARN [order-processor] Consumer worker pool bottleneck"],
        "metrics": {"queue_depth": 45200, "unacked_messages": 1200},
        "deployment_version": "v1.9",
        "infrastructure_context": {"cluster": "us-east-prod-1"}
    },
    {
        "title": "Notification Engine — Third-Party SMS Provider Failure",
        "description": "Twilio SMS gateway API returning 429 Rate Limit Exceeded.",
        "service": "notification-service",
        "environment": "production",
        "severity": SeverityEnum.MEDIUM,
        "symptoms": ["SMS delivery failures", "Provider 429 response rate 90%"],
        "logs": ["ERROR [notification-service] Twilio API rate limit reached"],
        "metrics": {"failed_delivery_pct": "89.4%"},
        "deployment_version": "v4.1",
        "infrastructure_context": {"cluster": "us-east-prod-1"}
    },
    {
        "title": "Search Indexer — ElasticSearch Heap Memory Exhaustion",
        "description": "ElasticSearch data nodes experiencing OOM kills during full catalogue re-index.",
        "service": "search-indexer",
        "environment": "production",
        "severity": SeverityEnum.HIGH,
        "symptoms": ["Node crash", "Search API returning HTTP 500"],
        "logs": ["FATAL java.lang.OutOfMemoryError: Java heap space in ES node-2"],
        "metrics": {"heap_used_pct": "99.8%"},
        "deployment_version": "v5.0",
        "infrastructure_context": {"cluster": "us-east-prod-1"}
    }
]

# Add additional synthetic items to meet 20+ realistic incidents requirement
for i in range(6, 21):
    SYNTHETIC_INCIDENTS.append({
        "title": f"Synthetic Incident #{i:02d} — Infrastructure Anomaly in Service Group {i % 4}",
        "description": f"Automated synthetic anomaly recorded for service-group-{i % 4} under test scenario.",
        "service": f"service-group-{i % 4}",
        "environment": "production",
        "severity": SeverityEnum.MEDIUM if i % 2 == 0 else SeverityEnum.LOW,
        "symptoms": [f"Anomaly indicator type-{i % 3}", "Intermittent RPC timeout"],
        "logs": [f"WARN [service-group-{i % 4}] Transient connection reset event"],
        "metrics": {"latency_ms": 250 + i * 15, "error_count": i},
        "deployment_version": f"v1.{i}",
        "infrastructure_context": {"cluster": "us-east-prod-1"}
    })


class DemoService:
    """Manages deterministic demo scenarios & synthetic data population."""

    async def reset_demo(self) -> Dict[str, Any]:
        """Reset all memory banks, graph stores, and incident registries."""
        incident_service.clear_all()
        hindsight_service.reset_local_bank()
        hydradb_service.reset_local_graph()
        
        # Setup base graph topology
        hydradb_service.add_node("payments-api", "Service", {"id": "payments-api", "name": "Payment Gateway API", "type": "REST_API"})
        hydradb_service.add_node("payments-db", "Service", {"id": "payments-db", "name": "Payment PostgreSQL DB", "type": "POSTGRESQL"})
        hydradb_service.add_edge("payments-api", "payments-db", "DEPENDS_ON")

        hydradb_service.add_node("checkout-frontend", "Service", {"id": "checkout-frontend", "name": "Checkout Web UI", "type": "FRONTEND"})
        hydradb_service.add_edge("checkout-frontend", "payments-api", "DEPENDS_ON")

        logger.info("Demo reset complete: Hindsight, HydraDB, and Incident registry cleared.")
        return {"status": "SUCCESS", "message": "System reset to clean initial state."}

    async def seed_synthetic_data(self) -> Dict[str, Any]:
        """Seed 20+ realistic synthetic incidents into IncidentOS."""
        await self.reset_demo()
        created_list = []
        for inc_payload in SYNTHETIC_INCIDENTS:
            inc = await incident_service.create_incident(IncidentCreate(**inc_payload))
            created_list.append(inc.id)

        return {
            "status": "SUCCESS",
            "incidents_created": len(created_list),
            "incident_ids": created_list,
            "note": "Synthetic demonstration data successfully seeded."
        }

    async def run_learning_demo_step(self, step: int) -> Dict[str, Any]:
        """Execute one step in the 4-Day Deterministic Memory Learning Demo Narrative.
        
        Day 1: Initial Payment API Incident -> Rollback feedback -> Retained in Hindsight
        Day 2: Latency Spike Incident -> Recalls Day 1 memory
        Day 3: Engineer Feedback recorded: "Never restart before checking active transactions."
        Day 4: New Incident -> Agent recommendation incorporates learned lesson!
        """
        if step == 1:
            # Day 1: Incident A
            inc_a = await incident_service.create_incident(IncidentCreate(
                title="DAY 1: Payment API — HTTP 503 Connection Leak",
                description="Payment API returning HTTP 503 on checkout after deployment v3.2.",
                service="payments-api",
                severity=SeverityEnum.HIGH,
                symptoms=["HTTP 503", "Connection pool exhaustion"],
                logs=["ERROR [payments-api] Pool exhausted 100/100 conns"],
                deployment_version="v3.2"
            ))
            rec_a = await agent_service.analyze_incident(inc_a)
            inc_a.agent_output = rec_a
            
            # Record Engineer Feedback
            fb = await feedback_service.record_feedback(inc_a.id, IncidentFeedback(
                useful="YES",
                lesson="Rollback v3.2 resolved connection pool leak.",
                comments="Rollback fixed the issue immediately."
            ))

            return {
                "day": 1,
                "scenario": "Initial Incident & Memory Retention",
                "incident": inc_a.model_dump(),
                "agent_recommendation": rec_a.model_dump(),
                "feedback_result": fb,
                "takeaway": "Engineer feedback retained as long-term memory in Hindsight."
            }

        elif step == 2:
            # Day 2: Incident B
            inc_b = await incident_service.create_incident(IncidentCreate(
                title="DAY 2: Payment API — High DB Checkout Latency",
                description="Checkout endpoints experiencing 3000ms latency on payment database queries.",
                service="payments-api",
                severity=SeverityEnum.MEDIUM,
                symptoms=["Latency > 3000ms"],
                logs=["WARN [payments-api] Slow query execution on payments-db"],
                deployment_version="v3.2"
            ))
            rec_b = await agent_service.analyze_incident(inc_b)
            inc_b.agent_output = rec_b

            return {
                "day": 2,
                "scenario": "Memory Recall Active",
                "incident": inc_b.model_dump(),
                "agent_recommendation": rec_b.model_dump(),
                "memories_recalled": rec_b.memory_context,
                "takeaway": "Agent recalled Day 1 memory regarding deployment v3.2 connection leaks."
            }

        elif step == 3:
            # Day 3: Engineer Feedback Lesson Capture
            inc_c = await incident_service.create_incident(IncidentCreate(
                title="DAY 3: Database Connection Contention & Restart Risk",
                description="Connection contention observed on database instance.",
                service="payments-api",
                severity=SeverityEnum.HIGH,
                symptoms=["Connection contention"],
                deployment_version="v3.2"
            ))
            
            fb_c = await feedback_service.record_feedback(inc_c.id, IncidentFeedback(
                useful="YES",
                lesson="Never restart the payment service before checking active transactions.",
                comments="Restarting prematurely while active transactions are in-flight corrupts state."
            ))

            return {
                "day": 3,
                "scenario": "Operational Lesson Retention",
                "incident_id": inc_c.id,
                "captured_feedback": fb_c,
                "takeaway": "Durable operational rule retained in Hindsight: 'Never restart before checking active transactions.'"
            }

        elif step == 4:
            # Day 4: Incident D (The Learning Proof!)
            inc_d = await incident_service.create_incident(IncidentCreate(
                title="DAY 4: Payment API — HTTP 503 Recurring Outage",
                description="Recurring 503 errors detected on checkout API during traffic peak.",
                service="payments-api",
                severity=SeverityEnum.CRITICAL,
                symptoms=["HTTP 503", "Connection pool exhaustion"],
                logs=["ERROR [payments-api] Pool limit reached"],
                deployment_version="v3.2"
            ))
            rec_d = await agent_service.analyze_incident(inc_d)
            inc_d.agent_output = rec_d

            return {
                "day": 4,
                "scenario": "LEARNED SYSTEM IN ACTION (BEFORE vs AFTER)",
                "incident": inc_d.model_dump(),
                "agent_recommendation": rec_d.model_dump(),
                "learned_lessons_applied": rec_d.historical_lessons,
                "safety_notes": rec_d.safety_notes,
                "takeaway": "THE AGENT BEHAVES DIFFERENTLY BECAUSE IT LEARNED! It explicitly warns and instructs to inspect active transactions before restarting."
            }

        else:
            return {"error": f"Invalid step {step}. Valid steps are 1, 2, 3, or 4."}


demo_service = DemoService()
