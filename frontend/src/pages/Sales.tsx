import React, { useState, useMemo } from 'react';
import { StatCard } from '../components/StatCard.tsx';
import { DataTable, type ColumnDef } from '../components/DataTable.tsx';
import type { SalesTransaction } from '../types.ts';
import {
 
  Clock,
  TrendingUp,
  Plus,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface SalesProps {
  searchQuery?: string;
  transactions?: SalesTransaction[];
  onExportCSV?: () => void;
  onCreateOrder?: (order: Omit<SalesTransaction, 'id' | 'orderNumber' | 'date'>) => void;
  isLoading?: boolean;
}

export const Sales: React.FC<SalesProps> = ({
  searchQuery = '',
  transactions: propTransactions = [],
  onCreateOrder,
  isLoading = false,
}) => {
  // Allow local state for orders created within UI if no backend handler is provided
  const [localTransactions, setLocalTransactions] = useState<SalesTransaction[]>(propTransactions);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectTx, setInspectTx] = useState<SalesTransaction | null>(null);

  // Sync prop changes if backend updates
  React.useEffect(() => {
    setLocalTransactions(propTransactions);
  }, [propTransactions]);

  const [formData, setFormData] = useState({
    institutionName: '',
    districtCode: '',
    amount: '',
    itemsCount: '',
    category: 'Digital District Licenses' as SalesTransaction['category'],
    paymentTerms: 'Net 30' as SalesTransaction['paymentTerms'],
  });

  const categories = [
    'ALL',
    'Digital District Licenses',
    'Diagnostic Assessments',
    'Clinical Protocols',
    'Lab Consumables',
  ];

  const statuses = [
    'ALL',
    'Settled',
    'Processing',
    'Pending Verification',
    'Flagged Audit',
  ];

  const filteredTransactions = useMemo(() => {
    return localTransactions.filter((tx) => {
      const matchCat =
        selectedCategory === 'ALL' || tx.category === selectedCategory;
      const matchStatus =
        selectedStatus === 'ALL' || tx.status === selectedStatus;
      return matchCat && matchStatus;
    });
  }, [localTransactions, selectedCategory, selectedStatus]);

  // Aggregate Metrics computed from live backend data
  const totalSettled = localTransactions
    .filter((t) => t.status === 'Settled')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPending = localTransactions
    .filter((t) => t.status === 'Processing' || t.status === 'Pending Verification')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const avgOrder = localTransactions.length > 0
    ? Math.round(localTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / localTransactions.length)
    : 0;

  const columns: ColumnDef<SalesTransaction>[] = [
    {
      key: 'orderNumber',
      header: 'Reference ID',
      sortable: true,
      accessor: (tx) => (
        <span className="font-mono text-slate-900 font-medium">{tx.orderNumber}</span>
      ),
    },
    {
      key: 'institutionName',
      header: 'Contracting Entity',
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
      header: 'Line of Business',
      sortable: true,
      accessor: (tx) => <span className="text-slate-600">{tx.category}</span>,
    },
    {
      key: 'date',
      header: 'Billing Date',
      sortable: true,
      accessor: (tx) => (
        <span className="font-mono text-slate-500 tabular-nums">{tx.date}</span>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Terms',
      sortable: true,
      accessor: (tx) => (
        <span className="font-mono text-xs text-slate-500">{tx.paymentTerms}</span>
      ),
    },
    {
      key: 'itemsCount',
      header: 'Volume',
      sortable: true,
      align: 'right',
      accessor: (tx) => (
        <span className="font-mono tabular-nums text-slate-700">
          {tx.itemsCount}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Gross Amount',
      sortable: true,
      align: 'right',
      accessor: (tx) => (
        <span className="font-mono tabular-nums font-semibold text-slate-900">
          ${tx.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Settlement State',
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

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institutionName || !formData.amount) return;

    const payload = {
      institutionName: formData.institutionName,
      districtCode: formData.districtCode || 'GEN-DIS-001',
      amount: parseFloat(formData.amount),
      itemsCount: parseInt(formData.itemsCount) || 1,
      category: formData.category,
      paymentTerms: formData.paymentTerms,
      status: 'Pending Verification' as const,
    };

    if (onCreateOrder) {
      onCreateOrder(payload);
    } else {
      const newTx: SalesTransaction = {
        ...payload,
        id: `tx-${Date.now()}`,
        orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
      };
      setLocalTransactions([newTx, ...localTransactions]);
    }

    setIsModalOpen(false);
    setFormData({
      institutionName: '',
      districtCode: '',
      amount: '',
      itemsCount: '',
      category: 'Digital District Licenses',
      paymentTerms: 'Net 30',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sales & Revenue Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Institutional invoicing, contract drawdowns, and state department of education settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Procurement Order</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Settled Invoices"
          value={totalSettled > 0 ? `$${totalSettled.toLocaleString()}` : '$0.00'}
          change={localTransactions.length > 0 ? `${localTransactions.filter((t) => t.status === 'Settled').length} Settled` : '0 Settled'}
          changeType="neutral"
          period="backend ledger"
          secondaryLabel="Settlement Rate"
          secondaryValue={localTransactions.length > 0 ? `${Math.round((localTransactions.filter((t) => t.status === 'Settled').length / localTransactions.length) * 100)}%` : '0%'}
          icon={CheckCircle2}
        />
        <StatCard
          title="In Clearance Pipeline"
          value={totalPending > 0 ? `$${totalPending.toLocaleString()}` : '$0.00'}
          change={`${localTransactions.filter((t) => t.status === 'Processing' || t.status === 'Pending Verification').length} Pending`}
          changeType="neutral"
          period="awaiting clearance"
          secondaryLabel="Flagged"
          secondaryValue={`${localTransactions.filter((t) => t.status === 'Flagged Audit').length} Audit`}
          icon={Clock}
        />
        <StatCard
          title="Average Contract Size"
          value={avgOrder > 0 ? `$${avgOrder.toLocaleString()}` : '$0.00'}
          change={`${localTransactions.length} Total`}
          changeType="neutral"
          period="active transactions"
          secondaryLabel="Median"
          secondaryValue={avgOrder > 0 ? `$${avgOrder.toLocaleString()}` : '$0.00'}
          icon={TrendingUp}
        />
        <StatCard
          title="Days Sales Outstanding (DSO)"
          value="28.4 Days"
          change="Standard Terms"
          changeType="neutral"
          period="institutional"
          secondaryLabel="Compliance"
          secondaryValue="100% IDEA"
          icon={FileSpreadsheet}
        />
      </div>

      {/* Segmented Filter */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 text-[11px] font-medium uppercase tracking-wider">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Lines' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0">
          <span className="text-slate-400 mr-1 text-[11px] font-medium uppercase tracking-wider">
            Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2 py-0.5 rounded text-xs transition-colors whitespace-nowrap ${
                selectedStatus === st
                  ? 'font-semibold text-slate-900 underline underline-offset-4 decoration-2 decoration-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Institutional Billing Ledger"
        subtitle={`Showing ${filteredTransactions.length} of ${localTransactions.length} total transactional records`}
        data={filteredTransactions}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={8}
        isLoading={isLoading}
        emptyMessage="No billing records found. Plug in backend API to populate transactions."
        externalSearchQuery={searchQuery}
        onRowClick={(tx) => setInspectTx(tx)}
        searchFilter={(item, q) =>
          item.orderNumber.toLowerCase().includes(q) ||
          item.institutionName.toLowerCase().includes(q) ||
          item.districtCode.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        }
      />

      {/* Record Order Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Record Institutional Procurement
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add verified district purchase order or grant draw specification
            </p>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Institution or District Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Diego Unified District"
                  value={formData.institutionName}
                  onChange={(e) =>
                    setFormData({ ...formData, institutionName: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    District Code
                  </label>
                  <input
                    type="text"
                    placeholder="CA-DIS-088"
                    value={formData.districtCode}
                    onChange={(e) =>
                      setFormData({ ...formData, districtCode: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Contract Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="75000"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Volume (Seats/Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={formData.itemsCount}
                    onChange={(e) =>
                      setFormData({ ...formData, itemsCount: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentTerms: e.target.value as SalesTransaction['paymentTerms'],
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden bg-white"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Direct Wire">Direct Wire</option>
                    <option value="Institutional Grant">Institutional Grant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Product Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as SalesTransaction['category'],
                    })
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden bg-white"
                >
                  <option value="Digital District Licenses">
                    Digital District Licenses
                  </option>
                  <option value="Diagnostic Assessments">
                    Diagnostic Assessments
                  </option>
                  <option value="Clinical Protocols">Clinical Protocols</option>
                  <option value="Lab Consumables">Lab Consumables</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Detail Modal */}
      {inspectTx && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-slate-400">
                  {inspectTx.orderNumber}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {inspectTx.institutionName}
                </h3>
              </div>
              <button
                onClick={() => setInspectTx(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Close (ESC)
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Status</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {inspectTx.status}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Total Encumbrance</span>
                <p className="font-mono text-base font-bold text-slate-900 mt-0.5">
                  ${inspectTx.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Line of Business</span>
                <p className="text-slate-700 mt-0.5">{inspectTx.category}</p>
              </div>
              <div>
                <span className="text-slate-400">District State Identifier</span>
                <p className="font-mono text-slate-700 mt-0.5">
                  {inspectTx.districtCode}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setInspectTx(null)}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
