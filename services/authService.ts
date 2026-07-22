import { API } from "./apiClient";

export const authService = {
  /**
   * Hits the GET /api/v0/auth/google-backup endpoint to exchange OAuth code.
   * If email exists, logs in; otherwise registers.
   */
  googleBackupAuth: async (authCode: string) => {
    return API.get("/auth/google-backup", {
      params: {
        code: authCode,
      },
    });
  },

  /**
   * Hits the GET /auth/account/settings endpoint to fetch user account settings.
   */
  getAccountSettings: async () => {
    return API.get("/auth/account/settings");
  },

  /**
   * Hits the GET /api/v0/auth/account endpoint to fetch current user account details.
   */
  getAccount: async () => {
    return API.get("/auth/account");
  },

  /**
   * Updates the user's full name.
   */
  updateAccountName: async (fullName: string) => {
    return API.patch("/auth/account", { fullName });
  },

  /**
   * Gets the freeze status of the account.
   */
  getFreezeStatus: async () => {
    const response = await API.get("/auth/account/freezestatus");
    return response.data;
  },

  /**
   * Generates a secret key and QR code URL for MFA enrollment.
   */
  generateMfaSecret: async () => {
    const response = await API.post("/auth/mfa/generate-secret-key");
    return response.data;
  },

  /**
   * Enables MFA with a 6-digit passcode.
   */
  enableMfa: async (passcode: string) => {
    const response = await API.post("/auth/mfa/enable", { passcode });
    return response.data;
  },

  /**
   * Disables MFA with passcode or recovery code.
   */
  disableMfa: async (passcode: string, recoveryCode: string) => {
    const response = await API.post("/auth/mfa/disable", { passcode, recoveryCode });
    return response.data;
  },
  
  /**
   * Fetches user notification preferences.
   */
  getNotificationPreferences: async () => {
    const response = await API.get("/user/notification-preferences");
    return response.data;
  },

  /**
   * Updates user notification preferences.
   */
  updateNotificationPreferences: async (preferences: any) => {
    const response = await API.put("/user/notification-preferences", preferences);
    return response.data;
  },

  /**
   * Fetches developer access list.
   */
  getDeveloperAccess: async () => {
    const response = await API.get("/auth/developer-access");
    return response.data;
  },

  /**
   * Fetches developer access requests history logs.
   */
  getDeveloperAccessHistory: async (clientId: string) => {
    const response = await API.get(`/auth/developer-access/${clientId}/history`);
    return response.data;
  },

  /**
   * Revokes access for a developer client app.
   */
  revokeDeveloperAccess: async (clientId: string) => {
    const response = await API.delete(`/auth/developer-access/${clientId}/revoke`);
    return response.data;
  },

  /**
   * Log in with Email and Password
   */
  loginWithPassword: async (data: any) => {
    const response = await API.post("/auth/token", data);
    return response.data;
  },

  /**
   * Request forgot password link
   */
  forgotPassword: async (data: any) => {
    const response = await API.post("/auth/forgot-password", data);
    return response.data;
  },

  /**
   * Set password for Google login session
   */
  setPassword: async (newPassword: string) => {
    const response = await API.post("/auth/account/set-password", { newPassword });
    return response.data;
  },

  /**
   * Reset password with recovery token
   */
  resetPassword: async (data: any) => {
    const response = await API.post("/auth/reset-password", data);
    return response.data;
  },

  /**
   * Change password (logged-in session)
   */
  changePassword: async (data: any) => {
    const response = await API.post("/auth/account/change-password", data);
    return response.data;
  },

  /**
   * Generate initial recovery codes
   */
  generateMfaRecoveryCodes: async () => {
    const response = await API.post("/auth/mfa/generate-recovery-codes");
    return response.data;
  },

  /**
   * Regenerate recovery codes
   */
  regenerateMfaRecoveryCodes: async (data: any) => {
    const response = await API.post("/auth/mfa/regenerate-recovery-codes", data);
    return response.data;
  },
};
