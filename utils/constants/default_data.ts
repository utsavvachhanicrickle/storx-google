import React from "react";

// Table & Pagination Interfaces
export interface TableColumn {
  key: string;
  label: string;

  sortable?: boolean;
  sortOrder?: "asc" | "desc";
  filter?: boolean | string;
  floatingFilter?: boolean;

  className?: string;
  cellClassName?: (value: any) => string;
  value?: (row: any) => React.ReactNode;
  headerRenderer?: (params: any) => React.ReactNode;
  type?:
    | "text"
    | "status"
    | "actions"
    | "component"
    | "image"
    | "link"
    | "time";
  wrapText?: boolean;
  autoHeight?: boolean;
  flex?: number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface TableButton {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: (row: any) => void;
}

export interface TableProps {
  headers?: string;
  thead: TableColumn[];
  tbody: any[];
  clickable?: boolean;
  className?: string;
  tableClassName?: string;
  rowClassName?: string;
  onRowClick?: (row: any) => void;
  actions?: TableButton[];
  showHead?: boolean;
  maxHeight?: string;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  checkboxSelection?: boolean;
  onSelectionChanged?: (selectedRows: any[]) => void;
  floatingFilter?: boolean;
  onFilterChange?: (filters: Record<string, any>) => void;
}

export interface TableWithPaginationProps {
  thead: TableColumn[];
  tbody: any[];
  clickable?: boolean;
  onRowClick?: (row: any) => void;
  className?: string;
  currentPage: number;
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  maxHeight?: string;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  checkboxSelection?: boolean;
  onSelectionChanged?: (selectedRows: any[]) => void;
  floatingFilter?: boolean;
  onFilterChange?: (filters: Record<string, any>) => void;
  totalCount?: number;
  hideLimitSelector?: boolean;
}

export const TABLE_ROWS_LIMIT_OPTIONS = [10, 20, 30, 50, 100] as const;

// Sync intervals & Retention options
export const RETENTION_OPTIONS = [
  "Infinite",
  "30 Days",
  "1 Year",
  "7 Years",
] as const;

export type RetentionOption = (typeof RETENTION_OPTIONS)[number];

export const SYNC_INTERVAL_OPTIONS = [
  "Every 3 Hours",
  "Every 12 Hours",
  "Daily",
  "Weekly",
  "Monthly",
] as const;

export type SyncIntervalOption = (typeof SYNC_INTERVAL_OPTIONS)[number];

export const RETENTION_API_MAP: Record<RetentionOption, string> = {
  Infinite: "never",
  "30 Days": "30_days",
  "1 Year": "1_year",
  "7 Years": "7_years",
};

export const SYNC_INTERVAL_API_MAP: Record<
  SyncIntervalOption,
  { interval: string; on: string }
> = {
  "Every 3 Hours": { interval: "3h", on: "" },
  "Every 12 Hours": { interval: "12h", on: "" },
  Daily: { interval: "nightly", on: "12am" },
  Weekly: { interval: "weekly", on: "Sunday" },
  Monthly: { interval: "monthly", on: "1" },
};

export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));


export const ALL_SERVICES = [
  { id: "gmail", label: "Gmail", emoji: "✉️" },
  { id: "drive", label: "Google Drive", emoji: "📁" },
  { id: "calendar", label: "Calendar", emoji: "📅" },
  { id: "contacts", label: "Contacts", emoji: "👤" },
  // { id: "photos", label: "Google Photos", emoji: "🌴" },
];

export const formatPolicy = (interval: string, on: string = ""): string => {
  const intervalVal = (interval || "").toLowerCase();
  const onVal = on || "";

  if (intervalVal === "6h") {
    return "Every 6 Hours";
  } else if (intervalVal === "12h" || intervalVal === "12 hours") {
    return "12 Hours";
  } else if (intervalVal === "daily" || intervalVal === "nightly") {
    return `Daily ${onVal ? `at ${onVal}` : ""}`.trim();
  } else if (intervalVal === "weekly") {
    return `Weekly ${onVal ? `on ${onVal}` : ""}`.trim();
  } else if (intervalVal === "monthly") {
    return `Monthly ${onVal ? `on Day ${onVal}` : ""}`.trim();
  }

  return interval || "Daily";
};
