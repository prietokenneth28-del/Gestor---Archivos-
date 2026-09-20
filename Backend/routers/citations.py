import io
import re
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import Citation, AdvancedQuery
from schemas import (
    CitationCreate, 
    CitationUpdate, 
    CitationResponse, 
    CitationImportTextRequest,
    CitationPreviewItem,
    CitationBatchSaveRequest
)

try:
    import bibtexparser
except ImportError:
    bibtexparser = None

try:
    import rispy
except ImportError:
    rispy = None

router = APIRouter(
    prefix="/api/citations",
    tags=["Documentos a Citar (IEEE)"]
)

def format_author_name(author_str: str) -> str:
    """Formatea la lista de autores al estándar IEEE (ej. J. Smith, A. B. Gomez y C. Lee)."""
    if not author_str:
        return ""
    
    # Separar por ' and ', ';', o ',' si parece lista
    raw_authors = []
    if " and " in author_str.lower():
        raw_authors = re.split(r'\s+and\s+', author_str, flags=re.IGNORECASE)
    elif ";" in author_str:
        raw_authors = [a.strip() for a in author_str.split(";") if a.strip()]
    else:
        raw_authors = [author_str.strip()]
    
    formatted_list = []
    for a in raw_authors:
        a = a.strip()
        if not a:
            continue
        # Si es "Apellido, Nombre"
        if "," in a:
            parts = a.split(",", 1)
            last_name = parts[0].strip()
            first_names = parts[1].strip().split()
            initials = " ".join([f"{f[0].upper()}." for f in first_names if f])
            formatted_list.append(f"{initials} {last_name}".strip())
        else:
            parts = a.split()
            if len(parts) > 1:
                last_name = parts[-1]
                first_names = parts[:-1]
                initials = " ".join([f"{f[0].upper()}." for f in first_names if f])
                formatted_list.append(f"{initials} {last_name}".strip())
            else:
                formatted_list.append(a)
    
    if not formatted_list:
        return ""
    if len(formatted_list) == 1:
        return formatted_list[0]
    elif len(formatted_list) == 2:
        return f"{formatted_list[0]} y {formatted_list[1]}"
    elif len(formatted_list) > 3:
        return f"{formatted_list[0]} et al."
    else:
        return f"{', '.join(formatted_list[:-1])} y {formatted_list[-1]}"

def generate_ieee_reference(item) -> str:
    """Genera la cita formateada según norma IEEE según el tipo de documento."""
    authors = format_author_name(item.get("authors") or "")
    title = (item.get("title") or "").strip().rstrip(".")
    pub = (item.get("publication") or item.get("publisher") or "").strip()
    year = (item.get("year") or "").strip()
    vol = (item.get("volume") or "").strip()
    issue = (item.get("issue") or "").strip()
    pages = (item.get("pages") or "").strip()
    doi = (item.get("doi") or "").strip()
    url = (item.get("url") or "").strip()
    entry_type = (item.get("entry_type") or "article").lower()
    
    ref = ""
    if authors:
        ref += f"{authors}, "
    
    if entry_type in ["article", "jour", "journal"]:
        ref += f'"{title},"'
        if pub:
            ref += f' *{pub}*'
        if vol:
            ref += f', vol. {vol}'
        if issue:
            ref += f', no. {issue}'
        if pages:
            ref += f', pp. {pages}'
        if year:
            ref += f', {year}'
        if doi:
            ref += f', doi: {doi}'
        ref += '.'

    elif entry_type in ["inproceedings", "proceedings", "conf", "conference"]:
        ref += f'"{title},"'
        if pub:
            ref += f' en *{pub}*'
        if year:
            ref += f', {year}'
        if pages:
            ref += f', pp. {pages}'
        if doi:
            ref += f', doi: {doi}'
        ref += '.'

    elif entry_type in ["book", "booklet"]:
        ref += f'*{title}*'
        if pub:
            ref += f', {pub}'
        if year:
            ref += f', {year}'
        if pages:
            ref += f', pp. {pages}'
        ref += '.'

    else:
        # Pág web, misc, informe
        ref += f'"{title},"'
        if pub:
            ref += f' {pub}'
        if year:
            ref += f', {year}.'
        else:
            ref += '.'
        if url:
            ref += f' [En línea]. Disponible: {url}'
    
    return ref

