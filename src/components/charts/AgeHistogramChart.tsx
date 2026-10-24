import React, { useState, useMemo } from 'react';
import { Users, Info, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { PatientRecord } from '../../types/healthcare';
import { formatINR } from '../../data/healthcareData';

export interface AgeBin {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  count: number;
  maleCount: number;
  femaleCount: number;
  admittedCount: number;
  totalCost: number;
  avgCost: number;
  admissionRate: number;
  percentOfTotal: number;
}

interface AgeHistogramChartProps {
  records: PatientRecord[];
  onSelectAgeRange?: (minAge: number, maxAge: number) => void;
  selectedAgeRange?: [number, number] | null;
}

export const AgeHistogramChart: React.FC<AgeHistogramChartProps> = ({
  records,
  onSelectAgeRange,
  selectedAgeRange
}) => {
  const [binInterval, setBinInterval] = useState<'10yr' | '5yr'>('10yr');
  const [colorMode, setColorMode] = useState<'total' | 'gender' | 'admission'>('total');
  const [hoveredBin, setHoveredBin] = useState<AgeBin | null>(null);

  // Compute statistical summaries
  const stats = useMemo(() => {
    if (records.length === 0) return { min: 0, max: 0, mean: 0, median: 0, total: 0 };
    const ages = records.map(r => r.age).sort((a, b) => a - b);
    const min = ages[0];
    const max = ages[ages.length - 1];
    const sum = ages.reduce((s, a) => s + a, 0);
    const mean = Number((sum / ages.length).toFixed(1));
    const mid = Math.floor(ages.length / 2);
    const median = ages.length % 2 !== 0 ? ages[mid] : Math.round((ages[mid - 1] + ages[mid]) / 2);
    return { min, max, mean, median, total: records.length };
  }, [records]);

  // Compute bins dynamically based on selected interval
  const bins: AgeBin[] = useMemo(() => {
    if (records.length === 0) return [];
    const step = binInterval === '10yr' ? 10 : 5;
    const maxLimit = 90; // maximum age cutoff
    const generated: AgeBin[] = [];

    for (let start = 0; start < maxLimit; start += step) {
      const end = start + step - 1;
      const binLabel = start >= 80 && binInterval === '10yr' ? '80+' : `${start}-${end}`;
      const inBin = records.filter(r => {
        if (start >= 80 && binInterval === '10yr') {
          return r.age >= 80;
        }
        return r.age >= start && r.age <= end;
      });

      const count = inBin.length;
      const maleCount = inBin.filter(r => r.gender === 'Male').length;
      const femaleCount = inBin.filter(r => r.gender === 'Female').length;
      const admittedCount = inBin.filter(r => r.admissionStatus === 'Admitted').length;
      const totalCost = inBin.reduce((s, r) => s + r.treatmentCost, 0);
      const avgCost = count > 0 ? Math.round(totalCost / count) : 0;
      const admissionRate = count > 0 ? Number(((admittedCount / count) * 100).toFixed(1)) : 0;
      const percentOfTotal = records.length > 0 ? Number(((count / records.length) * 100).toFixed(1)) : 0;

      generated.push({
        id: `${start}-${end}`,
        label: binLabel,
        minAge: start,
        maxAge: start >= 80 && binInterval === '10yr' ? 120 : end,
        count,
        maleCount,
        femaleCount,
        admittedCount,
        totalCost,
        avgCost,
        admissionRate,
        percentOfTotal
      });

      if (start >= 80 && binInterval === '10yr') break;
    }

    return generated;
  }, [records, binInterval]);

  const maxBinCount = Math.max(...bins.map(b => b.count), 1);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
      {/* Top Header & Interactive Segmented Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#102A43] tracking-tight">
              Patient Age Distribution Histogram
            </h2>
            <span className="text-[11px] font-mono text-[#16A6A1] bg-[#E7F6F5] px-2 py-0.5 rounded font-medium">
              Interactive Granular Demographics
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Binned cohort distribution across pediatric, adult, and geriatric patient populations (click any column to inspect)
          </p>
        </div>

        {/* Controls: Bin width & Color view */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Bin Interval */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            <span className="px-2 text-[11px] text-[#64748B] font-medium">Interval:</span>
            <button
              onClick={() => setBinInterval('10yr')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                binInterval === '10yr'
                  ? 'bg-white text-[#102A43] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10 Years
            </button>
            <button
              onClick={() => setBinInterval('5yr')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                binInterval === '5yr'
                  ? 'bg-white text-[#102A43] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Years
            </button>
          </div>

          {/* Color View */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            <span className="px-2 text-[11px] text-[#64748B] font-medium">View:</span>
            <button
              onClick={() => setColorMode('total')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                colorMode === 'total'
                  ? 'bg-white text-[#102A43] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setColorMode('gender')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                colorMode === 'gender'
                  ? 'bg-white text-[#102A43] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Gender
            </button>
            <button
              onClick={() => setColorMode('admission')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                colorMode === 'admission'
                  ? 'bg-white text-[#102A43] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Admission
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs">
        <div>
          <span className="text-[11px] text-[#64748B] block">Mean Cohort Age</span>
          <span className="text-base font-bold text-[#102A43] font-mono tabular-nums">
            {stats.mean} Years
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#64748B] block">Median Age</span>
          <span className="text-base font-bold text-[#16A6A1] font-mono tabular-nums">
            {stats.median} Years
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#64748B] block">Age Span</span>
          <span className="text-base font-bold text-[#102A43] font-mono tabular-nums">
            {stats.min} – {stats.max} Yrs
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#64748B] block">Highest Density Bin</span>
          <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
            {[...bins].sort((a, b) => b.count - a.count)[0]?.label || 'N/A'} ({[...bins].sort((a, b) => b.count - a.count)[0]?.count || 0})
          </span>
        </div>
      </div>

      {/* Histogram SVG Canvas */}
      <div className="relative pt-6 pb-2" style={{ height: 260 }}>
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full border-b border-dashed border-slate-400"></div>
          <div className="w-full border-b border-dashed border-slate-400"></div>
          <div className="w-full border-b border-dashed border-slate-400"></div>
          <div className="w-full border-b border-slate-300"></div>
        </div>

        {/* Columns Container */}
        <div className="relative z-10 flex items-end justify-between gap-1 sm:gap-2 h-full">
          {bins.map((bin, idx) => {
            const heightPercent = Math.max(6, (bin.count / maxBinCount) * 82);
            const isHovered = hoveredBin?.id === bin.id;
            const isSelected = selectedAgeRange && selectedAgeRange[0] === bin.minAge && selectedAgeRange[1] === bin.maxAge;

            // Stacked heights
            const malePercent = bin.count > 0 ? (bin.maleCount / bin.count) * 100 : 50;
            const admittedPercent = bin.count > 0 ? (bin.admittedCount / bin.count) * 100 : 0;

            return (
              <div
                key={bin.id}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                onClick={() => onSelectAgeRange && onSelectAgeRange(bin.minAge, bin.maxAge)}
                onMouseEnter={() => setHoveredBin(bin)}
                onMouseLeave={() => setHoveredBin(null)}
              >
                {/* Count Label */}
                <div
                  className={`text-[10px] sm:text-[11px] font-bold font-mono tabular-nums mb-1 transition-transform ${
                    isHovered || isSelected ? 'text-[#16A6A1] scale-110 font-extrabold' : 'text-[#243447]'
                  }`}
                >
                  {bin.count}
                </div>

                {/* Histogram Bar */}
                <div
                  className={`w-full max-w-[44px] rounded-t overflow-hidden relative transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-[#16A6A1] ring-offset-1' : ''
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {colorMode === 'total' && (
                    <div
                      className="w-full h-full transition-colors"
                      style={{
                        backgroundColor: isHovered ? '#16A6A1' : '#54B435',
                        opacity: isSelected ? 1 : (hoveredBin && !isHovered ? 0.6 : 0.95)
                      }}
                    />
                  )}

                  {colorMode === 'gender' && (
                    <div className="w-full h-full flex flex-col justify-end">
                      {/* Male portion */}
                      <div
                        className="w-full bg-[#163A5F] transition-all"
                        style={{ height: `${malePercent}%` }}
                        title={`Male: ${bin.maleCount}`}
                      />
                      {/* Female portion */}
                      <div
                        className="w-full bg-[#54B435] transition-all"
                        style={{ height: `${100 - malePercent}%` }}
                        title={`Female: ${bin.femaleCount}`}
                      />
                    </div>
                  )}

                  {colorMode === 'admission' && (
                    <div className="w-full h-full flex flex-col justify-end">
                      {/* Admitted portion */}
                      <div
                        className="w-full bg-[#163A5F] transition-all"
                        style={{ height: `${admittedPercent}%` }}
                        title={`Admitted: ${bin.admittedCount}`}
                      />
                      {/* Not Admitted portion */}
                      <div
                        className="w-full bg-[#54B435] transition-all"
                        style={{ height: `${100 - admittedPercent}%` }}
                        title={`Not Admitted: ${bin.count - bin.admittedCount}`}
                      />
                    </div>
                  )}
                </div>

                {/* X-Axis Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[10px] sm:text-xs truncate font-medium ${
                      isSelected ? 'text-[#16A6A1] font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    {bin.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredBin && (
          <div className="absolute top-2 right-4 pointer-events-none bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl backdrop-blur-sm z-30 space-y-1.5 border border-slate-700 min-w-[200px]">
            <div className="flex items-center justify-between font-bold text-teal-300 border-b border-slate-700 pb-1">
              <span>Age {hoveredBin.label} Cohort</span>
              <span className="font-mono">{hoveredBin.count} Patients ({hoveredBin.percentOfTotal}%)</span>
            </div>

            <div className="space-y-1 text-[11px] font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-300">Gender Ratio:</span>
                <span className="text-white">
                  {hoveredBin.maleCount}M · {hoveredBin.femaleCount}F
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Hospitalized:</span>
                <span className="text-emerald-400">
                  {hoveredBin.admittedCount} ({hoveredBin.admissionRate}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Average Billing:</span>
                <span className="text-white font-bold">{formatINR(hoveredBin.avgCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Group Cost:</span>
                <span className="text-teal-300">{formatINR(hoveredBin.totalCost)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Click column to filter patient registry
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend & Filter Status */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#64748B]">
        {colorMode === 'total' && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#54B435]"></span>
            <span>Total Patient Frequency per Age Bin</span>
          </div>
        )}
        {colorMode === 'gender' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#163A5F]"></span>
              <span>Male Cohort</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#54B435]"></span>
              <span>Female Cohort</span>
            </div>
          </div>
        )}
        {colorMode === 'admission' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#163A5F]"></span>
              <span>Admitted (IPD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#54B435]"></span>
              <span>Not Admitted (OPD)</span>
            </div>
          </div>
        )}

        <div className="text-right text-[11px]">
          {selectedAgeRange ? (
            <span className="text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Active Age Filter: {selectedAgeRange[0]} - {selectedAgeRange[1]} yrs
            </span>
          ) : (
            <span>Click any bar to filter records by specific age range</span>
          )}
        </div>
      </div>
    </div>
  );
};
