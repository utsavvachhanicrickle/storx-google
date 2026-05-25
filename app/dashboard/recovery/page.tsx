"use client";
import { useState } from "react";
export default function RecoveryPage() {
  const [restoreChecked, setRestoreChecked] = useState<Record<string, boolean>>(
    {},
  );
  const [logsList, setLogsList] = useState<
    Array<{
      id: number;
      action: string;
      user: string;
      service: string;
      detail: string;
      time: string;
    }>
  >([]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-(--text-primary)">
            1-Click Restoration Explorer
          </h2>

          <p className="text-sm font-medium text-(--text-muted) mt-1 max-w-2xl">
            Explore encrypted file trees and perform zero-knowledge data
            restores.
          </p>
        </div>

        {/* PRIMARY ACTION */}
        <button
          onClick={() => {
            const keys = Object.keys(restoreChecked).filter(
              (k) => restoreChecked[k],
            );

            if (!keys.length) {
              alert("Select files/folders first to restore.");
              return;
            }

            alert(`Restore queued for ${keys.length} items`);

            setLogsList((prev) => [
              {
                id: Date.now(),
                action: "Restore Process Initialized",
                user: "admin@acme.com",
                service: "Drive",
                detail: `Restored ${keys.length} items`,
                time: "Just now",
              },
              ...prev,
            ]);

            setRestoreChecked({});
          }}
          className=" bg-(--primary)` hover:bg-(--primary-hover)  text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm  transition-all  hover:scale-[1.01]
        "
        >
          🚀 Restore Selected (
          {Object.keys(restoreChecked).filter((k) => restoreChecked[k]).length})
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        {/* HEADER BAR */}
        <div className="px-5 py-3 bg-(--bg-secondary) border-b border-(--border) flex justify-between items-center text-xs font-semibold">
          <span className="text-(--text-primary)">
            Acme Corp Backup Directory
          </span>

          <span className="text-(--text-muted)">
            Latest Snapshot • 12 mins ago
          </span>
        </div>

        {/* FILE LIST */}
        <div className="p-4 space-y-2">
          {[
            {
              path: "/Drive/Corporate/Project Proposal Q4.pdf",
              size: "12 MB",
              owner: "alice@acme.com",
            },
            {
              path: "/Drive/Finance/Q3 Audit Sheet.xlsx",
              size: "4.5 MB",
              owner: "finance@acme.com",
            },
            {
              path: "/Gmail/Inbox/Contract Signature Required.eml",
              size: "150 KB",
              owner: "bob@acme.com",
            },
            {
              path: "/Drive/Marketing/Logo Assets.zip",
              size: "45 MB",
              owner: "marketing@acme.com",
            },
            {
              path: "/Drive/Corporate/Team Photo 2026.png",
              size: "8.2 MB",
              owner: "alice@acme.com",
            },
          ].map((item, i) => (
            <div
              key={i}
              className=" flex items-center justify-between px-3 py-3 rounded-xl border border-transparent hover:border-(--primary)/20 hover:bg-(--bg-secondary)/40 transition-all group"
            >
              {/* LEFT */}
              <label className="flex items-center flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!restoreChecked[item.path]}
                  onChange={(e) =>
                    setRestoreChecked({
                      ...restoreChecked,
                      [item.path]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-(--primary)"
                />

                <div className="ml-3">
                  <div className="text-sm font-semibold text-(--text-primary) group-hover:text-(--primary) transition-colors">
                    {item.path}
                  </div>

                  <div className="text-[11px] text-(--text-muted) font-medium">
                    Owner: {item.owner}
                  </div>
                </div>
              </label>

              {/* RIGHT */}
              <span className="text-xs font-semibold text-(--text-secondary) bg-(--bg-secondary) px-2.5 py-1 rounded-md border border-(--border)">
                {item.size}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