def parse_raw_bib_or_ris(raw_text: str, fmt: str = "auto") -> List[dict]:
    """Parsea texto BibTeX o RIS a una lista de diccionarios estandarizados."""
    results = []
    
    # Determinar formato si es auto
    if fmt == "auto":
        if "TY  -" in raw_text or "ER  -" in raw_text:
            fmt = "ris"
        else:
            fmt = "bibtex"
            
    if fmt == "bibtex":
        if bibtexparser is not None:
            try:
                db = bibtexparser.loads(raw_text)
                for entry in db.entries:
                    authors = entry.get("author", "").replace("\n", " ")
                    title = entry.get("title", "").replace("{", "").replace("}", "").replace("\n", " ")
                    pub = entry.get("journal") or entry.get("booktitle") or entry.get("publisher", "")
                    results.append({
                        "entry_type": entry.get("ENTRYTYPE", "article"),
                        "cite_key": entry.get("ID", ""),
                        "authors": authors,
                        "title": title,
                        "year": entry.get("year", ""),
                        "publication": pub,
                        "volume": entry.get("volume", ""),
                        "issue": entry.get("number") or entry.get("issue", ""),
                        "pages": entry.get("pages", ""),
                        "publisher": entry.get("publisher", ""),
                        "doi": entry.get("doi", ""),
                        "url": entry.get("url", ""),
                    })
            except Exception as e:
                print("Error parsing BibTeX con bibtexparser:", e)
        
        # Fallback si bibtexparser falla o no está disponible
        if not results:
            entries = raw_text.split("@")
            for e in entries:
                if not e.strip():
                    continue
                lines = e.splitlines()
                first_line = lines[0]
                m_type = re.match(r'^(\w+)\s*\{\s*([^,]+)', first_line)
                entry_type = m_type.group(1) if m_type else "article"
                cite_key = m_type.group(2) if m_type else ""
                
                title = re.search(r'title\s*=\s*[\{"\'](.*?)[\}"\']', e, re.I | re.S)
                author = re.search(r'author\s*=\s*[\{"\'](.*?)[\}"\']', e, re.I | re.S)
                year = re.search(r'year\s*=\s*[\{"\'](.*?)[\}"\']', e, re.I)
                journal = re.search(r'(journal|booktitle)\s*=\s*[\{"\'](.*?)[\}"\']', e, re.I | re.S)
                doi = re.search(r'doi\s*=\s*[\{"\'](.*?)[\}"\']', e, re.I)
                url = re.search(r'url\s*=\s*[\{"\'](.*?)[\}"\']', e, re.I)
                
                if title:
                    results.append({
                        "entry_type": entry_type,
                        "cite_key": cite_key,
                        "authors": author.group(1).replace("\n", " ") if author else "",
                        "title": title.group(1).replace("\n", " ").replace("{", "").replace("}", ""),
                        "year": year.group(1) if year else "",
                        "publication": journal.group(2).replace("\n", " ") if journal else "",
                        "volume": "",
                        "issue": "",
                        "pages": "",
                        "publisher": "",
                        "doi": doi.group(1) if doi else "",
                        "url": url.group(1) if url else "",
                    })
                    
    elif fmt == "ris":
        if rispy is not None:
            try:
                entries = rispy.loads(raw_text)
                for entry in entries:
                    authors = entry.get("authors") or entry.get("first_authors") or []
                    if isinstance(authors, list):
                        authors_str = " and ".join(authors)
                    else:
                        authors_str = str(authors)
                    
                    title = entry.get("title") or entry.get("primary_title") or ""
                    pub = entry.get("journal_name") or entry.get("secondary_title") or entry.get("publisher") or ""
                    
                    results.append({
                        "entry_type": entry.get("type_of_reference", "JOUR").lower(),
                        "cite_key": entry.get("id", ""),
                        "authors": authors_str,
                        "title": title,
                        "year": str(entry.get("year", "")),
                        "publication": pub,
                        "volume": str(entry.get("volume", "")),
                        "issue": str(entry.get("number", "")),
                        "pages": str(entry.get("start_page", "")) + ("-" + str(entry.get("end_page", "")) if entry.get("end_page") else ""),
                        "publisher": entry.get("publisher", ""),
                        "doi": entry.get("doi", ""),
                        "url": entry.get("url", ""),
                    })
            except Exception as e:
                print("Error parsing RIS con rispy:", e)
                
    return results

