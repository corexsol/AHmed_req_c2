// service-worker.js
const VERSION = "v4"; // bump on any release
const STATIC = `h4sp-static-${VERSION}`;
const RUNTIME = `h4sp-runtime-${VERSION}`;

// Add every file your app needs offline
const PRECACHE = [
  "./",
  "./AhmedReqv2.html",
  "./manifest.json",
  "./screen_1_NB.jpg",
  "./screen_two.png",
  "./screen_one.png",
  "./button.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== STATIC && k !== RUNTIME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Offline-first for HTML (stale-while-revalidate) + cache-first for assets
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Handle navigations and documents
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC);
      const cached = await cache.match("./AhmedReqv2.html"); // single-entry app shell
      // Try network in background; if it works, update cache
      const net = fetch(req).then(async (res) => {
        // cache latest doc for next time
        const clone = res.clone();
        try { await cache.put("./AhmedReqv2.html", clone); } catch {}
        return res;
      }).catch(() => null);
      // Serve cached immediately if present (offline), else wait for net
      return cached || (await net) || Response.error();
    })());
    return;
  }

  // Images & other static assets: cache-first
  if (["image", "style", "script", "font"].includes(req.destination)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        const clone = res.clone();
        const cache = await caches.open(RUNTIME);
        cache.put(req, clone);
        return res;
      } catch {
        // As a minimal image fallback, return the button if available
        if (req.destination === "image") {
          const alt = await caches.match("./button.png");
          if (alt) return alt;
        }
        throw new Error("offline");
      }
    })());
    return;
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).catch(() => caches.match("./AhmedReqv2.html")))
  );
});
