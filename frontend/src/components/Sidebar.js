import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  Search, 
  Lightbulb, 
  BarChart3, 
  History, 
  Settings, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activePaper }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Paper', icon: UploadCloud },
    { id: 'analysis', label: 'Paper Analysis', icon: FileText, badge: activePaper ? 'Loaded' : null },
    { id: 'search', label: 'Search & Context', icon: Search, highlight: true },
    { id: 'insights', label: 'Research Insights', icon: Lightbulb },
    { id: 'evaluation', label: 'Evaluation & Benchmark', icon: BarChart3 },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-lavender-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1">
              SemanticRAG <Sparkles className="w-3.5 h-3.5 text-lavender-500 fill-lavender-100" />
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Academic AI Engine</p>
          </div>
        </div>

        {/* Active Paper Status Card */}
        {activePaper && (
          <div className="mx-3 mt-4 p-3 bg-brand-50/70 border border-brand-100 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-brand-700 tracking-wider">Active Document</p>
            <p className="text-xs font-semibold text-slate-900 truncate mt-0.5" title={activePaper.title}>
              {activePaper.title}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-brand-100/60">
              <span>{activePaper.total_pages} Pages</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium">Ready</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-lavender-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> FastRAG v1.0
          </span>
          <span className="text-slate-400">PyMuPDF + FAISS</span>
        </div>
      </div>
    </aside>
  );
}
