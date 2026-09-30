import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  title?: string;
  subtitle?: string;
  onRowClick?: (item: T) => void;
  pageSize?: number;
  emptyMessage?: string;
  isLoading?: boolean;
  searchFilter?: (item: T, query: string) => boolean;
  externalSearchQuery?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  onRowClick,
  pageSize = 10,
  emptyMessage = 'No institutional records found matching criteria.',
  isLoading = false,
  searchFilter,
  externalSearchQuery = '',
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const activeSearch = externalSearchQuery || internalSearch;

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!activeSearch.trim()) return data;
    if (searchFilter) {
      return data.filter((item) => searchFilter(item, activeSearch.toLowerCase()));
    }
    // Default search across all string values
    return data.filter((item) => {
      return Object.values(item as Record<string, unknown>).some((val) =>
        String(val).toLowerCase().includes(activeSearch.toLowerCase())
      );
    });
  }, [data, activeSearch, searchFilter]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortKey, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Table Header Section */}
      {(title || !externalSearchQuery) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-4">
          {title && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          )}

          {!externalSearchQuery && (
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <input
                  type="text"
                  value={internalSearch}
                  onChange={(e) => {
                    setInternalSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter records..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`h-9 px-4 font-medium text-slate-500 text-[11px] uppercase tracking-wider select-none ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className={`inline-flex items-center gap-1 group font-medium text-slate-600 hover:text-slate-900 focus:outline-hidden ${
                          col.align === 'right' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        <span className="text-slate-400 group-hover:text-slate-700">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="h-10 animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5">
                      <div className="h-3.5 bg-slate-100 rounded-sm w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : currentRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs text-slate-400"
                >
                  <Filter className="mx-auto h-5 w-5 stroke-1 text-slate-300 mb-2" />
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentRecords.map((item) => {
                const key = keyExtractor(item);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`h-10 transition-colors ${
                      onRowClick
                        ? 'cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/50'
                        : 'hover:bg-slate-50/40'
                    }`}
                  >
                    {columns.map((col) => {
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-2.5 whitespace-nowrap ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          } ${col.className || ''}`}
                        >
                          {col.accessor
                            ? col.accessor(item)
                            : String(
                                (item as Record<string, unknown>)[col.key] ?? '—'
                              )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <span className="font-mono font-medium text-slate-800 tabular-nums">
            {sortedData.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            –
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>
          <span>of</span>
          <span className="font-mono font-medium text-slate-800 tabular-nums">
            {sortedData.length}
          </span>
          <span>records</span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="font-mono text-xs tabular-nums text-slate-600 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
            aria-label="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
