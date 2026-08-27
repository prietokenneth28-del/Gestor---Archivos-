import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Phase, AILog, Resource

# Cargar automáticamente las variables de entorno desde el archivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME")

    if db_user and db_password and db_host and db_name:
        DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    else:
        DATABASE_URL = "sqlite:///./trazabilidad_test.db"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Poblar datos iniciales de prueba si la base de datos está vacía
    db = SessionLocal()
    try:
        if db.query(Phase).count() == 0:
            initial_phases = [
                Phase(title='Definición del Tema y Objetivos', status='completado', target_date='2026-08-10'),
                Phase(title='Revisión Bibliográfica y Estado del Arte', status='en_progreso', target_date='2026-08-20'),
                Phase(title='Diseño Metodológico', status='pendiente', target_date='-'),
                Phase(title='Recolección de Datos', status='pendiente', target_date='-'),
                Phase(title='Análisis y Resultados', status='pendiente', target_date='-'),
                Phase(title='Redacción Final y Conclusiones', status='pendiente', target_date='-'),
            ]
            db.add_all(initial_phases)

        if db.query(AILog).count() == 0:
            initial_ai_logs = [
                AILog(
                    tool='Gemini',
                    prompt='Ayúdame a estructurar un marco teórico sobre trazabilidad de software.',
                    ai_response='Aquí tienes una estructura propuesta:\n1. Introducción a la trazabilidad.\n2. Tipos de trazabilidad (hacia adelante y hacia atrás).\n3. Herramientas y metodologías actuales en el desarrollo de software...',
                    usage_description='Se utilizó la estructura sugerida para organizar los subtítulos del capítulo 2. Se reescribió el contenido con nuestras propias palabras.',
                    log_date='2026-08-15'
                ),
                AILog(
                    tool='Claude',
                    prompt='Resume este artículo científico de 20 páginas sobre metodologías ágiles en 3 párrafos.',
                    ai_response='El artículo destaca principalmente tres puntos clave sobre las metodologías ágiles...\n\nEn segundo lugar, se menciona que el rendimiento de los equipos mejora un 30%...\n\nFinalmente, los autores concluyen que la adaptación es más importante que seguir el plan escrito.',
                    usage_description='El resumen nos ayudó a decidir si el artículo era relevante. Citamos la conclusión del artículo original (mejora del 30%) en la sección de antecedentes.',
                    log_date='2026-08-21'
                )
            ]
            db.add_all(initial_ai_logs)

        if db.query(Resource).count() == 0:
            initial_resources = [
                Resource(
                    title='Trazabilidad de Requisitos en Metodologías Ágiles (PDF)',
                    url='https://scholar.google.com',
                    resource_type='Scholar',
                    description='Artículo principal que estamos usando para redactar el marco teórico del capítulo 2.',
                    added_date='2026-08-10'
                ),
                Resource(
                    title='Carpeta Compartida del Equipo',
                    url='https://drive.google.com',
                    resource_type='Drive',
                    description='Contiene los borradores del documento en Word y las actas de reunión con el tutor.',
                    added_date='2026-08-12'
                )
            ]
            db.add_all(initial_resources)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error al inicializar datos semilla: {e}")
    finally:
        db.close()
