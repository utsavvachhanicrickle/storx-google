"use client";

import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";

interface SidebarNavigationProps {
  title: string;
  subtitle: string;
  tabs: string[];
  activeTab: string;
  onChangeTab: (tab: string) => void;
  fontMonoSubtitle?: boolean;
  icons?: Record<string, React.ReactNode>;
}

export default function SidebarNavigation({
  title,
  subtitle,
  tabs,
  activeTab,
  onChangeTab,
  fontMonoSubtitle = false,
  icons,
}: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const formattedSubtitle = (subtitle || "").toUpperCase();

  return (
    <div
      className={`bg-(--bg-secondary) border-b md:border-b-0 md:border-r border-(--border) p-3 md:p-4 flex flex-row md:flex-col gap-2 md:gap-4 shrink-0 overflow-x-auto md:overflow-x-visible items-center md:items-stretch scrollbar-none transition-all duration-300 ${
        isCollapsed ? "w-full md:w-[68px]" : "w-full md:w-[210px]"
      }`}
    >
      {/* Sidebar Header: Hamburger Toggle + Info */}
      <div className="flex items-center justify-between w-full md:flex">
        {!isCollapsed ? (
          <div className="px-1 min-w-0 hidden md:block">
            <div className="text-[11px] font-black text-(--text-muted) tracking-wider uppercase leading-snug">
              {title}:
            </div>
            <div
              className={`text-[11px] font-black text-(--text-muted) tracking-wider uppercase truncate mt-0.5 ${
                fontMonoSubtitle ? "font-mono" : "font-sans"
              }`}
            >
              {formattedSubtitle}
            </div>
          </div>
        ) : null}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--border-light) rounded transition-all cursor-pointer flex items-center justify-center shrink-0 self-center"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <MenuIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Sidebar navigation list */}
      <div className="flex flex-row md:flex-col gap-1.5 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const icon = icons?.[tab];

          return (
            <button
              key={tab}
              onClick={() => onChangeTab(tab)}
              title={isCollapsed ? tab : undefined}
              className={`whitespace-nowrap rounded-sm text-[12px] md:text-[13px] font-medium tracking-wider transition-all cursor-pointer flex items-center ${
                isCollapsed
                  ? "p-2 justify-center"
                  : "px-4 py-2 gap-2.5 justify-start text-start"
              } ${
                isActive
                  ? "bg-(--accent-soft) text-(--primary)"
                  : "text-(--text-secondary) hover:bg-(--border-light) hover:text-(--text-primary)"
              }`}
            >
              {icon && (
                <span
                  className={`shrink-0 flex items-center justify-center ${isActive ? "text-(--primary)" : "text-(--text-muted)"}`}
                >
                  {icon}
                </span>
              )}
              {!isCollapsed && <span className="truncate">{tab}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
