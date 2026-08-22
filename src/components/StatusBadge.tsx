import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: string | undefined | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status || 'Unknown';
  let Icon = Clock;

  switch (norm) {
    // Attendance states
    case 'present':
    case 'working':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = norm === 'working' ? 'Working Now' : 'Present';
      Icon = CheckCircle2;
      break;

    case 'absent':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Absent';
      Icon = XCircle;
      break;

    case 'half-day':
    case 'half day':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Half-Day';
      Icon = Clock;
      break;

    case 'leave':
    case 'on leave':
      styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      label = 'On Leave';
      Icon = Sparkles;
      break;

    case 'checked out':
    case 'checked_out':
      styles = 'bg-slate-100 text-slate-600 border-slate-300';
      label = 'Shift Completed';
      Icon = CheckCircle2;
      break;

    case 'not started':
    case 'not_started':
      styles = 'bg-slate-50 text-slate-500 border-slate-200';
      label = 'Not Started';
      Icon = Clock;
      break;

    // Leave request states
    case 'pending':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Pending Approval';
      Icon = Clock;
      break;

    case 'approved':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Approved';
      Icon = CheckCircle2;
      break;

    case 'rejected':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Rejected';
      Icon = AlertCircle;
      break;

    // Leave Types
    case 'paid':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Paid Leave';
      Icon = CheckCircle2;
      break;

    case 'sick':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Sick Leave';
      Icon = AlertCircle;
      break;

    case 'unpaid':
      styles = 'bg-slate-100 text-slate-700 border-slate-300';
      label = 'Unpaid Leave';
      Icon = Clock;
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap tracking-tight ${sizeClasses} ${styles} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
