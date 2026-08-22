import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = 'slate',
  onClick
}) => {
  const iconStyles = {
    indigo: 'bg-df-lavender/20 text-[#6f63a8]',
    emerald: 'bg-df-lime-soft/25 text-[#5c7a1f]',
    amber: 'bg-df-warning/20 text-[#8a6a1a]',
    rose: 'bg-df-danger/15 text-[#a5453f]',
    slate: 'bg-df-sage/15 text-[#5c6d4c]'
  }[accent];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`df-glass-light rounded-[20px] p-5 transition-all duration-200 df-fade-up ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-df-muted-2">{title}</span>
          <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-df-ink-2 font-display">{value}</div>
        </div>
        <div className={`p-2.5 rounded-xl ${iconStyles} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-df-muted-2 border-t border-df-card-border pt-2.5">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-[#5c7a1f]' : 'text-df-muted-2'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
