import { authService } from "../services/authService";

export const authModules = {
  /**
   * Performs Google Authorization Code authentication with the backend.
   * Delegates the network call to authService.loginGoogle.
   */
  googleLogin: async (authCode: string) => {
    try {
      const res = await authService.googleBackupAuth(authCode);
      console.log("Backend response", res);
      
      const email = res.data?.google_backup?.email || "admin@acme.com";
      const onboardingStatus =
        res.data?.onboarding?.onboarding_status ||
        (res.data?.onboarding?.onboardingEnd ? "completed" : "pending");

      // We return the authorized Admin User profile to sync frontend state.
      const loggedInUser = {
        ...res.data,
        email: email,
        googleBackup: res.data?.google_backup,
        granted_scopes: res.data?.granted_scopes,
        ungranted_scopes: res.data?.ungranted_scopes,
        token: res.data?.token || res.data?.google_backup?.token,
        onboarding_status: onboardingStatus,
        onboarding: res.data?.onboarding,
      };

      return loggedInUser;
    } catch (error) {
      console.error("Backend Google login authorization failed:", error);
      throw error;
    }
  },

  /**
   * Performs Google Authorization Code registration with the backend.
   * Delegates the network call to authService.googleBackupAuth as well.
   */
  googleRegister: async (authCode: string) => {
    try {
      const res = await authService.googleBackupAuth(authCode);
      console.log("Backend response", res);

      const email = res.data?.google_backup?.email || "admin@acme.com";
      const onboardingStatus =
        res.data?.onboarding?.onboarding_status ||
        (res.data?.onboarding?.onboardingEnd ? "completed" : "pending");

      // We return the registered Admin User profile to sync frontend state.
      const registeredUser = {
        ...res.data,
        email: email,
        googleBackup: res.data?.google_backup,
        granted_scopes: res.data?.granted_scopes,
        ungranted_scopes: res.data?.ungranted_scopes,
        token: res.data?.token || res.data?.google_backup?.token,
        onboarding_status: onboardingStatus,
        onboarding: res.data?.onboarding,
      };

      return registeredUser;
    } catch (error) {
      console.error("Backend Google registration failed:", error);
      throw error;
    }
  },

  logout: async () => {
    return true;
  },

  getUser: async () => {
    return true;
  },
};
