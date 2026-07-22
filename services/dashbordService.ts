import { API } from "./apiClient";

export interface DashboardStatItem {
  title: string;
  description: string;
  icon: {
    backgroundColor: string;
    url: string;
  };
  button: {
    label: string;
    url: string;
  } | null;
  status: {
    value: string;
    backgroundColor: string;
    textColor: string;
  } | null;
  value_1: string | number | null;
  value_2?: number;
  value_2_label?: string;
}

export const dashbordService = {
  /**
   * Hits the GET /api/v0/dashboard/stats endpoint to retrieve dashboard statistics.
   */
  getStats: async (): Promise<DashboardStatItem[]> => {
    const response = await API.get("/dashboard/stats");
    console.log("get stats", response);
    return response.data;
  },
  /**
   * Hits the GET /api/v0/buckets/usage-totals-for-reserved endpoint to get usage stats.
   */
  getUsageTotalsForReserved: async (projectId: string): Promise<any> => {
    const response = await API.get(
      "/buckets/usage-totals-for-reserved",
      {
        params: {
          projectID: projectId,
        },
      },
    );
    return response.data;
    // return {
    //   bucketUsages: [
    //     {
    //       before: "2026-06-03T09:01:55.204Z",
    //       bucketName: "gmail",
    //       createdAt: "2024-03-20T10:00:00Z",
    //       creatorEmail: "user@example.com",
    //       egress: 0.2,
    //       location: "us-east-1",
    //       objectCount: 42,
    //       projectID: "37159d9b-6f3c-4c38-bfe2-0efbbc4b568d",
    //       segmentCount: 100,
    //       since: "2026-06-01T00:00:00.000Z",
    //       storage: 210.5,
    //     },
    //     {
    //       before: "2026-06-03T09:01:55.204Z",
    //       bucketName: "drive",
    //       createdAt: "2024-03-20T10:00:00Z",
    //       creatorEmail: "user@example.com",
    //       egress: 0.5,
    //       location: "us-east-1",
    //       objectCount: 84,
    //       projectID: "37159d9b-6f3c-4c38-bfe2-0efbbc4b568d",
    //       segmentCount: 200,
    //       since: "2026-06-01T00:00:00.000Z",
    //       storage: 580.0,
    //     },
    //   ],
    //   currentPage: 1,
    //   limit: 10,
    //   offset: 0,
    //   pageCount: 1,
    //   search: "",
    //   totalCount: 3,
    // };
  },

  /**
   * Hits the GET /api/v0/projects/{id}/daily-usage endpoint to get daily usage statistics.
   */
  getDailyUsage: async (
    projectId: string,
    from: number,
    to: number,
  ): Promise<any> => {
    const response = await API.get(
      `/projects/${projectId}/daily-usage`,
      {
        params: {
          from,
          to,
        },
      },
    );
    return response.data;
  },

  /**
   * Hits GET /api/v0/google-backup/backup-restore/logs to retrieve backup & restore activity logs.
   * Supports: types, search, method, message_status, limit, offset
   */
  getBackupRestoreLogs: async (params: {
    limit?: number;
    offset?: number;
    types?: string;       // "backup" | "restore" | "backup,restore"
    search?: string;      // partial match on subject or message
    method?: string;      // gmail | google_drive | google_photos | google_contacts | google_calendar
    message_status?: string; // info | warning | error
  } = {}): Promise<any> => {
    const { limit = 10, offset = 0, types, search, method, message_status } = params;
    const query: Record<string, any> = { limit, offset };
    if (types)          query.types          = types;
    if (search)         query.search         = search;
    if (method)         query.method         = method;
    if (message_status) query.message_status = message_status;
    const response = await API.get(
      "/google-backup/backup-restore/logs",
      { params: query },
    );
    return response.data;
  },

  /**
   * Hits GET /api/v0/google-backup/users-groups/dashboard-alerts to retrieve dashboard alerts count and items.
   */
  getDashboardAlerts: async (): Promise<any> => {
    const response = await API.get("/google-backup/users-groups/dashboard-alerts");
    return response.data;
  },
};
