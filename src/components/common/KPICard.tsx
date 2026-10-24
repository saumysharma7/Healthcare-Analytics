import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false
}) => {
  return (
    <div
      className={`relative bg-white rounded-xl border p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-sm ${
        highlight
          ? 'border-[#16A6A1]/40 ring-1 ring-[#16A6A1]/20'
          : 'border-[#E2E8F0] hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#64748B] tracking-wide uppercase">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-[#102A43] font-mono tabular-nums tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-[#E7F6F5] text-[#16A6A1] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono tabular-nums font-semibold shrink-0 ${
                trend.isPositive ? 'text-emerald-600' : 'text-slate-600'
              }`}
            >
              {trend.value} {trend.label && <span className="font-normal text-[#64748B]">· {trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
