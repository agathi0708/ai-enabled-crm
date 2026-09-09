import uuid
from sqlalchemy import Column, String, Numeric, Enum, Date, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Deal(Base):
    __tablename__ = "deals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contact_id = Column(String(36), nullable=False, index=True)
    owner_id = Column(String(36), nullable=False, index=True)
    title = Column(String(160), nullable=False)
    value = Column(Numeric(12, 2), default=0.0)
    stage = Column(
        Enum("new", "qualified", "proposal", "negotiation", "won", "lost", name="deal_stages"),
        default="new",
        index=True
    )
    close_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class DealAuditLog(Base):
    __tablename__ = "deal_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    deal_id = Column(String(36), nullable=False, index=True)
    changed_by = Column(String(36), nullable=False)
    old_stage = Column(String(50), nullable=True)
    new_stage = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())