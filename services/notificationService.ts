import { API } from "./apiClient";

export interface NotificationItem {
  id: string;
  body: string;
  createdAt: string;
  data?: Record<string, any>;
  errorMessage?: string;
  hide: boolean;
  isRead: boolean;
  retryCount: number;
  sentAt?: string;
  status: string;
  title: string;
  tokenId?: string;
  userId: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  limit: number;
  page: number;
  pageCount: number;
  totalCount: number;
}

export const notificationService = {
  /**
   * GET /api/v0/notifications/count
   * Returns the count of unread/total notifications.
   */
  getCount: async () => {
    const res = await API.get("/notifications/count");
    return res.data;
  },

  /**
   * GET /api/v0/notifications
   * Fetches a paginated and filtered list of notifications.
   */
  getAll: async (params?: {
    limit?: number;
    page?: number;
    filter?: string;
    timeFilter?: string;
  }) => {
    const res = await API.get<NotificationsResponse>("/notifications", {
      params,
    });
    return res.data;
  },

  /**
   * PUT /api/v0/notifications/read-all
   * Marks all notifications as read.
   */
  readAll: async () => {
    const res = await API.put("/notifications/read-all");
    return res.data;
  },

  /**
   * GET /api/v0/notifications/{id}
   * Fetches full details for a single notification by UUID.
   */
  getById: async (id: string) => {
    const res = await API.get<NotificationItem>(`/notifications/${id}`);
    return res.data;
  },

  /**
   * PUT /api/v0/notifications/{id}/dismiss
   * Dismisses (marks as read/clears) a specific notification by UUID.
   */
  dismiss: async (id: string) => {
    const res = await API.put(`/notifications/${id}/dismiss`);
    return res.data;
  },
};
