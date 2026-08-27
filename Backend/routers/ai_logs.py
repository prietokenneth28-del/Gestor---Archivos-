from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import AILog
from schemas import AILogCreate, AILogResponse

router = APIRouter(
    prefix="/api/ai-logs",
    tags=["Bitácora de IA"]
)

@router.get("", response_model=List[AILogResponse])
def get_ai_logs(db: Session = Depends(get_db)):
    """Obtiene el historial de interacciones con IA."""
    logs = db.query(AILog).order_by(AILog.id.desc()).all()
    return [{
        "id": log.id,
        "tool": log.tool,
        "prompt": log.prompt,
        "aiResponse": log.ai_response,
        "usage": log.usage_description,
        "date": log.log_date
    } for log in logs]

@router.post("", response_model=AILogResponse)
def create_ai_log(log: AILogCreate, db: Session = Depends(get_db)):
    """Guarda un nuevo registro de interacción con Inteligencia Artificial."""
    db_log = AILog(
        tool=log.tool,
        prompt=log.prompt,
        ai_response=log.aiResponse,
        usage_description=log.usage
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return {
        "id": db_log.id,
        "tool": db_log.tool,
        "prompt": db_log.prompt,
        "aiResponse": db_log.ai_response,
        "usage": db_log.usage_description,
        "date": db_log.log_date
    }

@router.put("/{log_id}", response_model=AILogResponse)
def update_ai_log(log_id: int, log: AILogCreate, db: Session = Depends(get_db)):
    """Actualiza un registro de interacción con IA existente."""
    db_log = db.query(AILog).filter(AILog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Registro de IA no encontrado")
    
    db_log.tool = log.tool
    db_log.prompt = log.prompt
    db_log.ai_response = log.aiResponse
    db_log.usage_description = log.usage
    
    db.commit()
    db.refresh(db_log)
    return {
        "id": db_log.id,
        "tool": db_log.tool,
        "prompt": db_log.prompt,
        "aiResponse": db_log.ai_response,
        "usage": db_log.usage_description,
        "date": db_log.log_date
    }

@router.delete("/{log_id}")
def delete_ai_log(log_id: int, db: Session = Depends(get_db)):
    """Elimina un registro de interacción con IA de la base de datos."""
    db_log = db.query(AILog).filter(AILog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Registro de IA no encontrado")
    
    db.delete(db_log)
    db.commit()
    return {"message": "Registro eliminado exitosamente", "id": log_id}
