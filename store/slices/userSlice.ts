import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService, UsersGroupsRequestParams } from "../../services/userService";

export const fetchUsersGroups = createAsyncThunk(
  "user/fetchUsersGroups",
  async (params: UsersGroupsRequestParams, thunkAPI) => {
    try {
      const data = await userService.getUsersGroups(params);
      return data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Failed to fetch users groups";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

let isFetchingDomains = false;

export const fetchDomains = createAsyncThunk(
  "user/fetchDomains",
  async (_, thunkAPI) => {
    try {
      const data = await userService.getDomains();
      isFetchingDomains = false;
      return data;
    } catch (error: any) {
      isFetchingDomains = false;
      const errMsg = error.response?.data?.message || error.message || "Failed to fetch domains";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
  {
    condition: (_, { getState }) => {
      const { user } = getState() as any;
      if (user.domains && user.domains.length > 0) {
        // Option to cache permanently: return false;
      }
      if (isFetchingDomains) {
        return false;
      }
      isFetchingDomains = true;
    },
  }
);

interface UserState {
  usersGroupsData: {
    entities: any[];
    pagination: {
      limit: number;
      offset: number;
      page: number;
      total_pages: number;
      total_count: number;
    };
    policy_link: string;
  };
  domains: string[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  usersGroupsData: {
    entities: [],
    pagination: {
      limit: 10,
      offset: 0,
      page: 1,
      total_pages: 1,
      total_count: 0
    },
    policy_link: ""
  },
  domains: [],
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.usersGroupsData = action.payload;
      })
      .addCase(fetchUsersGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.domains = payload;
        } else if (payload && typeof payload === "object") {
          if (Array.isArray(payload.domains)) {
            state.domains = payload.domains;
          } else if (Array.isArray(payload.data)) {
            state.domains = payload.data;
          } else if (Array.isArray(payload.success)) {
            state.domains = payload.success;
          } else {
            state.domains = [];
          }
        } else {
          state.domains = [];
        }
      });
  },
});

export default userSlice.reducer;
