"use client";

import React from "react";
import Link from "next/link";

export default function SigninPage() {
  const handleSocialClick = (provider) => {
    console.log(`${provider} clicked`);
    window.location.href = "/?view=login";
  };

  const handleStartTrial = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] justify-between">
      {/* Navbar */}
      <nav className="w-full py-6 px-6 border-b border-[var(--border)] bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center cursor-pointer">
            <span className="text-3xl mr-2 text-[var(--primary)]">🗄️</span>

            <span className="font-bold text-2xl tracking-tight text-[var(--text-primary)]">
              Stor<span className="text-[var(--primary)]">X</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[var(--bg-primary)] rounded-3xl shadow-xl border border-[var(--border)] p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 text-[var(--primary)]">
            🔒
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Welcome Back
          </h2>

          <p className="text-[var(--text-secondary)] mb-8">
            Sign in to your StorX corporate admin console.
          </p>

          {/* Google Button */}
          <button
            onClick={() => handleSocialClick("Google")}
            className="w-full flex items-center justify-center px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-active)] text-[var(--text-primary)] font-semibold transition-all duration-300 cursor-pointer mb-6"
          >
            <span className="text-xl mr-3 font-bold text-[var(--primary)]">
              G
            </span>
            Sign in with Google Workspace
          </button>

          {/* Footer */}
          <p className="text-sm text-[var(--text-secondary)]">
            New to StorX?{" "}
            <span
              onClick={handleStartTrial}
              className="text-[var(--primary)] font-semibold cursor-pointer hover:underline"
            >
              Start Free Trial
            </span>
          </p>
        </div>
      </main>

      <div className="py-8" />
    </div>
  );
}
