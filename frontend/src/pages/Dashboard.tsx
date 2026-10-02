import React, { useEffect, useState } from "react";
import { StatCard } from "../components/StatCard.tsx";
import { DataTable, type ColumnDef } from "../components/DataTable.tsx";
import { getSales } from "../api/sales";
import { getSchools } from "../api/schools";
import { getProducts } from "../api/products";

import type { Sale } from "../types/sale";
import type { School } from "../types/school";
import type { Product } from "../types/product";
import type { PageId } from "../types.ts";
import { RevenueBySchoolChart } from "../components/charts/RevenueBySchoolChart";
import { RevenueByDateChart } from "../components/charts/RevenueByDateChart";
import {
  DollarSign,
  GraduationCap,
  Package,
  Receipt,
  ArrowRight,
  LogOut,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
  searchQuery?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onLogout,
  searchQuery = "",
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [salesData, schoolsData, productsData] =
          await Promise.all([
            getSales(),
            getSchools(),
            getProducts(),
          ]);

        setSales(salesData);
        setSchools(schoolsData);
        setProducts(productsData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalRevenue = sales.reduce(
    (total, sale) => total + Number(sale.sales_price),
    0
  );

  const totalTransactions = sales.length;
  const totalSchools = schools.length;
  const totalProducts = products.length;

  const columns: ColumnDef<Sale>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      accessor: (sale) => (
        <span className="font-mono text-slate-900">
          {sale.id}
        </span>
      ),
    },
    {
      key: "bill_no",
      header: "Bill No",
      sortable: true,
      accessor: (sale) => (
        <span className="font-medium text-slate-900">
          {sale.bill_no}
        </span>
      ),
    },
    {
      key: "sale_date",
      header: "Sale Date",
      sortable: true,
      accessor: (sale) => (
        <span className="font-mono text-slate-700">
          {sale.sale_date}
        </span>
      ),
    },
    {
      key: "school_id",
      header: "School ID",
      sortable: true,
      accessor: (sale) => (
        <span className="font-mono text-slate-700">
          {sale.school_id}
        </span>
      ),
    },
    {
      key: "product_id",
      header: "Product ID",
      sortable: true,
      accessor: (sale) => (
        <span className="font-mono text-slate-700">
          {sale.product_id}
        </span>
      ),
    },
    {
      key: "sales_price",
      header: "Sales Price",
      sortable: true,
      align: "right",
      accessor: (sale) => (
        <span className="font-mono font-medium text-slate-900">
          {Number(sale.sales_price).toFixed(2)}
        </span>
      ),
    },
  ];

  const query = searchQuery.toLowerCase();

  const filteredSales = sales.filter((sale) => {
    if (!query) {
      return true;
    }

    return (
      sale.bill_no.toLowerCase().includes(query) ||
      sale.id.toString().includes(query) ||
      sale.school_id.toString().includes(query) ||
      sale.product_id.toString().includes(query)
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Institutional Operations Ledger
          </h1>

          <p className="text-xs text-slate-500">
            Real-time sales, school, and product data from the backend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={() => onNavigate("sales")}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>View Sales</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change={`${totalTransactions} transactions`}
          changeType="neutral"
          period="from backend"
          secondaryLabel="Transactions"
          secondaryValue={totalTransactions.toString()}
          icon={DollarSign}
          onClick={() => onNavigate("sales")}
        />

        <StatCard
          title="Schools"
          value={`${totalSchools}`}
          change="Active records"
          changeType="neutral"
          period="from backend"
          secondaryLabel="Schools"
          secondaryValue={totalSchools.toString()}
          icon={GraduationCap}
          onClick={() => onNavigate("schools")}
        />

        <StatCard
          title="Products"
          value={`${totalProducts}`}
          change="Catalog records"
          changeType="neutral"
          period="from backend"
          secondaryLabel="Products"
          secondaryValue={totalProducts.toString()}
          icon={Package}
          onClick={() => onNavigate("products")}
        />

        <StatCard
          title="Sales Records"
          value={`${totalTransactions}`}
          change="Database records"
          changeType="neutral"
          period="from backend"
          secondaryLabel="Records"
          secondaryValue={totalTransactions.toString()}
          icon={Receipt}
          onClick={() => onNavigate("sales")}
        />

      </div>
          {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <RevenueByDateChart
            sales={sales}
            isLoading={isLoading}
          />

          <RevenueBySchoolChart
            sales={sales}
            isLoading={isLoading}
          />

        </div>
      {/* Recent Sales */}
      <div>
        <DataTable
          title="Recent Sales Transactions"
          subtitle={`Showing ${filteredSales.length} sales from backend`}
          data={filteredSales}
          columns={columns}
          keyExtractor={(sale) => sale.id.toString()}
          pageSize={5}
          isLoading={isLoading}
          emptyMessage="No sales found in backend."
          externalSearchQuery={searchQuery}
          onRowClick={(sale) => setSelectedSale(sale)}
        />
      </div>

      {/* Schools and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Schools */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-800" />

              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Schools
              </h3>
            </div>

            <button
              onClick={() => onNavigate("schools")}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </button>

          </div>

          <div className="mt-4">

            {isLoading ? (
              <p className="text-xs text-slate-400">
                Loading schools...
              </p>
            ) : schools.length === 0 ? (
              <p className="text-xs text-slate-400">
                No schools found.
              </p>
            ) : (
              <div className="space-y-3">

                {schools.slice(0, 5).map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {school.name}
                      </p>

                      {school.address && (
                        <p className="text-[11px] text-slate-400">
                          {school.address}
                        </p>
                      )}
                    </div>

                    <span className="font-mono text-xs text-slate-400">
                      #{school.id}
                    </span>
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>

        {/* Products */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-800" />

              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Products
              </h3>
            </div>

            <button
              onClick={() => onNavigate("products")}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </button>

          </div>

          <div className="mt-4">

            {isLoading ? (
              <p className="text-xs text-slate-400">
                Loading products...
              </p>
            ) : products.length === 0 ? (
              <p className="text-xs text-slate-400">
                No products found.
              </p>
            ) : (
              <div className="space-y-3">

                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {product.name}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Selling Price:{" "}
                        {Number(product.selling_price).toFixed(2)}
                      </p>
                    </div>

                    <span className="font-mono text-xs text-slate-400">
                      #{product.id}
                    </span>
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>

      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between border-b border-slate-100 pb-4">

              <div>
                <span className="font-mono text-xs text-slate-400">
                  Sale #{selectedSale.id}
                </span>

                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  Bill #{selectedSale.bill_no}
                </h3>
              </div>

              <button
                onClick={() => setSelectedSale(null)}
                className="text-xs text-slate-400 hover:text-slate-700 rounded p-1"
              >
                Close
              </button>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">

              <div>
                <span className="text-slate-400">
                  Sale Date
                </span>

                <p className="font-mono font-medium text-slate-800 mt-0.5">
                  {selectedSale.sale_date}
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  School ID
                </span>

                <p className="font-mono font-medium text-slate-800 mt-0.5">
                  {selectedSale.school_id}
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  Product ID
                </span>

                <p className="font-mono font-medium text-slate-800 mt-0.5">
                  {selectedSale.product_id}
                </p>
              </div>

              <div>
                <span className="text-slate-400">
                  Sales Price
                </span>

                <p className="font-mono text-base font-semibold text-slate-900 mt-0.5">
                  {Number(selectedSale.sales_price).toFixed(2)}
                </p>
              </div>

            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Loaded from backend
              </span>

              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};