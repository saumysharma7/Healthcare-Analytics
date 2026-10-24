import React from 'react';
import {
  Building2,
  Clock,
  IndianRupee,
  BedDouble,
  UserCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { PatientRecord, FilterState } from '../types/healthcare';
import { computeKPIs, formatINR, DEPARTMENTS, MONTH_NAMES } from '../data/healthcareData';
import { KPICard } from '../components/common/KPICard';
import { HorizontalBarChart, BarDataItem } from '../components/charts/HorizontalBarChart';
import { VerticalBarChart, ColumnDataItem } from '../components/charts/VerticalBarChart';
import { AreaTrendChart, TrendPoint } from '../components/charts/AreaTrendChart';

interface HospitalPerformancePageProps {
  records: PatientRecord[];
  allRecords: PatientRecord[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const HospitalPerformancePage: React.FC<HospitalPerformancePageProps> = ({
  records,
  allRecords: _allRecords,
  filters,
  onFilterChange
}) => {
  const kpis = computeKPIs(records);

  // Average Stay by Department (Column Chart)
  // Power BI Screenshot order: Dermatology 2.8, General Medicine 2.4, Cardiology 2.3, Neurology 2.2, Pediatrics 1.8, Orthopedics 1.8
  const stayByDeptData: ColumnDataItem[] = DEPARTMENTS.map(dept => {
    const deptRecords = records.filter(r => r.department === dept);
    const totalStay = deptRecords.reduce((sum, r) => sum + r.lengthOfStay, 0);
    const avgStay = deptRecords.length > 0 ? Number((totalStay / deptRecords.length).toFixed(1)) : 0;

    return {
      label: dept,
      value: avgStay,
      formattedValue: `${avgStay} d`,
      subValue: `${deptRecords.length} pts`,
      id: dept,
      color: filters.selectedDepartments.includes(dept) ? '#16A6A1' : '#54B435'
    };
  }).sort((a, b) => b.value - a.value);

  // Treatment Cost by Department (Horizontal Bar Chart)
  // Power BI Screenshot: Dermatology ₹30,35,568, Cardiology ₹25,96,672, Pediatrics ₹25,08,516, General Medicine ₹24,80,572, Neurology ₹24,58,152, Orthopedics ₹21,42,029
  const costByDeptData: BarDataItem[] = DEPARTMENTS.map(dept => {
    const deptRecords = records.filter(r => r.department === dept);
    const totalCost = deptRecords.reduce((sum, r) => sum + r.treatmentCost, 0);

    return {
      label: dept,
      value: totalCost,
      id: dept,
      formattedValue: formatINR(totalCost),
      secondaryLabel: `Avg: ${deptRecords.length > 0 ? formatINR(Math.round(totalCost / deptRecords.length)) : '₹0'} / patient`,
      color: filters.selectedDepartments.includes(dept) ? '#16A6A1' : '#54B435'
    };
  }).sort((a, b) => b.value - a.value);

  // Top Doctor's Patient Count (Horizontal Bar Chart)
  // Power BI Screenshot: Dr. Shah: 68, Dr. Singh: 65, Dr. Sharma: 59, Dr. Pawar: 56, Dr. Rao: 56, Dr. Verma: 41...
  const doctorCounts: Record<string, { count: number; totalCost: number; totalStay: number; primaryDept: Record<string, number> }> = {};
  for (const r of records) {
    if (!doctorCounts[r.doctor]) {
      doctorCounts[r.doctor] = { count: 0, totalCost: 0, totalStay: 0, primaryDept: {} };
    }
    doctorCounts[r.doctor].count++;
    doctorCounts[r.doctor].totalCost += r.treatmentCost;
    doctorCounts[r.doctor].totalStay += r.lengthOfStay;
    doctorCounts[r.doctor].primaryDept[r.department] = (doctorCounts[r.doctor].primaryDept[r.department] || 0) + 1;
  }

  const doctorBarData: BarDataItem[] = Object.entries(doctorCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([doc, stats]) => {
      // Find top department for doctor
      const topDept = Object.entries(stats.primaryDept).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      return {
        label: doc,
        value: stats.count,
        id: doc,
        formattedValue: `${stats.count} pts`,
        secondaryLabel: `${topDept} · Avg ${formatINR(Math.round(stats.totalCost / (stats.count || 1)))}`,
        color: filters.selectedDoctor === doc ? '#16A6A1' : '#54B435'
      };
    });

  // Total Admissions by Month (Area Trend Chart)
  const monthlyTrendData: TrendPoint[] = MONTH_NAMES.map((mName, mIdx) => {
    const monthNum = mIdx + 1;
    const monthRecords = records.filter(r => r.monthIndex === monthNum);
    const totalPts = monthRecords.length;
    const totalAdmit = monthRecords.filter(r => r.admissionStatus === 'Admitted').length;

    return {
      label: mName,
      value1: totalPts,
      value2: totalAdmit,
      formatted1: `${totalPts} patients`,
      formatted2: `${totalAdmit} admitted`
    };
  });

  const handleDepartmentClick = (item: BarDataItem | ColumnDataItem) => {
    const dept = item.id || item.label;
    const exists = filters.selectedDepartments.includes(dept);
    const updated = exists
      ? filters.selectedDepartments.filter(d => d !== dept)
      : [...filters.selectedDepartments, dept];
    onFilterChange({ ...filters, selectedDepartments: updated });
  };

  const handleDoctorClick = (item: BarDataItem) => {
    const isSame = filters.selectedDoctor === item.id;
    onFilterChange({ ...filters, selectedDoctor: isSame ? '' : (item.id || item.label) });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight flex items-center gap-2">
            Hospital Performance <span className="text-lg">🏥</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor departmental efficiency, doctor workload, patient stay and treatment costs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filters.selectedDoctor && (
            <button
              onClick={() => onFilterChange({ ...filters, selectedDoctor: '' })}
              className="px-2.5 py-1 text-xs text-amber-700 bg-amber-50 rounded-lg border border-amber-200 font-medium"
            >
              Filter: {filters.selectedDoctor} (Clear)
            </button>
          )}
        </div>
      </div>

      {/* 3 Top KPIs matching Power BI Page 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Admissions"
          value={kpis.totalAdmissions.toLocaleString()}
          subtitle="Hospitalized IPD & admitted OPD"
          icon={BedDouble}
          trend={{ value: '287', label: 'Verified admissions' }}
        />

        <KPICard
          title="Average Treatment Cost"
          value={formatINR(kpis.avgCost)}
          subtitle="Cohort average billing per case"
          icon={IndianRupee}
          trend={{ value: '₹15,222', label: 'Benchmark' }}
          highlight
        />

        <KPICard
          title="Average Length of Stay"
          value={`${kpis.avgStay} Days`}
          subtitle="Inpatient bed occupancy metric"
          icon={Clock}
          trend={{ value: '2.22 d', label: 'Mean stay' }}
          highlight
        />
      </div>

      {/* Grid: Stay by Department (Column) + Treatment Cost by Department (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stay by Department */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Stay by Department (Days)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Average hospital bed length of stay per department (click to filter)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#16A6A1]">
              Mean: 2.22 d
            </span>
          </div>

          <VerticalBarChart
            data={stayByDeptData}
            height={210}
            barColor="#54B435"
            onBarClick={handleDepartmentClick}
            selectedId={filters.selectedDepartments[0]}
            yAxisLabel="Days"
          />

          <div className="mt-3 pt-2 text-[11px] text-[#64748B] flex items-center justify-between border-t border-slate-100">
            <span>Highest: <strong>Dermatology (2.8 days)</strong></span>
            <span>Lowest: <strong>Pediatrics / Orthopedics (1.8 days)</strong></span>
          </div>
        </div>

        {/* Treatment Cost by Department */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Treatment Cost by Department
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Total aggregate expenditure by department (click to filter)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#102A43]">
              Total: ₹1.52 Cr
            </span>
          </div>

          <HorizontalBarChart
            data={costByDeptData}
            barColor="#54B435"
            onBarClick={handleDepartmentClick}
            selectedId={filters.selectedDepartments[0]}
          />
        </div>
      </div>

      {/* Middle Grid: Total Admissions by Month (Area) + Doctor Workload (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Total Admissions by Month (Area Chart) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <AreaTrendChart
            data={monthlyTrendData}
            title="Total Admissions by Month"
            subtitle="Comparing monthly patient visits vs admitted patient volumes"
            height={220}
            series1Name="Total Patients"
            series2Name="Total Admissions"
            series1Color="#54B435"
            series2Color="#163A5F"
            showDualSeries
          />
        </div>

        {/* Doctor's Workload Horizontal Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Doctor's Patient Volume
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Top attending physicians by patient consultations
              </p>
            </div>
            <span className="text-xs font-medium text-[#16A6A1]">
              18 Doctors
            </span>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-1">
            <HorizontalBarChart
              data={doctorBarData}
              maxBars={8}
              barColor="#54B435"
              onBarClick={handleDoctorClick}
              selectedId={filters.selectedDoctor}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-[11px] text-[#64748B]">
              Top: Dr. Shah (68), Dr. Singh (65), Dr. Sharma (59)
            </span>
          </div>
        </div>
      </div>

      {/* Department Operational Efficiency Scorecard Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#16A6A1]" />
            Departmental Operational Efficiency Scorecard
          </h3>
          <span className="text-xs text-[#64748B] font-mono">
            6 Specialized Departments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-[#243447] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Total Patients</th>
                <th className="px-4 py-3 text-right">Admissions</th>
                <th className="px-4 py-3 text-right">Admission Rate</th>
                <th className="px-4 py-3 text-right">Avg Stay</th>
                <th className="px-4 py-3 text-right">Total Billing</th>
                <th className="px-4 py-3 text-right">Avg Cost / Pt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEPARTMENTS.map(dept => {
                const deptRecords = records.filter(r => r.department === dept);
                const count = deptRecords.length;
                const admits = deptRecords.filter(r => r.admissionStatus === 'Admitted').length;
                const rate = count > 0 ? ((admits / count) * 100).toFixed(1) : '0';
                const totalCost = deptRecords.reduce((s, r) => s + r.treatmentCost, 0);
                const avgCost = count > 0 ? Math.round(totalCost / count) : 0;
                const totalStay = deptRecords.reduce((s, r) => s + r.lengthOfStay, 0);
                const avgStay = count > 0 ? (totalStay / count).toFixed(2) : '0';

                return (
                  <tr
                    key={dept}
                    onClick={() => {
                      const exists = filters.selectedDepartments.includes(dept);
                      onFilterChange({
                        ...filters,
                        selectedDepartments: exists
                          ? filters.selectedDepartments.filter(d => d !== dept)
                          : [dept]
                      });
                    }}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-[#102A43] flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#16A6A1]" />
                      {dept}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-medium text-slate-800">
                      {count}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                      {admits}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-teal-800 font-semibold">
                      {rate}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 font-semibold">
                      {avgStay} d
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-[#102A43]">
                      {formatINR(totalCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      {formatINR(avgCost)}
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