def reindex_ieee_numbers(db: Session):
    """Reindexa secuencialmente los números IEEE de 1 a N."""
    citations = db.query(Citation).order_by(Citation.id.asc()).all()
    for idx, c in enumerate(citations, start=1):
        c.ieee_number = idx
    db.commit()

def format_citation_response(c: Citation, query_title_map: dict) -> dict:
    """Prepara el diccionario de respuesta para el esquema Pydantic."""
    c_dict = {
        "authors": c.authors,
        "title": c.title,
        "publication": c.publication,
        "publisher": c.publisher,
        "year": c.year,
        "volume": c.volume,
        "issue": c.issue,
        "pages": c.pages,
        "doi": c.doi,
        "url": c.url,
        "entry_type": c.entry_type
    }
    return {
        "id": c.id,
        "entryType": c.entry_type,
        "citeKey": c.cite_key,
        "authors": c.authors,
        "title": c.title,
        "year": c.year,
        "publication": c.publication,
        "volume": c.volume,
        "issue": c.issue,
        "pages": c.pages,
        "publisher": c.publisher,
        "doi": c.doi,
        "url": c.url,
        "sourceDb": c.source_db,
        "queryId": c.query_id,
        "queryTitle": query_title_map.get(c.query_id) if c.query_id else None,
        "section": c.section or "Marco Teórico",
        "notes": c.notes,
        "quotes": c.quotes,
        "ieeeNumber": c.ieee_number,
        "ieeeReference": generate_ieee_reference(c_dict),
        "date": c.created_date
    }

@router.get("", response_model=List[CitationResponse])
def get_citations(db: Session = Depends(get_db)):
    """Obtiene todas las citaciones registradas, ordenadas por número IEEE."""
    citations = db.query(Citation).order_by(Citation.ieee_number.asc()).all()
    queries = db.query(AdvancedQuery).all()
    query_map = {q.id: q.title for q in queries}
    
    return [format_citation_response(c, query_map) for c in citations]

@router.post("", response_model=CitationResponse)
def create_citation(req: CitationCreate, db: Session = Depends(get_db)):
    """Crea manualmente una citación y le asigna el siguiente número IEEE."""
    # Calcular el número IEEE siguiente
    max_num = db.query(Citation).count()
    
    new_c = Citation(
        entry_type=req.entryType or "article",
        cite_key=req.citeKey,
        authors=req.authors,
        title=req.title,
        year=req.year,
        publication=req.publication,
        volume=req.volume,
        issue=req.issue,
        pages=req.pages,
        publisher=req.publisher,
        doi=req.doi,
        url=req.url,
        source_db=req.sourceDb or "Otro",
        query_id=req.queryId,
        section=req.section or "Marco Teórico",
        notes=req.notes,
        quotes=req.quotes,
        ieee_number=max_num + 1
    )
    db.add(new_c)
    db.commit()
    db.refresh(new_c)
    
    query_title = None
    if new_c.query_id:
        q = db.query(AdvancedQuery).filter(AdvancedQuery.id == new_c.query_id).first()
        if q:
            query_title = q.title
            
    return format_citation_response(new_c, {new_c.query_id: query_title} if new_c.query_id else {})

