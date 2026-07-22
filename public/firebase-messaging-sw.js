// firebase-messaging-sw.js
// CyberLs Next.js Dashboard — Firebase Cloud Messaging Service Worker
// Adapted from cyberlsweb/public/firebase-messaging-sw.js
// This runs in the background even when the browser tab is closed.
// It receives push messages from Firebase and shows notification popups.

let messagingInstance = null,
  isInitializing = false,
  fallbackPushListenerSetup = false;

// ─── Fallback: show notification without Firebase SDK ────────────────────────
function setupFallbackPushListener() {
  if (fallbackPushListenerSetup) return;
  fallbackPushListenerSetup = true;

  self.addEventListener("push", (event) => {
    let notificationData = {
      title: "CyberLs Notification",
      body: "You have a new notification from CyberLs",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: {},
      tag: "cyberls-default",
    };

    if (event.data) {
      try {
        const payload = event.data.json();
        notificationData = {
          title:
            payload.notification?.title ||
            payload.title ||
            notificationData.title,
          body:
            payload.notification?.body || payload.body || notificationData.body,
          icon:
            payload.notification?.icon || payload.icon || notificationData.icon,
          badge: "/favicon.ico",
          data: payload.data || payload || {},
          tag: payload.data?.tag || payload.tag || "cyberls-default",
        };
      } catch (e) {
        if (event.data.text) notificationData.body = event.data.text();
      }
    }

    event.waitUntil(
      self.registration.showNotification(
        notificationData.title,
        notificationData,
      ),
    );
  });
}

// ─── Message handler: receive config from main page ──────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "FIREBASE_CONFIG" && event.data.config) {
    initializeFirebaseWithConfig(event.data.config);
  }
});

// ─── Load Firebase compat scripts from CDN (with retry) ──────────────────────
async function loadFirebaseScripts(retries = 3) {
  const scripts = [
    "https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js",
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      importScripts(...scripts);
      return true;
    } catch (e) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      } else {
        console.warn(
          "[SW] Firebase scripts unavailable, using fallback push listener",
        );
        throw e;
      }
    }
  }
  return false;
}

// ─── Initialize Firebase Messaging with config sent from main thread ──────────
async function initializeFirebaseWithConfig(config) {
  if (messagingInstance || isInitializing) return;
  isInitializing = true;

  try {
    await loadFirebaseScripts(3);

    // Prevent duplicate Firebase app init
    const existingApps = firebase.apps || [];
    const app =
      existingApps.length > 0
        ? existingApps[0]
        : firebase.initializeApp(config);

    messagingInstance = app.messaging();

    messagingInstance.onBackgroundMessage((payload) => {
      self.registration.showNotification(
        payload.notification?.title || "CyberLs Notification",
        {
          body: payload.notification?.body || "",
          icon: payload.notification?.icon || "/favicon.ico",
          badge: "/favicon.ico",
          data: payload.data || {},
          tag: payload.data?.tag || "cyberls-push",
          requireInteraction: false,
          silent: false,
        },
      );
    });
  } catch (e) {
    // Firebase failed — fallback listener is already active
  }

  isInitializing = false;
}

// ─── Notification click → open/focus the app ─────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen || client.url.includes("/dashboard")) {
            if ("focus" in client) return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      }),
  );
});

// Start fallback listener immediately — Firebase will override if it loads
setupFallbackPushListener();
