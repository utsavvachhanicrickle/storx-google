"use client";

import React from "react";
import Link from "next/link";
import { formatPolicy } from "@/utils/constants";
import {
  GmailIcon,
  DriveIcon,
  PhotosIcon,
  ContactsIcon,
  CalendarIcon,
} from "@/components/ui/ServiceIcon";

interface ScheduleTabProps {
  rawServices?: any[];
}

export default function ScheduleTab({ rawServices = [] }: ScheduleTabProps) {
  console.log(rawServices, "rawServices in ScheduleTab");

  // Helper function to capitalize and map retention
  const formatRetention = (retType?: string): string => {
    if (!retType) return "";
    const clean = retType.toLowerCase();
    if (clean === "never" || clean === "infinite") {
      return "Infinite (Never Delete)";
    }
    if (clean === "30_days") return "30 Days";
    if (clean === "1_year") return "1 Year";
    if (clean === "3_years") return "3 Years";
    if (clean === "7_years") return "7 Years";
    return retType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
  };

  const getServiceIcon = (method: string) => {
    const clean = method.toLowerCase();
    if (clean === "gmail") return <GmailIcon className="w-4 h-4 shrink-0" />;
    if (clean === "drive" || clean === "google_drive")
      return <DriveIcon className="w-4 h-4 shrink-0" />;
    if (clean === "photos" || clean === "google_photos")
      return <PhotosIcon className="w-4 h-4 shrink-0" />;
    if (clean === "contacts" || clean === "google_contacts")
      return <ContactsIcon className="w-4 h-4 shrink-0" />;
    if (
      clean === "calendar" ||
      clean === "google_calendar" ||
      clean === "calender"
    )
      return <CalendarIcon className="w-4 h-4 shrink-0" />;
    return null;
  };

  const getServiceLabel = (method: string) => {
    const clean = method.toLowerCase();
    if (clean === "gmail") return "Gmail";
    if (clean === "drive" || clean === "google_drive") return "Drive";
    if (clean === "photos" || clean === "google_photos") return "Photos";
    if (clean === "contacts" || clean === "google_contacts") return "Contacts";
    if (
      clean === "calendar" ||
      clean === "google_calendar" ||
      clean === "calender"
    )
      return "Calendar";
    return method;
  };

  // Group connected services by policy_id
  const groups: { [key: number]: any[] } = {};
  rawServices.forEach((s: any) => {
    if (s.connected && s.policy_id !== null && s.policy_id !== undefined) {
      const pid = Number(s.policy_id);
      if (!groups[pid]) {
        groups[pid] = [];
      }
      groups[pid].push(s);
    }
  });

  const groupEntries = Object.entries(groups);

  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto bg-(--bg-primary) text-(--text-primary)">
      {groupEntries.length === 0 ? (
        <div className="p-6 bg-teal-500/5 border border-teal-500/20 rounded-md flex flex-col shadow-2xs">
          <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider">
            Assigned Policy
          </span>
          <h3 className="text-lg font-extrabold text-(--text-primary) mt-2.5">
            No Policy Assigned
          </h3>
          <p className="text-[11px] font-bold text-(--text-muted) mt-4 border-t border-(--border-light) pt-3">
            Schedule is managed by policy.
          </p>
        </div>
      ) : (
        groupEntries.map(([policyIdStr, groupServices]) => {
          const policyId = Number(policyIdStr);
          const firstService = groupServices[0];
          const interval = firstService.interval;
          const on = firstService.on;
          const retentionType = firstService.retention_type;
          const policyName = firstService.policy_name || `Policy #${policyId}`;

          const formattedInterval = formatPolicy(interval, on || "12am");
          const retentionDisplay = formatRetention(retentionType);
          const scheduleDetail = `${formattedInterval} • ${
            retentionDisplay || "Infinite (Never Delete)"
          }`;

          return (
            <div
              key={policyId}
              className="p-6 bg-teal-500/5 border border-teal-500/20 rounded-md flex flex-col shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-(--border-light) pb-3 select-none">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider">
                    Assigned Policy
                  </span>
                  <h3 className="text-base font-extrabold text-(--text-primary) mt-1">
                    {policyName}
                  </h3>
                </div>
                <Link
                  href={`/dashboard/autosync_polices?policy_id=${policyId}`}
                  className="text-xs font-black text-teal-600 hover:text-teal-700 hover:underline hover:underline-offset-4 flex items-center gap-1 transition select-none"
                >
                  Open Policy →
                </Link>
              </div>

              <div className="mt-3.5 select-none">
                <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-wider block">
                  Schedule Details
                </span>
                <p className="text-xs font-bold text-(--text-secondary) mt-1 font-mono">
                  {scheduleDetail}
                </p>
              </div>

              <div className="mt-4 border-t border-(--border-light) pt-4">
                <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-wider block mb-2 select-none">
                  Assigned Services
                </span>
                <div className="flex flex-wrap gap-2">
                  {groupServices.map((s: any) => {
                    const icon = getServiceIcon(s.method);
                    const label = getServiceLabel(s.method);
                    return (
                      <div
                        key={s.method}
                        className="flex items-center gap-2.5 p-2.5 bg-(--bg-secondary) border border-(--border) rounded-sm select-none transition"
                      >
                        {icon}
                        <span className="text-xs font-extrabold text-(--text-primary)">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
