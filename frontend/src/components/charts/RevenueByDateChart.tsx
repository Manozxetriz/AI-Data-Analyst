import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { Sale } from "../../types/sale";

interface RevenueByDateChartProps {
  sales: Sale[];
  isLoading?: boolean;
}

export const RevenueByDateChart: React.FC<
  RevenueByDateChartProps
> = ({ sales, isLoading = false }) => {
  const revenueByDate = sales.reduce<
    Record<string, number>
  >((acc, sale) => {
    const date = sale.sale_date;

    acc[date] =
      (acc[date] || 0) + Number(sale.sales_price);

    return acc;
  }, {});

  const data = Object.entries(revenueByDate)
    .map(([date, revenue]) => ({
      date,
      revenue,
    }))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
          Revenue Trend
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Sales revenue over time
        </p>
      </div>

      <div className="mt-4 h-[280px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No sales data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={false}
              />

             <Tooltip
                formatter={(value) =>
                    `$${Number(value ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    })}`
                }
                />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0f172a"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};