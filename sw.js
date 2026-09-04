// Labelarium service worker: app shell precached, everything else cache-first at runtime.
const VERSION = 'labelarium-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'devices/index.json',
  'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
    return res;
  }).catch(() => e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
// Explicit "save this device offline" request from the page.
self.addEventListener('message', e => {
  if (e.data?.type === 'precache') e.waitUntil(caches.open(VERSION).then(c => c.addAll(e.data.urls)).then(() => e.source.postMessage({ type: 'precached' })));
});
