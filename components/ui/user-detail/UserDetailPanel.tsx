"use client";

import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import AppsIcon from "@mui/icons-material/Apps";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyIcon from "@mui/icons-material/Key";
import ShareIcon from "@mui/icons-material/Share";

import OverviewTab from "./settings/OverviewTab";
import ServicesTab from "./settings/ServicesTab";
import ScheduleTab from "./settings/ScheduleTab";
import CredentialsTab from "./settings/CredentialsTab";
import SharingTab from "./settings/SharingTab";
import toast from "@/components/Toast";
import { useAppDispatch } from "@/store/hooks";
import { updateJob } from "@/store/slices/jobSlice";
import { useReauthenticate } from "@/hooks/useReauthenticate";

type DetailTab =
  | "Overview"
  | "Services"
  | "Schedule"
  | "Credentials"
  | "Sharing";

interface UserRow {
  id: string;
  name: string;
  domain: string;
  policy: string;
  status: string;
  email?: string;
  account_type?: string;
  services: string[];
  rawServices?: any[];
  credential_status?: string;
  last_run?: string;
  last_backup?: string;
  next_backup?: string;
  paused: boolean;
  [key: string]: any;
}

interface UserDetailPanelProps {
  user: UserRow | null;
  onClose: () => void;
  onUpdate?: (updatedUser: any) => void;
  onConnectAccount?: () => void;
}

const TAB_CONFIG: { id: DetailTab; icon: React.ReactNode; label: string }[] = [
  // {
  //   id: "Overview",
  //   icon: <InfoIcon sx={{ fontSize: 16 }} />,
  //   label: "Overview",
  // },
  {
    id: "Services",
    icon: <AppsIcon sx={{ fontSize: 16 }} />,
    label: "Services",
  },
  {
    id: "Schedule",
    icon: <CalendarMonthIcon sx={{ fontSize: 16 }} />,
    label: "Schedule",
  },
  {
    id: "Credentials",
    icon: <KeyIcon sx={{ fontSize: 16 }} />,
    label: "Credentials",
  },
  // {
  //   id: "Sharing",
  //   icon: <ShareIcon sx={{ fontSize: 16 }} />,
  //   label: "Sharing",
  // },
];

