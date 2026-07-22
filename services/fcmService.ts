import { API } from "./apiClient";

export interface FcmTokenRecord {
  ID: string;
  UserID: string;
  Token: string;
  DeviceID: string;
  DeviceType: string;
  AppVersion: string;
  OSVersion: string;
  DeviceModel: string;
  BrowserName: string;
  UserAgent: string;
  IPAddress: string;
  CreatedAt: string;
  UpdatedAt: string;
  LastUsedAt: string | null;
  IsActive: boolean;
}

export interface FcmUpdatePayload {
  token: string;
  deviceId: string;
  deviceType: string;
  appVersion: string;
  osVersion: string;
  deviceModel: string;
  browserName: string;
  userAgent: string;
  isActive: boolean;
}

export const fcmService = {
  /**
   * GET /api/v0/fcm-token
   * Returns all FCM token records registered for the logged-in user.
   */
  getDevices: async (): Promise<FcmTokenRecord[]> => {
    const response = await API.get("/fcm-token");
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * PUT /api/v0/fcm-token/:id
   * Updates a device record — primarily used to toggle IsActive.
   */
  updateDevice: async (id: string, payload: FcmUpdatePayload): Promise<void> => {
    await API.put(`/fcm-token/${id}`, payload);
  },

  /**
   * POST /api/v0/fcm-token
   * Registers a new FCM token and device info.
   */
  registerDevice: async (deviceInfo: any): Promise<any> => {
    const response = await API.post("/fcm-token", deviceInfo);
    return response.data;
  },

  /**
   * DELETE /api/v0/fcm-token/:id
   * Permanently removes a push device registration.
   */
  deleteDevice: async (id: string): Promise<void> => {
    await API.delete(`/fcm-token/${id}`);
  },
};
