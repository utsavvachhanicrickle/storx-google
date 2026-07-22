"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Card_WorkspaceHealth from "@/components/ui/dashbord/Card_WorkspaceHealth";
import Card_Services from "@/components/ui/dashbord/Card_Services";
import Graph_StorgesBandwidth from "@/components/ui/dashbord/Graph_StorgesBandwidth";
import TableWithPagination from "@/components/layout/TableWithPagination";
import { dashbordService, DashboardStatItem } from "@/services/dashbordService";
import { useAppSelector } from "@/store/hooks";
import {
  DASHBOARD_STATS,
  DASHBOARD_SERVICES,
  SKELETON_STATS,
  BACKUP_LOGS_TABLE_HEAD,
} from "@/utils/constants/dashboard_page_constants";
import WarningIcon from "@mui/icons-material/Warning";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";

const getZeroUsageData = () => {
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const parsed = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = daysShort[d.getDay()];
    const dateStr = d.toISOString().split("T")[0];
    parsed.push({
      day: dayLabel,
      date: dateStr,
      storage: 0,
      bandwidth: 0,
    });
  }
  return parsed;
};

const formatGB = (value: number): string => {
  if (value <= 0) return "0 B";
  if (value < 0.001) return `${(value * 1024 * 1024).toFixed(1)} KB`;
  if (value < 1) return `${(value * 1024).toFixed(1)} MB`;
  return `${value.toFixed(1)} GB`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatItem[]>(SKELETON_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const { projects } = useAppSelector((state) => state.project);
  const [bucketUsage, setBucketUsage] = useState<any[] | null>(null);
  const [usageTrendData, setUsageTrendData] = useState<any[] | null>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Backup & Restore Logs
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalCount, setLogsTotalCount] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const LOGS_LIMIT = 5;

  // Log filters
  const [logsSearch, setLogsSearch] = useState("");
  const [logsTypes, setLogsTypes] = useState("backup,restore"); // default: both
  const [logsMethod, setLogsMethod] = useState(""); // empty = all
  const [logsStatus, setLogsStatus] = useState(""); // empty = all
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      let resolvedProjectId = "";
      if (Array.isArray(projects) && projects.length > 0) {
        resolvedProjectId = projects[0].id || "";
      }

      if (!resolvedProjectId) {
        return;
      }

      if (fetchedRef.current === resolvedProjectId) {
        return;
      }
      fetchedRef.current = resolvedProjectId;

      // 1. Fetch Stats
      setStatsLoading(true);
      try {
        const data = await dashbordService.getStats();
        setStats(data && data.length > 0 ? data : SKELETON_STATS);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setStats(SKELETON_STATS);
      } finally {
        setStatsLoading(false);
      }

      // 2. Fetch Bucket Usage
      try {
        const data =
          await dashbordService.getUsageTotalsForReserved(resolvedProjectId);
        setBucketUsage(data || []);
      } catch (err) {
        console.error("Failed to fetch bucket usage totals:", err);
        setBucketUsage([]);
      }

      // 3. Fetch Daily Usage Graph Data
      try {
        const to = Math.floor(Date.now() / 1000);
        const from = to - 7 * 24 * 60 * 60;
        const response = await dashbordService.getDailyUsage(
          resolvedProjectId,
          from,
          to,
        );
        console.log("daily usage", response);

        if (response) {
          const storageMap = new Map<string, number>();
          const bandwidthMap = new Map<string, number>();

          const storageList = response.storageUsage || [];
          // Combine both bandwidth arrays — prefer settled but add allocated if settled is missing
          const settledList = response.settledBandwidthUsage || [];
          const allocatedList = response.allocatedBandwidthUsage || [];

          // Helper: safe bytes → GB (clamped to reasonable values)
          const bytesToGB = (bytes: number): number => {
            if (!bytes || bytes <= 0) return 0;
            // MAX_SAFE_INTEGER placeholder → treat as 0
            if (bytes >= Number.MAX_SAFE_INTEGER) return 0;
            return bytes / (1024 * 1024 * 1024);
          };

          storageList.forEach((item: any) => {
            if (item && item.date) {
              const dateKey = item.date.split("T")[0];
              storageMap.set(dateKey, bytesToGB(item.value || 0));
            }
          });

          // Merge settled + allocated bandwidth (settled takes priority per date)
          allocatedList.forEach((item: any) => {
            if (item && item.date) {
              const dateKey = item.date.split("T")[0];
              if (!bandwidthMap.has(dateKey)) {
                bandwidthMap.set(dateKey, bytesToGB(item.value || 0));
              }
            }
          });
          settledList.forEach((item: any) => {
            if (item && item.date) {
              const dateKey = item.date.split("T")[0];
              bandwidthMap.set(dateKey, bytesToGB(item.value || 0));
            }
          });

          const allDates = Array.from(
            new Set([...storageMap.keys(), ...bandwidthMap.keys()]),
          ).sort();
          const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

          const parsed = allDates.map((dateStr) => {
            const d = new Date(dateStr);
            const dayLabel = daysShort[d.getUTCDay()];
            return {
              day: dayLabel,
              date: dateStr,
              storage: parseFloat((storageMap.get(dateStr) || 0).toFixed(4)),
              bandwidth: parseFloat(
                (bandwidthMap.get(dateStr) || 0).toFixed(4),
              ),
            };
          });

          if (parsed.length > 0) {
            setUsageTrendData(parsed);
          } else {
            setUsageTrendData(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch daily usage data:", err);
        setUsageTrendData(null);
      }
    };

    fetchDashboardData();
  }, [user, projects]);

  // Fetch Dashboard Alerts
  useEffect(() => {
    if (!user) return;

    const fetchAlerts = async () => {
      setAlertsLoading(true);
      try {
        const alertsData = await dashbordService.getDashboardAlerts();
        console.log("alertsData", alertsData);
        setAlerts(alertsData);
      } catch (err) {
        console.error("Failed to fetch dashboard alerts:", err);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();
  }, [user]);

  // Debounce search input — reset page to 1 when search text changes
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(logsSearch);
      setLogsPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [logsSearch]);

  // Reset page to 1 whenever any filter (except search, handled by debounce) changes
  useEffect(() => {
    setLogsPage(1);
  }, [logsTypes, logsMethod, logsStatus]);

  // Fetch backup/restore logs whenever page or any filter changes
  useEffect(() => {
    const load = async () => {
      setLogsLoading(true);
      try {
        const offset = (logsPage - 1) * LOGS_LIMIT;
        const res = await dashbordService.getBackupRestoreLogs({
          limit: LOGS_LIMIT,
          offset,
          types: logsTypes || undefined,
          search: debouncedSearch || undefined,
          method: logsMethod || undefined,
          message_status: logsStatus || undefined,
        });
        setBackupLogs(res?.logs || []);
        setLogsTotalCount(res?.pagination?.total_count || 0);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          // Endpoint not found or no logs — show empty state quietly
          setBackupLogs([]);
          setLogsTotalCount(0);
        } else {
          console.error("Failed to fetch backup logs:", err);
          setBackupLogs([]);
        }
      } finally {
        setLogsLoading(false);
      }
    };
    load();
  }, [logsPage, logsTypes, logsMethod, logsStatus, debouncedSearch]);

  return (
    <div className="min-h-screen bg-(--bg) p-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-(--text-primary)">
          Workspace Backup Health
        </h1>

        <p className="text-sm text-(--text-secondary) mt-1">
          Real-time overview of your protected Google environment.
        </p>
      </div>

      {/* KPI - 5 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {stats.map((item, i) => (
          <Card_WorkspaceHealth
            key={i}
            item={item}
            i={i}
            loading={statsLoading}
          />
        ))}
      </div>

      {/* Dynamic Alerts */}
      {!alertsLoading && alerts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
          {alerts.re_auth_required !== undefined &&
            alerts.re_auth_required !== null && (
              <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row xl:items-center justify-between p-4.5 rounded-lg border border-(--alert-red-border) bg-(--alert-red-bg) gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--alert-red-icon-bg) text-(--alert-red-text-action) shrink-0">
                    <WarningIcon sx={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-(--alert-red-text-title)">
                      Auth Errors
                    </h4>
                    <p className="text-xs font-semibold text-(--alert-red-text-desc) mt-0.5">
                      {alerts.re_auth_required.count ?? 0}{" "}
                      {(alerts.re_auth_required.count ?? 0) === 1
                        ? "mailbox needs"
                        : "mailboxes need"}{" "}
                      re-authentication
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/users_groups?tab=Auth Errors"
                  className="text-xs font-extrabold text-(--alert-red-text-action) hover:underline shrink-0 sm:ml-auto md:ml-0 xl:ml-auto pl-14 sm:pl-0 md:pl-14 xl:pl-0"
                >
                  Review accounts &rarr;
                </Link>
              </div>
            )}

          {alerts.paused_backups !== undefined &&
            alerts.paused_backups !== null && (
              <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row xl:items-center justify-between p-4.5 rounded-lg border border-(--alert-amber-border) bg-(--alert-amber-bg) gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--alert-amber-icon-bg) text-(--alert-amber-text-action) shrink-0">
                    <PauseCircleIcon sx={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-(--alert-amber-text-title)">
                      Paused Backups
                    </h4>
                    <p className="text-xs font-semibold text-(--alert-amber-text-desc) mt-0.5">
                      {alerts.paused_backups.count ?? 0}{" "}
                      {(alerts.paused_backups.count ?? 0) === 1
                        ? "mailbox has"
                        : "mailboxes have"}{" "}
                      backup paused
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/users_groups?tab=Paused"
                  className="text-xs font-extrabold text-(--alert-amber-text-action) hover:underline shrink-0 sm:ml-auto md:ml-0 xl:ml-auto pl-14 sm:pl-0 md:pl-14 xl:pl-0"
                >
                  View paused &rarr;
                </Link>
              </div>
            )}

          {alerts.new_connected_accounts_24h !== undefined &&
            alerts.new_connected_accounts_24h !== null && (
              <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row xl:items-center justify-between p-4.5 rounded-lg border border-(--alert-indigo-border) bg-(--alert-indigo-bg) gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--alert-indigo-icon-bg) text-(--alert-indigo-text-action) shrink-0">
                    <MarkEmailUnreadIcon sx={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-(--alert-indigo-text-title)">
                      New Mailboxes Detected
                    </h4>
                    <p className="text-xs font-semibold text-(--alert-indigo-text-desc) mt-0.5">
                      {alerts.new_connected_accounts_24h.count ?? 0} new
                      Workspace{" "}
                      {(alerts.new_connected_accounts_24h.count ?? 0) === 1
                        ? "mailbox"
                        : "mailboxes"}{" "}
                      to review
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/users_groups"
                  className="text-xs font-extrabold text-(--alert-indigo-text-action) hover:underline shrink-0 sm:ml-auto md:ml-0 xl:ml-auto pl-14 sm:pl-0 md:pl-14 xl:pl-0"
                >
                  Review queue &rarr;
                </Link>
              </div>
            )}
        </div>
      )}

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-(--text-primary) mb-4">
          Protected Services Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {DASHBOARD_SERVICES.map((service, i) => {
            const bucketName = service.title.toLowerCase();
            const usages = Array.isArray(bucketUsage)
              ? bucketUsage
              : (bucketUsage as any)?.bucketUsages ||
                (bucketUsage as any)?.bucket_usages ||
                [];

            const matchedUsage = usages.find((b: any) => {
              if (!b || !b.bucketName) return false;
              const bName = b.bucketName.toLowerCase();
              return (
                bName === bucketName ||
                bName === `google-${bucketName}` ||
                bName === `google_${bucketName}`
              );
            });

            const isActive = bucketUsage === null || !!matchedUsage;

            // Extract numeric unit label (e.g. Mailboxes, Drives, Accounts, Dirs, Cals)
            const unitLabel =
              service.users.split(" ").slice(1).join(" ") || "Accounts";

            // Format dynamic storage & users counts
            const dynamicStorage =
              matchedUsage && matchedUsage.storage !== undefined
                ? formatGB(Number(matchedUsage.storage))
                : "0 B";

            const dynamicUsers =
              matchedUsage && matchedUsage.objectCount !== undefined
                ? `${matchedUsage.objectCount} ${unitLabel}`
                : `0 ${unitLabel}`;

            const dynamicService = {
              ...service,
              storage: dynamicStorage,
              users: dynamicUsers,
            };

            return (
              <Card_Services
                key={i}
                service={dynamicService}
                i={i}
                isActive={true}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Graph */}
        <div className="bg-(--bg-primary) rounded-sm border border-(--border) p-4 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="text-xs uppercase tracking-wide font-bold text-(--text-primary)">
              Storage & Bandwidth Trends
            </h3>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <Graph_StorgesBandwidth
              chartData={
                usageTrendData && usageTrendData.length > 0
                  ? usageTrendData
                  : getZeroUsageData()
              }
            />
          </div>
        </div>

        {/* Logs */}
        <div className="xl:col-span-2 bg-(--bg-primary) rounded-sm border border-(--border) overflow-hidden shadow-sm flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) shrink-0">
            <h3 className="text-xs uppercase tracking-wide font-bold text-(--text-primary)">
              Backup &amp; Restore Activity
            </h3>
            <Link
              href="/dashboard/recovery"
              className="text-xs font-bold text-emerald-500 hover:underline"
            >
              View Details &rarr;
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2.5 border-b border-(--border) bg-(--bg-secondary)/40 shrink-0 flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[140px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none text-[12px]">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search user or message…"
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-[11px] rounded-md border border-(--border) bg-(--bg-primary) text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-1 focus:ring-(--primary)/40"
              />
            </div>

            {/* Type toggle: Both / Backup / Restore */}
            <div className="flex items-center gap-0.5 rounded-md border border-(--border) overflow-hidden text-[10px] font-bold uppercase shrink-0">
              {(["backup,restore", "backup", "restore"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setLogsTypes(v)}
                  className={`px-2.5 py-1.5 transition ${
                    logsTypes === v
                      ? "bg-(--primary) text-white"
                      : "text-(--text-muted) hover:bg-(--bg-secondary)"
                  }`}
                >
                  {v === "backup,restore" ? "All" : v}
                </button>
              ))}
            </div>

            {/* Service dropdown */}
            <select
              value={logsMethod}
              onChange={(e) => setLogsMethod(e.target.value)}
              className="text-[11px] px-2.5 py-1.5 rounded-md border border-(--border) bg-(--bg-primary) text-(--text-secondary) focus:outline-none focus:ring-1 focus:ring-(--primary)/40 shrink-0"
            >
              <option value="">All Services</option>
              <option value="gmail">Gmail</option>
              <option value="google_drive">Drive</option>
              <option value="google_contacts">Contacts</option>
              <option value="google_calendar">Calendar</option>
              {/* <option value="google_photos">Photos</option> */}
            </select>

            {/* Status dropdown */}
            <select
              value={logsStatus}
              onChange={(e) => setLogsStatus(e.target.value)}
              className="text-[11px] px-2.5 py-1.5 rounded-md border border-(--border) bg-(--bg-primary) text-(--text-secondary) focus:outline-none focus:ring-1 focus:ring-(--primary)/40 shrink-0"
            >
              <option value="">All Status</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            {/* Clear filters */}
            {(logsSearch ||
              logsTypes !== "backup,restore" ||
              logsMethod ||
              logsStatus) && (
              <button
                onClick={() => {
                  setLogsSearch("");
                  setLogsTypes("backup,restore");
                  setLogsMethod("");
                  setLogsStatus("");
                }}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 px-2 py-1.5 rounded-md hover:bg-rose-500/10 transition shrink-0"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Table & Pagination */}
          <div className="flex-1 relative flex flex-col min-h-0">
            {logsLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-(--bg-primary)/60 z-10">
                <div className="w-5 h-5 rounded-md border-2 border-(--primary) border-t-transparent animate-spin" />
              </div>
            )}
            {!logsLoading && backupLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-(--text-muted)">
                <span className="text-2xl mb-2">📋</span>
                <p className="text-xs font-bold">No log entries found</p>
              </div>
            ) : (
              <TableWithPagination
                thead={BACKUP_LOGS_TABLE_HEAD}
                tbody={backupLogs}
                page={logsPage}
                setPage={setLogsPage}
                limit={LOGS_LIMIT}
                setLimit={() => {}}
                currentPage={logsPage}
                totalPages={Math.ceil(logsTotalCount / LOGS_LIMIT)}
                totalCount={logsTotalCount}
                maxHeight="100%"
                hideLimitSelector={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
