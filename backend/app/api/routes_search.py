from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Paper, PaperChunk, SearchHistory
from app.rag.engine import explain_term_with_rag

router = APIRouter()

class SearchRequest(BaseModel):
    paper_id: str
    search_term: str

@router.post("/search")
@router.post("/explain")
async def search_and_explain_term(req: SearchRequest, db: Session = Depends(get_db)):
    """
    Accepts paper_id and search_term.
    Performs semantic retrieval + RAG pipeline.
    Returns paper-specific contextual explanation & supporting evidence.
    """
    paper = db.query(Paper).filter(Paper.id == req.paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    # Retrieve stored chunks
    db_chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == req.paper_id).all()
    if not db_chunks:
        # Auto-trigger chunking if not chunked
        from app.pdf.extractor import extract_pdf_data
        from app.embeddings.vector_store import build_chunks_from_pages
        extracted = extract_pdf_data(paper.file_path)
        chunks_data = build_chunks_from_pages(req.paper_id, extracted["pages"])
        
        db_chunks = []
        for cd in chunks_data:
            chunk_obj = PaperChunk(
                id=cd["id"],
                paper_id=req.paper_id,
                chunk_index=cd["chunk_index"],
                text=cd["text"],
                page_number=cd["page_number"],
                section_name=cd["section_name"],
                embedding=cd["embedding"]
            )
            db.add(chunk_obj)
            db_chunks.append(chunk_obj)
        paper.status = "processed"
        db.commit()

    # Format chunks for vector search
    chunks_list = [
        {
            "id": c.id,
            "text": c.text,
            "page_number": c.page_number,
            "section_name": c.section_name,
            "embedding": c.embedding
        }
        for c in db_chunks
    ]

    # Run RAG Engine
    result = await explain_term_with_rag(req.search_term, chunks_list)

    # Save search result to history
    history_entry = SearchHistory(
        paper_id=req.paper_id,
        search_term=req.search_term,
        found_exact=1 if result.get("found_exact") else 0,
        relevance_score=result.get("relevance_score", 0.0),
        meaning_in_paper=result.get("meaning_in_paper", ""),
        simple_explanation=result.get("simple_explanation", ""),
        supporting_sentence=result.get("supporting_sentence", ""),
        relevant_paragraph=result.get("relevant_paragraph", ""),
        page_number=result.get("page_number", 1),
        section_name=result.get("section_name", "General"),
        related_terms=result.get("related_terms", [])
    )
    db.add(history_entry)
    db.commit()

    return result
