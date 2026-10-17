/* LWH PTO — Hub service worker
   Bump VERSION whenever you upload changed files so phones pick them up. */
const VERSION = 'lwhhub-v2.1.0';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'links.js?v=2.1.0',
  'assets/css/theme.css?v=2.1.0', 'assets/js/common.js?v=2.1.0', 'assets/js/hub.js?v=2.1.0',
  'assets/img/logo.png', 'assets/icons/hub-192.png',
  'assets/fonts/oswald-latin-500-normal.woff2', 'assets/fonts/oswald-latin-600-normal.woff2', 'assets/fonts/oswald-latin-700-normal.woff2',
  'assets/fonts/inter-latin-400-normal.woff2', 'assets/fonts/inter-latin-600-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('lwhhub-') && k !== VERSION).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // API calls are POST — never cached
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // weather / Google go straight to network
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('links.js')) {
    // network-first for pages so updates show up right away
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
    return;
  }
  // stale-while-revalidate for css/js/fonts/icons
  e.respondWith(caches.match(req).then(cached => {
    const net = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});
