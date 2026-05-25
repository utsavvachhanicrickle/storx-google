"use client";

import React from "react";

const users = [
  {
    name: "Executive Team",
    email: "execs@acme.com",
    domain: "@ACME.COM",
    policy: "Real-Time (CDP)",
    status: "Protected",
    storage: "450 GB",
  },
  {
    name: "Sarah Jenkins",
    email: "s.jenkins@acme.com",
    domain: "@ACME.COM",
    policy: "Standard (Hourly)",
    status: "Protected",
    storage: "14.2 GB",
  },
];

export default function UsersGroupsPage() {
  return (
    <div className="p-6 bg-(--bg)">
      {/* HEADER TOP BAR (CLEAN SAAS STYLE) */}
      <div className="flex items-start justify-between mb-4">
        {/* LEFT TITLE */}
        <div>
          <h1 className="text-xl font-black text-(--text-primary)">
            Corporate Users & Groups
          </h1>
          <p className="text-xs text-(--text-muted) mt-1">
            Manage backup status across your entire Google Workspace tenant.
          </p>
        </div>

        {/* RIGHT ACTIONS (NO BOX, INLINE STYLE) */}
        <div className="flex items-center gap-3">
          {/* AUTO PROTECT TOGGLE (clean + subtle box) */}
          <div className="flex items-center gap-2 text-xs font-semibold text-(--text-secondary) px-2 py-1">
            <span className="tracking-wide">AUTO-PROTECT</span>

            <input
              type="checkbox"
              className="accent-(--primary) w-3.5 h-3.5"
              defaultChecked
            />
          </div>

          {/* SYNC BUTTON (minimal rectangle style) */}
          <button className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5  text-(--primary) hover:bg-(--bg-secondary) transition">
            🔄 Sync Directory
          </button>

          {/* CONNECT BUTTON (BLACK CTA) */}
          <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-black text-white hover:bg-neutral-900 transition shadow-sm">
            ➕ Connect New Account
          </button>
        </div>
      </div>

      {/* SINGLE WRAPPER (SEARCH + TABLE TOGETHER) */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-sm overflow-hidden">
        {/* SEARCH BAR (INSIDE SAME CONTAINER) */}
        <div className="p-3 border-b border-(--border) flex flex-col lg:flex-row gap-2">
          <input
            placeholder="Search users, emails, groups..."
            className="flex-1 px-3 py-2 text-sm border border-(--border) rounded-sm bg-(--bg-secondary)"
          />

          <select className="px-3 py-2 text-sm border border-(--border) rounded-sm bg-(--bg-secondary)">
            <option>All Domains</option>
          </select>

          <select className="px-3 py-2 text-sm border border-(--border) rounded-sm bg-(--bg-secondary)">
            <option>All Status</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-(--bg-secondary)">
              <tr className="text-[11px] text-(--text-muted)">
                <th className="text-left p-3">Entity</th>
                <th className="text-left p-3">Domain</th>
                <th className="text-left p-3">Policy</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Storage</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--border)">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-(--bg-secondary) transition">
                  {/* ENTITY */}
                  <td className="p-3">
                    <div className="font-bold text-(--text-primary)">
                      {u.name}
                    </div>
                    <div className="text-xs text-(--text-muted)">{u.email}</div>
                  </td>

                  {/* DOMAIN */}
                  <td className="p-3 text-xs text-(--text-secondary) font-bold">
                    {u.domain}
                  </td>

                  {/* POLICY */}
                  <td className="p-3 text-sm">{u.policy}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      ● {u.status}
                    </span>
                  </td>

                  {/* STORAGE */}
                  <td className="p-3 text-sm text-(--text-secondary)">
                    {u.storage}
                  </td>

                  {/* ACTION */}
                  <td className="p-3 text-right">
                    <button className="text-xs font-bold text-(--primary) hover:underline">
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
