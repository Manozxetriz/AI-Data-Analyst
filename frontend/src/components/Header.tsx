import React from 'react';
import {
  Search,
  Download,
  Calendar,
  RefreshCw,
  Bell,
  Menu,
} from 'lucide-react';
import type { PageId } from '../types';

interface HeaderProps {
  currentPage: PageId;
  onMobileMenuToggle: () => void;
  onExportCSV?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTimeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onMobileMenuToggle,
  onExportCSV,
  searchQuery,
  onSearchChange,
  selectedTimeframe = 'Q3 2026',
  onTimeframeChange,
  isRefreshing = false,
  onRefresh,
}) => {
  const pageTitles: Record<PageId, { section: string; title: string }> = {
    dashboard: { section: 'Operations', title: 'Executive Overview' },
    sales: { section: 'Ledger', title: 'Institutional Transactions' },
    products: { section: 'Inventory', title: 'Clinical Assessment Catalog' },
    schools: { section: 'Schools', title: 'Details' },
    'ai-analyst': { section: 'Intelligence', title: 'Autonomous Analyst Lab' },
    'agent-runs': { section: 'Execution', title: 'Agent Telemetry & Runs' },
  };

  const { section, title } = pageTitles[currentPage];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xs">
      {/* Zone 1: Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-normal text-slate-400">{section}</span>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-900 tracking-tight">{title}</span>
        </div>
      </div>

      {/* Zone 2: Universal Contextual Search */}
      <div className="hidden lg:flex items-center w-80 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records, SKUs, district IDs..."
            className="w-full rounded-md border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Actions & Quick Status */}
      <div className="flex items-center gap-2.5">
        {onTimeframeChange && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 bg-white">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedTimeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="Q3 2026">Q3 2026 (Active)</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="YTD 2026">FY 2026 YTD</option>
              <option value="ALL">All Fiscal Cycles</option>
            </select>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Synchronize district state"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`}
            />
          </button>
        )}

        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Audit CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <button
            title="System notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-slate-900" />
          </button>
          
          <div className="h-7 w-7 rounded-md bg-slate-900 flex items-center justify-center text-white text-[11px] font-semibold tracking-wider">
            CL
          </div>
        </div>
      </div>
    </header>
  );
};
