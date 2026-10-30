import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    authors = Column(String(500), default="Unknown Authors")
    abstract = Column(Text, default="")
    keywords = Column(JSON, default=list)
    total_pages = Column(Integer, default=0)
    sections_count = Column(Integer, default=0)
    is_scanned = Column(Integer, default=0) # 1 if scanned / no text
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="processed")

    chunks = relationship("PaperChunk", back_populates="paper", cascade="all, delete-orphan")
    insights = relationship("ResearchInsight", back_populates="paper", cascade="all, delete-orphan")
    search_history = relationship("SearchHistory", back_populates="paper", cascade="all, delete-orphan")

class PaperChunk(Base):
    __tablename__ = "paper_chunks"

    id = Column(String(100), primary_key=True, index=True)
    paper_id = Column(String(50), ForeignKey("papers.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=False)
    section_name = Column(String(255), default="General")
    embedding = Column(JSON, nullable=True) # Serialized list of floats

    paper = relationship("Paper", back_populates="chunks")

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String(50), ForeignKey("papers.id"), nullable=False)
    search_term = Column(String(255), nullable=False)
    found_exact = Column(Integer, default=1)
    relevance_score = Column(Float, default=0.0)
    meaning_in_paper = Column(Text, default="")
    simple_explanation = Column(Text, default="")
    supporting_sentence = Column(Text, default="")
    relevant_paragraph = Column(Text, default="")
    page_number = Column(Integer, default=1)
    section_name = Column(String(255), default="General")
    related_terms = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    paper = relationship("Paper", back_populates="search_history")

class ResearchInsight(Base):
    __tablename__ = "research_insights"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String(50), ForeignKey("papers.id"), nullable=False)
    category = Column(String(100), nullable=False) # Key Concepts, Methodologies, Techniques Used, Important Findings, Limitations, Research Gaps, Future Work, Keywords
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence_quote = Column(Text, default="")
    page_number = Column(Integer, default=1)
    section_name = Column(String(255), default="General")
    
    paper = relationship("Paper", back_populates="insights")
