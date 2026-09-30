import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Package,
  GraduationCap,
  Sparkles,
  Bot,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { PageId } from '../types.ts';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeAgentCount?: number;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  counter?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  activeAgentCount = 1,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales & Revenue', icon: Receipt },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'schools', label: 'Schools', icon: GraduationCap },
    { id: 'ai-analyst', label: 'AI Analyst', icon: Sparkles },
    {
      id: 'agent-runs',
      label: 'Agent Runs',
      icon: Bot,
      counter: activeAgentCount,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col shrink-0 border-r border-slate-200 bg-white transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
            <Layers className="h-5 w-5 stroke-[1.75]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight text-slate-900 truncate">
                SOFIM CONCERN
              </span>
              <span className="text-[11px] font-normal text-slate-500 truncate">
                School Supply Management
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Group */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Workspaces
          </div>
        )}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.counter !== undefined && item.counter > 0 && (
                  <span
                    className={`font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {item.counter}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System State */}
      <div className="border-t border-slate-200 p-3">
        <div
          className={`flex items-center gap-2.5 rounded-md p-1.5 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-800 truncate">
                FERPA / ISO-13485
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Certified Institutional Vault
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
