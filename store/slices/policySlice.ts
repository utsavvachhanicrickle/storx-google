import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { policyService, CreatePolicyPayload, UpdatePolicyPayload, MergePoliciesPayload, MoveAssignmentsPayload, AvailableAssignmentsParams } from "@/services/policyService";
import { Policy, LinkedJob } from "@/utils/constants/policy_constants";
import toast from "@/components/Toast";

export const fetchPolicies = createAsyncThunk(
  "policy/fetchPolicies",
  async (_, thunkAPI) => {
    try {
      const response = await policyService.getPolicies();
      return response.policies || [];
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to fetch policies";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
  {
    condition: (_, { getState }) => {
      const { policy } = getState() as any;
      if (policy.loading) {
        return false;
      }
    },
  }
);

export const fetchPolicyDetails = createAsyncThunk(
  "policy/fetchPolicyDetails",
  async (payload: { id: number; search?: string }, thunkAPI) => {
    try {
      const response = await policyService.getPolicyDetails(payload.id, payload.search);
      return {
        policy: response.policy || null,
        linked_jobs: response.linked_jobs || response.policy?.linked_jobs || [],
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to fetch policy details";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const fetchMergePreview = createAsyncThunk(
  "policy/fetchMergePreview",
  async (_, thunkAPI) => {
    try {
      const response = await policyService.getMergePreview();
      return response;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to fetch merge preview";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const mergePolicies = createAsyncThunk(
  "policy/mergePolicies",
  async (payload: MergePoliciesPayload, thunkAPI) => {
    try {
      const response = await policyService.mergePolicies(payload);
      toast.success(response.message || "Policies merged successfully.");
      thunkAPI.dispatch(fetchPolicies());
      return response;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to merge policies";
      toast.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const createPolicy = createAsyncThunk(
  "policy/createPolicy",
  async (payload: CreatePolicyPayload, thunkAPI) => {
    try {
      const response = await policyService.createPolicy(payload);
      toast.success(response.message || "Policy created successfully.");
      thunkAPI.dispatch(fetchPolicies());
      return response;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to create policy";
      toast.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const fetchAvailableAssignments = createAsyncThunk(
  "policy/fetchAvailableAssignments",
  async (params: AvailableAssignmentsParams, thunkAPI) => {
    try {
      const response = await policyService.getAvailableAssignments(params);
      return response;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to fetch available assignments";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const moveAssignments = createAsyncThunk(
  "policy/moveAssignments",
  async (payload: MoveAssignmentsPayload, thunkAPI) => {
    try {
      const response = await policyService.moveAssignments(payload);
      toast.success(response.message || "Assignments moved successfully.");
      return response;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to move assignments";
      toast.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const updatePolicySettings = createAsyncThunk(
  "policy/updatePolicySettings",
  async (payload: { id: number; data: UpdatePolicyPayload }, thunkAPI) => {
    try {
      const response = await policyService.updatePolicySettings(payload.id, payload.data);
      toast.success(response.message || "Policy settings updated successfully.");
      thunkAPI.dispatch(fetchPolicies());
      return response;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to update policy settings";
      toast.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const deletePolicy = createAsyncThunk(
  "policy/deletePolicy",
  async (policyId: number, thunkAPI) => {
    try {
      const response = await policyService.deletePolicy(policyId);
      toast.success(response.message || "Policy deleted successfully.");
      thunkAPI.dispatch(fetchPolicies());
      return response;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to delete policy";
      toast.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const fetchPolicyOptions = createAsyncThunk(
  "policy/fetchPolicyOptions",
  async (_, thunkAPI) => {
    try {
      const response = await policyService.getPolicyOptions();
      return response.policies || [];
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to fetch policy options";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

interface PolicyState {
  policies: Policy[];
  activePolicyDetails: { policy: Policy | null; linked_jobs: LinkedJob[] };
  policyOptions: { policy_id: number; name: string }[];
  mergePreview: {
    message: string;
    groups: any[] | null;
    summary: {
      mergeable_group_count: number;
      policy_count: number;
      total_jobs: number;
    };
  } | null;
  availableAssignments: { emails: any[]; message: string } | null;
  loading: boolean;
  error: string | null;
}

const initialState: PolicyState = {
  policies: [],
  activePolicyDetails: { policy: null, linked_jobs: [] },
  policyOptions: [],
  mergePreview: null,
  availableAssignments: null,
  loading: false,
  error: null,
};

export const policySlice = createSlice({
  name: "policy",
  initialState,
  reducers: {
    clearPolicyError: (state) => {
      state.error = null;
    },
    clearActivePolicyDetails: (state) => {
      state.activePolicyDetails = { policy: null, linked_jobs: [] };
    },
    clearAvailableAssignments: (state) => {
      state.availableAssignments = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPolicies
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetchPolicyDetails
      .addCase(fetchPolicyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.activePolicyDetails = action.payload;
      })
      .addCase(fetchPolicyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetchMergePreview
      .addCase(fetchMergePreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMergePreview.fulfilled, (state, action) => {
        state.loading = false;
        state.mergePreview = action.payload;
      })
      .addCase(fetchMergePreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetchAvailableAssignments
      .addCase(fetchAvailableAssignments.fulfilled, (state, action) => {
        state.availableAssignments = action.payload;
      })

      // fetchPolicyOptions
      .addCase(fetchPolicyOptions.fulfilled, (state, action) => {
        state.policyOptions = action.payload;
      });
  },
});

export const { clearPolicyError, clearActivePolicyDetails, clearAvailableAssignments } = policySlice.actions;
export default policySlice.reducer;
