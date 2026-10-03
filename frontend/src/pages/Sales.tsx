import React, { useEffect, useState } from "react";
import { Receipt } from "lucide-react";

import { DataTable, type ColumnDef } from "../components/DataTable.tsx";
import { getSales } from "../api/sales";
import type { Sale } from "../types/sale";

interface SalesProps {
  searchQuery?: string;
}

export const Sales: React.FC<SalesProps> = ({ searchQuery = "" }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date selection
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Dates actually used for filtering
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getSales();
        setSales(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load sales");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSales();
  }, []);

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
      header: "Total Sales Price",
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
    const matchesSearch =
      sale.bill_no.toLowerCase().includes(query) ||
      sale.id.toString().includes(query) ||
      sale.school_id.toString().includes(query) ||
      sale.product_id.toString().includes(query);

    const matchesFromDate =
      !appliedFromDate || sale.sale_date >= appliedFromDate;

    const matchesToDate =
      !appliedToDate || sale.sale_date <= appliedToDate;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const handleDateSearch = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Sales & Revenue
        </h1>

        <p className="text-xs text-slate-500">
          View sales transaction records.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Total Sales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Sales
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {sales.length}
              </p>
            </div>

            <Receipt className="h-5 w-5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Search Button on the right */}
        <button
          type="button"
          onClick={handleDateSearch}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Search
        </button>
      </div>

      {/* Sales Table */}
      <DataTable
        title="Sales"
        subtitle={`Showing ${filteredSales.length} sales`}
        data={filteredSales}
        columns={columns}
        keyExtractor={(sale) => sale.id.toString()}
        pageSize={10}
        isLoading={isLoading}
        emptyMessage="No sales found."
        externalSearchQuery={searchQuery}
      />
    </div>
  );
};