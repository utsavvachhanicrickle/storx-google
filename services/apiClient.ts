import axios from "axios";
import { toast } from "react-toastify";

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Production-ready centralized Axios client.
 * Pre-configured with base URL, headers, and credentials policies.
 * Enables clean, shorthand network requests globally: API.get, API.post, API.put, etc.
 */
export const API = axios.create({
  baseURL: BACKEND_API,
  withCredentials: true, // Automatically manages secure session cookies (like _tokenKey) across all requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRateLimited = false;
let csrfToken = "";

const CSRF_PROTECTED_PATHS = [
  "/auth/token",
  "/auth/account/set-password",
  "/auth/account/change-password",
  "/auth/reset-password",
  "/auth/mfa/enable",
  "/auth/mfa/disable",
  "/auth/mfa/generate-recovery-codes",
  "/auth/mfa/regenerate-recovery-codes",
  "/api-keys/create",
  "/api-keys/delete-by-name",
];

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

// Request interceptor to block API calls if rate-limited
API.interceptors.request.use(
  (config) => {
    if (isRateLimited) {
      return Promise.reject(
        new Error("API calls blocked due to rate limiting (429)."),
      );
    }
    if (csrfToken && config.url) {
      const requiresCsrf = CSRF_PROTECTED_PATHS.some((path) =>
        config.url?.includes(path),
      );
      if (requiresCsrf) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor for centralized request logging and error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log failures uniformly in the browser console
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
      error.response?.status,
      error.response?.data || error.message,
    );

    // Handle 401 Unauthorized session expirations dynamically
    if (error.response?.status === 401) {
      const isGoogleBackup =
        error.config?.url?.includes("google-backup") ||
        error.config?.url?.includes("google-auth");
      const isLoginOrPublicRoute =
        error.config?.url?.includes("/auth/token") ||
        error.config?.url?.includes("/auth/forgot-password") ||
        error.config?.url?.includes("/auth/reset-password");

      if (
        !isGoogleBackup &&
        !isLoginOrPublicRoute &&
        typeof window !== "undefined"
      ) {
        console.warn("⚠️ [401 Session Expiration Triggered] Failing URL:", error.config?.url);
        localStorage.removeItem("user");
        document.cookie =
          "_tokenKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Dynamically import store at runtime to avoid load-time circular dependencies
        import("@/store/store").then(({ store }) => {
          import("@/store/slices/authSlice").then(({ logoutSlice }) => {
            store.dispatch(logoutSlice());
          });
        });
        toast.error("Your session has expired. Please sign in again.");

        // Redirect user securely to signin page only if they are in the dashboard area
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/connect";
        }
      }
    }

    // Handle 429 Too Many Requests rate limiting globally
    if (error.response?.status === 429) {
      isRateLimited = true;
      if (typeof window !== "undefined") {
        if (!(window as any).__429_alert_active) {
          (window as any).__429_alert_active = true;
          alert("Too many requests. Please slow down and try again later.");
          setTimeout(() => {
            (window as any).__429_alert_active = false;
          }, 5000);
        }
      }
    }

    return Promise.reject(error);
  },
);
