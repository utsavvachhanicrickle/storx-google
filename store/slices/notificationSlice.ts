import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { notificationService, NotificationItem } from "../../services/notificationService";

export const fetchNotificationsCount = createAsyncThunk(
  "notifications/fetchCount",
  async (_, thunkAPI) => {
    try {
      const data = await notificationService.getCount();
      // Handle response that could be a raw number or an object { count: number }
      const count =
        typeof data === "object" && data !== null && "count" in data
          ? data.count
          : Number(data);
      return isNaN(count) ? 0 : count;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch count");
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (
    params: {
      limit?: number;
      page?: number;
      filter?: string;
      timeFilter?: string;
    },
    thunkAPI
  ) => {
    try {
      const data = await notificationService.getAll(params);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch notifications");
    }
  }
);

export const readAllNotifications = createAsyncThunk(
  "notifications/readAll",
  async (_, thunkAPI) => {
    try {
      await notificationService.readAll();
      // Force refresh of notifications count after marking all as read
      thunkAPI.dispatch(fetchNotificationsCount());
      return true;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to mark all as read");
    }
  }
);

export const dismissNotification = createAsyncThunk(
  "notifications/dismiss",
  async (id: string, thunkAPI) => {
    try {
      await notificationService.dismiss(id);
      // Force refresh of notifications count after dismissing one
      thunkAPI.dispatch(fetchNotificationsCount());
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to dismiss notification");
    }
  }
);

export const fetchNotificationById = createAsyncThunk(
  "notifications/fetchById",
  async (id: string, thunkAPI) => {
    try {
      const data = await notificationService.getById(id);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch notification details");
    }
  }
);

interface NotificationState {
  unreadCount: number;
  items: NotificationItem[];
  totalCount: number;
  limit: number;
  page: number;
  pageCount: number;
  loading: boolean;
  error: string | null;
  currentNotification: NotificationItem | null;
  loadingCurrent: boolean;
}

const initialState: NotificationState = {
  unreadCount: 0,
  items: [],
  totalCount: 0,
  limit: 50,
  page: 1,
  pageCount: 0,
  loading: false,
  error: null,
  currentNotification: null,
  loadingCurrent: false,
};

export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearCurrentNotification: (state) => {
      state.currentNotification = null;
    },
    /**
     * Synchronous optimistic update — marks a notification as read immediately
     * in the Redux store without waiting for the API dismiss response.
     * Call this before dispatching dismissNotification so the UI updates instantly.
     */
    markItemAsRead: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      let wasUnread = false;
      state.items = state.items.map((item) => {
        if (item.id === id && !item.isRead) {
          wasUnread = true;
          return { ...item, isRead: true };
        }
        return item;
      });
      if (state.currentNotification?.id === id) {
        if (!state.currentNotification.isRead) {
          wasUnread = true;
        }
        state.currentNotification.isRead = true;
      }
      // Decrement local unread counter immediately only if it was actually unread
      if (wasUnread) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications count
      .addCase(fetchNotificationsCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Fetch list
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalCount = action.payload.totalCount || 0;
        state.limit = action.payload.limit || 50;
        state.page = action.payload.page || 1;
        state.pageCount = action.payload.pageCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Dismiss / read single
      .addCase(dismissNotification.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        );
        if (state.currentNotification && state.currentNotification.id === id) {
          state.currentNotification.isRead = true;
        }
      })

      // Read All
      .addCase(readAllNotifications.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }));
        if (state.currentNotification) {
          state.currentNotification.isRead = true;
        }
        state.unreadCount = 0;
      })

      // Fetch by ID
      .addCase(fetchNotificationById.pending, (state) => {
        state.loadingCurrent = true;
        state.currentNotification = null;
      })
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.loadingCurrent = false;
        const existing = state.items.find((item) => item.id === action.payload.id);
        state.currentNotification = {
          ...action.payload,
          isRead: existing ? existing.isRead : action.payload.isRead,
        };
      })
      .addCase(fetchNotificationById.rejected, (state) => {
        state.loadingCurrent = false;
      });
  },
});

export const { clearCurrentNotification, markItemAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
