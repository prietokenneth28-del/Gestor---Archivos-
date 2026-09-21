import os
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/api",
    tags=["Autenticación"]
)

AUTH_USERNAME = os.getenv("AUTH_USERNAME", "admin")
AUTH_PASSWORD = os.getenv("AUTH_PASSWORD", "trazabilidad2026")

# Token derivado deterministicamente de AUTH_SECRET_KEY (o de las credenciales
# como fallback) para que sea el mismo en todos los workers/procesos y
# sobreviva a reinicios del servidor, en vez de generarse al azar por proceso.
_secret_seed = os.getenv("AUTH_SECRET_KEY") or f"{AUTH_USERNAME}:{AUTH_PASSWORD}"
SECRET_TOKEN = f"token_{hashlib.sha256(_secret_seed.encode()).hexdigest()}"

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """Endpoint para autenticar al usuario único compartido."""
    if credentials.username.strip() == AUTH_USERNAME and credentials.password.strip() == AUTH_PASSWORD:
        return {
            "access_token": SECRET_TOKEN,
            "token_type": "bearer",
            "username": AUTH_USERNAME
        }
    raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

def verify_token(authorization: str = Header(None)):
    """Dependencia opcional para validar la presencia del token Bearer."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado. Inicie sesión para continuar.")
    token = authorization.split(" ")[1]
    if token != SECRET_TOKEN:
        raise HTTPException(status_code=401, detail="Token inválido o expirado. Vuelva a iniciar sesión.")
    return token

