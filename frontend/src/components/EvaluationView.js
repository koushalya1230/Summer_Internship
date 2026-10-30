import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  HelpCircle, 
  ShieldCheck, 
  Activity, 
  Layers 
} from 'lucide-react';

export default function EvaluationView({ evaluationData, activePaper }) {
  if (!evaluationData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300 animate-spin" />
        <p className="text-xs">Loading Evaluation & Benchmark Metrics...</p>
      </div>
    );
  }

  const { metrics, comparative_analysis, is_evaluated, status_note } = evaluationData;

  const metricCards = [
    { label: 'Retrieval Precision', val: metrics.retrieval_precision, desc: 'Top-k semantic context accuracy' },
    { label: 'Retrieval Recall', val: metrics.retrieval_recall, desc: 'Coverage of target paper passages' },
    { label: 'Semantic Similarity', val: metrics.semantic_similarity, desc: 'SentenceTransformers vector alignment' },
    { label: 'Answer Relevance', val: metrics.answer_relevance, desc: 'Direct relevance to query term' },
    { label: 'Context Groundedness', val: metrics.context_groundedness, desc: 'Zero hallucination constraint score' },
    { label: 'Response Accuracy', val: metrics.response_accuracy, desc: 'Paper-specific contextual fidelity' },
    { label: 'Processing Speed', val: typeof metrics.processing_time_ms === 'number' ? `${metrics.processing_time_ms} ms` : metrics.processing_time_ms, desc: 'End-to-end RAG latency' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold">
            <BarChart3 className="w-4 h-4" /> Empirical RAG Evaluation Engine
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            is_evaluated ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {is_evaluated ? 'Active Paper Evaluated' : 'To Be Evaluated'}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System Evaluation & Comparative Search Analysis
        </h2>
        <p className="text-xs text-slate-500">
          {status_note}
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
            <p className="text-2xl font-extrabold text-brand-700 mt-2">
              {typeof m.val === 'number' ? `${(m.val * 100).toFixed(0)}%` : m.val}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Comparative Analysis Matrix Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" /> Comparative Search Analysis Matrix
          </h3>
          <span className="text-xs text-slate-400 font-medium">Benchmarking 4 Retrieval Paradigms</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Search Framework Method</th>
                <th className="p-3.5">Retrieval Accuracy</th>
                <th className="p-3.5">Context Awareness</th>
                <th className="p-3.5">Hallucination Rate</th>
                <th className="p-3.5">Page/Section Precision</th>
                <th className="p-3.5">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {comparative_analysis.map((row, idx) => {
                const isProposed = row.method.includes("Proposed Context-Aware RAG");
                return (
                  <tr
                    key={idx}
                    className={`transition-all ${
                      isProposed ? 'bg-brand-50/60 font-bold text-slate-900 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3.5 flex items-center gap-2">
                      {isProposed && <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />}
                      {row.method}
                    </td>
                    <td className="p-3.5">{row.retrieval_accuracy}</td>
                    <td className="p-3.5">{row.context_awareness}</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">{row.hallucination_rate}</td>
                    <td className="p-3.5">{row.page_section_precision}</td>
                    <td className="p-3.5 font-mono text-[11px]">{row.processing_speed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
