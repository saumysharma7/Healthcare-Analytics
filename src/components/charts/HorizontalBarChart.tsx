import React, { useState } from 'react';

export interface BarDataItem {
  label: string;
  value: number;
  formattedValue?: string;
  secondaryLabel?: string;
  color?: string;
  id?: string;
}

interface HorizontalBarChartProps {
  data: BarDataItem[];
  title?: string;
  subtitle?: string;
  unit?: string;
  height?: number;
  barColor?: string;
  onBarClick?: (item: BarDataItem) => void;
  selectedId?: string;
  showValues?: boolean;
  maxBars?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  subtitle,
  unit = '',
  barColor = '#54B435', // Match Power BI report's bright green or teal
  onBarClick,
  selectedId,
  showValues = true,
  maxBars
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayData = maxBars ? data.slice(0, maxBars) : data;
  const maxValue = Math.max(...displayData.map(d => d.value), 1);

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-semibold text-[#102A43] tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-2.5">
        {displayData.map((item, index) => {
          const percentage = Math.max(3, (item.value / maxValue) * 100);
          const isSelected = selectedId === (item.id || item.label);
          const isHovered = hoveredIndex === index;
          const activeColor = item.color || barColor;

          return (
            <div
              key={item.id || item.label}
              className={`group relative rounded p-1 transition-all ${
                onBarClick ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${isSelected ? 'bg-teal-50/70 ring-1 ring-[#16A6A1]' : ''}`}
              onClick={() => onBarClick && onBarClick(item)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#243447] truncate max-w-[65%]">
                  {item.label}
                </span>
                <span className="font-mono tabular-nums text-[#64748B] font-medium text-xs">
                  {item.formattedValue || `${item.value.toLocaleString()} ${unit}`.trim()}
                </span>
              </div>

              <div className="relative h-6 w-full bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isHovered ? '#16A6A1' : activeColor,
                    opacity: isSelected ? 1 : (hoveredIndex !== null && !isHovered ? 0.6 : 0.95)
                  }}
                >
                  {showValues && percentage > 22 && (
                    <span className="text-[11px] font-bold text-white font-mono tabular-nums drop-shadow-sm select-none">
                      {item.formattedValue || item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {item.secondaryLabel && (
                <div className="text-[10px] text-[#64748B] mt-0.5">
                  {item.secondaryLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
