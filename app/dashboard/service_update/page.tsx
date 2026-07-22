"use client";

import { useState, useMemo, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchServicesSummary,
  fetchAutosyncJobs,
  toggleAutosyncJob,
} from "@/store/slices/jobSlice";
import toast from "@/components/Toast";
import ServiceCard, {
  Service,
} from "@/components/ui/service_update/ServiceCard";
import TableWithPagination from "@/components/layout/TableWithPagination";
import { TableColumn } from "@/components/ui/TableCompoenets";
import SyncLogsModal from "@/components/ui/service_update/SyncLogsModal";
import { DocumentIcon, PlayIcon, PauseIcon } from "@/components/ui/ServiceIcon";
import UserProfile from "@/components/ui/UserProfile";
import { jobService } from "@/services/jobService";

interface Account {
  id: string;
  name: string;
  email: string;
  lastBackup: string;
  nextBackup: string;
  status: "SUCCESS" | "FAILED" | "NOT SYNCING" | "SCHEDULED" | "CREATED";
  paused: boolean;
}

const buildFilterObject = (
  method: string,
  query: string,
  action: string,
  status: string,
) => {
  const hasStatus = status !== "all_statuses";
  const hasName = query !== "";

  // Helper to get active boolean
  const getActiveVal = () => {
    if (action === "active") return true;
    if (action === "paused") return false;
    return undefined;
  };

  const filter: any = { method };
  if (hasName) filter.name = query;

  const active = getActiveVal();
  if (active !== undefined) filter.active = active;

  if (hasStatus) {
    filter.status = status.toLowerCase();
  }
  return filter;
};

