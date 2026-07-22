"use client";

import Button from "@/components/ui/Button";
import {
  formatPolicy,
  Policy,
  LinkedJob,
} from "@/utils/constants/policy_constants";
import ServiceIcon from "@/components/ui/ServiceIcon";

interface PolicyCardProps {
  policy: Policy;
  onCreateClick: (policy: Policy) => void;
  onToggleActive?: (policy: Policy) => void;
  onDeleteClick?: (policy: Policy) => void;
}

/** Red chain-link icon — signals an inactive / broken connection */
function LinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* broken chain */}
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      <line x1="4" y1="4" x2="20" y2="20" strokeDasharray="3 2" />
    </svg>
  );
}

export default function PolicyCard({
  policy,
  onCreateClick,
  onDeleteClick,
}: PolicyCardProps) {
  const isGreenValue =
    policy.interval.includes("Real-Time") ||
    policy.interval === "12 Hours" ||
    policy.next_backup === "Continuous" ||
    policy.next_backup === "In 42 mins" ||
    policy.next_backup === "In 1 hr" ||
    policy.next_backup === "In 6 hours" ||
    policy.next_backup === "In 12 hours";

  return (
    <div className="bg-(--bg-primary) border rounded-md p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border-(--border)">
      <div>
        {/* TOP HEADER */}
        <div className="flex justify-between items-start mb-4 select-none">
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-extrabold text-(--text-primary) tracking-tight leading-none truncate"
              title={policy.name}
            >
              {policy.name}
            </h3>
            <p className="text-[11px] font-bold text-(--text-muted) mt-2.5">
              {policy.type === "Group"
                ? `Applied to: ${policy.applied_to || policy.linked_job_count || policy.assignment_count || 0} Users`
                : ``}
            </p>
          </div>

          {policy.badge && (
            <span
              className={`ml-2 shrink-0 text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase ${
                policy.badge === "DEFAULT"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : policy.badge === "POLICY"
                    ? "bg-indigo-500/10 text-indigo-600"
                    : policy.badge === "COMPLIANCE"
                      ? "bg-purple-500/10 text-purple-600"
                      : "bg-amber-500/10 text-amber-600"
              }`}
            >
              {policy.badge}
            </span>
          )}
        </div>

        {/* DETAILS ROWS */}
        <div className="space-y-0.5 flex-1 select-none">
          {/* Sync Interval */}
          <div className="flex justify-between items-center py-2.5 border-b border-(--border-light)">
            <span className="text-xs font-bold text-(--text-muted)">
              Sync Interval
            </span>
            <span
              className={`text-xs font-black tracking-tight ${
                isGreenValue ? "text-(--primary)" : "text-(--text-primary)"
              }`}
            >
              {formatPolicy(policy.interval, policy.on)}
            </span>
          </div>

          {/* Next Backup */}
          {policy.next_backup && (
            <div className="flex justify-between items-center py-2.5 border-b border-(--border-light)">
              <span className="text-xs font-bold text-(--text-muted)">
                Next Backup
              </span>
              <span
                className={`text-xs font-black tracking-tight ${
                  isGreenValue ? "text-(--primary)" : "text-(--text-primary)"
                }`}
              >
                {policy.next_backup}
              </span>
            </div>
          )}

          {/* Retention */}
          <div className="flex justify-between items-center py-2.5 border-b border-(--border-light)">
            <span className="text-xs font-bold text-(--text-muted)">
              Retention
            </span>
            <span className="text-xs font-black text-(--text-primary) tracking-tight">
              {policy.retention_type || "Infinite"}
            </span>
          </div>

          {/* Services */}
          {policy.services && policy.services.length > 0 && (
            <div className="flex justify-between items-center py-2.5 border-b border-(--border-light) last:border-none">
              <span className="text-xs font-bold text-(--text-muted)">
                Services
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {policy.services.map((s) => (
                  <div
                    key={s}
                    title={
                      s === "gmail"
                        ? "Gmail"
                        : s.charAt(0).toUpperCase() + s.slice(1)
                    }
                  >
                    <ServiceIcon name={s} className="w-4.5 h-4.5 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => onCreateClick(policy)}
          className="flex-1 py-2.5 text-xs font-bold bg-(--primary) hover:bg-(--primary-hover) text-(--text-inverse) rounded-md transition-all cursor-pointer text-center block shadow-sm"
        >
          Manage Policy
        </button>
        {onDeleteClick && (
          <button
            onClick={() => onDeleteClick(policy)}
            className="p-2.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer flex items-center justify-center shadow-xs"
            title="Delete Policy"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
