"use client";

import React, { useMemo, useState } from "react";
import toast from "@/components/Toast";
import ServiceIcon, {
  GearIcon,
  DocumentIcon,
  PlayIcon,
  PauseIcon,
} from "@/components/ui/ServiceIcon";
import Table, { TableColumn } from "@/components/ui/TableCompoenets";
import SyncLogsModal from "@/components/ui/service_update/SyncLogsModal";
import Button from "../Button";

export interface Service {
  id: string;
  name: string;
  description: string;
  active: number;
  inactive: number;
  iconName: string;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  lastBackup: string;
  nextBackup: string;
  status: "SUCCESS" | "FAILED" | "NOT SYNCING" | "SCHEDULED" | "CREATED";
  paused: boolean;
}

interface ConfigureServiceModalProps {
  service: Service | null;
  accounts: Account[];
  onClose: () => void;
  onToggleAccount: (accountId: string) => void;
}

export default function ConfigureServiceModal({
  service,
  accounts,
  onClose,
  onToggleAccount,
}: ConfigureServiceModalProps) {
  const [selectedAccountForLogs, setSelectedAccountForLogs] =
    useState<Account | null>(null);
  // Memoize column definitions to prevent unnecessary re-renders
  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "name",
        label: "Account",
        type: "component",
        className: "px-6 py-4 whitespace-nowrap text-left",
        value: (row: Account) => (
          <div>
            <div className="font-bold text-sm text-(--text-primary)">
              {row.name}
            </div>
            <div className="text-xs text-(--text-muted) mt-0.5 font-medium">
              {row.email}
            </div>
          </div>
        ),
      },
      {
        key: "lastBackup",
        label: "Last Backup",
        type: "text",
        className:
          "px-6 py-4 text-xs font-bold text-(--text-secondary) whitespace-nowrap text-left",
      },
      {
        key: "nextBackup",
        label: "Next Backup",
        type: "text",
        className:
          "px-6 py-4 text-xs font-bold text-(--text-secondary) whitespace-nowrap text-left",
      },
      {
        key: "status",
        label: "Status",
        type: "component",
        className: "px-6 py-4 whitespace-nowrap text-left",
        value: (row: Account) => (
          <span
            className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wide border transition-colors ${
              row.status === "SUCCESS"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : row.status === "FAILED"
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : row.status === "CREATED"
                    ? "bg-sky-500/10 text-sky-500 border-sky-500/20"
                    : row.status === "SCHEDULED"
                      ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                      : "bg-slate-500/10 text-slate-500 border-slate-500/20"
            }`}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        type: "component",
        className: "px-6 py-4 text-right whitespace-nowrap",
        value: (row: Account) => (
          <div className="flex justify-end items-center gap-3">
            <button
              title="Audit Logs"
              onClick={() => setSelectedAccountForLogs(row)}
              className="p-1 text-(--text-muted) hover:text-(--text-primary) transition-colors duration-150 cursor-pointer"
            >
              <DocumentIcon className="w-5 h-5" />
            </button>
            <button
              title={row.paused ? "Resume Sync" : "Pause Sync"}
              onClick={() => onToggleAccount(row.id)}
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
    [onToggleAccount],
  );

  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 sm:p-4 select-none animate-in fade-in duration-200">
      {/* Backdrop area click-to-close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-(--bg-primary) border-0 sm:border border-(--border) shadow-(--shadow-lg) w-full h-full sm:h-auto sm:max-w-4xl rounded-none sm:rounded-md overflow-hidden flex flex-col p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-(--border-light) shrink-0">
          <h3 className="text-base font-extrabold text-(--text-primary) flex items-center gap-2.5">
            <GearIcon className="w-5 h-5 text-(--text-secondary) shrink-0 animate-spin-slow" />
            <span>Configure {service.name}</span>
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

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto min-h-0 sm:flex-initial">
          <p className="text-xs font-bold text-(--text-muted) mb-5">
            The following accounts are currently authorized and syncing{" "}
            <span className="font-extrabold text-(--text-primary)">
              {service.name}
            </span>{" "}
            data.
          </p>

          <div className="max-h-[300px] sm:max-h-none overflow-y-auto mb-6 rounded-sm border border-(--border) bg-(--bg-primary)">
            <Table
              thead={columns}
              tbody={accounts}
              className="border-none shadow-none rounded-none"
              tableClassName="min-w-full"
            />
          </div>
        </div>

        {/* Done button */}
        <div className="flex justify-end select-none pt-4 border-t border-(--border-light) sm:border-none shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              toast.success(`✓ Saved configurations for ${service.name}.`);
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      </div>

      {/* GOOGLE SYNC LOGS MODAL OVERLAY */}
      <SyncLogsModal
        isOpen={!!selectedAccountForLogs}
        service={service}
        account={selectedAccountForLogs}
        onClose={() => setSelectedAccountForLogs(null)}
      />
    </div>
  );
}
