from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Phase
from schemas import PhaseCreate, PhaseResponse

router = APIRouter(
    prefix="/api/phases",
    tags=["Fases del Proyecto"]
)

@router.get("", response_model=List[PhaseResponse])
def get_phases(db: Session = Depends(get_db)):
    """Obtiene todas las fases del proyecto."""
    phases = db.query(Phase).all()
    return [{"id": p.id, "title": p.title, "status": p.status, "date": p.target_date or "-"} for p in phases]

@router.post("", response_model=PhaseResponse)
def create_phase(phase: PhaseCreate, db: Session = Depends(get_db)):
    """Crea una nueva fase en la base de datos."""
    db_phase = Phase(
        title=phase.title,
        status=phase.status,
        target_date=phase.date or "-"
    )
    db.add(db_phase)
    db.commit()
    db.refresh(db_phase)
    return {"id": db_phase.id, "title": db_phase.title, "status": db_phase.status, "date": db_phase.target_date}

@router.put("/{phase_id}", response_model=PhaseResponse)
def update_phase(phase_id: int, phase: PhaseCreate, db: Session = Depends(get_db)):
    """Actualiza una fase existente."""
    db_phase = db.query(Phase).filter(Phase.id == phase_id).first()
    if not db_phase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    
    db_phase.title = phase.title
    db_phase.status = phase.status
    db_phase.target_date = phase.date or "-"
    
    db.commit()
    db.refresh(db_phase)
    return {"id": db_phase.id, "title": db_phase.title, "status": db_phase.status, "date": db_phase.target_date}