export default function UserDetailPanel({
  user,
  onClose,
  onUpdate,
  onConnectAccount,
}: UserDetailPanelProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<DetailTab>("Services");
  const [visible, setVisible] = useState(false);

  const displayEmail = user?.email || "";

  const { reauthenticate } = useReauthenticate(() => {
    if (onUpdate && user) {
      onUpdate({
        ...user,
      });
    }
  });

  // Configuration States matching the user row
  const [active, setActive] = useState(true);
  const [services, setServices] = useState<string[]>([]);

  // Animate in/out
  useEffect(() => {
    if (user) {
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [user]);

  // Sync state with selected user
  useEffect(() => {
    if (user) {
      if (user.credential_status === "re_auth_required") {
        setActiveTab("Credentials");
      } else {
        setActiveTab("Services");
      }
      setActive(!user.paused);
      setServices(user.services || []);
    }
  }, [user]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // wait for slide-out animation
  };

  const handleToggleActive = async (nextActive: boolean) => {
    if (!user) return;
    setActive(nextActive);

    // Call update API or dispatch update thunk
    const userId = user.id || user.job_id;
    if (userId) {
      try {
        await dispatch(
          updateJob({ id: userId, data: { active: nextActive } }),
        ).unwrap();
        toast.success(
          `Backup ${nextActive ? "resumed" : "paused"} successfully.`,
        );

        if (onUpdate) {
          onUpdate({
            ...user,
            paused: !nextActive,
          });
        }
      } catch (err: any) {
        toast.error(
          `Failed to update backup status: ${err || "Unknown error"}`,
        );
        setActive(!nextActive); // revert state
      }
    } else {
      // Mock fallback update
      toast.success(
        `Mock: Backup status set to ${nextActive ? "Active" : "Paused"}`,
      );
      if (onUpdate) {
        onUpdate({
          ...user,
          paused: !nextActive,
        });
      }
    }
  };

  const handleToggleService = async (serviceId: string) => {
    if (!user) return;

    const normalizeServiceId = (id: string): string => {
      const clean = id.toLowerCase().replace(/-/g, "_");
      if (clean === "drive" || clean === "google_drive") return "google_drive";
      // if (clean === "photos" || clean === "photo" || clean === "google_photos") return "google_photos";
      if (
        clean === "contacts" ||
        clean === "contact" ||
        clean === "google_contacts"
      )
        return "google_contacts";
      if (
        clean === "calendar" ||
        clean === "calender" ||
        clean === "google_calendar"
      )
        return "google_calendar";
      return clean;
    };

    const targetService = normalizeServiceId(serviceId);
    if (targetService === "gmail") return; // Gmail is required

    const rawServicesList = user.rawServices || [];
    const serviceEntry = rawServicesList.find(
      (s: any) => normalizeServiceId(s.method) === targetService,
    );

    if (
      !serviceEntry ||
      serviceEntry.job_id === undefined ||
      serviceEntry.job_id === null
    ) {
      toast.error("Could not find service job ID.");
      return;
    }

    const targetJobId = serviceEntry.job_id;
    const currentActive =
      serviceEntry.active !== false && serviceEntry.connected === true;
    const nextActive = !currentActive;

    try {
      await dispatch(
        updateJob({ id: targetJobId, data: { active: nextActive } }),
      ).unwrap();
      toast.success("Sync service updated successfully.");

      // Calculate new services array
      let nextServices = services.map(normalizeServiceId);
      if (nextActive) {
        if (!nextServices.includes(targetService)) {
          nextServices.push(targetService);
        }
      } else {
        nextServices = nextServices.filter((s) => s !== targetService);
      }
      setServices(nextServices);

      if (onUpdate) {
        const updatedRawServices = rawServicesList.map((s: any) => {
          if (normalizeServiceId(s.method) === targetService) {
            return { ...s, active: nextActive };
          }
          return s;
        });

        onUpdate({
          ...user,
          services: nextServices,
          rawServices: updatedRawServices,
        });
      }
    } catch (err: any) {
      toast.error(`Failed to update service status: ${err || "Unknown error"}`);
    }
  };

  const handleFullRestore = () => {
    if (!user) return;
    toast.info(`Restoring all backups for ${user.name}...`);
    handleClose();
  };

  if (!user) return null;

  const isCorporate = user.account_type === "corporate";

  return (
    <>
      {/* backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* slide-in drawer */}
      <div
        className="fixed right-0 top-0 z-50 h-full w-[640px] max-w-full flex flex-col shadow-2xl bg-(--bg-primary)"
        style={{
          borderLeft: "1px solid var(--border)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header section */}
        <div className="bg-[#0d1724] px-5 py-5 flex items-center justify-between shadow-md shrink-0 select-none">
          <div className="flex flex-col min-w-0">
            <h2 className="text-[17px] font-black text-white leading-tight tracking-wide truncate">
              {user.name}
            </h2>
            <p className="text-[11px] text-[#8a94a6] truncate font-medium mt-0.5">
              {displayEmail}
            </p>
            <div className="mt-2.5">
              <span
                className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black tracking-widest uppercase border ${
                  isCorporate
                    ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                    : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                }`}
              >
                {isCorporate ? "Corporate" : "Individual"}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="shrink-0 rounded-sm p-1.5 bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 20, color: "#ff5d5d" }} />
          </button>
        </div>

        {/* Tab row (horizontal layout matching screenshots) */}
        <div className="flex items-center justify-center md:justify-start gap-1.5 px-5 bg-(--bg-primary) border-b border-(--border) overflow-x-auto shrink-0 scrollbar-none select-none">
          {user.credential_status === "re_auth_required" ? (
            <button
              className="flex items-center gap-1.5 px-3 pb-3.5 pt-4 text-[10px] sm:text-xs font-bold tracking-wider uppercase border-b-2 border-(--primary) text-(--primary) cursor-default"
            >
              {TAB_CONFIG[2].icon}
              <span className="hidden md:block">{TAB_CONFIG[2].label}</span>
            </button>
          ) : (
            TAB_CONFIG.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 pb-3.5 pt-4 text-[10px] sm:text-xs font-bold tracking-wider uppercase border-b-2 cursor-pointer transition-all ${
                    isActive
                      ? "border-(--primary) text-(--primary)"
                      : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:block">{tab.label}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Dynamic Tab Views */}
        <div className="flex-1 min-h-0 bg-(--bg-primary) overflow-hidden">
          {activeTab === "Overview" && (
            <OverviewTab
              active={active}
              lastBackup={user.last_run || user.last_backup || "Never"}
              nextBackup={user.next_backup || "Suspended"}
              onToggleActive={handleToggleActive}
              onRestore={handleFullRestore}
            />
          )}

          {activeTab === "Services" && (
            <ServicesTab
              services={services}
              onToggleService={handleToggleService}
              rawServices={user.rawServices}
              onConnectAccount={onConnectAccount}
            />
          )}

          {activeTab === "Schedule" && (
            <ScheduleTab rawServices={user.rawServices || []} />
          )}

          {activeTab === "Credentials" && (
            <CredentialsTab
              userReAuthRequired={user.credential_status === "re_auth_required"}
              onReauthenticate={() =>
                reauthenticate(displayEmail, user?.services || [], user?.project_id)
              }
            />
          )}

          {activeTab === "Sharing" && <SharingTab />}
        </div>
      </div>
    </>
  );
}
