import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  BookOpen, 
  Search, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function PaperAnalysisView({ paperDetails, setActiveTab, onSearchTerm }) {
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedPage, setSelectedPage] = useState('All');

  if (!paperDetails) {
    return (
      <div className="p-12 text-center text-slate-500 max-w-xl mx-auto">
        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 className="font-bold text-slate-800 text-sm">No Active Paper Loaded</h3>
        <p className="text-xs text-slate-500 mt-1">Please upload or select a research paper to view its structural analysis.</p>
        <button
          onClick={() => setActiveTab('upload')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const sectionsList = paperDetails.detected_sections && paperDetails.detected_sections.length > 0
    ? ['All', ...paperDetails.detected_sections]
    : ['All', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'];

  const pages = paperDetails.pages || [];

  // Filter chunks based on active section or page selector
  const filteredPages = pages.map((page) => {
    let chunks = page.chunks || [];
    if (selectedSection !== 'All') {
      chunks = chunks.filter((c) => c.section_name.toLowerCase().includes(selectedSection.toLowerCase()));
    }
    return { ...page, chunks };
  }).filter((p) => selectedPage === 'All' || p.page_number === parseInt(selectedPage));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Paper Header Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[11px] font-bold">
              <BookOpen className="w-3.5 h-3.5" /> PyMuPDF Extracted Structure
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{paperDetails.title}</h2>
            <p className="text-xs text-slate-500">
              Authors: <span className="font-semibold text-slate-700">{paperDetails.authors || 'Academic Researchers'}</span> • Total Pages: <span className="font-semibold text-slate-700">{paperDetails.total_pages}</span>
            </p>
          </div>

          <button
            onClick={() => setActiveTab('search')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5" /> Search Term Context
          </button>
        </div>

        {/* Abstract Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Abstract</span>
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {paperDetails.abstract}
          </p>
        </div>

        {/* Section Tags Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 custom-scrollbar">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-brand-600" /> Structure:
          </span>
          {sectionsList.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSection === sec
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Structure Navigation & Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section Outline Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 h-fit">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-brand-600" /> Section Navigation
          </h3>
          <p className="text-[11px] text-slate-500">Click section to filter page blocks:</p>

          <div className="space-y-1">
            {sectionsList.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedSection === sec
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{sec}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Filter by Page:</label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="All">All Pages ({paperDetails.total_pages})</option>
              {Array.from({ length: paperDetails.total_pages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>Page {p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Page Chunks Viewer */}
        <div className="lg:col-span-3 space-y-4">
          {filteredPages.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No content matches the selected section/page filter.
            </div>
          ) : (
            filteredPages.map((page) => (
              <div key={page.page_number} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                      {page.page_number}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Page {page.page_number} Content Stream</h4>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {page.chunks ? page.chunks.length : 0} Document Paragraph Chunks
                  </span>
                </div>

                <div className="space-y-3">
                  {page.chunks && page.chunks.length > 0 ? (
                    page.chunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50/70 border border-slate-100 hover:border-brand-200 rounded-xl space-y-2 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
                            {chunk.section_name || 'General'}
                          </span>
                          <button
                            onClick={() => {
                              const words = chunk.text.split(' ').slice(0, 3).join(' ');
                              onSearchTerm(words);
                              setActiveTab('search');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold text-brand-600 hover:underline transition-opacity flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Analyze Snippet
                          </button>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed font-normal">
                          {chunk.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No text block found on this page matching section criteria.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
