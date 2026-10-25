from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.v1.router import api_v1_router
from app.services.department_service import DepartmentService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("campusresolve")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle handler.
    Auto-initializes tables and seeds basic campus departments on startup.
    """
    logger.info("Initializing CampusResolve database tables...")
    Base.metadata.create_all(bind=engine)

    # Seed default departments if table is newly created
    db = SessionLocal()
    try:
        DepartmentService.seed_default_departments(db)
        logger.info("Default campus departments verified/seeded successfully.")
    except Exception as e:
        logger.warning(f"Department auto-seeding encountered notice: {str(e)}")
    finally:
        db.close()

    yield

    logger.info("CampusResolve shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Smart Campus Complaint & Grievance Management System with Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]
origins = [origin.strip().rstrip("/") for origin in origins if origin and origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_v1_router)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for Render pinging and uptime monitors."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to CampusResolve API. Visit /docs for interactive Swagger documentation.",
        "health": "/health",
        "api_v1": "/api/v1"
    }
