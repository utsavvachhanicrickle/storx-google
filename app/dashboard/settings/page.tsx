"use client";

import { useState } from "react";

const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small organizations starting secure backups.",
    price: "$29",
    period: "/month",
    recommended: false,
    features: [
      "Up to 50 protected users",
      "Hourly auto-sync",
      "1 TB encrypted storage",
      "Basic audit logs",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "Advanced protection with enterprise-grade automation.",
    price: "$99",
    period: "/month",
    recommended: true,
    features: [
      "Unlimited protected users",
      "Real-time backup sync",
      "5 TB encrypted storage",
      "Advanced audit system",
      "Threat monitoring",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "High-scale backup infrastructure for large corporations.",
    price: "$249",
    period: "/month",
    recommended: false,
    features: [
      "Unlimited everything",
      "Multi-region redundancy",
      "Custom compliance rules",
      "Dedicated vault cluster",
      "Priority 24/7 support",
    ],
  },
];

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("business");

  return (
    <div className="min-h-screen bg-(--bg) p-5 space-y-6">
      {/* ================= SETTINGS CARD ================= */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-(--border)">
          <h2 className="text-2xl font-extrabold text-(--text-primary)">
            System Controls
          </h2>

          <p className="text-sm text-(--text-secondary) mt-1">
            Manage platform preferences and interface behavior.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Appearance */}
          <div className="flex items-center justify-between border border-(--border) rounded-2xl p-5 hover:bg-(--bg-secondary) transition-colors">
            <div>
              <h3 className="text-sm font-black text-(--text-primary)">
                Appearance Mode
              </h3>

              <p className="text-xs text-(--text-muted) mt-1">
                Toggle between secure light and dark interface modes.
              </p>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-5 py-3 rounded-2xl text-sm font-black transition-all ${
                darkMode
                  ? "bg-slate-900 text-white"
                  : "bg-(--bg-secondary) border border-(--border) text-(--text-primary)"
              }`}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* Security */}
          <div className="flex items-center justify-between border border-(--border) rounded-2xl p-5 hover:bg-(--bg-secondary) transition-colors">
            <div>
              <h3 className="text-sm font-black text-(--text-primary)">
                Zero-Knowledge Encryption
              </h3>

              <p className="text-xs text-(--text-muted) mt-1">
                Enterprise-grade encryption is currently enabled.
              </p>
            </div>

            <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wide">
              ACTIVE
            </span>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between border border-(--border) rounded-2xl p-5 hover:bg-(--bg-secondary) transition-colors">
            <div>
              <h3 className="text-sm font-black text-(--text-primary)">
                Threat Notifications
              </h3>

              <p className="text-xs text-(--text-muted) mt-1">
                Receive instant alerts for unusual backup activities.
              </p>
            </div>

            <button className="bg-(--primary) hover:bg-(--primary-hover) text-white px-5 py-3 rounded-2xl text-xs font-black transition-all">
              Enabled
            </button>
          </div>
        </div>
      </div>

      {/* ================= BILLING SECTION ================= */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-(--border) flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-(--text-primary)">
              Corporate Billing & Subscription Plans
            </h2>

            <p className="text-sm text-(--text-secondary) mt-1">
              Upgrade storage infrastructure and backup capabilities.
            </p>
          </div>

          <button className="bg-(--primary) hover:bg-(--primary-hover) text-white px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-teal-500/10">
            Billing History
          </button>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border transition-all overflow-hidden ${
                selectedPlan === plan.id
                  ? "border-(--primary) shadow-xl shadow-teal-500/10 bg-(--accent-soft)/10"
                  : "border-(--border) hover:border-(--text-muted)"
              }`}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div className="absolute top-4 right-4 bg-(--primary) text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  Recommended
                </div>
              )}

              {/* Top */}
              <div className="p-6 border-b border-(--border)">
                <h3 className="text-2xl font-extrabold text-(--text-primary)">
                  {plan.name}
                </h3>

                <p className="text-sm text-(--text-secondary) mt-2 leading-relaxed min-h-[48px]">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-black text-(--text-primary)">
                    {plan.price}
                  </span>

                  <span className="text-sm font-bold text-(--text-muted) mb-1">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm text-(--text-secondary) font-medium"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px] font-black">
                        ✓
                      </div>

                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    alert(`Plan switched to ${plan.name}`);
                  }}
                  className={`w-full mt-8 py-3 rounded-2xl text-sm font-black transition-all ${
                    selectedPlan === plan.id
                      ? "bg-(--primary) text-white shadow-lg shadow-teal-500/20"
                      : "border border-(--border) hover:bg-(--bg-secondary) text-(--text-primary)"
                  }`}
                >
                  {selectedPlan === plan.id
                    ? "Current Active Plan"
                    : "Choose Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
