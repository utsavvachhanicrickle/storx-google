"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  readAllNotifications,
  dismissNotification,
  fetchNotificationById,
  clearCurrentNotification,
  markItemAsRead,
  fetchNotificationsCount,
} from "@/store/slices/notificationSlice";

import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Button from "@/components/ui/Button";

const PER_PAGE_OPTIONS = [40, 50, 60];

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const {
    items,
    unreadCount,
    loading,
    pageCount,
    totalCount,
    currentNotification,
    loadingCurrent,
  } = useAppSelector((state) => state.notifications);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50); // items per page — default 50
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    dispatch(
      fetchNotifications({
        limit,
        page: currentPage,
        filter: statusFilter || undefined,
        timeFilter: timeFilter || undefined,
      }),
    );
    dispatch(fetchNotificationsCount());
  };

  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, timeFilter, limit]);

  const handleReadAll = () => {
    // Optimistically clear all unread in store first, then call API
    dispatch(readAllNotifications()).then(() => {
      loadData();
    });
  };

  /**
   * Card click:
   * 1. Open modal immediately
   * 2. Fetch full details for the modal body (background)
   * 3. If was unread — optimistically mark as read in Redux INSTANTLY
   * 4. Fire dismiss API in background (no await, no reload needed)
   */
  const handleCardClick = (id: string) => {
    const item = items.find((i) => i.id === id);
    const wasUnread = item ? !item.isRead : false;

    setIsModalOpen(true);
    dispatch(fetchNotificationById(id));

    if (wasUnread) {
      // Instantly update list card and header badge — no API wait
      dispatch(markItemAsRead(id));
      // Fire dismiss API, then re-fetch real count from server
      dispatch(dismissNotification(id)).then(() => {
        dispatch(fetchNotificationsCount());
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearCurrentNotification());
    loadData();
  };

  /**
   * Manual dismiss button in modal footer.
   * Guard: skip if already read (optimistically updated on open).
   */
  const handleDismissSingle = (id: string) => {
    if (currentNotification?.isRead) return; // already read — no-op
    dispatch(markItemAsRead(id));
    // Dismiss via API then re-fetch real count from server
    dispatch(dismissNotification(id)).then(() => {
      dispatch(fetchNotificationsCount());
      loadData();
    });
    handleCloseModal();
  };

  const getStatusStyle = (status?: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("fail") || s.includes("error") || s.includes("critical")) {
      return {
        bg: "bg-red-500/10",
        icon: <WarningIcon className="text-red-500 w-5 h-5 shrink-0" />,
      };
    }
    if (s.includes("warn") || s.includes("alert") || s.includes("anomaly")) {
      return {
        bg: "bg-amber-500/10",
        icon: <WarningIcon className="text-amber-500 w-5 h-5 shrink-0" />,
      };
    }
    return {
      bg: "bg-blue-500/10",
      icon: <InfoIcon className="text-blue-500 w-5 h-5 shrink-0" />,
    };
  };

  const formatNotificationDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.body?.toLowerCase().includes(q)
    );
  });

  // ── Pagination helpers ────────────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(pageCount, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ── Computed display range ────────────────────────────────────────────────
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalCount);

  // ── Pagination bar (reused above list and optionally below) ───────────────
  const PaginationBar = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-(--border) bg-(--bg-primary) px-3 py-2 select-none">
      {/* Left: count + per-page selector */}
      <div className="flex items-center gap-3 text-xs text-(--text-muted) font-bold">
        <span>
          {totalCount === 0
            ? "No notifications"
            : `${startEntry}–${endEntry} of ${totalCount}`}
        </span>
        <span className="text-(--border)">|</span>
        <span className="flex items-center gap-1.5">
          Show:
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-xs border border-(--border) rounded-sm bg-(--bg-secondary) text-(--text-primary) cursor-pointer focus:outline-none"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
      </div>

      {/* Right: page number buttons */}
      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1.5 text-xs font-black border border-(--border) rounded-sm hover:bg-(--bg-secondary) disabled:opacity-40 disabled:cursor-not-allowed transition bg-(--bg-primary) cursor-pointer text-(--text-secondary)"
          >
            &lt;
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-2.5 py-1.5 text-xs font-black border rounded-sm transition cursor-pointer ${
                p === currentPage
                  ? "bg-(--primary)/10 text-(--primary) border-(--primary)/30"
                  : "bg-(--bg-primary) text-(--text-secondary) border-(--border) hover:bg-(--bg-secondary)"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={currentPage >= pageCount}
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            className="px-2.5 py-1.5 text-xs font-black border border-(--border) rounded-sm hover:bg-(--bg-secondary) disabled:opacity-40 disabled:cursor-not-allowed transition bg-(--bg-primary) cursor-pointer text-(--text-secondary)"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              System Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-sm bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-500 animate-pulse">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-(--text-secondary)">
            View system events, anomaly detections, logs, and billing updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleReadAll}>
            <DoneAllIcon sx={{ fontSize: 20 }} />
            Read All
          </Button>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 rounded-sm border border-(--border) bg-(--bg-primary) p-3 md:grid-cols-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-3 pr-10 border border-(--border) bg-(--bg-secondary) text-(--text-primary) placeholder-(--text-muted) rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-(--text-muted) hover:text-(--text-primary)"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 px-2 border border-(--border) bg-(--bg-secondary) text-(--text-primary) rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-(--primary) cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="unread">Unread Only</option>
        </select>

        {/* Time Filter */}
        <select
          value={timeFilter}
          onChange={(e) => {
            setTimeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 px-2 border border-(--border) bg-(--bg-secondary) text-(--text-primary) rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-(--primary) cursor-pointer"
        >
          <option value="">Any Time</option>
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="15d">Last 15 Days</option>
          <option value="1m">Last Month</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* ── PAGINATION BAR (TOP — below filters, above list) ──────────────── */}
      {!loading && <PaginationBar />}

      {/* ── NOTIFICATIONS LIST ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-20 rounded-sm border border-(--border) bg-(--bg-primary) p-4 animate-pulse"
            >
              <div className="h-3 w-1/4 rounded-sm bg-(--bg-secondary) mb-2" />
              <div className="h-3 w-3/4 rounded-sm bg-(--bg-secondary)" />
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="rounded-sm border border-dashed border-(--border) bg-(--bg-primary) py-12 text-center">
            <div className="text-3xl mb-2">🔔</div>
            <h3 className="text-md font-bold text-(--text-primary)">
              No notifications found
            </h3>
            <p className="mt-1 text-xs text-(--text-muted) max-w-sm mx-auto">
              {searchQuery
                ? "We couldn't find anything matching your search term."
                : "No notifications fit your current filter settings."}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const styles = getStatusStyle(item.status);
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.id)}
                className={`group relative overflow-hidden rounded-sm border p-4 transition-all duration-200 cursor-pointer hover:shadow-sm hover:border-(--primary)/40 ${
                  item.isRead
                    ? "bg-(--bg-primary)/70 border-(--border) opacity-70"
                    : "bg-(--bg-primary) border-(--border) shadow-sm"
                }`}
              >
                {/* Unread left accent */}
                {!item.isRead && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
                )}

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-sm shrink-0 ${styles.bg}`}>
                    {styles.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <h3
                          className={`font-bold truncate text-sm ${
                            !item.isRead
                              ? "font-black text-blue-600 dark:text-blue-400"
                              : "text-(--text-primary)"
                          }`}
                        >
                          {item.title}
                        </h3>
                        {!item.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-(--text-muted) shrink-0">
                        {formatNotificationDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-(--text-secondary) line-clamp-2">
                      {item.body}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="rounded-sm bg-(--bg-secondary) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-(--text-muted)">
                        {item.status || "SYSTEM"}
                      </span>
                      {item.isRead && (
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                          ✓ read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DETAIL MODAL ───────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
          <div className="bg-(--bg-primary) border border-(--border) w-full max-w-xl rounded-sm shadow-xl p-4.5 relative flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-(--border) pb-2.5 shrink-0">
              <div>
                <span className="rounded-sm bg-(--bg-secondary) px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-(--text-muted)">
                  {currentNotification?.status || "NOTIFICATION DETAILS"}
                </span>
                <h2 className="text-lg font-black text-(--text-primary) mt-1">
                  {loadingCurrent
                    ? "Loading..."
                    : currentNotification?.title || "System Message"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-sm text-(--text-muted) hover:bg-(--bg-secondary) hover:text-(--text-primary) transition-colors cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto space-y-4 py-4 pr-1 flex-1">
              {loadingCurrent ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-8 h-8 border-3 border-(--primary) rounded-md border-t-transparent animate-spin mb-2" />
                  <p className="text-xs text-(--text-muted)">
                    Fetching notification payload...
                  </p>
                </div>
              ) : currentNotification ? (
                <>
                  {/* Body */}
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">
                      Description
                    </h4>
                    <p className="text-xs leading-relaxed text-(--text-secondary) whitespace-pre-wrap">
                      {currentNotification.body}
                    </p>
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">
                        Received Time
                      </h4>
                      <p className="text-xs text-(--text-primary) mt-0.5">
                        {formatNotificationDate(currentNotification.createdAt)}
                      </p>
                    </div>
                    {currentNotification.sentAt && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">
                          Dispatched Time
                        </h4>
                        <p className="text-xs text-(--text-primary) mt-0.5">
                          {formatNotificationDate(currentNotification.sentAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Token */}
                  {currentNotification.tokenId && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">
                        Associated Token ID
                      </h4>
                      <p className="text-xs text-(--text-primary) mt-0.5 font-mono break-all bg-(--bg-secondary) p-1.5 rounded-sm">
                        {currentNotification.tokenId}
                      </p>
                    </div>
                  )}

                  {/* Error block */}
                  {currentNotification.errorMessage && (
                    <div className="rounded-sm border border-red-200/30 bg-red-500/5 p-3">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                        <WarningIcon sx={{ fontSize: 12 }} /> Error Trace
                        Details
                      </h4>
                      <p className="text-[11px] text-(--text-secondary) mt-1 leading-relaxed font-mono whitespace-pre-wrap">
                        {currentNotification.errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Data payload */}
                  {currentNotification.data &&
                    Object.keys(currentNotification.data).length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">
                          Metadata Payload
                        </h4>
                        <pre className="bg-(--bg-secondary) p-3 rounded-sm text-[11px] overflow-x-auto font-mono text-(--text-primary) text-left max-h-36">
                          {JSON.stringify(currentNotification.data, null, 2)}
                        </pre>
                      </div>
                    )}
                </>
              ) : (
                <p className="text-xs text-center text-(--text-muted)">
                  No details found.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-(--border) pt-3 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-(--text-muted) font-bold truncate pr-2">
                ID: {currentNotification?.id}
              </span>
              <div className="flex gap-2 items-center shrink-0">
                {currentNotification?.isRead && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-sm border border-emerald-500/20">
                    ✓ Read
                  </span>
                )}
                <button
                  onClick={handleCloseModal}
                  className="px-3.5 py-2 text-xs font-bold border border-(--border) bg-(--bg-primary) text-(--text-primary) rounded-sm hover:bg-(--bg-secondary) cursor-pointer"
                >
                  Close
                </button>
                {currentNotification && !currentNotification.isRead && (
                  <button
                    onClick={() => {
                      handleDismissSingle(currentNotification.id);
                      handleCloseModal();
                    }}
                    className="px-3.5 py-2 text-xs font-bold bg-(--primary) text-white rounded-sm hover:bg-(--primary-hover) cursor-pointer"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
