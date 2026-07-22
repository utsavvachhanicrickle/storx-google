import React from "react";
import { TableColumn } from "@/utils/constants/default_data";
import { DashboardStatItem } from "@/services/dashbordService";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import {
  GmailIcon,
  DriveIcon,
  ContactsIcon,
  CalendarIcon,
  PhotosIcon,
} from "@/components/ui/ServiceIcon";

export const METHOD_LABEL: Record<string, string> = {
  gmail: "Gmail",
  google_drive: "Drive",
  drive: "Drive",
  google_contacts: "Contacts",
  contacts: "Contact",
  google_calendar: "Calendar",
  calendar: "Calendar",
  google_photos: "Photos",
  photos: "Photos",
};

export const METHOD_COLOR: Record<string, string> = {
  gmail: "bg-red-500/10 text-red-500",
  google_drive: "bg-blue-500/10 text-blue-500",
  drive: "bg-blue-500/10 text-blue-500",
  google_contacts: "bg-teal-500/10 text-teal-500",
  contacts: "bg-teal-500/10 text-teal-500",
  google_calendar: "bg-indigo-500/10 text-indigo-500",
  calendar: "bg-indigo-500/10 text-indigo-500",
  google_photos: "bg-amber-500/10 text-amber-500",
  photos: "bg-amber-500/10 text-amber-500",
};

export interface DashboardStatConfig {
  title: string;
  value: string;
  border: string;
  badge?: string;
  suffix?: string;
  progress?: number;
  details?: string;
}

export const DASHBOARD_STATS: DashboardStatConfig[] = [
  {
    title: "Protected Users",
    value: "124",
    badge: "+2 this week",
    border: "border-emerald-500",
  },
  {
    title: "Storage Quota",
    value: "840",
    suffix: "GB / 1 TB",
    progress: 84,
    border: "border-blue-500",
    badge: "84% Used",
  },
  {
    title: "Download Quota",
    value: "1,402",
    border: "border-indigo-500",
    details: "1,402 download quota used",
  },
  {
    title: "Last Snapshot",
    value: "6",
    suffix: "mins ago",
    details: "6,377 items synced successfully",
    border: "border-cyan-500",
  },
  {
    title: "Plan Status",
    value: "Trial",
    details: "Enterprise Eval",
    badge: "14 Days Left",
    border: "border-indigo-500",
  },
];

export interface DashboardServiceConfig {
  title: string;
  icon: string;
  storage: string;
  users: string;
}

export const DASHBOARD_SERVICES: DashboardServiceConfig[] = [
  {
    title: "Gmail",
    icon: "📨",
    storage: "210 GB",
    users: "124 Mailboxes",
  },
  {
    title: "Drive",
    icon: "🗂️",
    storage: "580 GB",
    users: "124 Drives",
  },
  // {
  //   title: "Photos",
  //   icon: "🏝️",
  //   storage: "45 GB",
  //   users: "42 Accounts",
  // },
  {
    title: "Contacts",
    icon: "👥",
    storage: "2 GB",
    users: "124 Dirs",
  },
  {
    title: "Calendar",
    icon: "🗓️",
    storage: "5 GB",
    users: "124 Cals",
  },
];

export const SKELETON_STATS: DashboardStatItem[] = DASHBOARD_STATS.map((s) => ({
  title: s.title,
  description: "",
  icon: { backgroundColor: "", url: "" },
  button: null,
  status: null,
  value_1: null,
  value_2: 0,
  value_2_label: s.progress ? "percent_used" : undefined,
}));

export const BACKUP_LOGS_TABLE_HEAD: TableColumn[] = [
  {
    key: "type",
    label: "TYPE",
    width: 100,
    minWidth: 90,
    flex: 0,
    type: "component",
    value: (row: any) => {
      const isRestore = row.type === "restore";
      const status = (row.message_status || "info").toLowerCase();
      let icon = (
        <InfoIcon sx={{ fontSize: 14 }} className="text-blue-500 shrink-0" />
      );
      if (status === "error") {
        icon = (
          <ErrorIcon sx={{ fontSize: 14 }} className="text-rose-500 shrink-0" />
        );
      } else if (status === "warning") {
        icon = (
          <WarningIcon
            sx={{ fontSize: 14 }}
            className="text-amber-500 shrink-0"
          />
        );
      }

      return (
        <span className="flex items-center gap-1.5 select-none">
          {icon}
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
              isRestore
                ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}
          >
            {isRestore ? "Restore" : "Backup"}
          </span>
        </span>
      );
    },
  },
  {
    key: "subject",
    label: "USER",
    width: 140,
    minWidth: 100,
    type: "component",
    value: (row: any) => (
      <span className="text-xs font-semibold text-(--text-primary) truncate block">
        {row.subject || "—"}
      </span>
    ),
  },
  {
    key: "method",
    label: "SERVICE",
    width: 115,
    minWidth: 95,
    flex: 0,
    type: "component",
    value: (row: any) => {
      const key = (row.method || "").toLowerCase();
      const label = METHOD_LABEL[key] || row.method || "—";
      const color = METHOD_COLOR[key] || "bg-gray-500/10 text-gray-400";

      let icon = null;
      if (key.includes("gmail")) icon = <GmailIcon className="w-3.5 h-3.5" />;
      else if (key.includes("drive"))
        icon = <DriveIcon className="w-3.5 h-3.5" />;
      else if (key.includes("contacts"))
        icon = <ContactsIcon className="w-3.5 h-3.5" />;
      else if (key.includes("calendar"))
        icon = <CalendarIcon className="w-3.5 h-3.5" />;
      else if (key.includes("photos"))
        icon = <PhotosIcon className="w-3.5 h-3.5" />;

      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider border ${color} border-current/15`}
        >
          {icon}
          <span>{label}</span>
        </span>
      );
    },
  },
  {
    key: "message",
    label: "MESSAGE",
    flex: 1.8,
    minWidth: 100,
    type: "component",
    className: "text-left",
    value: (row: any) => {
      const isError =
        row.message_status === "error" || row.message_status === "warning";
      const fullMessage = row.message || "—";
      return (
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <Tooltip title={fullMessage} arrow placement="top">
            <span
              className={`text-xs block truncate text-left cursor-help w-full ${
                isError ? "text-rose-500 font-bold" : "text-(--text-secondary)"
              }`}
            >
              <span className="inline md:hidden">
                {fullMessage.length > 25
                  ? `${fullMessage.substring(0, 22)}...`
                  : fullMessage}
              </span>
              <span className="hidden md:inline lg:hidden">
                {fullMessage.length > 40
                  ? `${fullMessage.substring(0, 37)}...`
                  : fullMessage}
              </span>
              <span className="hidden lg:inline xl:hidden">
                {fullMessage.length > 75
                  ? `${fullMessage.substring(0, 72)}...`
                  : fullMessage}
              </span>
              <span className="hidden xl:inline">
                {fullMessage.length > 100
                  ? `${fullMessage.substring(0, 97)}...`
                  : fullMessage}
              </span>
            </span>
          </Tooltip>
        </div>
      );
    },
  },
];
