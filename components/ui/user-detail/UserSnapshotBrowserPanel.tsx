"use client";

import React, { useEffect, useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import CircularProgress from "@mui/material/CircularProgress";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { restoreService } from "@/services/restoreService";
import { jobService } from "@/services/jobService";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "@/components/Toast";

import {
  setGoogleAuthToken,
  setCyberLsAccessGrant,
} from "@/store/slices/restoreSlice";
import {
  GmailIcon,
  DriveIcon,
  PhotosIcon,
  ContactsIcon as CustomContactsIcon,
  CalendarIcon,
} from "@/components/ui/ServiceIcon";

import GmailContent from "./browser/GmailContent";
import DriveContent from "./browser/DriveContent";
import PhotosContent from "./browser/PhotosContent";
import ContactsContent from "./browser/ContactsContent";
import CalendarContent from "./browser/CalendarContent";

import { useVaultBrowser } from "@/hooks/useVaultBrowser";
import { projectService } from "@/services/projectService";
import { getVaultBucketForMethod } from "@/utils/vaultMapping";
import type { VaultBrowserObject } from "@/types/vault";
import RestoreDestinationModal from "./settings/RestoreDestinationModal";

type ServiceTab = "Gmail" | "Drive" | "Photos" | "Contacts" | "Calendar";

interface UserRow {
  name: string;
  domain: string;
  policy: string;
  status: string;
  email?: string;
  [key: string]: any;
}

interface UserSnapshotBrowserPanelProps {
  user: UserRow | null;
  onClose: () => void;
}

const TAB_CONFIG: { id: ServiceTab; icon: React.ReactNode; label: string }[] = [
  { id: "Gmail", icon: <GmailIcon className="w-4 h-4" />, label: "Gmail" },
  { id: "Drive", icon: <DriveIcon className="w-4 h-4" />, label: "Drive" },
  // { id: "Photos", icon: <PhotosIcon className="w-4 h-4" />, label: "Photos" },
  {
    id: "Contacts",
    icon: <CustomContactsIcon className="w-4 h-4" />,
    label: "Contacts",
  },
  {
    id: "Calendar",
    icon: <CalendarIcon className="w-4 h-4" />,
    label: "Calendar",
  },
];

export default function UserSnapshotBrowserPanel({
  user,
  onClose,
}: UserSnapshotBrowserPanelProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<ServiceTab>("Gmail");
  const [visible, setVisible] = useState(false);

  const [selections, setSelections] = useState<Record<ServiceTab, Set<string>>>(
    {
      Gmail: new Set(),
      Drive: new Set(),
      Photos: new Set(),
      Contacts: new Set(),
      Calendar: new Set(),
    },
  );

  const [restoreLoading, setRestoreLoading] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [missingScopes, setMissingScopes] = useState<string[]>([]);
  const [oauthLoading, setOauthLoading] = useState(false);

  // --- Destination Picker States ---
  const [showDestModal, setShowDestModal] = useState(false);

  const { projects } = useAppSelector((state) => state.project);

  const project_id = user?.project_id || projects[0]?.id || "";
  const login_id =
    user?.email ??
    (user
      ? `${user.name?.toLowerCase().replace(/\s+/g, ".")}${user.domain?.startsWith("@") ? "" : "@"}${user.domain?.toLowerCase()}`
      : "");
  const service = activeTab.toLowerCase();

  // ─── Vault Browser Hook and State ───
  const {
    unlock,
    listObjects,
    lock,
    getDownloadUrl,
    unlocking: vaultUnlocking,
    listing: vaultListing,
    isUnlocked,
    error: vaultError,
  } = useVaultBrowser();

  const [objects, setObjects] = useState<VaultBrowserObject[]>([]);
  const [prefix, setPrefix] = useState("");

  const bucketName = React.useMemo(
    () => getVaultBucketForMethod(activeTab) || "",
    [activeTab],
  );
  const emailPrefix = React.useMemo(() => {
    if (!login_id) return "";
    if (activeTab === "Contacts") {
      return `${login_id.toLowerCase()}/contacts/`;
    }
    return `${login_id.toLowerCase()}/`;
  }, [login_id, activeTab]);

  const loadObjects = useCallback(
    async (nextPrefix: string) => {
      if (!bucketName || !isUnlocked) return;
      try {
        const items = await listObjects(bucketName, nextPrefix);
        setObjects(items || []);
        setPrefix(nextPrefix);
      } catch (err) {
        console.error("List objects failed:", err);
      }
    },
    [bucketName, isUnlocked, listObjects],
  );

  // Fetch objects when unlocked or active tab/prefix changes
  useEffect(() => {
    if (isUnlocked && bucketName) {
      loadObjects(emailPrefix);
    } else {
      setObjects([]);
      setPrefix("");
    }
  }, [isUnlocked, bucketName, emailPrefix, loadObjects]);

  // ─── Auto Vault Unlock ───
  useEffect(() => {
    if (!user || !project_id) {
      lock();
      return;
    }

    let active = true;
    const autoUnlock = async () => {
      try {
        const config = await projectService.getProjectConfig(project_id);
        const pass = config?.passphrase || "";
        if (pass && active) {
          const result = await unlock(project_id, pass);
          if (result && result.accessGrant) {
            dispatch(setCyberLsAccessGrant(result.accessGrant));
          }
        }
      } catch (err) {
        console.error("Failed to auto unlock vault:", err);
      }
    };

    autoUnlock();

    return () => {
      active = false;
      lock();
    };
  }, [user, project_id, unlock, lock, dispatch]);

  const [pendingRestoreKeys, setPendingRestoreKeys] = useState<string[]>([]);

  // Google Login for restore (implicit flow, returns access_token)
  const googleRestoreLogin = useGoogleLogin({
    login_hint: login_id,
    prompt: "consent",
    scope:
      "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/calendar",
    onSuccess: async (tokenResponse: any) => {
      setOauthLoading(true);
      try {
        const jwtToken = await restoreService.exchangeGoogleToken(
          tokenResponse.access_token,
        );
        dispatch(setGoogleAuthToken(jwtToken));
        toast.success("Google authorization successful!");

        // Resume the pending restore if we have pending keys
        if (pendingRestoreKeys.length > 0) {
          await proceedWithRestore(pendingRestoreKeys, jwtToken);
        }
      } catch (err: any) {
        toast.error(`Exchange failed: ${err.message || err}`);
      } finally {
        setOauthLoading(false);
        setPendingRestoreKeys([]);
      }
    },
    onError: (error: any) => {
      toast.error(`Google authorization failed: ${error}`);
      setPendingRestoreKeys([]);
    },
  } as any);

  const proceedWithRestore = async (keys: string[], googleAuth: string) => {
    setRestoreLoading(true);
    // Base64-encode the item keys → ids expected by the API
    const base64Ids = keys.map((key) =>
      btoa(unescape(encodeURIComponent(key))),
    );

    try {
      let result;
      if (activeTab === "Gmail") {
        result = await restoreService.restoreGmail(googleAuth, base64Ids);
      } else if (activeTab === "Drive") {
        result = await restoreService.restoreDrive(googleAuth, base64Ids);
      } else if (activeTab === "Photos") {
        result = await restoreService.restorePhotos(googleAuth, base64Ids);
      } else if (activeTab === "Contacts") {
        result = await restoreService.restoreContacts(googleAuth, base64Ids);
      } else if (activeTab === "Calendar") {
        result = await restoreService.restoreCalendar(googleAuth, base64Ids);
      }

      toast.success(
        result?.message ||
          `Successfully started restoring selected ${activeTab} items!`,
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "";
      toast.error(errorMsg || "Restore failed");
      if (
        errorMsg.toLowerCase().includes("invalid token") ||
        errorMsg.toLowerCase().includes("auth") ||
        err.response?.status === 401
      ) {
        dispatch(setGoogleAuthToken(null));
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleRestoreItems = async (keys: string[]) => {
    if (!isUnlocked) {
      toast.error("Please unlock the vault first.");
      return;
    }
    if (keys.length === 0) return;

    setPendingRestoreKeys(keys);
    googleRestoreLogin();
  };

  const handleDownloadItem = async (key: string, name: string) => {
    try {
      const url = await getDownloadUrl(bucketName, key);
      // Fetch as blob to force browser direct download without redirecting the page
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Successfully downloaded ${name}`);
    } catch (err: any) {
      console.warn(
        "Direct blob download failed, falling back to anchor target download",
        err,
      );
      try {
        const url = await getDownloadUrl(bucketName, key);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Started downloading ${name}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to download item.");
      }
    }
  };

  const handleDownloadSelected = async () => {
    const selectedKeys = Array.from(selections[activeTab]);
    if (selectedKeys.length === 0) {
      toast.error("No items selected.");
      return;
    }
    toast.info(
      `Starting download for ${selectedKeys.length} selected item(s)...`,
    );
    for (const key of selectedKeys) {
      const name = key.split("/").pop() || "download";
      await handleDownloadItem(key, name);
    }
  };

  // ─── Dynamic Service Tab Filtering ───
  const filteredTabs = React.useMemo(() => {
    if (!user) return [];
    return TAB_CONFIG.filter((tab) => {
      const key = tab.id.toLowerCase();
      return user.services?.some((s: string) => {
        const normalized = s.toLowerCase();
        if (key === "drive")
          return normalized === "google_drive" || normalized === "drive";
        // if (key === "photos")
        //   return normalized === "google_photos" || normalized === "photos";
        if (key === "contacts")
          return normalized === "google_contacts" || normalized === "contacts";
        if (key === "calendar")
          return normalized === "google_calendar" || normalized === "calendar";
        return normalized === key;
      });
    });
  }, [user]);

  // Set default active tab from the first enabled service tab
  useEffect(() => {
    if (filteredTabs.length > 0) {
      const exists = filteredTabs.some((t) => t.id === activeTab);
      if (!exists) {
        setActiveTab(filteredTabs[0].id);
      }
    }
  }, [filteredTabs, activeTab]);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    login_hint: login_id,
    scope:
      missingScopes.length > 0
        ? ["openid", "email", "profile", ...missingScopes].join(" ")
        : "openid email profile",
    onSuccess: async (codeResponse: any) => {
      setOauthLoading(true);
      try {
        await jobService.connectGoogleBackup(codeResponse.code);
        toast.success("Permissions granted successfully!");
        setShowPermissionsModal(false);
        setTimeout(() => {
          triggerPrepareRestore();
        }, 500);
      } catch (err: any) {
        toast.error(
          `Failed to connect Google account: ${err?.response?.data?.message || err.message || err}`,
        );
      } finally {
        setOauthLoading(false);
      }
    },
    onError: (error: any) => {
      toast.error(`Google authorization failed: ${error}`);
    },
  } as any);

  const handleBulkRestore = async (selectedEmails: string[]) => {
    if (!project_id) {
      toast.error("Project ID is missing.");
      return;
    }
    setRestoreLoading(true);
    let successCount = 0;
    try {
      for (const email of selectedEmails) {
        const res = await restoreService.prepareRestoreAll({
          project_id,
          login_id: email,
          service,
        });

        if (res.ready) {
          const restoreRes = await restoreService.restoreAll({
            project_id,
            login_id: email,
            service,
          });
          successCount++;
        } else {
          if (res.reason === "no_backup_data") {
            toast.error(
              res.message ||
                `No backed-up items found for ${email} on ${activeTab}`,
            );
          } else if (res.reason === "missing_permissions") {
            const scopes = (res.missing_permissions || [])
              .map((p: any) => p.scope)
              .filter(Boolean);
            if (scopes.length > 0) {
              setMissingScopes(scopes);
              setShowPermissionsModal(true);
              setShowDestModal(false);
              break;
            } else {
              toast.error(`Missing permissions check failed for ${email}`);
            }
          } else {
            toast.error(res.message || `Preparation failed for ${email}`);
          }
        }
      }
      if (successCount > 0) {
        toast.success(
          `Successfully scheduled restore task for ${successCount} mailbox(es)!`,
        );
        setShowDestModal(false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to prepare restore.",
      );
    } finally {
      setRestoreLoading(false);
    }
  };

  const triggerPrepareRestore = async (targetEmail: string = login_id) => {
    await handleBulkRestore([targetEmail]);
  };

  // Animate in
  useEffect(() => {
    if (user) {
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [user]);

  // Reset selections when user changes
  useEffect(() => {
    if (user) {
      setSelections({
        Gmail: new Set(),
        Drive: new Set(),
        Photos: new Set(),
        Contacts: new Set(),
        Calendar: new Set(),
      });
    }
  }, [user]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // wait for slide-out animation
  };

  const handleToggleItem = (tab: ServiceTab, id: string) => {
    setSelections((prev) => {
      const nextSet = new Set(prev[tab]);
      if (nextSet.has(id)) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }
      return { ...prev, [tab]: nextSet };
    });
  };

  const handleToggleAllItems = (
    tab: ServiceTab,
    ids: string[],
    checked: boolean,
  ) => {
    setSelections((prev) => {
      const nextSet = new Set(prev[tab]);
      if (checked) {
        ids.forEach((id) => nextSet.add(id));
      } else {
        ids.forEach((id) => nextSet.delete(id));
      }
      return { ...prev, [tab]: nextSet };
    });
  };

  if (!user) return null;

  const displayEmail =
    user.email ??
    `${user.name?.toLowerCase().replace(/\s+/g, ".")}${user.domain?.toLowerCase()}`;
  const snapshotTime = (() => {
    // Map the active tab label to the service method names used in rawServices
    const tabToMethodMap: Record<string, string[]> = {
      Gmail: ["gmail"],
      Drive: ["google_drive", "drive"],
      Photos: ["google_photos", "photos"],
      Contacts: ["google_contacts", "contacts"],
      Calendar: ["google_calendar", "calendar"],
    };
    const matchMethods = tabToMethodMap[activeTab] || [];
    const rawServicesList: any[] = user.rawServices || [];
    const serviceEntry = rawServicesList.find((s: any) =>
      matchMethods.includes((s.method || "").toLowerCase()),
    );
    const raw = serviceEntry?.last_backup_at || serviceEntry?.last_run || null;
    if (!raw) return "Not yet taken";
    const date = new Date(raw);
    if (isNaN(date.getTime())) return "Not yet taken";
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return isToday
      ? `Latest (Today, ${timeStr})`
      : `Latest (${date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}, ${timeStr})`;
  })();
  const activeSelectionCount = selections[activeTab].size;

  // Active header icon mapping to screenshots
  const getHeaderIcon = (tab: ServiceTab) => {
    const className = "w-6 h-6";
    switch (tab) {
      case "Gmail":
        return <GmailIcon className={className} />;
      case "Drive":
        return <DriveIcon className={className} />;
      case "Photos":
        return <PhotosIcon className={className} />;
      case "Contacts":
        return <CustomContactsIcon className={className} />;
      case "Calendar":
        return <CalendarIcon className={className} />;
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* ── Slide-in Panel Drawer ── */}
      <div
        className="fixed right-0 top-0 z-50 h-full w-[860px] max-w-full flex flex-col shadow-2xl bg-(--bg-primary)"
        style={{
          borderLeft: "1px solid var(--border)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Upper Header (High Contrast Themed Bar) ── */}
        <div className="bg-[#0d1724] px-4 md:px-6 py-4.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Header Avatar / Graphic */}
            <div className="w-10 h-10 rounded-sm bg-(--bg-secondary) flex items-center justify-center border border-(--primary)/10 shrink-0">
              {getHeaderIcon(activeTab)}
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] md:text-[17px] font-black text-white leading-tight tracking-wide truncate">
                {user.name}
              </h2>
              <p className="text-[10px] md:text-[11px] text-gray-400 truncate font-medium mt-0.5">
                Browsing Snapshot:{" "}
                <span className="font-bold text-(--primary) hover:underline cursor-pointer font-sans">
                  {snapshotTime}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="shrink-0 rounded-sm p-1.5 bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 20, color: "#ff5d5d" }} />
          </button>
        </div>

        {/* ── Top Level Service Tabs Row ── */}
        <div className="flex items-center justify-center md:justify-start gap-1.5 px-4 md:px-6 bg-(--bg-primary) border-b border-(--border) overflow-x-auto shrink-0 scrollbar-none">
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-4 pb-3.5 pt-4 text-[10px] md:text-xs font-bold tracking-wider uppercase transition-all border-b-2 cursor-pointer select-none whitespace-nowrap ${
                  isActive
                    ? "border-(--primary) text-(--primary)"
                    : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
                }`}
              >
                {tab.icon}
                <span className="text-[10px] md:text-xs font-bold hidden md:block">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Main Tab Split Content Component ── */}
        <div className="flex-1 min-h-0 bg-(--bg-primary) overflow-hidden">
          {activeTab === "Gmail" && (
            <GmailContent
              userEmail={displayEmail}
              selectedIds={selections.Gmail}
              onToggleItem={(id) => handleToggleItem("Gmail", id)}
              objects={objects}
              loading={vaultListing || vaultUnlocking}
              prefix={prefix}
              onNavigatePrefix={loadObjects}
              onOpenFolder={loadObjects}
              onRestoreItem={(key) => handleRestoreItems([key])}
              onDownloadItem={(key, name) => handleDownloadItem(key, name)}
              getDownloadUrl={getDownloadUrl}
            />
          )}

          {activeTab === "Drive" && (
            <DriveContent
              userName={user.name}
              selectedIds={selections.Drive}
              onToggleItem={(id) => handleToggleItem("Drive", id)}
              onToggleAll={(ids, checked) =>
                handleToggleAllItems("Drive", ids, checked)
              }
              objects={objects}
              loading={vaultListing || vaultUnlocking}
              prefix={prefix}
              onNavigatePrefix={loadObjects}
              onOpenFolder={loadObjects}
              onRestoreItem={(key) => handleRestoreItems([key])}
              onDownloadItem={(key, name) => handleDownloadItem(key, name)}
            />
          )}

          {activeTab === "Photos" && (
            <PhotosContent
              userName={user.name}
              selectedIds={selections.Photos}
              onToggleItem={(id) => handleToggleItem("Photos", id)}
              objects={objects}
              loading={vaultListing || vaultUnlocking}
              prefix={prefix}
              onNavigatePrefix={loadObjects}
              onOpenFolder={loadObjects}
              onRestoreItem={(key) => handleRestoreItems([key])}
              onDownloadItem={(key, name) => handleDownloadItem(key, name)}
              getDownloadUrl={getDownloadUrl}
            />
          )}

          {activeTab === "Contacts" && (
            <ContactsContent
              userEmail={displayEmail}
              selectedIds={selections.Contacts}
              onToggleItem={(id) => handleToggleItem("Contacts", id)}
              objects={objects}
              loading={vaultListing || vaultUnlocking}
              prefix={prefix}
              onNavigatePrefix={loadObjects}
              onOpenFolder={loadObjects}
              onRestoreItem={(key) => handleRestoreItems([key])}
              onDownloadItem={(key, name) => handleDownloadItem(key, name)}
              getDownloadUrl={getDownloadUrl}
            />
          )}

          {activeTab === "Calendar" && (
            <CalendarContent
              userEmail={displayEmail}
              selectedIds={selections.Calendar}
              onToggleItem={(id) => handleToggleItem("Calendar", id)}
              objects={objects}
              loading={vaultListing || vaultUnlocking}
              prefix={prefix}
              onNavigatePrefix={loadObjects}
              onOpenFolder={loadObjects}
              onRestoreItem={(key) => handleRestoreItems([key])}
              onDownloadItem={(key, name) => handleDownloadItem(key, name)}
            />
          )}
        </div>

        {/* ── Footer Actions Bar ── */}
        <div className="px-4 md:px-6 py-4 bg-(--bg-primary) border-t border-(--border) flex flex-col md:flex-row md:items-center justify-between gap-3.5 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-(--text-secondary) tracking-wide block text-center md:text-left">
            <span className="text-[12px] font-black text-(--primary) font-mono">
              {activeSelectionCount}
            </span>{" "}
            items selected
          </span>

          <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setShowDestModal(true);
              }}
              disabled={restoreLoading}
              className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-wider px-3 py-2.5 md:px-4 md:py-2.5 border border-(--border) rounded-sm text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary) active:scale-98 transition-all cursor-pointer shadow-xs bg-(--bg-primary) w-full md:w-auto disabled:opacity-50"
            >
              {restoreLoading ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <SaveIcon
                  sx={{ fontSize: 13 }}
                  className="text-(--text-muted)"
                />
              )}
              <span className="truncate">
                {restoreLoading ? "Preparing..." : `Restore All ${activeTab}`}
              </span>
            </button>
            <button
              onClick={handleDownloadSelected}
              className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-wider px-3 py-2.5 md:px-4 md:py-2.5 border border-(--border) rounded-sm text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary) active:scale-98 transition-all cursor-pointer shadow-xs bg-(--bg-primary) w-full md:w-auto"
            >
              <DownloadIcon
                sx={{ fontSize: 13 }}
                className="text-(--text-muted)"
              />
              Download
            </button>
            <button
              onClick={() =>
                handleRestoreItems(Array.from(selections[activeTab]))
              }
              disabled={activeSelectionCount === 0}
              className={`flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest px-4.5 py-3 md:px-5 md:py-3 rounded-sm transition-all select-none col-span-2 md:col-span-1 w-full md:w-auto ${
                activeSelectionCount === 0
                  ? " bg-(--border) cursor-not-allowed "
                  : "bg-(--primary) hover:bg-(--primary-hover) hover:shadow-md cursor-pointer active:scale-98"
              }`}
            >
              Restore Selected
            </button>
          </div>
        </div>
      </div>

      {/* ── Permissions Grant Modal ── */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
          <div className="bg-(--bg-primary) border border-(--border) shadow-[0_10px_50px_rgba(0,0,0,0.15)] w-full max-w-[480px] rounded-[24px] overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-4 select-none">
              <h3 className="text-base font-extrabold text-(--text-primary) flex items-center gap-2">
                <span>🔑</span>{" "}
                {user?.account_type === "admin_workspace"
                  ? "Domain-Wide Delegation Required"
                  : "Grant Required Permissions"}
              </h3>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-red-500 hover:scale-110 active:scale-95 transition cursor-pointer text-sm"
              >
                ❌
              </button>
            </div>

            {user?.account_type === "admin_workspace" ? (
              <>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 leading-relaxed mb-4">
                  ⚠️ Ask your Google Workspace admin to authorize all restore
                  scopes in Admin Console &rarr; Domain-wide delegation
                </p>

                <div className="text-[10px] space-y-2.5 font-bold font-mono bg-(--bg-secondary)/50 p-4 rounded-md border border-(--border) mb-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <span className="text-(--text-muted) shrink-0">
                      Client ID
                    </span>
                    <span className="text-(--text-primary) font-bold select-all break-all sm:text-right">
                      112742432393142971486
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-(--text-muted) shrink-0">
                      Required Scopes
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto mt-1 p-2 bg-(--bg-primary) border border-(--border) rounded-sm text-(--text-secondary) font-bold select-all break-all text-left">
                      {missingScopes.length > 0
                        ? missingScopes.join(",")
                        : [
                            "https://www.googleapis.com/auth/gmail.insert",
                            "https://www.googleapis.com/auth/drive.file",
                            "https://www.googleapis.com/auth/calendar.events",
                            "https://www.googleapis.com/auth/contacts",
                            "https://www.googleapis.com/auth/photoslibrary.appendonly",
                          ].join(",")}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <span className="text-(--text-muted) shrink-0">Steps</span>
                    <span className="text-(--text-primary) font-bold text-left sm:text-right">
                      Security &rarr; Access and Data Controls &rarr; API
                      controls &rarr; Domain-wide delegation
                    </span>
                  </div>
                </div>

                <div className="flex justify-end select-none">
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="px-5 py-2 rounded-md bg-(--primary) hover:bg-(--primary-hover) text-white text-xs font-black transition cursor-pointer shadow-sm"
                  >
                    OK
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-(--text-muted) leading-relaxed mb-4">
                  CyberLs needs additional authorization to restore data back to
                  your Google Account. Please grant the required scopes to
                  proceed:
                </p>

                <div className="space-y-2 max-h-40 overflow-y-auto mb-6 pr-1">
                  {missingScopes.map((scope, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-(--bg-secondary) border border-(--border) rounded-md text-[11px] font-mono break-all text-(--text-primary)"
                    >
                      {scope}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 select-none">
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => googleLogin()}
                    disabled={oauthLoading}
                    className="px-5 py-2 rounded-md bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-black transition cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {oauthLoading ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Grant Access</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Destination Email Picker Modal ── */}
      <RestoreDestinationModal
        isOpen={showDestModal}
        onClose={() => setShowDestModal(false)}
        activeTab={activeTab}
        projectId={project_id}
        activeid={login_id}
        onRestore={handleBulkRestore}
        restoreLoading={restoreLoading}
      />
    </>
  );
}
