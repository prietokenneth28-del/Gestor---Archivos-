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

# Configuración de CORS para permitir peticiones desde React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)