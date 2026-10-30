from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Paper, PaperChunk, ResearchInsight
from app.pdf.extractor import extract_pdf_data

router = APIRouter()

@router.get("/paper/{paper_id}")
async def get_paper_details(paper_id: str, db: Session = Depends(get_db)):
    """Returns detailed metadata, section outlines, and page text chunks for a paper."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    db_chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == paper_id).order_by(PaperChunk.chunk_index).all()
    
    sections = list(set([c.section_name for c in db_chunks if c.section_name])) if db_chunks else paper.keywords

    # Group text by page for page-by-page viewer
    pages_map = {}
    for c in db_chunks:
        p_num = c.page_number
        if p_num not in pages_map:
            pages_map[p_num] = []
        pages_map[p_num].append({
            "chunk_index": c.chunk_index,
            "section_name": c.section_name,
            "text": c.text
        })

    pages_list = [{"page_number": p, "chunks": chunks} for p, chunks in sorted(pages_map.items())]

    return {
        "id": paper.id,
        "title": paper.title,
        "filename": paper.filename,
        "file_size_bytes": paper.file_size_bytes,
        "authors": paper.authors,
        "abstract": paper.abstract,
        "total_pages": paper.total_pages,
        "sections_count": len(sections),
        "detected_sections": sections,
        "is_scanned": bool(paper.is_scanned),
        "status": paper.status,
        "upload_date": paper.upload_date.isoformat() if paper.upload_date else "",
        "pages": pages_list
    }

@router.get("/paper/{paper_id}/insights")
async def get_paper_insights(paper_id: str, db: Session = Depends(get_db)):
    """Returns extracted research insights grouped by categories."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    insights = db.query(ResearchInsight).filter(ResearchInsight.paper_id == paper_id).all()
    
    # If insights aren't populated yet, auto extract
    if not insights:
        from app.services.insights import extract_insights_from_chunks
        db_chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == paper_id).all()
        chunks_data = [{"text": c.text, "page_number": c.page_number, "section_name": c.section_name} for c in db_chunks]
        extracted_ins = extract_insights_from_chunks(chunks_data, paper.title, paper.abstract)
        
        insights = []
        for ins in extracted_ins:
            obj = ResearchInsight(
                paper_id=paper_id,
                category=ins["category"],
                title=ins["title"],
                description=ins["description"],
                evidence_quote=ins["evidence_quote"],
                page_number=ins["page_number"],
                section_name=ins["section_name"]
            )
            db.add(obj)
            insights.append(obj)
        db.commit()

    grouped = {}
    for i in insights:
        cat = i.category
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append({
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "evidence_quote": i.evidence_quote,
            "page_number": i.page_number,
            "section_name": i.section_name
        })

    return {
        "paper_id": paper_id,
        "paper_title": paper.title,
        "categories_count": len(grouped),
        "insights": grouped
    }
