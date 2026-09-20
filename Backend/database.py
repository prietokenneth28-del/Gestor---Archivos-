import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Phase, AILog, Resource, AdvancedQuery, Citation

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

        if db.query(AdvancedQuery).count() == 0:
            initial_queries = [
                AdvancedQuery(
                    title='Búsqueda Principal de Trazabilidad e Inteligencia Artificial',
                    database_name='Scopus',
                    query_text='TITLE-ABS-KEY(("traceability" OR "auditability") AND ("artificial intelligence" OR "large language models" OR "generative AI") AND ("academic writing" OR "degree project" OR "thesis"))',
                    description='Cadena de búsqueda avanzada para la revisión systematic de literatura sobre herramientas de trazabilidad académica.',
                    results_count=38,
                    created_date='2026-09-15'
                ),
                AdvancedQuery(
                    title='Ecuación para Herramientas de Gestión Bibliográfica en IEEE',
                    database_name='IEEE Xplore',
                    query_text='("Document Traceability" OR "Academic Integrity") AND ("AI Governance" OR "Generative Tools")',
                    description='Consulta realizada en IEEE Xplore para identificar marcos teóricos y gobernanza de IA en textos científicos.',
                    results_count=24,
                    created_date='2026-09-16'
                )
            ]
            db.add_all(initial_queries)

        if db.query(Citation).count() == 0:
            initial_citations = [
                Citation(
                    entry_type="article",
                    cite_key="Smith2025Traceability",
                    authors="J. Smith y A. Johnson",
                    title="Automated Requirement Traceability using Artificial Intelligence in Software Projects",
                    year="2025",
                    publication="IEEE Transactions on Software Engineering",
                    volume="51",
                    issue="3",
                    pages="450-465",
                    doi="10.1109/TSE.2025.1234567",
                    url="https://doi.org/10.1109/TSE.2025.1234567",
                    source_db="IEEE Xplore",
                    query_id=1,
                    section="Marco Teórico",
                    notes="Proporciona el modelo conceptual clave sobre cómo la IA apoya la trazabilidad documental.",
                    quotes="La trazabilidad automatizada reduce en un 40% los errores en la documentación de proyectos complejos. (p. 455)",
                    ieee_number=1,
                    created_date="2026-09-17"
                ),
                Citation(
                    entry_type="inproceedings",
                    cite_key="Gomez2024Bibliographic",
                    authors="C. Gomez, R. Martinez y L. Lopez",
                    title="Comparative Analysis of Academic Reference Management Tools for Engineering Students",
                    year="2024",
                    publication="Proceedings of the 2024 International Conference on Computer Science Education",
                    pages="112-118",
                    publisher="ACM",
                    doi="10.1145/3600000.3600015",
                    source_db="Scopus",
                    query_id=2,
                    section="Estado del Arte",
                    notes="Analiza la usabilidad de gestores como Zotero y Mendeley en comparación con herramientas personalizadas.",
                    quotes="El 78% de los estudiantes prefiere integraciones directas que eviten el copiado manual de citas. (p. 115)",
                    ieee_number=2,
                    created_date="2026-09-18"
                )
            ]
            db.add_all(initial_citations)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error al inicializar datos semilla: {e}")
    finally:
        db.close()

