"use client";

import React, { useState } from "react";
import toast from "@/components/Toast";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface SharedUser {
  email: string;
  role: "Viewer" | "Editor";
}

export default function SharingTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"Viewer" | "Editor">(
    "Viewer",
  );
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([
    { email: "admin@acme.com", role: "Editor" },
    { email: "security-audit@acme.com", role: "Viewer" },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    if (!searchTerm.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (
      sharedUsers.some(
        (u) => u.email.toLowerCase() === searchTerm.toLowerCase(),
      )
    ) {
      toast.error("User already invited.");
      return;
    }
    setSharedUsers((prev) => [
      ...prev,
      { email: searchTerm, role: selectedRole },
    ]);
    setSearchTerm("");
    toast.success(`Invitation sent to ${searchTerm}!`);
  };

  const handleRemove = (email: string) => {
    setSharedUsers((prev) => prev.filter((u) => u.email !== email));
    toast.success(`Removed access for ${email}`);
  };

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-y-auto bg-(--bg-primary) text-(--text-primary)">
      <div>
        <span className="text-xs font-black uppercase text-(--text-muted) tracking-wider block mb-2">
          Share Access / Invite Users
        </span>
        <form
          onSubmit={handleInvite}
          className="flex gap-2 flex-col sm:flex-row"
        >
          <input
            type="email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter coworker's email..."
            className="flex-1 px-4 py-2 text-sm border border-(--border) rounded-sm bg-(--bg-primary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--text-muted)"
          />
          <div className="flex gap-2 shrink-0">
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as "Viewer" | "Editor")
              }
              className="px-3 py-2 text-sm border border-(--border) rounded-sm bg-(--bg-primary) text-(--text-primary) cursor-pointer"
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-(--primary) hover:bg-(--primary-hover) active:scale-97 transition rounded-sm flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap"
            >
              <PersonAddIcon sx={{ fontSize: 14 }} />
              Invite
            </button>
          </div>
        </form>
      </div>

      <div className="mt-2 flex-1 flex flex-col min-h-0">
        <span className="text-xs font-black uppercase text-(--text-muted) tracking-wider block mb-2">
          Users with access ({sharedUsers.length})
        </span>

        {sharedUsers.length === 0 ? (
          <div className="border border-dashed border-(--border) rounded-md p-8 text-center text-xs font-bold text-(--text-muted)">
            No sharing invites active for this account.
          </div>
        ) : (
          <div className="border border-(--border) rounded-md overflow-hidden shadow-2xs divide-y divide-(--border-light) bg-(--bg-secondary)/20 max-h-[220px] overflow-y-auto">
            {sharedUsers.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3.5 hover:bg-(--bg-secondary)/50 transition select-none"
              >
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-(--text-primary) truncate">
                    {user.email}
                  </p>
                  <p className="text-[10px] font-bold text-(--text-muted) mt-0.5 font-mono uppercase">
                    Role: {user.role}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(user.email)}
                  title="Revoke Access"
                  className="p-1.5 rounded-sm text-(--danger) hover:bg-(--danger)/10 active:scale-95 transition cursor-pointer shrink-0"
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
