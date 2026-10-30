import React from 'react';
import { Settings, Cpu, HardDrive, ShieldCheck, Database, Key } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" /> System Settings & Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage AI embedding parameters, vector store options, database backend, and API credentials.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4 text-brand-600" /> Semantic Embedding Engine
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Model Architecture</span>
              <p className="text-slate-500">SentenceTransformers (`all-MiniLM-L6-v2`)</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Vector Dimensions</span>
              <p className="text-slate-500">384-dimensional dense floating-point array</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-brand-600" /> Database & Vector Index
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Relational Database</span>
              <p className="text-slate-500">SQLite (Out-of-the-box local) / PostgreSQL (`DATABASE_URL`)</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Vector Similarity Search</span>
              <p className="text-slate-500">Numpy Cosine Similarity / FAISS CPU Indexing</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Key className="w-4 h-4 text-brand-600" /> Optional LLM API Key Configuration
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">OpenAI API Key (Optional)</label>
            <input
              type="password"
              placeholder="sk-..."
              disabled
              value="********************************"
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
            />
            <p className="text-[11px] text-slate-400">
              Configured via `.env` file (`OPENAI_API_KEY`). If absent, system automatically relies on high-precision rule-grounded paper analyzer without external API costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
