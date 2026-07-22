"use client";

/**
 * useRestoreLive — Global Restore Job Live Polling Hook
 *
 * Called from DashboardLayout on mount.
 * Polls GET /api/v0/google-backup/restore/live every 10 seconds.
 * Returns the count of currently active (in_progress + pending) restore jobs.
 * Used to show a live restore badge in the header across all dashboard pages.
 */

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLiveRestoreJobs } from "@/store/slices/restoreSlice";
import { fetchNotificationsCount } from "@/store/slices/notificationSlice";

const POLL_INTERVAL_MS = 60_000;

export function useRestoreLive() {
  const dispatch = useAppDispatch();
  const activeJobCount = useAppSelector(
    (state) => state.restore.activeJobCount,
  );
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(false);

  const poll = useCallback(async () => {
    try {
      if (mountedRef.current) {
        await dispatch(fetchLiveRestoreJobs()).unwrap();
        await dispatch(fetchNotificationsCount()).unwrap();
      }
    } catch {
      // silently ignore — this is a background poll
    }
  }, [dispatch]);

  useEffect(() => {
    mountedRef.current = true;

    // Initial call on layout mount
    poll();

    // Start polling every 10s
    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [poll]);

  return { activeJobCount };
}
