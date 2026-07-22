"use client";

import React, { useState, useMemo, useEffect } from "react";
import toast from "@/components/Toast";
import ServiceIcon from "@/components/ui/ServiceIcon";
import {
  RETENTION_OPTIONS,
  SYNC_INTERVAL_OPTIONS,
  SYNC_INTERVAL_API_MAP,
  RETENTION_API_MAP,
  SyncIntervalOption,
  RetentionOption,
  WEEK_DAYS,
  MONTH_DAYS,
  Policy,
  Assignment,
  getPolicyTableColumns,
} from "@/utils/constants/policy_constants";
import AddEmailServicesModal from "./AddEmailServicesModal";
import MovePolicyModal from "./MovePolicyModal";
import SplitPolicyModal from "./SplitPolicyModal";
import TableWithPagination from "@/components/layout/TableWithPagination";
import { TableColumn } from "@/components/ui/TableCompoenets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPolicyDetails,
  updatePolicySettings,
  createPolicy,
  moveAssignments,
} from "@/store/slices/policySlice";

interface CorporateUserPoliciesProps {
  policy: Policy;
  onBack: () => void;
}

export default function CorporateUserPolicies({
  policy,
  onBack,
}: CorporateUserPoliciesProps) {
  const dispatch = useAppDispatch();
  const { activePolicyDetails, loading } = useAppSelector((state) => state.policy);

  // Flat map initial jobs
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [policyInterval, setPolicyInterval] = useState(policy.interval);
  const [policyRetention, setPolicyRetention] = useState(policy.retention_type);
  const [policyOn, setPolicyOn] = useState(policy.on || "");
  const [weeklyDay, setWeeklyDay] = useState("Sunday");
  const [monthlyDay, setMonthlyDay] = useState("1");

  // Filters & Page settings
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selection state from TableWithPagination / AG Grid
  const [selectedRows, setSelectedRows] = useState<Assignment[]>([]);

  // Modals visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  // Tracks if we are moving a single assignment (opens move modal for 1 item)
  const [singleMoveRow, setSingleMoveRow] = useState<Assignment | null>(null);

  // Debounced Search of policy details from backend
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchPolicyDetails({ id: policy.policy_id, search: searchQuery }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, policy.policy_id, searchQuery]);

  // Sync state whenever policy details load/change
  useEffect(() => {
    const targetPolicy = activePolicyDetails.policy || policy;
    const targetJobs =
      activePolicyDetails.linked_jobs.length > 0
        ? activePolicyDetails.linked_jobs
        : targetPolicy.linked_jobs || [];

    if (targetPolicy) {
      // Map backend interval back to UI selection
      let displayInterval = targetPolicy.interval;
      const foundIntervalKey = Object.keys(SYNC_INTERVAL_API_MAP).find(
        (key) =>
          SYNC_INTERVAL_API_MAP[key as SyncIntervalOption].interval ===
          targetPolicy.interval,
      );
      if (foundIntervalKey) {
        displayInterval = foundIntervalKey;
      } else {
        if (targetPolicy.interval === "daily") displayInterval = "Daily";
        else if (targetPolicy.interval === "weekly") displayInterval = "Weekly";
        else if (targetPolicy.interval === "monthly")
          displayInterval = "Monthly";
        else if (targetPolicy.interval === "3h")
          displayInterval = "Every 3 Hours";
        else if (targetPolicy.interval === "12h") displayInterval = "12 Hours";
      }
      setPolicyInterval(displayInterval);

      // Map backend retention back to UI selection
      let displayRetention = targetPolicy.retention_type;
      const foundRetentionKey = Object.keys(RETENTION_API_MAP).find(
        (key) =>
          RETENTION_API_MAP[key as RetentionOption] ===
          targetPolicy.retention_type,
      );
      if (foundRetentionKey) {
        displayRetention = foundRetentionKey;
      } else {
        if (targetPolicy.retention_type === "never")
          displayRetention = "Infinite";
        else if (targetPolicy.retention_type === "30_days")
          displayRetention = "30 Days";
        else if (targetPolicy.retention_type === "1_year")
          displayRetention = "1 Year";
        else if (targetPolicy.retention_type === "7_years")
          displayRetention = "7 Years";
      }
      setPolicyRetention(displayRetention);
      setPolicyOn(targetPolicy.on || "");

      if (displayInterval === "Weekly") {
        setWeeklyDay(targetPolicy.on || "Sunday");
      } else if (displayInterval === "Monthly") {
        setMonthlyDay(targetPolicy.on || "1");
      }

      const flat: Assignment[] = [];
      targetJobs.forEach((job) => {
        if (job.method) {
          flat.push({
            id: `${job.method.toLowerCase()}-${job.email}`,
            job_id: job.job_id,
            name: job.name || job.email.split("@")[0],
            email: job.email,
            service: job.method,
          });
        } else if (job.services && job.services.length > 0) {
          job.services.forEach((svc) => {
            flat.push({
              id: `${svc.toLowerCase()}-${job.email}`,
              job_id: job.job_id,
              name: job.name || job.email.split("@")[0],
              email: job.email,
              service: svc,
            });
          });
        }
      });
      setAssignments(flat);
      setSelectedRows([]);
      setPage(1);
    }
  }, [activePolicyDetails.policy, activePolicyDetails.linked_jobs, policy]);

  // Derived unique emails count
  const uniqueEmailsCount = useMemo(() => {
    return new Set(assignments.map((a) => a.email)).size;
  }, [assignments]);

  const [sortBy, setSortBy] = useState<string>("email");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedAssignments = useMemo(() => {
    const sorted = [...assignments];
    sorted.sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortBy === "email") {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortBy === "service") {
        valA = a.service.toLowerCase();
        valB = b.service.toLowerCase();
      } else {
        valA = (a[sortBy as keyof Assignment] || "").toString().toLowerCase();
        valB = (b[sortBy as keyof Assignment] || "").toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [assignments, sortBy, sortOrder]);

  // Since search is now done at the backend level, filteredAssignments is the sorted flat list
  const filteredAssignments = sortedAssignments;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / limit));
  const paginatedAssignments = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredAssignments.slice(start, start + limit);
  }, [filteredAssignments, page, limit]);

  // Actions
  const handleMoveSingleRow = (row: Assignment) => {
    setSingleMoveRow(row);
    setIsMoveOpen(true);
  };

  const handleAddAssignment = (result: {
    email: string;
    name: string;
    services: string[];
    job_ids: number[];
  }) => {
    if (!result.job_ids || result.job_ids.length === 0) {
      toast.error("No service jobs found to assign.");
      return;
    }
    dispatch(
      moveAssignments({
        job_ids: result.job_ids,
        target_policy_id: policy.policy_id,
      }),
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        dispatch(
          fetchPolicyDetails({ id: policy.policy_id, search: searchQuery }),
        );
      }
    });
  };

  const handleMoveAssignmentsConfirm = (destination: {
    type: "existing" | "new";
    value: string | number;
  }) => {
    const toMove = singleMoveRow ? [singleMoveRow] : selectedRows;
    if (toMove.length === 0) return;

    const jobIds = Array.from(new Set(toMove.map((s) => s.job_id)));

    if (destination.type === "new") {
      dispatch(
        createPolicy({
          name: String(destination.value),
          interval: "daily", // default Daily
          on: "12am",
          retention_type: "never", // default Infinite
          job_ids: jobIds,
        }),
      ).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          dispatch(
            fetchPolicyDetails({ id: policy.policy_id, search: searchQuery }),
          );
          setSelectedRows([]);
          setSingleMoveRow(null);
        }
      });
    } else {
      dispatch(
        moveAssignments({
          job_ids: jobIds,
          target_policy_id: Number(destination.value),
        }),
      ).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          dispatch(
            fetchPolicyDetails({ id: policy.policy_id, search: searchQuery }),
          );
          setSelectedRows([]);
          setSingleMoveRow(null);
        }
      });
    }
  };

  const handleSplitAssignmentsConfirm = (splitData: {
    name: string;
    interval: string;
    on: string;
    retention: string;
  }) => {
    if (selectedRows.length === 0) return;
    const jobIds = Array.from(new Set(selectedRows.map((s) => s.job_id)));

    const intervalOpt =
      SYNC_INTERVAL_API_MAP[splitData.interval as SyncIntervalOption];
    const backendInterval = intervalOpt ? intervalOpt.interval : "daily";
    const backendOn =
      splitData.interval === "Daily" ||
      splitData.interval === "Weekly" ||
      splitData.interval === "Monthly"
        ? splitData.on
        : intervalOpt
          ? intervalOpt.on
          : "";
    const backendRetention =
      RETENTION_API_MAP[splitData.retention as RetentionOption] || "never";

    dispatch(
      createPolicy({
        name: splitData.name,
        interval: backendInterval,
        on: backendOn,
        retention_type: backendRetention,
        job_ids: jobIds,
      }),
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        dispatch(
          fetchPolicyDetails({ id: policy.policy_id, search: searchQuery }),
        );
        setSelectedRows([]);
      }
    });
  };

  const handleSavePolicy = () => {
    let finalOnValue = "";
    if (policyInterval === "Daily") {
      finalOnValue = "12am";
    } else if (policyInterval === "Weekly") {
      finalOnValue = weeklyDay;
    } else if (policyInterval === "Monthly") {
      finalOnValue = monthlyDay;
    }

    const intervalOpt =
      SYNC_INTERVAL_API_MAP[policyInterval as SyncIntervalOption];
    const backendInterval = intervalOpt ? intervalOpt.interval : "daily";
    const backendOn =
      policyInterval === "Daily" ||
      policyInterval === "Weekly" ||
      policyInterval === "Monthly"
        ? finalOnValue
        : intervalOpt
          ? intervalOpt.on
          : "";
    const backendRetention =
      RETENTION_API_MAP[policyRetention as RetentionOption] || "never";

    dispatch(
      updatePolicySettings({
        id: policy.policy_id,
        data: {
          interval: backendInterval,
          on: backendOn,
          retention_type: backendRetention,
        },
      }),
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setIsSaveSuccess(true);
      }
    });
  };

  // Columns Configuration for TableWithPagination (AG Grid)
  const columns: TableColumn[] = useMemo(
    () => getPolicyTableColumns(handleMoveSingleRow),
    [handleMoveSingleRow],
  );

  return (
    <div className="bg-(--bg-primary) flex flex-col h-full flex-1 min-h-0 animate-in fade-in duration-300 select-none">
      {/* ── HEADER ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-4 px-6 border-b border-(--border)">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-sm border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-secondary) transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span className="text-blue-500">←</span>
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-lg font-black text-(--text-primary) flex items-center gap-1">
              <span>Policy:</span>
              <span className="text-teal-600">{policy.name}</span>
            </h1>
            <p className="text-xs text-(--text-muted) font-bold mt-0.5">
              Each email + service pair belongs to one policy. Interval and
              credentials are shared for all assignments in this policy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedRows.length === 0) {
                toast.error("Please select at least one assignment to split.");
                return;
              }
              setIsSplitOpen(true);
            }}
            disabled={selectedRows.length === 0}
            className="px-4 py-2 text-xs font-bold rounded-sm border border-(--border) text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap"
          >
            ✂️ Split Policy
          </button>
          <button
            onClick={handleSavePolicy}
            disabled={loading}
            className="px-4.5 py-2 text-xs font-bold rounded-sm bg-(--primary) hover:bg-(--primary-hover) text-(--text-inverse) cursor-pointer transition shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Save Policy"}
          </button>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 p-6 min-h-0 overflow-y-auto xl:overflow-hidden">
        {/* Sidebar Configuration (Left) - Increased width to 350px */}
        <div className="w-full xl:w-[350px] shrink-0 space-y-4 select-none">
          <div className="bg-(--bg-primary) border border-(--border) rounded-md p-5 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-(--text-primary) tracking-wide uppercase">
                  Policy Settings
                </h3>
                <p className="text-[11px] text-(--text-muted) font-medium mt-1">
                  Applies to every email + service assignment in this policy.
                </p>
              </div>
              {loading && (
                <div className="w-4 h-4 border-2 border-(--primary) border-t-transparent rounded-full animate-spin shrink-0 ml-2" />
              )}
            </div>

            {/* Sync Interval */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-(--text-secondary)">
                Sync Interval
              </label>
              <select
                disabled={loading}
                value={policyInterval}
                onChange={(e) => setPolicyInterval(e.target.value)}
                className="w-full px-3 py-2 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                  backgroundSize: "10px 10px",
                }}
              >
                {SYNC_INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Weekly Day Selection */}
            {policyInterval === "Weekly" && (
              <div className="pl-4 border-l border-(--border) ml-1.5 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-black text-(--text-secondary)">
                  ↳ On Day of Week
                </label>
                <select
                  disabled={loading}
                  value={weeklyDay}
                  onChange={(e) => setWeeklyDay(e.target.value)}
                  className="w-full px-3 py-2 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    backgroundSize: "10px 10px",
                  }}
                >
                  {WEEK_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Monthly Day Selection */}
            {policyInterval === "Monthly" && (
              <div className="pl-4 border-l border-(--border) ml-1.5 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-black text-(--text-secondary)">
                  ↳ On Day of Month
                </label>
                <select
                  disabled={loading}
                  value={monthlyDay}
                  onChange={(e) => setMonthlyDay(e.target.value)}
                  className="w-full px-3 py-2 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    backgroundSize: "10px 10px",
                  }}
                >
                  {MONTH_DAYS.map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Retention */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-(--text-secondary)">
                Retention
              </label>
              <select
                disabled={loading}
                value={policyRetention}
                onChange={(e) => setPolicyRetention(e.target.value)}
                className="w-full px-3 py-2 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                  backgroundSize: "10px 10px",
                }}
              >
                {RETENTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "Infinite" ? "Infinite (Never Delete)" : opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Credentials Status */}
            {/* <div className="pt-2 border-t border-(--border-light) space-y-2">
              <span className="block text-xs font-black text-(--text-secondary)">
                Credentials
              </span>
              <div className="border border-(--border-light) bg-(--bg-secondary)/5 rounded-md p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-(--text-primary)">
                    Workspace admin connection
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">
                    Healthy
                  </span>
                </div>
                <p className="text-[10px] text-(--text-muted) font-medium leading-relaxed">
                  Shared OAuth for all corporate mailboxes in this tenant.
                </p>
              </div>
            </div> */}
          </div>

          {/* Counts metrics */}
          <div className="bg-teal-500/5 border border-teal-500/15 text-teal-700 rounded-md p-4.5 space-y-1.5 shadow-2xs">
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Assignments total</span>
              <span className="font-mono font-extrabold bg-teal-500/10 px-2 py-0.5 rounded">
                {assignments.length} service
              </span>
            </div>
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Unique email count</span>
              <span className="font-mono font-extrabold bg-teal-500/10 px-2 py-0.5 rounded">
                {uniqueEmailsCount} emails
              </span>
            </div>
          </div>
        </div>

        {/* Main Section (Right) - Reduced width automatically */}
        <div className="flex-1 flex flex-col min-w-0 bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-2xs min-h-[700px] xl:min-h-0">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-(--border) bg-(--bg-secondary)/10">
            <div className="relative flex-1 min-w-0 w-full">
              <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-(--text-muted)">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) transition"
              />
            </div>

            <div className="md:flex grid items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsAddOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-sm bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>+</span> Add Email &amp; Services
              </button>
              <button
                onClick={() => {
                  setSingleMoveRow(null); // Clear single move row (so bulk move triggers)
                  setIsMoveOpen(true);
                }}
                disabled={selectedRows.length === 0}
                className="w-full sm:w-auto px-4 py-2 rounded-sm border border-(--border) text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-45 disabled:cursor-not-allowed text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                Move Selected
              </button>
            </div>
          </div>

          {/* Assignments TableWithPagination (AG Grid) */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {loading && (
              <div className="absolute inset-0 bg-(--bg-primary)/60 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-2 select-none">
                <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-(--text-muted)">
                  Loading assignments...
                </p>
              </div>
            )}
            <TableWithPagination
              thead={columns}
              tbody={paginatedAssignments}
              clickable={false}
              currentPage={page}
              totalPages={totalPages}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              maxHeight="100%"
              checkboxSelection={true}
              onSelectionChanged={(rows) =>
                setSelectedRows(rows as Assignment[])
              }
              onSortChange={(field, order) => {
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
              totalCount={filteredAssignments.length}
            />
          </div>
        </div>
      </div>

      {/* ── MODALS OVERLAYS ── */}
      {isAddOpen && (
        <AddEmailServicesModal
          policyId={policy.policy_id}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddAssignment}
        />
      )}

      {isMoveOpen && (
        <MovePolicyModal
          currentPolicyName={policy.name}
          selectedCount={singleMoveRow ? 1 : selectedRows.length}
          onClose={() => {
            setIsMoveOpen(false);
            setSingleMoveRow(null);
          }}
          onMove={handleMoveAssignmentsConfirm}
        />
      )}

      {isSplitOpen && (
        <SplitPolicyModal
          currentPolicyName={policy.name}
          selectedCount={selectedRows.length}
          onClose={() => setIsSplitOpen(false)}
          onSplit={handleSplitAssignmentsConfirm}
        />
      )}

      {/* SUCCESS MODAL */}
      {isSaveSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
          <div className="bg-(--bg-primary) border border-(--border) shadow-2xl w-full max-w-sm rounded-md overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 text-center items-center justify-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-md flex items-center justify-center mb-4 text-emerald-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="text-base font-black text-(--text-primary) mb-1">
              Policy Saved!
            </h3>
            <p className="text-xs font-bold text-(--text-muted) leading-relaxed mb-5">
              Updates to{" "}
              <span className="font-bold text-(--text-primary)">
                {policy.name}
              </span>{" "}
              configurations and user assignments saved successfully.
            </p>
            <button
              onClick={() => {
                setIsSaveSuccess(false);
                onBack();
              }}
              className="w-full py-2.5 rounded-md bg-(--primary) hover:bg-(--primary-hover) text-(--text-inverse) text-xs font-bold transition cursor-pointer shadow-sm"
            >
              Return to Policies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
