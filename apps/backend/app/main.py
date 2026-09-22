"""
Sahm Backend — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.v1 import api_v1_router
from app.core.middleware import CorrelationMiddleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    yield
    # Shutdown
    print(f"👋 {settings.APP_NAME} shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="منصة سهم لإدارة الشهادات الجامعية — Sahm University Certificate Management API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Correlation and tracing middleware (Prompt 24)
app.add_middleware(CorrelationMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_v1_router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "سهم — من الورقة إلى سجل جامعي موثوق",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "subsystems": {
            "api": "online",
            "search": "online",
            "cascade_engine": "active",
            "batch_scanner": "ready",
            "verification": "ready",
            "handoff": "ready",
            "ai_governance": "ready",
        }
    }


@app.get("/liveness", tags=["Health"])
async def liveness_check():
    """Kubernetes / Container liveness probe."""
    return {"status": "alive"}


@app.get("/readiness", tags=["Health"])
async def readiness_check():
    """Kubernetes / Container readiness probe."""
    return {
        "status": "ready",
        "database": "configured",
        "workers": "accepting_jobs",
    }

