"use client";

import React, { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchJobDetails } from "@/store/slices/jobSlice";
import ServiceIcon, { DocumentIcon } from "@/components/ui/ServiceIcon";
import Table, { TableColumn } from "@/components/ui/TableCompoenets";
import {
  Service,
  Account,
} from "@/components/ui/service_update/ConfigureServiceModal";

interface LogItem {
  id: string;
  time: string;
  status: string;
  details: string;
}

interface SyncLogsModalProps {
  isOpen: boolean;
  service: Service;
  account: Account | null;
  onClose: () => void;
}

export default function SyncLogsModal({
  isOpen,
  service,
  account,
  onClose,
}: SyncLogsModalProps) {
  const dispatch = useAppDispatch();
  const jobInfo = useAppSelector((state) =>
    account?.id ? state.job.jobDetails[account.id] : null,
  );
  const loading = useAppSelector((state) => state.job.loading);
  const error = useAppSelector((state) => state.job.error);

  useEffect(() => {
    if (isOpen && account?.id) {
      dispatch(fetchJobDetails(account.id));
    }
  }, [dispatch, isOpen, account?.id]);

  const logs = useMemo<LogItem[]>(() => {
    if (!jobInfo) return [];

    let rawLogs =
      jobInfo.logs ||
      jobInfo.history ||
      jobInfo.runs ||
      jobInfo.tasks ||
      jobInfo.Tasks ||
      (Array.isArray(jobInfo) ? jobInfo : null) ||
      [];

    if (!Array.isArray(rawLogs) || rawLogs.length === 0) {
      if (jobInfo && (jobInfo.status || jobInfo.message || jobInfo.Status || jobInfo.Message)) {
        rawLogs = [
          {
            id: String(jobInfo.ID ?? jobInfo.id ?? "current"),
            time: jobInfo.UpdatedAt ?? jobInfo.updated_at ?? jobInfo.CreatedAt ?? jobInfo.created_at ?? jobInfo.time ?? "",
            status: jobInfo.status ?? jobInfo.Status ?? "success",
            details: jobInfo.message || jobInfo.Message || `Job status: ${jobInfo.status ?? jobInfo.Status ?? "created"}`,
          }
        ];
      }
    }

    if (!Array.isArray(rawLogs)) return [];

    return rawLogs.map((log: any, idx: number) => {
      let timeStr =
        log.time || log.timestamp || log.created_at || "Unknown time";
      if (timeStr && timeStr.includes("T")) {
        try {
          const date = new Date(timeStr);
          timeStr = date.toLocaleString();
        } catch (e) {
          // ignore
        }
      }

      return {
        id: String(log.id || log.log_id || idx),
        time: timeStr,
        status: log.status ,
        details:
          log.details ||
          log.message ||
          log.description ||
          "No details provided.",
      };
    });
  }, [jobInfo]);

  const logColumns: TableColumn[] = useMemo(
    () => [
      {
        key: "time",
        label: "TIME",
        flex: 0,
        width: 200,
        className:
          "px-2 py-2 text-xs font-bold text-(--text-secondary) whitespace-nowrap text-left",
      },
      {
        key: "service",
        label: "SERVICE",
        type: "component",
        flex: 0,
        width: 200,
        className: "px-2 py-2 whitespace-nowrap text-center",
        value: () => (
          <div className="flex items-center gap-2">
            <ServiceIcon name={service.iconName} className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm text-(--text-primary)">
              {service.name}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        label: "STATUS",
        type: "component",
        flex: 0,
        width: 100,
        className: "px-2 py-2 whitespace-nowrap text-left",
        value: (row: LogItem) => {
          const statusVal = String(row.status || "").toUpperCase();
          let badgeClass =
            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
          if (
            statusVal === "NO CHANGES" ||
            statusVal === "NO_CHANGES" ||
            statusVal === "SKIPPED"
          ) {
            badgeClass = "bg-slate-500/10 text-slate-500 border-slate-500/20";
          } else if (statusVal === "FAILED" || statusVal === "ERROR") {
            badgeClass = "bg-rose-500/10 text-rose-500 border-rose-500/20";
          } else if (statusVal === "RUNNING" || statusVal === "IN_PROGRESS") {
            badgeClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
          }
          return (
            <span
              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-wide border ${badgeClass}`}
            >
              {row.status}
            </span>
          );
        },
      },
      {
        key: "details",
        label: "DETAILS",
        wrapText: true,
        autoHeight: true,
        flex: 2,
        minWidth: 200,
        className:
          "px-4.5 py-2 text-xs font-medium text-(--text-secondary) text-left",
      },
    ],
    [service],
  );

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-60 sm:p-4 select-none animate-in fade-in duration-200">
      {/* Backdrop click-to-close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-(--bg-primary) border border-(--border) shadow-(--shadow-lg) w-full h-full sm:h-auto sm:max-w-4xl rounded-none sm:rounded-md overflow-hidden flex flex-col p-5 animate-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-(--border-light) shrink-0">
          <h3 className="text-base font-extrabold text-(--text-primary) flex items-center gap-2.5">
            <DocumentIcon className="w-5 h-5 text-[#00a389] shrink-0" />
            <span>
              Google Sync Logs:{" "}
              <span className="text-[#00a389] font-bold">
                {account.name} ({service.name})
              </span>
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-sm transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-100 rounded text-rose-700 text-xs font-bold flex items-center justify-between">
            <span>⚠️ Failed to load logs: {error}</span>
            <button
              onClick={() =>
                account?.id && dispatch(fetchJobDetails(account.id))
              }
              className="px-2 py-0.5 bg-white border border-rose-200 rounded text-rose-700 hover:bg-rose-50 cursor-pointer text-[10px]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table wrapper */}
        <div className="max-h-[600px] sm:max-h-auto overflow-y-auto mb-2 rounded-sm border border-(--border) bg-(--bg-primary)">
          {loading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-teal-500 rounded-md border-t-transparent animate-spin mb-3" />
              <p className="text-xs font-bold text-(--text-muted) animate-pulse tracking-wide uppercase">
                Loading sync history...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-3xl mb-2">📄</span>
              <p className="text-xs font-bold text-(--text-primary)">
                No Audit Logs Available
              </p>
              <p className="text-[10px] text-(--text-muted) mt-0.5">
                No sync events have been recorded for this job yet.
              </p>
            </div>
          ) : (
            <Table
              thead={logColumns}
              tbody={logs}
              className="border-none shadow-none rounded-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
