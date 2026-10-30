import React from 'react';
import { Search, Bell, User, FileText, Menu, Sparkles } from 'lucide-react';

export default function Header({ activePaper, setActiveTab, searchQuery, setSearchQuery, onSearchSubmit }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setActiveTab('search');
      if (onSearchSubmit) onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Search Input Bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search a technical term or concept... (e.g. 'Transformer', 'Glucose', 'Embedding')"
            className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-900"
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                setActiveTab('search');
                if (onSearchSubmit) onSearchSubmit(searchQuery);
              }
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" /> Search
          </button>
        </div>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center space-x-4">
        {activePaper && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span className="font-semibold text-slate-800 truncate max-w-[180px]">{activePaper.title}</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-lavender-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            AI
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">Researcher</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Academic License</p>
          </div>
        </div>
      </div>
    </header>
  );
}
