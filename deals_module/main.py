from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, crud
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Deals Module API")

# This must happen exactly once, right after creating 'app'
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.post("/api/v1/deals")
def create_deal(deal: schemas.DealCreate, db: Session = Depends(get_db)):
    """Create a new deal."""
    new_deal = crud.create_deal(db=db, deal=deal)
    return {"data": new_deal, "meta": {}, "error": None}

@app.get("/api/v1/deals")
def read_deals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all deals."""
    deals = crud.get_deals(db, skip=skip, limit=limit)
    return {"data": deals, "meta": {"page": skip, "limit": limit}, "error": None}

@app.patch("/api/v1/deals/{deal_id}/stage")
def update_deal_stage(deal_id: str, stage_update: schemas.DealStageUpdate, db: Session = Depends(get_db)):
    """Update a deal's stage with business rule validation."""
    db_deal = crud.update_deal_stage(db, deal_id=deal_id, stage_update=stage_update)
    if db_deal is None:
        return {"data": None, "meta": {}, "error": {"code": "NOT_FOUND", "message": "Deal not found"}}
    return {"data": db_deal, "meta": {}, "error": None}

@app.get("/api/v1/deals/{deal_id}/history")
def get_deal_history(deal_id: str, db: Session = Depends(get_db)):
    """Retrieve audit history / stage changes for a deal."""
    history = crud.get_deal_history(db, deal_id=deal_id)
    if not history:
        return {"data": None, "meta": {}, "error": {"code": "NOT_FOUND", "message": "No history found for this deal"}}
    return {"data": history, "meta": {}, "error": None}