import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, trend, icon }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-5">
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium font-mono tabular-nums ${
              trend.isNeutral
                ? 'text-slate-400'
                : trend.isPositive
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
