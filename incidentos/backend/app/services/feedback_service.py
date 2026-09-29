import logging
from typing import Any, Dict, Optional
from datetime import datetime, timezone

from app.models.incident import IncidentFeedback, IncidentStatusEnum
from app.services.incident_service import incident_service
from app.services.hindsight_service import hindsight_service
from app.services.hydradb_service import hydradb_service

logger = logging.getLogger(__name__)


class FeedbackService:
    """Processes engineer feedback and retains durable operational lessons in Hindsight & HydraDB."""

    async def record_feedback(self, incident_id: str, feedback: IncidentFeedback) -> Dict[str, Any]:
        """Record engineer feedback, extract operational lessons, and update memory + graph."""
        incident = await incident_service.get_incident(incident_id)
        if not incident:
            raise ValueError(f"Incident #{incident_id} not found")

        # 1. Update incident record
        incident.engineer_feedback = feedback.lesson
        incident.status = IncidentStatusEnum.LEARNING_CAPTURED
        incident.updated_at = datetime.now(timezone.utc).isoformat()

        # 2. Retain operational lesson in Hindsight long-term memory
        memory_content = f"Operational Lesson for {incident.service}: {feedback.lesson}"
        memory_result = await hindsight_service.retain(
            content=memory_content,
            metadata={
                "incident_id": incident_id,
                "service": incident.service,
                "useful_rating": feedback.useful,
                "engineer_id": feedback.engineer_id or "engineer-1",
                "deployment": incident.deployment_version,
                "category": "ENGINEER_LESSON"
            },
            memory_type="lesson"
        )

        # 3. Update HydraDB graph relationships
        lesson_id = f"lesson-{incident_id}"
        hydradb_service.add_node(
            lesson_id,
            "Lesson",
            {
                "id": lesson_id,
                "content": feedback.lesson,
                "service": incident.service,
                "rating": feedback.useful,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        )
        hydradb_service.add_edge(incident_id, lesson_id, "GENERATED_LESSON")
        if feedback.engineer_id:
            eng_id = feedback.engineer_id
            hydradb_service.add_node(eng_id, "Engineer", {"id": eng_id, "name": "Lead IR Engineer"})
            hydradb_service.add_edge(eng_id, incident_id, "HANDLED")

        logger.info(f"Feedback recorded for Incident #{incident_id}. Lesson retained in Hindsight: '{feedback.lesson}'")

        return {
            "status": "SUCCESS",
            "incident_id": incident_id,
            "feedback_recorded": feedback.model_dump(),
            "hindsight_memory_id": memory_result.get("id"),
            "hydradb_lesson_node": lesson_id,
            "updated_incident_status": incident.status.value
        }


feedback_service = FeedbackService()
