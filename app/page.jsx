"use client";

import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import { DarkModeContext } from "@/context/darkModeContext";

const stats = [
  {
    value: "99.9%",
    label: "UPTIME SLA",
  },
  {
    value: "256-bit",
    label: "AES ENCRYPTION",
  },
  {
    value: "Auto",
    label: "HOURLY SYNCS",
  },
  {
    value: "1-Click",
    label: "GRANULAR RESTORE",
  },
];

export default function HomePage() {
  const router = useRouter();

  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  return (
    <div className="min-h-screen bg-(--bg) text-(--text-primary) overflow-hidden transition-colors duration-300">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-(--border) bg-(--bg)/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            {/* LOGO */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl border border-(--border) bg-(--bg-primary) flex items-center justify-center text-xl shadow-sm">
                🗄️
              </div>

              <div className="flex items-center text-3xl font-black tracking-tight">
                <span>Stor</span>
                <span className="text-(--primary)">X</span>
              </div>
            </div>

            {/* NAV LINKS */}
            <div className="hidden md:flex items-center gap-10">
              <button className="text-[15px] font-medium text-(--text-secondary) hover:text-(--primary) transition-colors cursor-pointer">
                Features
              </button>

              <button className="text-[15px] font-medium text-(--text-secondary) hover:text-(--primary) transition-colors cursor-pointer">
                Pricing
              </button>

              <button
                onClick={() => router.push("/signin")}
                className="text-[15px] font-medium text-(--text-secondary) hover:text-(--primary) transition-colors cursor-pointer"
              >
                Log in
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="h-11 px-4 rounded-2xl border border-(--border) bg-(--bg-primary) text-sm font-semibold hover:bg-(--bg-secondary) transition-all cursor-pointer"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <button
                onClick={() => router.push("/authenticate")}
                className="h-12 px-7 rounded-2xl bg-(--primary) hover:bg-(--primary-hover) text-white font-bold text-[15px] shadow-xl shadow-teal-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* GRID BACKGROUND */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(var(--primary) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* GRADIENT BLUR */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-teal-500/10 blur-[120px] rounded-full" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-5xl mx-auto text-center pt-20">
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md text-emerald-600 text-sm font-semibold shadow-sm">
            🚀 Enterprise Cloud Backup
          </div>

          {/* HEADING */}
          <h1 className="mt-10 text-6xl md:text-8xl font-black tracking-tight leading-[0.95]">
            <span className="block">Secure your data.</span>

            <span className="block mt-3 text-transparent bg-clip-text bg-linear-to-r from-(--primary) to-cyan-400">
              Free your mind.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="max-w-3xl mx-auto mt-10 text-xl md:text-2xl leading-relaxed text-(--text-secondary) font-medium">
            Automated backup for Google Workspace. Protect Gmail, Drive, Photos,
            Contacts, and Calendar silently in the background with
            zero-knowledge encryption.
          </p>

          {/* CTA */}
          <div className="mt-14 flex justify-center">
            <button
              onClick={() => router.push("/authenticate")}
              className="group h-16 px-10 rounded-full bg-(--primary) hover:bg-(--primary-hover) text-white font-black text-lg shadow-2xl shadow-teal-500/30 transition-all hover:scale-[1.03] flex items-center gap-3 cursor-pointer"
            >
              Connect Google Workspace
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>

          {/* STATS */}
          <div className="max-w-4xl mx-auto mt-24 pt-10 border-t border-(--border)">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {stats.map((item, i) => (
                <div key={i}>
                  <div className="text-5xl font-black text-(--text-primary) tracking-tight">
                    {item.value}
                  </div>

                  <div className="mt-2 text-xs font-extrabold tracking-[0.2em] text-(--text-muted) uppercase">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
