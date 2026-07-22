import { API } from "./apiClient";

export interface CreateBackupJobRequest {
  emails: string[];
  interval: string;
  on: string;
  services: string[];
  policy_id?: number;
  policy_name?: string;
}

/**
 * Service to handle Google Backup auto-sync jobs API requests.
 */
export const jobService = {
  /**
   * Hits the POST /google-backup/auto-sync/jobs endpoint to create dynamic backup sync policies.
   */
  createUserJob: async (data: CreateBackupJobRequest) => {
    return API.post("/google-backup/auto-sync/jobs", data);
  },

  /**
   * Hits the GET /google-backup/auto-sync/jobs/services endpoint.
   */
  getServicesSummary: async () => {
    const response = await API.get("/google-backup/auto-sync/jobs/services");
    return response.data;
  },

  /**
   * Hits the GET /google-backup/auto-sync/jobs endpoint with an optional JSON filter.
   */
  getAutosyncJobs: async (filterObj?: any) => {
    const params: any = {};
    if (filterObj) {
      params.filter = JSON.stringify(filterObj);
    }
    const response = await API.get("/google-backup/auto-sync/jobs", { params });
    return response.data;
  },

  /**
   * Hits the GET /google-backup/auto-sync/job/{job_id} endpoint.
   */
  getJobDetails: async (job_id: number | string) => {
    const response = await API.get(`/google-backup/auto-sync/jobs/${job_id}`);
    return response.data;
  },

  /**
   * Hits the GET /google-backup/auto-sync/jobs endpoint to fetch backup auto-sync jobs.
   */
  getUserJobs: async () => {
    const response = await API.get("/google-backup/auto-sync/jobs");
    return response.data;
  },

  /**
   * Hits the GET /google-backup/auto-sync/jobs/{id} endpoint to fetch specific job details.
   */
  getUserJobDetails: async (id: number) => {
    const response = await API.get(`/google-backup/auto-sync/jobs/${id}`);
    return response.data;
  },

  /**
   * Hits the PUT /google-backup/auto-sync/jobs/{id} endpoint to update backup sync job details.
   */
  updateUserJob: async (id: number, data: any) => {
    console.log(data);

    const response = await API.put(`/google-backup/auto-sync/jobs/${id}`, data);
    return response.data;
  },

  /**
   * Hits the PUT /google-backup/auto-sync/job/{job_id} endpoint to activate a job.
   */
  activateUserJob: async (job_id: number | string) => {
    const response = await API.put(`/google-backup/auto-sync/jobs/${job_id}`, {
      active: true,
    });
    return response.data;
  },

  /**
   * Hits the PUT /google-backup/auto-sync/job/{job_id} endpoint to toggle/update active status.
   */
  toggleUserJob: async (job_id: number | string, active: boolean) => {
    const response = await API.put(`/google-backup/auto-sync/jobs/${job_id}`, {
      active,
    });
    return response.data;
  },

  /**
   * Hits the POST /google-backup/connect endpoint to establish account connection.
   */
  connectGoogleBackup: async (authCode: string, method?: string) => {
    return API.post("/google-backup/connect", {
      code: authCode,
      ...(method ? { method } : {}),
    });
  },

  /**
   * Hits the GET /google-backup/domain-users endpoint to fetch domain workspace users.
   */
  getGoogleBackupDomainUsers: async (email?: string) => {
    const response = await API.get("/google-backup/domain-users", {
      params: email ? { email } : {},
    });
    return response.data;
  },

  /**
   * Hits the PUT /google-backup/users-groups/jobs/active endpoint to bulk pause or resume jobs.
   */
  toggleMultipleJobsActive: async (jobIds: number[], active: boolean) => {
    return API.put("/google-backup/users-groups/jobs/active", {
      active,
      job_ids: jobIds,
    });
  },

  /**
   * Hits the PUT /google-backup/auto-sync/jobs/project endpoint to update project settings after re-auth.
   */
  updateJobProject: async (data: {
    active: boolean;
    code: string;
    google_email: string;
    project_id: string;
  }) => {
    const response = await API.put("/google-backup/auto-sync/jobs/project", data);
    return response.data;
  },

  /**
   * Hits the POST /google-backup/auto-sync/task/{job_id}/backup-now endpoint
   * to trigger an immediate on-demand backup for the given job.
   */
  backupNow: async (job_id: number | string) => {
    const response = await API.post(`/google-backup/auto-sync/task/${job_id}/backup-now`, {});
    return response.data;
  },
};
