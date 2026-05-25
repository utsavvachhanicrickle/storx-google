"use client";

import React from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  Line,
  YAxis,
  ComposedChart,
} from "recharts";

const stats = [
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
    title: "Last Snapshot",
    value: "12",
    suffix: "mins ago",
    details: "1,402 items synced successfully",
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

const services = [
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
  {
    title: "Photos",
    icon: "🏝️",
    storage: "45 GB",
    users: "42 Accounts",
  },
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

const auditLogs = [
  {
    tag: "AUTO-SYNC",
    title: "Marketing Shared Drive",
    detail: "+12 modified files synced",
    time: "2m ago",
    color: "bg-emerald-500/10 text-emerald-500",
    icon: "🗂️",
  },
  {
    tag: "ADMIN RESTORE",
    title: "Q3_Financials_v2.xlsx",
    detail: "Restored to original location",
    time: "15m ago",
    color: "bg-violet-500/10 text-violet-500",
    icon: "⏪",
  },
  {
    tag: "AUTO-SYNC",
    title: "j.smith@acme.com",
    detail: "+4 emails archived",
    time: "1h ago",
    color: "bg-emerald-500/10 text-emerald-500",
    icon: "📨",
  },
  {
    tag: "SECURITY ALERT",
    title: "Anomaly Detection",
    detail: "Unusual deletion rate on Marketing Drive",
    time: "3h ago",
    color: "bg-rose-500/10 text-rose-500",
    icon: "⚠️",
  },
];

const chartData = [
  { day: "Mon", storage: 780, bandwidth: 120 },
  { day: "Tue", storage: 790, bandwidth: 145 },
  { day: "Wed", storage: 810, bandwidth: 180 },
  { day: "Thu", storage: 810, bandwidth: 95 },
  { day: "Fri", storage: 820, bandwidth: 115 },
  { day: "Sat", storage: 830, bandwidth: 80 },
  { day: "Sun", storage: 840, bandwidth: 100 },
];

export default function DashboardPage() {
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

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className={`bg-(--bg-primary) rounded-2xl border-right-(--border) border-r-[3px] ${item.border} p-4 shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-(--text-muted)">
                  {item.title}
                </div>

                <div className="flex items-end gap-2 mt-4">
                  <div className="text-4xl font-black leading-none text-(--text-primary)">
                    {item.value}
                  </div>

                  {item.suffix && (
                    <span className="text-sm text-(--text-secondary) mb-1">
                      {item.suffix}
                    </span>
                  )}
                </div>
              </div>

              {item.badge && (
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-500">
                  {item.badge}
                </span>
              )}
            </div>

            {item.progress && (
              <div className="mt-5">
                <div className="w-full h-2 rounded-full bg-(--bg-secondary) overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${item.progress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {item.details && (
              <div className="text-xs text-(--text-muted) mt-4">
                {item.details}
              </div>
            )}

            {item.title === "Plan Status" && (
              <button className="mt-4 text-xs font-bold text-indigo-500 hover:underline">
                Upgrade
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-(--text-primary) mb-4">
          Protected Services Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {services.map((service, i) => (
            <div
              key={i}
              className=" group bg-(--bg-primary) rounded-2xl border border-(--border) overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
            >
              {/* Top Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  {/* Icon Box */}
                  <div className="w-12 h-12 rounded-xl border border-(--border) bg-(--bg-secondary) flex items-center justify-center text-2xl transition-all duration-300 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 ">
                    {service.icon}
                  </div>

                  {/* Status Badge */}
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    ● PROTECTED
                  </span>
                </div>

                {/* Content */}
                <div className="mt-5">
                  <h3 className="text-[22px] font-semibold leading-none text-(--text-primary) transition-colors duration-300 group-hover:text-emerald-500">
                    {service.title}
                  </h3>

                  <p className="text-sm text-(--text-secondary) mt-3">
                    {service.storage} • {service.users}
                  </p>
                </div>
              </div>

              {/* Bottom Button Area */}
              <div className="border-t border-(--border) p-3 transition-all duration-300 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/3">
                <button className="w-full py-2.5 rounded-sm border border-(--border) text-sm font-bold transition-all duration-300 text-(--text-primary) hover:text-emerald-500 hover:border-emerald-500 group-hover:border-emerald-500/30">
                  Browse & Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Graph */}
        <div className="bg-(--bg-primary) rounded-2xl border border-(--border) p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm uppercase tracking-wide font-black text-(--text-primary)">
              Storage & Bandwidth Trends
            </h3>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="day" />

                <YAxis yAxisId="left" />

                <YAxis yAxisId="right" orientation="right" />

                <Tooltip />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="storage"
                  fill="#14b8a6"
                  stroke="#14b8a6"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bandwidth"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logs */}
        <div className="xl:col-span-2 bg-(--bg-primary) rounded-2xl border border-(--border) overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
            <h3 className="text-sm uppercase tracking-wide font-black text-(--text-primary)">
              Auto-Sync & Audit Log
            </h3>

            <button className="text-sm font-bold text-emerald-500 hover:underline">
              View Full Audit →
            </button>
          </div>

          <div>
            {auditLogs.map((log, i) => (
              <div
                key={i}
                className="grid grid-cols-5 items-center gap-4 px-5 py-4 border-b border-(--border) hover:bg-(--bg-secondary) transition-colors"
              >
                <div className="text-xl">{log.icon}</div>

                <span
                  className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full w-fit ${log.color}`}
                >
                  {log.tag}
                </span>

                <div
                  className={`font-semibold text-[15px] ${
                    log.title.includes("Error")
                      ? "text-red-500"
                      : "text-(--text-primary)"
                  }`}
                >
                  {log.title}
                </div>

                <div className="text-sm text-(--text-secondary)">
                  {log.detail}
                </div>

                <div className="text-xs text-right text-(--text-muted)">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
