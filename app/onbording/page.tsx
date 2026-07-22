"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import ConnectAccountWizard from "@/components/ui/ConnectAccountWizard";
import Logo from "@/components/ui/Logo";

export default function AuthenticatePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleLogoutAndRedirect = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("onboarding_wizard_step");
        localStorage.removeItem("onboarding_wizard_account_type");
        localStorage.removeItem("onboarding_wizard_google_backup_data");
        localStorage.removeItem("onboarding_wizard_granted_scopes");
        localStorage.removeItem("onboarding_wizard_ungranted_scopes");
        localStorage.removeItem("onboarding_wizard_services_to_protect");
      }
      document.cookie = "_tokenKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "_onboarding_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.replace("/connect");
    };

    const checkAuthAndScope = () => {
      const localStorageUser =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const hasCookieToken =
        typeof document !== "undefined" && document.cookie.includes("_tokenKey");
      const savedUngrantedScopes =
        typeof window !== "undefined" ? localStorage.getItem("onboarding_wizard_ungranted_scopes") : null;

      if (!savedUngrantedScopes || !localStorageUser || !hasCookieToken) {
        handleLogoutAndRedirect();
        return false;
      }
      return true;
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!checkAuthAndScope()) {
        // Redirection handled
      } else if (event.persisted) {
        window.location.reload();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", handlePageShow);
    }

    checkAuthAndScope();

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pageshow", handlePageShow);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-(--bg-secondary) items-center justify-center">
        <div className="animate-spin border-4 border-(--primary) border-t-transparent w-8 h-8 rounded-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-secondary)">
      {/* <nav className="w-full h-16 px-6 border-b border-[#0C1B30] bg-[#000D1A] flex items-center justify-center">
        <Link href="/" className="flex items-center cursor-pointer">
          <Logo className="h-8 w-auto" />
        </Link>
      </nav> */}

      <main className="flex-1 flex items-center justify-center p-0 sm:p-6 md:p-12 overflow-hidden">
        <ConnectAccountWizard isSignup={true} initialStep={1} />
      </main>
    </div>
  );
}
