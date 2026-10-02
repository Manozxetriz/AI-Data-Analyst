import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { Sale } from "../../types/sale";

interface RevenueBySchoolChartProps {
  sales: Sale[];
  isLoading?: boolean;
}

const COLORS = [
  "#0f172a",
  "#334155",
  "#475569",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
];

export const RevenueBySchoolChart: React.FC<
  RevenueBySchoolChartProps
> = ({ sales, isLoading = false }) => {
  const revenueBySchool = sales.reduce<
    Record<string, number>
  >((acc, sale) => {
    const school = `School #${sale.school_id}`;

    acc[school] =
      (acc[school] || 0) + Number(sale.sales_price);

    return acc;
  }, {});

  const data = Object.entries(revenueBySchool)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
          Revenue by School
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Revenue distribution across schools
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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) =>
                `$${Number(value ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`
                }
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};