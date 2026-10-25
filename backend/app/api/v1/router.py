from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.departments import router as departments_router
from app.api.v1.complaints import router as complaints_router
from app.api.v1.feedback import router as feedback_router
from app.api.v1.analytics import router as analytics_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(departments_router)
api_v1_router.include_router(complaints_router)
api_v1_router.include_router(feedback_router)
api_v1_router.include_router(analytics_router)
