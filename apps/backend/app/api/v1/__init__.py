"""
Sahm Backend — API v1 Router
"""
from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.colleges import router as colleges_router
from app.api.v1.batches import router as batches_router
from app.api.v1.records import router as records_router
from app.api.v1.search import router as search_router
from app.api.v1.export_studio import router as export_studio_router
from app.api.v1.batch_scanner import router as batch_scanner_router
from app.api.v1.public_verify import router as public_verify_router
from app.api.v1.verifications import router as verifications_router
from app.api.v1.ai_governance import router as ai_governance_router
from app.api.v1.handoff import router as handoff_router
from app.api.v1.cascade import router as cascade_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(colleges_router)
api_v1_router.include_router(batches_router)
api_v1_router.include_router(records_router)
api_v1_router.include_router(search_router)
api_v1_router.include_router(export_studio_router)
api_v1_router.include_router(batch_scanner_router)
api_v1_router.include_router(public_verify_router)
api_v1_router.include_router(verifications_router)
api_v1_router.include_router(ai_governance_router)
api_v1_router.include_router(handoff_router)
api_v1_router.include_router(cascade_router)



