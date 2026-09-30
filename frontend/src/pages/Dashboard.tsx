import React, { useState } from 'react';
import { StatCard } from '../components/StatCard.tsx';
import { SalesChart } from '../components/SalesChart.tsx';
import { DataTable, type ColumnDef } from '../components/DataTable.tsx';
import type {
  SalesTransaction,
  AgentRun,
  AIAnalysisInsight,
  ChartDataPoint,
  PageId,
} from '../types.ts';
import {
  DollarSign,
  GraduationCap,
  Activity,
  Bot,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Inbox,
  LogOut,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
  searchQuery?: string;
  transactions?: SalesTransaction[];
  agentRuns?: AgentRun[];
  insights?: AIAnalysisInsight[];
  chartData?: ChartDataPoint[];
  isLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onLogout,
  searchQuery = '',
  transactions = [],
  agentRuns = [],
  insights = [],
  chartData = [],
  isLoading = false,
}) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<SalesTransaction | null>(null);

  const columns: ColumnDef<SalesTransaction>[] = [
    {
      key: 'orderNumber',
      header: 'Order Reference',
      sortable: true,
      accessor: (tx) => (
        <span className="font-mono text-slate-900 font-medium">
          {tx.orderNumber}
        </span>
      ),
    },
    {
      key: 'institutionName',
      header: 'Institution / District',
      sortable: true,
      accessor: (tx) => (
        <div>
          <div className="font-medium text-slate-900 truncate max-w-xs">
            {tx.institutionName}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {tx.districtCode}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Contract Scope',
      sortable: true,
      accessor: (tx) => (
        <span className="text-slate-600">
          {tx.category}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Settlement Amount',
      sortable: true,
      align: 'right',
      accessor: (tx) => (
        <span className="font-mono tabular-nums font-medium text-slate-900">
          ${tx.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Audit Status',
      sortable: true,
      accessor: (tx) => {
        const isSettled = tx.status === 'Settled';
        const isFlagged = tx.status === 'Flagged Audit';

        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isSettled
                  ? 'bg-emerald-500'
                  : isFlagged
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />

            <span
              className={`font-medium ${
                isSettled
                  ? 'text-slate-700'
                  : isFlagged
                  ? 'text-rose-700'
                  : 'text-amber-700'
              }`}
            >
              {tx.status}
            </span>
          </div>
        );
      },
    },
  ];

  const totalRevenue = transactions.reduce(
    (acc, tx) => acc + (tx.amount || 0),
    0
  );

  const totalUnits = transactions.reduce(
    (acc, tx) => acc + (tx.itemsCount || 0),
    0
  );

  const activeAgentCount = agentRuns.filter(
    (r) => r.executionStatus === 'Running'
  ).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Institutional Operations Ledger
          </h1>

          <p className="text-xs text-slate-500">
            Real-time procurement telemetry, FERPA seat distribution, and autonomous validation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* Review AI Briefing */}
          <button
            onClick={() => onNavigate('ai-analyst')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Review AI Briefing</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>

          {/* Launch Agent Run */}
          <button
            onClick={() => onNavigate('agent-runs')}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Launch Agent Run</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>

        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Consolidated Revenue"
          value={
            totalRevenue > 0
              ? `$${totalRevenue.toLocaleString()}`
              : '$0.00'
          }
          change={
            transactions.length > 0
              ? `${transactions.length} orders`
              : 'No orders'
          }
          changeType="neutral"
          period="from backend"
          secondaryLabel="Ledger Count"
          secondaryValue={transactions.length.toString()}
          icon={DollarSign}
          onClick={() => onNavigate('sales')}
        />

        <StatCard
          title="Contracting Districts"
          value={
            transactions.length > 0
              ? `${new Set(
                  transactions.map((t) => t.districtCode)
                ).size} Active`
              : '0 Active'
          }
          change="Real-time"
          changeType="neutral"
          period="connected API"
          secondaryLabel="Units"
          secondaryValue={totalUnits.toString()}
          icon={GraduationCap}
          onClick={() => onNavigate('schools')}
        />

        <StatCard
          title="Assessment Batteries"
          value={
            totalUnits > 0
              ? `${totalUnits.toLocaleString()} Units`
              : '0 Units'
          }
          change="0 Par Breaches"
          changeType="neutral"
          period="inventory sync"
          secondaryLabel="State"
          secondaryValue="Nominal"
          icon={Activity}
          onClick={() => onNavigate('products')}
        />

        <StatCard
          title="Autonomous Invariants"
          value={`${activeAgentCount} Running`}
          change={`${agentRuns.length} Total`}
          changeType="neutral"
          period="scheduler"
          secondaryLabel="Active Agents"
          secondaryValue={`${activeAgentCount} Jobs`}
          icon={Bot}
          onClick={() => onNavigate('agent-runs')}
        />

      </div>

      {/* Main Visual Anchor: Sales Chart */}
      <div>
        <SalesChart
          data={chartData}
          initialRange="30D"
          isLoading={isLoading}
        />
      </div>

      {/* Dual Split: Recent Transactions & Intelligence Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <DataTable
            title="Recent District Procurement Transactions"
            subtitle="Encumbered purchase orders reconciled against FERPA seat limits"
            data={transactions}
            columns={columns}
            keyExtractor={(item) => item.id}
            pageSize={5}
            isLoading={isLoading}
            emptyMessage="No transactions loaded from backend."
            externalSearchQuery={searchQuery}
            onRowClick={(item) => setSelectedTransaction(item)}
            searchFilter={(item, q) =>
              item.orderNumber.toLowerCase().includes(q) ||
              item.institutionName.toLowerCase().includes(q) ||
              item.districtCode.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q)
            }
          />
        </div>

        {/* Right Side */}
        <div className="space-y-4">

          {/* Analyst Insights */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-800" />

                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Analyst Invariants
                </h3>
              </div>

              <button
                onClick={() => onNavigate('ai-analyst')}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <span>Full Lab</span>
                <ArrowRight className="h-3 w-3" />
              </button>

            </div>

            <div className="mt-4 space-y-3.5">

              {insights.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <Inbox className="h-4 w-4 mx-auto mb-1 opacity-50" />
                  No analyst insights received from backend.
                </div>
              ) : (
                insights.slice(0, 2).map((ins) => (
                  <div
                    key={ins.id}
                    onClick={() => onNavigate('ai-analyst')}
                    className="group cursor-pointer rounded-md border border-slate-100 p-3 hover:border-slate-300 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">

                      <span className="text-xs font-medium text-slate-900 group-hover:text-slate-950">
                        {ins.headline}
                      </span>

                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {ins.confidenceScore}% conf
                      </span>

                    </div>

                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {ins.summary}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">

                      <span>{ins.category}</span>

                      <span aria-hidden="true">·</span>

                      <span className="font-mono font-medium text-slate-700">
                        {ins.impactMetric.label}: {ins.impactMetric.value}
                      </span>

                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* Running Agents Telemetry Feed */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">

              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-slate-800" />

                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Active Execution Traces
                </h3>
              </div>

              <button
                onClick={() => onNavigate('agent-runs')}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <span>Telemetry</span>
                <ArrowRight className="h-3 w-3" />
              </button>

            </div>

            <div className="mt-4 space-y-3">

              {agentRuns.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <Bot className="h-4 w-4 mx-auto mb-1 opacity-50" />
                  No agent runs loaded from backend.
                </div>
              ) : (
                agentRuns.slice(0, 3).map((run) => (
                  <div
                    key={run.id}
                    onClick={() => onNavigate('agent-runs')}
                    className="cursor-pointer border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                  >

                    <div className="flex items-center justify-between text-xs">

                      <span className="font-medium text-slate-900 truncate max-w-[170px]">
                        {run.agentName}
                      </span>

                      <span
                        className={`font-mono text-[10px] tabular-nums ${
                          run.executionStatus === 'Completed'
                            ? 'text-emerald-700'
                            : run.executionStatus === 'Action Flagged'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {run.executionStatus}
                      </span>

                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">

                      <span>{run.agentIdentifier}</span>

                      <span aria-hidden="true">·</span>

                      <span>
                        {run.recordsEvaluated.toLocaleString()} records
                      </span>

                      <span aria-hidden="true">·</span>

                      <span>{run.durationSeconds}s</span>

                    </div>

                  </div>
                ))
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between border-b border-slate-100 pb-4">

              <div>
                <span className="font-mono text-xs text-slate-400">
                  {selectedTransaction.orderNumber}
                </span>

                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  {selectedTransaction.institutionName}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-xs text-slate-400 hover:text-slate-700 rounded p-1"
              >
                Close (ESC)
              </button>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">

              <div>
                <span className="text-slate-400">
                  District Code
                </span>

                <p className="font-mono font-medium text-slate-800 mt-0.5">
                  {selectedTransaction.districtCode}
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  Settlement Date
                </span>

                <p className="font-mono text-slate-800 mt-0.5">
                  {selectedTransaction.date}
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  Contract Scope
                </span>

                <p className="font-medium text-slate-800 mt-0.5">
                  {selectedTransaction.category}
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  Payment Terms
                </span>

                <p className="font-medium text-slate-800 mt-0.5">
                  {selectedTransaction.paymentTerms}
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  Assessment Units
                </span>

                <p className="font-mono font-medium text-slate-800 mt-0.5">
                  {selectedTransaction.itemsCount} units
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  Total Encumbrance
                </span>

                <p className="font-mono text-base font-semibold text-slate-900 mt-0.5">
                  ${selectedTransaction.amount.toLocaleString()}
                </p>
              </div>

            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">

              <span className="text-slate-400 flex items-center gap-1.5">

                <FileCheck className="h-4 w-4 text-emerald-600" />

                Ledger cryptographically sealed

              </span>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Acknowledge Receipt
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};