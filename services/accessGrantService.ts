import { API } from "./apiClient";
import axios from "axios";
import type { EdgeCredentials } from "@/types/vault";

export const FILE_BROWSER_AG_NAME = "google-backup-2";

export const accessGrantService = {
  createAccessGrant: async (projectId: string, name: string) => {
    const response = await API.post(`/api-keys/create/${projectId}`, name, 
    //   {
    //   headers: { "Content-Type": "text/plain" },
    // }
  );
    return {
      id: response.data?.keyInfo?.id as string,
      name: response.data?.keyInfo?.name as string,
      secret: response.data?.key as string,
    };
  },

  deleteByNameAndProjectId: async (name: string, projectId: string) => {
    await API.delete(
      `/api-keys/delete-by-name?name=${encodeURIComponent(name)}&publicID=${encodeURIComponent(projectId)}`,
    );
  },

  listAPIKeys: async (projectId: string): Promise<any[]> => {
    const response = await API.get(
      `/api-keys/list-paged?projectID=${projectId}&limit=100&page=1&order=1&orderDirection=1`,
    );
    return response.data?.apiKeys || [];
  },

  getGatewayCredentials: async (
    accessGrant: string,
    gatewayUrl: string,
  ): Promise<EdgeCredentials> => {
    let url = gatewayUrl.includes("/v1/access")
      ? gatewayUrl
      : `${gatewayUrl.replace(/\/$/, "")}/v1/access`;


    const response = await axios.post(
      url,
      {
        access_grant: accessGrant,
        public: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    const result = response.data;
    return {
      accessKeyId: result.access_key_id,
      secretKey: result.secret_key,
      endpoint: result.endpoint,
    };
  },
};
