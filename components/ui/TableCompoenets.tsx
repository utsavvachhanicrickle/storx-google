"use client";

import React, { useMemo, useState, useEffect } from "react";

import {
  TableColumn,
  TableButton,
  TableProps,
} from "@/utils/constants/default_data";
export type { TableColumn, TableButton, TableProps };

const ArrowUpIcon = () => (
  <svg
    className="w-2.5 h-2.5 shrink-0 text-teal-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
);

const ArrowDownIcon = () => (
  <svg
    className="w-2.5 h-2.5 shrink-0 text-teal-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-(--text-muted)"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const formatRelativeTime = (value: any) => {
  if (!value) return "";

  if (
    typeof value === "string" &&
    (value.endsWith("ago") || value.endsWith("now"))
  ) {
    return value;
  }

  const dateVal = new Date(value);
  if (isNaN(dateVal.getTime())) {
    return String(value);
  }

  const now = new Date();
  const diffMs = now.getTime() - dateVal.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    return "just now";
  }

  if (diffHours < 24) {
    const hours = Math.round(diffHours);
    return `${hours === 0 ? 1 : hours}h ago`;
  } else {
    const days = Math.round(diffHours / 24);
    return `${days}d ago`;
  }
};

const renderStatus = (value: string) => (
  <span
    className={`rounded-md px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
      value?.toUpperCase() === "PAID" || value?.toUpperCase() === "SUCCESS"
        ? "bg-green-500/10 text-green-500"
        : value?.toUpperCase() === "PENDING"
          ? "bg-yellow-500/10 text-yellow-500"
          : "bg-red-500/10 text-red-500"
    }`}
  >
    {value}
  </span>
);

