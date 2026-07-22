import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  jobService,
  CreateBackupJobRequest,
} from "../../services/jobService";

/**
 * Async Thunk to fetch jobs list.
 */
export const fetchJobs = createAsyncThunk(
  "job/fetchJobs",
  async (_, thunkAPI) => {
    try {
      const data = await jobService.getUserJobs();
      return data.success || [];
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch backup jobs";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
  {
    condition: (_, { getState }) => {
      const { job } = getState() as { job: any };
      if (job.loading) {
        return false;
      }
    },
  }
);

/**
 * Async Thunk to create a new backup auto-sync job.
 */
export const createJob = createAsyncThunk(
  "job/createJob",
  async (
    payload: { data: CreateBackupJobRequest },
    thunkAPI,
  ) => {
    try {
      const response = await jobService.createUserJob(
        payload.data,
      );
      console.log(response);

      // Automatically refetch updated live list of jobs to sync view
      thunkAPI.dispatch(fetchJobs());
      return response.data;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create new backup sync job";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
);

/**
 * Async Thunk to update an existing auto-sync backup job.
 */
export const updateJob = createAsyncThunk(
  "job/updateJob",
  async (
    payload: { id: number; data: any },
    thunkAPI,
  ) => {
    try {
      const data = await jobService.updateUserJob(payload.id, payload.data);
      // Auto-refetch live jobs list to keep state completely in sync
      thunkAPI.dispatch(fetchJobs());
      return data;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update backup sync job";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
);

/**
 * Async Thunk to fetch services summary active/inactive stats.
 */
let isFetchingSummary = false;

export const fetchServicesSummary = createAsyncThunk(
  "job/fetchServicesSummary",
  async (_, thunkAPI) => {
    try {
      const data = await jobService.getServicesSummary();
      isFetchingSummary = false;
      return data.services || [];
    } catch (error: any) {
      isFetchingSummary = false;
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch services summary";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
  {
    condition: (_, { getState }) => {
      const { job } = getState() as any;
      if (job.servicesSummary && job.servicesSummary.length > 0) {
        // Option to cache permanently: return false;
      }
      if (isFetchingSummary) {
        return false;
      }
      isFetchingSummary = true;
    },
  }
);

/**
 * Async Thunk to fetch autosync jobs list with optional filtering.
 */
export const fetchAutosyncJobs = createAsyncThunk(
  "job/fetchAutosyncJobs",
  async (filterObj: any, thunkAPI) => {
    try {
      const data = await jobService.getAutosyncJobs(filterObj);
      return data.success || data || [];
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch filtered autosync jobs";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

/**
 * Async Thunk to fetch detailed job history/logs.
 */
export const fetchJobDetails = createAsyncThunk(
  "job/fetchJobDetails",
  async (job_id: number | string, thunkAPI) => {
    try {
      const data = await jobService.getJobDetails(job_id);
      return data;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch job details";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

/**
 * Async Thunk to toggle active state of a job.
 */
export const toggleAutosyncJob = createAsyncThunk(
  "job/toggleAutosyncJob",
  async (payload: { job_id: number | string; active: boolean }, thunkAPI) => {
    try {
      const data = await jobService.toggleUserJob(payload.job_id, payload.active);
      return data;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle job active status";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

interface JobState {
  jobs: any[];
  servicesSummary: any[];
  autosyncJobs: any[];
  jobDetails: Record<string, any>;
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  servicesSummary: [],
  autosyncJobs: [],
  jobDetails: {},
  loading: false,
  error: null,
};

export const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    clearJobError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchServicesSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.servicesSummary = action.payload;
      })
      .addCase(fetchServicesSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAutosyncJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutosyncJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.autosyncJobs = action.payload;
      })
      .addCase(fetchAutosyncJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        const raw = action.payload;
        const job = Array.isArray(raw)
          ? raw[0]
          : raw?.success?.[0] || raw?.data?.[0] || raw?.data || raw;
        const jobId = String(job?.ID ?? job?.id ?? job?.job_id ?? "");
        if (jobId) {
          state.jobDetails[jobId] = job;
        }
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearJobError } = jobSlice.actions;
export default jobSlice.reducer;
