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


# -- Esquemas para Ecuaciones de Búsqueda (Advanced Queries) --
class AdvancedQueryBase(BaseModel):
    title: str
    databaseName: str = Field(alias="database_name")
    queryText: str = Field(alias="query_text")
    description: Optional[str] = None
    resultsCount: Optional[int] = Field(default=0, alias="results_count")

    class Config:
        populate_by_name = True
        from_attributes = True

class AdvancedQueryCreate(AdvancedQueryBase):
    pass

class AdvancedQueryUpdate(BaseModel):
    title: Optional[str] = None
    databaseName: Optional[str] = Field(default=None, alias="database_name")
    queryText: Optional[str] = Field(default=None, alias="query_text")
    description: Optional[str] = None
    resultsCount: Optional[int] = Field(default=None, alias="results_count")

    class Config:
        populate_by_name = True
        from_attributes = True

class AdvancedQueryResponse(BaseModel):
    id: int
    title: str
    databaseName: str = Field(alias="database_name")
    queryText: str = Field(alias="query_text")
    description: Optional[str] = None
    resultsCount: Optional[int] = Field(default=0, alias="results_count")
    date: str = Field(alias="created_date")

    class Config:
        populate_by_name = True
        from_attributes = True
