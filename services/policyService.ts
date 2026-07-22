import { API } from "./apiClient";

export interface CreatePolicyPayload {
  name: string;
  interval: string;
  on: string;
  retention_type: string;
  job_ids: number[] | null;
}

export interface UpdatePolicyPayload {
  interval: string;
  on: string;
  retention_type: string;
}

export interface MergePoliciesPayload {
  name: string;
  policy_ids: number[];
}

export interface MoveAssignmentsPayload {
  job_ids: number[];
  target_policy_id: number;
}

export interface AvailableAssignmentsParams {
  policy_id: number;
  search?: string;
  email?: string;
}

export const policyService = {
  /**
   * 1. GET /google-backup/auto-sync/policy
   * Fetches the full list of policies.
   */
  getPolicies: async () => {
    const response = await API.get("/google-backup/auto-sync/policy");
    return response.data;
  },

  /**
   * 2. GET /google-backup/auto-sync/policy/{policy_id}
   * Fetches policy details with specific linked jobs, optionally filtered by search query.
   */
  getPolicyDetails: async (policyId: number, search?: string) => {
    const response = await API.get(`/google-backup/auto-sync/policy/${policyId}`, {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  /**
   * 3. GET /google-backup/auto-sync/policy/merge/preview
   * Previews duplicate/mergeable policies.
   */
  getMergePreview: async () => {
    const response = await API.get("/google-backup/auto-sync/policy/merge/preview");
    return response.data;
  },

  /**
   * 4. POST /google-backup/auto-sync/policy/merge
   * Merges multiple duplicate policies.
   */
  mergePolicies: async (payload: MergePoliciesPayload) => {
    const response = await API.post("/google-backup/auto-sync/policy/merge", payload);
    return response.data;
  },

  /**
   * 5. POST /google-backup/auto-sync/policy
   * Creates an empty policy or splits jobs into a new policy.
   */
  createPolicy: async (payload: CreatePolicyPayload) => {
    const response = await API.post("/google-backup/auto-sync/policy", payload);
    return response.data;
  },

  /**
   * 6. GET /google-backup/auto-sync/policy/available-assignments
   * Fetches mailboxes or available services under a policy, filtered by query.
   */
  getAvailableAssignments: async (params: AvailableAssignmentsParams) => {
    const cleanedParams: any = {};
    Object.keys(params).forEach((key) => {
      const val = (params as any)[key];
      if (val !== undefined && val !== "" && val !== null) {
        cleanedParams[key] = val;
      }
    });

    const response = await API.get("/google-backup/auto-sync/policy/available-assignments", {
      params: cleanedParams,
    });
    return response.data;
  },

  /**
   * 7. POST /google-backup/auto-sync/policy/move
   * Migrates jobs to an existing policy.
   */
  moveAssignments: async (payload: MoveAssignmentsPayload) => {
    const response = await API.post("/google-backup/auto-sync/policy/move", payload);
    return response.data;
  },

  /**
   * 8. PUT /google-backup/auto-sync/policy/{policy_id}
   * Updates sync interval, time, and retention of a policy.
   */
  updatePolicySettings: async (policyId: number, payload: UpdatePolicyPayload) => {
    const response = await API.put(`/google-backup/auto-sync/policy/${policyId}`, payload);
    return response.data;
  },

  /**
   * 9. DELETE /google-backup/auto-sync/policy/{policy_id}
   * Deletes a policy.
   */
  deletePolicy: async (policyId: number) => {
    const response = await API.delete(`/google-backup/auto-sync/policy/${policyId}`);
    return response.data;
  },

  /**
   * 10. GET /google-backup/auto-sync/policy/options
   * Fetches simplified ID & name options for dropdown move selectors.
   */
  getPolicyOptions: async () => {
    const response = await API.get("/google-backup/auto-sync/policy/options");
    return response.data;
  },
};
