import React, { useState, useMemo } from 'react';
import {
  Users,
  BedDouble,
  Calendar,
  Stethoscope,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { PatientRecord, FilterState } from '../types/healthcare';
import { computeKPIs, formatINR, AGE_GROUPS } from '../data/healthcareData';
import { KPICard } from '../components/common/KPICard';
import { HorizontalBarChart, BarDataItem } from '../components/charts/HorizontalBarChart';
import { VerticalBarChart, ColumnDataItem } from '../components/charts/VerticalBarChart';
import { DonutChart, DonutSegment } from '../components/charts/DonutChart';
import { AgeHistogramChart } from '../components/charts/AgeHistogramChart';

interface PatientAnalyticsPageProps {
  records: PatientRecord[];
  allRecords: PatientRecord[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onExportCSV: () => void;
}

export const PatientAnalyticsPage: React.FC<PatientAnalyticsPageProps> = ({
  records,
  allRecords: _allRecords,
  filters,
  onFilterChange,
  onExportCSV
}) => {
  const [maskPrivacy, setMaskPrivacy] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const [sortField, setSortField] = useState<keyof PatientRecord>('patientId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAgeRange, setSelectedAgeRange] = useState<[number, number] | null>(null);

  const kpis = computeKPIs(records);

  const handleSelectAgeRange = (minAge: number, maxAge: number) => {
    if (selectedAgeRange && selectedAgeRange[0] === minAge && selectedAgeRange[1] === maxAge) {
      setSelectedAgeRange(null);
    } else {
      setSelectedAgeRange([minAge, maxAge]);
      setCurrentPage(1);
    }
  };

  // Filter records specifically for the table if an age bin is clicked
  const tableSourceRecords = useMemo(() => {
    if (!selectedAgeRange) return records;
    return records.filter(r => r.age >= selectedAgeRange[0] && r.age <= selectedAgeRange[1]);
  }, [records, selectedAgeRange]);

  // Diagnosis distribution
  const diagnosisCounts: Record<string, number> = {};
  for (const r of records) {
    diagnosisCounts[r.diagnosis] = (diagnosisCounts[r.diagnosis] || 0) + 1;
  }
  const diagnosisBarData: BarDataItem[] = Object.entries(diagnosisCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([diag, count]) => ({
      label: diag,
      value: count,
      id: diag,
      formattedValue: `${count}`,
      secondaryLabel: `${((count / (records.length || 1)) * 100).toFixed(1)}%`,
      color: filters.selectedDiagnosis === diag ? '#16A6A1' : '#54B435'
    }));

  // Age Group Column Data (in Power BI order: 66+, 0-18, 51-65, 19-35, 36-50)
  const ageGroupOrder: ('66+' | '0-18' | '51-65' | '19-35' | '36-50')[] = ['66+', '0-18', '51-65', '19-35', '36-50'];
  const ageGroupCounts: Record<string, number> = {};
  for (const ag of AGE_GROUPS) ageGroupCounts[ag] = 0;
  for (const r of records) {
    ageGroupCounts[r.ageGroup] = (ageGroupCounts[r.ageGroup] || 0) + 1;
  }
  const ageGroupColumnData: ColumnDataItem[] = ageGroupOrder.map(ag => ({
    label: ag,
    value: ageGroupCounts[ag] || 0,
    formattedValue: (ageGroupCounts[ag] || 0).toLocaleString(),
    subValue: `${(((ageGroupCounts[ag] || 0) / (records.length || 1)) * 100).toFixed(1)}%`,
    id: ag,
    color: filters.selectedAgeGroups.includes(ag) ? '#16A6A1' : '#54B435'
  }));

  // Admission Status Donut (Not Admitted vs Admitted)
  const notAdmittedCount = records.filter(r => r.admissionStatus === 'Not Admitted').length;
  const admittedCount = records.filter(r => r.admissionStatus === 'Admitted').length;
  const admissionDonutData: DonutSegment[] = [
    {
      label: 'Not Admitted',
      value: notAdmittedCount,
      color: '#54B435',
      id: 'Not Admitted',
      formattedValue: `${notAdmittedCount} (${((notAdmittedCount / (records.length || 1)) * 100).toFixed(1)}%)`
    },
    {
      label: 'Admitted',
      value: admittedCount,
      color: '#163A5F',
      id: 'Admitted',
      formattedValue: `${admittedCount} (${((admittedCount / (records.length || 1)) * 100).toFixed(1)}%)`
    }
  ];

  // Sorting and Pagination for Patient Table
  const sortedRecords = useMemo(() => {
    return [...tableSourceRecords].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [tableSourceRecords, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRecords.slice(start, start + rowsPerPage);
  }, [sortedRecords, currentPage, rowsPerPage]);

  const handleSort = (field: keyof PatientRecord) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDiagnosisClick = (item: BarDataItem) => {
    const isSame = filters.selectedDiagnosis === item.id;
    onFilterChange({ ...filters, selectedDiagnosis: isSame ? '' : (item.id || item.label) });
  };

  const handleAgeGroupClick = (item: ColumnDataItem) => {
    const exists = filters.selectedAgeGroups.includes(item.id || item.label);
    const updated = exists
      ? filters.selectedAgeGroups.filter(ag => ag !== (item.id || item.label))
      : [...filters.selectedAgeGroups, item.id || item.label];
    onFilterChange({ ...filters, selectedAgeGroups: updated });
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight uppercase">
            Patient & Department Analysis
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Detailed clinical diagnosis frequency, age demographic distribution, and admission rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <button
            onClick={() => setMaskPrivacy(!maskPrivacy)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Mask Patient IDs for HIPAA / Clinical presentation compliance"
          >
            {maskPrivacy ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
            <span>{maskPrivacy ? 'Masked (Privacy Mode)' : 'Patient ID Visible'}</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#163A5F] hover:bg-[#102A43] rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Table</span>
          </button>
        </div>
      </div>

      {/* 3 Top KPIs matching Power BI Page 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Patients"
          value={kpis.totalPatients.toLocaleString()}
          subtitle="Filtered clinical records"
          icon={Users}
          highlight
        />

        <KPICard
          title="Total Admissions"
          value={kpis.totalAdmissions.toLocaleString()}
          subtitle={`${kpis.admissionRate}% admission rate`}
          icon={BedDouble}
          trend={{ value: '287', label: 'Expected Benchmark' }}
        />

        <KPICard
          title="Average Patient Age"
          value={`${kpis.avgAge} Years`}
          subtitle="Bimodal distribution (pediatric & geriatric)"
          icon={Calendar}
          trend={{ value: '44 yrs', label: 'Mean Age' }}
          highlight
        />
      </div>

      {/* Main Grid: Diagnosis Frequency (Left) + Age Group & Admission Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Diagnosis Frequency Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Diagnosis Breakdown
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Distribution across 19 tracked clinical diagnoses (click to filter)
              </p>
            </div>
            {filters.selectedDiagnosis && (
              <button
                onClick={() => onFilterChange({ ...filters, selectedDiagnosis: '' })}
                className="text-xs text-amber-600 hover:underline flex items-center gap-1 font-medium"
              >
                Clear: {filters.selectedDiagnosis}
              </button>
            )}
          </div>

          <div className="max-h-[520px] overflow-y-auto pr-1">
            <HorizontalBarChart
              data={diagnosisBarData}
              barColor="#54B435"
              onBarClick={handleDiagnosisClick}
              selectedId={filters.selectedDiagnosis}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
            <span>Top Condition: <strong>Fever (95 patients)</strong></span>
            <span>Second: <strong>Infection (87 patients)</strong></span>
          </div>
        </div>

        {/* Right: Age Group Columns + Admission Status Donut */}
        <div className="lg:col-span-5 space-y-6">
          {/* Age Group Column Chart */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-[#102A43]">
                  Age Group Distribution
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  High concentration in elderly (66+) and pediatric (0-18)
                </p>
              </div>
            </div>

            <VerticalBarChart
              data={ageGroupColumnData}
              height={200}
              barColor="#54B435"
              onBarClick={handleAgeGroupClick}
              selectedId={filters.selectedAgeGroups[0]}
              yAxisLabel="Patients"
            />
          </div>

          {/* Admission Status Donut Chart */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
            <DonutChart
              data={admissionDonutData}
              title="Admission Status Ratio"
              subtitle="71.3% Not Admitted (OPD/Discharged) vs 28.7% Admitted"
              size={150}
              centerLabel="Admissions"
              centerValue={`${kpis.admissionRate}%`}
            />
          </div>
        </div>
      </div>

      {/* New Interactive Age Distribution Histogram Component */}
      <AgeHistogramChart
        records={records}
        onSelectAgeRange={handleSelectAgeRange}
        selectedAgeRange={selectedAgeRange}
      />

      {/* Patient Records Data Grid */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#16A6A1]" />
                Detailed Patient Clinical Registry
              </h3>
              {selectedAgeRange && (
                <button
                  onClick={() => setSelectedAgeRange(null)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-teal-800 bg-teal-100 hover:bg-teal-200 transition-colors"
                  title="Click to clear age filter"
                >
                  <span>Age {selectedAgeRange[0]}–{selectedAgeRange[1]} yrs ({tableSourceRecords.length})</span>
                  <span className="font-bold">&times;</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              Showing {paginatedRecords.length} of {sortedRecords.length} filtered patient records
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B]">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={e => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-[#243447] font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('patientId')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Patient ID {sortField === 'patientId' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('age')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Age {sortField === 'age' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('gender')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Gender {sortField === 'gender' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Department {sortField === 'department' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('diagnosis')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Diagnosis {sortField === 'diagnosis' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('doctor')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Attending Doctor {sortField === 'doctor' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('visitType')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Visit Type
                </th>
                <th
                  onClick={() => handleSort('admissionStatus')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Admission
                </th>
                <th
                  onClick={() => handleSort('lengthOfStay')}
                  className="px-3 py-3 text-right cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Stay (Days)
                </th>
                <th
                  onClick={() => handleSort('treatmentCost')}
                  className="px-3.5 py-3 text-right cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Treatment Cost
                </th>
                <th
                  onClick={() => handleSort('paymentMode')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Payment
                </th>
                <th
                  onClick={() => handleSort('visitDate')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Visit Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r, idx) => {
                  const displayId = maskPrivacy ? `P0***${r.patientId.slice(-2)}` : r.patientId;
                  const isAdmitted = r.admissionStatus === 'Admitted';

                  return (
                    <tr
                      key={`${r.patientId}-${idx}`}
                      className="hover:bg-teal-50/40 transition-colors group"
                    >
                      <td className="px-3.5 py-2.5 font-mono font-medium text-[#102A43]">
                        {displayId}
                      </td>
                      <td className="px-3 py-2.5 font-mono tabular-nums text-slate-700">
                        {r.age}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {r.gender}
                      </td>
                      <td className="px-3.5 py-2.5 font-medium text-[#243447]">
                        {r.department}
                      </td>
                      <td className="px-3.5 py-2.5 font-semibold text-[#163A5F]">
                        {r.diagnosis}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-700">
                        {r.doctor}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[11px] font-mono font-medium ${
                          r.visitType === 'IPD' ? 'text-indigo-700 font-bold' : 'text-slate-600'
                        }`}>
                          {r.visitType}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[11px] font-medium flex items-center gap-1 ${
                          isAdmitted ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                        }`}>
                          {isAdmitted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {r.admissionStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums font-medium text-slate-700">
                        {r.lengthOfStay}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono tabular-nums font-bold text-[#102A43]">
                        {formatINR(r.treatmentCost)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {r.paymentMode}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                        {r.visitDateDisplay}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-slate-500">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No patient records match the selected filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the department, admission status, or date range.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] bg-slate-50/60">
          <div>
            Showing <span className="font-mono font-semibold text-[#102A43]">
              {sortedRecords.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
            </span> to <span className="font-mono font-semibold text-[#102A43]">
              {Math.min(currentPage * rowsPerPage, sortedRecords.length)}
            </span> of <span className="font-mono font-semibold text-[#102A43]">{sortedRecords.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
