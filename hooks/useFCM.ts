"use client";

/**
 * useFCM — Firebase Cloud Messaging Registration Hook
 *
 * Handles the full push notification registration flow for the Next.js dashboard.
 * Uses the Firebase compat CDN scripts (same as the service worker) — no npm package needed.
 *
 * Flow:
 *   1. Checks/requests browser Notification permission
 *   2. Registers the firebase-messaging-sw.js service worker
 *   3. Dynamically loads Firebase compat SDK from CDN
 *   4. Obtains an FCM token from Firebase (using VAPID key)
 *   5. POSTs token + device metadata to /api/v0/fcm-token via proxy
 *
 * Uses the same localStorage key ("fcm_device_id") as cyberlsweb so both apps
 * share device identity in the backend.
 */

import { useEffect, useRef, useCallback } from "react";
import { API } from "@/services/apiClient";
import { fcmService } from "@/services/fcmService";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FcmDeviceInfo {
  token: string;
  deviceId: string;
  deviceType: string;
  appVersion: string;
  osVersion: string;
  deviceModel: string;
  browserName: string;
  userAgent: string;
}

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

// ─── Module-level guard (prevent concurrent registrations) ────────────────────
let _registrationInProgress = false;
let _firebaseLoaded = false;

// ─── Device fingerprinting helpers ────────────────────────────────────────────

function getOrCreateDeviceId(): string {
  const KEY = "fcm_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

function detectBrowser(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Browser";
}

function detectOSVersion(): string {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua) && !/android/i.test(ua)) return "Linux";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  return "Unknown OS";
}

function detectDeviceModel(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) {
    const m = ua.match(/android.*?;\s*([^)]+)\)/i);
    return m?.[1]?.trim() || "Android Device";
  }
  if (/windows nt 10|windows 11/i.test(ua)) return "Windows 10/11";
  if (/windows nt 6\.3/i.test(ua)) return "Windows 8.1";
  if (/windows nt 6\.1/i.test(ua)) return "Windows 7";
  if (/windows/i.test(ua)) return "Windows PC";
  if (/intel mac/i.test(ua)) return "Mac (Intel)";
  if (/macintosh/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux PC";
  return "Desktop";
}

// ─── Firebase config reader ───────────────────────────────────────────────────

function getFirebaseConfig(): Record<string, string> | null {
  let raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  if (!raw) {
    console.warn("[FCM] NEXT_PUBLIC_FIREBASE_CONFIG is not set");
    return null;
  }
  raw = raw.trim();
  try {
    return JSON.parse(raw);
  } catch {
    try {
      // Attempt to strip outer quotes if present
      if (raw.startsWith('"') && raw.endsWith('"')) {
        return JSON.parse(raw.substring(1, raw.length - 1));
      }
      if (raw.startsWith("'") && raw.endsWith("'")) {
        return JSON.parse(raw.substring(1, raw.length - 1));
      }
    } catch (e) {
      // Ignore inner catch
    }
    console.error("[FCM] Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG:", raw);
    return null;
  }
}

// ─── Dynamic script loader ────────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

async function loadFirebaseCompat(): Promise<boolean> {
  if (_firebaseLoaded) return true;
  const base = "https://www.gstatic.com/firebasejs/12.6.0";
  try {
    await loadScript(`${base}/firebase-app-compat.js`);
    await loadScript(`${base}/firebase-messaging-compat.js`);
    _firebaseLoaded = true;
    return true;
  } catch (err) {
    console.error("[FCM] Failed to load Firebase CDN scripts:", err);
    return false;
  }
}

// ─── Service Worker registration ──────────────────────────────────────────────

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("[FCM] Service workers not supported");
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" },
    );

    const config = getFirebaseConfig();
    if (config) {
      await new Promise((r) => setTimeout(r, 200));
      const worker = reg.active || reg.waiting || reg.installing;
      worker?.postMessage({ type: "FIREBASE_CONFIG", config });
    }

    return reg;
  } catch (err) {
    console.warn("[FCM] Service worker registration failed:", err);
    return null;
  }
}

// ─── Full FCM token acquisition + POST ───────────────────────────────────────

