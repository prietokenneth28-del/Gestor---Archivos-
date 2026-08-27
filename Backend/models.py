from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base
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

