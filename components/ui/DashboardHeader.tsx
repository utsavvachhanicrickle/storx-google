"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const mockResults = [
  {
    title: "alice_presentation.pdf",
    type: "Drive File",
    user: "alice@acme.com",
  },
  {
    title: "Project Q4 budget.xlsx",
    type: "Drive File",
    user: "finance@acme.com",
  },
  {
    title: "Weekly sync update logs",
    type: "System Audit",
    user: "System",
  },
  {
    title: "bob_workspace_backup",
    type: "User Directory",
    user: "bob@acme.com",
  },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [isSyncActive] = useState(true);

  const currentPage = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 1) return "Dashboard";

    return segments[segments.length - 1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [pathname]);

  const filteredResults = mockResults.filter(
    (item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.user.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <header className="h-20 bg-(--bg-primary) border-b border-(--border) flex items-center justify-between px-8 shrink-0">
      {/* Page Title */}
      <div className="font-bold text-(--text-primary) text-lg capitalize">
        {currentPage}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-2xl mx-8 relative">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-(--text-muted)">
            🔍
          </div>

          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search backups, logs, users, files..."
            className="w-full h-12 pl-11 pr-20 border border-(--border) bg-(--bg-secondary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all rounded-none"
          />

          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-(--text-muted) hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchText && (
          <div className="absolute top-14 left-0 right-0 bg-(--bg-primary) border border-(--border) shadow-2xl z-50 overflow-hidden rounded-none">
            <div className="p-3 border-b border-(--border) text-xs font-bold text-(--text-muted)">
              Search Results
            </div>

            <div className="max-h-72 overflow-y-auto">
              {filteredResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    router.push("/dashboard/recovery");
                    setSearchText("");
                  }}
                  className="w-full text-left p-4 hover:bg-(--bg-secondary) border-b border-(--border) transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-(--text-primary)">
                        {res.title}
                      </div>

                      <div className="text-xs text-(--text-muted) mt-1">
                        {res.user}
                      </div>
                    </div>

                    <span className="px-2 py-1 text-[10px] font-bold bg-(--primary)/10 text-(--primary) border border-(--primary)/20">
                      {res.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        {/* Sync Status */}
        <div className="flex items-center border border-(--border) bg-(--bg-secondary) px-4 py-2 rounded-none">
          <span
            className={`w-2 h-2 mr-2 ${
              isSyncActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />

          <span className="text-xs font-bold text-(--text-secondary)">
            {isSyncActive ? "Sync Active" : "Sync Paused"}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationPopup(!showNotificationPopup)}
            className="relative text-xl text-(--text-secondary) hover:text-white transition-colors"
          >
            🔔
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-4 h-4 flex items-center justify-center font-bold">
              1
            </span>
          </button>

          {showNotificationPopup && (
            <div className="absolute right-0 mt-4 w-80 bg-(--bg-primary) border border-(--border) shadow-2xl z-50 rounded-none">
              <div className="p-4 border-b border-(--border) text-sm font-bold text-white">
                System Notifications
              </div>

              <div className="p-4">
                <div className="text-xs text-amber-400 font-bold">
                  ⚠ Anomaly Detected
                </div>

                <p className="text-xs text-(--text-secondary) mt-2 leading-relaxed">
                  Mass file update detected in shared drive. Ransomware monitor
                  scanning.
                </p>

                <button
                  onClick={() => {
                    router.push("/dashboard/security");
                    setShowNotificationPopup(false);
                  }}
                  className="mt-4 text-xs font-bold text-(--primary) hover:underline"
                >
                  Open Security Shield
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="h-11 w-11 bg-(--primary)/10 border border-(--primary)/20 text-(--primary) font-bold flex items-center justify-center rounded-none"
          >
            AD
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-4 w-56 bg-(--bg-primary) border border-(--border) shadow-2xl overflow-hidden z-50 rounded-none">
              <div className="p-4 border-b border-(--border)">
                <div className="text-sm font-bold text-white">
                  Admin Console
                </div>

                <div className="text-xs text-(--text-muted) mt-1">
                  admin@acme.com
                </div>
              </div>

              <button
                onClick={() => {
                  router.push("/dashboard/settings");
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-(--bg-secondary) transition-colors"
              >
                Configuration
              </button>

              <button className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-(--bg-secondary) border-t border-(--border) transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
