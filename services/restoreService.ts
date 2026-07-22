import { API } from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RestoreJob {
  progress_percent: any;
  success: any;
  ID: string;
  JobID: string;          // e.g. "#RST-9042"
  Target: string;         // file/folder/item name or message being restored
  Service: string;        // "gmail" | "drive" | "photos" | "contacts" | "calendar"
  InitiatedBy: string;    // email or display name of the initiator
  Status: string;         // "in_progress" | "completed" | "failed" | "pending"
  Progress: number;       // 0–100
  created_at: string;
  updated_at: string;
}

export interface RestoreJobsFilter {
  service?: string;
  method?: string;
  status?: string;
  search?: string;
  email?: string;
  from_time?: string;
  to_time?: string;
  limit?: string | number;
  offset?: string | number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const restoreService = {
  /**
   * GET /api/v0/google-backup/restore/jobs
   * Full list of ALL restore jobs (completed + in_progress + failed + pending).
   * Supports backend-driven queries and filter parameters.
   */
  getRestoreJobs: async (params?: RestoreJobsFilter): Promise<any> => {
    const response = await API.get("/google-backup/restore/jobs", { params });
    return response.data;
  },

  /**
   * GET /api/v0/google-backup/restore/live
   * Returns ONLY currently active jobs (in_progress + pending).
   * Lightweight — used for polling to update progress on running jobs.
   */
  getLiveJobs: async (): Promise<any> => {
    const response = await API.get("/google-backup/restore/live");
    return response.data;
  },

  /**
   * GET /api/v0/google-backup/restore/prepare
   * Check restore preparation, required permissions, items count, etc.
   */
  prepareRestoreAll: async (params: { project_id: string; login_id: string; service: string }) => {
    const response = await API.get("/google-backup/restore/prepare", { params });
    return response.data;
  },

  /**
   * POST /api/v0/google-backup/restore/all
   * Initiates restore all task.
   */
  restoreAll: async (body: { project_id: string; login_id: string; service: string }) => {
    const response = await API.post("/google-backup/restore/all", body);
    return response.data;
  },

  exchangeGoogleToken: async (googleKey: string): Promise<string> => {
    const response = await API.post("/google-backup/google-auth", {
      google_key: googleKey,
    });
    return response.data["google-auth"] || response.data.google_auth;
  },

  restoreGmail: async (googleAuth: string, ids: string[]) => {
    const response = await API.post(
      "/google-backup/google/gmail/insert-mail",
      { ids },
      { headers: { Authorization: googleAuth } },
    );
    return response.data;
  },

  restoreCalendar: async (googleAuth: string, ids: string[]) => {
    const response = await API.post(
      "/google-backup/google/satellite-to-calendar",
      { ids },
      { headers: { Authorization: googleAuth } },
    );
    return response.data;
  },

  restoreContacts: async (googleAuth: string, ids: string[]) => {
    const response = await API.post(
      "/google-backup/google/satellite-to-contacts",
      { ids },
      { headers: { Authorization: googleAuth } },
    );
    return response.data;
  },

  restoreDrive: async (googleAuth: string, ids: string[]) => {
    const response = await API.post(
      "/google-backup/google/satellite-to-drive",
      { ids },
      { headers: { Authorization: googleAuth } },
    );
    return response.data;
  },

  restorePhotos: async (googleAuth: string, ids: string[]) => {
    const response = await API.post(
      "/google-backup/google/satellite-to-photos",
      { ids },
      { headers: { Authorization: googleAuth } },
    );
    return response.data;
  },

  getRestoreCredentials: async (params?: { domain?: string; search?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.domain) query.append("domain", params.domain);
    if (params?.search) query.append("search", params.search);
    if (params?.limit !== undefined) query.append("limit", String(params.limit));
    if (params?.offset !== undefined) query.append("offset", String(params.offset));
    const qs = query.toString();
    console.log("query", qs);
    const response = await API.get(`/google-backup/restore/credentials${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  getRestoreWorkspaces: async (params?: { domain?: string; search?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.domain) query.append("domain", params.domain);
    if (params?.search) query.append("search", params.search);
    if (params?.limit !== undefined) query.append("limit", String(params.limit));
    if (params?.offset !== undefined) query.append("offset", String(params.offset));
    const qs = query.toString();
    const response = await API.get(`/google-backup/restore/workspaces${qs ? `?${qs}` : ""}`);
    return response.data;
  },
};
