import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google import genai
from database import get_db
from models import AILog
from schemas import AILogResponse

router = APIRouter(
    prefix="/api/gemini",
    tags=["Asistente Gemini IA"]
)

class GeminiGenerateRequest(BaseModel):
    prompt: str
    usage: Optional[str] = "Consulta realizada mediante el Asistente Gemini Integrado"

@router.post("/generate", response_model=AILogResponse)
def generate_gemini_response(req: GeminiGenerateRequest, db: Session = Depends(get_db)):
    """
    Realiza una consulta en tiempo real a la API de Google Gemini y guarda 
    automáticamente la interacción en la Bitácora de IA.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=400, 
            detail="Falta la clave GEMINI_API_KEY en el servidor Backend. Por favor configúrala en las variables de entorno."
        )

    try:
        # Inicializar el cliente oficial de Google GenAI
        client = genai.Client(api_key=api_key)
        
        # Lista de modelos de producción en orden de preferencia (Gemini 3.5 en prioridad)
        models_to_try = ['gemini-3.5-flash', 'gemini-3.5', 'gemini-2.0-flash', 'gemini-1.5-flash']
        response = None
        last_error = None

        for model_name in models_to_try:
            try:
                res = client.models.generate_content(
                    model=model_name,
                    contents=req.prompt
                )
                if res and res.text:
                    response = res
                    break
            except Exception as err:
                last_error = err
                continue

        if not response or not response.text:
            raise last_error or Exception("No se pudo obtener respuesta con los modelos Gemini disponibles.")

        ai_text = response.text

        # Guardar automáticamente en la Bitácora de IA (tabla ai_logs)
        db_log = AILog(
            tool="Gemini",
            prompt=req.prompt,
            ai_response=ai_text,
            usage_description=req.usage or "Consulta realizada mediante el Asistente Gemini Integrado"
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

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error al comunicar con la API de Gemini: {str(e)}"
        )
