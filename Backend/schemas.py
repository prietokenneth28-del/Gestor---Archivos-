from pydantic import BaseModel, Field
from typing import Optional, List

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
    databaseName: str
    queryText: str
    description: Optional[str] = None
    resultsCount: Optional[int] = 0

class AdvancedQueryCreate(AdvancedQueryBase):
    pass

class AdvancedQueryUpdate(BaseModel):
    title: Optional[str] = None
    databaseName: Optional[str] = None
    queryText: Optional[str] = None
    description: Optional[str] = None
    resultsCount: Optional[int] = None

class AdvancedQueryResponse(BaseModel):
    id: int
    title: str
    databaseName: str
    queryText: str
    description: Optional[str] = None
    resultsCount: Optional[int] = 0
    date: str

    class Config:
        populate_by_name = True
        from_attributes = True


# -- Esquemas para Citaciones (Documentos a citar) --
class CitationBase(BaseModel):
    entryType: Optional[str] = Field(default="article", alias="entry_type")
    citeKey: Optional[str] = Field(default=None, alias="cite_key")
    authors: Optional[str] = None
    title: str
    year: Optional[str] = None
    publication: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    publisher: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    sourceDb: Optional[str] = Field(default="Otro", alias="source_db")
    queryId: Optional[int] = Field(default=None, alias="query_id")
    section: Optional[str] = "Marco Teórico"
    notes: Optional[str] = None
    quotes: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class CitationCreate(CitationBase):
    pass

class CitationUpdate(BaseModel):
    entryType: Optional[str] = Field(default=None, alias="entry_type")
    citeKey: Optional[str] = Field(default=None, alias="cite_key")
    authors: Optional[str] = None
    title: Optional[str] = None
    year: Optional[str] = None
    publication: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    publisher: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    sourceDb: Optional[str] = Field(default=None, alias="source_db")
    queryId: Optional[int] = Field(default=None, alias="query_id")
    section: Optional[str] = None
    notes: Optional[str] = None
    quotes: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class CitationResponse(BaseModel):
    id: int
    entryType: Optional[str] = Field(default="article", alias="entry_type")
    citeKey: Optional[str] = Field(default=None, alias="cite_key")
    authors: Optional[str] = None
    title: str
    year: Optional[str] = None
    publication: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    publisher: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    sourceDb: Optional[str] = Field(default="Otro", alias="source_db")
    queryId: Optional[int] = Field(default=None, alias="query_id")
    queryTitle: Optional[str] = None
    section: Optional[str] = "Marco Teórico"
    notes: Optional[str] = None
    quotes: Optional[str] = None
    ieeeNumber: Optional[int] = Field(default=None, alias="ieee_number")
    ieeeReference: Optional[str] = None
    date: Optional[str] = Field(default=None, alias="created_date")

    class Config:
        populate_by_name = True
        from_attributes = True

class CitationImportTextRequest(BaseModel):
    rawText: str
    format: Optional[str] = "auto"
    defaultSourceDb: Optional[str] = "Otro"
    defaultQueryId: Optional[int] = None
    defaultSection: Optional[str] = "Marco Teórico"

class CitationPreviewItem(CitationBase):
    isDuplicate: bool = False
    duplicateReason: Optional[str] = None
    existingId: Optional[int] = None
    ieeeReference: Optional[str] = None

class CitationBatchSaveRequest(BaseModel):
    items: List[CitationCreate]
