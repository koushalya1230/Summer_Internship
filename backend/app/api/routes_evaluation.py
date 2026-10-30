# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import PaperChunk
from app.services.evaluation import compute_rag_evaluation_metrics

router = APIRouter()

@router.get("/evaluate")
async def evaluate_system(paper_id: str = None, db: Session = Depends(get_db)):
    """
    Returns system evaluation metrics:
    Precision, Recall, Similarity, Relevance, Groundedness, Accuracy, Speed
    and Comparative Analysis (Keyword vs Traditional NLP vs Semantic vs Context RAG).
    """
    chunks_list = []
    if paper_id:
        db_chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == paper_id).all()
        chunks_list = [{"text": c.text, "page_number": c.page_number} for c in db_chunks]
    else:
        # Check if any paper exists in DB
        db_chunks = db.query(PaperChunk).limit(100).all()
        chunks_list = [{"text": c.text, "page_number": c.page_number} for c in db_chunks]

    metrics_result = compute_rag_evaluation_metrics(chunks_list)
    return metrics_result
