import { API } from "./apiClient";

export interface UsersGroupsRequestParams {
  domain?: string;
  search?: string;
  method?: string;
  limit?: number;
  offset?: number;
  account_type?: string;
  credential_status?: string;
  paused?: boolean;
}

export const userService = {
  getUsersGroups: async (params: UsersGroupsRequestParams) => {
    // Remove undefined or empty params to avoid sending them in the query
    const cleanedParams: any = {};
    Object.keys(params).forEach((key) => {
      const val = (params as any)[key];
      if (val !== undefined && val !== "" && val !== "all_services") {
        cleanedParams[key] = val;
      }
    });

    const response = await API.get("/google-backup/users-groups", {
      params: cleanedParams,
    });
    return response.data;
  },

  getDomains: async () => {
    const response = await API.get("/google-backup/users-groups/domains");
    return response.data;
  },
};
