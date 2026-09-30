import React, { useState } from 'react';
import type { ChartDataPoint } from '../types.ts';
import { BarChart3 } from 'lucide-react';

export interface SalesChartProps {
  data?: ChartDataPoint[];
  initialRange?: '7D' | '30D' | '90D' | '1Y';
  onRangeChange?: (range: '7D' | '30D' | '90D' | '1Y') => void;
  isLoading?: boolean;
}

type MetricKey = 'revenue' | 'units' | 'institutions' | 'margin';

export const SalesChart: React.FC<SalesChartProps> = ({
  data = [],
  initialRange = '30D',
  onRangeChange,
  isLoading = false,
}) => {
  const [range, setRange] = useState<'7D' | '30D' | '90D' | '1Y'>(initialRange);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleRangeSelect = (newRange: '7D' | '30D' | '90D' | '1Y') => {
    setRange(newRange);
    setHoveredPoint(null);
    setHoverIndex(null);
    onRangeChange?.(newRange);
  };

  const metricConfigs: Record<
    MetricKey,
    { label: string; format: (v: number) => string; unit: string }
  > = {
    revenue: {
      label: 'Gross Institutional Revenue',
      format: (v) => `$${v.toLocaleString()}`,
      unit: 'USD',
    },
    units: {
      label: 'Assessment Units Deployed',
      format: (v) => v.toLocaleString(),
      unit: 'Units',
    },
    institutions: {
      label: 'Active Contracting Districts',
      format: (v) => v.toString(),
      unit: 'Districts',
    },
    margin: {
      label: 'Operational Margin',
      format: (v) => `${v.toFixed(1)}%`,
      unit: '%',
    },
  };

  const hasData = data && data.length > 0;
  const values = hasData ? data.map((d) => d[activeMetric]) : [0];
  const minValue = hasData ? Math.min(...values) : 0;
  const maxValue = hasData ? Math.max(...values) : 100;
  const yPadding = (maxValue - minValue) * 0.15 || maxValue * 0.1 || 10;
  const yMin = Math.max(0, minValue - yPadding);
  const yMax = maxValue + yPadding;

  // SVG Geometry
  const width = 800;
  const height = 280;
  const paddingLeft = 60;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = hasData
    ? data.map((d, i) => {
        const x = paddingLeft + (i / (data.length - 1 || 1)) * chartWidth;
        const y =
          paddingTop +
          chartHeight -
          ((d[activeMetric] - yMin) / (yMax - yMin || 1)) * chartHeight;
        return { x, y, data: d };
      })
    : [];

  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    return `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${
          paddingTop + chartHeight
        } L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

  const totalValue = !hasData
    ? '—'
    : activeMetric === 'margin'
    ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) + '%'
    : activeMetric === 'revenue'
    ? `$${values.reduce((a, b) => a + b, 0).toLocaleString()}`
    : values.reduce((a, b) => a + b, 0).toLocaleString();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{metricConfigs[activeMetric].label}</span>
            <span aria-hidden="true">·</span>
            <span>Rolling Series</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold tabular-nums text-slate-900">
              {hoveredPoint
                ? metricConfigs[activeMetric].format(hoveredPoint[activeMetric])
                : totalValue}
            </span>
            <span className="text-xs text-slate-400">
              {hoveredPoint
                ? `on ${hoveredPoint.date}`
                : hasData
                ? `total across ${range} window`
                : 'Awaiting backend data stream'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
            {(['revenue', 'units', 'institutions', 'margin'] as MetricKey[]).map(
              (metric) => (
                <button
                  key={metric}
                  onClick={() => {
                    setActiveMetric(metric);
                    setHoveredPoint(null);
                    setHoverIndex(null);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    activeMetric === metric
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {metric === 'revenue'
                    ? 'Revenue'
                    : metric === 'units'
                    ? 'Units'
                    : metric === 'institutions'
                    ? 'Districts'
                    : 'Margin'}
                </button>
              )
            )}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
            {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRangeSelect(r)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  range === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Chart / Empty State */}
      <div className="relative mt-4 w-full select-none overflow-hidden">
        {isLoading ? (
          <div className="flex h-56 items-center justify-center text-xs text-slate-400 animate-pulse font-mono">
            Loading telemetry series from API...
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center h-56 text-center text-xs text-slate-400">
            <BarChart3 className="h-6 w-6 stroke-1 text-slate-300 mb-2" />
            <span className="font-medium text-slate-600">No Chart Data Available</span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Connect endpoint to supply time-series data array
            </span>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="clinicalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + chartHeight * ratio;
              const val = yMax - ratio * (yMax - yMin);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={idx === 4 ? 'none' : '2,2'}
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="font-mono text-[10px] fill-slate-400 tabular-nums"
                  >
                    {activeMetric === 'revenue'
                      ? `$${Math.round(val / 1000)}k`
                      : activeMetric === 'margin'
                      ? `${val.toFixed(0)}%`
                      : Math.round(val).toString()}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill="url(#clinicalGradient)" />

            {/* Technical Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Nodes */}
            {points.map((pt, idx) => {
              const isHovered = hoverIndex === idx;
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredPoint(pt.data);
                    setHoverIndex(idx);
                  }}
                >
                  <rect
                    x={pt.x - chartWidth / (points.length * 2)}
                    y={paddingTop}
                    width={chartWidth / points.length}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={paddingTop + chartHeight}
                      stroke="#64748b"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 4.5 : 2.5}
                    fill="#ffffff"
                    stroke="#0f172a"
                    strokeWidth={isHovered ? 2 : 1.5}
                    className="transition-all duration-150"
                  />

                  <text
                    x={pt.x}
                    y={height - 12}
                    textAnchor="middle"
                    className={`font-mono text-[10px] tabular-nums transition-colors ${
                      isHovered
                        ? 'fill-slate-900 font-semibold'
                        : 'fill-slate-400'
                    }`}
                  >
                    {pt.data.date}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Hover Tooltip */}
        {hoveredPoint && hoverIndex !== null && points[hoverIndex] && (
          <div
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
              top: `${Math.max(10, (points[hoverIndex].y / height) * 100 - 30)}%`,
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-slate-200 bg-slate-900 px-3 py-2 text-white shadow-md text-xs z-10 whitespace-nowrap"
          >
            <div className="text-[10px] font-mono text-slate-400">
              {hoveredPoint.date} · Verified Ledger
            </div>
            <div className="mt-1 font-mono text-xs font-semibold tabular-nums">
              {metricConfigs[activeMetric].format(hoveredPoint[activeMetric])}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-300">
              {hoveredPoint.units} units across {hoveredPoint.institutions} districts
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <div>Ready for backend API hook: (data: ChartDataPoint[])</div>
        <div className="font-mono tabular-nums">
          Status: {hasData ? 'Active Stream' : 'Awaiting Connection'}
        </div>
      </div>
    </div>
  );
};
