"use client";

import { useState } from "react";

const policies = [
  {
    name: "Sarah Jenkins",
    type: "Account",
    email: "s.jenkins@acme.com",
    interval: "Every 1 Hour",
    nextBackup: "In 42 mins",
    retention: "Infinite",
    services: ["📨", "🗂️", "👥"],
    status: "STANDARD",
  },
  {
    name: "Executive Team",
    type: "Group",
    email: "execs@acme.com",
    interval: "Real-Time (CDP)",
    nextBackup: "Continuous",
    retention: "Infinite",
    services: ["📨", "🗂️", "👥"],
    status: "CRITICAL",
  },
  {
    name: "Finance Department",
    type: "Department",
    email: "finance@acme.com",
    interval: "Every 6 Hours",
    nextBackup: "In 2h 15m",
    retention: "1 Year",
    services: ["📨", "🗂️"],
    status: "PROTECTED",
  },
];

export default function AutoSyncPoliciesPage() {
  const [syncPolicy, setSyncPolicy] = useState("hourly");
  const [retention, setRetention] = useState("forever");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Auto-sync policies updated successfully.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-(--bg) px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary)">
          Auto-Sync Policies
        </h1>

        <p className="text-sm font-medium text-(--text-secondary) max-w-2xl">
          Configure automated backup intervals and retention rules for your
          corporate tenant.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {policies.map((policy, i) => (
          <div className="bg-(--bg-primary) border border-(--border) rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] group">
            {/* TOP */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-(--text-primary) truncate group-hover:text-(--primary) transition-colors">
                  {policy.name}
                </h3>

                <p className="text-xs font-medium text-(--text-muted) mt-1 truncate">
                  {policy.type}: {policy.email}
                </p>
              </div>

              <span className="shrink-0 px-3 py-1 rounded-md text-[10px] font-bold tracking-wide border-sm bg-(--emerald-500)/10 text-(--emerald-500)">
                {policy.status}
              </span>
            </div>

            {/* DETAILS */}
            <div className="mt-5 space-y-3">
              {[
                ["Sync Interval", policy.interval],
                ["Next Backup", policy.nextBackup],
                ["Retention", policy.retention],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-(--text-secondary) font-medium">
                    {label}
                  </span>
                  <span className="font-semibold text-(--text-primary)">
                    {value}
                  </span>
                </div>
              ))}

              {/* SERVICES */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--text-secondary) font-medium">
                  Services
                </span>

                <div className="flex gap-2 text-lg">
                  {policy.services.map((s, idx) => (
                    <span key={idx}>{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER BUTTON */}
            <div className="mt-6 pt-4 border-t border-sm border-(--border)">
              <button className="w-full py-2.5 rounded-lg border border-(--border) text-sm font-semibold text-(--text-secondary) transition-all duration-300 hover:border-(--primary) hover:text-(--primary) hover:bg-(--primary)/5">
                Edit Policy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
