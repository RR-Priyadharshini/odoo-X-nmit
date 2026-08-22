import React from 'react';
import { TimelineEvent } from '../types.js';
import { Clock, UserCheck, AlertTriangle, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

interface WorkforceTimelineProps {
  events: TimelineEvent[];
  title?: string;
}

export const WorkforceTimeline: React.FC<WorkforceTimelineProps> = ({
  events,
  title = 'Workforce Pulse Activity'
}) => {
  const getCategoryIcon = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'arrival':
        return UserCheck;
      case 'anomaly':
        return AlertTriangle;
      case 'leave':
        return Calendar;
      case 'payroll':
        return ShieldCheck;
      case 'milestone':
      default:
        return Sparkles;
    }
  };

  const getSeverityDot = (severity?: TimelineEvent['severity']) => {
    switch (severity) {
      case 'attention':
        return 'bg-amber-500 ring-amber-100';
      case 'positive':
        return 'bg-emerald-500 ring-emerald-100';
      case 'normal':
      default:
        return 'bg-indigo-500 ring-indigo-100';
    }
  };

  return (
    <div id="workforce-timeline" className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">{title}</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Live Activity Stream</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((event) => {
          const Icon = getCategoryIcon(event.category);
          const dotStyle = getSeverityDot(event.severity);

          return (
            <div key={event.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ring-4 ${dotStyle} transition-transform group-hover:scale-125`}
              />

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-500 inline" />
                  <span>{event.title}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">{event.time}</span>
              </div>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {event.description}
              </p>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="text-xs text-slate-400 py-4 text-center">
            No activity events recorded yet today.
          </div>
        )}
      </div>
    </div>
  );
};
