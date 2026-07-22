"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAuditLogs, fetchAuditActions } from "@/store/slices/auditSlice";
import { auditService } from "@/services/auditService";
import TableWithPagination from "@/components/layout/TableWithPagination";
import { TableColumn } from "@/components/ui/TableCompoenets";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@/components/ui/Button";
import toast from "@/components/Toast";

interface LogRow {
  action: string;
  actor: string;
  actor_email: string;
  actor_id: string;
  id: string;
  ip_address: string;
  message: string;
  resource: string;
  status: string;
  timestamp: string;
}

export default function AuditPage() {
  const dispatch = useAppDispatch();
  const { items, actions, nextCursor, totalCount, loading, error } =
    useAppSelector((state) => state.audit);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("All Events");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [limit, setLimit] = useState(10);
  const [gridKey, setGridKey] = useState(0);

  // Sorting States
  const [sortBy, setSortBy] = useState<string>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("desc");

  // True when the user has typed anything into filters — used to decide empty-state messages
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "All Statuses" ||
    fromDate !== "" ||
    toDate !== "";

  const [page, setPage] = useState(1);

  const lastFetchedRef = useRef<string>("");

  // Load action categories on mount
  useEffect(() => {
    dispatch(fetchAuditActions());
  }, [dispatch]);

  // Load audit logs when filter criteria changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Build RFC3339 timestamps for date range if selected
      const fromRFC = fromDate ? `${fromDate}T00:00:00Z` : "";
      const toRFC = toDate ? `${toDate}T23:59:59Z` : "";

      const filterStr = JSON.stringify({
        selectedAction,
        selectedStatus,
        searchQuery,
        fromRFC,
        toRFC,
      });

      if (lastFetchedRef.current === filterStr) {
        return;
      }
      lastFetchedRef.current = filterStr;

      dispatch(
        fetchAuditLogs({
          action: selectedAction === "All Events" ? "" : selectedAction,
          status:
            selectedStatus === "All Statuses"
              ? ""
              : selectedStatus.toLowerCase(),
          search: searchQuery,
          from: fromRFC,
          to: toRFC,
          limit: 1000,
        }),
      );
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    dispatch,
    searchQuery,
    selectedAction,
    selectedStatus,
    fromDate,
    toDate,
  ]);

  const handleActionChange = (val: string) => {
    setSelectedAction(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setPage(1);
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setPage(1);
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setPage(1);
  };

  const handleLimitChange = (val: number) => {
    setLimit(val);
    setPage(1);
  };

  const sortedItems = useMemo(() => {
    const baseList = [...items];
    if (!sortBy || !sortOrder) return baseList;

    baseList.sort((a, b) => {
      let valA = a[sortBy as keyof LogRow];
      let valB = b[sortBy as keyof LogRow];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      // Special handling for timestamp sorting
      if (sortBy === "timestamp") {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        if (!isNaN(timeA) && !isNaN(timeB)) {
          return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        }
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return baseList;
  }, [items, sortBy, sortOrder]);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return sortedItems.slice(startIndex, startIndex + limit);
  }, [sortedItems, page, limit]);

  // CSV Export Trigger
  const handleExportCSV = async () => {
    const fromRFC = fromDate ? `${fromDate}T00:00:00Z` : "";
    const toRFC = toDate ? `${toDate}T23:59:59Z` : "";

    toast.info("Exporting audit logs...");

    try {
      const blob = await auditService.exportAuditLogs({
        action: selectedAction === "All Events" ? "" : selectedAction,
        status:
          selectedStatus === "All Statuses" ? "" : selectedStatus.toLowerCase(),
        search: searchQuery,
        from: fromRFC,
        to: toRFC,
        limit: limit, // Only download the particular page's size!
        page: page, // Only download the particular page!
        sortBy: sortBy,
        sortOrder: sortOrder,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const blobData = blob instanceof Blob ? blob : new Blob([blob]);
      const url = window.URL.createObjectURL(blobData);
      
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "system_audit_logs.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Audit logs exported successfully.");
    } catch (err) {
      console.error("Failed to export audit logs:", err);
      toast.error("Failed to export audit logs. Please try again.");
    }
  };



  const auditTableHead: TableColumn[] = [
    {
      key: "timestamp",
      label: "TIMESTAMP",
      flex: 1.2,
      minWidth: 220,
      type: "component",
      floatingFilter: false,
      sortOrder: "desc",
      className:
        "px-6 py-4 text-start whitespace-nowrap text-xs font-bold text-(--text-secondary)",
      value: (row: LogRow) => {
        let displayTime = row.timestamp || "";
        if (displayTime) {
          try {
            const date = new Date(displayTime);
            if (!isNaN(date.getTime())) {
              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              const month = months[date.getMonth()];
              const day = date.getDate();
              const year = date.getFullYear();

              let hours = date.getHours();
              const minutes = String(date.getMinutes()).padStart(2, "0");
              const ampm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12;
              hours = hours ? hours : 12;
              displayTime = `${month} ${day} ${year}, ${hours}:${minutes} ${ampm}`;
            }
          } catch (e) {}
        }
        return (
          <span className="text-xs text-(--text-secondary) font-bold text-start w-full">
            {displayTime}
          </span>
        );
      },
    },
    {
      key: "actor",
      label: "ACTOR",
      flex: 1,
      floatingFilter: false,
      filter: true,
      minWidth: 150,
      className: "px-6 py-4 text-start font-bold",
    },
    {
      key: "action",
      label: "ACTION",
      type: "component",
      flex: 1.2,
      minWidth: 220,
      wrapText: true,
      className: "px-6 py-4 text-start whitespace-nowrap",
      value: (row: LogRow) => {
        const actionStr = row.action || "SYSTEM_EVENT";

        // Color mapper based on action type
        let colorClass =
          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

        if (
          actionStr.includes("ERROR") ||
          actionStr.includes("FAIL") ||
          actionStr.includes("DENY") ||
          actionStr.includes("THREAT")
        ) {
          colorClass = "bg-rose-500/10 text-rose-600 border-rose-500/20";
        } else if (
          actionStr.includes("RESTORE") ||
          actionStr.includes("INIT")
        ) {
          colorClass = "bg-violet-500/10 text-violet-600 border-violet-500/20";
        } else if (
          actionStr.includes("DELETE") ||
          actionStr.includes("REMOVE")
        ) {
          colorClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
        } else if (actionStr.includes("CREATE")) {
          colorClass = "bg-sky-500/10 text-sky-600 border-sky-500/20";
        } else if (actionStr.includes("SYNC")) {
          colorClass = "bg-teal-500/10 text-teal-600 border-teal-500/20";
        }

        return (
          <span
            className={`px-3 py-1.5 rounded-[6px] text-xs font-bold border whitespace-nowrap inline-block ${colorClass}`}
          >
            {actionStr.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "resource",
      label: "RESOURCE",
      flex: 1,
      minWidth: 100,
      className: "px-6 py-4 text-start",
      value: (row: LogRow) => {
        return (
          <span className="text-xs text-(--text-secondary) font-mono text-start w-full">
            {JSON.stringify(row.resource) || "--"}
          </span>
        );
      },
    },
    {
      key: "message",
      label: "MESSAGE",
      flex: 2.0,
      minWidth: 200,
      wrapText: true,
      className: "px-6 py-4 text-start",
      value: (row: LogRow) => {
        return (
          <span className="text-xs text-(--text-secondary) font-mono text-start w-full">
            {typeof row.message === "string" ? row.message : JSON.stringify(row.message) || "--"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "STATUS",
      type: "component",
      flex: 1,
      minWidth: 100,
      floatingFilter: false,
      className: "px-6 py-4 text-start",
      value: (row: LogRow) => {
        let statusClass =
          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
        let dotColor = "bg-emerald-500";
        let statusLabel = String(row.status || "SUCCESS").toUpperCase();

        if (row.status === "failed") {
          statusClass = "bg-rose-500/10 text-rose-600 border-rose-500/20";
          dotColor = "bg-rose-500";
        } else {
          statusClass = "bg-green-500/10 text-green-600 border-green-500/20";
          dotColor = "bg-green-500";
        }

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[9px] font-black tracking-wide border ${statusClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-md ${dotColor}`} />
            {statusLabel}
          </span>
        );
      },
    },
    {
      key: "ip_address",
      label: "IP ADDRESS",
      type: "component",
      floatingFilter: false,
      flex: 0.8,
      minWidth: 160,
      className: "px-6 py-4 text-start whitespace-nowrap",
      value: (row: LogRow) => (
        <span className="text-xs text-(--text-secondary) font-mono text-start w-full">
          {row.ip_address || "Internal API"}
        </span>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh+150px)] md:h-[calc(100vh-120px)] flex flex-col gap-4 text-(--text-primary) overflow-hidden">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary) tracking-tight">
            System Audit Logs
          </h1>
          <p className="mt-1 text-sm text-(--text-muted) font-medium">
            Immutable ledger of all administrative and system actions.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          className="flex items-center gap-2 shrink-0"
        >
          <DownloadIcon sx={{ fontSize: 18 }} />
          Export CSV
        </Button>
      </div>

      {/* FILTER & TABLE CONTAINER */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-[6px] overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        {/* FILTERS PANEL */}
        <div className="p-4 border-b border-(--border) shrink-0">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Text Search Input */}
            <input
              placeholder="Search by actor, resource, or message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 text-sm border border-(--border) rounded-[4px] bg-(--bg-primary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--border) w-full animate-fade-in"
            />

            {/* Action Dropdown */}
            <select
              value={selectedAction}
              onChange={(e) => handleActionChange(e.target.value)}
              className="px-3 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--primary) w-full md:w-auto md:min-w-[140px] transition"
            >
              <option value="All Events">All Events</option>
              {Array.isArray(actions) &&
                actions.map((act) => (
                  <option key={act} value={act}>
                    {act.replace(/_/g, " ")}
                  </option>
                ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--primary) w-full md:w-auto md:min-w-[120px] transition"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>

            {/* From Date */}
            <div className="flex items-center gap-2 border border-(--border) rounded-[4px] px-2.5 py-1.5 bg-(--bg-secondary) w-full md:w-auto md:min-w-[150px]">
              <span className="text-xs text-(--text-muted) font-bold select-none shrink-0">
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                className="bg-transparent text-xs text-(--text-primary) focus:outline-none cursor-pointer w-full"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-2 border border-(--border) rounded-[4px] px-2.5 py-1.5 bg-(--bg-secondary) w-full md:w-auto md:min-w-[150px]">
              <span className="text-xs text-(--text-muted) font-bold select-none shrink-0">
                To:
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                className="bg-transparent text-xs text-(--text-primary) focus:outline-none cursor-pointer w-full"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchQuery !== "" ||
              selectedAction !== "All Events" ||
              selectedStatus !== "All Statuses" ||
              fromDate !== "" ||
              toDate !== "") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAction("All Events");
                  setSelectedStatus("All Statuses");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                  setSortBy("timestamp");
                  setSortOrder("desc");
                  setGridKey((prev) => prev + 1);
                }}
                className="px-4 py-2 text-sm font-bold text-rose-500 hover:text-rose-600 border border-rose-200/50 hover:bg-rose-50/50 rounded-[4px] cursor-pointer transition select-none shrink-0 w-full md:w-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-medium flex items-center justify-between shrink-0">
            <span>⚠️ API Error: {error}</span>
            <button
              onClick={() => {
                const fromRFC = fromDate ? `${fromDate}T00:00:00Z` : "";
                const toRFC = toDate ? `${toDate}T23:59:59Z` : "";
                dispatch(
                  fetchAuditLogs({
                    action:
                      selectedAction === "All Events" ? "" : selectedAction,
                    status:
                      selectedStatus === "All Statuses"
                        ? ""
                        : selectedStatus.toLowerCase(),
                    search: searchQuery,
                    from: fromRFC,
                    to: toRFC,
                    limit: 1000,
                  }),
                );
              }}
              className="px-2 py-1 bg-white border border-rose-200 rounded-[4px] text-rose-700 hover:bg-rose-50 active:scale-95 transition cursor-pointer font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* TABLE COMPONENT — always mounted so filter inputs never lose focus */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Table — always mounted so filter inputs keep focus while API fetches */}
          <TableWithPagination
            key={gridKey}
            thead={auditTableHead}
            tbody={paginatedItems}
            clickable={false}
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(items.length / limit))}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={handleLimitChange}
            maxHeight="100%"
            checkboxSelection={false}
            floatingFilter={false}
            totalCount={items.length}
            onSortChange={(colKey, order) => {
              setSortBy(colKey);
              setSortOrder(order as any);
              setPage(1);
            }}
          />

          {/* ── Empty state overlays (inside the table area, not outside) ── */}
          {!loading && items.length === 0 && !hasActiveFilters && (
            /* First-load: no data exists yet */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-(--bg-primary) z-10 pointer-events-none">
              <span className="text-4xl mb-3 select-none">📋</span>
              <p className="text-sm font-black text-(--text-primary)">
                No Audit Logs Yet
              </p>
              <p className="text-xs text-(--text-muted) mt-1 text-center max-w-xs">
                System activity will appear here once events are recorded.
              </p>
            </div>
          )}
          {!loading && items.length === 0 && hasActiveFilters && (
            /* Search returned nothing */
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <div className="bg-(--bg-primary) flex flex-col items-center justify-center px-6 py-5 rounded-[8px]">
                <span className="text-3xl mb-2 select-none">🔍</span>
                <p className="text-sm font-bold text-(--text-primary)">
                  No results found
                </p>
                <p className="text-xs text-(--text-muted) mt-1 text-center max-w-xs">
                  Try adjusting your search or clearing the active filters.
                </p>
              </div>
            </div>
          )}

          {/* Semi-transparent loading overlay — sits on top of the table while fetching */}
          {loading && (
            <div className="absolute inset-0 bg-(--bg-primary)/70 flex flex-col items-center justify-center z-10">
              <div className="w-10 h-10 border-4 border-teal-500 rounded-md border-t-transparent animate-spin mb-4" />
              <p className="text-xs font-bold text-(--text-muted) animate-pulse tracking-wide uppercase">
                Loading audit logs...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
