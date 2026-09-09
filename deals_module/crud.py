from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
import models, schemas

# Valid stage progression rules
ALLOWED_TRANSITIONS = {
    "new": ["qualified", "lost"],
    "qualified": ["proposal", "lost"],
    "proposal": ["negotiation", "lost"],
    "negotiation": ["won", "lost"],
    "won": [],
    "lost": ["new"]  # Re-opening a lost deal
}

def get_deals(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve a list of all deals."""
    return db.query(models.Deal).offset(skip).limit(limit).all()

def create_deal(db: Session, deal: schemas.DealCreate):
    """Create a new deal in the database."""
    db_deal = models.Deal(
        contact_id=deal.contact_id,
        owner_id=deal.owner_id,
        title=deal.title,
        value=deal.value,
        stage=deal.stage,
        close_date=deal.close_date
    )
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)

    audit_log = models.DealAuditLog(
        deal_id=db_deal.id,
        changed_by=db_deal.owner_id,
        new_stage=db_deal.stage,
        notes="Deal created."
    )
    db.add(audit_log)
    db.commit()
    
    return db_deal

def update_deal_stage(db: Session, deal_id: str, stage_update: schemas.DealStageUpdate):
    """Validate transition, update the stage, and log the change."""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    old_stage = db_deal.stage
    target_stage = stage_update.stage

    # Stage transition business rule validation
    allowed = ALLOWED_TRANSITIONS.get(old_stage, [])
    if target_stage not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{old_stage}' to '{target_stage}'. Allowed: {allowed}"
        )

    db_deal.stage = target_stage
    db_deal.updated_at = datetime.utcnow()
    db.add(db_deal)

    audit_log = models.DealAuditLog(
        deal_id=db_deal.id,
        changed_by=stage_update.changed_by or "mock-user-uuid",
        old_stage=old_stage,
        new_stage=target_stage,
        notes=f"Moved stage from {old_stage} to {target_stage}"
    )
    db.add(audit_log)
    db.commit()
    db.refresh(db_deal)
    
    return db_deal

def get_deal_history(db: Session, deal_id: str):
    """Fetch all audit history entries for a specific deal."""
    return db.query(models.DealAuditLog).filter(models.DealAuditLog.deal_id == deal_id).order_by(models.DealAuditLog.created_at.asc()).all()