# An Intelligent Context-Aware and Scalable AI Framework for Reliable Research Paper Analysis with Semantic Intelligence, Bias Mitigation, and Efficient Computation

A complete full-stack academic AI platform designed to analyze uploaded research papers in PDF format. Users can search for technical or domain-specific terms and receive paper-grounded operational meanings, supporting sentence quotes, exact page citations, section headers, and categorized research insights without generic dictionary definitions or hallucinations.

---

## 🌟 Key Features & Workflow

1. **PDF Text Extraction & Layout Preservation**: Uses PyMuPDF (`fitz`) to extract text page-by-page while dynamically detecting headings (Abstract, Introduction, Methodology, Results, Conclusion, References).
2. **Semantic Text Chunking**: Divides text into meaningful paragraphs while attaching `page_number` and `section_name` metadata to every block.
3. **Dense Embedding & Vector Retrieval**: Computes 384-dimensional vector embeddings via `SentenceTransformers` (`all-MiniLM-L6-v2`) and performs vector similarity search.
4. **Context-Aware RAG Engine**: Accepts technical search queries (e.g., *Transformer*, *Glucose*, *Attention*) and generates paper-grounded explanations featuring:
   - **Meaning in This Paper**: Specific operational definition within the paper.
   - **Simple Explanation**: Plain language summary.
   - **Supporting Sentence**: Direct sentence evidence quote from the paper text.
   - **Relevant Paragraph**: Complete surrounding context block.
   - **Page Number & Section Name**: Exact source page and heading location.
   - **Vector Similarity Confidence Score**: Empirical relevance score.
   - **Related Concepts**: Extracted related technical terms.
5. **Missing Term Discovery**: Gracefully handles missing terms by notifying the user and retrieving top semantically related concepts without fabricating information.
6. **Automated Research Insights Dashboard**: Categorizes paper findings into 8 academic dimensions:
   - Key Concepts, Methodologies, Techniques Used, Important Findings, Limitations, Research Gaps, Future Work, Important Keywords.
7. **RAG Evaluation & Comparative Search Analysis**: Measures Precision, Recall, Similarity, Relevance, Groundedness, and benchmarks Keyword Search vs Traditional NLP vs Semantic Search vs Context-Aware RAG.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js / React (JavaScript only), Tailwind CSS, Lucide React icons.
- **Backend**: Python 3.11+, FastAPI, Uvicorn.
- **AI / NLP**: PyMuPDF (`fitz`), SentenceTransformers (`all-MiniLM-L6-v2`), FAISS / Cosine Vector Similarity Index, Context-Aware RAG Pipeline.
- **Database**: SQLite (out-of-the-box local development) / PostgreSQL support via SQLAlchemy.

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Start Backend (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server with Uvicorn
python -m uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Step 2: Start Frontend (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend web application will be accessible at: [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Architecture & Directory Layout

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_upload.py       # PDF upload & chunking API
│   │   │   ├── routes_search.py       # Context search & RAG API
│   │   │   ├── routes_paper.py        # Paper metadata & section API
│   │   │   ├── routes_history.py      # Past sessions & query log
│   │   │   └── routes_evaluation.py   # RAG evaluation & comparative matrix
│   │   ├── database/
│   │   │   ├── connection.py          # SQLAlchemy SQLite/Postgres engine
│   │   │   └── models.py              # Paper, Chunk, History, Insight tables
│   │   ├── embeddings/
│   │   │   └── vector_store.py        # SentenceTransformers & Cosine Sim
│   │   ├── pdf/
│   │   │   └── extractor.py           # PyMuPDF parser & heading detector
│   │   ├── rag/
│   │   │   ├── engine.py              # Context-grounded RAG pipeline
│   │   │   └── prompts.py             # Grounding prompts & constraints
│   │   ├── services/
│   │   │   ├── insights.py            # Academic insight categorization
│   │   │   └── evaluation.py          # Precision/Recall & comparative matrix
│   │   └── main.py                    # FastAPI entry point
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js             # Navigation sidebar
│   │   │   ├── Header.js              # Top navbar with global search
│   │   │   ├── DashboardView.js       # Welcome hero, dropzone & stats
│   │   │   ├── UploadView.js          # File dropzone & metadata review
│   │   │   ├── PaperAnalysisView.js   # Dynamic section outline & text stream
│   │   │   ├── SearchContextView.js   # Prominent term search & RAG evidence card
│   │   │   ├── InsightsView.js        # Categorized research insights tabs
│   │   │   ├── EvaluationView.js      # Precision/Recall metrics & matrix
│   │   │   ├── HistoryView.js         # Session log & search query log
│   │   │   └── SettingsView.js        # Model & vector database config
│   │   ├── pages/
│   │   │   ├── _app.js                # App wrapper with global styles
│   │   │   └── index.js               # Main orchestrator dashboard page
│   │   └── styles/
│   │       └── globals.css            # Tailwind & glassmorphism utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── .env.example
└── README.md
```

---

## 🔬 RAG Prompt Rules & Bias Mitigation

The RAG engine follows strict context-grounding rules:
1. Explains searched technical terms **strictly within the scope** of the uploaded paper.
2. Distinguishes direct quotes from generated plain-language summaries.
3. If context is insufficient, explicitly states: *"Exact term not found in the uploaded paper."* and provides top semantically related concepts.
4. Prevents hallucinations by refusing to output ungrounded external dictionary facts.
