import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

from app.database.connection import engine, Base
from app.api import routes_upload, routes_search, routes_paper, routes_history, routes_evaluation

# Initialize SQLite / Postgres DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelligent Context-Aware AI Research Paper Analysis Framework",
    description="Backend API with Semantic Embeddings, PyMuPDF, FAISS/Vector Search, and Grounded RAG Pipeline.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(routes_upload.router, prefix="/api", tags=["Upload & Analysis"])
app.include_router(routes_search.router, prefix="/api", tags=["Search & RAG"])
app.include_router(routes_paper.router, prefix="/api", tags=["Paper Details"])
app.include_router(routes_history.router, prefix="/api", tags=["History"])
app.include_router(routes_evaluation.router, prefix="/api", tags=["Evaluation & Benchmarks"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Intelligent Context-Aware AI Research Paper Analysis Platform",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
