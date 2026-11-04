const CACHE = "osy-study-singlefile-v4.0.0";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["./", "./index.html"]))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key.startsWith("osy-study-") && key !== CACHE).map(key => caches.delete(key)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (new URL(req.url).pathname.endsWith("/version.json")) return;
  event.respondWith(fetch(req).then(resp => {
    if (resp.ok && req.mode === "navigate") {
      const copy = resp.clone();
      caches.open(CACHE).then(cache => cache.put("./index.html", copy)).catch(() => {});
    }
    return resp;
  }).catch(async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(req, {ignoreSearch:true})) ||
           (req.mode === "navigate" ? await cache.match("./index.html") : Response.error()) ||
           Response.error();
  }));
});
