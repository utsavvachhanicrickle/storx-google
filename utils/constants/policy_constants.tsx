import React from "react";
import ServiceIcon from "@/components/ui/ServiceIcon";
import { TableColumn } from "@/components/ui/TableCompoenets";
import UserProfile from "@/components/ui/UserProfile";

// Types
export interface LinkedJob {
  job_id: number;
  name?: string;
  email: string;
  method: string;
  sync_type: string;
  on?: string;
  retention_type?: string;
  services?: string[];
  last_backup?: string;
  next_backup?: string;
  status?: string;
  input_data?: any;
}

export interface Policy {
  policy_id: number;
  credential_id: number;
  name: string;
  email: string;
  type: "Account" | "Group";
  interval: string;
  on: string;
  retention_type: string;
  is_expired: boolean;
  linked_job_count: number;
  services: string[];
  next_backup: string;
  linked_jobs: LinkedJob[];
  applied_to?: number;
  badge?: string;
  has_red_link?: boolean;
  active?: boolean;
  assignment_count?: number;
  unique_email_count?: number;
}

export interface Assignment {
  id: string; // e.g. `${service}-${email}`
  job_id: number;
  name: string;
  email: string;
  service: string;
}

// Sync intervals & Retention options
export {
  RETENTION_OPTIONS,
  SYNC_INTERVAL_OPTIONS,
  RETENTION_API_MAP,
  SYNC_INTERVAL_API_MAP,
  WEEK_DAYS,
  MONTH_DAYS,
  ALL_SERVICES,
  formatPolicy,
} from "./default_data";

export type { RetentionOption, SyncIntervalOption } from "./default_data";

// Table Column Definitions
export const getPolicyTableColumns = (
  onMoveSingle: (row: Assignment) => void,
): TableColumn[] => [
  {
    key: "email",
    label: "EMAIL",
    flex: 1.5,
    minWidth: 260,
    type: "component",
    value: (row: Assignment) => (
      <UserProfile name={row.name} email={row.email} />
    ),
  },
  {
    key: "service",
    label: "SERVICE",
    flex: 1.0,
    minWidth: 150,
    type: "component",
    value: (row: Assignment) => (
      <div className="flex items-center gap-2">
        <ServiceIcon name={row.service} className="w-4 h-4 shrink-0" />
        <span className="font-bold text-(--text-primary) capitalize">
          {row.service}
        </span>
      </div>
    ),
  },
  {
    key: "actions",
    label: "ACTIONS",
    flex: 0,
    width: 90,
    minWidth: 80,
    className: "text-right",
    type: "component",
    value: (row: Assignment) => (
      <button
        onClick={() => onMoveSingle(row)}
        className="text-(--primary) hover:text-(--primary-hover) font-extrabold cursor-pointer hover:underline text-xs"
      >
        Move
      </button>
    ),
  },
];
