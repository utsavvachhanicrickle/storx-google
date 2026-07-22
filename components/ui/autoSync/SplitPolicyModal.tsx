"use client";

import React, { useState } from "react";
import {
  RETENTION_OPTIONS,
  SYNC_INTERVAL_OPTIONS,
  WEEK_DAYS,
  MONTH_DAYS,
} from "@/utils/constants/policy_constants";

interface SplitPolicyModalProps {
  currentPolicyName: string;
  selectedCount: number;
  onClose: () => void;
  onSplit: (splitData: {
    name: string;
    interval: string;
    on: string;
    retention: string;
  }) => void;
}

export default function SplitPolicyModal({
  currentPolicyName,
  selectedCount,
  onClose,
  onSplit,
}: SplitPolicyModalProps) {
  const [name, setName] = useState("");
  const [interval, setIntervalVal] = useState("Daily");
  const [weeklyDay, setWeeklyDay] = useState("Sunday");
  const [monthlyDay, setMonthlyDay] = useState("1");
  const [retention, setRetentionVal] = useState("30 Days");

  const handleSplit = () => {
    if (!name.trim()) return;

    let onValue = "";
    if (interval === "Daily") {
      onValue = "12am";
    } else if (interval === "Weekly") {
      onValue = weeklyDay;
    } else if (interval === "Monthly") {
      onValue = monthlyDay;
    }

    onSplit({
      name: name.trim(),
      interval,
      on: onValue,
      retention,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-(--bg-primary) border border-(--border) rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--border-light) select-none">
          <h2 className="text-base font-extrabold text-(--text-primary) tracking-tight">
            Split Policy
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 text-left">
          <p className="text-xs font-bold text-(--text-muted) leading-relaxed">
            Move selected email + service assignments from{" "}
            <span className="font-extrabold text-(--text-primary)">
              {currentPolicyName}
            </span>{" "}
            into a new policy with updated settings.
          </p>

          {/* Alert Highlight Box */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-sm p-3 text-xs font-bold">
            {selectedCount} assignment(s) selected
          </div>

          {/* New Policy Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
              New Policy Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Executive Team Policy"
              className="w-full px-3.5 py-2.5 border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) transition"
            />
          </div>

          {/* Sync Interval */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
              Sync Interval
            </label>
            <select
              value={interval}
              onChange={(e) => setIntervalVal(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer transition"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                backgroundSize: "10px 10px",
              }}
            >
              {SYNC_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Weekly Day Selection */}
          {interval === "Weekly" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
                On Day of Week
              </label>
              <select
                value={weeklyDay}
                onChange={(e) => setWeeklyDay(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer transition"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  backgroundSize: "10px 10px",
                }}
              >
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Monthly Day Selection */}
          {interval === "Monthly" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
                On Day of Month
              </label>
              <select
                value={monthlyDay}
                onChange={(e) => setMonthlyDay(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer transition"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  backgroundSize: "10px 10px",
                }}
              >
                {MONTH_DAYS.map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Retention */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
              Retention
            </label>
            <select
              value={retention}
              onChange={(e) => setRetentionVal(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer transition"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                backgroundSize: "10px 10px",
              }}
            >
              {RETENTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "Infinite" ? "Infinite (Never Delete)" : opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-(--border-light) bg-(--bg-secondary)/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm border border-(--border) text-xs font-bold text-(--text-secondary) bg-(--bg-primary) hover:bg-(--bg-secondary) transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-sm bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-45 disabled:cursor-not-allowed text-(--text-inverse) text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Create &amp; Move Assignments
          </button>
        </div>
      </div>
    </div>
  );
}
