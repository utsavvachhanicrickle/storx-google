"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPolicyOptions } from "@/store/slices/policySlice";

interface MovePolicyModalProps {
  currentPolicyName: string;
  selectedCount: number;
  onClose: () => void;
  onMove: (destination: {
    type: "existing" | "new";
    value: string | number;
  }) => void;
}

export default function MovePolicyModal({
  currentPolicyName,
  selectedCount,
  onClose,
  onMove,
}: MovePolicyModalProps) {
  const dispatch = useAppDispatch();
  const { policyOptions } = useAppSelector((state) => state.policy);

  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [destPolicyId, setDestPolicyId] = useState<string>("");
  const [newPolicyName, setNewPolicyName] = useState("");

  const otherPolicies = useMemo(() => {
    return policyOptions.filter(
      (p) => p.name?.toLowerCase() !== currentPolicyName?.toLowerCase(),
    );
  }, [policyOptions, currentPolicyName]);

  useEffect(() => {
    dispatch(fetchPolicyOptions());
  }, [dispatch]);

  useEffect(() => {
    if (otherPolicies.length === 0) {
      setActiveTab("new");
    }
  }, [otherPolicies]);

  const handleMove = () => {
    if (activeTab === "existing") {
      if (!destPolicyId) return;
      onMove({ type: "existing", value: Number(destPolicyId) });
    } else {
      if (!newPolicyName.trim()) return;
      onMove({ type: "new", value: newPolicyName.trim() });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-(--bg-primary) border border-(--border) rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-(--border-light) select-none">
          <h2 className="text-base font-extrabold text-(--text-primary) tracking-tight">
            Move to Policy
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
        <div className="px-5 py-4 space-y-3 text-left">
          <p className="text-xs font-bold text-(--text-muted) leading-relaxed">
            Move selected assignments from{" "}
            <span className="font-extrabold text-(--text-primary)">
              {currentPolicyName}
            </span>{" "}
            to another policy.
          </p>

          {/* Alert Highlight Box */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-sm p-2 text-xs font-bold">
            {selectedCount} assignment(s) selected
          </div>

          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-(--bg-secondary) rounded-md select-none">
            <button
              onClick={() => setActiveTab("existing")}
              className={`py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                activeTab === "existing"
                  ? "bg-(--bg-primary) text-(--text-primary) shadow-sm"
                  : "text-(--text-muted) hover:text-(--text-secondary)"
              }`}
            >
              Existing policy
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                activeTab === "new"
                  ? "bg-(--bg-primary) text-(--text-primary) shadow-sm"
                  : "text-(--text-muted) hover:text-(--text-secondary)"
              }`}
            >
              Create new
            </button>
          </div>

          {/* Form Content */}
          {activeTab === "existing" ? (
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-(--text-secondary) uppercase tracking-wider">
                Destination policy
              </label>
              {otherPolicies.length === 0 ? (
                <div className="text-center py-3 bg-slate-50 dark:bg-slate-900/20 border border-dashed border-(--border) rounded-sm select-none">
                  <p className="text-xs font-bold text-(--text-muted)">
                    No other existing policies available.
                  </p>
                  <button
                    onClick={() => setActiveTab("new")}
                    className="mt-1 text-xs font-extrabold text-(--primary) hover:underline cursor-pointer"
                  >
                    Create a new policy &rarr;
                  </button>
                </div>
              ) : (
                <select
                  value={destPolicyId}
                  onChange={(e) => setDestPolicyId(e.target.value)}
                  className="w-full px-3 py-2 pr-10 appearance-none border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer transition"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2363738a' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    backgroundSize: "10px 10px",
                  }}
                >
                  <option value="" disabled>
                    Select a policy...
                  </option>
                  {otherPolicies.map((p) => {
                    const truncatedName =
                      p.name && p.name.length > 40
                        ? p.name.substring(0, 37) + "..."
                        : p.name;
                    return (
                      <option key={p.policy_id} value={p.policy_id} title={p.name}>
                        {truncatedName}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-(--text-secondary) uppercase tracking-wider">
                New policy name
              </label>
              <input
                type="text"
                value={newPolicyName}
                onChange={(e) => setNewPolicyName(e.target.value)}
                placeholder="e.g., Contractors, Legal Hold..."
                className="w-full px-3 py-2 border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) transition"
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-(--border-light) bg-(--bg-secondary)/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm border border-(--border) text-xs font-bold text-(--text-secondary) bg-(--bg-primary) hover:bg-(--bg-secondary) transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={
              activeTab === "existing" ? !destPolicyId : !newPolicyName.trim()
            }
            className="px-5 py-2 rounded-sm bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-45 disabled:cursor-not-allowed text-(--text-inverse) text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Move Assignments
          </button>
        </div>
      </div>
    </div>
  );
}