@router.put("/{citation_id}", response_model=CitationResponse)
def update_citation(citation_id: int, req: CitationUpdate, db: Session = Depends(get_db)):
    """Actualiza los datos bibliográficos o de aporte de una citación."""
    c = db.query(Citation).filter(Citation.id == citation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Citación no encontrada")
        
    if req.entryType is not None: c.entry_type = req.entryType
    if req.citeKey is not None: c.cite_key = req.citeKey
    if req.authors is not None: c.authors = req.authors
    if req.title is not None: c.title = req.title
    if req.year is not None: c.year = req.year
    if req.publication is not None: c.publication = req.publication
    if req.volume is not None: c.volume = req.volume
    if req.issue is not None: c.issue = req.issue
    if req.pages is not None: c.pages = req.pages
    if req.publisher is not None: c.publisher = req.publisher
    if req.doi is not None: c.doi = req.doi
    if req.url is not None: c.url = req.url
    if req.sourceDb is not None: c.source_db = req.sourceDb
    if req.queryId is not None: c.query_id = req.queryId
    if req.section is not None: c.section = req.section
    if req.notes is not None: c.notes = req.notes
    if req.quotes is not None: c.quotes = req.quotes

    db.commit()
    db.refresh(c)
    
    query_title = None
    if c.query_id:
        q = db.query(AdvancedQuery).filter(AdvancedQuery.id == c.query_id).first()
        if q:
            query_title = q.title
            
    return format_citation_response(c, {c.query_id: query_title} if c.query_id else {})

@router.delete("/{citation_id}")
def delete_citation(citation_id: int, db: Session = Depends(get_db)):
    """Elimina una citación y reindexa secuencialmente las restantes."""
    c = db.query(Citation).filter(Citation.id == citation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Citación no encontrada")
    
    db.delete(c)
    db.commit()
    reindex_ieee_numbers(db)
    
    return {"message": "Citación eliminada correctamente", "id": citation_id}

@router.post("/import", response_model=List[CitationPreviewItem])
def import_citations_preview(req: CitationImportTextRequest, db: Session = Depends(get_db)):
    """Parsea texto BibTeX/RIS y devuelve previsualización con detección de duplicados."""
    parsed_entries = parse_raw_bib_or_ris(req.rawText, req.format or "auto")
    
    existing_citations = db.query(Citation).all()
    existing_dois = {c.doi.strip().lower(): c.id for c in existing_citations if c.doi}
    existing_title_year = {
        f"{(c.title or '').strip().lower()}|{(c.year or '').strip()}": c.id 
        for c in existing_citations if c.title
    }
    
    preview_items = []
    for item in parsed_entries:
        title = item.get("title") or "Sin Título"
        year = str(item.get("year") or "")
        doi = (item.get("doi") or "").strip().lower()
        
        is_dup = False
        reason = None
        existing_id = None
        
        if doi and doi in existing_dois:
            is_dup = True
            reason = f"DOI duplicado ({doi})"
            existing_id = existing_dois[doi]
        else:
            key = f"{title.strip().lower()}|{year.strip()}"
            if key in existing_title_year:
                is_dup = True
                reason = "Coincidencia exacta de Título y Año"
                existing_id = existing_title_year[key]
                
        ref = generate_ieee_reference(item)
        
        preview_items.append({
            "entryType": item.get("entry_type", "article"),
            "citeKey": item.get("cite_key"),
            "authors": item.get("authors"),
            "title": title,
            "year": year,
            "publication": item.get("publication"),
            "volume": item.get("volume"),
            "issue": item.get("issue"),
            "pages": item.get("pages"),
            "publisher": item.get("publisher"),
            "doi": item.get("doi"),
            "url": item.get("url"),
            "sourceDb": req.defaultSourceDb or "Otro",
            "queryId": req.defaultQueryId,
            "section": req.defaultSection or "Marco Teórico",
            "notes": None,
            "quotes": None,
            "isDuplicate": is_dup,
            "duplicateReason": reason,
            "existingId": existing_id,
            "ieeeReference": ref
        })
        
    return preview_items

@router.post("/batch", response_model=List[CitationResponse])
def batch_save_citations(req: CitationBatchSaveRequest, db: Session = Depends(get_db)):
    """Guarda múltiples citaciones confirmadas en lote y asigna números IEEE."""
    current_count = db.query(Citation).count()
    
    new_records = []
    for idx, item in enumerate(req.items, start=1):
        c = Citation(
            entry_type=item.entryType or "article",
            cite_key=item.citeKey,
            authors=item.authors,
            title=item.title,
            year=item.year,
            publication=item.publication,
            volume=item.volume,
            issue=item.issue,
            pages=item.pages,
            publisher=item.publisher,
            doi=item.doi,
            url=item.url,
            source_db=item.sourceDb or "Otro",
            query_id=item.queryId,
            section=item.section or "Marco Teórico",
            notes=item.notes,
            quotes=item.quotes,
            ieee_number=current_count + idx
        )
        db.add(c)
        new_records.append(c)
        
    db.commit()
    for c in new_records:
        db.refresh(c)
        
    queries = db.query(AdvancedQuery).all()
    query_map = {q.id: q.title for q in queries}
    
    return [format_citation_response(c, query_map) for c in new_records]
