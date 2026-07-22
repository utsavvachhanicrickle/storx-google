"use client";

import Button from "@/components/ui/Button";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Table, { TableColumn } from "@/components/ui/TableCompoenets";

const mockVaults = [
  {
    id: "LV-7659",
    name: "On-Prem NAS 1",
    path: "/mnt/cyberls_backup_1",
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

const vaultsTableColumns: TableColumn[] = [
  {
    key: "name",
    label: "Vault Name",
    type: "component",
    value: (row: any) => (
      <div className="flex flex-col">
        <span className="font-bold">{row.name}</span>
        <span className="text-xs text-(--text-muted)">{row.id}</span>
      </div>
    ),
  },
  {
    key: "path",
    label: "Location / Path",
  },
  {
    key: "status",
    label: "Status",
    cellClassName: (value) => {
      const base =
        "text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md w-fit flex items-center gap-1 before:content-[''] before:w-1 before:h-1 before:rounded-md";

      if (value === "ONLINE") {
        return base + " bg-green-500/10 text-green-500 before:bg-green-500";
      }

      if (value === "SYNCING") {
        return base + " bg-yellow-500/10 text-yellow-500 before:bg-yellow-500";
      }

      return base + " bg-gray-500/10 text-gray-500 before:bg-gray-500";
    },
  },
  {
    key: "capacity",
    label: "Capacity Used",
    cellClassName: () => "text-sm font-medium text-(--text-secondary)",
  },
  {
    key: "actionsComponent",
    label: "Actions",
    type: "actions",
    className: "text-right",
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
          <h1 className="text-2xl font-extrabold tracking-tight text-(--text-primary)">
            Local Vaults
          </h1>

          <p className="text-sm text-(--text-secondary) mt-1">
            Provision and manage on-premises storage targets for hybrid backup.
          </p>
        </div>

        {vaults.length > 0 && (
          <Button onClick={handleProvisionVault}>
            <AddIcon />
            Provision Local Vault
          </Button>
        )}
      </div>

      {/* Empty State */}
      {vaults.length === 0 && !creating && (
        <div className="bg-(--bg-primary) border border-(--border) rounded-md p-14 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 rounded-md bg-(--bg-secondary) border border-(--border) flex items-center justify-center text-5xl">
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

          <Button onClick={handleProvisionVault} className="mt-8 px-6 py-3 ">
            <AddIcon />
            Provision First Local Vault
          </Button>
        </div>
      )}

      {/* Provision Process */}
      {creating && (
        <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-(--border) flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-(--text-primary)">
                Provisioning Local Vault
              </h3>

              <p className="text-xs text-(--text-muted) mt-1">
                Secure infrastructure setup in progress.
              </p>
            </div>

            <div className="w-10 h-10 rounded-md border-2 border-(--primary) border-t-transparent animate-spin" />
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
        <Table
          thead={vaultsTableColumns}
          tbody={mockVaults}
          actions={[
            {
              label: "Configure",

              onClick: (row) => {
                alert(row.id);
              },
              className:
                "rounded-sm! bg-none! border-2 border-(--border)! text-(--text-primary)!",
            },
          ]}
        />
      )}
    </div>
  );
}
