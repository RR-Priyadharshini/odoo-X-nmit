import React, { useState, useEffect } from 'react';
import { Sparkles, Filter, AlertTriangle, CheckCircle2, Info, Search } from 'lucide-react';
import { dashboardApi } from '../../api/index.js';
import { FlowSignal } from '../../types.js';
import { FlowIntelligenceCard } from '../../components/FlowIntelligenceCard.js';
import { useToast } from '../../context/ToastContext.js';

export const FlowIntelligenceView: React.FC = () => {
  const [signals, setSignals] = useState<FlowSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const { error } = useToast();

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.getAdminPulse();
        setSignals(res.data.signals);
      } catch (err: any) {
        error(err.response?.data?.error || 'Failed to load intelligence signals.');
      } finally {
        setLoading(false);
      }
    };
    fetchSignals();
  }, []);

  const filteredSignals = signals.filter((s) => {
    if (selectedSeverity !== 'all' && s.severity !== selectedSeverity) return false;
    if (selectedDept !== 'all' && s.department !== selectedDept) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable Workforce Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Flow Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time pattern analysis, coverage alerts, and actionable recommendations.
          </p>
        </div>
      </div>

      {/* Intelligence Philosophy Explainer Banner */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Transparent & Explainable Heuristics:</span>
          <p className="text-indigo-900 leading-relaxed">
            Every signal below is generated from verified time-series data in your Dayflow database. Expand "Why am I seeing this?" on any card to inspect the exact metrics, thresholds, and evidence driving the signal.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter By:</span>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
            <option value="info">Info / Milestone</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Sales">Sales</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredSignals.length} of {signals.length} signals
        </span>
      </div>

      {/* Signals Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Analyzing operational logs...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSignals.map((signal) => (
            <FlowIntelligenceCard key={signal.id} signal={signal} />
          ))}
          {filteredSignals.length === 0 && (
            <div className="col-span-2 py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              No intelligence signals match the selected filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
