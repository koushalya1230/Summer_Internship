import re
import fitz  # PyMuPDF

COMMON_SECTION_PATTERNS = [
    r"^(?:abstract)",
    r"^(?:\d+\.|\d+\s+)?(?:introduction)",
    r"^(?:\d+\.|\d+\s+)?(?:related work|background|literature review)",
    r"^(?:\d+\.|\d+\s+)?(?:methodology|methods|proposed framework|architecture|system model)",
    r"^(?:\d+\.|\d+\s+)?(?:experiments|experimental setup|results|evaluations)",
    r"^(?:\d+\.|\d+\s+)?(?:discussion|analysis)",
    r"^(?:\d+\.|\d+\s+)?(?:conclusion|concluding remarks|future work)",
    r"^(?:\d+\.|\d+\s+)?(?:references|bibliography)"
]

def clean_text(text: str) -> str:
    """Removes weird artifacts, excessive spaces, hyphenated word wraps."""
    if not text:
        return ""
    # Fix hyphenated words at end of line (e.g., "transformer- \n models" -> "transformer models")
    text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
    # Replace multiple linebreaks/spaces with single space
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def detect_section_header(line: str) -> str or None:
    """Checks if a string line matches typical academic paper headings."""
    clean_line = line.strip().lower()
    if len(clean_line) < 3 or len(clean_line) > 80:
        return None
    for pattern in COMMON_SECTION_PATTERNS:
        if re.search(pattern, clean_line):
            # Normalize title
            return line.strip()
    return None

def extract_pdf_data(file_path: str):
    """
    Parses PDF using PyMuPDF (fitz).
    Returns dict containing page text, detected sections, title, abstract, and page count.
    """
    doc = fitz.open(file_path)
    total_pages = len(doc)
    pages_data = []
    detected_sections = set()
    full_text_sample = ""
    
    current_section = "Introduction"
    title_candidate = ""
    abstract_text = ""

    for page_num in range(total_pages):
        page = doc[page_num]
        raw_text = page.get_text("text")
        full_text_sample += raw_text

        # Extract title from first page top text if not set
        if page_num == 0 and not title_candidate:
            lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
            if lines:
                title_candidate = lines[0]
                if len(title_candidate) < 10 and len(lines) > 1:
                    title_candidate += " " + lines[1]

        # Extract abstract from text
        if "abstract" in raw_text.lower() and not abstract_text:
            match = re.search(r'(?i)abstract[\s\.\:\—\-]+(.*?)(?=\n\s*\n|1\.\s*Introduction|Introduction|\Z)', raw_text, re.DOTALL)
            if match:
                abstract_text = clean_text(match.group(1))[:1000]

        # Process lines for section detection & page block output
        lines = raw_text.split('\n')
        page_chunks = []
        current_paragraph = []

        for line in lines:
            line_str = line.strip()
            if not line_str:
                if current_paragraph:
                    para_text = clean_text(" ".join(current_paragraph))
                    if para_text:
                        page_chunks.append({
                            "text": para_text,
                            "section_name": current_section
                        })
                    current_paragraph = []
                continue

            sec_header = detect_section_header(line_str)
            if sec_header:
                if current_paragraph:
                    para_text = clean_text(" ".join(current_paragraph))
                    if para_text:
                        page_chunks.append({
                            "text": para_text,
                            "section_name": current_section
                        })
                    current_paragraph = []
                current_section = sec_header
                detected_sections.add(current_section)
            else:
                current_paragraph.append(line_str)

        if current_paragraph:
            para_text = clean_text(" ".join(current_paragraph))
            if para_text:
                page_chunks.append({
                    "text": para_text,
                    "section_name": current_section
                })

        pages_data.append({
            "page_number": page_num + 1,
            "chunks": page_chunks,
            "raw_text": raw_text
        })

    doc.close()

    is_scanned = len(full_text_sample.strip()) < 100

    if not title_candidate:
        title_candidate = "Research Paper Document"

    if not abstract_text:
        # Fallback to first page snippet
        abstract_text = clean_text(full_text_sample[:400])

    return {
        "title": title_candidate,
        "total_pages": total_pages,
        "is_scanned": is_scanned,
        "abstract": abstract_text,
        "detected_sections": sorted(list(detected_sections)) if detected_sections else ["Introduction", "Methodology", "Results", "Conclusion"],
        "pages": pages_data
    }