export default function Table({
  headers,
  thead,
  tbody = [],
  clickable = false,
  className = "",
  tableClassName = "",
  rowClassName = "",
  onRowClick,
  actions = [],
  showHead = true,
  maxHeight,
  onSortChange,
  checkboxSelection = false,
  onSelectionChanged,
  floatingFilter = false,
  onFilterChange,
}: TableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({});

  const [activeSortBy, setActiveSortBy] = useState<string>("");
  const [activeSortOrder, setActiveSortOrder] = useState<"asc" | "desc" | "">(
    "",
  );

  // Sync initial column sorting if defined on standard columns
  useEffect(() => {
    const sortedCol = thead.find(
      (col) => col.sortOrder === "asc" || col.sortOrder === "desc",
    );
    if (sortedCol) {
      setActiveSortBy(sortedCol.key);
      setActiveSortOrder(sortedCol.sortOrder || "");
    }
  }, [thead]);

  const getRowKey = (row: any, index: number) =>
    row.id || row.job_id || row.email || String(index);

  // Sync state selection change event
  useEffect(() => {
    if (checkboxSelection && onSelectionChanged) {
      const selectedRows = tbody.filter(
        (row) => !!selectedKeys[getRowKey(row, 0)],
      );
      onSelectionChanged(selectedRows);
    }
  }, [selectedKeys, tbody, checkboxSelection]);

  const handleToggleRow = (key: string) => {
    setSelectedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleAll = () => {
    const allKeys = tbody.map((row, i) => getRowKey(row, i));
    const allSelected =
      allKeys.length > 0 && allKeys.every((k) => !!selectedKeys[k]);

    const nextKeys = { ...selectedKeys };
    allKeys.forEach((k) => {
      if (allSelected) {
        delete nextKeys[k];
      } else {
        nextKeys[k] = true;
      }
    });
    setSelectedKeys(nextKeys);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (onFilterChange) {
      onFilterChange({
        global: {
          filter: text,
        },
      });
    }
  };

  const filteredBody = useMemo(() => {
    if (!floatingFilter || !searchQuery) return tbody;
    const q = searchQuery.toLowerCase().trim();
    return tbody.filter((row) => {
      return thead.some((col) => {
        const val = row[col.key];
        if (val === undefined || val === null) return false;
        if (typeof val === "object") {
          return Object.values(val).some(
            (v) =>
              v !== null &&
              v !== undefined &&
              String(v).toLowerCase().includes(q),
          );
        }
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [tbody, thead, floatingFilter, searchQuery]);

  const sortedBody = useMemo(() => {
    // If the parent handles sorting natively, trust parent tbody
    if (onSortChange) return filteredBody;

    const baseList = [...filteredBody];
    if (!activeSortBy || !activeSortOrder) return baseList;

    baseList.sort((a, b) => {
      let valA = a[activeSortBy];
      let valB = b[activeSortBy];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return activeSortOrder === "asc" ? -1 : 1;
      if (strA > strB) return activeSortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return baseList;
  }, [filteredBody, activeSortBy, activeSortOrder, onSortChange]);

  const handleHeaderClick = (colKey: string, isSortable: boolean) => {
    if (!isSortable) return;

    let nextOrder: "asc" | "desc" | "" = "asc";
    if (activeSortBy === colKey) {
      nextOrder =
        activeSortOrder === "asc"
          ? "desc"
          : activeSortOrder === "desc"
            ? ""
            : "asc";
    }

    setActiveSortBy(colKey);
    setActiveSortOrder(nextOrder);

    if (onSortChange) {
      onSortChange(colKey, nextOrder);
    }
  };

  const getColStyle = (head: TableColumn) => {
    let flex = head.flex !== undefined ? head.flex : 1;
    let minWidth = head.minWidth !== undefined ? head.minWidth : 120;
    let width: number | undefined = head.width;
    const maxWidth: number | undefined = head.maxWidth;

    if (head.flex === undefined && head.width === undefined) {
      if (
        head.key === "name" ||
        head.key === "resource" ||
        head.key === "actor"
      ) {
        flex = 2;
        minWidth = 220;
      } else if (head.key === "services") {
        flex = 1.5;
        minWidth = 220;
      } else if (head.key === "action" || head.type === "actions") {
        flex = 0;
        width = 160;
        minWidth = 150;
      } else if (head.type === "status") {
        flex = 0;
        width = 130;
        minWidth = 110;
      }
    }

    const colStyle: React.CSSProperties = {};
    if (width !== undefined) {
      colStyle.width = `${width}px`;
      colStyle.flex = `0 0 ${width}px`;
    } else if (flex !== undefined && flex > 0) {
      colStyle.flex = `${flex} 1 0%`;
    } else {
      colStyle.flex = `1 1 0%`;
    }
    if (minWidth !== undefined) {
      colStyle.minWidth = `${minWidth}px`;
    }
    if (maxWidth !== undefined) {
      colStyle.maxWidth = `${maxWidth}px`;
    }
    return colStyle;
  };

  const handleRowClicked = (row: any, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target) {
      const closestCursor = target.closest(".cursor-pointer");
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        (closestCursor && closestCursor !== event.currentTarget)
      ) {
        return;
      }
    }

    if (clickable && onRowClick) {
      onRowClick(row);
    }
  };

  const checkboxStyle = { width: "40px", minWidth: "40px", maxWidth: "40px" };
  const isFullHeight = maxHeight === "100%";

  const hasCustomBorder = className.includes("border-none") || className.includes("border-0");
  const hasCustomShadow = className.includes("shadow-none");
  const hasCustomBg = className.includes("bg-transparent") || className.includes("bg-");
  const hasCustomRounded = className.includes("rounded-none");

  const borderClass = hasCustomBorder ? "" : "border border-(--border)";
  const shadowClass = hasCustomShadow ? "" : "shadow-(--shadow-sm)";
  const bgClass = hasCustomBg ? "" : "bg-(--bg-primary)";
  const roundedClass = hasCustomRounded ? "" : "rounded-sm";

  return (
    <div
      className={`w-full overflow-hidden ${roundedClass} ${borderClass} ${bgClass} ${shadowClass} ${isFullHeight ? "h-full flex flex-col" : ""} ${className}`}
    >
      {/* Search Filter Header */}
      {floatingFilter && (
        <div className="border-b border-(--border-light) bg-(--bg-primary) px-6 py-4 flex items-center justify-between shrink-0 select-none">
          <div className="relative w-72 max-w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search table..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-secondary)/10 focus:outline-none focus:border-(--primary) transition"
            />
          </div>
        </div>
      )}

      {headers && (
        <div className="border-b border-(--border-light) bg-(--bg-secondary) px-6 py-5 shrink-0 select-none">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-(--text-primary)">
            {headers}
          </h3>
        </div>
      )}

      {/* Table Main Content with Horizontal Scroll */}
      <div className="w-full overflow-x-auto flex-1 min-h-0">
        <div className="min-w-max w-full flex flex-col">
          {/* Header Row */}
          {showHead && (
            <div className="flex items-center bg-(--bg-secondary)/30 border-b border-(--border) px-6 py-3 border-l-2 border-l-transparent select-none text-[10px] font-black uppercase text-(--text-muted) tracking-wider shrink-0">
              {checkboxSelection && (
                <div
                  style={checkboxStyle}
                  className="flex items-center justify-center text-center"
                >
                  <input
                    type="checkbox"
                    checked={
                      tbody.length > 0 &&
                      tbody.every((row, i) => !!selectedKeys[getRowKey(row, i)])
                    }
                    ref={(el) => {
                      if (el) {
                        const anySelected = tbody.some(
                          (row, i) => !!selectedKeys[getRowKey(row, i)],
                        );
                        const allSelected = tbody.every(
                          (row, i) => !!selectedKeys[getRowKey(row, i)],
                        );
                        el.indeterminate = anySelected && !allSelected;
                      }
                    }}
                    onChange={handleToggleAll}
                    className="w-4 h-4 rounded-md accent-(--primary) border-(--border-strong) cursor-pointer"
                  />
                </div>
              )}
              {thead.map((col, colIndex) => {
                const isLast = colIndex === thead.length - 1;
                const alignmentClass =
                  col.className?.includes("text-right") ||
                  col.className?.includes("text-end")
                    ? "justify-end text-right"
                    : col.className?.includes("text-center")
                      ? "justify-center text-center"
                      : col.className?.includes("text-left") ||
                          col.className?.includes("text-start")
                        ? "justify-start text-left"
                        : isLast
                          ? "justify-end text-right"
                          : "justify-start text-left";

                const isSortable = col.sortable !== false;
                const colSortOrder =
                  activeSortBy === col.key ? activeSortOrder : col.sortOrder;
                const isSorted =
                  colSortOrder === "asc" || colSortOrder === "desc";

                return (
                  <div
                    key={col.key}
                    style={getColStyle(col)}
                    onClick={() => handleHeaderClick(col.key, isSortable)}
                    className={`flex items-center gap-1.5 px-4 font-black text-(--text-muted) tracking-wider text-[10px] select-none ${alignmentClass} ${isSortable ? "cursor-pointer hover:text-(--text-primary) transition-colors" : ""}`}
                  >
                    {col.headerRenderer ? col.headerRenderer({}) : col.label}
                    {isSortable && isSorted && (
                      <span className="flex flex-col opacity-80 shrink-0">
                        {colSortOrder === "asc" && <ArrowUpIcon />}
                        {colSortOrder === "desc" && <ArrowDownIcon />}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Body Rows */}
          <div className="flex flex-col flex-1 divide-y divide-(--border-light)">
            {sortedBody.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs font-bold text-(--text-muted)">
                No data available
              </div>
            ) : (
              sortedBody.map((row, rowIndex) => (
                <div
                  key={getRowKey(row, rowIndex)}
                  onClick={(e) => handleRowClicked(row, e)}
                  className={`flex items-center px-6 py-3 border-l-2 border-l-transparent transition-colors hover:bg-(--bg-active) hover:border-l-(--primary) ${clickable ? "cursor-pointer" : ""} ${rowClassName}`}
                >
                  {checkboxSelection && (
                    <div
                      style={checkboxStyle}
                      className="flex items-center justify-center text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedKeys[getRowKey(row, rowIndex)]}
                        onChange={() =>
                          handleToggleRow(getRowKey(row, rowIndex))
                        }
                        className="w-4 h-4 rounded-md accent-(--primary) border-(--border-strong) cursor-pointer"
                      />
                    </div>
                  )}
                  {thead.map((col, colIndex) => {
                    const isLast = colIndex === thead.length - 1;
                    const alignmentClass =
                      col.className?.includes("text-right") ||
                      col.className?.includes("text-end")
                        ? "justify-end text-right"
                        : col.className?.includes("text-center")
                          ? "justify-center text-center"
                          : col.className?.includes("text-left") ||
                              col.className?.includes("text-start")
                            ? "justify-start text-left"
                            : isLast
                              ? "justify-end text-right"
                              : "justify-start text-left";

                    const value = row[col.key];
                    let cellContent: React.ReactNode = value;

                    if (col.type === "component" && col.value) {
                      cellContent = col.value(row);
                    } else if (col.type === "status") {
                      cellContent = renderStatus(value);
                    } else if (col.type === "image") {
                      cellContent = (
                        <img
                          src={value}
                          className="h-10 w-10 rounded-md object-cover"
                          alt=""
                        />
                      );
                    } else if (col.type === "link") {
                      cellContent = (
                        <a
                          href={value}
                          className="font-bold text-(--primary) hover:underline"
                        >
                          Open
                        </a>
                      );
                    } else if (col.type === "actions") {
                      cellContent = (
                        <div className="flex items-center gap-2">
                          {actions.map((btn, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                btn.onClick?.(row);
                              }}
                              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold text-(--primary) hover:bg-(--primary)/20 ${btn.className}`}
                            >
                              {btn.icon ? btn.icon : null}
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      );
                    } else if (col.type === "time") {
                      cellContent = (
                        <p
                          className={
                            col.cellClassName
                              ? col.cellClassName(value)
                              : "text-xs text-(--text-muted)"
                          }
                        >
                          {formatRelativeTime(value)}
                        </p>
                      );
                    } else {
                      cellContent = (
                        <p
                          className={
                            col.cellClassName ? col.cellClassName(value) : ""
                          }
                        >
                          {value}
                        </p>
                      );
                    }

                    return (
                      <div
                        key={col.key}
                        style={getColStyle(col)}
                        className={`px-4 text-xs font-extrabold text-(--text-primary) flex items-center ${col.wrapText ? "whitespace-normal wrap-break-word py-1.5" : "overflow-hidden truncate"} ${alignmentClass} ${col.cellClassName ? col.cellClassName(value) : ""}`}
                      >
                        {cellContent}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
