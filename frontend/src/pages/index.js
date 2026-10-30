import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardView from '../components/DashboardView';
import UploadView from '../components/UploadView';
import PaperAnalysisView from '../components/PaperAnalysisView';
import SearchContextView from '../components/SearchContextView';
import InsightsView from '../components/InsightsView';
import EvaluationView from '../components/EvaluationView';
import HistoryView from '../components/HistoryView';
import SettingsView from '../components/SettingsView';

const API_BASE = '/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activePaper, setActivePaper] = useState(null);
  const [paperDetails, setPaperDetails] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);
  const [historyData, setHistoryData] = useState({ recent_papers: [], search_history: [] });

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // Initial data loading
  useEffect(() => {
    fetchHistory();
    fetchEvaluation(null);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
        if (data.recent_papers && data.recent_papers.length > 0 && !activePaper) {
          // Preload most recent paper
          handleSelectPaper(data.recent_papers[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  };

  const fetchEvaluation = async (paperId) => {
    try {
      const url = paperId ? `${API_BASE}/evaluate?paper_id=${paperId}` : `${API_BASE}/evaluate`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvaluationData(data);
      }
    } catch (e) {
      console.error('Failed to fetch evaluation:', e);
    }
  };

  const handleSelectPaper = async (paper) => {
    setActivePaper(paper);
    try {
      const paperRes = await fetch(`${API_BASE}/paper/${paper.id}`);
      if (paperRes.ok) {
        const details = await paperRes.json();
        setPaperDetails(details);
      }

      const insightsRes = await fetch(`${API_BASE}/paper/${paper.id}/insights`);
      if (insightsRes.ok) {
        const insData = await insightsRes.json();
        setInsightsData(insData);
      }

      fetchEvaluation(paper.id);
    } catch (e) {
      console.error('Failed to load paper details:', e);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    setUploadProgress(15);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || 'Upload failed');
        setUploading(false);
        return;
      }

      const uploadedPaper = await res.json();
      setUploading(false);

      // Trigger automatic chunking & analysis
      await handleAnalyzePaper(uploadedPaper.paper_id);
    } catch (e) {
      console.error('Upload error:', e);
      alert('Upload failed. Please ensure backend is running.');
      setUploading(false);
    }
  };

  const handleAnalyzePaper = async (paperId) => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/analyze?paper_id=${paperId}`, {
        method: 'POST',
      });

      if (res.ok) {
        const paperRes = await fetch(`${API_BASE}/paper/${paperId}`);
        if (paperRes.ok) {
          const details = await paperRes.json();
          setActivePaper(details);
          setPaperDetails(details);
        }

        const insRes = await fetch(`${API_BASE}/paper/${paperId}/insights`);
        if (insRes.ok) {
          const insData = await insRes.json();
          setInsightsData(insData);
        }

        fetchHistory();
        fetchEvaluation(paperId);
        setActiveTab('analysis');
      }
    } catch (e) {
      console.error('Analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePerformSearch = async (term) => {
    if (!term || !term.trim()) return;
    if (!activePaper) {
      alert('Please upload or select a research paper first.');
      setActiveTab('upload');
      return;
    }

    setSearching(true);
    setSearchQuery(term);

    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: activePaper.id,
          search_term: term.trim(),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setSearchResult(result);
        fetchHistory();
      } else {
        const err = await res.json();
        alert(err.detail || 'Search failed');
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setSearching(false);
    }
  };

  const stats = {
    papers_count: historyData.papers_count || 0,
    terms_count: historyData.history_count || 0,
    contexts_count: (historyData.history_count || 0) * 3,
    insights_count: insightsData && insightsData.insights ? Object.values(insightsData.insights).flat().length : 8,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-academic-bg text-slate-900 font-sans">
      <Head>
        <title>Reliable AI Research Paper Analysis Framework</title>
        <meta name="description" content="Intelligent Context-Aware and Scalable AI Framework for Research Paper Analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} activePaper={activePaper} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Navbar */}
        <Header
          activePaper={activePaper}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handlePerformSearch}
        />

        {/* View Router Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentPapers={historyData.recent_papers || []}
              setActiveTab={setActiveTab}
              onFileUpload={handleFileUpload}
              uploading={uploading}
              uploadProgress={uploadProgress}
              onSelectPaper={(p) => {
                handleSelectPaper(p);
                setActiveTab('analysis');
              }}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView
              onFileUpload={handleFileUpload}
              uploading={uploading}
              uploadProgress={uploadProgress}
              activePaper={activePaper}
              onAnalyzePaper={handleAnalyzePaper}
              analyzing={analyzing}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'analysis' && (
            <PaperAnalysisView
              paperDetails={paperDetails}
              setActiveTab={setActiveTab}
              onSearchTerm={(t) => {
                setSearchQuery(t);
                handlePerformSearch(t);
              }}
            />
          )}

          {activeTab === 'search' && (
            <SearchContextView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onPerformSearch={handlePerformSearch}
              searchResult={searchResult}
              searching={searching}
              activePaper={activePaper}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              insightsData={insightsData}
              activePaper={activePaper}
              setActiveTab={setActiveTab}
              onSearchTerm={(t) => {
                setSearchQuery(t);
                handlePerformSearch(t);
              }}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationView evaluationData={evaluationData} activePaper={activePaper} />
          )}

          {activeTab === 'history' && (
            <HistoryView
              historyData={historyData}
              onSelectPaper={(p) => {
                handleSelectPaper(p);
                setActiveTab('analysis');
              }}
              onSelectSearchTerm={(term) => {
                setSearchQuery(term);
                handlePerformSearch(term);
                setActiveTab('search');
              }}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
