"use client";

import React, { useState, useEffect } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TableChartIcon from "@mui/icons-material/TableChart";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import SidebarNavigation from "../SidebarNavigation";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AppShortcutIcon from "@mui/icons-material/AppShortcut";

import type { VaultBrowserObject } from "@/types/vault";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function RestoreActionIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function DownloadActionIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

interface DriveContentProps {
  userName: string;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  objects: VaultBrowserObject[];
  loading: boolean;
  prefix: string;
  onNavigatePrefix: (prefix: string) => void;
  onOpenFolder: (prefix: string) => void;
  onRestoreItem?: (key: string) => void;
  onDownloadItem?: (key: string, name: string) => void;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function DriveContent({
  userName,
  selectedIds,
  onToggleItem,
  onToggleAll,
  objects = [],
  loading = false,
  prefix = "",
  onNavigatePrefix,
  onOpenFolder,
  onRestoreItem,
  onDownloadItem,
}: DriveContentProps) {
  const [activeSubTab, setActiveSubTab] = useState("My Drive");
  const subTabs = ["My Drive", "Shared with me", "Recent", "Starred", "Trash"];

  const driveSubTabIcons = {
    "My Drive": <FolderIcon sx={{ fontSize: 16 }} className="text-amber-500" />,
    "Shared with me": <PeopleOutlineOutlinedIcon sx={{ fontSize: 16 }} />,
    Recent: <AccessTimeIcon sx={{ fontSize: 16 }} />,
    Starred: <StarIcon sx={{ fontSize: 16 }} />,
    Trash: <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"name" | "size" | "date">("name");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeSubTab, prefix, sortBy]);

  const getFileIcon = (fileName: string, type: "file" | "folder") => {
    const size = 18;
    if (type === "folder") {
      return <FolderIcon sx={{ fontSize: size, color: "#f59e0b" }} />;
    }
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    switch (ext) {
      case "xlsx":
      case "xls":
      case "csv":
        return <TableChartIcon sx={{ fontSize: size, color: "#10b981" }} />;
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <FolderZipIcon sx={{ fontSize: size, color: "#d97706" }} />;
      case "docx":
      case "doc":
      case "pdf":
        return <DescriptionIcon sx={{ fontSize: size, color: "#3b82f6" }} />;
      case "pptx":
      case "ppt":
        return <SlideshowIcon sx={{ fontSize: size, color: "#f43f5e" }} />;
      case "exe":
      case "apk":
      case "app":
        return <AppShortcutIcon sx={{ fontSize: size, color: "#8b5cf6" }} />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return <ImageIcon sx={{ fontSize: size, color: "#ec4899" }} />;
      case "mov":
      case "mp4":
      case "avi":
      case "mkv":
        return <VideoLibraryIcon sx={{ fontSize: size, color: "#eab308" }} />;
      default:
        return (
          <InsertDriveFileIcon sx={{ fontSize: size, color: "#64748b" }} />
        );
    }
  };

