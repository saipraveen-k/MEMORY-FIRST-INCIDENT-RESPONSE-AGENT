import os
from typing import Optional
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "IncidentOS — Memory-First Incident Response Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Hindsight Agent Memory
    HINDSIGHT_BASE_URL: str = os.getenv("HINDSIGHT_BASE_URL", "http://localhost:8888")
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "dev-key")
    HINDSIGHT_BANK_ID: str = os.getenv("HINDSIGHT_BANK_ID", "incidentos_bank")
    
    # RocketRide Agent Orchestration
    ROCKETRIDE_BASE_URL: str = os.getenv("ROCKETRIDE_BASE_URL", "http://localhost:5565")
    ROCKETRIDE_API_KEY: str = os.getenv("ROCKETRIDE_API_KEY", "dev-key")
    
    # HydraDB Graph Knowledge Base
    HYDRADB_URL: str = os.getenv("HYDRADB_URL", "http://localhost:9090")
    HYDRADB_GRAPH_ID: str = os.getenv("HYDRADB_GRAPH_ID", "default")
    HYDRADB_CELL_ID: str = os.getenv("HYDRADB_CELL_ID", "cell-0")
    HYDRADB_AUTH_TOKEN: str = os.getenv("HYDRADB_AUTH_TOKEN", "local-development-token-32-bytes")
    HYDRADB_NAMESPACE: str = os.getenv("HYDRADB_NAMESPACE", "default")
    
    # LLM Settings
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY", None)
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]


settings = Settings()
