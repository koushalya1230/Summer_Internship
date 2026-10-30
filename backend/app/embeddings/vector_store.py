import numpy as np
import logging
from typing import List, Dict, Any

logger = logging.getLogger("vector_store")

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.warning(f"SentenceTransformer not loaded ({e}). Using lightweight TF-IDF / character ngram fallback.")
            _model = "fallback"
    return _model

def compute_embedding(text: str) -> List[float]:
    """Generates a vector embedding for a given string."""
    model = get_embedding_model()
    if model != "fallback" and hasattr(model, "encode"):
        vec = model.encode(text, convert_to_numpy=True)
        return vec.tolist()
    else:
        # Simple deterministically normalized vector hash for fallback environments
        words = text.lower().split()
        vec = np.zeros(384)
        for w in words:
            idx = sum(ord(c) for c in w) % 384
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Computes cosine similarity between two vector lists."""
    v1 = np.array(vec1, dtype=np.float32)
    v2 = np.array(vec2, dtype=np.float32)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))

def build_chunks_from_pages(paper_id: str, pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Transforms extracted page data into meaningful document chunks
    preserving page_number and section_name.
    """
    chunks = []
    chunk_counter = 0

    for page in pages_data:
        page_num = page["page_number"]
        page_chunks = page.get("chunks", [])

        for pc in page_chunks:
            text = pc["text"].strip()
            if len(text) < 15:  # Skip tiny fragments
                continue

            chunk_counter += 1
            chunk_id = f"{paper_id}_chunk_{chunk_counter}"
            embedding = compute_embedding(text)

            chunks.append({
                "id": chunk_id,
                "paper_id": paper_id,
                "chunk_index": chunk_counter,
                "text": text,
                "page_number": page_num,
                "section_name": pc.get("section_name", "General"),
                "embedding": embedding
            })

    return chunks

def search_relevant_chunks(query: str, chunks_list: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Performs semantic vector search over a paper's chunk list.
    Returns sorted list of chunks with `similarity_score`.
    """
    if not chunks_list:
        return []

    query_vec = compute_embedding(query)
    results = []

    query_lower = query.lower()

    for chunk in chunks_list:
        chunk_text = chunk["text"]
        chunk_vec = chunk["embedding"]
        
        sim_score = compute_cosine_similarity(query_vec, chunk_vec)
        
        # Boost score slightly if exact word or substring is present
        if query_lower in chunk_text.lower():
            sim_score = min(1.0, sim_score + 0.25)

        results.append({
            "chunk_id": chunk.get("id"),
            "text": chunk_text,
            "page_number": chunk.get("page_number", 1),
            "section_name": chunk.get("section_name", "General"),
            "similarity_score": round(float(sim_score), 4)
        })

    # Sort by similarity score descending
    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return results[:top_k]