  const filteredObjects = objects.filter((item) => {
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedObjects = [...filteredObjects].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    if (sortBy === "size") {
      const sizeA = a.size || 0;
      const sizeB = b.size || 0;
      return sizeB - sizeA; // Largest first
    } else if (sortBy === "date") {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA; // Newest first
    } else {
      return a.name.localeCompare(b.name); // Name A-Z
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
  const pagedObjects = sortedObjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const filesOnly = pagedObjects.filter((item) => item.type === "file");
  const fileKeys = filesOnly.map((item) => item.key);
  const isAllSelected =
    fileKeys.length > 0 && fileKeys.every((key) => selectedIds.has(key));

  const handleHeaderCheckboxChange = () => {
    if (isAllSelected) {
      onToggleAll(fileKeys, false);
    } else {
      onToggleAll(fileKeys, true);
    }
  };

  const handleBack = () => {
    const parts = prefix.split("/").filter(Boolean);
    if (parts.length <= 1) return; // Keep user's root folder as boundary
    parts.pop();
    const parentPrefix = parts.join("/") + "/";
    onNavigatePrefix(parentPrefix);
  };

  const hasParent = prefix.split("/").filter(Boolean).length > 1;

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 bg-(--bg-primary)">
      {/* Reusable Sidebar Navigation */}
      {/* <SidebarNavigation
        title="VAULT"
        subtitle={userName}
        tabs={subTabs}
        activeTab={activeSubTab}
        onChangeTab={setActiveSubTab}
        icons={driveSubTabIcons}
      /> */}

      {/* Main Files Table Content */}
      <div className="flex-1 p-4 overflow-hidden bg-(--bg-primary) flex flex-col min-h-0">
        {activeSubTab === "My Drive" ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Box */}
            <div className="flex items-center gap-2 w-full bg-(--bg-primary) border border-(--border) rounded-sm px-3 py-2 shadow-xs shrink-0 mb-3 relative z-30">
              <SearchIcon sx={{ color: "var(--text-muted)", fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-(--text-primary) placeholder:(--text-muted) focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="p-1 hover:bg-(--bg-secondary) rounded cursor-pointer relative"
              >
                <FilterListIcon
                  sx={{
                    color: filterOpen ? "var(--primary)" : "var(--text-muted)",
                    fontSize: 20,
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {filterOpen && (
                <div className="absolute right-3 top-11 bg-(--bg-primary) border border-(--border) rounded-md shadow-lg p-2 w-48 flex flex-col gap-1 text-xs text-(--text-secondary) z-50">
                  <span className="font-bold text-(--text-muted) px-2 py-1 select-none">
                    SORT BY
                  </span>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setFilterOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm hover:bg-(--bg-secondary) text-left cursor-pointer ${sortBy === "name" ? "bg-(--primary)/10 text-(--primary) font-bold" : ""}`}
                  >
                    <span>Name (A-Z)</span>
                    {sortBy === "name" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-(--primary)" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("date");
                      setFilterOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm hover:bg-(--bg-secondary) text-left cursor-pointer ${sortBy === "date" ? "bg-(--primary)/10 text-(--primary) font-bold" : ""}`}
                  >
                    <span>Date (Newest first)</span>
                    {sortBy === "date" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-(--primary)" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("size");
                      setFilterOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm hover:bg-(--bg-secondary) text-left cursor-pointer ${sortBy === "size" ? "bg-(--primary)/10 text-(--primary) font-bold" : ""}`}
                  >
                    <span>Size (Largest first)</span>
                    {sortBy === "size" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-(--primary)" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {hasParent && (
              <div className="mb-3">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs font-bold text-(--primary) hover:underline cursor-pointer border-none bg-transparent"
                >
                  <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to parent folder
                </button>
              </div>
            )}

            <div className="overflow-auto w-full border border-(--border) rounded-sm bg-(--bg-primary) shadow-xs flex-1 min-h-0 pr-1">
              <div className="min-w-[500px]">
                {/* Table Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-(--bg-secondary) border-b border-(--border)">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleHeaderCheckboxChange}
                    className="accent-(--primary) w-3.5 h-3.5 border-(--border) rounded-none cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-black uppercase text-(--text-secondary) tracking-wider flex-1">
                    File Name
                  </span>
                  <span className="text-xs font-black uppercase text-(--text-secondary) tracking-wider w-20 text-right pr-2">
                    Size
                  </span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-(--border)">
                  {loading ? (
                    <div className="flex flex-col p-8 items-center justify-center text-xs font-bold text-(--text-muted) gap-3">
                      <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
                      <span>Loading Drive files from vault...</span>
                    </div>
                  ) : filteredObjects.length === 0 ? (
                    <div className="p-8 text-center text-xs font-bold text-(--text-muted)">
                      No files or folders found.
                    </div>
                  ) : (
                    pagedObjects.map((item) => {
                      const isChecked = selectedIds.has(item.key);
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
                          className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors cursor-pointer select-none group ${
                            isChecked
                              ? "bg-(--bg-active)/40"
                              : "hover:bg-(--bg-secondary)/50"
                          }`}
                        >
                          {item.type === "file" ? (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleItem(item.key)}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-(--primary) w-3.5 h-3.5 border-(--border) rounded-none cursor-pointer shrink-0"
                            />
                          ) : (
                            <div className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="p-1 rounded-sm bg-(--bg-secondary) flex items-center justify-center shrink-0 border border-(--border)">
                              {getFileIcon(item.name, item.type)}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-black text-(--text-primary) truncate">
                                {(() => {
                                  const cleaned = item.name
                                    .replace(/^[a-zA-Z0-9]{15,60}[-_]/, "")
                                    .replace(/^\d+[-_\s]?/, "");
                                  
                                  if (item.type === "folder") {
                                    return cleaned.length > 20
                                      ? cleaned.substring(0, 6) + "..." + cleaned.substring(cleaned.length - 4)
                                      : cleaned;
                                  } else {
                                    const baseCleaned = cleaned
                                      .replace(/\.[^/.]+$/, "")
                                      .replace(/[_-]/g, " ");
                                    const extMatch = cleaned.match(/(\.[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?)$/);
                                    const ext = extMatch ? extMatch[1] : "";
                                    
                                    return baseCleaned.length > 20
                                      ? baseCleaned.substring(0, 6) + "..." + baseCleaned.substring(baseCleaned.length - 4) + ext
                                      : baseCleaned + ext;
                                  }
                                })()}
                              </span>
                              {item.type === "file" && (
                                <span className="text-[10px] text-(--text-muted) font-bold uppercase font-mono mt-0.5">
                                  {(() => {
                                    const ext = (item.name.split(".").pop() || "").toLowerCase();
                                    if (["mov", "mp4", "avi", "mkv"].includes(ext)) return `${ext.toUpperCase()} Video`;
                                    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return `${ext.toUpperCase()} Image`;
                                    if (["exe", "apk", "app"].includes(ext)) return `${ext.toUpperCase()} Application`;
                                    if (["zip", "rar", "tar", "gz"].includes(ext)) return `${ext.toUpperCase()} Archive`;
                                    return `${ext.toUpperCase()} File`;
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.type === "file" && (
                            <div
                              className="flex items-center gap-1.5 shrink-0 mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => onRestoreItem?.(item.key)}
                                title="Restore"
                                className="p-1.5 text-(--primary) bg-(--primary)/10 border border-(--primary)/20 hover:bg-(--primary)/20 transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs"
                              >
                                <RestoreActionIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  onDownloadItem?.(item.key, item.name)
                                }
                                title="Download"
                                className="p-1.5 text-(--text-secondary) bg-(--bg-secondary) border border-(--border) hover:bg-(--bg-active) transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs"
                              >
                                <DownloadActionIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          <span className="text-xs text-(--text-muted) font-mono font-bold w-20 text-right pr-2 shrink-0">
                            {item.type === "file"
                              ? formatBytes(item.size)
                              : "—"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && !loading && (
              <div className="flex items-center justify-between border-t border-(--border) pt-4 mt-4 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-(--text-muted) font-bold">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
                    {totalItems} items
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className="px-3 py-1.5 text-xs font-black border border-(--border) rounded-sm hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition bg-(--bg-primary) cursor-pointer shadow-2xs text-(--text-secondary)"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1">
            <span>No files in {activeSubTab}</span>
            <span className="font-normal text-[11px]">
              Everything is up-to-date!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
