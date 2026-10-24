import React from 'react';
import { Menu, RotateCcw, Download, Activity } from 'lucide-react';
import { ActivePage, FilterState } from '../../types/healthcare';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  filters: FilterState;
  onResetFilters: () => void;
  onExportData: () => void;
  onToggleSidebar: () => void;
  activeFilterCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  filters: _filters,
  onResetFilters,
  onExportData,
  onToggleSidebar,
  activeFilterCount
}) => {
  const pageTitles: Record<ActivePage, string> = {
    overview: 'Healthcare Overview',
    patients: 'Patient & Department Analysis',
    performance: 'Hospital Performance',
    costs: 'Treatment Cost Analysis',
    trends: 'Healthcare Trends',
    powerbi: 'Power BI Dashboard',
    about: 'About Project & Dataset'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger (mobile) + Brand Wordmark & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 text-[#102A43] hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#16A6A1]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#163A5F] text-[#16A6A1] flex items-center justify-center font-bold shadow-xs group-hover:bg-[#102A43] transition-colors">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#102A43] tracking-tight whitespace-nowrap leading-tight">
                PulseAnalytics
              </span>
              <span className="text-[10px] text-[#64748B] tracking-wider uppercase font-medium">
                Healthcare Intelligence
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center text-xs text-[#64748B] pl-4 border-l border-slate-200">
            <span>Portfolio Project</span>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <span className="font-semibold text-[#102A43] truncate max-w-[200px] md:max-w-none">
              {pageTitles[activePage]}
            </span>
          </div>
        </div>

        {/* Center: Quick navigation links for wide screens */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-medium text-[#64748B]">
          <button
            onClick={() => onNavigate('overview')}
            className={`whitespace-nowrap transition-colors hover:text-[#102A43] ${
              activePage === 'overview' ? 'text-[#16A6A1] font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('patients')}
            className={`whitespace-nowrap transition-colors hover:text-[#102A43] ${
              activePage === 'patients' ? 'text-[#16A6A1] font-semibold' : ''
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => onNavigate('performance')}
            className={`whitespace-nowrap transition-colors hover:text-[#102A43] ${
              activePage === 'performance' ? 'text-[#16A6A1] font-semibold' : ''
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => onNavigate('costs')}
            className={`whitespace-nowrap transition-colors hover:text-[#102A43] ${
              activePage === 'costs' ? 'text-[#16A6A1] font-semibold' : ''
            }`}
          >
            Costs
          </button>
          <button
            onClick={() => onNavigate('powerbi')}
            className={`whitespace-nowrap transition-colors hover:text-[#102A43] ${
              activePage === 'powerbi' ? 'text-[#16A6A1] font-semibold' : ''
            }`}
          >
            Power BI
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Reset all applied filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Filters</span>
              <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-mono flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            </button>
          )}

          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#163A5F] hover:bg-[#102A43] rounded-lg transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#16A6A1] whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Dataset</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
