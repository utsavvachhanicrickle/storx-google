import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auditService, AuditLogsRequestParams } from "../../services/auditService";

export const fetchAuditLogs = createAsyncThunk(
  "audit/fetchAuditLogs",
  async (params: AuditLogsRequestParams, thunkAPI) => {
    try {
      const data = await auditService.getAuditLogs(params);
      return data; // Expected response structure: { Items: [...], NextCursor: "...", TotalCount: N }
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch audit logs";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

let isFetchingActions = false;

export const fetchAuditActions = createAsyncThunk(
  "audit/fetchAuditActions",
  async (_, thunkAPI) => {
    try {
      const data = await auditService.getAuditActions();
      isFetchingActions = false;
      return data.actions || [];
    } catch (error: any) {
      isFetchingActions = false;
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch audit actions";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
  {
    condition: (_, { getState }) => {
      const { audit } = getState() as any;
      if (audit.actions && audit.actions.length > 0) {
        return false;
      }
      if (isFetchingActions) {
        return false;
      }
      isFetchingActions = true;
    },
  }
);

interface AuditState {
  items: any[];
  actions: string[];
  nextCursor: string;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: AuditState = {
  items: [],
  actions: [],
  nextCursor: "",
  totalCount: 0,
  loading: false,
  error: null,
};

export const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    clearAuditError: (state) => {
      state.error = null;
    },
    resetAuditList: (state) => {
      state.items = [];
      state.nextCursor = "";
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.Items || [];
        state.nextCursor = action.payload.NextCursor || "";
        state.totalCount = action.payload.TotalCount || 0;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAuditActions.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAuditActions.fulfilled, (state, action) => {
        state.actions = action.payload;
      })
      .addCase(fetchAuditActions.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearAuditError, resetAuditList } = auditSlice.actions;
export default auditSlice.reducer;
