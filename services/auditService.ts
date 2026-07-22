import { API } from "./apiClient";

export interface AuditLogsRequestParams {
  action?: string;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
  page?: number;
  sortBy?: string;
  sortOrder?: string;
  sort_by?: string;
  sort_order?: string;
}

export const auditService = {
  /**
   * Hits the GET /api/v0/audit-logs endpoint to fetch immutable audit logs.
   */
  getAuditLogs: async (params: AuditLogsRequestParams) => {
    // Clean params to avoid empty fields in URL
    const cleanedParams: any = {};
    Object.keys(params).forEach((key) => {
      const val = (params as any)[key];
      if (val !== undefined && val !== "" && val !== null && val !== "All Events") {
        cleanedParams[key] = val;
      }
    });

    const response = await API.get("/audit-logs", { params: cleanedParams });
    return response.data;
  },

  /**
   * Hits the GET /api/v0/audit-logs/actions endpoint to fetch filterable action codes.
   */
  getAuditActions: async () => {
    const response = await API.get("/audit-logs/actions");
    return response.data;
  },

  /**
   * Fetches the CSV file as a Blob for download.
   */
  exportAuditLogs: async (params: AuditLogsRequestParams) => {
    const cleanedParams: any = {};
    Object.keys(params).forEach((key) => {
      const val = (params as any)[key];
      if (val !== undefined && val !== "" && val !== null && val !== "All Events") {
        cleanedParams[key] = val;
      }
    });

    const response = await API.get("/audit-logs/export", {
      params: cleanedParams,
      responseType: "blob",
      headers: {
        Accept: "text/csv, application/octet-stream, */*",
      },
    });
    return response.data;
  },
};
