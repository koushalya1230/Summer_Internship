import os
import uuid
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Paper, PaperChunk, ResearchInsight
from app.pdf.extractor import extract_pdf_data
from app.embeddings.vector_store import build_chunks_from_pages
from app.services.insights import extract_insights_from_chunks

router = APIRouter()

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    1. Validates and saves PDF upload.
    2. Extracts text using PyMuPDF.
    3. Stores paper metadata in DB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Save to disk
    paper_id = str(uuid.uuid4())[:8]
    safe_name = f"{paper_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # PyMuPDF text extraction
    try:
        extracted = extract_pdf_data(file_path)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

    if extracted["is_scanned"]:
        # Do not fail completely, but flag for user
        scanned_note = "This PDF contains little or no extractable text. OCR processing is required."
    else:
        scanned_note = ""

    # Create paper record
    paper = Paper(
        id=paper_id,
        title=extracted["title"],
        filename=file.filename,
        file_path=file_path,
        file_size_bytes=len(file_bytes),
        authors="Extracted Academic Authors",
        abstract=extracted["abstract"],
        keywords=extracted["detected_sections"],
        total_pages=extracted["total_pages"],
        sections_count=len(extracted["detected_sections"]),
        is_scanned=1 if extracted["is_scanned"] else 0,
        status="uploaded"
    )

    db.add(paper)
    db.commit()
    db.refresh(paper)

    return {
        "paper_id": paper_id,
        "title": paper.title,
        "filename": paper.filename,
        "total_pages": paper.total_pages,
        "file_size_bytes": paper.file_size_bytes,
        "abstract": paper.abstract,
        "detected_sections": extracted["detected_sections"],
        "is_scanned": extracted["is_scanned"],
        "scanned_message": scanned_note,
        "status": "uploaded"
    }

@router.post("/analyze")
async def analyze_paper(paper_id: str, db: Session = Depends(get_db)):
    """
    1. Chunks paper page-by-page preserving section & page.
    2. Generates semantic embeddings via SentenceTransformers.
    3. Stores chunks in DB & prepares RAG search index.
    4. Automatically extracts Research Insights.
    """
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    if paper.status == "processed" and len(paper.chunks) > 0:
        return {
            "paper_id": paper_id,
            "status": "already_processed",
            "message": "Paper analysis is already complete.",
            "total_chunks": len(paper.chunks)
        }

    # Extract pages and build chunks
    extracted = extract_pdf_data(paper.file_path)
    chunks_data = build_chunks_from_pages(paper_id, extracted["pages"])

    # Store chunks in database
    db_chunks = []
    for cd in chunks_data:
        chunk_obj = PaperChunk(
            id=cd["id"],
            paper_id=paper_id,
            chunk_index=cd["chunk_index"],
            text=cd["text"],
            page_number=cd["page_number"],
            section_name=cd["section_name"],
            embedding=cd["embedding"]
        )
        db_chunks.append(chunk_obj)
        db.add(chunk_obj)

    # Extract Research Insights
    insights_list = extract_insights_from_chunks(chunks_data, paper.title, paper.abstract)
    for ins in insights_list:
        insight_obj = ResearchInsight(
            paper_id=paper_id,
            category=ins["category"],
            title=ins["title"],
            description=ins["description"],
            evidence_quote=ins["evidence_quote"],
            page_number=ins["page_number"],
            section_name=ins["section_name"]
        )
        db.add(insight_obj)

    paper.status = "processed"
    db.commit()

    return {
        "paper_id": paper_id,
        "status": "processed",
        "total_chunks": len(db_chunks),
        "total_pages": paper.total_pages,
        "detected_sections": extracted["detected_sections"],
        "insights_extracted_count": len(insights_list)
    }
