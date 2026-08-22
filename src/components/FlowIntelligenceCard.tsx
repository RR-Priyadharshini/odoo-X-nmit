import React, { useState } from 'react';
import { AlertTriangle, Info, AlertCircle, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';
import { FlowSignal } from '../types.js';

interface FlowIntelligenceCardProps {
  signal: FlowSignal;
  onActionClick?: (action: string) => void;
}

export const FlowIntelligenceCard: React.FC<FlowIntelligenceCardProps> = ({
  signal,
  onActionClick
}) => {
  const [expanded, setExpanded] = useState(false);

  const severityConfigs = {
    high: {
      border: 'border-rose-200 bg-rose-50/30',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-600'
    },
    medium: {
      border: 'border-amber-200 bg-amber-50/30',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    low: {
      border: 'border-indigo-200 bg-indigo-50/30',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Sparkles,
      iconColor: 'text-indigo-600'
    },
    info: {
      border: 'border-slate-200 bg-white',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Info,
      iconColor: 'text-slate-600'
    }
  }[signal.severity] || {
    border: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Info,
    iconColor: 'text-slate-600'
  };

  const IconComponent = severityConfigs.icon;

  return (
    <div
      id={`signal-${signal.id}`}
      className={`rounded-2xl border p-5 transition-all duration-200 ${severityConfigs.border}`}
    >
      {/* Header with Severity & Title */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <IconComponent className={`w-5 h-5 ${severityConfigs.iconColor} shrink-0`} />
          <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            {signal.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {signal.department && (
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {signal.department}
            </span>
          )}
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${severityConfigs.badge}`}>
            {signal.severity} Priority
          </span>
        </div>
      </div>

      {/* What Happened & Why it Matters */}
      <div className="mt-3.5 space-y-2 text-sm">
        <div>
          <span className="font-semibold text-slate-700">What happened: </span>
          <span className="text-slate-600">{signal.what_happened}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-700">Why it matters: </span>
          <span className="text-slate-600">{signal.why_it_matters}</span>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
        <div className="text-xs text-slate-800 flex items-center gap-1.5">
          <span className="font-bold text-indigo-700">Recommended Action:</span>
          <span className="font-medium text-slate-700">{signal.recommended_action}</span>
        </div>

        {/* Expandable Why am I seeing this */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto"
        >
          <span>Why am I seeing this?</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Explainability / Underlying Data Breakdown */}
      {expanded && signal.underlying_data && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white/80 rounded-xl p-3.5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Underlying Evidence & Live Data Points</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {signal.underlying_data.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/70 rounded-lg p-2">
                <div className="text-[11px] text-slate-500 font-medium">{item.label}</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
