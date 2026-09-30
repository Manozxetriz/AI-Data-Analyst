import React, { useState, useMemo } from 'react';
import { StatCard } from '../components/StatCard.tsx';
import { DataTable, type ColumnDef } from '../components/DataTable.tsx';
import type { ProductItem } from '../types.ts';
import {
  Package,
  AlertCircle,
  ShieldCheck,
  Plus,
  Boxes,
} from 'lucide-react';

interface ProductsProps {
  searchQuery?: string;
  products?: ProductItem[];
  onAddProduct?: (product: Omit<ProductItem, 'id' | 'lastQualityAudit'>) => void;
  onUpdateProductStock?: (id: string, newStock: number) => void;
  isLoading?: boolean;
}

export const Products: React.FC<ProductsProps> = ({
  searchQuery = '',
  products: propProducts = [],
  onAddProduct,
  onUpdateProductStock,
  isLoading = false,
}) => {
  const [localProducts, setLocalProducts] = useState<ProductItem[]>(propProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  React.useEffect(() => {
    setLocalProducts(propProducts);
  }, [propProducts]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Diagnostic Assessment' as ProductItem['category'],
    stockLevel: '',
    reorderPoint: '',
    unitPrice: '',
    institutionalBulkPrice: '',
    batchLot: '',
    complianceStandard: 'FDA Class I' as ProductItem['complianceStandard'],
  });

  const categories = [
    'ALL',
    'Diagnostic Assessment',
    'Digital License',
    'Clinical Protocol',
    'Curriculum Kit',
    'Lab Consumable',
  ];

  const stockStatuses = ['ALL', 'In Stock', 'Low Stock', 'Backordered'];

  const filteredProducts = useMemo(() => {
    return localProducts.filter((p) => {
      const matchCat =
        selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchStatus =
        selectedStockStatus === 'ALL' || p.status === selectedStockStatus;
      return matchCat && matchStatus;
    });
  }, [localProducts, selectedCategory, selectedStockStatus]);

  // Aggregate stats from live data
  const totalStockedUnits = localProducts.reduce((acc, p) => acc + (p.stockLevel || 0), 0);
  const backorderCount = localProducts.filter((p) => p.status === 'Backordered').length;
  const lowStockCount = localProducts.filter((p) => p.status === 'Low Stock').length;

  const columns: ColumnDef<ProductItem>[] = [
    {
      key: 'sku',
      header: 'SKU Identifier',
      sortable: true,
      accessor: (p) => (
        <span className="font-mono text-slate-900 font-medium">{p.sku}</span>
      ),
    },
    {
      key: 'name',
      header: 'Product / Protocol Name',
      sortable: true,
      accessor: (p) => (
        <div>
          <div className="font-medium text-slate-900">{p.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            Lot: {p.batchLot} · Audited: {p.lastQualityAudit}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Classification',
      sortable: true,
      accessor: (p) => <span className="text-slate-600">{p.category}</span>,
    },
    {
      key: 'complianceStandard',
      header: 'Regulatory Standard',
      sortable: true,
      accessor: (p) => (
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
          <span className="font-mono text-[11px] text-slate-700">
            {p.complianceStandard}
          </span>
        </div>
      ),
    },
    {
      key: 'stockLevel',
      header: 'Available Stock',
      sortable: true,
      align: 'right',
      accessor: (p) => (
        <div>
          <span
            className={`font-mono tabular-nums font-semibold ${
              p.stockLevel === 0
                ? 'text-rose-600'
                : p.stockLevel < p.reorderPoint
                ? 'text-amber-600'
                : 'text-slate-900'
            }`}
          >
            {p.stockLevel.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            Par: {p.reorderPoint}
          </span>
        </div>
      ),
    },
    {
      key: 'institutionalBulkPrice',
      header: 'District Price',
      sortable: true,
      align: 'right',
      accessor: (p) => (
        <div>
          <span className="font-mono tabular-nums font-medium text-slate-900">
            ${p.institutionalBulkPrice}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            MSRP: ${p.unitPrice}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Par State',
      sortable: true,
      accessor: (p) => {
        const isInStock = p.status === 'In Stock';
        const isBackorder = p.status === 'Backordered';
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isInStock
                  ? 'bg-emerald-500'
                  : isBackorder
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
            <span
              className={`font-medium ${
                isInStock
                  ? 'text-slate-700'
                  : isBackorder
                  ? 'text-rose-700'
                  : 'text-amber-700'
              }`}
            >
              {p.status}
            </span>
          </div>
        );
      },
    },
  ];

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const stock = parseInt(formData.stockLevel) || 0;
    const reorder = parseInt(formData.reorderPoint) || 50;

    let computedStatus: ProductItem['status'] = 'In Stock';
    if (stock === 0) computedStatus = 'Backordered';
    else if (stock <= reorder) computedStatus = 'Low Stock';

    const payload = {
      sku: formData.sku.toUpperCase(),
      name: formData.name,
      category: formData.category,
      stockLevel: stock,
      reorderPoint: reorder,
      unitPrice: parseFloat(formData.unitPrice) || 200,
      institutionalBulkPrice: parseFloat(formData.institutionalBulkPrice) || 160,
      batchLot: formData.batchLot || 'LOT-2026-X01',
      complianceStandard: formData.complianceStandard,
      status: computedStatus,
    };

    if (onAddProduct) {
      onAddProduct(payload);
    } else {
      const newProd: ProductItem = {
        ...payload,
        id: `prod-${Date.now()}`,
        lastQualityAudit: new Date().toISOString().split('T')[0],
      };
      setLocalProducts([newProd, ...localProducts]);
    }

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      sku: '',
      category: 'Diagnostic Assessment',
      stockLevel: '',
      reorderPoint: '',
      unitPrice: '',
      institutionalBulkPrice: '',
      batchLot: '',
      complianceStandard: 'FDA Class I',
    });
  };

  const handleAdjustStock = (amount: number) => {
    if (!selectedProduct) return;
    const newLevel = Math.max(0, selectedProduct.stockLevel + amount);
    let newStatus: ProductItem['status'] = 'In Stock';
    if (newLevel === 0) newStatus = 'Backordered';
    else if (newLevel <= selectedProduct.reorderPoint) newStatus = 'Low Stock';

    if (onUpdateProductStock) {
      onUpdateProductStock(selectedProduct.id, newLevel);
    }

    const updated = {
      ...selectedProduct,
      stockLevel: newLevel,
      status: newStatus,
    };

    setLocalProducts(localProducts.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProduct(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Clinical Catalog & Inventory
          </h1>
          <p className="text-xs text-slate-500">
            FDA Class I assessment kits, FERPA digital license tiers, and ISO 13485 sensory consumables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Catalog Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cataloged Lines"
          value={`${localProducts.length} SKUs`}
          change="Catalog Sync"
          changeType="neutral"
          period="from backend"
          secondaryLabel="Active"
          secondaryValue={`${localProducts.filter((p) => p.status === 'In Stock').length}`}
          icon={Package}
        />
        <StatCard
          title="Total Physical Inventory"
          value={totalStockedUnits.toLocaleString()}
          change="Real-time"
          changeType="neutral"
          period="warehouse API"
          secondaryLabel="SKU Count"
          secondaryValue={localProducts.length.toString()}
          icon={Boxes}
        />
        <StatCard
          title="Par-Level Exceptions"
          value={`${lowStockCount + backorderCount} Items`}
          change={backorderCount > 0 ? `${backorderCount} Critical` : '0 Critical'}
          changeType={backorderCount > 0 ? 'negative' : 'neutral'}
          period="reorder queue"
          secondaryLabel="Backordered"
          secondaryValue={backorderCount.toString()}
          icon={AlertCircle}
        />
        <StatCard
          title="Regulatory Coverage"
          value="100% Certified"
          change="0 Exceptions"
          changeType="neutral"
          period="FERPA / ISO-13485"
          secondaryLabel="Audited"
          secondaryValue="Verified"
          icon={ShieldCheck}
        />
      </div>

      {/* Filters */}
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
              {cat === 'ALL' ? 'All Types' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0">
          <span className="text-slate-400 mr-1 text-[11px] font-medium uppercase tracking-wider">
            Stock:
          </span>
          {stockStatuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStockStatus(st)}
              className={`px-2 py-0.5 rounded text-xs transition-colors whitespace-nowrap ${
                selectedStockStatus === st
                  ? 'font-semibold text-slate-900 underline underline-offset-4 decoration-2 decoration-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        title="Diagnostic & Clinical Master Catalog"
        subtitle={`Showing ${filteredProducts.length} items`}
        data={filteredProducts}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={8}
        isLoading={isLoading}
        emptyMessage="No catalog items loaded. Connect backend endpoint to retrieve products."
        externalSearchQuery={searchQuery}
        onRowClick={(p) => setSelectedProduct(p)}
        searchFilter={(p, q) =>
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.batchLot.toLowerCase().includes(q)
        }
      />

      {/* Detail Modal */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-slate-400">
                  {selectedProduct.sku}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Close (ESC)
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Current Stock</span>
                <p className="font-mono text-lg font-bold text-slate-900 mt-0.5">
                  {selectedProduct.stockLevel.toLocaleString()} units
                </p>
              </div>
              <div>
                <span className="text-slate-400">Par-Level Threshold</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {selectedProduct.reorderPoint} units
                </p>
              </div>
              <div>
                <span className="text-slate-400">Regulatory Standard</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {selectedProduct.complianceStandard}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Batch Lot Number</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {selectedProduct.batchLot}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Institutional Bulk Rate</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  ${selectedProduct.institutionalBulkPrice} (MSRP ${selectedProduct.unitPrice})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Last Quality Audit</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {selectedProduct.lastQualityAudit}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-700 block mb-2">
                Quick Inventory Adjustments
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdjustStock(50)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  +50 Restock
                </button>
                <button
                  onClick={() => handleAdjustStock(200)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  +200 Bulk Delivery
                </button>
                <button
                  onClick={() => handleAdjustStock(-10)}
                  disabled={selectedProduct.stockLevel < 10}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  -10 Dispatched
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Create New Catalog Entry
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Register an assessment battery or curriculum licensing SKU
            </p>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Product / Protocol Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Function Screener v4"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CLN-EXF-101"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Classification
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ProductItem['category'],
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden bg-white"
                  >
                    <option value="Diagnostic Assessment">
                      Diagnostic Assessment
                    </option>
                    <option value="Digital License">Digital License</option>
                    <option value="Clinical Protocol">Clinical Protocol</option>
                    <option value="Curriculum Kit">Curriculum Kit</option>
                    <option value="Lab Consumable">Lab Consumable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Initial Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={formData.stockLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, stockLevel: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Reorder Par Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="40"
                    value={formData.reorderPoint}
                    onChange={(e) =>
                      setFormData({ ...formData, reorderPoint: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    District Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="450"
                    value={formData.institutionalBulkPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        institutionalBulkPrice: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Compliance Standard
                  </label>
                  <select
                    value={formData.complianceStandard}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        complianceStandard: e.target
                          .value as ProductItem['complianceStandard'],
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden bg-white"
                  >
                    <option value="FDA Class I">FDA Class I</option>
                    <option value="FERPA Compliant">FERPA Compliant</option>
                    <option value="ISO 13485">ISO 13485</option>
                    <option value="COPPA Verified">COPPA Verified</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Create SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
