import React from 'react';
import { 
  UploadCloud, 
  FileText, 
  Search, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Clock,
  Layers,
  BarChart2
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  recentPapers, 
  setActiveTab, 
  onFileUpload, 
  uploading, 
  uploadProgress, 
  onSelectPaper 
}) {
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-lavender-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wide text-brand-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-lavender-300" /> Grounded Semantic Intelligence Framework
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reliable Research Paper Analysis Engine
          </h2>
          <p className="mt-2 text-xs text-brand-100/90 leading-relaxed font-normal">
            Upload any academic PDF to extract paper-specific technical meanings, direct sentence evidence, page citations, and categorized research insights without generic definitions or hallucination.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2 bg-white text-brand-900 rounded-xl font-bold text-xs hover:bg-brand-50 transition-all shadow-md flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-brand-600" /> Upload New Paper
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-lavender-200" /> Search Term Context
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Papers Analysed</span>
            <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{stats.papers_count || 0}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Processed via PyMuPDF
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Terms Searched</span>
            <div className="p-2 bg-lavender-50 rounded-xl text-lavender-600">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{stats.terms_count || 0}</p>
          <p className="text-[11px] text-brand-600 font-medium mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Semantic Similarity RAG
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Contexts Retrieved</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{stats.contexts_count || 0}</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Page & Section Grounded
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Insights Generated</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Lightbulb className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{stats.insights_count || 0}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
            <BarChart2 className="w-3 h-3" /> 8 Academic Categories
          </p>
        </div>
      </div>

      {/* Upload Paper Card & Recent Papers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Drop Zone Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-brand-600" /> Upload Research Paper
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">PDF Only</span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50 hover:bg-brand-50/30 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 mx-auto flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>

              <p className="text-xs font-bold text-slate-800">
                Drag and drop your PDF here
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                or click to browse local files
              </p>

              <label className="mt-4 inline-block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2">
                  Browse Files
                </span>
              </label>

              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[10px] text-slate-400">
                Max size: 50MB • PyMuPDF Preserves Headings & Pages
              </div>
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-brand-700">
                  <span>Uploading & Extracting...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Papers Table Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> Recent Papers
              </h3>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View History <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentPapers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>No research papers uploaded yet.</p>
                <p className="mt-1 text-[11px] text-slate-400">Upload a PDF paper above to start contextual analysis.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPapers.slice(0, 4).map((paper) => (
                  <div
                    key={paper.id}
                    className="p-3.5 border border-slate-100 hover:border-brand-200 rounded-xl bg-slate-50/50 hover:bg-brand-50/20 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate" title={paper.title}>
                          {paper.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {paper.total_pages} Pages • Uploaded {new Date(paper.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        {paper.status === 'processed' ? 'Analyzed' : 'Ready'}
                      </span>
                      <button
                        onClick={() => onSelectPaper(paper)}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        View Analysis
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
