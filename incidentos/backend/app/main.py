import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router as api_router
from app.services.demo_service import demo_service

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("incidentos")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing IncidentOS Backend...")
    # Seed initial synthetic demo data on boot
    try:
        await demo_service.seed_synthetic_data()
        logger.info("Initial synthetic demonstration data seeded.")
    except Exception as e:
        logger.warning(f"Error seeding demo data on startup: {e}")
    yield
    logger.info("Shutting down IncidentOS Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="IncidentOS — Memory-First Incident Response Agent (Hindsight + RocketRide + HydraDB)",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
