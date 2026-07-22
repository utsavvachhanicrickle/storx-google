"use client";

import React, { useState, useEffect } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SidebarNavigation from "../SidebarNavigation";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface CalendarItem {
  id: string;
  title: string;
  timeRange: string;
  color: string;
}

const CALENDAR_MOCK_ITEMS: CalendarItem[] = [
  {
    id: "e1",
    title: "Q4 Planning Onsite",
    timeRange: "Oct 25, 10:00 AM - 11:30 AM",
    color: "#0ecfc4",
  },
  {
    id: "e2",
    title: "Weekly Sync w/ Agency",
    timeRange: "Oct 26, 2:00 PM - 3:00 PM",
    color: "#35a2ff",
  },
  {
    id: "e3",
    title: "Client Kickoff Call",
    timeRange: "Oct 27, 9:00 AM - 10:00 AM",
    color: "#c084fc",
  },
];

import type { VaultBrowserObject } from "@/types/vault";

function RestoreActionIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function DownloadActionIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

interface CalendarContentProps {
  userEmail: string;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
  objects: VaultBrowserObject[];
  loading: boolean;
  prefix: string;
  onNavigatePrefix: (prefix: string) => void;
  onOpenFolder: (prefix: string) => void;
  onRestoreItem?: (key: string) => void;
  onDownloadItem?: (key: string, name: string) => void;
}

