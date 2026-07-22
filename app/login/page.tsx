"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getUserSlice } from "@/store/slices/authSlice";
import toast from "@/components/Toast";
import Logo from "@/components/ui/Logo";
import ReCaptcha from "@/components/ui/ReCaptcha";
import { configService } from "@/services/configService";
import { setCsrfToken } from "@/services/apiClient";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Common UI State
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "mfa" | "forgot">("login");
  const [csrfEnabled, setCsrfEnabled] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberForOneWeek, setRememberForOneWeek] = useState(false);
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // MFA Form States
  const [mfaPasscode, setMfaPasscode] = useState("");
  const [mfaRecoveryCode, setMfaRecoveryCode] = useState("");

  // Onboarding Warning Modal State
  const [showOnboardingWarning, setShowOnboardingWarning] = useState(false);
  const [showRegisterWarning, setShowRegisterWarning] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    setMounted(true);
    configService
      .getConfig()
      .then((cfg: any) => {
        if (cfg.csrfToken) {
          setCsrfToken(cfg.csrfToken);
        }
        if (
          cfg["csrf-protection-enabled"] ||
          cfg.csrfProtectionEnabled ||
          cfg.csrfToken
        ) {
          setCsrfEnabled(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load bootstrap config:", err);
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


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login" && !captchaResponse) {
      toast.error("Please verify that you are not a robot.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        email,
        password,
        captchaResponse,
        rememberForOneWeek,
        mfaPasscode: mfaPasscode || undefined,
        mfaRecoveryCode: mfaRecoveryCode || undefined,
      };

      const res = await authService.loginWithPassword(payload);

      // Handle MFA required response
      if (
        res.action === "mfa_required" ||
        res.mfaRequired ||
        res.error === "mfa_required" ||
        res.error === "A MFA passcode or recovery code is required"
      ) {
        toast.info("MFA Passcode is required to continue.");
        setMode("mfa");
        setLoading(false);
        return;
      }

      if (res.token) {
        document.cookie = `_tokenKey=${res.token}; path=/;`;
        document.cookie = `_token=${res.token}; path=/;`;

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

        const { granted, ungranted } = extractScopesInline(res);
        if (typeof window !== "undefined") {
          localStorage.setItem("onboarding_wizard_granted_scopes", JSON.stringify(granted));
          localStorage.setItem("onboarding_wizard_ungranted_scopes", JSON.stringify(ungranted));
        }
      }

      // Check onboarding status
      const onboardingEnd = res.onboarding?.onboardingEnd;
      const onboardingStatus =
        res.onboarding?.onboarding_status || res.onboarding_status || "pending";
      document.cookie = `_onboarding_status=${onboardingStatus}; path=/;`;

      // If onboarding is incomplete
      if (onboardingEnd === false || onboardingStatus === "pending") {
        const hasGoogleBackup =
          res.google_backup &&
          Object.keys(res.google_backup).length > 0 &&
          (res.google_backup.email || res.google_backup.token);
        if (hasGoogleBackup) {
          toast.info("Please complete onboarding.");
          await dispatch(getUserSlice()).unwrap();
          router.replace("/onbording");
        } else {
          // Google Backup is missing, show blocking popup
          setShowOnboardingWarning(true);
          // Delete token/cookie to enforce restriction if they try to bypass
          document.cookie =
            "_tokenKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          document.cookie =
            "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
      } else {
        toast.success("Login successful!");
        await dispatch(getUserSlice()).unwrap();
        router.replace("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failure:", error);
      // Check if MFA is required based on response data error structure
      const errRes = error.response?.data;
      if (
        errRes?.action === "mfa_required" ||
        errRes?.error?.toLowerCase().includes("mfa") ||
        errRes?.message?.toLowerCase().includes("mfa")
      ) {
        toast.info("Multi-Factor Authentication required.");
        setMode("mfa");
      } else {
        const isCredentialsError =
          errRes?.error === "Your login credentials are incorrect, please try again" ||
          error.message?.includes("credentials are incorrect");

        if (isCredentialsError) {
          setLoginError(errRes?.error || error.message || "Your login credentials are incorrect, please try again");
          setShowRegisterWarning(true);
        } else {
          toast.error(
            errRes?.error ||
              errRes?.message ||
              error.message ||
              "Authentication failed.",
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaResponse) {
      toast.error("Please verify that you are not a robot.");
      return;
    }
    try {
      setLoading(true);
      await authService.forgotPassword({ email, captchaResponse });
      toast.success("Password recovery link sent successfully!");
      setMode("login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to submit request.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-(--bg-secondary) items-center justify-center">
        <div className="animate-spin border-4 border-(--primary) border-t-transparent w-8 h-8 rounded-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-secondary) justify-between">
      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-(--bg-primary) rounded-md shadow-xl border border-(--border) p-8 sm:p-12">
          <div className="flex items-center justify-center mx-auto mb-6">
            <Link href="/" className="flex items-center cursor-pointer">
              <Logo onlyIcon className="w-30 h-30 rounded-3xl" />
            </Link>
          </div>

          {mode === "login" && (
            <>
              <h2 className="text-2xl font-bold text-(--text-primary) mb-2 text-center">
                Login with Credentials
              </h2>
              <p className="text-xs text-(--text-secondary) mb-6 text-center">
                Enter your registered console email and password below.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-(--text-primary) mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-(--border) rounded-sm text-sm bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:border-(--primary)"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-(--text-primary)">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-(--primary) hover:underline font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-3 pr-10 py-2 border border-(--border) rounded-sm text-sm bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:border-(--primary)"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-(--text-secondary) hover:text-(--text-primary) cursor-pointer"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberForOneWeek}
                    onChange={(e) => setRememberForOneWeek(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-(--primary) focus:ring-(--primary)"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-xs font-bold text-(--text-secondary)"
                  >
                    Remember me for one week
                  </label>
                </div>

                <ReCaptcha onVerify={setCaptchaResponse} />

                <button
                  type="submit"
                  disabled={loading || !captchaResponse}
                  className="w-full py-2.5 bg-(--primary) text-white font-bold rounded-sm hover:bg-(--primary-hover) text-center text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Authenticating..." : "Login"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/connect"
                  className="text-xs text-(--text-secondary) hover:text-(--text-primary) font-bold"
                >
                  ← Back to Google Sign In
                </Link>
              </div>
            </>
          )}

          {mode === "mfa" && (
            <>
              <h2 className="text-2xl font-bold text-(--text-primary) mb-2 text-center">
                Two-Factor Authentication
              </h2>
              <p className="text-xs text-(--text-secondary) mb-6 text-center">
                Enter your 6-digit authenticator passcode or a backup recovery
                code to complete sign in.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-(--text-primary) mb-1 font-sans">
                    Authenticator Passcode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaPasscode}
                    onChange={(e) => setMfaPasscode(e.target.value)}
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-sm bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:border-(--primary) text-center tracking-widest font-mono"
                    placeholder="123456"
                  />
                </div>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-(--border)"></div>
                  <span className="px-2 text-[10px] text-(--text-muted) uppercase font-bold tracking-wider">
                    or
                  </span>
                  <div className="flex-1 border-t border-(--border)"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-(--text-primary) mb-1">
                    MFA Recovery Code
                  </label>
                  <input
                    type="text"
                    value={mfaRecoveryCode}
                    onChange={(e) => setMfaRecoveryCode(e.target.value)}
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-sm bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:border-(--primary) text-center font-mono"
                    placeholder="REC-XXXX-XXXX-XXXX"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-(--primary) text-white font-bold rounded-sm hover:bg-(--primary-hover) text-center text-sm transition-colors cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Complete Login"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setMfaPasscode("");
                    setMfaRecoveryCode("");
                  }}
                  className="text-xs text-(--text-secondary) hover:text-(--text-primary) font-bold"
                >
                  ← Back to Email & Password
                </button>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h2 className="text-2xl font-bold text-(--text-primary) mb-2 text-center">
                Forgot Password
              </h2>
              <p className="text-xs text-(--text-secondary) mb-6 text-center">
                Enter your account email. We will send you a password recovery
                link.
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-(--text-primary) mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-(--border) rounded-sm text-sm bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:border-(--primary)"
                    placeholder="user@example.com"
                  />
                </div>

                <ReCaptcha onVerify={setCaptchaResponse} />

                <button
                  type="submit"
                  disabled={loading || !captchaResponse}
                  className="w-full py-2.5 bg-(--primary) text-white font-bold rounded-sm hover:bg-(--primary-hover) text-center text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending link..." : "Send Recovery Email"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-xs text-(--text-secondary) hover:text-(--text-primary) font-bold"
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Blocking Onboarding warning Modal */}
      {showOnboardingWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-(--bg-primary) border border-(--border) w-full max-w-md rounded-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500 flex items-center gap-2">
              <span>⚠️</span> Google Connection Required
            </h3>
            <p className="text-xs text-(--text-secondary) leading-relaxed">
              Your account setup has onboarding steps remaining. You must first
              log in or connect with Google to authorize required scopes before
              you can log in with email and password.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOnboardingWarning(false);
                  router.push("/connect");
                }}
                className="flex-1 py-2 bg-(--primary) text-white font-bold rounded-md hover:bg-(--primary-hover) text-xs transition-colors cursor-pointer"
              >
                Go to Google Login
              </button>
              <button
                onClick={() => setShowOnboardingWarning(false)}
                className="flex-1 py-2 border border-(--border) text-(--text-primary) font-bold rounded-md hover:bg-(--bg-secondary) text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocking Register warning Modal */}
      {showRegisterWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-(--bg-primary) border border-(--border) w-full max-w-md rounded-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
              <span>⚠️</span> Account / Credentials Issue
            </h3>
            
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-md text-xs font-semibold select-none leading-relaxed">
                {loginError}
              </div>
            )}

            <div className="text-xs text-(--text-secondary) leading-relaxed space-y-2">
              <p>
                If you do not have an account registered with this email, please first register yourself before trying to login.
              </p>
              <p className="font-semibold text-(--text-primary)">
                If you are already registered, please login with Google (Gmail) or reset your password.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRegisterWarning(false);
                  router.push("/connect");
                }}
                className="flex-1 py-2 bg-(--primary) text-white font-bold rounded-md hover:bg-(--primary-hover) text-xs transition-colors cursor-pointer"
              >
                Register / Google Login
              </button>
              <button
                onClick={() => setShowRegisterWarning(false)}
                className="flex-1 py-2 border border-(--border) text-(--text-primary) font-bold rounded-md hover:bg-(--bg-secondary) text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="py-4" />
    </div>
  );
}
