import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import phases, ai_logs, resources

# Inicializar tablas y datos semilla al arrancar
init_db()

app = FastAPI(
    title="API Trazabilidad Proyecto de Grado",
    version="1.0.0",
    description="API RESTful para la gestión y trazabilidad del proyecto de grado."
)

# Configuración dinámica de CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers
app.include_router(phases.router)
app.include_router(ai_logs.router)
app.include_router(resources.router)

@app.get("/")
def read_root():
    return {"message": "API de Trazabilidad Activa", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)