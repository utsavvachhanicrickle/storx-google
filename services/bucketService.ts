import { API } from "./apiClient";
import type { ReservedBucketUsage } from "@/types/vault";

export const bucketService = {
  getUsageTotalsForReserved: async (
    projectId: string,
  ): Promise<ReservedBucketUsage[]> => {
    const response = await API.get("/buckets/usage-totals-for-reserved", {
      params: { projectID: projectId },
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data?.bucketUsages ?? [];
  },

  getUsageTotals: async (
    projectId: string,
    params: { page?: number; limit?: number; search?: string } = {},
  ) => {
    const response = await API.get("/buckets/usage-totals", {
      params: {
        projectID: projectId,
        before: new Date().toISOString(),
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        search: params.search ?? "",
      },
    });
    return response.data;
  },
};
