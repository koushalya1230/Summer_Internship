import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Download, 
  BookOpen, 
  ArrowRight, 
  Tag, 
  BarChart2, 
  Layers,
  HelpCircle
} from 'lucide-react';

export default function SearchContextView({ 
  searchQuery, 
  setSearchQuery, 
  onPerformSearch, 
  searchResult, 
  searching, 
  activePaper 
}) {
  const [copied, setCopied] = useState(false);
  const sampleQueries = ["Transformer", "Semantic similarity", "Glucose", "Retrieval-Augmented Generation", "Attention mechanism", "Precision"];

  const handleCopy = () => {
    if (!searchResult) return;
    const textToCopy = `Term: ${searchResult.searched_term}\nMeaning in Paper: ${searchResult.meaning_in_paper}\nSupporting Evidence (Page ${searchResult.page_number} - ${searchResult.section_name}): "${searchResult.supporting_sentence}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!searchResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(searchResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Analysis_${searchResult.searched_term}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Search Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-md border border-brand-100">
            Paper-Grounded Context Retrieval
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Search Technical Term & Paper-Specific Context
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Query any domain word or phrase. Our SentenceTransformers + RAG pipeline retrieves the paper's specific operational meaning rather than generic dictionary definitions.
          </p>
        </div>

        {/* Prominent Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onPerformSearch(searchQuery)}
              placeholder="Search a technical term or concept... (e.g., 'Transformer', 'Glucose')"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white shadow-inner transition-all"
            />
          </div>

          <button
            onClick={() => onPerformSearch(searchQuery)}
            disabled={searching || !searchQuery.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-lavender-600 hover:from-brand-700 hover:to-lavender-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {searching ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Retrieving Context...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Retrieve Context
              </>
            )}
          </button>
        </div>

        {/* Suggested Quick Queries */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Sample Queries:
          </span>
          {sampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setSearchQuery(q);
                onPerformSearch(q);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-xs font-semibold rounded-lg transition-all border border-slate-200"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {searching && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-16 bg-slate-100 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>
      )}

      {/* Search Result Display */}
      {searchResult && !searching && (
        <div className="space-y-6">
          {/* Exact Term Presence Warning/Notice */}
          {!searchResult.found_exact && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold">Exact Term Not Found in Paper Text</p>
                <p className="mt-0.5">
                  The literal string "{searchResult.searched_term}" was not found verbatim. Showing top semantically related concept retrieved from Section '{searchResult.section_name}' on Page {searchResult.page_number}.
                </p>
              </div>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {/* Title & Action Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Searched Term</span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize">{searchResult.searched_term}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
              </div>
            </div>

            {/* Confidence & Source Metadata Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Vector Similarity</p>
                  <p className="text-xs font-extrabold text-emerald-700">
                    {((searchResult.relevance_score || 0.85) * 100).toFixed(1)}% Match
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-3">
                <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Page Citation</p>
                  <p className="text-xs font-extrabold text-slate-900">Page {searchResult.page_number}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-3">
                <div className="p-2 bg-lavender-100 text-lavender-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Section Header</p>
                  <p className="text-xs font-extrabold text-slate-900 truncate max-w-[140px]" title={searchResult.section_name}>
                    {searchResult.section_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Meaning in This Paper */}
            <div className="p-5 bg-brand-50/70 border border-brand-100 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" /> Meaning in This Paper
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                {searchResult.meaning_in_paper}
              </p>
            </div>

            {/* Simple Explanation */}
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Simple Plain Language Summary
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {searchResult.simple_explanation}
              </p>
            </div>

            {/* Direct Supporting Sentence Evidence Quote */}
            <div className="p-5 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> Direct Supporting Sentence (Page {searchResult.page_number})
              </h4>
              <blockquote className="text-xs text-slate-800 font-semibold italic leading-relaxed border-l-4 border-amber-500 pl-3 py-0.5">
                "{searchResult.supporting_sentence}"
              </blockquote>
            </div>

            {/* Surrounding Relevant Paragraph Context */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Surrounding Paragraph Context (Section: {searchResult.section_name})
              </h4>
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-700 leading-relaxed">
                {searchResult.relevant_paragraph}
              </div>
            </div>

            {/* Related Technical Concepts */}
            {searchResult.related_terms && searchResult.related_terms.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600" /> Related Concepts Extracted from Context:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchResult.related_terms.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(term);
                        onPerformSearch(term);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold rounded-lg transition-all border border-slate-200 flex items-center gap-1"
                    >
                      {term} <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
