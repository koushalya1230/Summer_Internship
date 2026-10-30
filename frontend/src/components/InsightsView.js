import React, { useState } from 'react';
import { 
  Lightbulb, 
  Layers, 
  Search, 
  Copy, 
  Download, 
  Sparkles, 
  BookOpen, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function InsightsView({ insightsData, activePaper, setActiveTab, onSearchTerm }) {
  const [activeTabCategory, setActiveTabCategory] = useState('All');

  if (!insightsData || !insightsData.insights) {
    return (
      <div className="p-12 text-center text-slate-500 max-w-xl mx-auto">
        <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 className="font-bold text-slate-800 text-sm">No Research Insights Extracted</h3>
        <p className="text-xs text-slate-500 mt-1">Upload a research paper to automatically parse academic insights across 8 core categories.</p>
        <button
          onClick={() => setActiveTab('upload')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const categoryMap = insightsData.insights;
  const categoriesList = ['All', ...Object.keys(categoryMap)];

  // Flatten all items if 'All' is selected
  let displayedItems = [];
  if (activeTabCategory === 'All') {
    Object.entries(categoryMap).forEach(([cat, list]) => {
      list.forEach(item => displayedItems.push({ ...item, categoryName: cat }));
    });
  } else {
    (categoryMap[activeTabCategory] || []).forEach(item => {
      displayedItems.push({ ...item, categoryName: activeTabCategory });
    });
  }

  const handleCopyInsights = () => {
    const textToCopy = displayedItems.map(item => `[${item.categoryName}] ${item.title}: ${item.description} (Quote: "${item.evidence_quote}")`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    alert('Research insights copied to clipboard!');
  };

  const handleExportInsights = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(insightsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Insights_${activePaper?.id || 'Paper'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-md border border-amber-200">
              Automated Academic Synthesis
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Structured Research Insights Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Extracted key findings, methodology pipelines, limitations, gaps, and future work grounded in page citations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyInsights}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Insights
            </button>
            <button
              onClick={handleExportInsights}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Insights
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 custom-scrollbar">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTabCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTabCategory === cat
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-brand-100">
                  {item.categoryName}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Page {item.page_number} • {item.section_name}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Direct Citation Evidence Quote */}
            {item.evidence_quote && (
              <div className="p-3 bg-slate-50 border-l-2 border-brand-500 rounded-r-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Supporting Citation Evidence</p>
                <p className="text-xs text-slate-700 italic">"{item.evidence_quote}"</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Grounding: High</span>
              <button
                onClick={() => {
                  onSearchTerm(item.title.split(' ')[0]);
                  setActiveTab('search');
                }}
                className="text-brand-600 hover:underline font-bold flex items-center gap-1"
              >
                Search Term Context <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
