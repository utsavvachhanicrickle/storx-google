import React from "react";
import { TableColumn } from "@/components/ui/TableCompoenets";
import {
  GmailIcon,
  DriveIcon,
  ContactsIcon,
  CalendarIcon,
  PhotosIcon,
} from "@/components/ui/ServiceIcon";
import UserProfile from "@/components/ui/UserProfile";

export type FilterTab =
  | "All"
  | "Corporate"
  | "Individual"
  | "Auth Errors"
  | "Paused";

export const FILTER_TABS: readonly FilterTab[] = [
  "All",
  "Corporate",
  "Individual",
  "Auth Errors",
] as const;

export interface UserRow {
  id: string;
  name: string;
  domain: string;
  policy: string;
  status: string;
  email?: string;
  account_type?: string;
  services: string[];
  rawServices?: any[];
  credential_status?: string;
  last_run?: string;
  last_backup?: string;
  next_backup?: string;
  paused: boolean;
  [key: string]: any;
}

interface CorporateTableColumnsParams {
  handleToggleSelectAll: () => void;
  allVisibleChecked: boolean;
  isPartiallyChecked: boolean;
  checkedUsers: Record<string, boolean>;
  handleToggleRow: (userId: string) => void;
  setSelectedUser: (user: any) => void;
}

export const getCorporateTableColumns = ({
  handleToggleSelectAll,
  allVisibleChecked,
  isPartiallyChecked,
  checkedUsers,
  handleToggleRow,
  setSelectedUser,
}: CorporateTableColumnsParams): TableColumn[] => [
  {
    key: "checkbox",
    label: "",
    flex: 0,
    minWidth: 40,
    maxWidth: 40,
    floatingFilter: false,
    className: "!px-1 flex !justify-center items-center text-center",
    type: "component",
    headerRenderer: () => (
      <div
        onClick={handleToggleSelectAll}
        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
          allVisibleChecked || isPartiallyChecked
            ? "bg-(--primary) border-(--primary)"
            : "bg-(--bg-primary) border-(--border-strong)"
        }`}
      >
        {allVisibleChecked && (
          <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
          </svg>
        )}
        {!allVisibleChecked && isPartiallyChecked && (
          <div className="w-2.5 h-0.5 bg-white rounded-xs" />
        )}
      </div>
    ),
    value: (row: any) => {
      const isChecked = !!checkedUsers[row.id];
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleToggleRow(row.id);
          }}
          className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
            isChecked
              ? "bg-(--primary) border-(--primary)"
              : "bg-(--bg-primary) border-(--border-strong)"
          }`}
        >
          {isChecked && (
            <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          )}
        </div>
      );
    },
  },
  {
    key: "name",
    label: "ACCOUNT",
    type: "component",
    flex: 2.0,
    minWidth: 200,
    value: (row: any) => <UserProfile name={row.name} email={row.email} />,
  },
  {
    key: "account_type",
    label: "TYPE",
    type: "component",
    flex: 1.0,
    minWidth: 120,
    value: (row: any) => {
      const isCorporate = row.account_type === "corporate";
      return (
        <span
          className={`px-2.5 py-1 rounded-[4px] text-[10px] font-black tracking-wider uppercase border select-none ${
            isCorporate
              ? "bg-violet-50 text-violet-600 border-violet-100"
              : "bg-teal-50 text-teal-600 border-teal-100"
          }`}
        >
          {isCorporate ? "Corporate" : "Individual"}
        </span>
      );
    },
  },
  {
    key: "services",
    label: "SERVICES",
    type: "component",
    flex: 1.8,
    minWidth: 200,
    value: (row: any) => {
      const servicesList = row.rawServices || [];

      const getServiceState = (methodId: string) => {
        const found = servicesList.find(
          (s: any) =>
            s.method === methodId ||
            (methodId === "drive" && s.method === "google_drive") ||
            // (methodId === "photos" && s.method === "google_photos") ||
            (methodId === "contacts" && s.method === "google_contacts") ||
            (methodId === "calendar" && s.method === "google_calendar"),
        );
        if (!found) return { present: false, active: false };
        return {
          present: found.connected === true,
          active: found.active !== false,
        };
      };

      const gmailState = getServiceState("gmail");
      const driveState = getServiceState("drive");
      const contactsState = getServiceState("contacts");
      const calendarState = getServiceState("calendar");
      // const photosState = getServiceState("photos");

      const iconClass = (state: { present: boolean; active: boolean }) => {
        if (state.present && state.active) {
          return "w-5 h-5 transition-all";
        }
        return "w-5 h-5 grayscale opacity-30 contrast-75 brightness-75 transition-all";
      };

      return (
        <div className="flex items-center gap-1.5 mt-1 select-none">
          {gmailState.present && (
            <span title={gmailState.active ? "Gmail Active" : "Gmail Disabled"}>
              <GmailIcon className={iconClass(gmailState)} />
            </span>
          )}
          {driveState.present && (
            <span title={driveState.active ? "Drive Active" : "Drive Disabled"}>
              <DriveIcon className={iconClass(driveState)} />
            </span>
          )}
          {/* {photosState.present && (
            <span
              title={photosState.active ? "Photos Active" : "Photos Disabled"}
            >
              <PhotosIcon className={iconClass(photosState)} />
            </span>
          )} */}
          {contactsState.present && (
            <span
              title={
                contactsState.active ? "Contacts Active" : "Contacts Disabled"
              }
            >
              <ContactsIcon className={iconClass(contactsState)} />
            </span>
          )}
          {calendarState.present && (
            <span
              title={
                calendarState.active ? "Calendar Active" : "Calendar Disabled"
              }
            >
              <CalendarIcon className={iconClass(calendarState)} />
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "credential_status",
    label: "CREDENTIALS",
    type: "component",
    flex: 1.2,
    minWidth: 130,
    value: (row: any) => {
      const isHealthy = row.credential_status === "healthy";
      return (
        <span
          className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border select-none ${
            isHealthy
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-rose-50 text-rose-600 border-rose-100"
          }`}
        >
          {isHealthy ? "Healthy" : "Re-auth required"}
        </span>
      );
    },
  },
  {
    key: "actions",
    label: "ACTIONS",
    type: "component",
    flex: 1.8,
    minWidth: 180,
    value: (row: any) => {
      return (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedUser(row)}
            className="px-2.5 py-1 text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition rounded cursor-pointer"
          >
            Manage
          </button>
        </div>
      );
    },
  },
];
