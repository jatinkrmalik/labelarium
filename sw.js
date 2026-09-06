// Labelarium — Copyright (C) 2026 the Labelarium authors. Licensed under the GNU AGPL v3.0 or later; see LICENSE.
// Labelarium service worker.
// Shell files (html/js/css/json): network first, cache fallback — so updates land whenever you are online.
// Everything else (images): cache first — so a device you "saved offline" never re-downloads.
const VERSION = 'labelarium-v23';
const SHELL = ['./', 'index.html', '404.html', 'style.css', 'app.js', 'manifest.webmanifest', 'devices/index.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.ico', 'icons/favicon-32.png', 'icons/og.png',
  'fonts/bodoni-moda-400.woff2', 'fonts/bodoni-moda-400-italic.woff2', 'fonts/jost-400.woff2', 'fonts/jost-500.woff2', 'fonts/jost-600.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const put = res => { if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone())); return res; };
  const cached = () => caches.match(e.request, { ignoreSearch: true });
  const shell = () => caches.match('index.html');
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => res.ok ? put(res) : shell().then(hit => hit || res)).catch(() => shell().then(hit => hit || Response.error())));
    return;
  }
  if (/\.(png|jpg|svg|webp)$/.test(url.pathname)) {
    e.respondWith(cached().then(hit => hit || fetch(e.request).then(put)));
  } else {
    e.respondWith(fetch(e.request).then(put).catch(() => cached().then(hit => hit || Response.error())));
  }
});
// "Save this device offline" request from the page.
self.addEventListener('message', e => {
  if (e.data?.type === 'precache') e.waitUntil(caches.open(VERSION).then(c => c.addAll(e.data.urls)).then(() => e.source.postMessage({ type: 'precached' })));
});
