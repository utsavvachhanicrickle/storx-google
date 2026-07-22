"use client";

import React from "react";

interface OverviewTabProps {
  active: boolean;
  lastBackup: string;
  nextBackup: string;
  onToggleActive: (active: boolean) => void;
  onRestore: () => void;
}

export default function OverviewTab({
  active,
  lastBackup,
  nextBackup,
  onToggleActive,
  onRestore,
}: OverviewTabProps) {
  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto bg-(--bg-primary) text-(--text-primary)">
      {/* Backup Status Row */}
      <div className="flex items-center justify-between p-4 bg-(--bg-secondary) border border-(--border) rounded-md shadow-2xs">
        <div>
          <span className="text-xs font-black uppercase text-(--text-muted) tracking-wider">
            Backup status
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-[6px] text-xs font-bold border transition ${
            active
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          }`}
        >
          {active ? "Active" : "Paused"}
        </span>
      </div>

      {/* Toggle Pause Row */}
      <div className="flex items-center justify-between p-4 bg-(--bg-secondary) border border-(--border) rounded-md shadow-2xs">
        <div>
          <span className="text-xs font-black uppercase text-(--text-muted) tracking-wider">
            Pause backup
          </span>
          <p className="text-[11px] font-bold text-(--text-muted) mt-0.5">
            Temporarily halt backups for this mailbox.
          </p>
        </div>
        <input
          type="checkbox"
          checked={!active}
          onChange={(e) => onToggleActive(!e.target.checked)}
          className="w-5 h-5 accent-(--primary) border-(--border) rounded-md cursor-pointer focus:ring-0"
        />
      </div>

      {/* Grid of Last/Next times */}
      <div className="grid grid-cols-2 gap-4">
        {/* Last Backup Card */}
        <div className="p-4 bg-(--bg-secondary) border border-(--border) rounded-md shadow-2xs flex flex-col">
          <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-wider">
            Last backup
          </span>
          <span className="text-sm font-extrabold text-(--text-primary) mt-1.5 font-mono">
            {lastBackup || "--"}
          </span>
        </div>

        {/* Next Backup Card */}
        <div className="p-4 bg-(--bg-secondary) border border-(--border) rounded-md shadow-2xs flex flex-col">
          <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-wider">
            Next backup
          </span>
          <span className="text-sm font-extrabold text-(--text-primary) mt-1.5 font-mono">
            {nextBackup || "--"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button
          onClick={onRestore}
          className="w-full py-3 px-5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-99 transition rounded-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          Restore This Account
        </button>
      </div>
    </div>
  );
}
