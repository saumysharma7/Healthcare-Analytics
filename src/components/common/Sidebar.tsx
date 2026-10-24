import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CircleDollarSign,
  TrendingUp,
  PieChart,
  Info,
  X,
  Database,
  Calendar
} from 'lucide-react';
import { ActivePage } from '../../types/healthcare';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpen: boolean;
  onClose: () => void;
  totalRecordsCount: number;
  filteredCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  totalRecordsCount,
  filteredCount
}) => {
  const navItems = [
    {
      id: 'overview' as ActivePage,
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Core KPIs & distribution'
    },
    {
      id: 'patients' as ActivePage,
      label: 'Patient Analytics',
      icon: Users,
      description: 'Demographics & diagnosis'
    },
    {
      id: 'performance' as ActivePage,
      label: 'Hospital Performance',
      icon: Building2,
      description: 'Department & doctor load'
    },
    {
      id: 'costs' as ActivePage,
      label: 'Cost Analysis',
      icon: CircleDollarSign,
      description: 'Billing & payment modes'
    },
    {
      id: 'trends' as ActivePage,
      label: 'Healthcare Trends',
      icon: TrendingUp,
      description: 'Monthly trajectories'
    },
    {
      id: 'powerbi' as ActivePage,
      label: 'Power BI Dashboard',
      icon: PieChart,
      description: 'Desktop report replica & embed'
    },
    {
      id: 'about' as ActivePage,
      label: 'About Project',
      icon: Info,
      description: 'Methodology & verified data'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh-57px)] w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Mobile header with close button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#163A5F] text-[#16A6A1] flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#102A43] text-sm">PulseAnalytics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-[#E7F6F5] text-[#163A5F] font-semibold shadow-xs'
                    : 'text-[#243447] hover:bg-slate-50 hover:text-[#102A43]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#16A6A1] text-white shadow-xs'
                      : 'bg-slate-100 text-[#64748B] group-hover:text-[#163A5F] group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate leading-snug">{item.label}</div>
                  <div className="text-[10px] text-[#64748B] truncate font-normal">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom dataset summary badge */}
        <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/70">
          <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#102A43]">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#16A6A1]" />
                Dataset Status
              </span>
              <span className="font-mono tabular-nums text-xs font-bold text-teal-700">
                {filteredCount} / {totalRecordsCount}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-[#64748B]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Jan 2025 - Dec 2025
              </span>
              <span className="font-medium text-emerald-700">Verified</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
