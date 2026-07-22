"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjects } from "@/store/slices/projectSlice";
import SideBarDashbord from "../ui/SideBarDashbord";
import DashboardHeader from "../ui/DashboardHeader";
import {
  useFCMRegistration,
  useFCMManualRegister,
  getNotificationPermission,
} from "@/hooks/useFCM";
import { useRestoreLive } from "@/hooks/useRestoreLive";
import toast from "@/components/Toast";
import { fcmService } from "@/services/fcmService";
import { configService } from "@/services/configService";
import { setCsrfToken } from "@/services/apiClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFcmPopup, setShowFcmPopup] = useState(false);

  // Silently register this browser for push notifications if permission is already granted
  useFCMRegistration();
  const { register: registerFcmDevice } = useFCMManualRegister();

  // Poll /restore/live every 10s to track active restore jobs globally
  const { activeJobCount } = useRestoreLive();

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    configService
      .getConfig()
      .then((cfg) => {
        if (cfg.csrfToken) {
          setCsrfToken(cfg.csrfToken);
        }
      })
      .catch((err) => {
        console.error("Failed to load config on DashboardLayout mount:", err);
      });

    const handlePageShow = (event: PageTransitionEvent) => {
      const hasCookieToken =
        typeof document !== "undefined" &&
        document.cookie.includes("_tokenKey");
      const hasLocalUser =
        typeof window !== "undefined" && localStorage.getItem("user");
      if (!hasCookieToken || !hasLocalUser) {
        window.location.replace("/connect");
      } else if (event.persisted) {
        window.location.reload();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", handlePageShow);
    }

    let timerId: NodeJS.Timeout;

    const checkFcmRegistration = async () => {
      if (typeof window === "undefined") return;
      try {
        const permission = getNotificationPermission();

        const dismissedVal = localStorage.getItem("fcm_prompt_dismissed");
        let isDismissed = false;
        if (dismissedVal) {
          if (dismissedVal === "true") {
            isDismissed = true;
          } else {
            const dismissedTime = parseInt(dismissedVal, 10);
            if (!isNaN(dismissedTime)) {
              if (Date.now() - dismissedTime < 86400000) {
                isDismissed = true;
              } else {
                localStorage.removeItem("fcm_prompt_dismissed");
              }
            }
          }
        }

        if (permission === "default" && !isDismissed) {
          const devices = await fcmService.getDevices();
          if (devices && devices.length === 0) {
            timerId = setTimeout(() => {
              setShowFcmPopup(true);
            }, 1500);
          }
        }
      } catch (err) {
        console.error("Failed to check FCM registration on mount:", err);
      }
    };

    checkFcmRegistration();

    return () => {
      if (timerId) clearTimeout(timerId);
      if (typeof window !== "undefined") {
        window.removeEventListener("pageshow", handlePageShow);
      }
    };
  }, []);

  useEffect(() => {
    if (mounted && user) {
      dispatch(fetchProjects());
    }
  }, [mounted, user, dispatch]);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!user) {
      window.location.replace("/connect");
      return;
    }

    const getOnboardingStatusCookie = () => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(/(?:^|; )_onboarding_status=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : null;
    };

    const onboardingCookie = getOnboardingStatusCookie();
    const onboardingStatus =
      onboardingCookie ||
      user?.onboarding_status ||
      user?.googleBackup?.onboarding_status ||
      user?.onboarding?.onboarding_status;

    if (onboardingStatus === "pending") {
      window.location.replace("/connect");
      return;
    }
  }, [mounted, loading, user]);

  if (!mounted || loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-(--bg-app)">
        <div className="w-12 h-12 border-4 border-(--primary) rounded-full border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-(--text-muted) animate-pulse uppercase tracking-wider">
          Verifying Session Security...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-app) font-dashboard">
      <SideBarDashbord
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onToggleSidebar={handleToggleSidebar}
          activeRestoreJobs={activeJobCount}
        />

        <main className="flex-1 overflow-y-auto bg-(--bg) p-4 md:p-6">
          {children}
        </main>
      </div>

      {showFcmPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
          <div className="bg-(--bg-primary) border border-(--border) shadow-[0_10px_50px_rgba(0,0,0,0.15)] w-full max-w-[400px] rounded-[24px] overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-4 select-none">
              <h3 className="text-base font-extrabold text-(--text-primary) flex items-center gap-2">
                <span>🔔</span> Enable Push Notifications
              </h3>
              <button
                onClick={() => {
                  setShowFcmPopup(false);
                  localStorage.setItem(
                    "fcm_prompt_dismissed",
                    Date.now().toString(),
                  );
                }}
                className="text-red-500 hover:scale-110 active:scale-95 transition cursor-pointer text-sm"
              >
                ❌
              </button>
            </div>

            <p className="text-xs font-semibold text-(--text-muted) leading-relaxed mb-6">
              Stay updated with real-time automatic backup status, service
              reports, and system alerts. You can change this anytime in your
              settings.
            </p>

            <div className="flex justify-end gap-3 select-none">
              <button
                onClick={() => {
                  setShowFcmPopup(false);
                  localStorage.setItem(
                    "fcm_prompt_dismissed",
                    Date.now().toString(),
                  );
                }}
                className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                onClick={async () => {
                  setShowFcmPopup(false);
                  try {
                    const result = await registerFcmDevice();
                    if (result.success) {
                      toast.success(result.message);
                    } else {
                      toast.error(result.message);
                      localStorage.setItem(
                        "fcm_prompt_dismissed",
                        Date.now().toString(),
                      );
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="px-4 py-2 rounded-md bg-(--primary) text-(--text-inverse) text-xs font-bold hover:bg-(--primary-hover) transition cursor-pointer shadow-sm"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
