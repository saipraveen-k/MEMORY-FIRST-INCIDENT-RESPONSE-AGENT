import logging
import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from app.models.incident import Incident, IncidentCreate, IncidentStatusEnum, SeverityEnum
from app.services.hydradb_service import hydradb_service
from app.services.hindsight_service import hindsight_service

logger = logging.getLogger(__name__)


class IncidentService:
    """Manages Incident lifecycle state transitions and persistence."""

    def __init__(self):
        self._incidents: Dict[str, Incident] = {}

    async def create_incident(self, payload: IncidentCreate) -> Incident:
        """Create a new incident and update HydraDB graph topology."""
        inc_id = f"inc-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc).isoformat()
        
        incident = Incident(
            id=inc_id,
            title=payload.title,
            description=payload.description,
            service=payload.service,
            environment=payload.environment,
            severity=payload.severity,
            status=IncidentStatusEnum.NEW,
            created_at=now,
            updated_at=now,
            symptoms=payload.symptoms,
            logs=payload.logs,
            metrics=payload.metrics,
            deployment_version=payload.deployment_version,
            infrastructure_context=payload.infrastructure_context
        )
        
        self._incidents[inc_id] = incident

        # Update HydraDB Graph Knowledge
        hydradb_service.add_node(inc_id, "Incident", incident.model_dump())
        hydradb_service.add_node(payload.service, "Service", {"id": payload.service, "name": payload.service, "env": payload.environment})
        hydradb_service.add_edge(inc_id, payload.service, "AFFECTS")

        if payload.deployment_version:
            dep_id = f"deploy-{payload.deployment_version}"
            hydradb_service.add_node(dep_id, "Deployment", {"id": dep_id, "version": payload.deployment_version, "service": payload.service})
            hydradb_service.add_edge(inc_id, dep_id, "FOLLOWED_DEPLOYMENT")
            hydradb_service.add_edge(dep_id, payload.service, "CHANGED")

        logger.info(f"Created Incident #{inc_id} affecting service '{payload.service}'")
        return incident

    async def get_incident(self, incident_id: str) -> Optional[Incident]:
        """Retrieve incident by ID."""
        return self._incidents.get(incident_id)

    async def list_incidents(
        self,
        service: Optional[str] = None,
        severity: Optional[SeverityEnum] = None,
        status: Optional[IncidentStatusEnum] = None
    ) -> List[Incident]:
        """List all incidents with optional filtering."""
        incidents = list(self._incidents.values())
        if service:
            incidents = [i for i in incidents if i.service.lower() == service.lower()]
        if severity:
            incidents = [i for i in incidents if i.severity == severity]
        if status:
            incidents = [i for i in incidents if i.status == status]
        
        incidents.sort(key=lambda x: x.created_at, reverse=True)
        return incidents

    async def update_status(self, incident_id: str, new_status: IncidentStatusEnum) -> Optional[Incident]:
        """Advance incident lifecycle status."""
        incident = self._incidents.get(incident_id)
        if not incident:
            return None
        
        incident.status = new_status
        incident.updated_at = datetime.now(timezone.utc).isoformat()
        self._incidents[incident_id] = incident
        
        # Update HydraDB graph node property
        hydradb_service.add_node(incident_id, "Incident", incident.model_dump())
        return incident

    def clear_all(self):
        """Reset incidents for demo runner."""
        self._incidents.clear()


incident_service = IncidentService()
