from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Paper, SearchHistory

router = APIRouter()

@router.get("/history")
async def get_search_and_analysis_history(db: Session = Depends(get_db)):
    """Returns past search queries and uploaded paper histories."""
    papers = db.query(Paper).order_by(Paper.upload_date.desc()).all()
    history = db.query(SearchHistory).order_by(SearchHistory.created_at.desc()).limit(50).all()

    formatted_papers = [
        {
            "id": p.id,
            "title": p.title,
            "filename": p.filename,
            "file_size_bytes": p.file_size_bytes,
            "authors": p.authors,
            "total_pages": p.total_pages,
            "upload_date": p.upload_date.isoformat() if p.upload_date else "",
            "status": p.status
        }
        for p in papers
    ]

    formatted_history = [
        {
            "id": h.id,
            "paper_id": h.paper_id,
            "paper_title": h.paper.title if h.paper else "Paper",
            "search_term": h.search_term,
            "found_exact": bool(h.found_exact),
            "relevance_score": h.relevance_score,
            "meaning_in_paper": h.meaning_in_paper,
            "supporting_sentence": h.supporting_sentence,
            "page_number": h.page_number,
            "section_name": h.section_name,
            "created_at": h.created_at.isoformat() if h.created_at else ""
        }
        for h in history
    ]

    return {
        "papers_count": len(formatted_papers),
        "history_count": len(formatted_history),
        "recent_papers": formatted_papers,
        "search_history": formatted_history
    }
