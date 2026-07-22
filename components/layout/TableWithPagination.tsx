"use client";

import React from "react";
import Table from "@/components/ui/TableCompoenets";
import {
  TableColumn,
  TableWithPaginationProps,
  TABLE_ROWS_LIMIT_OPTIONS,
} from "@/utils/constants/default_data";

export default function TableWithPagination({
  thead,
  tbody = [],
  clickable = false,
  onRowClick,
  className = "",
  currentPage,
  totalPages,
  page,
  setPage,
  limit,
  setLimit,
  maxHeight,
  onSortChange,
  checkboxSelection,
  onSelectionChanged,
  floatingFilter,
  onFilterChange,
  totalCount,
  hideLimitSelector = false,
}: TableWithPaginationProps) {
  const isFullHeight = maxHeight === "100%";

  const total = totalCount !== undefined ? totalCount : totalPages * limit;
  const startEntry = tbody.length === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = tbody.length === 0 ? 0 : Math.min(page * limit, total);

  // Generate a sliding window of page numbers around the current page (max 5)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div
      className={
        isFullHeight ? "flex flex-col flex-1 min-h-0 h-full w-full" : undefined
      }
    >
      <div className={isFullHeight ? "flex-1 min-h-0" : undefined}>
        <Table
          thead={thead}
          tbody={tbody}
          clickable={clickable}
          onRowClick={onRowClick}
          className={
            className || "border-none rounded-none shadow-none bg-transparent"
          }
          maxHeight={maxHeight}
          onSortChange={onSortChange}
          checkboxSelection={checkboxSelection}
          onSelectionChanged={onSelectionChanged}
          floatingFilter={floatingFilter}
          onFilterChange={onFilterChange}
        />
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-(--border) shrink-0 select-none bg-(--bg-primary)">
        {/* Left Side: Entries Range + Rows Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-bold text-(--text-muted)">
          <span className="text-center sm:text-left select-none text-[11px] font-bold text-(--text-secondary)">
            Showing {startEntry} to {endEntry} of {total} entries
          </span>
          {!hideLimitSelector && (
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border border-(--border) rounded bg-(--bg-primary) text-(--text-primary) font-bold text-xs cursor-pointer focus:outline-none"
              >
                {TABLE_ROWS_LIMIT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Side: Prev / Numbers / Next Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-bold border border-(--border) rounded bg-(--bg-primary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer select-none text-(--text-secondary)"
          >
            Previous
          </button>

          {getPageNumbers().map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-xs font-bold border rounded transition cursor-pointer select-none ${
                  isActive
                    ? "bg-teal-500/10 text-teal-600 border-teal-500/30 font-black"
                    : "bg-(--bg-primary) text-(--text-secondary) border-(--border) hover:bg-(--bg-secondary)"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs font-bold border border-(--border) rounded bg-(--bg-primary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer select-none text-(--text-secondary)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
