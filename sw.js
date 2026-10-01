// Service worker för offlinespel. Byggs av scripts/build-page.js, som sätter VERSION till en hash av filerna nedan.
// Ny version ger ny cache; den gamla rensas när den nya tar över.
const VERSION = '8a4f59b23b38';
const CACHE = 'queens-' + VERSION;
const FILES = [
  "./",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "fonts/bricolage-grotesque-latin.woff2",
  "fonts/ibm-plex-mono-400-latin.woff2",
  "fonts/ibm-plex-mono-500-latin.woff2"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('queens-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache först: allt appen behöver ligger i förcachen. Sidnavigering (även med ?query) får index.html.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(caches.match(key, { ignoreSearch: req.mode === 'navigate' }).then((hit) => hit || fetch(req)));
});
