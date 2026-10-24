import React, { useState } from 'react';

export interface ColumnDataItem {
  label: string;
  value: number;
  formattedValue?: string;
  subValue?: string;
  color?: string;
  id?: string;
}

interface VerticalBarChartProps {
  data: ColumnDataItem[];
  title?: string;
  subtitle?: string;
  height?: number;
  barColor?: string;
  onBarClick?: (item: ColumnDataItem) => void;
  selectedId?: string;
  yAxisLabel?: string;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  title,
  subtitle,
  height = 220,
  barColor = '#54B435',
  onBarClick,
  selectedId,
  yAxisLabel
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-semibold text-[#102A43] tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="relative flex items-end justify-between gap-3 pt-6 pb-2" style={{ height }}>
        {/* Y-axis label */}
        {yAxisLabel && (
          <div className="absolute top-0 left-0 text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
            {yAxisLabel}
          </div>
        )}

        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full border-b border-dashed border-slate-400"></div>
          <div className="w-full border-b border-dashed border-slate-400"></div>
          <div className="w-full border-b border-dashed border-slate-400"></div>
          <div className="w-full border-b border-slate-300"></div>
        </div>

        {data.map((item, index) => {
          const percentage = Math.max(8, (item.value / maxValue) * 85);
          const isSelected = selectedId === (item.id || item.label);
          const isHovered = hoveredIndex === index;
          const activeColor = item.color || barColor;

          return (
            <div
              key={item.id || item.label}
              className={`relative z-10 flex-1 flex flex-col items-center h-full justify-end group ${
                onBarClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onBarClick && onBarClick(item)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip / Value on top */}
              <div
                className={`text-[11px] font-bold font-mono tabular-nums mb-1 transition-all ${
                  isHovered || isSelected ? 'text-[#16A6A1] scale-110' : 'text-[#243447]'
                }`}
              >
                {item.formattedValue || item.value.toLocaleString()}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[48px] bg-slate-100 rounded-t overflow-hidden relative flex flex-col justify-end" style={{ height: `${percentage}%` }}>
                <div
                  className="w-full h-full rounded-t transition-all duration-500 ease-out"
                  style={{
                    backgroundColor: isHovered ? '#16A6A1' : activeColor,
                    opacity: isSelected ? 1 : (hoveredIndex !== null && !isHovered ? 0.6 : 0.95)
                  }}
                />
              </div>

              {/* X-axis Label */}
              <div className="mt-2 text-center">
                <span className={`block text-xs font-medium truncate max-w-[64px] ${
                  isSelected ? 'text-[#16A6A1] font-semibold' : 'text-[#243447]'
                }`}>
                  {item.label}
                </span>
                {item.subValue && (
                  <span className="block text-[10px] text-[#64748B] font-mono tabular-nums">
                    {item.subValue}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
