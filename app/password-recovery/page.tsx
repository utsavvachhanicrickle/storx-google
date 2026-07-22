"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import toast from "@/components/Toast";
import Logo from "@/components/ui/Logo";
import { authService } from "@/services/authService";
import { configService } from "@/services/configService";
import { setCsrfToken } from "@/services/apiClient";
import PasswordInput from "@/components/ui/PasswordInput";
import { validatePassword } from "@/utils/passwordValidation";

function PasswordRecoveryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaPasscode, setMfaPasscode] = useState("");
  const [mfaRecoveryCode, setMfaRecoveryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"reset" | "mfa">("reset");

  useEffect(() => {
    configService.getConfig()
      .then((cfg: any) => {
        if (cfg.csrfToken) {
          setCsrfToken(cfg.csrfToken);
        }
      })
      .catch((err) => {
        console.error("Failed to load CSRF config in recovery:", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Recovery token is missing from the URL.");
      return;
    }

    if (!validatePassword(password, confirmPassword)) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        token,
        password,
        mfaPasscode: mfaPasscode || undefined,
        mfaRecoveryCode: mfaRecoveryCode || undefined,
      };

      const res = await authService.resetPassword(payload);

      if (res.action === "mfa_required" || res.mfaRequired || res.error === "mfa_required") {
        toast.info("MFA Passcode is required to continue.");
        setMode("mfa");
        setLoading(false);
        return;
      }

      toast.success("Password reset successful! Please log in.");
      router.push("/login");
    } catch (error: any) {
      console.error("Password recovery reset failure:", error);
      const errRes = error.response?.data;
      if (
        errRes?.action === "mfa_required" ||
        errRes?.error?.toLowerCase().includes("mfa") ||
        errRes?.message?.toLowerCase().includes("mfa")
      ) {
        toast.info("Multi-Factor Authentication required.");
        setMode("mfa");
      } else {
        toast.error(errRes?.error || errRes?.message || error.message || "Failed to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-(--bg-primary) rounded-md shadow-xl border border-(--border) p-8 sm:p-12">
      <div className="flex items-center justify-center mx-auto mb-6">
        <Link href="/" className="flex items-center cursor-pointer">
          <Logo onlyIcon className="w-30 h-30 rounded-3xl" />
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-(--text-primary) mb-2 text-center">Reset Password</h2>
      <p className="text-xs text-(--text-secondary) mb-6 text-center font-medium">
        Enter and confirm your new password below.
      </p>

      {!token ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center rounded-md space-y-3">
          <p>Invalid or expired password reset link.</p>
          <Link href="/login" className="inline-block px-4 py-2 bg-(--primary) text-white rounded-md hover:bg-(--primary-hover) font-bold transition-colors">
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "reset" ? (
            <>
              <PasswordInput
                label="New Password"
                value={password}
                onChange={setPassword}
                placeholder="Min 8 characters"
                id="recovery-new-password"
              />

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat password"
                id="recovery-confirm-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-(--primary) text-white font-bold rounded-sm hover:bg-(--primary-hover) text-center text-sm transition-colors cursor-pointer"
              >
                {loading ? "Processing..." : "Update Password"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-(--text-primary) mb-1 font-sans">Authenticator Passcode</label>
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
                <span className="px-2 text-[10px] text-(--text-muted) uppercase font-bold tracking-wider">or</span>
                <div className="flex-1 border-t border-(--border)"></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--text-primary) mb-1">MFA Recovery Code</label>
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
                {loading ? "Verifying..." : "Verify & Complete Reset"}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setMfaPasscode("");
                    setMfaRecoveryCode("");
                  }}
                  className="text-xs text-(--text-secondary) hover:text-(--text-primary) font-bold"
                >
                  ← Back to Password Entry
                </button>
              </div>
            </>
          )}
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-xs text-(--text-secondary) hover:text-(--text-primary) font-bold">
          ← Cancel and Return to Login
        </Link>
      </div>
    </div>
  );
}

export default function PasswordRecoveryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-(--bg-secondary) justify-between">
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={
          <div className="w-full max-w-md bg-(--bg-primary) rounded-md border border-(--border) p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin border-4 border-(--primary) border-t-transparent w-8 h-8 rounded-md mb-4" />
            <p className="text-xs text-(--text-secondary) font-bold">Loading recovery token...</p>
          </div>
        }>
          <PasswordRecoveryForm />
        </Suspense>
      </main>
      <div className="py-4" />
    </div>
  );
}
