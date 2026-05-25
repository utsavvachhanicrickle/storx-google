"use client";

import { useState } from "react";

const mockVaults = [
  {
    id: "LV-7659",
    name: "On-Prem NAS 1",
    path: "/mnt/storx_backup_1",
    status: "ONLINE",
    capacity: "0 B / 5 TB",
  },
  {
    id: "LV-9120",
    name: "Disaster Recovery Vault",
    path: "/mnt/dr_cluster_node",
    status: "ONLINE",
    capacity: "1.2 TB / 10 TB",
  },
  {
    id: "LV-2201",
    name: "Cold Archive Storage",
    path: "/mnt/archive_vault",
    status: "SYNCING",
    capacity: "420 GB / 2 TB",
  },
];

export default function LocalVaultsPage() {
  const [vaults, setVaults] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleProvisionVault = () => {
    setCreating(true);
    setCompleted(false);
    setLogs([]);

    const processLogs = [
      "Initializing secure local vault service...",
      "Scanning mounted storage devices...",
      "Generating zero-knowledge encryption keys...",
      "Provisioning isolated backup partition...",
      "Configuring sync workers...",
      "Establishing secure snapshot engine...",
      "Verifying vault integrity...",
      "Registering local vault with control plane...",
      "Provisioning complete.",
    ];

    let i = 0;

    const interval = setInterval(() => {
      if (i < processLogs.length) {
        setLogs((prev) => [...prev, processLogs[i]]);
        i++;
      } else {
        clearInterval(interval);

        setCompleted(true);

        setTimeout(() => {
          setVaults(mockVaults);
          setCreating(false);
        }, 1200);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-(--bg) p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-(--text-primary)">
            Local Vaults
          </h1>

          <p className="text-sm text-(--text-secondary) mt-1">
            Provision and manage on-premises storage targets for hybrid backup.
          </p>
        </div>

        {vaults.length > 0 && (
          <button
            onClick={handleProvisionVault}
            className="bg-(--primary) hover:bg-(--primary-hover) text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            + Provision Local Vault
          </button>
        )}
      </div>

      {/* Empty State */}
      {vaults.length === 0 && !creating && (
        <div className="bg-(--bg-primary) border border-(--border) rounded-3xl p-14 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 rounded-3xl bg-(--bg-secondary) border border-(--border) flex items-center justify-center text-5xl">
            🗄️
          </div>

          <h2 className="text-2xl font-black text-(--text-primary) mt-8">
            No Local Vaults Connected
          </h2>

          <p className="text-sm text-(--text-secondary) max-w-lg mt-3 leading-relaxed">
            Provision secure on-premises vault locations to enable hybrid backup
            architecture with zero-knowledge encryption and local disaster
            recovery.
          </p>

          <button
            onClick={handleProvisionVault}
            className="mt-8 bg-(--primary) hover:bg-(--primary-hover) text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-teal-500/10"
          >
            + Provision First Local Vault
          </button>
        </div>
      )}

      {/* Provision Process */}
      {creating && (
        <div className="bg-(--bg-primary) border border-(--border) rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-(--border) flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-(--text-primary)">
                Provisioning Local Vault
              </h3>

              <p className="text-xs text-(--text-muted) mt-1">
                Secure infrastructure setup in progress.
              </p>
            </div>

            <div className="w-10 h-10 rounded-full border-2 border-(--primary) border-t-transparent animate-spin" />
          </div>

          <div className="bg-slate-950 p-6 h-[320px] overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div
                key={index}
                className="text-emerald-400 mb-3 flex items-start gap-3"
              >
                <span className="text-slate-500">{">"}</span>

                <span>{log}</span>
              </div>
            ))}

            {!completed && (
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-4 bg-emerald-400 animate-pulse" />
              </div>
            )}
          </div>

          {completed && (
            <div className="px-6 py-5 border-t border-(--border) bg-(--bg-secondary)">
              <div className="flex items-center gap-3 text-emerald-500 font-bold">
                <span className="text-xl">✓</span>

                <span>Vault provisioned successfully.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vault Table */}
      {vaults.length > 0 && !creating && (
        <div className="bg-(--bg-primary) border border-(--border) rounded-3xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr_140px] px-6 py-4 border-b border-(--border) bg-(--bg-secondary)">
            <div className="text-xs font-black uppercase tracking-wide text-(--text-muted)">
              Vault Name
            </div>

            <div className="text-xs font-black uppercase tracking-wide text-(--text-muted)">
              Location / Path
            </div>

            <div className="text-xs font-black uppercase tracking-wide text-(--text-muted">
              Status
            </div>

            <div className="text-xs font-black uppercase tracking-wide text-(--text-muted">
              Capacity Used
            </div>

            <div className="text-xs font-black uppercase tracking-wide text-right text-(--text-muted">
              Actions
            </div>
          </div>

          {/* Table Body */}
          <div>
            {vaults.map((vault, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.5fr_2fr_1fr_1fr_140px] items-center px-6 py-5 border-b border-(--border) hover:bg-(--bg-secondary) transition-colors"
              >
                {/* Name */}
                <div>
                  <div className="font-bold text-[15px] text-(--text-primary)">
                    {vault.name}
                  </div>

                  <div className="text-xs text-(--text-muted) mt-1">
                    ID: {vault.id}
                  </div>
                </div>

                {/* Path */}
                <div>
                  <span className="bg-(--bg-secondary) border border-(--border) px-3 py-2 rounded-lg text-xs font-mono text-(--text-secondary)">
                    {vault.path}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      vault.status === "ONLINE"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    ● {vault.status}
                  </span>
                </div>

                {/* Capacity */}
                <div className="text-sm font-medium text-(--text-secondary)">
                  {vault.capacity}
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <button className="border border-(--border) hover:bg-(--bg-secondary) px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
