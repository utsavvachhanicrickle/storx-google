"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardHeader from "./DashboardHeader";

interface SideBarDashbordProps {
  children: React.ReactNode;
}

const menuSections = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/dashboard/users", label: "Users & Groups", icon: "👥" },
      { href: "/dashboard/local-vaults", label: "Local Vaults", icon: "📦" },
    ],
  },
  {
    title: "Data Management",
    items: [
      {
        href: "/dashboard/autosync",
        label: "Auto-Sync Policies",
        icon: "🔄",
      },
      {
        href: "/dashboard/recovery",
        label: "Recovery & Restore",
        icon: "⏮️",
      },
    ],
  },
  {
    title: "System & Security",
    items: [
      {
        href: "/dashboard/audit",
        label: "Audit Logs",
        icon: "📜",
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: "⚙️",
      },
    ],
  },
];

export default function SideBarDashbord({ children }: SideBarDashbordProps) {
  const pathname = usePathname();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const [currentTenant, setCurrentTenant] = useState("Acme Corp Ltd.");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300 shrink-0">
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-slate-800 bg-slate-950">
          <div className="w-11 h-11 rounded-none bg-(--primary)/10 border border-(--primary)/20 flex items-center justify-center text-2xl mr-3">
            🗄️
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Stor<span className="text-(--primary)">X</span>
            </h1>

            <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
              Secure Storage
            </p>
          </div>
        </div>

        {/* Tenant Switcher */}
        <div className="p-4 border-b border-slate-800 relative">
          <button
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="w-full flex items-center justify-between border border-slate-800 bg-slate-950 hover:bg-slate-800/80 px-3 py-3 transition-all duration-200 rounded-none"
          >
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-none bg-slate-800 border border-slate-700 flex items-center justify-center text-white mr-3 shrink-0">
                🏢
              </div>

              <div className="overflow-hidden text-left">
                <p className="text-sm font-semibold text-white truncate">
                  {currentTenant}
                </p>

                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                  Active Tenant
                </p>
              </div>
            </div>

            <span
              className={`text-xs transition-transform duration-200 ${
                showTenantDropdown ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {/* Dropdown */}
          {showTenantDropdown && (
            <div className="absolute left-4 right-4 mt-2 border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden z-50 rounded-none">
              {["Acme Corp Ltd.", "Acme Global Solutions", "Acme R&D Lab"].map(
                (tenant) => (
                  <button
                    key={tenant}
                    onClick={() => {
                      setCurrentTenant(tenant);
                      setShowTenantDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-none"
                  >
                    {tenant}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-7">
              {/* Section Title */}
              <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {section.title}
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-none ${
                        active
                          ? "bg-(--primary)/10 text-white border border-var(--primary)/20"
                          : "hover:bg-slate-800/80 hover:text-white border border-transparent"
                      }`}
                    >
                      {/* Active Indicator */}
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--primary)" />
                      )}

                      <span
                        className={`mr-3 text-lg transition-transform duration-200 ${
                          active ? "scale-110" : "group-hover:scale-105"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-none">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-none bg-(--primary)/10 border border-(--primary)/20 flex items-center justify-center text-white font-bold mr-3">
                A
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Admin User</p>

                <p className="text-xs text-slate-500">administrator@storx.io</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-(--bg)">
          {children}
        </main>
      </div>
      {/* Main Content */}
      {/* <main className="flex-1 overflow-y-auto bg-(--bg)">{children}</main> */}
    </div>
  );
}
