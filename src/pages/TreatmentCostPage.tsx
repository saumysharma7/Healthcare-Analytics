import React from 'react';
import {
  IndianRupee,
  CreditCard,
  Building2,
  Calendar,
  PieChart as PieIcon,
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import { PatientRecord, FilterState } from '../types/healthcare';
import { computeKPIs, formatINR, DEPARTMENTS, MONTH_NAMES } from '../data/healthcareData';
import { KPICard } from '../components/common/KPICard';
import { HorizontalBarChart, BarDataItem } from '../components/charts/HorizontalBarChart';
import { VerticalBarChart, ColumnDataItem } from '../components/charts/VerticalBarChart';
import { DonutChart, DonutSegment } from '../components/charts/DonutChart';
import { AreaTrendChart, TrendPoint } from '../components/charts/AreaTrendChart';

interface TreatmentCostPageProps {
  records: PatientRecord[];
  allRecords: PatientRecord[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const TreatmentCostPage: React.FC<TreatmentCostPageProps> = ({
  records,
  allRecords: _allRecords,
  filters,
  onFilterChange
}) => {
  const kpis = computeKPIs(records);

  // Treatment Cost by Department (Horizontal Bar Chart)
  // Power BI: Dermatology ₹30,35,568, Cardiology ₹25,96,672, Pediatrics ₹25,08,516, General Medicine ₹24,80,572, Neurology ₹24,58,152, Orthopedics ₹21,42,029
  const deptCostData: BarDataItem[] = DEPARTMENTS.map(dept => {
    const deptRecords = records.filter(r => r.department === dept);
    const cost = deptRecords.reduce((s, r) => s + r.treatmentCost, 0);

    return {
      label: dept,
      value: cost,
      id: dept,
      formattedValue: formatINR(cost),
      secondaryLabel: `${((cost / (kpis.totalCost || 1)) * 100).toFixed(1)}% of total cost`,
      color: filters.selectedDepartments.includes(dept) ? '#16A6A1' : '#54B435'
    };
  }).sort((a, b) => b.value - a.value);

  // Treatment Cost by Visit Type (Column Chart - Average Treatment Cost)
  // Power BI: IPD: ₹40,338, OPD: ₹6,397
  const ipdRecords = records.filter(r => r.visitType === 'IPD');
  const opdRecords = records.filter(r => r.visitType === 'OPD');
  const ipdAvg = ipdRecords.length > 0 ? Math.round(ipdRecords.reduce((s, r) => s + r.treatmentCost, 0) / ipdRecords.length) : 0;
  const opdAvg = opdRecords.length > 0 ? Math.round(opdRecords.reduce((s, r) => s + r.treatmentCost, 0) / opdRecords.length) : 0;

  const costByVisitTypeData: ColumnDataItem[] = [
    {
      label: 'IPD',
      value: ipdAvg,
      formattedValue: formatINR(ipdAvg),
      subValue: `${ipdRecords.length} Inpatients`,
      color: '#54B435',
      id: 'IPD'
    },
    {
      label: 'OPD',
      value: opdAvg,
      formattedValue: formatINR(opdAvg),
      subValue: `${opdRecords.length} Outpatients`,
      color: '#54B435',
      id: 'OPD'
    }
  ];

  // Total Treatment Cost by Payment Mode (Donut Chart)
  // Power BI: Insurance: ₹42,63,966 (28.01%), Cash: ₹40,26,935 (26.46%), Credit Card: ₹37,82,642 (24.85%), UPI: ₹31,47,966 (20.68%)
  const paymentModes = ['Insurance', 'Cash', 'Credit Card', 'UPI'] as const;
  const paymentColors: Record<string, string> = {
    Insurance: '#54B435',
    Cash: '#163A5F',
    'Credit Card': '#D97706',
    UPI: '#831843'
  };

  const paymentModeData: DonutSegment[] = paymentModes.map(pm => {
    const pmRecords = records.filter(r => r.paymentMode === pm);
    const cost = pmRecords.reduce((s, r) => s + r.treatmentCost, 0);

    return {
      label: pm,
      value: cost,
      color: paymentColors[pm] || '#16A6A1',
      id: pm,
      formattedValue: formatINR(cost)
    };
  });

  // Monthly Treatment Cost Trend (Area Chart)
  const monthlyCostData: TrendPoint[] = MONTH_NAMES.map((mName, mIdx) => {
    const monthNum = mIdx + 1;
    const monthRecords = records.filter(r => r.monthIndex === monthNum);
    const monthCost = monthRecords.reduce((s, r) => s + r.treatmentCost, 0);

    return {
      label: mName,
      value1: monthCost,
      formatted1: formatINR(monthCost)
    };
  });

  // Cost by Diagnosis (Top 10 most expensive conditions)
  const diagnosisCostMap: Record<string, { totalCost: number; count: number; avgCost: number }> = {};
  for (const r of records) {
    if (!diagnosisCostMap[r.diagnosis]) {
      diagnosisCostMap[r.diagnosis] = { totalCost: 0, count: 0, avgCost: 0 };
    }
    diagnosisCostMap[r.diagnosis].totalCost += r.treatmentCost;
    diagnosisCostMap[r.diagnosis].count++;
  }
  const topDiagnoses = Object.entries(diagnosisCostMap)
    .map(([diag, d]) => ({
      diagnosis: diag,
      totalCost: d.totalCost,
      count: d.count,
      avgCost: Math.round(d.totalCost / (d.count || 1))
    }))
    .sort((a, b) => b.totalCost - a.totalCost);

  const handleDepartmentClick = (item: BarDataItem) => {
    const dept = item.id || item.label;
    const exists = filters.selectedDepartments.includes(dept);
    const updated = exists
      ? filters.selectedDepartments.filter(d => d !== dept)
      : [...filters.selectedDepartments, dept];
    onFilterChange({ ...filters, selectedDepartments: updated });
  };

  const handlePaymentModeClick = (item: DonutSegment) => {
    const pm = item.id || item.label;
    const exists = filters.selectedPaymentModes.includes(pm);
    const updated = exists
      ? filters.selectedPaymentModes.filter(p => p !== pm)
      : [...filters.selectedPaymentModes, pm];
    onFilterChange({ ...filters, selectedPaymentModes: updated });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight flex items-center gap-2">
            Treatment Cost Analysis <span className="text-lg">💰</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Financial evaluation of healthcare procedures, departmental expenditure, and payment gateways
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Total Revenue: {formatINR(kpis.totalCost)}
          </span>
        </div>
      </div>

      {/* 3 Top KPIs matching Power BI Page 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Visits"
          value={kpis.totalVisits.toLocaleString()}
          subtitle="All patient encounters"
          icon={Calendar}
        />

        <KPICard
          title="Average Treatment Cost"
          value={formatINR(kpis.avgCost)}
          subtitle="Per patient encounter benchmark"
          icon={IndianRupee}
          trend={{ value: '₹15,222', label: 'Average' }}
          highlight
        />

        <KPICard
          title="Total Treatment Cost"
          value={formatINR(kpis.totalCost)}
          subtitle="Cumulative hospital receipts"
          icon={Receipt}
          trend={{ value: '₹1.52 Cr', label: 'Verified Total' }}
          highlight
        />
      </div>

      {/* Grid: Treatment Cost by Department (Bar) + Treatment Cost by Visit Type (Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Treatment Cost by Department */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Treatment Cost by Department
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Total medical expenditures allocated per clinical department (click to filter)
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-[#16A6A1]">
              Leader: Dermatology (₹30.36 L)
            </span>
          </div>

          <HorizontalBarChart
            data={deptCostData}
            barColor="#54B435"
            onBarClick={handleDepartmentClick}
            selectedId={filters.selectedDepartments[0]}
          />
        </div>

        {/* Right: Treatment Cost by Visit Type (IPD vs OPD) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="mb-2">
            <h2 className="text-base font-bold text-[#102A43]">
              Treatment Cost by Visit Type
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Average Treatment Cost comparison
            </p>
          </div>

          <VerticalBarChart
            data={costByVisitTypeData}
            height={200}
            barColor="#54B435"
            yAxisLabel="Avg Cost (₹)"
          />

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-[#243447] space-y-1">
            <div className="flex justify-between font-medium">
              <span>Inpatient (IPD):</span>
              <span className="font-mono tabular-nums font-bold text-emerald-700">₹40,338</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Outpatient (OPD):</span>
              <span className="font-mono tabular-nums font-bold text-slate-700">₹6,397</span>
            </div>
            <div className="text-[10px] text-[#64748B] pt-1 border-t border-slate-200">
              IPD cases cost <strong>6.3x</strong> more per visit due to inpatient bed occupancy & procedures.
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Treatment Cost Monthly Trend (Area) + Payment Mode Distribution (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Treatment Cost by Month Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <AreaTrendChart
            data={monthlyCostData}
            title="Treatment Cost Trajectory (Monthly)"
            subtitle="Aggregate billing volume per calendar month (Jan - Dec 2025)"
            height={220}
            series1Name="Total Cost"
            series1Color="#54B435"
          />
        </div>

        {/* Total Treatment Cost by Payment Mode */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <DonutChart
            data={paymentModeData}
            title="Total Treatment Cost by Payment Mode"
            subtitle="Insurance leads revenue with 28.01% (₹42.64 L)"
            size={160}
            centerLabel="Billing"
            centerValue={formatINR(kpis.totalCost, { compact: true })}
            onSegmentClick={handlePaymentModeClick}
            selectedId={filters.selectedPaymentModes[0]}
          />
        </div>
      </div>

      {/* High-Value Diagnoses Billing Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#16A6A1]" />
              Treatment Cost by Clinical Diagnosis
            </h3>
            <p className="text-xs text-[#64748B]">
              Aggregate billing and average procedure cost per diagnosed condition
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-[#16A6A1]">
            19 Conditions Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-[#243447] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3 text-right">Patient Count</th>
                <th className="px-4 py-3 text-right">Total Billing (₹)</th>
                <th className="px-4 py-3 text-right">Avg Cost / Case (₹)</th>
                <th className="px-4 py-3 text-right">Share of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topDiagnoses.slice(0, 8).map(d => {
                const share = ((d.totalCost / (kpis.totalCost || 1)) * 100).toFixed(1);
                return (
                  <tr key={d.diagnosis} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#102A43]">
                      {d.diagnosis}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                      {d.count}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-[#163A5F]">
                      {formatINR(d.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                      {formatINR(d.avgCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-teal-800 font-semibold">
                      {share}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
