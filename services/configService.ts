import { API } from "./apiClient";
import type { SatelliteConfig } from "@/types/vault";

export const configService = {
  getConfig: async (): Promise<SatelliteConfig> => {
    const response = await API.get("/config");
    return response.data ?? {};
  },
};
