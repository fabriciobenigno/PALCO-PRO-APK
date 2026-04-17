const CACHE_NAME = "palco-pro-cache-v2";
const APP_PREFIX = "/PALCO-PRO-APK";

const APP_SHELL = [
  `${APP_PREFIX}/`,
  `${APP_PREFIX}/index.html`,
  `${APP_PREFIX}/manifest.json`,
  `${APP_PREFIX}/aprovar.png`,
  `${APP_PREFIX}/editar.png`,
  `${APP_PREFIX}/excluir.png`,
  `${APP_PREFIX}/icon-192.png`,
  `${APP_PREFIX}/icon-512.png`,
  `${APP_PREFIX}/palco-pro-icon.png`,
  `${APP_PREFIX}/palco-pro-share.png`,
  `${APP_PREFIX}/instagram.ico`,
  `${APP_PREFIX}/fechar.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (!requestUrl.pathname.startsWith(APP_PREFIX)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match(`${APP_PREFIX}/index.html`);
          }
          return caches.match(`${APP_PREFIX}/index.html`);
        });
    })
  );
});
