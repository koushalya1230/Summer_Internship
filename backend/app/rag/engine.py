import re
import os
import httpx
import logging
from typing import Dict, Any, List
from app.embeddings.vector_store import search_relevant_chunks
from app.rag.prompts import RAG_SYSTEM_PROMPT

logger = logging.getLogger("rag_engine")

def extract_supporting_sentence(paragraph: str, term: str) -> str:
    """Finds the most specific sentence containing the term or its primary tokens."""
    sentences = re.split(r'(?<=[.!?])\s+', paragraph)
    term_lower = term.lower()
    
    # 1. Exact match sentence
    for s in sentences:
        if term_lower in s.lower():
            return s.strip()
            
    # 2. Token match sentence
    tokens = [t for t in term_lower.split() if len(t) > 2]
    for s in sentences:
        if any(t in s.lower() for t in tokens):
            return s.strip()
            
    # 3. Fallback to first sentence
    return sentences[0].strip() if sentences else paragraph[:150]

def extract_related_terms(context_text: str, current_term: str) -> List[str]:
    """Extracts candidate technical/capitalized terms from context."""
    # Find capitalized tech terms or compound nouns
    words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', context_text)
    filtered = []
    current_lower = current_term.lower()
    for w in words:
        if w.lower() != current_lower and len(w) > 3 and w not in filtered:
            filtered.append(w)
    # Add some domain keywords if extracted list is short
    if len(filtered) < 4:
        tech_matches = re.findall(r'\b(?:accuracy|embedding|dataset|model|neural|framework|attention|precision|recall|algorithm|matrix|latency|optimization)\b', context_text, re.I)
        for tm in tech_matches:
            capitalized = tm.capitalize()
            if capitalized.lower() != current_lower and capitalized not in filtered:
                filtered.append(capitalized)
    return filtered[:6]

async def generate_llm_completion(prompt: str) -> str or None:
    """Invokes external LLM API if OPENAI_API_KEY is configured in env."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": os.getenv("LLM_MODEL", "gpt-3.5-turbo"),
                    "messages": [
                        {"role": "system", "content": RAG_SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
    return None

async def explain_term_with_rag(query_term: str, paper_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Core RAG Pipeline:
    1. Vector search to find top relevant chunks.
    2. Check exact term match vs semantic match.
    3. Ground explanation strictly in paper context.
    4. Generate structured paper-specific response.
    """
    clean_term = query_term.strip()
    if not clean_term:
        return {
            "searched_term": query_term,
            "status": "error",
            "message": "Search term cannot be empty."
        }

    # 1. Retrieve top 5 semantic chunks
    top_chunks = search_relevant_chunks(clean_term, paper_chunks, top_k=5)

    if not top_chunks or top_chunks[0]["similarity_score"] < 0.15:
        return {
            "searched_term": clean_term,
            "found_exact": False,
            "status": "insufficient_context",
            "message": "Exact term not found in the uploaded paper, and no reliable semantic context was found.",
            "meaning_in_paper": "Sufficient context was not found in the uploaded paper for this term.",
            "simple_explanation": "The term does not appear directly or semantically in the document.",
            "supporting_sentence": "N/A",
            "relevant_paragraph": "No relevant paragraph extracted.",
            "page_number": 0,
            "section_name": "N/A",
            "relevance_score": 0.0,
            "related_terms": []
        }

    best_chunk = top_chunks[0]
    paragraph_text = best_chunk["text"]
    page_num = best_chunk["page_number"]
    section = best_chunk["section_name"]
    score = best_chunk["similarity_score"]

    # Check exact presence of term in paper text
    all_paper_text = " ".join([c["text"] for c in paper_chunks]).lower()
    found_exact = clean_term.lower() in all_paper_text

    supporting_sentence = extract_supporting_sentence(paragraph_text, clean_term)
    related_terms = extract_related_terms(paragraph_text, clean_term)

    # Prepare prompt for LLM or rule-grounded contextual generator
    context_str = f"Page {page_num} [{section}]: {paragraph_text}"
    rag_prompt = (
        f"Context from paper:\n{context_str}\n\n"
        f"Search Term: '{clean_term}'\n\n"
        f"Provide two concise paragraphs:\n"
        f"1. Meaning in This Paper: Explain how '{clean_term}' is defined or operationalized in this specific context.\n"
        f"2. Simple Explanation: A clear 1-2 sentence plain language summary of its role in the paper."
    )

    llm_response = await generate_llm_completion(rag_prompt)

    if llm_response and "1." in llm_response and "2." in llm_response:
        parts = llm_response.split("2.")
        meaning_in_paper = parts[0].replace("1.", "").replace("Meaning in This Paper:", "").strip()
        simple_explanation = parts[1].replace("Simple Explanation:", "").strip()
    else:
        # Rule-grounded context explanation generator
        if found_exact:
            meaning_in_paper = (
                f"In this paper (Section: {section}, Page {page_num}), '{clean_term}' is introduced as a key context "
                f"element. As stated in the text: \"{supporting_sentence}\". It functions within the scope of "
                f"the paper's methodology and discussion regarding {section.lower()}."
            )
            simple_explanation = (
                f"Within this research work, '{clean_term}' refers specifically to the concept described in "
                f"Section {section}, where the authors apply it to achieve their reported analytical goals."
            )
        else:
            meaning_in_paper = (
                f"Exact term '{clean_term}' was not found in the paper text. However, the most semantically related "
                f"concept in Section '{section}' (Page {page_num}) states: \"{supporting_sentence}\"."
            )
            simple_explanation = (
                f"While the literal phrase '{clean_term}' is absent, the paper discusses closely related methodology "
                f"and concepts on Page {page_num} within the {section} section."
            )

    status_str = "success" if found_exact else "semantic_match"

    return {
        "searched_term": clean_term,
        "found_exact": found_exact,
        "status": status_str,
        "message": "Paper-specific contextual analysis retrieved successfully." if found_exact else "Exact term not found. Retrieved semantically related context.",
        "meaning_in_paper": meaning_in_paper,
        "simple_explanation": simple_explanation,
        "supporting_sentence": supporting_sentence,
        "relevant_paragraph": paragraph_text,
        "page_number": page_num,
        "section_name": section,
        "relevance_score": score,
        "related_terms": related_terms,
        "top_chunks": top_chunks
    }
