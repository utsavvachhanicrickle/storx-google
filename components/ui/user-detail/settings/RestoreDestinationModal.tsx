"use client";

import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import SearchIcon from "@mui/icons-material/Search";
import RestoreIcon from "@mui/icons-material/Restore";
import { restoreService } from "@/services/restoreService";
import { userService } from "@/services/userService";
import { useGoogleLogin } from "@react-oauth/google";
import { jobService } from "@/services/jobService";
import toast from "@/components/Toast";

interface RestoreDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string; // e.g. "Gmail", "Drive"
  projectId: string;
  activeid: string; // login_id passed as activeid
  onRestore: (selectedEmails: string[]) => Promise<void>;
  restoreLoading: boolean;
}

export default function RestoreDestinationModal({
  isOpen,
  onClose,
  activeTab,
  projectId,
  activeid,
  onRestore,
  restoreLoading,
}: RestoreDestinationModalProps) {
  const [destSearch, setDestSearch] = useState("");
  const [destLoading, setDestLoading] = useState(false);

  // Dynamic domains tabs
  const [domains, setDomains] = useState<string[]>([]);
  const [activeDomain, setActiveDomain] = useState<string>("");

  // List states
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);

  // Selection states
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(20);

  const [connectLoading, setConnectLoading] = useState(false);

  // Google authentication flow to connect more personal accounts
  const connectLogin = useGoogleLogin({
    flow: "auth-code",
    scope:
      "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/contacts.readonly",
    onSuccess: async (codeResponse: any) => {
      setConnectLoading(true);
      try {
        await jobService.connectGoogleBackup(codeResponse.code);
        toast.success("Account connected successfully!");
        fetchDestinations(destSearch, 1, limit);
      } catch (err: any) {
        toast.error(
          `Connection failed: ${err?.response?.data?.error || err.message || err}`,
        );
      } finally {
        setConnectLoading(false);
      }
    },
    onError: (error: any) => {
      toast.error(`Google Connection failed: ${error}`);
    },
  } as any);

  // Fetch destination mailboxes based on active domain
  const fetchDestinations = async (
    searchVal = destSearch,
    pageVal = page,
    limitVal = limit,
  ) => {
    if (!activeDomain) return;
    setDestLoading(true);
    const offset = (pageVal - 1) * limitVal;
    try {
      const params = {
        search: searchVal || undefined,
        domain: activeDomain,
        limit: limitVal,
        offset,
      };

      if (activeDomain === "gmail.com") {
        const res = await restoreService.getRestoreCredentials(params);
        setCredentials(res?.credentials || []);
        const pag = res?.pagination;
        setTotalPages(pag?.total_pages || 1);
        setPage(pag?.page || 1);
        setTotalCount(pag?.total_count || 0);
      } else {
        const res = await restoreService.getRestoreWorkspaces(params);
        setWorkspaces(res?.mailboxes || []);
        const pag = res?.pagination;
        setTotalPages(pag?.total_pages || 1);
        setPage(pag?.page || 1);
        setTotalCount(pag?.total_count || 0);
      }
    } catch (err: any) {
      console.error("Failed to load destinations:", err);
      toast.error("Failed to load destination mailboxes.");
    } finally {
      setDestLoading(false);
    }
  };

  // Fetch domains list on modal open
  useEffect(() => {
    const fetchDomainsList = async () => {
      try {
        const res = await userService.getDomains();
        const doms = res?.domains || [];
        setDomains(doms);
        if (doms.length > 0) {
          // If activeid domain is in the list, default to it, otherwise default to the first domain
          const userDomainPart = activeid.split("@")[1] || "";
          if (doms.includes(userDomainPart)) {
            setActiveDomain(userDomainPart);
          } else {
            setActiveDomain(doms[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch domains list:", err);
      }
    };

    if (isOpen) {
      fetchDomainsList();
    }
  }, [isOpen, activeid]);

  // Refetch destinations when tab, search, page or limit changes
  useEffect(() => {
    if (isOpen && activeDomain) {
      setSelectedEmails(new Set());
      setDestSearch("");
      setPage(1);
      fetchDestinations("", 1, limit);
    }
  }, [isOpen, activeDomain, limit]);

  if (!isOpen) return null;

  const handleCheckboxToggle = (email: string) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelectedEmails(next);
  };

  const handleSelectAll = (list: string[]) => {
    const next = new Set(selectedEmails);
    const allChecked = list.every((email) => next.has(email));

    if (allChecked) {
      list.forEach((email) => next.delete(email));
    } else {
      list.forEach((email) => next.add(email));
    }
    setSelectedEmails(next);
  };

  const handleSearch = (val: string) => {
    setDestSearch(val);
    setPage(1);
    fetchDestinations(val, 1, limit);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const nextPage = direction === "next" ? page + 1 : page - 1;
    if (nextPage >= 1 && nextPage <= totalPages) {
      setPage(nextPage);
      fetchDestinations(destSearch, nextPage, limit);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    return pages.map((p) => (
      <button
        key={p}
        onClick={() => {
          setPage(p);
          fetchDestinations(destSearch, p, limit);
        }}
        className={`w-7 h-7 flex items-center justify-center text-xs font-black rounded-full border transition-all cursor-pointer ${
          p === page
            ? "bg-(--primary)/10 border-(--primary) text-(--primary)"
            : "border-(--border) hover:bg-(--bg-secondary) text-(--text-secondary)"
        }`}
      >
        {p}
      </button>
    ));
  };

  const activeList =
    activeDomain === "gmail.com" ? credentials.map((c) => c.email) : workspaces;

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalCount);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
      <div className="bg-(--bg-primary) border border-(--border) shadow-[0_10px_50px_rgba(0,0,0,0.15)] w-full max-w-[760px] rounded-[24px] overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 select-none">
          <h3 className="text-base font-extrabold text-(--text-primary) flex items-center gap-2">
            <RestoreIcon className="text-(--primary)" sx={{ fontSize: 20 }} />{" "}
            Choose Destination Mailbox
          </h3>
          <button
            onClick={onClose}
            className="text-red-500 hover:scale-110 active:scale-95 transition cursor-pointer text-sm"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Search Input & Connect More */}
        <div className="mb-4 flex gap-3 select-none">
          <div className="flex-1 relative flex items-center">
            <SearchIcon
              sx={{
                fontSize: 16,
                color: "var(--text-muted)",
                position: "absolute",
                left: 10,
              }}
            />
            <input
              type="text"
              value={destSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search mailboxes..."
              className="w-full pl-8 pr-8 py-2 text-xs border border-(--border) bg-(--bg-secondary) rounded-md text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--primary) transition-all font-semibold"
            />
            {destSearch && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) text-xs cursor-pointer font-bold select-none border-none bg-transparent"
              >
                ✕
              </button>
            )}
          </div>
          {activeDomain === "gmail.com" && (
            <button
              onClick={() => connectLogin()}
              disabled={connectLoading}
              className="px-4 py-2 bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {connectLoading ? "Connecting..." : "＋ Connect More"}
            </button>
          )}
        </div>

        {/* Tab Headers (Dynamically generated from connected domains list) */}
        {domains.length > 0 && (
          <div className="flex border-b border-(--border) mb-4 select-none overflow-x-auto gap-2">
            {domains.map((domain, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDomain(domain)}
                className={`py-2 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeDomain === domain
                    ? "border-(--primary) text-(--primary)"
                    : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
                }`}
              >
                {domain === "gmail.com" ? (
                  <>
                    <PersonIcon sx={{ fontSize: 16 }} />
                    Personal ({domain})
                  </>
                ) : (
                  <>
                    <BusinessIcon sx={{ fontSize: 16 }} />({domain})
                  </>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Destination Table */}
        <div className="flex-1 overflow-auto max-h-72 mb-4 border border-(--border) rounded-sm min-h-[180px]">
          {destLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <CircularProgress
                size={24}
                color="inherit"
                className="text-(--primary)"
              />
              <p className="text-[11px] font-bold text-(--text-muted)">
                Loading destinations...
              </p>
            </div>
          ) : activeList.length === 0 ? (
            <p className="text-[11px] font-bold text-(--text-muted) text-center py-12">
              No destination mailboxes found.
            </p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-(--bg-secondary) border-b border-(--border) select-none">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        activeList.length > 0 &&
                        activeList.every((email) => selectedEmails.has(email))
                      }
                      onChange={() => handleSelectAll(activeList)}
                      className="cursor-pointer accent-(--primary)"
                    />
                  </th>
                  <th className="p-3 font-extrabold text-(--text-muted) uppercase tracking-wider font-sans">
                    Email Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeList.map((email, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleCheckboxToggle(email)}
                    className={`border-b border-(--border)/50 hover:bg-(--bg-secondary)/45 hover:border-red-500/20 transition cursor-pointer ${
                      selectedEmails.has(email) ? "bg-(--primary)/5" : ""
                    }`}
                  >
                    <td
                      className="p-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(email)}
                        onChange={() => handleCheckboxToggle(email)}
                        className="cursor-pointer accent-(--primary)"
                      />
                    </td>
                    <td className="p-3 font-bold text-(--text-primary)">
                      {email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Premium Pagination Component Footer Bar */}
        {!destLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 border-t border-(--border) mb-6 select-none font-semibold text-xs text-(--text-secondary)">
            {/* Dynamic Indices Counter */}
            <div className="flex items-center gap-4">
              <span>
                Showing{" "}
                <span className="font-bold text-(--text-primary)">
                  {rangeStart}
                </span>{" "}
                to{" "}
                <span className="font-bold text-(--text-primary)">
                  {rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-bold text-(--text-primary)">
                  {totalCount}
                </span>{" "}
                emails
              </span>

              {/* Rows Per Page Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-(--text-muted)">
                  Show:
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 text-xs border border-(--border) bg-(--bg-secondary) rounded-md text-(--text-primary) focus:outline-none focus:border-(--primary) cursor-pointer font-bold transition-all"
                >
                  <option value={20}>20</option>
                  <option value={40}>40</option>
                  <option value={60}>60</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Circular Page Numbers & Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange("prev")}
                disabled={page <= 1}
                className="w-7 h-7 flex items-center justify-center border border-(--border) rounded-full hover:bg-(--bg-secondary) disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer select-none font-bold text-xs transition"
              >
                &lt;
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => handlePageChange("next")}
                disabled={page >= totalPages}
                className="w-7 h-7 flex items-center justify-center border border-(--border) rounded-full hover:bg-(--bg-secondary) disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer select-none font-bold text-xs transition"
              >
                &gt;
              </button>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex justify-between items-center select-none border-t border-(--border) pt-4">
          <span className="text-[11px] font-bold text-(--text-secondary) tracking-wide">
            Selected:{" "}
            <span className="text-[12px] font-black text-(--primary) font-mono">
              {selectedEmails.size}
            </span>{" "}
            mailboxes
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onRestore(Array.from(selectedEmails))}
              disabled={selectedEmails.size === 0 || restoreLoading}
              className="px-5 py-2 rounded-md bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-black transition cursor-pointer shadow-sm"
            >
              {restoreLoading ? "Restoring..." : "Proceed with Restore"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
