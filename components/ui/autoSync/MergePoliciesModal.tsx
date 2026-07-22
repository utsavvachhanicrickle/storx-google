"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMergePreview,
  mergePolicies,
  fetchPolicies,
} from "@/store/slices/policySlice";
import toast from "@/components/Toast";

interface MergePoliciesModalProps {
  onClose: () => void;
}

// Helper to generate a unique key based on the group's policy IDs
const getGroupKey = (policies: any[]): string => {
  if (!policies) return "";
  return policies
    .map((p) => p.policy_id)
    .sort((a, b) => a - b)
    .join(",");
};

export default function MergePoliciesModal({
  onClose,
}: MergePoliciesModalProps) {
  const dispatch = useAppDispatch();
  const { policies, mergePreview, loading } = useAppSelector(
    (state) => state.policy,
  );

  const [sourceId, setSourceId] = useState<string>("");
  const [destId, setDestId] = useState<string>("");
  const [manualName, setManualName] = useState<string>("");

  // Track name overrides for groups keyed by group key
  const [groupNames, setGroupNames] = useState<Record<string, string>>(
    {},
  );

  // Track selected policy IDs for groups keyed by group key
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<
    Record<string, number[]>
  >({});

  const [mergingGroupKey, setMergingGroupKey] = useState<string | null>(null);
  const isMergingRef = useRef(false);

  const togglePolicySelection = (
    groupKey: string,
    policyId: number,
    allGroupIds: number[],
  ) => {
    setSelectedPolicyIds((prev) => {
      const currentIds =
        prev[groupKey] !== undefined ? prev[groupKey] : allGroupIds;
      const isSelected = currentIds.includes(policyId);
      const nextIds = isSelected
        ? currentIds.filter((id) => id !== policyId)
        : [...currentIds, policyId];
      return { ...prev, [groupKey]: nextIds };
    });
  };

  useEffect(() => {
    dispatch(fetchMergePreview());
  }, [dispatch]);

  const handleManualMerge = () => {
    if (!sourceId || !destId) {
      toast.error("Please select both source and destination policies.");
      return;
    }
    if (sourceId === destId) {
      toast.error("Source and destination policies must be different.");
      return;
    }

    const destPolicy = policies.find((p) => String(p.policy_id) === destId);
    const finalName =
      manualName.trim() || destPolicy?.name || "Unified Backup Policy";

    dispatch(
      mergePolicies({
        name: finalName,
        policy_ids: [Number(sourceId), Number(destId)],
      }),
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        onClose();
      }
    });
  };

  const handleGroupMerge = (
    groupKey: string,
    suggestedName: string,
    policyIds: number[],
  ) => {
    if (isMergingRef.current) return;

    const finalName = (groupNames[groupKey] || suggestedName).trim();
    if (!finalName) {
      toast.error("Please enter a name for the merged policy.");
      return;
    }

    isMergingRef.current = true;
    setMergingGroupKey(groupKey);

    dispatch(
      mergePolicies({
        name: finalName,
        policy_ids: policyIds,
      }),
    ).then((res) => {
      isMergingRef.current = false;
      setMergingGroupKey(null);
      if (res.meta.requestStatus === "fulfilled") {
        // Fetch only merge preview to update modal state (mergePolicies thunk already fetches updated policies lists)
        dispatch(fetchMergePreview());
      }
    });
  };

  const hasGroups = mergePreview?.groups && mergePreview.groups.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-(--bg-primary) border border-(--border) rounded-md shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--border-light) shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-sm flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
              </svg>
            </div>
            <h2 className="text-base font-extrabold text-(--text-primary) tracking-tight">
              Merge Policies
            </h2>
          </div>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 select-none">
              <div className="w-8 h-8 border-3 border-(--primary) border-t-transparent rounded-md animate-spin"></div>
              <p className="text-xs font-bold text-(--text-muted)">
                Loading merge preview...
              </p>
            </div>
          )}

          {/* if Groups are not presnts */}
          {!loading && !hasGroups && (
            <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4 text-center select-none">
              <div className="w-12 h-12 rounded-md bg-teal-500/10 flex items-center justify-center text-teal-600 animate-bounce">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-(--text-primary)">
                  No Duplicate Policies
                </h3>
                <p className="text-xs font-bold text-(--text-muted) max-w-sm leading-relaxed">
                  No duplicate policies to merge. You have not any assigned same
                  policies available.
                </p>
              </div>
            </div>
          )}

          {/* if Groups are presnts */}
          {!loading && hasGroups && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-4">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                  Duplicate Policies Detected
                </p>
                <p className="text-xs font-medium text-(--text-secondary) leading-relaxed">
                  We found duplicate backup policies that can be safely
                  consolidated. Merge each group to clean up.
                </p>
              </div>

              <div className="space-y-4">
                {mergePreview?.groups?.map((group: any, idx: number) => {
                  const groupKey = getGroupKey(group.policies);
                  const suggestedName =
                    group.suggested_name || `Merged Group ${idx + 1}`;
                  const currentNameValue =
                    groupNames[groupKey] !== undefined
                      ? groupNames[groupKey]
                      : suggestedName;
                  const allGroupIds = group.policies.map(
                    (p: any) => p.policy_id,
                  );
                  const currentSelected =
                    selectedPolicyIds[groupKey] !== undefined
                      ? selectedPolicyIds[groupKey]
                      : allGroupIds;
                  const isMergeDisabled = currentSelected.length < 2;
                  const isAnyMerging = mergingGroupKey !== null;

                  return (
                    <div
                      key={groupKey || idx}
                      className="border border-(--border) rounded-md p-4.5 space-y-4 bg-(--bg-secondary)/5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">
                            Duplicate Group #{idx + 1} ({group.policies.length}{" "}
                            policies)
                          </span>
                          <input
                            type="text"
                            value={currentNameValue}
                            onChange={(e) =>
                              setGroupNames((prev) => ({
                                ...prev,
                                [groupKey]: e.target.value,
                              }))
                            }
                            placeholder="Unified Policy Name"
                            className="block w-full sm:w-80 px-3 py-1.5 border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary)"
                          />
                        </div>
                        <button
                          onClick={() =>
                            handleGroupMerge(
                              groupKey,
                              suggestedName,
                              currentSelected,
                            )
                          }
                          disabled={isMergeDisabled || isAnyMerging}
                          className="shrink-0 px-4 py-2 rounded-sm bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition cursor-pointer shadow-xs self-end sm:self-center flex items-center gap-1.5"
                        >
                          {mergingGroupKey === groupKey ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Merging...</span>
                            </>
                          ) : (
                            <span>Merge Group</span>
                          )}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center select-none">
                          <span className="block text-[10px] font-black text-(--text-muted) uppercase tracking-wider">
                            Policies to Consolidate ({currentSelected.length}{" "}
                            selected):
                          </span>
                          {isMergeDisabled && (
                            <span className="text-[10px] font-bold text-rose-500">
                              * Select at least 2 policies to merge
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {group.policies.map((p: any) => {
                            const isChecked = currentSelected.includes(
                              p.policy_id,
                            );
                            return (
                              <div
                                key={p.policy_id}
                                // onClick={() =>
                                //   togglePolicySelection(
                                //     groupKey,
                                //     p.policy_id,
                                //     allGroupIds,
                                //   )
                                // }
                                className={`flex items-center gap-3 text-xs p-2.5 rounded-sm border cursor-pointer select-none transition-all ${
                                  isChecked
                                    ? "border-teal-500 bg-teal-500/5 hover:bg-teal-500/10"
                                    : "border-(--border-light) bg-(--bg-primary) hover:bg-(--bg-secondary)"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} 
                                  className="w-4 h-4 text-teal-600 border-(--border) rounded focus:ring-teal-500 cursor-pointer shrink-0"
                                />
                                <div className="flex-1 flex justify-between items-center min-w-0">
                                  <div className="font-bold text-(--text-primary) truncate">
                                    {p.name}
                                  </div>
                                  <div className="text-[11px] font-bold text-(--text-muted) flex gap-3 shrink-0 ml-3">
                                    <span>Interval: {p.interval}</span>
                                    <span>Retention: {p.retention_type}</span>
                                    <span>Users: {p.linked_job_count}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-(--border-light) bg-(--bg-secondary)/10 shrink-0 select-none">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-sm text-xs font-bold transition cursor-pointer shadow-sm ${
              hasGroups
                ? "border border-(--border) text-(--text-secondary) bg-(--bg-primary) hover:bg-(--bg-secondary)"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