export default function CalendarContent({
  userEmail,
  selectedIds,
  onToggleItem,
  objects = [],
  loading = false,
  prefix,
  onNavigatePrefix,
  onOpenFolder,
  onRestoreItem,
  onDownloadItem,
}: CalendarContentProps) {
  const [activeSubTab, setActiveSubTab] = useState("My Calendars");
  const subTabs = ["My Calendars", "Other Calendars"];

  const calendarSubTabIcons = {
    "My Calendars": <CalendarTodayIcon sx={{ fontSize: 16 }} />,
    "Other Calendars": <DateRangeIcon sx={{ fontSize: 16 }} />,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [filterOpen, setFilterOpen] = useState(false);

  const handleBack = () => {
    const parts = (prefix || "").split("/").filter(Boolean);
    if (parts.length <= 1) return; // Keep user's root folder as boundary
    parts.pop();
    const parentPrefix = parts.join("/") + "/";
    onNavigatePrefix(parentPrefix);
  };

  const hasParent = (prefix || "").split("/").filter(Boolean).length > 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeSubTab, sortBy]);

  const getCalendarColor = (name: string) => {
    const colors = ["#0ecfc4", "#35a2ff", "#c084fc", "#eab308", "#ec4899"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const filteredObjects = objects.filter((item) => {
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedObjects = [...filteredObjects].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA; // Newest first
    }
  });

  const totalItems = filteredObjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pagedObjects = sortedObjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 bg-(--bg-primary)">
      {/* Reusable Sidebar Navigation */}
      {/* <SidebarNavigation
        title="SCHEDULE SYNC"
        subtitle={userEmail}
        tabs={subTabs}
        activeTab={activeSubTab}
        onChangeTab={setActiveSubTab}
        fontMonoSubtitle={true}
        icons={calendarSubTabIcons}
      /> */}

      {/* Main Calendar Content */}
      <div className="flex-1 p-4 overflow-hidden bg-(--bg-primary) flex flex-col gap-3 min-h-0">
        {loading ? (
          <div className="flex flex-col h-48 items-center justify-center text-xs font-bold text-(--text-muted) gap-3">
            <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
            <span>Loading calendar events from vault...</span>
          </div>
        ) : activeSubTab === "My Calendars" ? (
          <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
            {/* Search Box */}
            <div className="flex items-center gap-2 w-full bg-(--bg-primary) border border-(--border) rounded-sm px-3 py-2 shadow-xs shrink-0 relative z-30">
              <SearchIcon sx={{ color: "var(--text-muted)", fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-(--text-primary) placeholder:(--text-muted) focus:outline-none bg-transparent"
              />
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="p-1 hover:bg-(--bg-secondary) rounded cursor-pointer relative"
              >
                <FilterListIcon sx={{ color: filterOpen ? "var(--primary)" : "var(--text-muted)", fontSize: 20 }} />
              </button>

              {/* Dropdown Menu */}
              {filterOpen && (
                <div className="absolute right-3 top-11 bg-(--bg-primary) border border-(--border) rounded-md shadow-lg p-2 w-48 flex flex-col gap-1 text-xs text-(--text-secondary) z-50">
                  <span className="font-bold text-(--text-muted) px-2 py-1 select-none">SORT BY</span>
                  <button
                    onClick={() => {
                      setSortBy("date");
                      setFilterOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm hover:bg-(--bg-secondary) text-left cursor-pointer ${sortBy === "date" ? "bg-(--primary)/10 text-(--primary) font-bold" : ""}`}
                  >
                    <span>Date (Newest first)</span>
                    {sortBy === "date" && <span className="w-1.5 h-1.5 rounded-full bg-(--primary)" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setFilterOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm hover:bg-(--bg-secondary) text-left cursor-pointer ${sortBy === "name" ? "bg-(--primary)/10 text-(--primary) font-bold" : ""}`}
                  >
                    <span>Name (A-Z)</span>
                    {sortBy === "name" && <span className="w-1.5 h-1.5 rounded-full bg-(--primary)" />}
                  </button>
                </div>
              )}
            </div>

            {hasParent && (
              <div className="mb-2 text-left">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs font-black text-teal-600 hover:text-teal-700 transition cursor-pointer border-none bg-transparent select-none"
                >
                  <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to parent folder
                </button>
              </div>
            )}

            {filteredObjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1">
                <span>No calendar events found in this vault folder</span>
                <span className="font-normal text-[11px]">
                  Try running a sync job first.
                </span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 justify-between gap-3">
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                  {pagedObjects.map((item) => {
                    const isChecked = selectedIds.has(item.key);
                    const eventColor = getCalendarColor(item.name);
                    const cleanName = item.name.replace(/\.(json|ics)$/i, "").replace(/[_-]/g, " ");
                    const extMatch = item.name.match(/(\.(json|ics))$/i);
                    const ext = extMatch ? extMatch[1] : "";
                    const displayName = item.type === "folder"
                      ? (item.name.length > 20 ? item.name.substring(0, 6) + "..." + item.name.substring(item.name.length - 4) : item.name)
                      : (cleanName.length > 20 ? cleanName.substring(0, 6) + "..." + cleanName.substring(cleanName.length - 4) + ext : cleanName + ext);

                    return (
                      <div
                        key={item.key}
                        onClick={() => {
                          if (item.type === "folder") {
                            onOpenFolder(item.key);
                          } else {
                            onToggleItem(item.key);
                          }
                        }}
                        className={`flex items-center min-h-15 gap-4.5 p-4.5 pl-6 border rounded-md transition-all duration-200 cursor-pointer select-none bg-(--bg-primary) relative overflow-hidden group hover:shadow-md ${
                          isChecked
                            ? "border-(--primary) bg-(--primary)/5 shadow-xs"
                            : "border-(--border) hover:border-(--border)"
                        }`}
                      >
                        {/* Thick vertical accent bar on the left edge */}
                        <div
                          style={{ backgroundColor: eventColor }}
                          className="absolute left-0 top-0 bottom-0 w-[5px] rounded-l-sm"
                        />

                        {item.type !== "folder" && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleItem(item.key)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-(--primary) w-4 h-4 border-(--border) rounded cursor-pointer shrink-0"
                          />
                        )}

                        {/* Calendar Day Badge Block */}
                        <div className="w-10 h-10 rounded-md flex flex-col items-center justify-center text-white shrink-0 font-black shadow-2xs relative overflow-hidden" style={{ backgroundColor: eventColor }}>
                          {item.type === "folder" ? (
                            <span className="text-lg">📁</span>
                          ) : (
                            <>
                              <span className="text-[9px] uppercase leading-none opacity-90 tracking-wider">
                                {item.lastModified ? new Date(item.lastModified).toLocaleDateString("en-US", { month: "short" }) : "Oct"}
                              </span>
                              <span className="text-base leading-none mt-0.5 font-extrabold">
                                {item.lastModified ? new Date(item.lastModified).getDate() : "25"}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1 text-left space-y-1">
                            <p className="text-sm font-black text-(--text-primary) truncate">
                              {displayName}
                            </p>
                            {item.type !== "folder" ? (
                              <div className="flex items-center gap-2 text-xs text-(--text-muted) font-semibold flex-wrap">
                                <span className="bg-(--bg-secondary) border border-(--border) px-1.5 py-0.5 rounded text-[10px] font-mono font-bold" style={{ color: eventColor }}>
                                  📅 {item.lastModified ? new Date(item.lastModified).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Oct 25, 2026"}
                                </span>
                                <span className="text-(--text-muted) font-bold font-mono">10:00 AM - 11:30 AM</span>
                              </div>
                            ) : (
                              <p className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider">Folder</p>
                            )}
                          </div>
                          {item.type !== "folder" && (
                            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-(--bg-primary)/90 backdrop-blur-xs pl-2 py-1 rounded-sm z-20" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => onRestoreItem?.(item.key)}
                                title="Restore"
                                className="p-2 text-(--primary) bg-(--primary)/10 hover:bg-(--primary)/20 transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs border border-(--primary)/20"
                              >
                                <RestoreActionIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDownloadItem?.(item.key, item.name)}
                                title="Download"
                                className="p-2 text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-active) transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs border border-(--border)"
                              >
                                <DownloadActionIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalItems > 0 && (
                  <div className="flex items-center justify-between border-t border-(--border) pt-4 mt-2 shrink-0 select-none">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-(--text-muted) font-bold">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} events
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-(--text-muted) font-bold ml-4">
                        <span>Show:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 text-xs border border-(--border) rounded-sm bg-(--bg-primary) text-(--text-primary) cursor-pointer focus:outline-none"
                        >
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                          <option value={40}>40</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="px-3 py-1.5 text-xs font-black border border-(--border) rounded-sm hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition bg-(--bg-primary) cursor-pointer shadow-2xs text-(--text-secondary)"
                        >
                          &lt;
                        </button>
                        {getPageNumbers().map((p) => {
                          const isActive = p === currentPage;
                          return (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`px-3 py-1.5 text-xs font-black border rounded-sm transition cursor-pointer select-none ${
                                isActive
                                  ? "bg-(--primary)/10 text-(--primary) border-(--primary)/30 font-black"
                                  : "bg-(--bg-primary) text-(--text-secondary) border-(--border) hover:bg-(--bg-secondary)"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-3 py-1.5 text-xs font-black border border-(--border) rounded-sm hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition bg-(--bg-primary) cursor-pointer shadow-2xs text-(--text-secondary)"
                        >
                          &gt;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1">
            <span>No events in {activeSubTab}</span>
            <span className="font-normal text-[11px]">
              Everything is up-to-date!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
