const CACHE_NAME = "learnify-v2";
const RUNTIME_CACHE = "learnify-runtime-v2";
const API_CACHE = "learnify-api-v1";
const IMAGE_CACHE = "learnify-images-v1";
const PDF_CACHE = "learnify-pdf-v1";

// App shell
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json"
];

// --------------------
// INSTALL
// --------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

// --------------------
// ACTIVATE
// --------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (
            key !== CACHE_NAME &&
            key !== RUNTIME_CACHE &&
            key !== API_CACHE &&
            key !== IMAGE_CACHE &&
            key !== PDF_CACHE
          ) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// --------------------
// FETCH ROUTER
// --------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // Images
  if (request.destination === "image") {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  // PDFs / documents
  if (
    request.destination === "document" ||
    url.pathname.endsWith(".pdf")
  ) {
    event.respondWith(cacheFirstPDF(request));
    return;
  }

  // Navigation (SPA routes)
  if (request.mode === "navigate") {
    event.respondWith(cacheFirstWithFallback(request));
    return;
  }

  // Default static assets
  event.respondWith(cacheFirst(request));
});

// --------------------
// STRATEGIES
// --------------------

// Generic cache-first (JS, CSS, etc.)
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());

  return response;
}

// API: network first + API_CACHE fallback
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request);

    const cache = await caches.open(API_CACHE);
    cache.put(request, response.clone());

    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return (
      cached ||
      new Response(JSON.stringify({ error: "offline" }), {
        headers: { "Content-Type": "application/json" }
      })
    );
  }
}

// Images: cache first
async function cacheFirstImage(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  const cache = await caches.open(IMAGE_CACHE);
  cache.put(request, response.clone());

  return response;
}

// PDFs: cache first
async function cacheFirstPDF(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  const cache = await caches.open(PDF_CACHE);
  cache.put(request, response.clone());

  return response;
}

// Navigation fallback
async function cacheFirstWithFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    return await fetch(request);
  } catch (err) {
    return caches.match("/") || new Response("Offline");
  }
}