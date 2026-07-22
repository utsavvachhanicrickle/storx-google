"use client";

import { useEffect, useContext, useMemo, useRef, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DarkModeContext } from "@/context/darkModeContext";

import { Avatar } from "@mui/material";
import Button from "./Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutSlice } from "@/store/slices/authSlice";
import { DarkMode, LightMode } from "@mui/icons-material";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import WalletIcon from "@mui/icons-material/Wallet";
import LogoutIcon from "@mui/icons-material/Logout";

import { MenuIcon } from "@/components/ui/ServiceIcon";

const getInitials = (name?: string): string => {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  activeRestoreJobs?: number;
}

export default function DashboardHeader({
  onToggleSidebar,
  activeRestoreJobs = 0,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const [searchText, setSearchText] = useState("");
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    console.log(user);
  }, []);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentPage = useMemo(() => {
    const pageMap: Record<string, string> = {
      "/dashboard/users_groups": "Users & Groups",
      "/dashboard/autosync_polices": "Auto-Sync Policies",
      "/dashboard/recovery": "Recovery & Restore",
      "/dashboard/audit_logs": "Audit Logs",
      "/dashboard/settings": "Settings",
      "/dashboard/service_update": "Services Update",
    };

    if (pageMap[pathname]) {
      return pageMap[pathname];
    }

    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 1) return "Dashboard";

    return segments[segments.length - 1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [pathname]);


  const handleLogout = () => {
    dispatch(logoutSlice());

    router.replace("/connect");
  };

  return (
    <header className="h-20 border-b border-(--border) bg-(--bg-primary) flex items-center justify-between px-4 md:px-8 shrink-0">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* SIDEBAR TOGGLE MENU */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-11 h-11 cursor-pointer select-none hover:bg-(--bg-active) transition rounded-sm"
          title="Toggle Sidebar"
        >
          <MenuIcon className="w-5 h-5 text-(--text-primary)" />
        </button>

        {/* PAGE TITLE */}
        <div className="hidden sm:block font-bold text-(--text-primary) text-lg tracking-tight select-none">
          {currentPage}
        </div>
      </div>

      {/* SEARCH */}
      {/* <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-sm">
            🔍
          </div>

          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search backups, logs, users..."
            className="w-full h-12 pl-11 pr-20 border border-(--border) bg-(--bg-secondary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />

          {searchText ? (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-(--text-muted) hover:text-(--text-primary) transition"
            >
              Clear
            </button>
          ) : (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none">
              <kbd className="hidden sm:inline-flex items-center gap-0.5 h-5.5 rounded border border-(--border) bg-(--bg-primary) px-1.5 font-mono text-[9px] font-bold text-(--text-muted) shadow-xs">
                <span>⌘</span>K
              </kbd>
            </div>
          )}
        </div>

        {searchText && (
          <div className="absolute top-14 left-0 right-0 bg-(--bg-primary) border border-(--border) shadow-2xl z-50">
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
      </div> */}

      {/* RIGHT */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* ACTIVE RESTORE BADGE — shown when restore jobs are running */}
        {activeRestoreJobs > 0 && (
          <button
            onClick={() => router.push("/dashboard/recovery")}
            className="hidden md:flex items-center bg-orange-500/10 border border-orange-500/20 rounded-md px-3.5 py-1.5 shrink-0 select-none hover:bg-orange-500/15 transition-colors cursor-pointer"
            title={`${activeRestoreJobs} active restore job${activeRestoreJobs > 1 ? "s" : ""} — click to view`}
          >
            <span className="w-2 h-2 mr-2 rounded-md bg-orange-400 animate-pulse" />
            <span className="text-xs font-bold text-orange-500 tracking-wide">
              {activeRestoreJobs} Restoring
            </span>
          </button>
        )}

        {/* NOTIFICATION */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => router.push("/dashboard/notifications")}
            className="relative text-xl hover:scale-105 active:scale-95 transition cursor-pointer select-none flex items-center justify-center"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-(--danger) text-white text-[9px] font-black rounded-md border border-(--bg-primary) flex items-center justify-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* PROFILE */}
        <div className="relative" ref={profileRef}>
          <button
            suppressHydrationWarning
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="h-11 w-11 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition"
          >
            {isMounted &&
              (user ? (
                <Avatar
                  src={user?.picture}
                  alt={user?.name}
                  suppressHydrationWarning
                  sx={{
                    bgcolor: "var(--accent-soft)",
                    color: "var(--primary-dark)",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {!user?.picture &&
                    getInitials(user?.name) &&
                    getInitials(user?.email)}
                </Avatar>
              ) : (
                <Avatar
                  sx={{
                    bgcolor: "var(--accent-soft)",
                    color: "var(--primary-dark)",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  <span className="text-sm font-bold">AD</span>
                </Avatar>
              ))}
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-4 w-56 bg-(--bg-primary) border border-(--border) shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-(--border)">
                <div className="text-sm font-bold text-(--text-primary)">
                  {user?.name}
                </div>

                <div className="text-xs text-(--text-muted) mt-1">
                  {user?.email}
                </div>
              </div>

              <Button
                variant="other"
                onClick={() => {
                  router.push("/dashboard/resources");

                  setShowProfileDropdown(false);
                }}
                className="w-full justify-start! hover:px-4 "
              >
                <FolderCopyIcon />
                Resources
              </Button>

              {/* <Button
                variant="other"
                onClick={() => {
                  router.push("/dashboard/billing");

                  setShowProfileDropdown(false);
                }}
                className="w-full justify-start! hover:px-4 "
              >
                <WalletIcon />
                Billing
              </Button> */}

              <Button
                variant="other"
                onClick={() => setDarkMode(!darkMode)}
                className="w-full justify-start! hover:px-4"
              >
                {darkMode ? (
                  <>
                    <DarkMode />
                    DarkMode
                  </>
                ) : (
                  <>
                    <LightMode />
                    LightMode
                  </>
                )}
              </Button>

              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-full justify-start! border-none! hover:px-4"
              >
                <LogoutIcon />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