async function registerFcmToken(
  force = false,
): Promise<{ success: boolean; message: string; response?: any }> {
  if (_registrationInProgress) {
    return { success: true, message: "FCM registration is already in progress." };
  }
  _registrationInProgress = true;

  try {
    const config = getFirebaseConfig();
    if (!config?.vapidKey) {
      console.warn("[FCM] vapidKey missing");
      return {
        success: false,
        message: "Configuration error: VAPID key is missing.",
      };
    }

    const loaded = await loadFirebaseCompat();
    if (!loaded)
      return { success: false, message: "Failed to load Firebase scripts." };

    const win = window as any;
    const firebase = win.firebase;
    if (!firebase) {
      console.error("[FCM] firebase global not available after script load");
      return { success: false, message: "Firebase SDK not available." };
    }

    const swReg = await registerServiceWorker();
    if (!swReg)
      return {
        success: false,
        message: "Failed to register background sync worker.",
      };

    // Init Firebase app (avoid duplicate)
    let app: any;
    try {
      app =
        firebase.apps?.length > 0
          ? firebase.app()
          : firebase.initializeApp(config);
    } catch {
      app = firebase.app();
    }

    const messaging = app.messaging();

    await new Promise((r) => setTimeout(r, 500));

    let token: string | null = null;
    try {
      token = await Promise.race<string | null>([
        messaging.getToken({
          vapidKey: config.vapidKey,
          serviceWorkerRegistration: swReg,
        }),
        new Promise<null>((res) => setTimeout(() => res(null), 10000)),
      ]);
    } catch (err: any) {
      console.error("[FCM] getToken error:", err?.code || err?.message);
      return {
        success: false,
        message: `Firebase token error: ${err?.message || "Timeout"}`,
      };
    }

    if (!token) {
      console.warn("[FCM] No token obtained");
      return {
        success: false,
        message: "Unable to retrieve notification token from browser.",
      };
    }

    // Skip re-registration for same token this session
    const sessionKey = `fcm_registered_${token.slice(-12)}`;
    if (!force && sessionStorage.getItem(sessionKey)) {
      return { success: true, message: "Device already registered." };
    }

    const deviceInfo: FcmDeviceInfo = {
      token,
      deviceId: getOrCreateDeviceId(),
      deviceType: "web",
      appVersion: "1.0.0",
      osVersion: detectOSVersion(),
      deviceModel: detectDeviceModel(),
      browserName: detectBrowser(),
      userAgent: navigator.userAgent,
    };

    try {
      const apiResponse = await fcmService.registerDevice(deviceInfo);
      if (apiResponse && apiResponse.IsActive === false) {
        console.warn(
          "[FCM] Backend registration failed (success === false):",
          apiResponse.message,
        );
        return {
          success: false,
          message: apiResponse.message || "Registration failed.",
          response: apiResponse,
        };
      }
      sessionStorage.setItem(sessionKey, "1");
      console.log("[FCM] ✅ Device registered");
      return {
        success: true,
        message:
          apiResponse?.message ||
          "This browser is now registered to receive CyberLs push notifications.",
        response: apiResponse,
      };
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Already registered — not an error
        sessionStorage.setItem(sessionKey, "1");
        return {
          success: true,
          message:
            "This browser is already registered to receive CyberLS push notifications.",
          response: err?.response?.data,
        };
      }
      const errMsg =
        err?.response?.data?.message || err?.message || "Registration failed.";
      console.error("[FCM] POST failed:", errMsg);
      return {
        success: false,
        message: errMsg,
        response: err?.response?.data,
      };
    }
  } finally {
    _registrationInProgress = false;
  }
}

// ─── Permission helper (safe for SSR) ────────────────────────────────────────

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission as NotificationPermissionState;
}

// ─── Auto-registration hook (DashboardLayout) ────────────────────────────────

/**
 * useFCMRegistration
 * Call from DashboardLayout. Silently registers if permission is already "granted".
 * Does NOT prompt the user — Settings page handles that.
 */
export function useFCMRegistration() {
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (typeof window === "undefined") return;

    const permission = getNotificationPermission();
    if (permission !== "granted") return;

    attempted.current = true;
    registerFcmToken();
  }, []);
}

// ─── Manual register hook (Settings page button) ─────────────────────────────

/**
 * useFCMManualRegister
 * Returns a register() function.
 * Will request permission first if not yet decided, then register.
 */
export function useFCMManualRegister() {
  const register = useCallback(async (): Promise<{
    success: boolean;
    permission: NotificationPermissionState;
    message: string;
    response?: any;
  }> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return {
        success: false,
        permission: "unsupported",
        message: "Push notifications are not supported by this browser.",
      };
    }

    let permission = Notification.permission as NotificationPermissionState;

    if (permission === "default") {
      permission =
        (await Notification.requestPermission()) as NotificationPermissionState;
    }

    if (permission === "denied") {
      return {
        success: false,
        permission: "denied",
        message:
          "Notification permission is blocked. Please allow it in your browser settings and try again.",
      };
    }

    if (permission !== "granted") {
      return { success: false, permission, message: "Permission not granted." };
    }

    const res = await registerFcmToken(true);
    return {
      success: res.success,
      permission: "granted",
      message: res.message,
      response: res.response,
    };
  }, []);

  return { register };
}
