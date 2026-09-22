"""
Sahm Backend — Cascade Impact & Correction Governance API
Prompt 24: Sections 93-97
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.services.cascade_impact import (
    CascadeImpactEngine,
    ImpactAssessment,
    CorrectionRequest,
    CorrectionResult,
)

router = APIRouter(prefix="/cascade", tags=["Cascade & Governance"])


@router.get("/impact-check", response_model=ImpactAssessment)
async def check_impact(
    entity_type: str = Query("student", description="Entity type: student, batch, certificate"),
    entity_id: str = Query(..., description="UUID of the entity"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Simulates and returns downstream impacts (exports, QR verification, handoffs)
    that would be affected if this entity is altered.
    """
    return await CascadeImpactEngine.assess_impact(
        db=db,
        entity_type=entity_type,
        entity_id=entity_id,
    )


@router.post("/correct", response_model=CorrectionResult)
async def apply_correction(
    request: CorrectionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Applies an official correction with explicit administrative reasoning,
    attaching provenance evidence and marking affected downstream artifacts as stale.
    Strict Rule: Only Manager and Admin roles may perform official corrections.
    """
    if current_user.role not in (UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك الصلاحية لاعتماد تصحيحات على السجلات الرسمية.",
        )

    return await CascadeImpactEngine.apply_correction_with_governance(
        db=db,
        actor_id=str(current_user.id),
        correction=request,
    )
