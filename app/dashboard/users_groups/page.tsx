"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsersGroups, fetchDomains } from "@/store/slices/userSlice";
import { TableColumn } from "@/components/ui/TableCompoenets";
import TableWithPagination from "@/components/layout/TableWithPagination";
import UserDetailPanel from "@/components/ui/user-detail/UserDetailPanel";
import UserSnapshotBrowserPanel from "@/components/ui/user-detail/UserSnapshotBrowserPanel";
import ConnectAccountModal from "@/components/ui/user-detail/ConnectAccountModal";
import toast from "@/components/Toast";
import { jobService } from "@/services/jobService";
import MovePolicyModal from "@/components/ui/autoSync/MovePolicyModal";
import { createPolicy, moveAssignments } from "@/store/slices/policySlice";
import { useReauthenticate } from "@/hooks/useReauthenticate";
import { useSearchParams } from "next/navigation";
import {
  FILTER_TABS,
  FilterTab,
  getCorporateTableColumns,
} from "@/utils/constants/user_details_constant";

export default function UsersGroupsPage() {
  const dispatch = useAppDispatch();
  const { usersGroupsData, domains, loading, error } = useAppSelector(
    (state) => state.user,
  );

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedSnapshotUser, setSelectedSnapshotUser] = useState<any | null>(
    null,
  );
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isMovePolicyModalOpen, setIsMovePolicyModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectUser = useCallback((user: any) => {
    setSelectedUser(user);
    if (user) {
      setSelectedSnapshotUser(null);
    }
  }, []);

  const handleSelectSnapshotUser = useCallback((user: any) => {
    setSelectedSnapshotUser(user);
    if (user) {
      setSelectedUser(null);
    }
  }, []);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as FilterTab;

  // Top tabs filter state: All, Corporate, Individual, Auth Errors
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>("All");

  useEffect(() => {
    if (tabParam && FILTER_TABS.includes(tabParam)) {
      setActiveFilterTab(tabParam);
    }
  }, [tabParam]);

  // Selection tracking using React state (matches auto-sync-policies pattern)
  const [checkedUsers, setCheckedUsers] = useState<Record<string, boolean>>({});

  // Map API entities to UI required structure
  const mappedUsers = (usersGroupsData?.entities || []).map(
    (entity: any, index: number) => {
      const services =
        entity.services
          ?.filter((s: any) => s.connected)
          .map((s: any) => s.method) || [];
      const rawServices = entity.services || [];

      const email = entity.email || entity.input_data?.email || "";
      const domain = email
        ? `@${email.split("@")[1]?.toUpperCase()}`
        : "@UNKNOWN.COM";

      let displayName = entity.name || email.split("@")[0] || "Workspace User";
      displayName = displayName
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      const account_type = entity.account_type || "";
      const connectedService = entity.services?.find(
        (s: any) => s.connected && s.policy_id,
      );
      const policyId = connectedService?.policy_id;
      const policy =
        connectedService?.policy_name ||
        (policyId ? `Policy #${policyId}` : "");

      const credential_status = entity.credential_status || "";
      const last_run = entity.last_run || "";
      const next_backup = entity.next_backup || "";

      const connectedServices =
        entity.services?.filter((s: any) => s.connected) || [];
      const hasConnectedServices = connectedServices.length > 0;
      const paused =
        entity.paused !== undefined
          ? entity.paused
          : entity.active !== undefined
            ? !entity.active
            : hasConnectedServices
              ? connectedServices.every((s: any) => s.active === false)
              : true;

      return {
        ...entity,
        id: entity.id || entity.job_id || email || `job-${index}`,
        name: displayName,
        email,
        domain,
        services,
        rawServices,
        account_type,
        policy,
        interval: connectedService?.interval || "",
        on: connectedService?.on || "",
        retention_type: connectedService?.retention_type || "",
        credential_status,
        last_run,
        next_backup,
        status: "Protected",
        paused,
      };
    },
  );

  // Render mapped users directly (API-driven filtering)
  const filteredUsers = mappedUsers;

  // Checkbox Selection helpers
  const checkedCount = useMemo(() => {
    return Object.values(checkedUsers).filter(Boolean).length;
  }, [checkedUsers]);

  const selectedRows = useMemo(() => {
    return filteredUsers.filter((u) => checkedUsers[u.id]);
  }, [filteredUsers, checkedUsers]);

  const { reauthenticate } = useReauthenticate(() => {
    setCheckedUsers({});
    setRefreshKey((prev) => prev + 1);
  });

  const allVisibleChecked = useMemo(
    () =>
      filteredUsers.length > 0 &&
      filteredUsers.every((u) => checkedUsers[u.id]),
    [filteredUsers, checkedUsers],
  );

  const isPartiallyChecked = useMemo(() => {
    const visibleChecked = filteredUsers.filter(
      (u) => checkedUsers[u.id],
    ).length;
    return visibleChecked > 0 && visibleChecked < filteredUsers.length;
  }, [filteredUsers, checkedUsers]);

  const handleToggleSelectAll = () => {
    const next = !allVisibleChecked;
    const updated = { ...checkedUsers };
    filteredUsers.forEach((u) => {
      updated[u.id] = next;
    });
    setCheckedUsers(updated);
  };

  const handleBulkToggleActive = async (active: boolean) => {
    const jobIds = Array.from(
      new Set(
        selectedRows
          .flatMap((row) => row.rawServices || [])
          .map((s: any) => s.job_id)
          .filter((id: any) => id !== undefined && id !== null),
      ),
    );

    if (jobIds.length === 0) {
      toast.warning("No backup jobs found for the selected accounts.");
      return;
    }

    const actionText = active ? "resuming" : "pausing";
    const actionTextCap = active ? "Resume" : "Pause";

    toast.info(`${actionTextCap}ing backups for selected accounts...`);

    try {
      await jobService.toggleMultipleJobsActive(jobIds, active);
      toast.success(`Backups ${active ? "resumed" : "paused"} successfully.`);
      setCheckedUsers({});
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      console.error(`Failed to ${actionText} backups:`, err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${actionText} backups`;
      toast.error(errMsg);
    }
  };

  const handleAssignPolicyConfirm = (destination: {
    type: "existing" | "new";
    value: string | number;
  }) => {
    if (selectedRows.length === 0) return;

    const jobIds = Array.from(
      new Set(
        selectedRows
          .flatMap((row) => row.rawServices || [])
          .map((s: any) => s.job_id)
          .filter((id: any) => id !== undefined && id !== null),
      ),
    );

    if (jobIds.length === 0) {
      toast.error("No service jobs found for selected accounts.");
      return;
    }

    if (destination.type === "new") {
      dispatch(
        createPolicy({
          name: String(destination.value),
          interval: "nightly",
          on: "12am",
          retention_type: "never",
          job_ids: jobIds,
        }),
      ).then((res: any) => {
        if (res.meta.requestStatus === "fulfilled") {
          setCheckedUsers({});
          setRefreshKey((prev) => prev + 1);
        }
      });
    } else {
      dispatch(
        moveAssignments({
          job_ids: jobIds,
          target_policy_id: Number(destination.value),
        }),
      ).then((res: any) => {
        if (res.meta.requestStatus === "fulfilled") {
          setCheckedUsers({});
          setRefreshKey((prev) => prev + 1);
        }
      });
    }
  };

  const handleToggleRow = (userId: string) => {
    setCheckedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const corporateTableHead = useMemo<TableColumn[]>(
    () =>
      getCorporateTableColumns({
        handleToggleSelectAll,
        allVisibleChecked,
        isPartiallyChecked,
        checkedUsers,
        handleToggleRow,
        setSelectedUser: handleSelectUser,
      }),
    [
      checkedUsers,
      allVisibleChecked,
      isPartiallyChecked,
      handleToggleSelectAll,
      handleToggleRow,
      handleSelectUser,
    ],
  );

  const lastFetchedRef = useRef<string>("");

  useEffect(() => {
    dispatch(fetchDomains());
  }, [dispatch]);

  // Fetch users groups whenever filters, pagination, activeFilterTab or refreshKey changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const offset = (page - 1) * limit;
      const filterStr = JSON.stringify({
        selectedDomain,
        searchQuery,
        selectedMethod,
        activeFilterTab,
        limit,
        offset,
        refreshKey,
      });

      if (lastFetchedRef.current === filterStr) {
        return;
      }
      lastFetchedRef.current = filterStr;

      let account_type: string | undefined;
      let credential_status: string | undefined;
      let paused: boolean | undefined;

      if (activeFilterTab === "Corporate") {
        account_type = "corporate";
      } else if (activeFilterTab === "Individual") {
        account_type = "individual";
      } else if (activeFilterTab === "Auth Errors") {
        credential_status = "re_auth_required";
      } else if (activeFilterTab === "Paused") {
        paused = true;
      }

      dispatch(
        fetchUsersGroups({
          domain: selectedDomain,
          search: searchQuery,
          method: selectedMethod,
          limit,
          offset,
          account_type,
          credential_status,
          paused,
        }),
      );
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    dispatch,
    searchQuery,
    selectedDomain,
    selectedMethod,
    activeFilterTab,
    page,
    limit,
    refreshKey,
  ]);

  const { total_pages, page: currentPage } = usersGroupsData?.pagination || {
    total_pages: 1,
    page: 1,
  };

  return (
    <div className="h-[calc(100vh+110px)] md:h-[calc(100vh-120px)] flex flex-col gap-4 text-(--text-primary) overflow-hidden pb-1">
      {/* HEADER TOP BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 select-none shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary) tracking-tight">
            Connected Accounts
          </h1>
          <p className="text-xs text-(--text-muted) mt-0.5 font-medium">
            All protected Google mailboxes — corporate and individual.
          </p>
        </div>

        {/* RIGHT ACTIONS (CHECKBOX BULK OPERATIONS OR DEFAULT CONNECT ACCOUNT) */}
        <div className="flex flex-wrap items-center gap-3">
          {checkedCount > 0 && (
            <div className="flex items-center gap-3 bg-(--bg-secondary) border border-(--border) p-1 px-3 rounded-sm shadow-sm animate-fade-in">
              <span className="text-xs font-bold text-(--text-secondary) whitespace-nowrap">
                {checkedCount} selected
              </span>
              <button
                onClick={() => setIsMovePolicyModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold bg-(--bg-primary) border border-(--border) rounded-md text-(--text-primary) hover:bg-(--border-light) transition cursor-pointer select-none"
              >
                Assign Policy
              </button>
            </div>
          )}

          {/* CONNECT NEW ACCOUNT BUTTON */}
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 bg-(--secondary) text-(--text-inverse) hover:bg-(--secondary-hover) rounded-sm transition shadow-sm cursor-pointer select-none"
          >
            ➕ Connect Account
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto select-none shrink-0 scrollbar-none pb-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilterTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveFilterTab(tab);
                setPage(1);
              }}
              className={`px-4.5 py-1.5 rounded-sm text-xs font-bold border transition cursor-pointer select-none whitespace-nowrap ${
                isActive
                  ? "bg-teal-500/10 text-teal-600 border-teal-500/30 font-black"
                  : "bg-(--bg-primary) text-(--text-secondary) border-(--border) hover:bg-(--bg-secondary)"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* SINGLE WRAPPER (SEARCH + TABLE TOGETHER IN CARD) */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-[6px] overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        {/* SEARCH & FILTERS BAR */}
        <div className="p-4 border-b border-(--border) flex flex-col md:flex-row gap-3 shrink-0">
          <input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // reset to first page on search
            }}
            className="flex-1 px-4 py-2 text-sm border border-(--border) rounded-[4px] bg-(--bg-primary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--border) w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0 w-full md:w-auto">
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                setPage(1);
              }}
              className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--border)"
            >
              <option value="">All Domains/Accounts</option>
              {Array.isArray(domains) &&
                domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
            </select>

            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setPage(1);
              }}
              className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-(--text-primary) border border-(--border) rounded-[4px] bg-(--bg-primary) cursor-pointer hover:border-(--border)"
            >
              <option value="all_services">All Services</option>
              <option value="gmail">Gmail</option>
              <option value="google_drive">Google Drive</option>
              {/* <option value="google_photos">Google Photos</option> */}
              <option value="google_contacts">Google Contacts</option>
              <option value="google_calendar">Google Calendar</option>
            </select>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-medium flex items-center justify-between shrink-0">
            <span>⚠️ API Error: {error}</span>
            <button
              onClick={() => setPage(1)} // retries
              className="px-2 py-1 bg-white border border-rose-200 rounded-[4px] text-rose-700 hover:bg-rose-50 active:scale-95 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* DYNAMIC TABLE OR PROGRESS LOADING BAR */}
        <div className="flex-1 flex flex-col min-h-0">
          {loading && filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 bg-(--bg-primary)">
              <div className="w-10 h-10 border-4 border-teal-500 rounded-md border-t-transparent animate-spin mb-4" />
              <p className="text-xs font-bold text-(--text-muted) animate-pulse tracking-wide uppercase">
                Loading Google Workspace Sync Jobs...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 bg-(--bg-primary)">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm font-black text-(--text-primary)">
                No Users or Groups Found
              </p>
              <p className="text-xs text-(--text-muted) mt-1 text-center">
                Try adjusting your search queries or dropdown filters.
              </p>
            </div>
          ) : (
            <TableWithPagination
              thead={corporateTableHead}
              tbody={filteredUsers}
              clickable
              onRowClick={handleSelectSnapshotUser}
              currentPage={currentPage}
              totalPages={total_pages}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              maxHeight="100%"
              checkboxSelection={false}
              totalCount={usersGroupsData?.pagination?.total_count}
            />
          )}
        </div>
      </div>

      {/* SLIDE-IN USER DETAIL PANEL (SETTINGS) */}
      <UserDetailPanel
        user={selectedUser}
        onClose={() => handleSelectUser(null)}
        onUpdate={(updated) => {
          handleSelectUser(updated);
          setRefreshKey((prev) => prev + 1); // refresh list live
        }}
        onConnectAccount={() => setIsConnectModalOpen(true)}
      />

      {/* SLIDE-IN SNAPSHOT FILE BROWSER PANEL */}
      <UserSnapshotBrowserPanel
        user={selectedSnapshotUser}
        onClose={() => handleSelectSnapshotUser(null)}
      />

      {/* CONNECT NEW ACCOUNT MODAL */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onComplete={() => {
          setRefreshKey((prev) => prev + 1);
          toast.success("Job created successfully!");
        }}
      />

      {/* BULK ASSIGN POLICY MODAL */}
      {isMovePolicyModalOpen && (
        <MovePolicyModal
          currentPolicyName="Selected Accounts"
          selectedCount={checkedCount}
          onClose={() => setIsMovePolicyModalOpen(false)}
          onMove={handleAssignPolicyConfirm}
        />
      )}
    </div>
  );
}
