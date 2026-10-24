/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ActivePage, FilterState } from './types/healthcare';
import {
  HEALTHCARE_RECORDS,
  INITIAL_FILTERS,
  filterRecords
} from './data/healthcareData';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { FilterBar } from './components/common/FilterBar';
import { OverviewPage } from './pages/OverviewPage';
import { PatientAnalyticsPage } from './pages/PatientAnalyticsPage';
import { HospitalPerformancePage } from './pages/HospitalPerformancePage';
import { TreatmentCostPage } from './pages/TreatmentCostPage';
import { HealthcareTrendsPage } from './pages/HealthcareTrendsPage';
import { PowerBIDashboardPage } from './pages/PowerBIDashboardPage';
import { AboutProjectPage } from './pages/AboutProjectPage';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Compute filtered dataset
  const filteredRecords = useMemo(() => {
    return filterRecords(HEALTHCARE_RECORDS, filters);
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return (
      (filters.searchQuery ? 1 : 0) +
      filters.selectedDepartments.length +
      filters.selectedAdmissionStatuses.length +
      filters.selectedGenders.length +
      filters.selectedVisitTypes.length +
      filters.selectedPaymentModes.length +
      filters.selectedAgeGroups.length +
      (filters.selectedDoctor ? 1 : 0) +
      (filters.selectedDiagnosis ? 1 : 0) +
      (filters.dateRange[0] !== '2025-01-02' || filters.dateRange[1] !== '2025-12-31' ? 1 : 0)
    );
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleExportCSV = () => {
    const headers = [
      'Patient ID',
      'Age',
      'Gender',
      'Department',
      'Visit Type',
      'Admission Status',
      'Diagnosis',
      'Doctor',
      'Treatment Cost (INR)',
      'Length of Stay (Days)',
      'Payment Mode',
      'Visit Date'
    ];

    const rows = filteredRecords.map(r => [
      r.patientId,
      r.age,
      r.gender,
      r.department,
      r.visitType,
      r.admissionStatus,
      `"${r.diagnosis}"`,
      `"${r.doctor}"`,
      r.treatmentCost,
      r.lengthOfStay,
      r.paymentMode,
      r.visitDateDisplay
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `healthcare_dataset_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#243447] flex flex-col font-sans antialiased selection:bg-[#16A6A1]/20 selection:text-[#102A43]">
      {/* Top Bar Navigation */}
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        filters={filters}
        onResetFilters={handleResetFilters}
        onExportData={handleExportCSV}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          totalRecordsCount={HEALTHCARE_RECORDS.length}
          filteredCount={filteredRecords.length}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {/* Global Filter Bar (shown on analytical pages) */}
          {activePage !== 'about' && (
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              filteredCount={filteredRecords.length}
              totalCount={HEALTHCARE_RECORDS.length}
            />
          )}

          {/* Active Page View */}
          {activePage === 'overview' && (
            <OverviewPage
              records={filteredRecords}
              allRecords={HEALTHCARE_RECORDS}
              filters={filters}
              onFilterChange={setFilters}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'patients' && (
            <PatientAnalyticsPage
              records={filteredRecords}
              allRecords={HEALTHCARE_RECORDS}
              filters={filters}
              onFilterChange={setFilters}
              onExportCSV={handleExportCSV}
            />
          )}

          {activePage === 'performance' && (
            <HospitalPerformancePage
              records={filteredRecords}
              allRecords={HEALTHCARE_RECORDS}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {activePage === 'costs' && (
            <TreatmentCostPage
              records={filteredRecords}
              allRecords={HEALTHCARE_RECORDS}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {activePage === 'trends' && (
            <HealthcareTrendsPage
              records={filteredRecords}
              allRecords={HEALTHCARE_RECORDS}
              filters={filters}
              onFilterChange={setFilters}
              onExportCSV={handleExportCSV}
            />
          )}

          {activePage === 'powerbi' && (
            <PowerBIDashboardPage
              records={filteredRecords}
              allRecords={HEALTHCARE_RECORDS}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {activePage === 'about' && <AboutProjectPage />}
        </main>
      </div>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white px-6 py-4 text-xs text-[#64748B]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#102A43]">PulseAnalytics</span>
            <span>&middot;</span>
            <span>Healthcare Data Analytics Portfolio & Academic Research Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
            <span>1,000 Patient Encounters</span>
            <span>&middot;</span>
            <span>CY 2025</span>
            <span>&middot;</span>
            <span className="text-teal-700 font-medium">Power BI Parity Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
