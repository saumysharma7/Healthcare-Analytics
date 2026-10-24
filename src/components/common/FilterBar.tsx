import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FilterState } from '../../types/healthcare';
import {
  DEPARTMENTS,
  ADMISSION_STATUSES,
  VISIT_TYPES,
  PAYMENT_MODES,
  INITIAL_FILTERS
} from '../../data/healthcareData';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  filteredCount,
  totalCount
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const toggleDepartment = (dept: string) => {
    const exists = filters.selectedDepartments.includes(dept);
    const updated = exists
      ? filters.selectedDepartments.filter(d => d !== dept)
      : [...filters.selectedDepartments, dept];
    onFilterChange({ ...filters, selectedDepartments: updated });
  };

  const toggleAdmissionStatus = (status: string) => {
    const exists = filters.selectedAdmissionStatuses.includes(status);
    const updated = exists
      ? filters.selectedAdmissionStatuses.filter(s => s !== status)
      : [...filters.selectedAdmissionStatuses, status];
    onFilterChange({ ...filters, selectedAdmissionStatuses: updated });
  };

  const toggleGender = (gender: 'Male' | 'Female') => {
    const exists = filters.selectedGenders.includes(gender);
    const updated = exists
      ? filters.selectedGenders.filter(g => g !== gender)
      : [...filters.selectedGenders, gender];
    onFilterChange({ ...filters, selectedGenders: updated });
  };

  const toggleVisitType = (type: string) => {
    const exists = filters.selectedVisitTypes.includes(type);
    const updated = exists
      ? filters.selectedVisitTypes.filter(t => t !== type)
      : [...filters.selectedVisitTypes, type];
    onFilterChange({ ...filters, selectedVisitTypes: updated });
  };

  const togglePaymentMode = (mode: string) => {
    const exists = filters.selectedPaymentModes.includes(mode);
    const updated = exists
      ? filters.selectedPaymentModes.filter(m => m !== mode)
      : [...filters.selectedPaymentModes, mode];
    onFilterChange({ ...filters, selectedPaymentModes: updated });
  };

  const setQuarterPreset = (q: 'all' | 'q1' | 'q2' | 'q3' | 'q4') => {
    if (q === 'all') {
      onFilterChange({ ...filters, dateRange: ['2025-01-02', '2025-12-31'] });
    } else if (q === 'q1') {
      onFilterChange({ ...filters, dateRange: ['2025-01-02', '2025-03-31'] });
    } else if (q === 'q2') {
      onFilterChange({ ...filters, dateRange: ['2025-04-01', '2025-06-30'] });
    } else if (q === 'q3') {
      onFilterChange({ ...filters, dateRange: ['2025-07-01', '2025-09-30'] });
    } else if (q === 'q4') {
      onFilterChange({ ...filters, dateRange: ['2025-10-01', '2025-12-31'] });
    }
  };

  const resetAll = () => {
    onFilterChange(INITIAL_FILTERS);
  };

  const activeCount =
    (filters.searchQuery ? 1 : 0) +
    filters.selectedDepartments.length +
    filters.selectedAdmissionStatuses.length +
    filters.selectedGenders.length +
    filters.selectedVisitTypes.length +
    filters.selectedPaymentModes.length +
    (filters.selectedDoctor ? 1 : 0) +
    (filters.selectedDiagnosis ? 1 : 0) +
    (filters.dateRange[0] !== '2025-01-02' || filters.dateRange[1] !== '2025-12-31' ? 1 : 0);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs mb-5 overflow-hidden">
      {/* Top primary filter row */}
      <div className="p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search patient ID, diagnosis, doctor, department..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A6A1] focus:bg-white text-[#243447]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Slicers matching Power BI: Admission Status & Gender */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Admission Status */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <span className="px-2 text-[11px] font-medium text-[#64748B]">Admission:</span>
            {ADMISSION_STATUSES.map(status => {
              const active = filters.selectedAdmissionStatuses.includes(status);
              return (
                <button
                  key={status}
                  onClick={() => toggleAdmissionStatus(status)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#163A5F] text-white shadow-2xs'
                      : 'text-[#243447] hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Gender */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <span className="px-2 text-[11px] font-medium text-[#64748B]">Gender:</span>
            {(['Male', 'Female'] as const).map(gender => {
              const active = filters.selectedGenders.includes(gender);
              return (
                <button
                  key={gender}
                  onClick={() => toggleGender(gender)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#163A5F] text-white shadow-2xs'
                      : 'text-[#243447] hover:bg-slate-200'
                  }`}
                >
                  {gender}
                </button>
              );
            })}
          </div>

          {/* Expand more filters button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#163A5F] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>More Filters</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#16A6A1] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 pt-2 border-t border-slate-100 space-y-3.5 bg-slate-50/50">
          {/* Departments */}
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Department
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.map(dept => {
                const active = filters.selectedDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    onClick={() => toggleDepartment(dept)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      active
                        ? 'bg-[#16A6A1] text-white shadow-2xs font-semibold'
                        : 'bg-white border border-slate-200 text-[#243447] hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visit Type & Payment Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Visit Type (OPD / IPD)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VISIT_TYPES.map(vt => {
                  const active = filters.selectedVisitTypes.includes(vt);
                  return (
                    <button
                      key={vt}
                      onClick={() => toggleVisitType(vt)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        active
                          ? 'bg-[#102A43] text-white font-semibold'
                          : 'bg-white border border-slate-200 text-[#243447] hover:bg-slate-50'
                      }`}
                    >
                      {vt === 'OPD' ? 'OPD (Outpatient - 74%)' : 'IPD (Inpatient - 26%)'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Payment Mode
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_MODES.map(pm => {
                  const active = filters.selectedPaymentModes.includes(pm);
                  return (
                    <button
                      key={pm}
                      onClick={() => togglePaymentMode(pm)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                        active
                          ? 'bg-[#163A5F] text-white font-semibold'
                          : 'bg-white border border-slate-200 text-[#243447] hover:bg-slate-50'
                      }`}
                    >
                      {pm}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date range with Presets matching Power BI slicer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#16A6A1]" />
                Visit Date Range (2025 Calendar Year)
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setQuarterPreset('all')}
                  className="px-2 py-0.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                >
                  Full Year
                </button>
                <button
                  onClick={() => setQuarterPreset('q1')}
                  className="px-2 py-0.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                >
                  Q1
                </button>
                <button
                  onClick={() => setQuarterPreset('q2')}
                  className="px-2 py-0.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                >
                  Q2
                </button>
                <button
                  onClick={() => setQuarterPreset('q3')}
                  className="px-2 py-0.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                >
                  Q3
                </button>
                <button
                  onClick={() => setQuarterPreset('q4')}
                  className="px-2 py-0.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                >
                  Q4
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="date"
                value={filters.dateRange[0]}
                min="2025-01-02"
                max="2025-12-31"
                onChange={e => onFilterChange({ ...filters, dateRange: [e.target.value, filters.dateRange[1]] })}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={filters.dateRange[1]}
                min="2025-01-02"
                max="2025-12-31"
                onChange={e => onFilterChange({ ...filters, dateRange: [filters.dateRange[0], e.target.value] })}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags Summary */}
      {activeCount > 0 && (
        <div className="px-3 sm:px-4 py-2 bg-teal-50/50 border-t border-teal-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-teal-900">Active Filters:</span>

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-200 text-[11px]">
                Search: "{filters.searchQuery}"
                <button onClick={() => onFilterChange({ ...filters, searchQuery: '' })} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.selectedDepartments.map(d => (
              <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-200 text-[11px]">
                Dept: {d}
                <button onClick={() => toggleDepartment(d)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.selectedAdmissionStatuses.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-200 text-[11px]">
                {s}
                <button onClick={() => toggleAdmissionStatus(s)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.selectedGenders.map(g => (
              <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-200 text-[11px]">
                {g}
                <button onClick={() => toggleGender(g as 'Male' | 'Female')} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.selectedVisitTypes.map(v => (
              <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-200 text-[11px]">
                {v}
                <button onClick={() => toggleVisitType(v)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.selectedDoctor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-200 text-[11px]">
                Doctor: {filters.selectedDoctor}
                <button onClick={() => onFilterChange({ ...filters, selectedDoctor: '' })} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#64748B] font-mono tabular-nums">
              Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> patients
            </span>
            <button
              onClick={resetAll}
              className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
