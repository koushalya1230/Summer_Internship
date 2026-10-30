import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  Layers, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function UploadView({ 
  onFileUpload, 
  uploading, 
  uploadProgress, 
  activePaper, 
  onAnalyzePaper, 
  analyzing, 
  setActiveTab 
}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-brand-600" /> Research Paper PDF Processing
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload academic papers to perform text extraction, chunking, SentenceTransformers vector embedding, and context retrieval.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-10 text-center transition-all bg-slate-50/50 hover:bg-brand-50/20 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Drag & Drop Research Paper (PDF)
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Supports multi-page research documents. PyMuPDF will automatically detect headings, section names, and page citations.
          </p>

          <label className="mt-5 inline-block">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <span className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2">
              <UploadCloud className="w-4 h-4" /> Browse Files
            </span>
          </label>

          <div className="mt-6 flex items-center justify-center space-x-6 text-[11px] text-slate-400 font-medium">
            <span>• PDF Format Only</span>
            <span>• Page-by-Page Headings</span>
            <span>• Semantic Embedding Ready</span>
          </div>
        </div>

        {uploading && (
          <div className="mt-6 p-4 bg-brand-50 border border-brand-100 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-bold text-brand-800">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin" /> PyMuPDF Text Extraction & Layout Parsing...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-brand-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Active Upload Paper Summary */}
      {activePaper && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-brand-600 mt-1">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700 uppercase tracking-wider">
                  Uploaded Metadata
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activePaper.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activePaper.filename} • {(activePaper.file_size_bytes / (1024 * 1024)).toFixed(2)} MB • {activePaper.total_pages} Pages
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Remove Paper"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activePaper.is_scanned && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Scanned / Low Text PDF Warning</p>
                <p className="mt-0.5">This PDF contains little or no extractable text. OCR processing may be required for optimal sentence matching.</p>
              </div>
            </div>
          )}

          {/* Abstract Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Abstract</p>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{activePaper.abstract || 'Abstract snippet extracted from the top section of the first page.'}"
            </p>
          </div>

          {/* Detected Sections */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" /> Detected Structural Sections:
            </p>
            <div className="flex flex-wrap gap-2">
              {(activePaper.detected_sections || ['Introduction', 'Methodology', 'Results', 'Conclusion']).map((sec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  {sec}
                </span>
              ))}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ready for SentenceTransformers vector embedding & RAG index.
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onAnalyzePaper(activePaper.id)}
                disabled={analyzing}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-lavender-600 hover:from-brand-700 hover:to-lavender-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" /> Embedding Chunks...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Analyse Paper Now <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
