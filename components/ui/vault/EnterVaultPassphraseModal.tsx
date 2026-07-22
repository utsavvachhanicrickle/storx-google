"use client";

import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import CircularProgress from "@mui/material/CircularProgress";

interface EnterVaultPassphraseModalProps {
  isOpen: boolean;
  bucketName?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (passphrase: string) => Promise<void>;
}

export default function EnterVaultPassphraseModal({
  isOpen,
  bucketName,
  loading = false,
  onClose,
  onSubmit,
}: EnterVaultPassphraseModalProps) {
  const [passphrase, setPassphrase] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;
    await onSubmit(passphrase.trim());
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-(--border) bg-(--bg-primary) shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
          <div className="flex items-center gap-2">
            <LockIcon sx={{ fontSize: 20 }} className="text-(--primary)" />
            <h3 className="text-lg font-bold text-(--text-primary)">
              Unlock Vault
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-(--text-muted) hover:bg-(--bg-secondary) cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <p className="text-sm text-(--text-secondary)">
            Enter your encryption passphrase to browse
            {bucketName ? (
              <>
                {" "}
                the <strong>{bucketName}</strong> vault
              </>
            ) : (
              " backed-up data"
            )}
            . This matches the cyberlsweb vault unlock flow.
          </p>

          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Vault passphrase"
            className="w-full rounded border border-(--border) bg-(--bg-secondary) px-4 py-2.5 text-sm text-(--text-primary) focus:border-(--primary) focus:outline-none"
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-(--border) px-4 py-2 text-sm font-bold text-(--text-secondary) hover:bg-(--bg-secondary) cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !passphrase.trim()}
              className="flex items-center gap-2 rounded bg-(--primary) px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {loading && <CircularProgress size={14} color="inherit" />}
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
