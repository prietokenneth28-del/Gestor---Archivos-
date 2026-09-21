from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import AdvancedQuery
from schemas import AdvancedQueryCreate, AdvancedQueryUpdate, AdvancedQueryResponse
from routers.auth import verify_token

router = APIRouter(
    prefix="/api/queries",
    tags=["Ecuaciones de Búsqueda"],
    dependencies=[Depends(verify_token)]
)

@router.get("", response_model=List[AdvancedQueryResponse])
def get_queries(db: Session = Depends(get_db)):
    """Obtiene la lista de ecuaciones de búsqueda registradas."""
    queries = db.query(AdvancedQuery).order_by(AdvancedQuery.created_at.desc()).all()
    return [
        {
            "id": q.id,
            "title": q.title,
            "databaseName": q.database_name,
            "queryText": q.query_text,
            "description": q.description,
            "resultsCount": q.results_count,
            "date": q.created_date
        }
        for q in queries
    ]

@router.post("", response_model=AdvancedQueryResponse)
def create_query(req: AdvancedQueryCreate, db: Session = Depends(get_db)):
    """Crea una nueva ecuación de búsqueda."""
    new_q = AdvancedQuery(
        title=req.title,
        database_name=req.databaseName,
        query_text=req.queryText,
        description=req.description,
        results_count=req.resultsCount or 0
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return {
        "id": new_q.id,
        "title": new_q.title,
        "databaseName": new_q.database_name,
        "queryText": new_q.query_text,
        "description": new_q.description,
        "resultsCount": new_q.results_count,
        "date": new_q.created_date
    }

@router.put("/{query_id}", response_model=AdvancedQueryResponse)
def update_query(query_id: int, req: AdvancedQueryUpdate, db: Session = Depends(get_db)):
    """Actualiza una ecuación de búsqueda existente."""
    q = db.query(AdvancedQuery).filter(AdvancedQuery.id == query_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Ecuación de búsqueda no encontrada")
    
    if req.title is not None:
        q.title = req.title
    if req.databaseName is not None:
        q.database_name = req.databaseName
    if req.queryText is not None:
        q.query_text = req.queryText
    if req.description is not None:
        q.description = req.description
    if req.resultsCount is not None:
        q.results_count = req.resultsCount

    db.commit()
    db.refresh(q)
    return {
        "id": q.id,
        "title": q.title,
        "databaseName": q.database_name,
        "queryText": q.query_text,
        "description": q.description,
        "resultsCount": q.results_count,
        "date": q.created_date
    }

@router.delete("/{query_id}")
def delete_query(query_id: int, db: Session = Depends(get_db)):
    """Elimina una ecuación de búsqueda por ID."""
    q = db.query(AdvancedQuery).filter(AdvancedQuery.id == query_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Ecuación de búsqueda no encontrada")
    db.delete(q)
    db.commit()
    return {"message": "Ecuación de búsqueda eliminada correctamente", "id": query_id}