function formatBackupDate(dateStr: string): string {
  if (!dateStr || dateStr === "--") return "--";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();

    // For future dates
    if (diffMs < 0) {
      const absDiffMs = Math.abs(diffMs);
      const diffMin = Math.floor(absDiffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);
      if (diffMin < 60) return `In ${diffMin}m`;
      if (diffHr < 24) return `In ${diffHr}h`;
      if (diffDay === 1) return "Tomorrow";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

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

function ServicesUpdateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { servicesSummary, autosyncJobs, loading, error } = useAppSelector(
    (state) => state.job,
  );
  const { projects } = useAppSelector((state) => state.project);

  const method = searchParams.get("method");
  const pageParam = Number(searchParams.get("page") || "1");

  // Map backend method name for API calls (gmail, google_drive, google_photos, google_calendar, google_contacts)
  const apiMethodName = useMemo(() => {
    if (!method) return "";
    if (method === "drive") return "google_drive";
    // if (method === "photos") return "google_photos";
    if (method === "contacts") return "google_contacts";
    if (method === "calendar") return "google_calendar";
    return method;
  }, [method]);

  // Dynamic services summary mapping
  const servicesList = useMemo<Service[]>(() => {
    const defaultServices = [
      {
        id: "gmail",
        name: "Gmail",
        description: "Email, attachments, and labels.",
        active: 0,
        inactive: 0,
        iconName: "gmail",
      },
      {
        id: "drive",
        name: "Google Drive",
        description: "Files, folders, and shared drives.",
        active: 0,
        inactive: 0,
        iconName: "drive",
      },
      // {
      //   id: "photos",
      //   name: "Google Photos",
      //   description: "Images, videos, and albums.",
      //   active: 0,
      //   inactive: 0,
      //   iconName: "photo",
      // },
      {
        id: "contacts",
        name: "Google Contacts",
        description: "Address books and directories.",
        active: 0,
        inactive: 0,
        iconName: "contact",
      },
      {
        id: "calendar",
        name: "Google Calendar",
        description: "Events, schedules, and meetings.",
        active: 0,
        inactive: 0,
        iconName: "calendar",
      },
    ];

    if (!servicesSummary || servicesSummary.length === 0) {
      return defaultServices;
    }

    return defaultServices.map((s) => {
      const apiMethod = s.id === "drive" ? "google_drive" : `google_${s.id}`;
      const found = servicesSummary.find(
        (item: any) =>
          item.method === s.id ||
          item.method === apiMethod ||
          (s.id === "gmail" && item.method === "gmail"),
      );
      if (found) {
        return {
          ...s,
          active: found.active_jobs || 0,
          inactive: found.deactive_jobs || 0,
        };
      }
      return s;
    });
  }, [servicesSummary]);

  // UI States for configure view
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all_statuses");
  const [selectedAction, setSelectedAction] = useState("all_actions");
  const [page, setPage] = useState(pageParam);
  const [limit, setLimit] = useState(10);

  const [selectedAccountForLogs, setSelectedAccountForLogs] =
    useState<Account | null>(null);

  const lastFetchedRef = useRef<string>("");

  // Fetch services summary on load
  useEffect(() => {
    dispatch(fetchServicesSummary());
  }, [dispatch]);

  // Fetch filtered jobs when filters or method parameters change
  useEffect(() => {
    if (!apiMethodName) return;

    const filterStr = JSON.stringify({
      method: apiMethodName,
      searchQuery,
      selectedAction,
      selectedStatus,
    });

    const delayDebounceFn = setTimeout(() => {
      if (lastFetchedRef.current === filterStr) {
        return;
      }
      lastFetchedRef.current = filterStr;

      const filterObj = buildFilterObject(
        apiMethodName,
        searchQuery,
        selectedAction,
        selectedStatus,
      );
      dispatch(fetchAutosyncJobs(filterObj));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, apiMethodName, searchQuery, selectedAction, selectedStatus]);

  // Sync page state when route parameter page changes
  useEffect(() => {
    setPage(pageParam);
  }, [pageParam]);

  const toggleAccountAccess = async (accountId: string) => {
    const currentAccount = mappedAccounts.find((acc) => acc.id === accountId);
    if (!currentAccount) return;

    const nextActive = currentAccount.paused;

    try {
      await dispatch(
        toggleAutosyncJob({ job_id: accountId, active: nextActive }),
      ).unwrap();
      toast.success(
        `${currentAccount.name} backup is now ${nextActive ? "resumed" : "paused"}.`,
      );
      dispatch(fetchServicesSummary());
      if (apiMethodName) {
        const filterObj = buildFilterObject(
          apiMethodName,
          searchQuery,
          selectedAction,
          selectedStatus,
        );
        dispatch(fetchAutosyncJobs(filterObj));
      }
    } catch (err: any) {
      toast.error(`Failed to update status: ${err || "Unknown error"}`);
    }
  };

  // Map API response to Account structure
  const mappedAccounts = useMemo<Account[]>(() => {
    return (autosyncJobs || []).map((job: any) => {
      const id = String(job.ID || job.id || job.job_id || "");
      const email =
        job.email ||
        job.input_data?.email ||
        (job.name?.includes("@") ? job.name : "");
      let namePart = job.name || "";
      if (namePart.includes("@")) {
        namePart = namePart.split("@")[0];
      }
      if (!namePart) {
        namePart = email ? email.split("@")[0] : "Workspace User";
      }
      const displayName = namePart
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      let uiStatus:
        | "SCHEDULED"
        | "SUCCESS"
        | "FAILED"
        | "NOT SYNCING"
        | "CREATED" = "NOT SYNCING";
      const statusUpper = String(job.status || "").toUpperCase();
      if (
        statusUpper === "SUCCESS" ||
        statusUpper === "COMPLETED" ||
        statusUpper === "CONNECTED" ||
        statusUpper === "ACTIVE"
      ) {
        uiStatus = "SUCCESS";
      } else if (statusUpper === "SCHEDULED") {
        uiStatus = "SCHEDULED";
      } else if (statusUpper === "CREATED") {
        uiStatus = "CREATED";
      } else if (
        statusUpper === "FAILED" ||
        statusUpper === "ERROR" ||
        statusUpper === "AUTH_ERROR"
      ) {
        uiStatus = "FAILED";
      }

      const paused = job.active === false || job.active === 0;

      const rawLast = job.last_run || job.last_backup || job.lastBackup || "";
      const rawNext = job.next_backup || job.nextBackup || "";

      return {
        id,
        name: displayName,
        email,
        lastBackup: formatBackupDate(rawLast),
        nextBackup: formatBackupDate(rawNext),
        status: uiStatus,
        paused,
      };
    });
  }, [autosyncJobs]);

  // Memoize column definitions to prevent unnecessary re-renders
  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "name",
        label: "Account",
        type: "component",
        flex: 2.0,
        minWidth: 250,
        className: "px-6 py-4 whitespace-nowrap text-left",
        value: (row: Account) => (
          <UserProfile name={row.name} email={row.email} />
        ),
      },
      {
        key: "lastBackup",
        label: "Last Backup",
        type: "text",
        flex: 1.2,
        minWidth: 160,
        floatingFilter: false,
        className:
          "px-6 py-4 text-xs font-bold text-(--text-secondary) whitespace-nowrap text-left",
      },
      {
        key: "nextBackup",
        label: "Next Backup",
        type: "text",
        flex: 1.2,
        minWidth: 160,
        floatingFilter: false,
        className:
          "px-6 py-4 text-xs font-bold text-(--text-secondary) whitespace-nowrap text-left",
      },
      {
        key: "status",
        label: "Status",
        type: "component",
        flex: 1.0,
        minWidth: 140,
        floatingFilter: false,
        className: "px-6 py-4 whitespace-nowrap text-left ",
        value: (row: Account) => {
          const statusLower = String(row.status || "").toLowerCase();
          let colorClass = "";
          let label = "";

          if (statusLower === "created") {
            colorClass = "bg-sky-500/10 text-sky-500 border-sky-500/20";
            label = "CREATED";
          } else if (statusLower === "scheduled") {
            colorClass =
              "bg-violet-500/10 text-violet-500 border-violet-500/20";
            label = "SCHEDULED";
          } else if (statusLower === "success") {
            colorClass =
              "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            label = "SUCCESS";
          } else if (statusLower === "failed") {
            colorClass = "bg-rose-500/10 text-rose-500 border-rose-500/20";
            label = "FAILED";
          } else if (statusLower === "not syncing") {
            colorClass = "bg-slate-500/10 text-slate-500 border-slate-500/20";
            label = "NOT SYNCING";
          }
          return (
            <span
              className={`px-3 py-1.5 rounded-[6px] text-xs font-bold border ${colorClass}`}
            >
              {label}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        type: "component",
        flex: 0.8,
        minWidth: 100,
        floatingFilter: false,
        className: "px-6 py-4 whitespace-nowrap",
        value: (row: Account) => (
          <div className="flex justify-end items-center gap-3">
            <button
              title="Audit Logs"
              onClick={() => {
                setSelectedAccountForLogs(row);
              }}
              className="p-1 text-(--text-muted) hover:text-(--text-primary) transition-colors duration-150 cursor-pointer"
            >
              <DocumentIcon className="w-5 h-5" />
            </button>
            <button
              title={row.paused ? "Resume Sync" : "Pause Sync"}
              onClick={() => toggleAccountAccess(row.id)}
              className="w-7 h-7 bg-[#0b5cff] hover:bg-[#0047b3] text-white flex items-center justify-center rounded transition-colors duration-150 cursor-pointer shadow-xs"
            >
              {row.paused ? (
                <PlayIcon className="w-3.5 h-3.5 fill-current" />
              ) : (
                <PauseIcon className="w-3.5 h-3.5 fill-current" />
              )}
            </button>
          </div>
        ),
      },
    ],
    [dispatch, toggleAccountAccess, autosyncJobs, apiMethodName, projects],
  );

  // Filter logic
  const filteredAccountsTotal = useMemo(() => {
    return mappedAccounts.filter((acc) => {
      const matchQuery =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        selectedStatus === "all_statuses" || acc.status === selectedStatus;

      const matchAction =
        selectedAction === "all_actions" ||
        (selectedAction === "active" && !acc.paused) ||
        (selectedAction === "paused" && acc.paused);

      return matchQuery && matchStatus && matchAction;
    });
  }, [mappedAccounts, searchQuery, selectedStatus, selectedAction]);

  const filteredAccounts = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredAccountsTotal.slice(startIndex, startIndex + limit);
  }, [filteredAccountsTotal, page, limit]);

  const service = servicesList.find((s) => s.id === method);

  // If method query parameter is specified, show full configure view
  if (service) {
    return (
      <div className="h-[calc(100vh-110px)] md:h-[calc(100vh-120px)] flex flex-col gap-4 text-(--text-primary) overflow-hidden pb-1">
        {/* BACK & HEADER BAR */}
        <div className="flex flex-row items-center gap-5 border-b border-(--border-light) pb-5 select-none shrink-0">
          <button
            onClick={() => router.push("/dashboard/service_update")}
            className="shrink-0 w-fit px-3 py-1.5 border border-(--border) rounded-[6px] bg-(--bg-primary) text-(--text-primary) font-bold text-xs cursor-pointer hover:bg-(--bg-secondary) transition shadow-sm flex items-center gap-1.5"
          >
            <span>←</span> Back
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary) tracking-tight">
              Configure:{" "}
              <span className="text-teal-600 font-extrabold">
                {service.name}
              </span>
            </h1>
            <p className="text-sm font-medium text-(--text-muted) mt-1">
              The following accounts are currently authorized and syncing data.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS CONTAINER */}
        <div className="bg-(--bg-primary) border border-(--border) rounded-[6px] overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 border-b border-(--border) flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
            {/* Search Input on the left */}
            <div className="w-full md:w-1/3 min-w-[200px]">
              <input
                type="text"
                placeholder="Search accounts or emails..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--primary) transition shadow-sm"
              />
            </div>

            {/* Dropdowns & Clear on the right */}
            <div className="flex flex-col md:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--border) min-w-[150px]"
                >
                  <option value="all_statuses">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="created">Created</option>
                  <option value="not syncing">Not Syncing</option>
                </select>

                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--border) min-w-[150px]"
                >
                  <option value="all_actions">All Actions</option>
                  <option value="active">Active Only</option>
                  <option value="paused">Paused Only</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery !== "" ||
                selectedAction !== "all_actions" ||
                selectedStatus !== "all_statuses") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedAction("all_actions");
                    setSelectedStatus("all_statuses");
                    setPage(1);
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
                  if (apiMethodName) {
                    const filterObj = buildFilterObject(
                      apiMethodName,
                      searchQuery,
                      selectedAction,
                      selectedStatus,
                    );
                    dispatch(fetchAutosyncJobs(filterObj));
                  }
                }}
                className="px-2 py-1 bg-white border border-rose-200 rounded-[4px] text-rose-700 hover:bg-rose-50 active:scale-95 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* DYNAMIC TABLE OR PROGRESS LOADING BAR */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* ── Empty state overlays (inside the table area) ── */}
            {!loading &&
              filteredAccountsTotal.length === 0 &&
              searchQuery === "" &&
              selectedAction === "all_actions" &&
              selectedStatus === "all_statuses" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-(--bg-primary) z-10">
                  <span className="text-4xl mb-3 select-none">📋</span>
                  <p className="text-sm font-black text-(--text-primary)">
                    No Accounts Yet
                  </p>
                  <p className="text-xs text-(--text-muted) mt-1 text-center max-w-xs mb-4">
                    Connect accounts to start syncing data.
                  </p>
                  <div className="w-64">
                    <button
                      onClick={() => router.push("/dashboard/users_groups")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-(--border) rounded-md bg-(--primary) text-white font-bold transition-all duration-300 cursor-pointer hover:bg-(--primary-hover) shadow-sm text-sm"
                    >
                      Connect Google Account
                    </button>
                  </div>
                </div>
              )}
            {!loading &&
              filteredAccountsTotal.length === 0 &&
              (searchQuery !== "" ||
                selectedAction !== "all_actions" ||
                selectedStatus !== "all_statuses") && (
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

            <TableWithPagination
              thead={columns}
              tbody={filteredAccounts}
              clickable={false}
              currentPage={page}
              totalPages={Math.ceil(filteredAccountsTotal.length / limit) || 1}
              page={page}
              setPage={(p) => {
                setPage(p);
                router.push(
                  `/dashboard/service_update?method=${service.id}&page=${p}`,
                );
              }}
              limit={limit}
              setLimit={setLimit}
              maxHeight="100%"
              checkboxSelection={false}
              floatingFilter={false}
              totalCount={filteredAccountsTotal.length}
            />

            {/* Semi-transparent loading overlay — sits on top of the table while fetching */}
            {loading && (
              <div className="absolute inset-0 bg-(--bg-primary)/70 flex flex-col items-center justify-center z-10">
                <div className="w-10 h-10 border-4 border-teal-500 rounded-md border-t-transparent animate-spin mb-4" />
                <p className="text-xs font-bold text-(--text-muted) animate-pulse tracking-wide uppercase">
                  Loading accounts sync jobs...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* LOGS MODAL */}
        <SyncLogsModal
          isOpen={!!selectedAccountForLogs}
          service={service}
          account={selectedAccountForLogs}
          onClose={() => setSelectedAccountForLogs(null)}
        />
      </div>
    );
  }

  // Fallback: Default view rendering the grid of services
  return (
    <div className="space-y-6 text-(--text-primary)">
      {/* HEADER */}
      <div className="space-y-1 select-none">
        <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary) tracking-tight">
          Services Update
        </h1>
        <p className="text-sm font-medium text-(--text-muted) max-w-2xl">
          Manage, update, and configure your connected workspace services.
        </p>
      </div>

      {/* GRID OF SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {servicesList.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onConfigure={() =>
              router.push(`/dashboard/service_update?method=${service.id}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function ServicesUpdatePage() {
  return (
    <Suspense
      fallback={<div className="p-6">Loading services configurations...</div>}
    >
      <ServicesUpdateContent />
    </Suspense>
  );
}
