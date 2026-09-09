from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class DealCreate(BaseModel):
    contact_id: str
    owner_id: Optional[str] = "mock-user-uuid"
    title: str = Field(..., min_length=1, max_length=160)
    value: Optional[float] = Field(default=0.0, ge=0)
    stage: Optional[str] = "new"
    close_date: Optional[date] = None

class DealStageUpdate(BaseModel):
    stage: str
    changed_by: Optional[str] = "mock-user-uuid"

class DealResponse(BaseModel):
    id: str
    contact_id: str
    owner_id: str
    title: str
    value: float
    stage: str
    close_date: Optional[date]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class DealAuditResponse(BaseModel):
    id: str
    deal_id: str
    changed_by: str
    old_stage: Optional[str]
    new_stage: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True