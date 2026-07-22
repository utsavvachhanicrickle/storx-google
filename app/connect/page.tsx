"use client"

import Link from "next/link";
import GoogleButton from "@/components/ui/GoogleButton";
import toast from "@/components/Toast";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginSlice, logoutSlice } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "@/components/ui/Logo";
import { configService } from "@/services/configService";
import { setCsrfToken } from "@/services/apiClient";
import { authService } from "@/services/authService";
import PasswordInput from "@/components/ui/PasswordInput";
import { validatePassword } from "@/utils/passwordValidation";

export default function SigninPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [csrfLoaded, setCsrfLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    configService.getConfig()
      .then((cfg) => {
        if (cfg.csrfToken) {
          setCsrfToken(cfg.csrfToken);
        }
        setCsrfLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load config on mount:", err);
        setCsrfLoaded(true);
      });

    // Prevent back navigation after logout
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (mounted && user) {
      const onboardingStatus =
        user?.onboarding_status ||
        user?.googleBackup?.onboarding_status ||
        user?.onboarding?.onboarding_status;
      
      const onboardingEnd = user?.onboarding?.onboardingEnd;

      // Only auto-redirect if onboarding is already completed or if they are NOT pending onboarding.
      // If onboarding is pending, we want them to have the option to Set Password on this page first.
      if (onboardingEnd !== false && onboardingStatus !== "pending") {
        router.replace("/dashboard");
      }
    }
  }, [user, router, mounted]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) return;

    try {
      setLoading(true);
      await authService.setPassword(newPassword);
      toast.success("Password set successfully!");
      router.push("/onbording");
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.warning("Password is already set.");
        router.push("/onbording");
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to set password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPassword = () => {
    router.push("/onbording");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-(--bg-secondary) items-center justify-center">
        <div className="animate-spin border-4 border-(--primary) border-t-transparent w-8 h-8 rounded-md" />
      </div>
    );
  }

  const isOnboardingPending =
    user &&
    (user?.onboarding?.onboardingEnd === false ||
      (user?.onboarding_status ||
        user?.googleBackup?.onboarding_status ||
        user?.onboarding?.onboarding_status) === "pending");

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-secondary) justify-between">
      {/* <nav className="w-full h-16 px-6 border-b border-[#0C1B30] bg-[#000D1A] flex items-center justify-center">
        <Link href="/" className="flex items-center cursor-pointer">
          <Logo className="h-8 w-auto" />
        </Link>
      </nav> */}

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-(--bg-primary) rounded-md shadow-xl border border-(--border) p-8 sm:p-12 text-center">
          <div className="flex items-center justify-center mx-auto mb-6">
            <Link href="/" className="flex items-center cursor-pointer">
              <Logo onlyIcon className="w-30 h-30 rounded-3xl" />
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-(--text-primary) mb-3">
            {user ? "Authenticated" : "Welcome Back"}
          </h2>

          <p className="text-(--text-secondary) mb-8">
            {user
              ? "You are currently signed in."
              : "Sign in to your CyberLS corporate admin console."}
          </p>

          {user ? (
            <div className="space-y-6">
              <div className="p-4 bg-(--bg-secondary) rounded-sm border border-(--border) flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-(--primary)/10 text-(--primary) flex items-center justify-center font-bold text-lg select-none">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-xs text-(--text-muted) font-bold uppercase tracking-wider">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-(--text-primary) mt-0.5">
                    {user.email || user.googleBackup?.email}
                  </p>
                  {user.googleBackup?.account_type && (
                    <span className="mt-1.5 inline-block rounded-sm bg-(--primary)/10 px-2.5 py-0.5 text-[10px] font-bold text-(--primary) uppercase tracking-wider">
                      {user.googleBackup.account_type} Account
                    </span>
                  )}
                </div>
              </div>

              {isOnboardingPending ? (
                <div className="p-4 border border-(--border) rounded-md bg-(--bg-secondary)/50 text-left space-y-4">
                  <h3 className="text-sm font-bold text-(--text-primary) text-center">Set Your Account Password</h3>
                  <p className="text-xs text-(--text-muted) leading-relaxed">
                    Would you like to set a password for email & password login? You can also skip this and complete onboarding now.
                  </p>
                  <form onSubmit={handleSetPassword} className="space-y-3">
                    <PasswordInput
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="Password (8-64 characters)"
                      containerClassName=""
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-(--primary) text-white font-bold rounded-md hover:bg-(--primary-hover) text-xs transition-colors cursor-pointer"
                      >
                        {loading ? "Setting..." : "Set Password"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSkipPassword}
                        className="flex-1 py-2 border border-(--border) text-(--text-primary) font-bold rounded-md hover:bg-(--bg-secondary) text-xs transition-colors cursor-pointer"
                      >
                        Skip
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="w-full py-2.5 bg-(--primary) text-white font-bold rounded-sm hover:bg-(--primary-hover) text-center text-sm transition-colors cursor-pointer block"
                  >
                    Go to Dashboard
                  </Link>

                  <button
                    onClick={() => dispatch(logoutSlice())}
                    className="w-full py-2.5 border border-(--border) text-(--text-primary) font-bold rounded-sm hover:bg-(--bg-secondary) text-center text-sm transition-colors cursor-pointer hover:border-(--border-strong)"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <GoogleButton
                onSuccess={async (code) => {
                  try {
                    setLoading(true);
                    const loggedInUser = await dispatch(
                      loginSlice(code),
                    ).unwrap();

                    // Extract and cache scopes for the onboarding checks
                    const extractScopesInline = (source: any) => {
                      if (!source) return { granted: [], ungranted: [] };
                      let granted = source.granted_scopes || source.grantedScopes;
                      let ungranted = source.ungranted_scopes || source.ungrantedScopes;
                      if (!granted && source.google_backup) {
                        granted = source.google_backup.granted_scopes || source.google_backup.grantedScopes;
                      }
                      if (!granted && source.googleBackup) {
                        granted = source.googleBackup.granted_scopes || source.googleBackup.grantedScopes;
                      }
                      if (!ungranted && source.google_backup) {
                        ungranted = source.google_backup.ungranted_scopes || source.google_backup.ungrantedScopes;
                      }
                      if (!ungranted && source.googleBackup) {
                        ungranted = source.googleBackup.ungranted_scopes || source.googleBackup.ungrantedScopes;
                      }
                      return { granted: granted || [], ungranted: ungranted || [] };
                    };

                    const { granted, ungranted } = extractScopesInline(loggedInUser);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("onboarding_wizard_granted_scopes", JSON.stringify(granted));
                      localStorage.setItem("onboarding_wizard_ungranted_scopes", JSON.stringify(ungranted));
                    }

                    const userEmail =
                      loggedInUser?.email ||
                      loggedInUser?.googleBackup?.email ||
                      "";

                    // Save token in _tokenKey and _token cookies
                    const token =
                      loggedInUser?.googleBackup?.token || loggedInUser?.token;
                    const onboardingStatus =
                      loggedInUser?.onboarding_status ||
                      loggedInUser?.onboarding?.onboarding_status ||
                      (loggedInUser?.onboarding?.onboardingEnd
                        ? "completed"
                        : "pending");

                    if (token) {
                      document.cookie = `_tokenKey=${token}; path=/;`;
                      document.cookie = `_token=${token}; path=/;`;
                    }
                    document.cookie = `_onboarding_status=${onboardingStatus}; path=/;`;

                    if (onboardingStatus === "pending") {
                      // Do not redirect automatically here to allow setting password
                      // (Let state change re-render and show Set Password form on connect page)
                      toast.success("Google login successful. Please set your password or skip.");
                    } else {
                      toast.success(
                        userEmail
                          ? `Login successful for ${userEmail}`
                          : "Login successful",
                      );
                      router.replace("/dashboard");
                    }
                  } catch (error: any) {
                    console.error("Backend login error:", error);
                    const errorMessage =
                      typeof error === "string"
                        ? error
                        : error?.message || "Login failed";
                    toast.error(
                      `Login failed: ${errorMessage}. Please make sure the backend server is running.`,
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  toast.error("Google authentication failed.");
                }}
                loading={loading}
              />

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-(--border)"></div>
                <span className="px-3 text-xs text-(--text-muted) uppercase font-bold tracking-wider">or</span>
                <div className="flex-1 border-t border-(--border)"></div>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 border border-(--border) text-(--text-primary) font-bold rounded-sm hover:bg-(--bg-secondary) text-center text-sm transition-colors cursor-pointer block"
              >
                Login with Email & Password
              </Link>
            </div>
          )}

          {/* <p className="text-sm text-(--text-secondary) pt-4">
            New to CyberLS?{" "}
            <span
              onClick={handleStartTrial}
              className="text-(--primary) font-bold cursor-pointer hover:underline"
            >
              Start Free Trial
            </span>
          </p> */}
        </div>
      </main>

      <div className="py-8" />
    </div>
  );
}
