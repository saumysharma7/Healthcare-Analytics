import React, { useState } from 'react';

export interface TrendPoint {
  label: string; // e.g. "Jan"
  value1: number; // primary series
  value2?: number; // secondary series
  formatted1?: string;
  formatted2?: string;
}

interface AreaTrendChartProps {
  data: TrendPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  series1Name?: string;
  series2Name?: string;
  series1Color?: string;
  series2Color?: string;
  showDualSeries?: boolean;
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({
  data,
  title,
  subtitle,
  height = 240,
  series1Name = 'Patients',
  series2Name = 'Admissions',
  series1Color = '#54B435',
  series2Color = '#163A5F',
  showDualSeries = false
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return null;

  const maxVal1 = Math.max(...data.map(d => d.value1), 1);
  const maxVal2 = showDualSeries ? Math.max(...data.map(d => d.value2 ?? 0), 1) : 0;
  const overallMax = Math.max(maxVal1, maxVal2);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 35;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const stepX = chartW / (data.length - 1 || 1);

  // Generate points for Series 1
  const points1 = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = svgHeight - paddingY - (d.value1 / overallMax) * chartH;
    return { x, y, data: d };
  });

  const path1 = points1.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const area1 = `${path1} L ${points1[points1.length - 1].x} ${svgHeight - paddingY} L ${points1[0].x} ${svgHeight - paddingY} Z`;

  // Series 2 (if dual)
  let points2: { x: number; y: number; data: TrendPoint }[] = [];
  let path2 = '';
  let area2 = '';
  if (showDualSeries) {
    points2 = data.map((d, i) => {
      const x = paddingX + i * stepX;
      const val = d.value2 ?? 0;
      const y = svgHeight - paddingY - (val / overallMax) * chartH;
      return { x, y, data: d };
    });
    path2 = points2.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
    area2 = `${path2} L ${points2[points2.length - 1].x} ${svgHeight - paddingY} L ${points2[0].x} ${svgHeight - paddingY} Z`;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          {title && <h3 className="text-base font-semibold text-[#102A43] tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded" style={{ backgroundColor: series1Color }} />
            <span className="text-[#243447]">{series1Name}</span>
          </div>
          {showDualSeries && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: series2Color }} />
              <span className="text-[#243447]">{series2Name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series1Color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={series1Color} stopOpacity="0.02" />
            </linearGradient>
            {showDualSeries && (
              <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={series2Color} stopOpacity="0.30" />
                <stop offset="100%" stopColor={series2Color} stopOpacity="0.02" />
              </linearGradient>
            )}
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#E2E8F0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + chartH / 2} x2={svgWidth - paddingX} y2={paddingY + chartH / 2} stroke="#E2E8F0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#CBD5E1" />

          {/* Area 1 */}
          <path d={area1} fill="url(#areaGradient1)" />
          {/* Path 1 */}
          <path d={path1} fill="none" stroke={series1Color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dual series */}
          {showDualSeries && (
            <>
              <path d={area2} fill="url(#areaGradient2)" />
              <path d={path2} fill="none" stroke={series2Color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* Points & Interactive circles */}
          {points1.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 5.5 : 3}
                fill="#FFFFFF"
                stroke={series1Color}
                strokeWidth="2"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {showDualSeries && points2[i] && (
                <circle
                  cx={points2[i].x}
                  cy={points2[i].y}
                  r={hoveredIdx === i ? 5.5 : 3}
                  fill="#FFFFFF"
                  stroke={series2Color}
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              )}

              {/* X Axis Label */}
              <text
                x={pt.x}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#64748B"
                className="font-medium select-none"
              >
                {pt.data.label}
              </text>
            </g>
          ))}

          {/* Hover Crosshair and Tooltip */}
          {hoveredIdx !== null && (
            <line
              x1={points1[hoveredIdx].x}
              y1={paddingY}
              x2={points1[hoveredIdx].x}
              y2={svgHeight - paddingY}
              stroke="#94A3B8"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
          )}
        </svg>

        {/* Floating Tooltip HTML */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 pointer-events-none transform -translate-x-1/2 bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded shadow-lg backdrop-blur-sm z-20"
            style={{
              left: `${(points1[hoveredIdx].x / svgWidth) * 100}%`
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-0.5 mb-1">
              {data[hoveredIdx].label} 2025
            </div>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: series1Color }}></span>
              <span className="text-slate-300">{series1Name}:</span>
              <span className="font-bold text-white">
                {data[hoveredIdx].formatted1 || data[hoveredIdx].value1.toLocaleString()}
              </span>
            </div>
            {showDualSeries && (
              <div className="flex items-center gap-2 font-mono tabular-nums mt-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: series2Color }}></span>
                <span className="text-slate-300">{series2Name}:</span>
                <span className="font-bold text-white">
                  {data[hoveredIdx].formatted2 || (data[hoveredIdx].value2 ?? 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
