import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authModules } from "../../modules/authModules";
import { authService } from "../../services/authService";

export const loginSlice = createAsyncThunk(
  "auth/login",
  async (data: any, thunkAPI) => {
    try {
      const res = await authModules.googleLogin(data);

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res));
        const token = res?.googleBackup?.token || res?.token;
        if (token) {
          document.cookie = `_tokenKey=${token}; path=/;`;
          document.cookie = `_token=${token}; path=/;`;
        }
        const status =
          res?.onboarding_status ||
          res?.googleBackup?.onboarding_status ||
          res?.onboarding?.onboarding_status ||
          "pending";
        document.cookie = `_onboarding_status=${status}; path=/;`;
      }

      const userResult = await thunkAPI.dispatch(getUserSlice()).unwrap();
      return userResult || res;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.error || error.message || "Login Failed";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
);

export const registerSlice = createAsyncThunk(
  "auth/register",
  async (code: string, thunkAPI) => {
    try {
      const res = await authModules.googleRegister(code);

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res));
        const token = res?.googleBackup?.token || res?.token;
        if (token) {
          document.cookie = `_tokenKey=${token}; path=/;`;
          document.cookie = `_token=${token}; path=/;`;
        }
        const status =
          res?.onboarding_status ||
          res?.googleBackup?.onboarding_status ||
          res?.onboarding?.onboarding_status ||
          "pending";
        document.cookie = `_onboarding_status=${status}; path=/;`;
      }

      const userResult = await thunkAPI.dispatch(getUserSlice()).unwrap();
      return userResult || res;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.error || error.message || "Registration Failed";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
);

export const getUserSlice = createAsyncThunk(
  "auth/getUser",
  async (_, thunkAPI) => {
    try {
      if (typeof window !== "undefined") {
        const cachedUserStr = localStorage.getItem("user");
        const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : {};

        const isOnboardingPending =
          cachedUser?.onboarding_status === "pending" ||
          cachedUser?.googleBackup?.onboarding_status === "pending" ||
          cachedUser?.onboarding?.onboarding_status === "pending";

        const hasToken = typeof document !== "undefined" && document.cookie
          .split("; ")
          .some((c) => c.trim().startsWith("_tokenKey="));

        if (
          isOnboardingPending &&
          (cachedUser?.email || cachedUser?.googleBackup?.email) &&
          !hasToken
        ) {
          return cachedUser;
        }

        if (!hasToken) {
          return null;
        }

        const response = await authService.getAccount();
        const accountData = response.data;

        const mergedUser = {
          ...cachedUser,
          ...accountData,
          name: accountData.fullName || cachedUser.name || "Admin User",
          email: accountData.email || cachedUser.email || "",
        };

        localStorage.setItem("user", JSON.stringify(mergedUser));
        return mergedUser;
      }

      return null;
    } catch (error: any) {
      thunkAPI.dispatch(logoutSlice());
      const errMsg =
        error.response?.data?.error || error.message || "Get User Failed";
      return thunkAPI.rejectWithValue(errMsg);
    }
  },
);

export const logoutSlice = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await authModules.logout();

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie =
          "_tokenKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "_onboarding_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Force replace window location to clear history state
        window.location.replace("/connect");
      }

      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout Failed");
    }
  },
);

interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    try {
      const cachedUser = localStorage.getItem("user");
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  loading: false,
  error: null,
  isAuthenticated: typeof window !== "undefined" && !!localStorage.getItem("user"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateOnboardingStatus: (state, action) => {
      if (state.user) {
        state.user.onboarding_status = action.payload;
        if (state.user.googleBackup) {
          state.user.googleBackup.onboarding_status = action.payload;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
          document.cookie = `_onboarding_status=${action.payload}; path=/;`;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginSlice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(registerSlice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(getUserSlice.pending, (state) => {
        if (!state.user) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(getUserSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(getUserSlice.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      .addCase(logoutSlice.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { updateOnboardingStatus } = authSlice.actions;
export default authSlice.reducer;
