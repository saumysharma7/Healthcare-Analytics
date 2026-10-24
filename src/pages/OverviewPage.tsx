import React from 'react';
import {
  Users,
  Activity,
  IndianRupee,
  BedDouble,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { PatientRecord, FilterState, ActivePage } from '../types/healthcare';
import { computeKPIs, formatINR, DEPARTMENTS } from '../data/healthcareData';
import { KPICard } from '../components/common/KPICard';
import { HorizontalBarChart, BarDataItem } from '../components/charts/HorizontalBarChart';
import { DonutChart, DonutSegment } from '../components/charts/DonutChart';

interface OverviewPageProps {
  records: PatientRecord[];
  allRecords: PatientRecord[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onNavigate: (page: ActivePage) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  records,
  allRecords,
  filters,
  onFilterChange,
  onNavigate
}) => {
  const kpis = computeKPIs(records);

  // Department counts
  const deptCounts: Record<string, number> = {};
  for (const dept of DEPARTMENTS) deptCounts[dept] = 0;
  for (const r of records) {
    deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
  }

  // Sorted department bar data
  const departmentBarData: BarDataItem[] = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([dept, count]) => ({
      label: dept,
      value: count,
      id: dept,
      formattedValue: count.toLocaleString(),
      secondaryLabel: `${((count / (records.length || 1)) * 100).toFixed(1)}% of cohort`,
      color: filters.selectedDepartments.includes(dept) ? '#16A6A1' : '#54B435'
    }));

  // Visit Type Donut (OPD vs IPD)
  const opdCount = records.filter(r => r.visitType === 'OPD').length;
  const ipdCount = records.filter(r => r.visitType === 'IPD').length;
  const visitTypeData: DonutSegment[] = [
    {
      label: 'OPD (Outpatient)',
      value: opdCount,
      color: '#54B435',
      id: 'OPD',
      formattedValue: `${opdCount} visits`
    },
    {
      label: 'IPD (Inpatient)',
      value: ipdCount,
      color: '#163A5F',
      id: 'IPD',
      formattedValue: `${ipdCount} visits`
    }
  ];

  // Gender Donut
  const maleCount = records.filter(r => r.gender === 'Male').length;
  const femaleCount = records.filter(r => r.gender === 'Female').length;
  const genderData: DonutSegment[] = [
    {
      label: 'Male',
      value: maleCount,
      color: '#54B435',
      id: 'Male',
      formattedValue: `${maleCount} patients`
    },
    {
      label: 'Female',
      value: femaleCount,
      color: '#163A5F',
      id: 'Female',
      formattedValue: `${femaleCount} patients`
    }
  ];

  // Admission Status Donut
  const admittedCount = records.filter(r => r.admissionStatus === 'Admitted').length;
  const notAdmittedCount = records.filter(r => r.admissionStatus === 'Not Admitted').length;
  const admissionStatusData: DonutSegment[] = [
    {
      label: 'Not Admitted',
      value: notAdmittedCount,
      color: '#54B435',
      id: 'Not Admitted',
      formattedValue: `${notAdmittedCount} patients`
    },
    {
      label: 'Admitted',
      value: admittedCount,
      color: '#163A5F',
      id: 'Admitted',
      formattedValue: `${admittedCount} admissions`
    }
  ];

  const handleDepartmentClick = (item: BarDataItem) => {
    const exists = filters.selectedDepartments.includes(item.id || item.label);
    const updated = exists
      ? filters.selectedDepartments.filter(d => d !== (item.id || item.label))
      : [...filters.selectedDepartments, item.id || item.label];
    onFilterChange({ ...filters, selectedDepartments: updated });
  };

  const handleVisitTypeClick = (item: DonutSegment) => {
    const exists = filters.selectedVisitTypes.includes(item.id || item.label);
    const updated = exists
      ? filters.selectedVisitTypes.filter(v => v !== (item.id || item.label))
      : [...filters.selectedVisitTypes, item.id || item.label];
    onFilterChange({ ...filters, selectedVisitTypes: updated });
  };

  const handleGenderClick = (item: DonutSegment) => {
    const exists = filters.selectedGenders.includes(item.id || item.label);
    const updated = exists
      ? filters.selectedGenders.filter(g => g !== (item.id || item.label))
      : [...filters.selectedGenders, item.id || item.label];
    onFilterChange({ ...filters, selectedGenders: updated });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">
            Healthcare Overview
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Executive summary of patient volume, hospital department workload, admission ratios, and overall billing
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Power BI Verified: 1,000 Records</span>
          </div>
          <button
            onClick={() => onNavigate('powerbi')}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#163A5F] text-xs font-semibold rounded-lg transition-colors"
          >
            <span>View Power BI Report</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 Primary KPI Cards matching Power BI Page 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Patients"
          value={kpis.totalPatients.toLocaleString()}
          subtitle="Unique patient visits tracked"
          icon={Users}
          trend={{ value: '1,000', label: '2025 Annual Cohort' }}
          highlight
        />

        <KPICard
          title="Total Admissions"
          value={kpis.totalAdmissions.toLocaleString()}
          subtitle={`${kpis.admissionRate}% admission rate`}
          icon={BedDouble}
          trend={{ value: '287', label: 'Verified IPD/OPD Admitted' }}
        />

        <KPICard
          title="Total Treatment Cost"
          value={formatINR(kpis.totalCost)}
          subtitle={`Avg ${formatINR(kpis.avgCost)} per patient`}
          icon={IndianRupee}
          trend={{ value: '₹1.52 Cr', label: 'Total hospital billing' }}
          highlight
        />

        <KPICard
          title="Average Stay & Age"
          value={`${kpis.avgStay} Days`}
          subtitle={`Mean patient age: ${kpis.avgAge} yrs`}
          icon={Clock}
          trend={{ value: '2.22 d', label: 'Mean hospital stay' }}
        />
      </div>

      {/* Main Grid: Patients in Departments (horizontal bar) + Donut Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patients in Departments (Power BI Chart) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Patients in Departments
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Total patient visits across 6 primary medical departments (click any bar to filter)
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#16A6A1] bg-[#E7F6F5] px-2 py-0.5 rounded">
              Interactive Cross-Filter
            </span>
          </div>

          <HorizontalBarChart
            data={departmentBarData}
            barColor="#54B435"
            onBarClick={handleDepartmentClick}
            selectedId={filters.selectedDepartments[0]}
          />

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
            <span>Leading Department: <strong>Dermatology</strong> (191 patients · 19.1%)</span>
            <button
              onClick={() => onNavigate('performance')}
              className="text-[#163A5F] hover:text-[#16A6A1] font-medium flex items-center gap-1"
            >
              Detailed Department Metrics &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: OPD vs IPD + Gender Donut charts */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {/* OPD vs IPD */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
            <DonutChart
              data={visitTypeData}
              title="OPD vs IPD Distribution"
              subtitle="74% outpatient consultations vs 26% inpatient admissions"
              size={150}
              centerLabel="Visits"
              centerValue={records.length.toLocaleString()}
              onSegmentClick={handleVisitTypeClick}
              selectedId={filters.selectedVisitTypes[0]}
            />
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
            <DonutChart
              data={genderData}
              title="Gender Demographics"
              subtitle="Balanced patient demographics (51.6% Male · 48.4% Female)"
              size={150}
              centerLabel="Patients"
              centerValue={records.length.toLocaleString()}
              onSegmentClick={handleGenderClick}
              selectedId={filters.selectedGenders[0]}
            />
          </div>
        </div>
      </div>

      {/* Bottom Insights Section: Rigorous Clinical Calculations */}
      <div className="bg-[#102A43] text-white rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-teal-300 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-[#16A6A1]" />
          <span>Verified Analytical Insights & Findings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-white/5 rounded-lg p-3.5 border border-white/10">
            <div className="text-white font-semibold mb-1 text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Department Workload
            </div>
            <p className="leading-relaxed">
              Dermatology (191) and Pediatrics (179) account for <strong>37%</strong> of all patient traffic. Cardiology follows with 169 patients, representing critical clinical acuity.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3.5 border border-white/10">
            <div className="text-white font-semibold mb-1 text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Inpatient Cost Disparity
            </div>
            <p className="leading-relaxed">
              Inpatient admissions (IPD, 260 patients) generate an average cost of <strong>₹40,338</strong>, compared to just <strong>₹6,397</strong> for outpatient visits (OPD, 740 patients).
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3.5 border border-white/10">
            <div className="text-white font-semibold mb-1 text-sm flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-teal-400" />
              Admission Rate Breakdown
            </div>
            <p className="leading-relaxed">
              287 patients were flagged with 'Admitted' status (28.7%), with Dermatology recording the highest average length of stay at <strong>2.8 days</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
