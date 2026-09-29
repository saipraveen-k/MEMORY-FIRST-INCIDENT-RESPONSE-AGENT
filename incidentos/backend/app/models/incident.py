from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatusEnum(str, Enum):
    NEW = "NEW"
    TRIAGED = "TRIAGED"
    INVESTIGATING = "INVESTIGATING"
    ROOT_CAUSE_IDENTIFIED = "ROOT_CAUSE_IDENTIFIED"
    REMEDIATION_PROPOSED = "REMEDIATION_PROPOSED"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    REMEDIATION_EXECUTED = "REMEDIATION_EXECUTED"
    VERIFIED = "VERIFIED"
    RESOLVED = "RESOLVED"
    LEARNING_CAPTURED = "LEARNING_CAPTURED"


class RiskLevelEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class RecommendedAction(BaseModel):
    id: str
    action_type: str  # e.g., "INSPECT_LOGS", "ROLLBACK_DEPLOYMENT", "RESTART_SERVICE", "INCREASE_POOL"
    description: str
    risk_level: RiskLevelEnum
    requires_approval: bool
    command_preview: str
    rationale: str
    graph_evidence: List[str] = Field(default_factory=list)
    memory_evidence: List[str] = Field(default_factory=list)
    simulated_outcome: Optional[str] = None


class AgentRecommendationOutput(BaseModel):
    summary: str
    severity: SeverityEnum
    root_cause_hypotheses: List[str] = Field(default_factory=list)
    graph_context: List[Dict[str, Any]] = Field(default_factory=list)
    memory_context: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_actions: List[RecommendedAction] = Field(default_factory=list)
    historical_lessons: List[str] = Field(default_factory=list)
    safety_notes: List[str] = Field(default_factory=list)
    requires_human_approval: bool = True
    explanation_why: Dict[str, Any] = Field(default_factory=dict)
    conflicts_detected: List[Dict[str, Any]] = Field(default_factory=list)


class IncidentFeedback(BaseModel):
    useful: str  # "YES", "PARTIALLY", "NO"
    lesson: str  # Durable operational lesson provided by engineer
    engineer_id: Optional[str] = "engineer-1"
    comments: Optional[str] = None


class IncidentCreate(BaseModel):
    title: str
    description: str
    service: str
    environment: str = "production"
    severity: SeverityEnum = SeverityEnum.HIGH
    symptoms: List[str] = Field(default_factory=list)
    logs: List[str] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    deployment_version: Optional[str] = None
    infrastructure_context: Dict[str, Any] = Field(default_factory=dict)


class Incident(BaseModel):
    id: str
    title: str
    description: str
    service: str
    environment: str = "production"
    severity: SeverityEnum = SeverityEnum.HIGH
    status: IncidentStatusEnum = IncidentStatusEnum.NEW
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    symptoms: List[str] = Field(default_factory=list)
    logs: List[str] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    deployment_version: Optional[str] = None
    infrastructure_context: Dict[str, Any] = Field(default_factory=dict)
    suspected_root_causes: List[str] = Field(default_factory=list)
    confirmed_root_cause: Optional[str] = None
    actions_taken: List[str] = Field(default_factory=list)
    failed_actions: List[str] = Field(default_factory=list)
    successful_actions: List[str] = Field(default_factory=list)
    resolution: Optional[str] = None
    resolution_duration: Optional[int] = None
    engineer_feedback: Optional[str] = None
    memory_references: List[Dict[str, Any]] = Field(default_factory=list)
    graph_references: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = 0.85
    agent_output: Optional[AgentRecommendationOutput] = None
