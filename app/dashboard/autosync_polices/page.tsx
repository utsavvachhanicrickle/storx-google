"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PolicyCard from "@/components/ui/autoSync/PolicyCard";
import CorporateUserPolicies from "@/components/ui/autoSync/CorporateUserPolicies";
import CreatePolicyModal from "@/components/ui/autoSync/CreatePolicyModal";
import MergePoliciesModal from "@/components/ui/autoSync/MergePoliciesModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPolicies,
  createPolicy,
  deletePolicy,
} from "@/store/slices/policySlice";
import {
  SYNC_INTERVAL_API_MAP,
  RETENTION_API_MAP,
  SyncIntervalOption,
  RetentionOption,
  Policy,
} from "@/utils/constants/policy_constants";
import toast from "@/components/Toast";
import Button from "@/components/ui/Button";

function AutoSyncPoliciesContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramPolicyId = searchParams.get("policy_id");

  const { policies, loading } = useAppSelector((state) => state.policy);

  const [currentView, setCurrentView] = useState<"grid" | "corporate">("grid");
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPolicies());
  }, [dispatch]);

  // Handle deep link by policy_id
  useEffect(() => {
    if (paramPolicyId && policies.length > 0) {
      const pId = parseInt(paramPolicyId, 10);
      if (!isNaN(pId)) {
        const matched = policies.find((p) => p.policy_id === pId);
        if (matched) {
          setEditingPolicyId(pId);
          setCurrentView("corporate");
        }
      }
    }
  }, [paramPolicyId, policies]);

  const activePolicy =
    policies.find((p) => p.policy_id === editingPolicyId) || null;

  const handleCreatePolicy = (policyData: {
    name: string;
    interval: string;
    on: string;
    retention: string;
  }) => {
    const intervalOpt =
      SYNC_INTERVAL_API_MAP[policyData.interval as SyncIntervalOption];
    const backendInterval = intervalOpt ? intervalOpt.interval : "nightly";
    const backendOn =
      policyData.interval === "Daily" ||
      policyData.interval === "Weekly" ||
      policyData.interval === "Monthly"
        ? policyData.on
        : intervalOpt
          ? intervalOpt.on
          : "";
    const backendRetention =
      RETENTION_API_MAP[policyData.retention as RetentionOption] || "never";

    dispatch(
      createPolicy({
        name: policyData.name,
        interval: backendInterval,
        on: backendOn,
        retention_type: backendRetention,
        job_ids: null, // empty policy
      }),
    );
  };

  const handleDeletePolicy = (policy: Policy) => {
    if (policy.linked_job_count > 0) {
      toast.error(
        `Cannot delete policy "${policy.name}" because it has ${policy.linked_job_count} linked job(s). Please move assignments first.`,
      );
      return;
    }
    if (confirm(`Are you sure you want to delete policy "${policy.name}"?`)) {
      dispatch(deletePolicy(policy.policy_id));
    }
  };

  return (
    <div
      className={`text-(--text-primary) ${currentView === "corporate" ? "h-[calc(100vh-160px)] flex flex-col" : "space-y-6"}`}
    >
      {/* HEADER */}
      {currentView !== "corporate" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none pb-2">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-(--text-primary) tracking-tight">
              Auto-Sync Policies
            </h1>
            <p className="text-xs font-bold text-(--text-muted) max-w-2xl leading-relaxed">
              Corporate sync templates — schedule, retention, and assignments.
              Manage mailboxes from Connected Accounts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateOpen(true)}>
              <span>+</span> Create Policy
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsMergeOpen(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-md border border-(--border) bg-(--bg-primary) hover:bg-(--bg-secondary) text-xs font-bold text-(--text-secondary) transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              <svg
                className="w-3.5 h-3.5 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
              </svg>
              Merge Policies
            </Button>
          </div>
        </div>
      )}

      {/* LOADING LOADER */}
      {loading && policies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-2 select-none">
          <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-md animate-spin"></div>
          <p className="text-xs font-bold text-(--text-muted)">
            Loading policies...
          </p>
        </div>
      )}

      {/* POLICIES GRID */}
      {currentView === "grid" && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.policy_id}
              policy={policy}
              onCreateClick={(p) => {
                setEditingPolicyId(p.policy_id);
                setCurrentView("corporate");
              }}
              onDeleteClick={handleDeletePolicy}
            />
          ))}
          {policies.length === 0 && (
            <div className="col-span-full text-center py-16 border border-dashed border-(--border) rounded-md bg-(--bg-secondary)/5">
              <span className="text-2xl">📋</span>
              <h3 className="text-sm font-extrabold text-(--text-primary) mt-3">
                No Policies Found
              </h3>
              <p className="text-xs font-bold text-(--text-muted) mt-1">
                Get started by creating your first corporate sync policy.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CORPORATE POLICIES VIEW */}
      {currentView === "corporate" && activePolicy && (
        <CorporateUserPolicies
          policy={activePolicy}
          onBack={() => {
            router.replace("/dashboard/autosync_polices");
            setCurrentView("grid");
            setEditingPolicyId(null);
            dispatch(fetchPolicies()); // Refresh grid list counts on back
          }}
        />
      )}

      {/* CREATE POLICY MODAL */}
      {isCreateOpen && (
        <CreatePolicyModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreatePolicy}
        />
      )}

      {/* MERGE POLICIES MODAL */}
      {isMergeOpen && (
        <MergePoliciesModal onClose={() => setIsMergeOpen(false)} />
      )}
    </div>
  );
}

export default function AutoSyncPoliciesPage() {
  return (
    <Suspense
      fallback={<div className="p-6">Loading auto-sync policies...</div>}
    >
      <AutoSyncPoliciesContent />
    </Suspense>
  );
}
