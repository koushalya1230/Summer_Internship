import React from 'react';
import { History, FileText, Search, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HistoryView({ historyData, onSelectPaper, onSelectSearchTerm }) {
  if (!historyData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-xs">Loading Analysis History...</p>
      </div>
    );
  }

  const { recent_papers = [], search_history = [] } = historyData;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-brand-600" /> Analysis & Search History Log
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review past research paper sessions, extracted sections, and context retrieval queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Uploaded Papers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-brand-600" /> Uploaded Papers Log ({recent_papers.length})
          </h3>

          {recent_papers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No past papers found in database.</p>
          ) : (
            <div className="space-y-3">
              {recent_papers.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 border border-slate-100 hover:border-brand-200 rounded-xl bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="truncate pr-3">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.total_pages} Pages • Uploaded {new Date(p.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectPaper(p)}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Search Term Queries */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Search className="w-4 h-4 text-brand-600" /> Search Context Log ({search_history.length})
          </h3>

          {search_history.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No past search term queries recorded.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {search_history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onSelectSearchTerm(h.search_term)}
                  className="p-3.5 border border-slate-100 hover:border-brand-200 rounded-xl bg-slate-50/50 hover:bg-brand-50/20 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 capitalize flex items-center gap-1">
                      <Search className="w-3 h-3 text-slate-400" /> "{h.search_term}"
                    </span>
                    <span className="text-[10px] text-slate-400">Page {h.page_number} ({h.section_name})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                    "{h.supporting_sentence}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
