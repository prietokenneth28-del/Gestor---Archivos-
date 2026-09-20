from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, date

Base = declarative_base()

class Phase(Base):
    __tablename__ = "fases"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="pendiente")
    target_date = Column(String(50), nullable=True) # Guardamos como string YYYY-MM-DD o "-"
    created_at = Column(DateTime, default=datetime.utcnow)

class AILog(Base):
    __tablename__ = "ai_logs"
    id = Column(Integer, primary_key=True, index=True)
    tool = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    usage_description = Column(Text, nullable=False)
    log_date = Column(String(50), default=lambda: date.today().isoformat())
    created_at = Column(DateTime, default=datetime.utcnow)

class Resource(Base):
    __tablename__ = "recursos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    url = Column(Text, nullable=False)
    resource_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    added_date = Column(String(50), default=lambda: date.today().isoformat())
    created_at = Column(DateTime, default=datetime.utcnow)

class AdvancedQuery(Base):
    __tablename__ = "ecuaciones_busqueda"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    database_name = Column(String(100), nullable=False)
    query_text = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    results_count = Column(Integer, default=0)
    created_date = Column(String(50), default=lambda: date.today().isoformat())
    created_at = Column(DateTime, default=datetime.utcnow)

class Citation(Base):
    __tablename__ = "citaciones"
    id = Column(Integer, primary_key=True, index=True)
    entry_type = Column(String(50), default="article")
    cite_key = Column(String(100), nullable=True)
    authors = Column(Text, nullable=True)
    title = Column(Text, nullable=False)
    year = Column(String(50), nullable=True)
    publication = Column(Text, nullable=True)
    volume = Column(String(50), nullable=True)
    issue = Column(String(50), nullable=True)
    pages = Column(String(50), nullable=True)
    publisher = Column(String(255), nullable=True)
    doi = Column(String(255), nullable=True, index=True)
    url = Column(Text, nullable=True)
    
    source_db = Column(String(100), default="Otro")
    query_id = Column(Integer, ForeignKey("ecuaciones_busqueda.id", ondelete="SET NULL"), nullable=True)
    query = relationship("AdvancedQuery", backref="citaciones")
    
    section = Column(String(255), default="Marco Teórico")
    notes = Column(Text, nullable=True)
    quotes = Column(Text, nullable=True)
    
    ieee_number = Column(Integer, nullable=True)
    created_date = Column(String(50), default=lambda: date.today().isoformat())
    created_at = Column(DateTime, default=datetime.utcnow)

