// Labelarium. Copyright (C) 2026 the Labelarium authors. Licensed under the GNU AGPL v3.0 or later; see LICENSE.
// Labelarium service worker.
// - App shell (html/js/css/json): network first with a 4 s timeout, cache fallback, so updates land whenever you are online.
// - Images and fonts: cache first.
// - "Save offline" puts each label maker in its own cache (labelarium-saved-<id>) that releases never delete.
// Bump VERSION on every app-shell change; it must match BUILD in app.js (CI checks).
const VERSION = 'labelarium-v41';
const IMG_CACHE = 'labelarium-img';   // runtime images: survives releases, trimmed to IMG_MAX entries
const SAVED = 'labelarium-saved-';    // + device id
const IMG_MAX = 600;
const IMG = /\.(png|jpe?g|svg|webp|gif|avif|ico)$/i;
const SHELL = ['./', 'index.html', '404.html', 'style.css', 'app.js', 'manifest.webmanifest', 'devices/index.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.ico', 'icons/favicon-32.png',
  'fonts/bodoni-moda-400.woff2', 'fonts/bodoni-moda-400-italic.woff2', 'fonts/jost-400.woff2', 'fonts/jost-500.woff2', 'fonts/jost-600.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil((async () => {
  if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
  const keys = await caches.keys();
  // Old shell caches only. Saved devices and the image cache survive releases.
  await Promise.all(keys.filter(k => /^labelarium-v\d+$/.test(k) && k !== VERSION).map(k => caches.delete(k)));
  await trimImages();
  await self.clients.claim();
})()));

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);
let puts = 0;
// Clone synchronously (before the page reads the body). Never cache errors, opaque, partial or redirected responses.
function keep(e, name, res) {
  if (res && res.status === 200 && res.type === 'basic' && !res.redirected) {
    const copy = res.clone();
    e.waitUntil(caches.open(name).then(c => c.put(e.request, copy)).then(() => name === IMG_CACHE && ++puts % 50 === 0 && trimImages()).catch(() => {}));
  }
  return res;
}
async function trimImages() {
  const c = await caches.open(IMG_CACHE), keys = await c.keys(); // insertion order ≈ oldest first
  await Promise.all(keys.slice(0, Math.max(0, keys.length - IMG_MAX)).map(k => c.delete(k)));
}
async function navigate(e) {
  const shell = () => caches.match('index.html');
  try {
    const res = await withTimeout(Promise.resolve(e.preloadResponse).then(r => r || fetch(e.request)), 4000);
    return res.ok ? res : (await shell()) || res; // a route that is not pre-rendered: the app shell routes it
  } catch {
    return (await shell()) || Response.error(); // offline, or slower than 4 s
  }
}
function networkFirst(e) {
  const net = fetch(e.request).then(res => keep(e, VERSION, res));
  e.waitUntil(net.catch(() => {})); // a response slower than the timeout still lands in the cache for next time
  return (async () => {
    try { return await withTimeout(net, 4000); }
    catch {
      // This release's copy first, so old saved pack data never meets new app code.
      const cur = await (await caches.open(VERSION)).match(e.request, { ignoreSearch: true });
      return cur || (await caches.match(e.request, { ignoreSearch: true })) || net;
    }
  })();
}
// Images: serve from cache at once, then refresh that cache entry in the background (stale-while-revalidate),
// so a redrawn image reaches returning users and saved packs stay current.
async function cacheFirst(e) {
  for (const name of await caches.keys()) {
    if (name !== IMG_CACHE && !name.startsWith(SAVED) && name !== VERSION) continue;
    const c = await caches.open(name);
    const hit = await c.match(e.request);
    if (hit) {
      if (self.navigator.onLine !== false) {
        e.waitUntil(fetch(e.request).then(res => { if (res.status === 200 && res.type === 'basic') return c.put(e.request, res); }).catch(() => {}));
      }
      return hit;
    }
  }
  return keep(e, IMG_CACHE, await fetch(e.request));
}
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (e.request.mode === 'navigate') {
    e.waitUntil(Promise.resolve(e.preloadResponse).catch(() => {}));
    e.respondWith(navigate(e));
    return;
  }
  if (/^\/(screenshots|icons\/splash|icons\/og)\//.test(url.pathname)) return; // install/share-time assets: straight to the network
  if (IMG.test(url.pathname) || url.pathname.endsWith('.woff2')) { e.respondWith(cacheFirst(e)); return; }
  e.respondWith(networkFirst(e));
});
self.addEventListener('message', e => {
  const { type, id, urls } = e.data || {};
  const reply = m => e.source && e.source.postMessage(m);
  if (type === 'version') { reply({ type: 'version', version: VERSION }); return; }
  if (!/^[a-z0-9-]+$/.test(id || '')) return;
  if (type === 'precache' && Array.isArray(urls)) {
    e.waitUntil(caches.open(SAVED + id).then(c => c.addAll(urls))
      .then(() => reply({ type: 'precached', id }), err => reply({ type: 'precache-failed', id, error: String((err && err.message) || err) })));
  }
  if (type === 'unsave') e.waitUntil(caches.delete(SAVED + id).then(() => reply({ type: 'unsaved', id })));
});
