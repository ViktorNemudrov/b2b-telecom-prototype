self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Required for robust PWA installability in Chromium.
self.addEventListener("fetch", () => {
  // Network passthrough worker for installability signal.
});
