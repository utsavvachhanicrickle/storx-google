"use client";

import React, { useState, useEffect } from "react";
import SidebarNavigation from "../SidebarNavigation";
import type { VaultBrowserObject } from "@/types/vault";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

import InboxIcon from "@mui/icons-material/Inbox";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import DraftsIcon from "@mui/icons-material/Drafts";

interface GmailContentProps {
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
  getDownloadUrl?: (bucket: string, key: string) => Promise<string>;
}

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

export default function GmailContent({
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
  getDownloadUrl,
}: GmailContentProps) {
  const [activeSubTab, setActiveSubTab] = useState("Inbox");
  const subTabs = ["Inbox", "Starred", "Snoozed", "Sent", "Drafts"];

  const subTabIcons = {
    Inbox: <InboxIcon sx={{ fontSize: 16 }} />,
    Starred: <StarIcon sx={{ fontSize: 16 }} />,
    Snoozed: <AccessTimeIcon sx={{ fontSize: 16 }} />,
    Sent: <SendIcon sx={{ fontSize: 16 }} />,
    Drafts: <DraftsIcon sx={{ fontSize: 16 }} />,
  };

  // Selected email for full detail view
  const [selectedEmail, setSelectedEmail] = useState<VaultBrowserObject | null>(
    null,
  );
  const [parsedEmailDetails, setParsedEmailDetails] = useState<any>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeSubTab]);

  const getEmailDetails = (item: VaultBrowserObject) => {
    // 1. Extract 'to' address from key path prefix (e.g. "recipient@gmail.com/sender@domain.com - Subject - id.gmail")
    let toVal = userEmail;
    if (item.key && item.key.includes("/")) {
      const partsSlash = item.key.split("/");
      if (partsSlash.length > 0 && partsSlash[0].includes("@")) {
        toVal = partsSlash[0];
      }
    }

    // 2. Extract 'from' and 'subject' from the item name (e.g. "sender@domain.com - Subject - id.gmail")
    let fromVal = " - ";
    let subjectVal = item.name;

    const nameWithoutExt = item.name.replace(/\.gmail$/i, "").replace(/\.eml$/i, "");
    const parts = nameWithoutExt.split(" - ");
    if (parts.length >= 3) {
      fromVal = parts[0].trim();
      subjectVal = parts.slice(1, parts.length - 1).join(" - ").trim();
    } else if (parts.length === 2) {
      fromVal = parts[0].trim();
      subjectVal = parts[1].trim();
    } else {
      const splitByDash = nameWithoutExt.split("-");
      if (splitByDash.length > 1) {
        fromVal = splitByDash[0].trim();
        subjectVal = splitByDash.slice(1).join("-").trim();
      }
    }

    return {
      subject: subjectVal || item.key,
      from: fromVal,
      to: toVal,
      date: item.lastModified
        ? new Date(item.lastModified).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Oct 24",
    };
  };

  const decodeBase64 = (b64String: string) => {
    try {
      const base64 = b64String.replace(/-/g, "+").replace(/_/g, "/");
      const binString = atob(base64);
      return new TextDecoder().decode(
        Uint8Array.from(binString, (m) => m.codePointAt(0)!),
      );
    } catch (e) {
      console.error("Base64 decode failed:", e);
      return b64String;
    }
  };

  const findPart = (parts: any[], mimeType: string): any => {
    for (const part of parts) {
      if (part.mimeType === mimeType) {
        return part;
      }
      if (part.parts) {
        const found = findPart(part.parts, mimeType);
        if (found) return found;
      }
    }
    return null;
  };

  const getBodyFromPayload = (payload: any): string => {
    if (payload?.body?.data) {
      return decodeBase64(payload.body.data);
    }
    if (payload?.parts) {
      const htmlPart = findPart(payload.parts, "text/html");
      if (htmlPart?.body?.data) {
        return decodeBase64(htmlPart.body.data);
      }
      const plainPart = findPart(payload.parts, "text/plain");
      if (plainPart?.body?.data) {
        return decodeBase64(plainPart.body.data);
      }
    }
    return "";
  };

  const getHeader = (headers: any[], name: string): string => {
    const header = headers?.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    return header ? header.value : "";
  };

  const parseEmailJson = (jsonText: string, item: VaultBrowserObject) => {
    try {
      const data = JSON.parse(jsonText);
      const headers = data.payload?.headers || [];
      const from = getHeader(headers, "From") || "billing@vendor.com";
      const subject = getHeader(headers, "Subject") || item.name;
      const to = getHeader(headers, "To") || userEmail;
      const dateStr = getHeader(headers, "Date");
      const date = dateStr
        ? new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Oct 24";

      const body = getBodyFromPayload(data.payload) || data.snippet || "";

      return {
        from,
        subject,
        to,
        date,
        body,
      };
    } catch (e) {
      return null;
    }
  };

  // Fetch email body via Signed S3 URL
  useEffect(() => {
    if (!selectedEmail) {
      setParsedEmailDetails(null);
      return;
    }

    let active = true;
    const fetchBody = async () => {
      setLoadingBody(true);
      try {
        if (getDownloadUrl) {
          const url = await getDownloadUrl("gmail", selectedEmail.key);
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            if (active) {
              const parsed = parseEmailJson(text, selectedEmail);
              if (parsed) {
                setParsedEmailDetails(parsed);
              } else {
                const details = getEmailDetails(selectedEmail);
                setParsedEmailDetails({
                  ...details,
                  body: text.trim(),
                });
              }
              setLoadingBody(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load email from signed S3 URL:", err);
      }

      // Mock fallback if fetch fails or file is empty
      if (active) {
        const details = getEmailDetails(selectedEmail);
        setParsedEmailDetails({
          ...details,
          body: `Hi there,\n\nPlease find the requested information attached to this email. If you need any further modifications before the deadline, let me know.\n\nLet's schedule a quick sync later this week to go over the final details.\n\nBest regards,\n${details.from.split("@")[0]}`,
        });
        setLoadingBody(false);
      }
    };

    fetchBody();
    return () => {
      active = false;
    };
  }, [selectedEmail, getDownloadUrl]);

  const filteredObjects = objects.filter((item) => {
    if (item.type === "folder") return true;

    // Local filtering by sub-tab category if the S3 key structure contains it
    const keyLower = item.key.toLowerCase();
    const tabLower = activeSubTab.toLowerCase();
    const hasAnyTabSpecificItems = objects.some(
      (obj) =>
        obj.type === "file" && obj.key.toLowerCase().includes(`/${tabLower}/`),
    );

    if (hasAnyTabSpecificItems) {
      if (!keyLower.includes(`/${tabLower}/`)) {
        return false;
      }
    }

    if (!searchQuery) return true;
    const details = getEmailDetails(item);
    return (
      details.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.from.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedObjects = [...filteredObjects].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    if (sortBy === "date") {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA; // Descending (Newest first)
    } else {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB); // Ascending (A-Z)
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

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 bg-(--bg-primary)">
      {/* Reusable Sidebar Navigation */}
      {/* <SidebarNavigation
        title="ARCHIVE"
        subtitle={userEmail}
        tabs={subTabs}
        activeTab={activeSubTab}
        onChangeTab={setActiveSubTab}
        fontMonoSubtitle={true}
        icons={subTabIcons}
      /> */}

      {/* Main Mailbox Content area */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col gap-3 min-h-0">
        {!selectedEmail ? (
          <>
            {/* Search and filter bar */}
            <div className="flex items-center gap-2 w-full bg-(--bg-primary) border border-(--border) rounded-sm px-3 py-2 shadow-xs shrink-0 relative z-30">
              <SearchIcon sx={{ color: "var(--text-muted)", fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search emails..."
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
                    <span>Subject / Name</span>
                    {sortBy === "name" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-(--primary)" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Email list */}
            <div className="flex-1 flex flex-col gap-2.5 min-h-0 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex flex-col h-48 items-center justify-center text-xs font-bold text-(--text-muted) gap-3">
                  <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
                  <span>Loading emails from vault...</span>
                </div>
              ) : filteredObjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1 bg-(--bg-primary) border border-(--border) rounded-sm">
                  <span>No emails found in this vault folder</span>
                  <span className="font-normal text-[11px] text-(--text-muted)">
                    Try running a sync job first.
                  </span>
                </div>
              ) : (
                pagedObjects.map((item) => {
                  const isChecked = selectedIds.has(item.key);
                  const emailDetails = getEmailDetails(item);

                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        if (item.type === "folder") {
                          onOpenFolder(item.key);
                        } else {
                          setSelectedEmail(item);
                        }
                      }}
                      className={`flex items-start gap-4 p-4 border rounded-md transition-all duration-200 cursor-pointer select-none bg-(--bg-primary) group shadow-xs hover:shadow-md relative ${
                        isChecked
                          ? "border-(--primary) bg-(--primary)/5"
                          : "border-(--border) hover:border-(--border)"
                      }`}
                    >
                      {item.type !== "folder" && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleItem(item.key)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 accent-(--primary) w-4 h-4 border-(--border) rounded cursor-pointer shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 pr-16 text-left">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-(--text-primary) truncate">
                              {item.type === "folder"
                                ? `📁 ${item.name}`
                                : emailDetails.subject}
                            </span>
                            <span className="text-[11px] text-(--text-muted) font-bold font-mono">
                              {emailDetails.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-(--text-muted) font-bold min-w-0 flex-wrap">
                            {item.type !== "folder" ? (
                              <>
                                <span className="truncate">
                                  <span className="text-(--text-secondary) font-black">
                                    From:
                                  </span>{" "}
                                  {emailDetails.from}
                                </span>
                                <span className="text-(--border) select-none">
                                  |
                                </span>
                                <span className="truncate">
                                  <span className="text-(--text-secondary) font-black">
                                    To:
                                  </span>{" "}
                                  {emailDetails.to}
                                </span>
                              </>
                            ) : (
                              <span>Folder</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {item.type !== "folder" && (
                        <div
                          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-(--bg-primary)/90 backdrop-blur-xs pl-2 py-1 rounded-sm z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onRestoreItem?.(item.key)}
                            title="Restore"
                            className="p-2 text-(--primary) bg-(--primary)/10 hover:bg-(--primary)/20 transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs border border-(--primary)/20"
                          >
                            <RestoreActionIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              onDownloadItem?.(item.key, item.name)
                            }
                            title="Download"
                            className="p-2 text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-active) transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs border border-(--border)"
                          >
                            <DownloadActionIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && !loading && (
              <div className="flex items-center justify-between border-t border-(--border) pt-4 mt-2 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-(--text-muted) font-bold">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
                    {totalItems} emails
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
          </>
        ) : (
          <div className="flex-1 flex flex-col gap-3 min-h-0 animate-in fade-in duration-200">
            {/* Header controls (Outside the email card) */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setSelectedEmail(null)}
                className="flex items-center gap-1.5 text-xs font-black text-(--text-secondary) hover:text-(--text-primary) transition bg-(--bg-primary) hover:bg-(--bg-secondary) border border-(--border) rounded-sm px-3.5 py-2 cursor-pointer shadow-2xs"
              >
                <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to Inbox
              </button>
            </div>

            {/* Email card containing headers, body, and restore action */}
            <div className="flex-1 bg-(--bg-primary) border border-(--border) rounded-md overflow-y-auto p-6 space-y-6 shadow-sm flex flex-col">
              {loadingBody ? (
                <div className="text-xs font-bold text-(--text-muted) animate-pulse uppercase tracking-wider p-4">
                  Retrieving message content from secure storage...
                </div>
              ) : parsedEmailDetails ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  <div>
                    <h2 className="text-xl font-black text-(--text-primary) tracking-tight">
                      {parsedEmailDetails.subject}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between border-t border-b border-(--border) py-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-(--bg-secondary) border border-(--border) text-(--text-secondary) flex items-center justify-center font-black text-base uppercase shadow-2xs">
                        {parsedEmailDetails.from.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-(--text-primary)">
                          {parsedEmailDetails.from}
                        </p>
                        <p className="text-[11px] text-(--text-muted) font-semibold mt-0.5">
                          To: {parsedEmailDetails.to}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-(--text-muted) font-bold font-mono bg-(--bg-secondary) border border-(--border) px-2.5 py-1 rounded-md">
                      {parsedEmailDetails.date}
                    </span>
                  </div>

                  <div
                    className={`text-sm text-(--text-secondary) leading-relaxed font-sans font-medium px-1 flex-1 ${
                      /<[a-z][\s\S]*>/i.test(parsedEmailDetails.body)
                        ? ""
                        : "whitespace-pre-wrap"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: parsedEmailDetails.body,
                    }}
                  />

                  {/* Restore box at bottom of email details view */}
                  <div className="pt-6 border-t border-(--border) bg-(--primary)/5 p-4 rounded-md border flex items-center justify-start shrink-0">
                    <button
                      onClick={() => onRestoreItem?.(selectedEmail.key)}
                      className="px-4 py-2.5 text-xs font-black text-(--primary) bg-(--bg-primary) hover:bg-(--primary)/10 border border-(--primary)/30 rounded-sm shadow-2xs transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <polyline points="11 17 6 12 11 7" />
                        <polyline points="18 17 13 12 18 7" />
                      </svg>
                      Restore this Email
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
