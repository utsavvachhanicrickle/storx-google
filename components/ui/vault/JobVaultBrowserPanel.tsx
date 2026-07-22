"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import StorageIcon from "@mui/icons-material/Storage";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import toast from "@/components/Toast";
import { useAppSelector } from "@/store/hooks";
import { bucketService } from "@/services/bucketService";
import { useVaultBrowser } from "@/hooks/useVaultBrowser";
import { getVaultBucketForMethod } from "@/utils/vaultMapping";
import type { ReservedBucketUsage, VaultBrowserObject } from "@/types/vault";
import EnterVaultPassphraseModal from "./EnterVaultPassphraseModal";
import VaultObjectBrowser from "./VaultObjectBrowser";

export interface JobVaultContext {
  id: string;
  email: string;
  name?: string;
  method: string;
  projectId?: string;
}

interface JobVaultBrowserPanelProps {
  job: JobVaultContext | null;
  onClose: () => void;
}

function formatStorage(gb?: number): string {
  if (gb == null) return "—";
  if (gb < 1) return `${(gb * 1024).toFixed(1)} MB`;
  return `${gb.toFixed(2)} GB`;
}

export default function JobVaultBrowserPanel({
  job,
  onClose,
}: JobVaultBrowserPanelProps) {
  const { projects } = useAppSelector((state) => state.project);
  const {
    unlock,
    listObjects,
    lock,
    unlocking,
    listing,
    isUnlocked,
    error: vaultError,
  } = useVaultBrowser();

  const [visible, setVisible] = useState(false);
  const [reservedBuckets, setReservedBuckets] = useState<ReservedBucketUsage[]>(
    [],
  );
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [objects, setObjects] = useState<VaultBrowserObject[]>([]);
  const [prefix, setPrefix] = useState("");

  const projectId = job?.projectId || projects[0]?.id || "";
  const bucketName = useMemo(
    () => getVaultBucketForMethod(job?.method) ?? "",
    [job?.method],
  );

  const bucketUsage = useMemo(
    () =>
      reservedBuckets.find(
        (b) => b.bucketName?.toLowerCase() === bucketName.toLowerCase(),
      ),
    [reservedBuckets, bucketName],
  );

  const emailPrefix = useMemo(() => {
    if (!job?.email) return "";
    return `${job.email.toLowerCase()}/`;
  }, [job?.email]);

  useEffect(() => {
    if (job) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [job]);

  useEffect(() => {
    if (!job || !projectId) return;

    setLoadingBuckets(true);
    bucketService
      .getUsageTotalsForReserved(projectId)
      .then(setReservedBuckets)
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load vault information.");
      })
      .finally(() => setLoadingBuckets(false));
  }, [job, projectId]);

  const loadObjects = useCallback(
    async (nextPrefix: string) => {
      if (!bucketName || !isUnlocked) return;
      try {
        const items = await listObjects(bucketName, nextPrefix);
        setObjects(items);
        setPrefix(nextPrefix);
      } catch {
        toast.error("Could not list vault items.");
      }
    },
    [bucketName, isUnlocked, listObjects],
  );

  useEffect(() => {
    if (isUnlocked && bucketName) {
      loadObjects(emailPrefix);
    }
  }, [isUnlocked, bucketName, emailPrefix, loadObjects]);

  const handleClose = () => {
    setVisible(false);
    lock();
    setObjects([]);
    setPrefix("");
    setShowPassphraseModal(false);
    setTimeout(onClose, 250);
  };

  const handleUnlock = async (passphrase: string) => {
    if (!projectId) {
      toast.error("Project ID is missing.");
      return;
    }
    try {
      await unlock(projectId, passphrase);
      setShowPassphraseModal(false);
      toast.success("Vault unlocked.");
    } catch {
      toast.error("Invalid passphrase or vault unlock failed.");
    }
  };

  if (!job) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-100 bg-black/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed top-0 right-0 z-101 flex h-full w-full max-w-4xl flex-col border-l border-(--border) bg-(--bg-primary) shadow-2xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-(--text-primary)">
              Vault Browser
            </h2>
            <p className="text-xs text-(--text-muted) mt-0.5">
              {job.email} · {job.method}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-1.5 text-(--text-muted) hover:bg-(--bg-secondary) cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[280px_1fr]">
          <aside className="border-b md:border-b-0 md:border-r border-(--border) p-4 space-y-4 overflow-y-auto">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-(--text-muted) mb-2">
                Related Vault
              </div>
              {loadingBuckets ? (
                <div className="text-sm text-(--text-muted)">Loading...</div>
              ) : bucketName ? (
                <div className="rounded-lg border border-(--border) bg-(--bg-secondary) p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <StorageIcon
                      sx={{ fontSize: 18 }}
                      className="text-(--primary)"
                    />
                    <span className="font-bold text-(--text-primary)">
                      {bucketName}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-(--text-secondary)">
                    <div className="flex justify-between">
                      <span>Storage</span>
                      <span className="font-bold">
                        {formatStorage(bucketUsage?.storage)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items</span>
                      <span className="font-bold">
                        {bucketUsage?.objectCount ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account filter</span>
                      <span className="font-bold truncate max-w-[120px]">
                        {job.email}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-rose-500">
                  No vault mapped for this service.
                </div>
              )}
            </div>

            {!isUnlocked ? (
              <button
                onClick={() => setShowPassphraseModal(true)}
                disabled={!bucketName}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <LockOpenIcon sx={{ fontSize: 18 }} />
                Unlock Vault
              </button>
            ) : (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600">
                Vault unlocked
              </div>
            )}

            {vaultError && (
              <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {vaultError}
              </div>
            )}
          </aside>

          <section className="min-h-0 flex flex-col">
            {!isUnlocked ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <StorageIcon
                  sx={{ fontSize: 48 }}
                  className="text-(--text-muted) mb-4"
                />
                <p className="text-sm font-bold text-(--text-primary)">
                  Unlock the vault to browse backed-up items
                </p>
                <p className="text-xs text-(--text-muted) mt-2 max-w-sm">
                  Backup data for Google jobs is stored in reserved S3 vaults
                  (e.g. gmail, google-drive). Use the same passphrase as
                  cyberlsweb.
                </p>
              </div>
            ) : (
              <VaultObjectBrowser
                bucketName={bucketName}
                prefix={prefix}
                objects={objects}
                loading={listing}
                onNavigatePrefix={loadObjects}
                onOpenFolder={loadObjects}
              />
            )}
          </section>
        </div>
      </div>

      <EnterVaultPassphraseModal
        isOpen={showPassphraseModal}
        bucketName={bucketName}
        loading={unlocking}
        onClose={() => setShowPassphraseModal(false)}
        onSubmit={handleUnlock}
      />
    </>
  );
}
