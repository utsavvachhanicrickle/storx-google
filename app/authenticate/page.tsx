"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthenticatePage() {
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authLoading, setAuthLoading] = useState(false);
  const [syncPolicy, setSyncPolicy] = useState("hourly");
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncFinished, setSyncFinished] = useState(false);
  const [servicesToProtect, setServicesToProtect] = useState<{
    [key: string]: boolean;
  }>({
    drive: false,
    photos: false,
    contactsCalendar: false,
  });

  useEffect(() => {
    if (onboardingStep === 4) {
      // Reset state each time we enter step 4
      setSyncFinished(false);
      setSyncLogs([]);

      const messages = [
        "Initializing secure storage vault...",
        "Connecting Google Workspace Directory...",
        "Found 124 users in Acme Corp Ltd. tenant...",
        "Generating zero-knowledge 256-bit encryption keys...",
        "Authorizing OAuth scopes for Gmail & Calendar API...",
        "Authorizing OAuth scopes for Google Drive API...",
        "Establishing secure background syncing worker...",
        "Syncing user: alice@acme.com (Pending)",
        "Syncing user: bob@acme.com (Pending)",
        "Database handshake success. Secure vault activated!",
        "Initial sync worker launched successfully.",
      ];

      let idx = 0;
      const interval = setInterval(() => {
        if (idx < messages.length) {
          setSyncLogs((prev) => [...prev, messages[idx]]);
          idx++;
        } else {
          clearInterval(interval);
          setSyncFinished(true);
        }
      }, 900);

      return () => clearInterval(interval);
    }
  }, [onboardingStep]);

  const handleStartTrial = () => {
    setActiveTab("onboarding");
    setOnboardingStep(1);
  };

  const handleSimulateAuth = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setOnboardingStep(2);
    }, 1500);
  };

  // Removed unused handleForceSync function and related state.
  return (
    <div className="min-h-screen flex flex-col bg-(--bg-secondary)">
      <nav className="w-full py-6 px-6 sm:px-8 border-b border-(--border) bg-(--bg-secondary)">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setActiveTab("home")}
          >
            <span className="text-3xl mr-2 text-(--primary)">🗄️</span>
            <span className="font-bold text-2xl tracking-tight text-(--text-primary)">
              Stor<span className="text-(--primary)">X</span>
            </span>
          </div>
          <div className="text-sm font-semibold text-(--text-secondary) flex items-center gap-1">
            Secure Setup 🔒
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl bg-(--bg-primary) rounded-3xl shadow-xl border border-(--border) overflow-hidden">
          {/* Improved Progress Tracker */}
          <div className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--bg-secondary) px-8 py-8 shadow-sm">
            {/* subtle glow */}
            <div className="absolute inset-0 bg-linear-to-r from-(--primary)/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex items-start justify-between">
              {/* Background Line */}
              <div className="absolute top-5 left-0 w-full h-[3px] rounded-full bg-(--border)" />

              {/* Active Progress Line */}
              <div
                className="absolute top-5 left-0 h-[3px] rounded-full bg-linear-to-r from-(--primary) to-indigo-500 transition-all duration-700 ease-out"
                style={{
                  width: `${((onboardingStep - 1) / 3) * 100}%`,
                }}
              />

              {[
                { step: 1, label: "Account" },
                { step: 2, label: "Services" },
                { step: 3, label: "Auto-Sync" },
                { step: 4, label: "Initialize" },
              ].map((s) => {
                const isActive = onboardingStep >= s.step;
                const isCurrent = onboardingStep === s.step;

                return (
                  <div
                    key={s.step}
                    className="relative z-10 flex flex-col items-center"
                  >
                    {/* Step Circle */}
                    <div
                      className={`
              relative flex items-center justify-center
              w-10 h-10 rounded-full text-sm font-semibold
              transition-all duration-300
              border-2
              ${
                isActive
                  ? "bg-(--primary) border-(--primary) text-white shadow-lg shadow-(--primary)/30"
                  : "bg-(--bg-primary) border-(--border) text-(--text-muted)"
              }
              ${isCurrent ? "scale-110 ring-4 ring-(--primary)/15" : ""}
            `}
                    >
                      {isActive && s.step < onboardingStep ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        s.step
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-3 flex flex-col items-center">
                      <span
                        className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                          isActive
                            ? "text-(--text-primary)"
                            : "text-(--text-muted)"
                        }`}
                      >
                        {s.label}
                      </span>

                      {/* Current Step Indicator */}
                      {isCurrent && (
                        <span className="mt-1 text-[10px] uppercase tracking-widest text-(--primary) font-bold">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 sm:p-12 min-h-[380px] flex flex-col justify-between">
            {/* STEP 1: AUTH */}
            {onboardingStep === 1 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-teal-500/10 border border-(--primary)/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 text-(--primary)">
                  👤
                </div>
                <h2 className="text-3xl font-extrabold text-(--text-primary) mb-3">
                  Connect Workspace Admin
                </h2>
                <p className="text-(--text-secondary) mb-8 max-w-md mx-auto">
                  Authenticate with a Google Workspace Super Admin account to
                  deploy the StorX enterprise app and configure background
                  backup.
                </p>

                <button
                  onClick={handleSimulateAuth}
                  disabled={authLoading}
                  className="w-full sm:w-auto mx-auto flex items-center justify-center px-8 py-4 border border-(--border) rounded-xl bg-(--bg-secondary) hover:bg-(--bg-active) text-(--text-primary) font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      Connecting Google...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="text-xl">G</span> Continue with Google
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: SCOPES */}
            {onboardingStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-(--text-primary) mb-2 text-center">
                  Select Services to Protect
                </h2>
                <div className="text-center mb-6">
                  <span className="bg-(--accent-soft) text-(--primary) text-xs font-bold px-3 py-1 rounded-full border border-(--primary)/20">
                    Corporate Tenant Found: 124 Users
                  </span>
                </div>

                <div className="space-y-3 max-w-md mx-auto">
                  <label className="flex items-center p-3 border border-(--border) rounded-xl bg-(--bg-secondary) opacity-70">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5 accent-(--primary)"
                    />
                    <div className="ml-4 flex-1 font-bold text-(--text-primary) flex justify-between items-center">
                      <span>📧 Gmail</span>
                      <span className="text-xs text-(--text-muted) font-normal">
                        Required
                      </span>
                    </div>
                  </label>

                  {[
                    { key: "drive", label: "📂 Google Drive" },
                    { key: "photos", label: "🖼️ Google Photos" },
                    {
                      key: "contactsCalendar",
                      label: "📅 Contacts & Calendars",
                    },
                  ].map((svc) => (
                    <label
                      key={svc.key}
                      className="flex items-center p-3 border border-(--border) rounded-xl cursor-pointer hover:bg-(--bg-secondary) transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={servicesToProtect[svc.key] ?? false}
                        onChange={(e) =>
                          setServicesToProtect({
                            ...servicesToProtect,
                            [svc.key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-(--primary)"
                      />
                      <span className="ml-4 font-bold text-(--text-primary)">
                        {svc.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-8 flex justify-between items-center max-w-md mx-auto">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="text-(--text-secondary) font-medium hover:text-(--text-primary) cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="bg-(--primary) hover:bg-(--primary-hover) text-white px-6 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SYNC INTERVAL */}
            {onboardingStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-(--text-primary) mb-6 text-center">
                  Configure Auto-Sync
                </h2>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {[
                    {
                      val: "cdp",
                      title: "Real-Time",
                      desc: "Continuous protection",
                    },
                    {
                      val: "hourly",
                      title: "Hourly",
                      desc: "Recommended policy",
                    },
                    { val: "6h", title: "6 Hours", desc: "Standard frequency" },
                    { val: "daily", title: "Nightly", desc: "Once per day" },
                  ].map((item) => (
                    <div
                      key={item.val}
                      onClick={() => setSyncPolicy(item.val)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        syncPolicy === item.val
                          ? "border-(--primary) bg-(--accent-soft)/20"
                          : "border-(--border) hover:border-(--text-muted)"
                      }`}
                    >
                      <div className="font-bold text-(--text-primary)">
                        {item.title}
                      </div>
                      <div className="text-xs text-(--text-muted) mt-1">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between items-center max-w-md mx-auto">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="text-(--text-secondary) font-medium hover:text-(--text-primary) cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="bg-(--primary) hover:bg-(--primary-hover) text-white px-6 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Start First Sync
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: INITIALIZE VAULT */}
            {onboardingStep === 4 && (
              <div className="w-full">
                {!syncFinished ? (
                  <div className="text-center py-6">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-(--primary) rounded-full border-t-transparent animate-spin" />

                      <div className="absolute inset-0 flex items-center justify-center text-xl">
                        🔒
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-(--text-primary) mb-3">
                      Establishing Secure Vault...
                    </h2>

                    <p className="text-sm text-(--text-secondary) mb-6">
                      Initializing enterprise backup infrastructure
                    </p>

                    {/* Terminal */}
                    <div className="bg-slate-950 rounded-2xl p-4 text-left font-mono text-xs text-teal-400 h-52 overflow-y-auto shadow-inner border border-slate-800">
                      {syncLogs.map((log, index) => (
                        <div
                          key={index}
                          className="mb-2 text-teal-300 animate-pulse"
                        >
                          <span className="text-slate-500 mr-2">&gt;</span>

                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 text-emerald-500 shadow-lg shadow-emerald-500/20">
                      ✓
                    </div>

                    <h2 className="text-3xl font-extrabold text-(--text-primary) mb-3">
                      Vault Activated Successfully
                    </h2>

                    <p className="text-(--text-secondary) mb-8 max-w-md mx-auto">
                      Your Google Workspace tenant is now securely protected
                      with automated encrypted syncing.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-(--bg-secondary) border border-(--border) rounded-xl p-4">
                        <div className="text-2xl mb-2">📧</div>

                        <div className="font-bold text-(--text-primary)">
                          Gmail
                        </div>
                      </div>

                      <div className="bg-(--bg-secondary) border border-(--border) rounded-xl p-4">
                        <div className="text-2xl mb-2">📂</div>

                        <div className="font-bold text-(--text-primary)">
                          Drive
                        </div>
                      </div>

                      <div className="bg-(--bg-secondary) border border-(--border) rounded-xl p-4">
                        <div className="text-2xl mb-2">🔒</div>

                        <div className="font-bold text-(--text-primary)">
                          Encrypted
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center bg-(--primary) hover:bg-(--primary-hover) text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 hover:scale-105"
                    >
                      Go to Dashboard →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
