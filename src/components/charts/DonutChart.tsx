import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  formattedValue?: string;
  color: string;
  id?: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  title?: string;
  subtitle?: string;
  size?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
  onSegmentClick?: (segment: DonutSegment) => void;
  selectedId?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  subtitle,
  size = 180,
  innerRadius = 0.65,
  centerLabel,
  centerValue,
  onSegmentClick,
  selectedId
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2;
  const strokeWidth = radius * (1 - innerRadius);
  const cRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * cRadius;

  let accumulatedPercent = 0;

  return (
    <div className="w-full flex flex-col items-center">
      {(title || subtitle) && (
        <div className="w-full mb-3 text-left">
          {title && <h3 className="text-base font-semibold text-[#102A43] tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item, index) => {
            const percent = total > 0 ? item.value / total : 0;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const isHovered = hoveredIndex === index;
            const isSelected = selectedId === (item.id || item.label);

            return (
              <circle
                key={item.id || item.label}
                cx={radius}
                cy={radius}
                r={cRadius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 ease-out cursor-pointer"
                style={{
                  opacity: isSelected ? 1 : (hoveredIndex !== null && !isHovered ? 0.6 : 1),
                  transformOrigin: 'center'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick && onSegmentClick(item)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {hoveredIndex !== null ? (
            <>
              <span className="text-xs font-semibold text-[#102A43] truncate max-w-[90px]">
                {data[hoveredIndex].label}
              </span>
              <span className="text-sm font-bold text-[#16A6A1] font-mono tabular-nums">
                {total > 0 ? `${((data[hoveredIndex].value / total) * 100).toFixed(1)}%` : '0%'}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono tabular-nums">
                {data[hoveredIndex].formattedValue || data[hoveredIndex].value.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              {centerValue && (
                <span className="text-base font-bold text-[#102A43] font-mono tabular-nums">
                  {centerValue}
                </span>
              )}
              {centerLabel && (
                <span className="text-[11px] text-[#64748B] font-medium">
                  {centerLabel}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
        {data.map((item, index) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          const isSelected = selectedId === (item.id || item.label);
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.id || item.label}
              className={`flex items-center gap-2 p-1 rounded transition-colors ${
                onSegmentClick ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${isSelected ? 'bg-teal-50 ring-1 ring-[#16A6A1]' : ''}`}
              onClick={() => onSegmentClick && onSegmentClick(item)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`truncate text-xs ${isHovered ? 'font-semibold text-[#163A5F]' : 'text-[#243447]'}`}>
                    {item.label}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-xs text-[#102A43]">
                    {percent}%
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B] font-mono tabular-nums">
                  {item.formattedValue || item.value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
