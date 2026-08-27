from pydantic import BaseModel, Field
from typing import Optional

# -- Esquemas para Fases --
class PhaseBase(BaseModel):
    title: str
    status: str = "pendiente"
    date: Optional[str] = Field(default="-", alias="target_date")

    class Config:
        populate_by_name = True
        from_attributes = True

class PhaseCreate(BaseModel):
    title: str
    status: str = "pendiente"
    date: Optional[str] = Field(default="-", alias="target_date")

    class Config:
        populate_by_name = True

class PhaseResponse(BaseModel):
    id: int
    title: str
    status: str
    date: Optional[str] = Field(default="-", alias="target_date")

    class Config:
        populate_by_name = True
        from_attributes = True


# -- Esquemas para Bitácora IA --
class AILogBase(BaseModel):
    tool: str
    prompt: str
    aiResponse: str
    usage: str

class AILogCreate(AILogBase):
    pass

class AILogResponse(BaseModel):
    id: int
    tool: str
    prompt: str
    aiResponse: str
    usage: str
    date: str

    class Config:
        populate_by_name = True
        from_attributes = True


# -- Esquemas para Recursos --
class ResourceBase(BaseModel):
    title: str
    url: str
    type: str
    description: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(BaseModel):
    id: int
    title: str
    url: str
    type: str
    description: Optional[str] = None
    date: str

    class Config:
        populate_by_name = True
        from_attributes = True

