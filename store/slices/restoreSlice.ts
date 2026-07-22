import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  restoreService,
  RestoreJob,
  RestoreJobsFilter,
} from "../../services/restoreService";

/**
 * Fetch full list of restore jobs with parameters
 */
export const fetchRestoreJobs = createAsyncThunk(
  "restore/fetchRestoreJobs",
  async (params: RestoreJobsFilter | undefined, thunkAPI) => {
    try {
      const data = await restoreService.getRestoreJobs(params);
      let items: any[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && typeof data === "object") {
        items =
          data.data ??
          data.Data ??
          data.jobs ??
          data.Jobs ??
          data.success ??
          data.Success ??
          data.result ??
          data.Result ??
          data.list ??
          data.List ??
          [];
        if (!Array.isArray(items)) items = [];
      }
      return items;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch restore jobs";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
);

/**
 * Fetch live restore jobs and merge them with active list.
 * If any previously active job has finished (disappeared from live), it refetches the list.
 */
export const fetchLiveRestoreJobs = createAsyncThunk(
  "restore/fetchLiveRestoreJobs",
  async (_, thunkAPI) => {
    try {
      const rawData = await restoreService.getLiveJobs();
      let data: any[] = [];
      if (Array.isArray(rawData)) {
        data = rawData;
      } else if (rawData && typeof rawData === "object") {
        data =
          rawData.data ??
          rawData.Data ??
          rawData.jobs ??
          rawData.Jobs ??
          rawData.success ??
          rawData.Success ??
          rawData.result ??
          rawData.Result ??
          rawData.list ??
          rawData.List ??
          [];
        if (!Array.isArray(data)) data = [];
      }

      // Check if any in_progress/pending job in state is missing from live data (transitioned to completed/failed)
      const state = thunkAPI.getState() as any;
      const restoreState = state.restore;
      if (restoreState && restoreState.jobs.length > 0) {
        const activeInState = restoreState.jobs.filter((j: any) => {
          const status = (j.status ?? j.Status ?? "").toLowerCase();
          return (
            status === "in_progress" ||
            status === "pending" ||
            status === "running" ||
            status === "queued"
          );
        });
        if (activeInState.length > 0) {
          const liveIds = new Set(
            data.map((j: any) => String(j.id ?? j.ID ?? "")),
          );
          const hasFinishedJob = activeInState.some(
            (j: any) => !liveIds.has(String(j.id ?? j.ID ?? "")),
          );
          if (hasFinishedJob) {
            // Fetch updated full list with currently applied filters
            thunkAPI.dispatch(fetchRestoreJobs(restoreState.filters));
          }
        }
      }

      return data;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch live restore jobs";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
);

interface RestoreState {
  jobs: RestoreJob[];
  liveJobs: RestoreJob[];
  activeJobCount: number;
  loading: boolean;
  liveLoading: boolean;
  error: string | null;
  filters: RestoreJobsFilter;
  googleAuthToken: string | null;
  cyberlsAccessGrant: string | null;
}

const initialState: RestoreState = {
  jobs: [],
  liveJobs: [],
  activeJobCount: 0,
  loading: false,
  liveLoading: false,
  error: null,
  filters: {
    service: "",
    status: "",
    search: "",
    from_time: "",
    to_time: "",
    limit: 20,
    offset: 0,
  },
  googleAuthToken: null,
  cyberlsAccessGrant: null,
};

export const restoreSlice = createSlice({
  name: "restore",
  initialState,
  reducers: {
    clearRestoreError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setGoogleAuthToken: (state, action) => {
      state.googleAuthToken = action.payload;
    },
    setCyberLsAccessGrant: (state, action) => {
      state.cyberlsAccessGrant = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestoreJobs.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        if (action.meta.arg) {
          state.filters = { ...state.filters, ...action.meta.arg };
        }
      })
      .addCase(fetchRestoreJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchRestoreJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchLiveRestoreJobs.pending, (state) => {
        state.liveLoading = true;
      })
      .addCase(fetchLiveRestoreJobs.fulfilled, (state, action) => {
        state.liveLoading = false;
        const payload = action.payload as any;
        const liveJobs = Array.isArray(payload)
          ? payload
          : (payload?.data ?? payload?.jobs ?? []);
        state.liveJobs = liveJobs;
        state.activeJobCount = liveJobs.filter((j: any) => {
          const status = (j.status ?? j.Status ?? "").toLowerCase();
          return (
            status === "in_progress" ||
            status === "pending" ||
            status === "running" ||
            status === "queued"
          );
        }).length;

        // Merge real-time progress updates into jobs array
        const liveMap = new Map(
          liveJobs.map((j: any) => [String(j.id ?? j.ID ?? ""), j]),
        );
        state.jobs = state.jobs.map((job: any) => {
          const live: any = liveMap.get(String(job.id ?? job.ID ?? ""));
          if (!live) return job;
          return {
            ...job,
            status: live.status ?? live.Status,
            Progress: live.progress_percent ?? live.Progress,
            progress_percent: live.progress_percent ?? live.Progress,
            success: live.success,
            updated_at: live.updated_at,
          };
        });
      })
      .addCase(fetchLiveRestoreJobs.rejected, (state) => {
        state.liveLoading = false;
      });
  },
});

export const {
  clearRestoreError,
  setFilters,
  resetFilters,
  setGoogleAuthToken,
  setCyberLsAccessGrant,
} = restoreSlice.actions;
export default restoreSlice.reducer;
