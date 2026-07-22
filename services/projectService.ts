import { API } from "./apiClient";

export interface Project {
  id: string;
  name: string;
  [key: string]: any;
}

export const projectService = {
  /**
   * Hits the GET /api/v0/projects endpoint to retrieve the projects list.
   */
  getProjects: async (): Promise<any> => {
    const response = await API.get("/projects");
    return response.data;
  },

  getProjectSalt: async (projectId: string): Promise<string> => {
    const response = await API.get(`/projects/${projectId}/salt`);
    return typeof response.data === "string"
      ? response.data
      : (response.data?.salt ?? "");
  },

  getProjectConfig: async (projectId: string): Promise<any> => {
    const response = await API.get(`/projects/${projectId}/config`);
    return response.data;
  },
};
