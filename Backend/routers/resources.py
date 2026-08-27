from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Resource
from schemas import ResourceCreate, ResourceResponse

router = APIRouter(
    prefix="/api/resources",
    tags=["Recursos y Enlaces"]
)

@router.get("", response_model=List[ResourceResponse])
def get_resources(db: Session = Depends(get_db)):
    """Obtiene todos los enlaces y recursos bibliográficos."""
    resources = db.query(Resource).order_by(Resource.id.desc()).all()
    return [{
        "id": r.id,
        "title": r.title,
        "url": r.url,
        "type": r.resource_type,
        "description": r.description,
        "date": r.added_date
    } for r in resources]

@router.post("", response_model=ResourceResponse)
def create_resource(res: ResourceCreate, db: Session = Depends(get_db)):
    """Añade un nuevo recurso o enlace bibliográfico."""
    db_res = Resource(
        title=res.title,
        url=res.url,
        resource_type=res.type,
        description=res.description
    )
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return {
        "id": db_res.id,
        "title": db_res.title,
        "url": db_res.url,
        "type": db_res.resource_type,
        "description": db_res.description,
        "date": db_res.added_date
    }

@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(resource_id: int, res: ResourceCreate, db: Session = Depends(get_db)):
    """Actualiza un recurso o enlace bibliográfico existente."""
    db_res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    
    db_res.title = res.title
    db_res.url = res.url
    db_res.resource_type = res.type
    db_res.description = res.description
    
    db.commit()
    db.refresh(db_res)
    return {
        "id": db_res.id,
        "title": db_res.title,
        "url": db_res.url,
        "type": db_res.resource_type,
        "description": db_res.description,
        "date": db_res.added_date
    }

@router.delete("/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    """Elimina un recurso o enlace bibliográfico de la base de datos."""
    db_res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    
    db.delete(db_res)
    db.commit()
    return {"message": "Recurso eliminado exitosamente", "id": resource_id}
