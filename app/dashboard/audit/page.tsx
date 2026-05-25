"use client";

const auditLogs = [
  {
    time: "2026-05-25 11:30:12",
    user: "admin@acme.com",
    module: "Restoration",
    action: "Triggered 1-click restore for /Projects/v2",
    ip: "192.168.1.42",
    status: "SUCCESS",
  },
  {
    time: "2026-05-25 11:20:00",
    user: "system",
    module: "Auto-Sync",
    action: "Completed hourly sync (1,402 items updated)",
    ip: "Local Worker",
    status: "COMPLETED",
  },
  {
    time: "2026-05-25 10:45:50",
    user: "admin@acme.com",
    module: "Authentication",
    action: "Successful admin login via OAuth",
    ip: "192.168.1.42",
    status: "AUTHORIZED",
  },
  {
    time: "2026-05-25 10:40:02",
    user: "system",
    module: "Installation",
    action: "Initial secure vault configured and key initialized",
    ip: "Bootstrap Script",
    status: "INITIALIZED",
  },
  {
    time: "2026-05-25 09:52:18",
    user: "security@acme.com",
    module: "Threat Detection",
    action: "Suspicious deletion anomaly detected in Drive backup",
    ip: "172.16.0.8",
    status: "WARNING",
  },
];

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-(--bg) p-5">
        <div className="px-6 py-5 border-b border-(--border) flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-(--text-primary)">
              Compliance Audit Logs
            </h1>

            <p className="text-sm text-(--text-secondary) mt-1">
              Immutable record of administrator actions and secure sync events.
            </p>
          </div>

          <button className="bg-(--primary) hover:bg-(--primary-hover) text-white px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-teal-500/10">
            Export Logs
          </button>
        </div>
      <div className="bg-(--bg-primary) border border-(--border) rounded-3xl shadow-sm overflow-hidden">
          {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-(--border) bg-(--bg-secondary)">
                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-black text-(--text-muted)">
                  Timestamp
                </th>

                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-black text-(--text-muted)">
                  User
                </th>

                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-black text-(--text-muted)">
                  Module
                </th>

                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-black text-(--text-muted)">
                  Action Details
                </th>

                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-black text-(--text-muted)">
                  Status
                </th>

                <th className="text-right px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-black text-(--text-muted)">
                  IP Address
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--border)">
              {auditLogs.map((log, i) => (
                <tr
                  key={i}
                  className="hover:bg-(--bg-secondary) transition-colors"
                >
                  {/* Time */}
                  <td className="px-6 py-5 text-sm text-(--text-secondary) whitespace-nowrap">
                    {log.time}
                  </td>

                  {/* User */}
                  <td className="px-6 py-5">
                    <div className="font-black text-sm text-(--text-primary)">
                      {log.user}
                    </div>
                  </td>

                  {/* Module */}
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-(--bg-secondary) border border-(--border) text-(--text-secondary)">
                      {log.module}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-5 text-sm text-(--text-secondary)">
                    {log.action}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : log.status === "WARNING"
                            ? "bg-rose-500/10 text-rose-500"
                            : log.status === "AUTHORIZED"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-violet-500/10 text-violet-500"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  {/* IP */}
                  <td className="px-6 py-5 text-right text-sm text-(--text-muted) whitespace-nowrap">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex items-center justify-between bg-(--bg-secondary)">
          <div className="text-xs text-(--text-muted)">
            Showing latest immutable audit events.
          </div>

          <div className="flex items-center gap-2">
            <button className="border border-(--border) hover:bg-(--bg-primary) px-4 py-2 rounded-xl text-xs font-black transition-colors">
              Previous
            </button>

            <button className="bg-(--primary) text-white px-4 py-2 rounded-xl text-xs font-black">
              1
            </button>

            <button className="border border-(--border) hover:bg-(--bg-primary) px-4 py-2 rounded-xl text-xs font-black transition-colors">
              2
            </button>

            <button className="border border-(--border) hover:bg-(--bg-primary) px-4 py-2 rounded-xl text-xs font-black transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
