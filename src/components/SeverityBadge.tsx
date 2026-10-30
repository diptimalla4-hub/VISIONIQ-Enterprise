import React from 'react';
import { SeverityLevel } from '../types/index.ts';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  switch (severity) {
    case 'Critical':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-xs text-rose-400 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-xs text-amber-400 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-xs text-yellow-400 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-xs text-cyan-400 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Low
        </span>
      );
    case 'None':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-xs text-emerald-400 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Nominal
        </span>
      );
  }
};
