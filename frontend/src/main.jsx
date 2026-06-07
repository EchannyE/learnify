import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { syncOfflineData } from "./utils/syncManager";

// ------------------------
// SERVICE WORKER REGISTER
// ------------------------
const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("/sw.js");

      console.log(
        "✅ Service Worker registered:",
        registration.scope
      );
    } catch (error) {
      console.error(
        "❌ Service Worker registration failed:",
        error
      );
    }
  });
};

// Register service worker only in production to avoid interfering with Vite HMR
if (import.meta.env && import.meta.env.PROD) {
  registerServiceWorker();
}

// ------------------------
// AUTO SYNC WHEN ONLINE
// ------------------------
window.addEventListener("online", async () => {
  console.log("🌐 Internet connection restored");

  try {
    await syncOfflineData();

    console.log(
      "✅ Offline data synced successfully"
    );
  } catch (error) {
    console.error(
      "❌ Failed to sync offline data",
      error
    );
  }
});

// ------------------------
// OPTIONAL: NETWORK STATUS LOG
// ------------------------
window.addEventListener("offline", () => {
  console.log(
    "📴 Device is offline. Changes will be queued."
  );
});

// ------------------------
// ROOT RENDER
// ------------------------
const rootElement =
  document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}