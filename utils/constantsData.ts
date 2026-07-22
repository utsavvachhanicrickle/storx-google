// ─── Display options (shown in UI dropdowns) ────────────────────────────────

export const RETENTION_OPTIONS = [
  "Infinite",
  "30 Days",
  "1 Year",
  "3 Years",
  "7 Years",
] as const;

export type RetentionOption = (typeof RETENTION_OPTIONS)[number];

export const SYNC_INTERVAL_OPTIONS = [
  "Every 3 hours",
  "12 Hours",
  "Daily",
  "Weekly",
  "Monthly",
] as const;

export type SyncIntervalOption = (typeof SYNC_INTERVAL_OPTIONS)[number];

// ─── API value maps (display → backend value) ────────────────────────────────

export const RETENTION_API_MAP: Record<RetentionOption, string> = {
  "Infinite":  "never",
  "30 Days":   "30_days",
  "1 Year":    "1_year",
  "3 Years":   "3_years",
  "7 Years":   "7_years",
};

export const SYNC_INTERVAL_API_MAP: Record<SyncIntervalOption, { interval: string; on: string }> = {
  "Every 3 hours":  { interval: "3h",       on: "" },
  "12 Hours":         { interval: "12h",      on: "" },
  "Daily":            { interval: "nightly",  on: "12am" },
  "Weekly":           { interval: "weekly",   on: "Sunday" },
  "Monthly":          { interval: "monthly",  on: "1" },
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

export const DAY_HOURS = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
];
