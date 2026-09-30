import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  period?: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  sparklineData?: number[];
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  period = 'vs. prior cycle',
  secondaryLabel,
  secondaryValue,
  icon: Icon,
  onClick,
}) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 transition-colors ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      {/* Header zone with title & optional icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 tracking-tight">
          {title}
        </span>
        {Icon && (
          <div className="text-slate-400">
            <Icon className="h-4 w-4 stroke-[1.75]" />
          </div>
        )}
      </div>

      {/* Primary Value with Tabular Numerals */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
      </div>

      {/* Clean Unboxed Metadata with Typographic Separator (Zero Pill Discipline) */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          {change && (
            <span
              className={`flex items-center font-mono text-[11px] font-medium tabular-nums ${
                isPositive
                  ? 'text-emerald-700'
                  : isNegative
                  ? 'text-rose-700'
                  : 'text-slate-600'
              }`}
            >
              {isPositive && <ArrowUpRight className="h-3 w-3 stroke-[2] mr-0.5" />}
              {isNegative && <ArrowDownRight className="h-3 w-3 stroke-[2] mr-0.5" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3 stroke-[2] mr-0.5" />}
              {change}
            </span>
          )}
          {change && <span aria-hidden="true" className="text-slate-300">·</span>}
          <span className="text-[11px] text-slate-400">{period}</span>
        </div>

        {secondaryLabel && secondaryValue && (
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400">{secondaryLabel}:</span>
            <span className="font-mono font-medium text-slate-700 tabular-nums">
              {secondaryValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
