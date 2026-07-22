"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRestoreJobs } from "@/store/slices/restoreSlice";
import TableWithPagination from "@/components/layout/TableWithPagination";
import { TableColumn } from "@/components/ui/TableCompoenets";
import {
  GmailIcon,
  DriveIcon,
  ContactsIcon,
  CalendarIcon,
  PhotosIcon,
} from "@/components/ui/ServiceIcon";
import type { RestoreJob } from "@/services/restoreService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatJobDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function hasInProgressJobs(jobs: RestoreJob[]): boolean {
  return jobs.some((j) => {
    const status = (j.Status || "").toLowerCase();
    return (
      status === "in_progress" ||
      status === "running" ||
      status === "pending" ||
      status === "queued"
    );
  });
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function JobsTableSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 animate-pulse divide-y divide-(--border-light)">
      {/* Header Row Skeleton */}
      <div className="flex items-center bg-(--bg-secondary)/30 border-b border-(--border) px-6 py-3 shrink-0">
        <div className="h-3 w-28 bg-(--border-strong) rounded-sm opacity-50" />
        <div className="h-3 w-20 bg-(--border-strong) rounded-sm opacity-50 ml-16" />
        <div className="h-3 w-24 bg-(--border-strong) rounded-sm opacity-50 ml-16" />
        <div className="h-3 w-16 bg-(--border-strong) rounded-sm opacity-50 ml-auto" />
      </div>
      {/* Body Rows Skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-6 py-5 flex items-center gap-4 shrink-0">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-(--bg-secondary) rounded-md" />
            <div className="h-3 w-48 bg-(--bg-secondary) rounded-md" />
          </div>
          <div className="h-6 w-24 bg-(--bg-secondary) rounded-md ml-12" />
          <div className="h-4 w-32 bg-(--bg-secondary) rounded-md ml-12" />
          <div className="h-4 w-20 bg-(--bg-secondary) rounded-md ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyJobsState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none py-16 bg-(--bg-primary)">
      <div className="w-12 h-12 rounded-full bg-(--bg-secondary) flex items-center justify-center text-2xl border border-(--border-light)">
        📭
      </div>
      <p className="text-sm font-bold text-(--text-secondary)">
        No restore jobs found
      </p>
      <p className="text-xs text-(--text-muted)">
        Restore jobs will appear here once initiated from your backup services.
      </p>
      <button
        onClick={onRefresh}
        className="mt-2 text-xs font-bold text-(--primary) hover:underline cursor-pointer bg-transparent border-none"
      >
        Refresh
      </button>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none py-12 bg-(--bg-primary)">
      <p className="text-xs font-bold text-red-500">⚠️ {message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-bold text-(--primary) hover:underline cursor-pointer bg-transparent border-none"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecoveryPage() {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.restore);

  // ── Filter States ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, serviceFilter, statusFilter, fromDate, toDate, limit]);

  // Fetch restore jobs on filter/page change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let methodVal = "";
      if (serviceFilter === "gmail") methodVal = "gmail";
      else if (serviceFilter === "drive") methodVal = "google_drive";
      // else if (serviceFilter === "photos") methodVal = "google_photos";
      else if (serviceFilter === "calendar") methodVal = "google_calendar";
      else if (serviceFilter === "contacts") methodVal = "google_contacts";

      const fromRFC = fromDate ? `${fromDate}T00:00:00Z` : undefined;
      const toRFC = toDate ? `${toDate}T23:59:59Z` : undefined;

      const params = {
        service: serviceFilter || undefined,
        method: methodVal || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        email: searchQuery || undefined,
        from_time: fromRFC,
        to_time: toRFC,
        limit,
        offset: (page - 1) * limit,
      };

      dispatch(fetchRestoreJobs(params));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    dispatch,
    searchQuery,
    serviceFilter,
    statusFilter,
    fromDate,
    toDate,
    limit,
    page,
  ]);

  const handleRefresh = () => {
    let methodVal = "";
    if (serviceFilter === "gmail") methodVal = "gmail";
    else if (serviceFilter === "drive") methodVal = "google_drive";
    // else if (serviceFilter === "photos") methodVal = "google_photos";
    else if (serviceFilter === "calendar") methodVal = "google_calendar";
    else if (serviceFilter === "contacts") methodVal = "google_contacts";

    const fromRFC = fromDate ? `${fromDate}T00:00:00Z` : undefined;
    const toRFC = toDate ? `${toDate}T23:59:59Z` : undefined;

    const params = {
      service: serviceFilter || undefined,
      method: methodVal || undefined,
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      email: searchQuery || undefined,
      from_time: fromRFC,
      to_time: toRFC,
      limit,
      offset: (page - 1) * limit,
    };

    dispatch(fetchRestoreJobs(params));
  };

  // ── Table column definitions ──────────────────────────────────────────────

  const recoveryTableHead: TableColumn[] = [
    {
      key: "JobID",
      label: "JOB ID / TARGET",
      type: "component",
      value: (row: any) => {
        const id = row.id ?? row.ID ?? row.JobID ?? row.job_id ?? "";
        const label = String(id).startsWith("#RST-") ? id : `#RST-${id}`;
        const target = row.target ?? row.Target ?? row.login_id ?? row.email ?? row.message ?? "Unknown";
        return (
          <div className="py-1">
            <div className="font-extrabold text-[15px] text-(--text-primary)">
              {label}
            </div>
            <div className="text-xs font-bold text-(--text-muted) mt-0.5 max-w-[220px] truncate">
              {target}
            </div>
          </div>
        );
      },
    },
    {
      key: "Service",
      label: "SERVICE",
      type: "component",
      value: (row: any) => {
        const svc = (row.service ?? row.Service ?? row.method ?? row.Method ?? "drive").toLowerCase();
        let icon = null;
        let colorClasses =
          "text-(--text-muted) bg-(--bg-secondary)/10 border-(--border-light)";

        if (svc.includes("gmail")) {
          icon = <GmailIcon className="w-4 h-4" />;
          colorClasses = "text-rose-500 bg-rose-500/5 border-rose-500/10";
        } else if (svc.includes("drive")) {
          icon = <DriveIcon className="w-4 h-4" />;
          colorClasses = "text-blue-600 bg-blue-500/5 border-blue-500/10";
        } else if (svc.includes("contact")) {
          icon = <ContactsIcon className="w-4 h-4" />;
          colorClasses = "text-amber-600 bg-amber-500/5 border-amber-500/10";
        } else if (svc.includes("calendar")) {
          icon = <CalendarIcon className="w-4 h-4" />;
          colorClasses =
            "text-emerald-500 bg-emerald-500/5 border-emerald-500/10";
        } else if (svc.includes("photo")) {
          icon = <PhotosIcon className="w-4 h-4" />;
          colorClasses = "text-indigo-600 bg-indigo-500/5 border-indigo-500/10";
        }

        const displayService = svc.includes("contact") ? "Contacts" : svc.includes("calendar") ? "Calendar" : svc.includes("photo") ? "Photos" : svc.includes("drive") ? "Drive" : svc.includes("gmail") ? "Gmail" : svc;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold border select-none capitalize ${colorClasses}`}
          >
            {icon} {displayService}
          </span>
        );
      },
    },
    {
      key: "InitiatedBy",
      label: "INITIATED BY",
      type: "component",
      className: "text-[14px] text-(--text-secondary) font-bold",
      value: (row: any) => {
        const init = row.initiated_by ?? row.InitiatedBy ?? row.login_id ?? row.email ?? "Unknown";
        return <span>{init}</span>;
      },
    },
    {
      key: "Status",
      label: "STATUS",
      type: "component",
      value: (row: any) => {
        const status = (row.status ?? row.Status ?? "pending").toLowerCase();
        if (status === "completed") {
          return (
            <div className="flex items-center gap-1.5 text-emerald-500 font-extrabold text-sm select-none">
              <span>✔</span> Completed
            </div>
          );
        }

        if (status === "failed") {
          const msg = row.message || row.Message || "";
          return (
            <div className="space-y-1 select-none text-left">
              <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-sm">
                <span>✘</span> Failed
              </div>
              {msg && (
                <div className="text-[11px] font-bold text-red-400 max-w-[200px] leading-tight capitalize">
                  {msg}
                </div>
              )}
            </div>
          );
        }

        if (status === "cancelled" || status === "canceled") {
          return (
            <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-sm select-none">
              <span>⊘</span> Cancelled
            </div>
          );
        }

        if (status === "partial_completed" || status === "partial completed") {
          const msg = row.message || row.Message || "";
          return (
            <div className="space-y-1 select-none text-left">
              <div className="flex items-center gap-1.5 text-blue-500 font-extrabold text-sm">
                <span>⚠</span> Partial Completed
              </div>
              {msg && (
                <div className="text-[11px] font-bold text-blue-400 max-w-[200px] leading-tight capitalize">
                  {msg}
                </div>
              )}
            </div>
          );
        }

        if (status === "queued" || status === "pending") {
          return (
            <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-sm select-none">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              {status === "queued" ? "Queued" : "Pending"}
            </div>
          );
        }

        if (status === "running" || status === "in_progress") {
          let progress = row.progress_percent ?? row.Progress ?? 0;
          if (Array.isArray(row.success) && row.success.length > 0) {
            const runningSub = row.success.find((s: any) => s.status === "running") || row.success[0];
            if (runningSub && typeof runningSub.progress_percent === "number") {
              progress = parseFloat(runningSub.progress_percent.toFixed(2));
            }
          }

          return (
            <div className="flex items-center gap-3 w-full max-w-[160px]">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden border border-slate-200/50">
                <div
                  className="h-full bg-(--primary) rounded-md transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-(--primary) shrink-0">
                {progress.toFixed(1)}%
              </span>
            </div>
          );
        }

        // Fallback
        return (
          <div className="text-xs font-extrabold text-(--text-secondary) capitalize select-none">
            {row.status ?? row.Status}
          </div>
        );
      },
    },
    {
      key: "date",
      label: "STARTED",
      type: "component",
      value: (row: any) => formatJobDate(row.created_at ?? row.createdAt),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh+110px)] md:h-[calc(100vh-120px)] flex flex-col gap-4 text-(--text-primary) overflow-hidden pb-1">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Recovery & Restore Hub
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Track active recovery jobs and their real-time progress across all
            backup services.
          </p>
        </div>

        <div className="flex items-center gap-3 select-none">
          {/* Live indicator badge ── shows when polling is active */}
          {!loading && hasInProgressJobs(jobs) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 select-none animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-sm font-bold px-4 py-2.5 rounded-sm border border-(--border) bg-(--bg-primary) hover:bg-(--bg-secondary) text-(--text-secondary) transition-colors cursor-pointer select-none disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-(--primary) border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              "↺"
            )}{" "}
            Refresh
          </button>
        </div>
      </div>

      {/* SINGLE WRAPPER (SEARCH + TABLE TOGETHER IN CARD) */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-[6px] overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        {/* FILTERS PANEL */}
        <div className="p-4 border-b border-(--border) shrink-0">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="flex-1 min-w-[280px]">
              <input
                placeholder="Search by Job ID or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-(--border) rounded-[4px] bg-(--bg-primary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--border) transition"
              />
            </div>

            {/* Dropdowns and Date Pickers */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Service Selector */}
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--primary) min-w-[130px] transition animate-fade-in"
              >
                <option value="">All Services</option>
                <option value="gmail">Gmail</option>
                <option value="drive">Google Drive</option>
                {/* <option value="photos">Google Photos</option> */}
                <option value="calendar">Google Calendar</option>
                <option value="contacts">Google Contacts</option>
              </select>

              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--primary) min-w-[130px] transition animate-fade-in"
              >
                <option value="">All Statuses</option>
                <option value="queued">Queued</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="partial_completed">Partial Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* From Date */}
              <div className="flex items-center gap-2 border border-(--border) rounded-[4px] px-2.5 py-1.5 bg-(--bg-secondary) min-w-[140px] transition animate-fade-in">
                <span className="text-xs text-(--text-muted) font-bold select-none shrink-0">
                  From:
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent text-xs text-(--text-primary) focus:outline-none cursor-pointer w-full"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-2 border border-(--border) rounded-[4px] px-2.5 py-1.5 bg-(--bg-secondary) min-w-[140px] transition animate-fade-in">
                <span className="text-xs text-(--text-muted) font-bold select-none shrink-0">
                  To:
                </span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent text-xs text-(--text-primary) focus:outline-none cursor-pointer w-full"
                />
              </div>

              {/* Reset Filters */}
              {(searchQuery ||
                serviceFilter ||
                statusFilter ||
                fromDate ||
                toDate ||
                limit !== 20 ||
                page !== 1) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setServiceFilter("");
                    setStatusFilter("");
                    setFromDate("");
                    setToDate("");
                    setLimit(20);
                    setPage(1);
                  }}
                  className="text-xs font-bold text-(--primary) hover:underline cursor-pointer bg-transparent border-none shrink-0 self-center px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* JOBS TABLE & PAGINATION CONTAINER */}
        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <JobsTableSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={handleRefresh} />
          ) : jobs.length === 0 ? (
            <EmptyJobsState onRefresh={handleRefresh} />
          ) : (
            <TableWithPagination
              thead={recoveryTableHead}
              tbody={jobs}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              currentPage={page}
              totalPages={jobs.length < limit ? page : page + 1}
              totalCount={
                jobs.length < limit
                  ? (page - 1) * limit + jobs.length
                  : undefined
              }
              maxHeight="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
}
