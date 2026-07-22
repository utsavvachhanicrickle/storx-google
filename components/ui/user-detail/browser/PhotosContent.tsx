"use client";

import React, { useState, useEffect } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SidebarNavigation from "../SidebarNavigation";
import type { VaultBrowserObject } from "@/types/vault";
import ImageIcon from "@mui/icons-material/Image";
import PhotoAlbumIcon from "@mui/icons-material/PhotoAlbum";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

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

interface PhotosContentProps {
  userName: string;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
  objects: VaultBrowserObject[];
  loading: boolean;
  prefix: string;
  onNavigatePrefix: (prefix: string) => void;
  onOpenFolder: (prefix: string) => void;
  onRestoreItem?: (key: string) => void;
  onDownloadItem?: (key: string, name: string) => void;
  getDownloadUrl?: (bucket: string, key: string) => Promise<string>;
}

export default function PhotosContent({
  userName,
  selectedIds,
  onToggleItem,
  objects = [],
  loading = false,
  prefix,
  onNavigatePrefix,
  onOpenFolder,
  onRestoreItem,
  onDownloadItem,
  getDownloadUrl,
}: PhotosContentProps) {
  const [activeSubTab, setActiveSubTab] = useState("Photos");
  const subTabs = ["Photos", "Albums", "Favorites"];

  const photosSubTabIcons = {
    Photos: <ImageIcon sx={{ fontSize: 16 }} />,
    Albums: <PhotoAlbumIcon sx={{ fontSize: 16 }} />,
    Favorites: <FavoriteBorderIcon sx={{ fontSize: 16 }} />,
  };

  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeSubTab, sortBy]);

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
  const pagedObjects = sortedObjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    if (!pagedObjects || pagedObjects.length === 0 || !getDownloadUrl) return;

    let active = true;
    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      for (const item of pagedObjects) {
        if (item.type === "file") {
          try {
            const url = await getDownloadUrl("google-photos", item.key);
            urls[item.key] = url;
          } catch (e) {
            console.error("Failed to sign photo URL:", e);
          }
        }
      }
      if (active) {
        setPhotoUrls(urls);
      }
    };
    fetchUrls();
    return () => {
      active = false;
    };
  }, [objects, currentPage, itemsPerPage, searchQuery, sortBy, getDownloadUrl]);

  const getPlaceholderColor = (name: string) => {
    const colors = [
      "#ff9c9c",
      "#82baff",
      "#63e49e",
      "#ffd859",
      "#d5b2ff",
      "#ffbe76",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 bg-(--bg-primary)">
      {/* Reusable Sidebar Navigation */}
      {/* <SidebarNavigation
        title="MEDIA BACKUPS"
        subtitle={userName}
        tabs={subTabs}
        activeTab={activeSubTab}
        onChangeTab={setActiveSubTab}
        icons={photosSubTabIcons}
      /> */}

      {/* Main Grid Content */}
      <div className="flex-1 p-4 overflow-hidden bg-(--bg-primary) min-h-0 flex flex-col">
        {loading ? (
          <div className="flex flex-col h-48 items-center justify-center text-xs font-bold text-(--text-muted) gap-3">
            <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
            <span>Loading photos from vault...</span>
          </div>
        ) : activeSubTab === "Photos" ? (
          <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
            {/* Search Box */}
            <div className="flex items-center gap-2 w-full bg-(--bg-primary) border border-(--border) rounded-sm px-3 py-2 shadow-xs shrink-0 relative z-30">
              <SearchIcon sx={{ color: "var(--text-muted)", fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search photos..."
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
                </div>
              )}
            </div>

            {filteredObjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1 bg-(--bg-primary) border border-(--border) rounded-lg">
                <span>No photos found in this vault folder</span>
                <span className="font-normal text-[11px] text-(--text-muted)">
                  Try running a sync job first.
                </span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 justify-between gap-4">
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-1">
                    {pagedObjects.map((item) => {
                      const isChecked = selectedIds.has(item.key);
                      const signedUrl = photoUrls[item.key];

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
                          style={{
                            backgroundColor: !signedUrl
                              ? getPlaceholderColor(item.name)
                              : undefined,
                          }}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-between relative cursor-pointer transition-all duration-200 select-none shadow-sm hover:shadow-md border border-(--border) overflow-hidden p-3 group ${
                            isChecked
                              ? "border-(--primary) ring-2 ring-(--primary)/20 scale-[1.01]"
                              : "hover:border-(--border)"
                          }`}
                        >
                          {/* Render image if signed S3 URL exists */}
                          {signedUrl && (
                            <img
                              src={signedUrl}
                              alt={item.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}

                          {/* Top Row: checkbox / status */}
                          <div className="w-full flex justify-between items-start z-10">
                            {item.type === "folder" ? (
                              <span className="text-sm bg-(--bg-primary)/80 backdrop-blur-xs px-2 py-0.5 rounded-md font-black shadow-2xs text-(--text-primary)">
                                📁 Folder
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onToggleItem(item.key)}
                                onClick={(e) => e.stopPropagation()}
                                className="accent-(--primary) w-4 h-4 border-white rounded cursor-pointer shrink-0 shadow-xs"
                              />
                            )}
                            {isChecked && (
                              <CheckCircleIcon
                                sx={{ fontSize: 18 }}
                                className="text-(--primary) drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] bg-white rounded-full"
                              />
                            )}
                          </div>

                          <span className="text-[12px] font-black text-white bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-lg tracking-wider text-center truncate w-11/12 z-10 shadow-2xs">
                            {item.name}
                          </span>

                          {/* Bottom Actions */}
                          {item.type !== "folder" ? (
                            <div
                              className="flex items-center gap-1.5 w-full justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => onRestoreItem?.(item.key)}
                                title="Restore"
                                className="p-2 text-(--primary) bg-(--bg-primary) border border-(--primary)/30 hover:bg-(--primary)/10 transition rounded-lg cursor-pointer flex items-center justify-center shadow-md"
                              >
                                <RestoreActionIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  onDownloadItem?.(item.key, item.name)
                                }
                                title="Download"
                                className="p-2 text-(--text-secondary) bg-(--bg-primary) border border-(--border) hover:bg-(--bg-secondary) transition rounded-lg cursor-pointer flex items-center justify-center shadow-md"
                              >
                                <DownloadActionIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-6" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalItems > 0 && (
                  <div className="flex items-center justify-between border-t border-(--border) pt-4 mt-4 shrink-0 select-none">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-(--text-muted) font-bold">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
                        {totalItems} photos
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
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
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
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1 bg-(--bg-primary) border border-(--border) rounded-lg">
            <span>No media in {activeSubTab}</span>
            <span className="font-normal text-[11px] text-(--text-muted)">
              Everything is up-to-date!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
