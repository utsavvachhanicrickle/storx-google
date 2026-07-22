"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";

import {
  SidebarDashboardIcon,
  SidebarUsersIcon,
  SidebarSyncIcon,
  SidebarRestoreIcon,
  SidebarServicesIcon,
  SidebarAuditIcon,
  SidebarSettingsIcon,
} from "@/components/ui/ServiceIcon";

interface SideBarDashbordProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed?: boolean;
}

const menuSections = [
  {
    title: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <SidebarDashboardIcon />,
      },
      {
        href: "/dashboard/users_groups",
        label: "Users & Groups",
        icon: <SidebarUsersIcon />,
      },
      // {
      //   href: "/dashboard/local-vaults",
      //   label: "Local Vaults",
      //   icon: <LocalActivityIcon />,
      // },
    ],
  },

  {
    title: "Data Management",

    items: [
      {
        href: "/dashboard/autosync_polices",
        label: "Auto-Sync Policies",
        icon: <SidebarSyncIcon />,
      },
      {
        href: "/dashboard/recovery",
        label: "Recovery & Restore",
        icon: <SidebarRestoreIcon />,
      },
      {
        href: "/dashboard/service_update",
        label: "Services Update",
        icon: <SidebarServicesIcon />,
      },
    ],
  },

  {
    title: "System & Security",

    items: [
      {
        href: "/dashboard/audit_logs",
        label: "Audit Logs",
        icon: <SidebarAuditIcon />,
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: <SidebarSettingsIcon />,
      },
    ],
  },
];

export default function SideBarDashbord({
  mobileOpen,
  setMobileOpen,
  collapsed = false,
}: SideBarDashbordProps) {
  const pathname = usePathname();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const [currentTenant, setCurrentTenant] = useState("Acme Corp Ltd.");

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen
          bg-(--sidebar-bg)
          border-r border-(--sidebar-border)
          shadow-(--sidebar-shadow)
          flex flex-col
          transform transition-all duration-300

          ${collapsed ? "w-68 md:w-20" : "w-68"}
          ${mobileOpen ? "translate-x-0 " : "-translate-x-full "}

          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div
          className={`flex items-center border-b border-(--sidebar-border) shrink-0 ${collapsed ? "h-16 justify-center px-0" : "h-20 justify-between px-6"}`}
        >
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <Logo
              onlyIcon={collapsed}
              className={`text-white! object-contain h-12 w-full`}
            />
          </Link>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-xl text-[(--sidebar-text)]"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-5">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-7">
              {/* SECTION TITLE */}
              <div
                className={`px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-(--sidebar-text-muted) ${collapsed ? "md:hidden block" : "block"}`}
              >
                {section.title}
              </div>

              {/* MENU ITEMS */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        relative flex items-center py-3 text-sm font-medium transition-all duration-200

                        ${collapsed ? "px-4 md:px-0 md:justify-center" : "px-4"}

                        ${
                          active
                            ? "bg-(--sidebar-active) text-(--sidebar-primary) border-r-4 border-(--sidebar-primary)"
                            : collapsed
                              ? "text-(--sidebar-text-secondary) hover:text-(--sidebar-primary) border-r-4 border-transparent hover:border-(--sidebar-primary) md:hover:pl-0"
                              : "text-(--sidebar-text-secondary) hover:pl-5 hover:text-(--sidebar-primary) hover:border-r-4 hover:border-(--sidebar-primary)"
                        }
                      `}
                    >
                      {/* ICON */}
                      <span
                        className={`flex justify-center items-center ${collapsed ? "mr-3 text-lg md:mr-0 md:text-xl" : "mr-3 text-lg"}`}
                      >
                        {item.icon}
                      </span>

                      {/* LABEL */}
                      <span
                        className={collapsed ? "md:hidden inline" : "inline"}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
