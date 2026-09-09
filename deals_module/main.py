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

@app.post("/api/v1/deals", response_model=schemas.DealResponse)
def create_deal(deal: schemas.DealCreate, db: Session = Depends(get_db)):
    """Create a new deal."""
    return crud.create_deal(db=db, deal=deal)

@app.get("/api/v1/deals", response_model=List[schemas.DealResponse])
def read_deals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all deals."""
    return crud.get_deals(db, skip=skip, limit=limit)

@app.patch("/api/v1/deals/{deal_id}/stage", response_model=schemas.DealResponse)
def update_deal_stage(deal_id: str, stage_update: schemas.DealStageUpdate, db: Session = Depends(get_db)):
    """Update a deal's stage with business rule validation."""
    return crud.update_deal_stage(db, deal_id=deal_id, stage_update=stage_update)

@app.get("/api/v1/deals/{deal_id}/history", response_model=List[schemas.DealAuditResponse])
def get_deal_history(deal_id: str, db: Session = Depends(get_db)):
    """Retrieve audit history / stage changes for a deal."""
    history = crud.get_deal_history(db, deal_id=deal_id)
    if not history:
        raise HTTPException(status_code=404, detail="No history found for this deal")
    return history