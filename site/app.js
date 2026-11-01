// Labelarium. Copyright (C) 2026 the Labelarium authors. Licensed under the GNU AGPL v3.0 or later; see LICENSE.
// Labelarium, vanilla JS, History API router, no build step.
import { SITE, OG_IMAGE, pad2, norm, plain, clip, plural, normalize, deviceLabel, deviceTab, countSymbols, packSummary, HAS, seoMeta, pageJsonLd } from './pack.js';
const $ = s => document.querySelector(s);
const app = $('#app'), topbar = $('#topbar'), sheet = $('#sheet');
let main = app; // device views render into the main column; home renders into the app root
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('lab:' + k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem('lab:' + k, JSON.stringify(v)); },
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEYCLASS = { OK: 'ok', Print: 'print' };
// [Key] → keycap, {LCD text} → lcd chip, → arrows
const fmt = s => esc(s)
  .replace(/\[([^\]]+)\]/g, (_, k) => `<kbd class="key ${KEYCLASS[k] || ''}">${k}</kbd>`)
  .replace(/\{([^}]+)\}/g, '<span class="lcd">$1</span>')
  .replace(/→ /g, '→\u00a0').replace(/→/g, '<span class="arrow">→</span>')
  .replace(/(<kbd [^>]*>[^<]*<\/kbd>|<span class="lcd">[^<]*<\/span>)([.,;:!?)]+)/g, '<span class="nowrap">$1$2</span>');
const TAP = matchMedia('(hover: hover) and (pointer: fine)').matches ? 'Click' : 'Tap';
// One consistent stroke icon set (24px grid, 2px stroke), so controls never fall back to mixed-weight text glyphs.
const ICONS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  pin: '<path d="M9 3.5h6l-1.2 5.5 3.7 3.3V14H6.5v-1.7L10.2 9z"/><path d="M12 14v6.5"/>',
  pinned: '<path fill="currentColor" d="M9 3.5h6l-1.2 5.5 3.7 3.3V14H6.5v-1.7L10.2 9z"/><path d="M12 14v6.5"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8"/>',
  symbols: '<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.6l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z"/>',
  frames: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><rect x="7" y="9" width="10" height="6" rx="1"/>',
  templates: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M10 9.5V20"/>',
  fonts: '<path d="M3.5 18.5 8.5 5l5 13.5M5.4 13.6h6.2"/><circle cx="17.6" cy="15.3" r="3.2"/><path d="M20.8 12v6.5"/>',
  shortcuts: '<path d="M13.5 2.8 5 13.8h6.2L10.5 21.2l8.5-11h-6.2z"/>',
  howto: '<path d="M12 6.6C10 5 7 4.4 3.5 4.8v13.6c3.5-.4 6.5.2 8.5 1.8 2-1.6 5-2.2 8.5-1.8V4.8C17 4.4 14 5 12 6.6z"/><path d="M12 6.6v13.6"/>',
  trouble: '<path d="M10.3 4.3 2.6 17.6a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
  preview: '<path d="M3 7.4A2 2 0 0 1 5 5.4h9.6l6.4 6.6-6.4 6.6H5a2 2 0 0 1-2-2z"/><circle cx="15" cy="12" r="1.3"/><path d="M6.5 12h4.5"/>',
  specs: '<rect x="2.5" y="8" width="19" height="8" rx="1.6"/><path d="M6.5 8v3M10 8v4.5M13.5 8v3M17 8v4.5"/>',
  ext: '<path d="M7 17 17 7M9 7h8v8"/>',
  'theme-auto': '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
  'theme-light': '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5 7 7M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5"/>',
  'theme-dark': '<path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z"/>',
  cup: '<path d="M4 8.5h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2M12 3.5v2"/>',
  more: '<circle cx="5.5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
};
// iOS Settings-style tile: the section's glyph on its own colour.
const appIcon = id => `<span class="app-ico ai-${id}" aria-hidden="true">${icon(id, 18)}</span>`;
const icon = (name, size = 20) => `<svg class="ic ic-${name}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
const cssq = s => String(s).replace(/"/g, "'"); // font stacks go inside style="…"

let devices = [];
const loaded = {};
const SAFE_ID = /^[a-z0-9-]+$/;

async function loadIndex() { devices = await (await fetch('/devices/index.json')).json(); }

async function loadDevice(id) {
  if (loaded[id]) return loaded[id];
  const meta = devices.find(d => d.id === id);
  if (!meta || !SAFE_ID.test(id)) throw new Error('Unknown label maker: ' + id);
  const raw = (await import('./' + meta.data)).default;
  return (loaded[id] = normalize(raw, meta.data.slice(0, meta.data.lastIndexOf('/') + 1)));
}


// ponytail: simple scored AND search with prefix + edit-distance-1 fuzz; swap for Fuse.js if it ever falls short
function search(d, q) {
  const terms = norm(q).split(/[^a-z0-9+&#@°%]+/).filter(Boolean);
  if (!terms.length) return [];
  const out = [];
  for (const it of d.index) {
    let score = 0;
    for (const t of terms) {
      if (it._t.includes(t)) score += it._t.startsWith(t) ? 6 : 4;
      else if (it._k.includes(t)) score += 2;
      else if (t.length >= 4 && (it._t + ' ' + it._k).split(/\s+/).some(w => w.startsWith(t.slice(0, -1)) || close(t, w))) score += 1;
      else { score = -1; break; }
    }
    if (score >= 0) out.push({ it, score });
  }
  const rank = { symbol: 0, frame: 1, template: 2, howto: 3, shortcut: 4, 'symbol-category': 5, font: 6, style: 7, error: 8, problem: 9, key: 10 };
  return out.sort((a, b) => b.score - a.score || rank[a.it.type] - rank[b.it.type]).map(r => r.it);
}
function close(a, b) { // Levenshtein distance <= 1
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

// ---------- router (History API) ----------
const OG_ALT = 'Labelarium, the label maker companion';
const HOME_TITLE = 'Labelarium · the label maker companion';
const HOME_DESC = 'Every symbol, frame, template and shortcut of your label maker. Searchable, with pictures, offline.';

function route() {
  let path = location.pathname || '/';
  path = path.replace(/\/index\.html$/, '/').replace(/\.html$/, ''); // pre-rendered files may be reached by their file name
  if (path.length > 1 && path.endsWith('/')) path = path.replace(/\/+$/, '') || '/';
  if (path !== location.pathname) history.replaceState(null, '', path + location.search + location.hash); // one canonical URL per page
  const seg = path.split('/').filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(location.search));
  return { seg, q, path };
}
function routeHash() {
  try { return decodeURIComponent((location.hash || '').replace(/^#/, '')); }
  catch { return (location.hash || '').replace(/^#/, ''); }
}
function absUrl(path) {
  if (!path || path === '/') return SITE + '/';
  return SITE + path;
}
function go(path, replace) {
  const next = path.startsWith('/') ? path : '/' + String(path).replace(/^#\/?/, '');
  if (replace || takeSheetEntry()) history.replaceState(null, '', next);
  else history.pushState(null, '', next);
  return replace ? render() : transition(render, 'forward');
}
// Native-feeling page changes: a short slide + fade between routes where View Transitions exist.
// Forward pushes in from the right, Back from the left; app chrome (tabs, rail) stays put.
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
async function prepareRoute() {
  try {
    if (!devices.length) await loadIndex();
    const { seg } = route();
    if (seg[0] === 'd' && seg[1] && devices.some(x => x.id === seg[1])) await loadDevice(seg[1]);
  } catch {} // render() reports errors itself
}
async function transition(fn, dir) {
  if (!document.startViewTransition || reduceMotion() || document.hidden) return fn();
  const at = location.href;
  await prepareRoute(); // a slow pack download happens before the old page is frozen for the animation
  if (location.href !== at) return; // the user moved on while it loaded; that navigation renders
  if (transition.vt) { try { transition.vt.skipTransition(); } catch {} }
  document.documentElement.dataset.nav = dir;
  // Navigation never waits on the animation: if the browser hasn't run the update within 450 ms
  // (backgrounded window, throttled frames), skip the transition and render now. Runs once either way.
  let ran = false, out;
  const once = () => { if (!ran) { ran = true; out = fn(); } return out; };
  const vt = transition.vt = document.startViewTransition(once);
  vt.ready.catch(() => {});
  vt.finished.catch(() => {}).then(() => { if (transition.vt === vt) { transition.vt = null; delete document.documentElement.dataset.nav; } });
  let done = false;
  return new Promise(res => {
    const t = setTimeout(() => { if (!done) { try { vt.skipTransition(); } catch {} } res(once()); }, 450);
    vt.updateCallbackDone.then(() => { done = true; clearTimeout(t); res(out); }, () => { done = true; clearTimeout(t); res(once()); });
  });
}
window.go = go;

function migrateHash() {
  const h = location.hash;
  if (!h || h === '#') return;
  if (!/^#\//.test(h) && h !== '#/') return;
  const here = location.pathname || '/';
  if (here !== '/') return;
  const raw = h.replace(/^#\/?/, '');
  const [p, qs] = raw.split('?');
  const segs = (p || '').split('/').filter(Boolean);
  const path = segs.length ? '/' + segs.join('/') : '/';
  history.replaceState(null, '', path + (qs ? '?' + qs : ''));
}

function isAppHref(url) {
  return url.origin === location.origin && (url.pathname === '/' || url.pathname.startsWith('/d/'));
}
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]');
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  let url;
  try { url = new URL(a.getAttribute('href'), location.href); } catch { return; }
  if (!isAppHref(url)) return;
  e.preventDefault();
  const next = url.pathname + url.search + url.hash;
  const here = location.pathname + location.search + location.hash;
  if (next === here) return;
  const samePage = url.pathname === location.pathname && url.search === location.search;
  if (takeSheetEntry()) history.replaceState(null, '', next); else history.pushState(null, '', next);
  if (samePage) { applyLocationSeo(); scrollRouteHash(); return; }
  transition(render, 'forward');
});
window.addEventListener('popstate', () => {
  if (ignorePop) { ignorePop = false; return; }          // our own history.back() after closing a sheet
  if (sheetEntry) { sheetEntry = false; sheet.close(); return; } // Back while a sheet is open: just close it
  transition(render, 'back');
});
// Each open sheet owns one history entry so the system Back gesture closes it instead of leaving the page.
let sheetEntry = false, ignorePop = false;
function pushSheetEntry() {
  if (sheetEntry) return;
  history.pushState({ sheet: 1 }, '', location.href);
  sheetEntry = true;
}
function takeSheetEntry() { // navigating from inside a sheet: reuse its entry
  if (!sheetEntry) return false;
  sheetEntry = false;
  return true;
}
window.addEventListener('hashchange', () => { applyLocationSeo(); scrollRouteHash(); });

function setMeta(key, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
function applySeo(title, desc, path, jsonld, opts = {}) {
  // Installed app: the OS window title bar shows this, so keep it short like a native window title.
  document.title = isStandaloneApp() ? (title.replace(/ · Labelarium$/, '') || 'Labelarium') : title;
  const url = absUrl(path);
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
  canon.href = url;
  setMeta('description', desc);
  setMeta('robots', opts.noindex ? 'noindex, follow' : 'index, follow');
  setMeta('og:title', title, 'property');
  setMeta('og:description', desc, 'property');
  setMeta('og:url', url, 'property');
  const img = opts.image || OG_IMAGE, alt = opts.imageAlt || OG_ALT;
  setMeta('og:image', img, 'property');
  setMeta('og:image:secure_url', img, 'property');
  setMeta('og:image:alt', alt, 'property');
  setMeta('twitter:title', title);
  setMeta('twitter:description', desc);
  setMeta('twitter:image', img);
  setMeta('twitter:image:alt', alt);
  const ld = document.getElementById('jsonld');
  if (ld) ld.textContent = JSON.stringify(jsonld || webPageLd(title, desc, url));
}
function webPageLd(title, desc, url, extra = {}) {
  return { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description: desc, url, isPartOf: { '@type': 'WebApplication', name: 'Labelarium', url: SITE + '/' }, image: OG_IMAGE, ...extra };
}
function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication', '@id': SITE + '/#app', name: 'Labelarium', url: SITE + '/', description: HOME_DESC,
        applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        license: 'https://www.gnu.org/licenses/agpl-3.0.html', image: OG_IMAGE,
        screenshot: SITE + '/docs/screenshots/phone-home.png',
        author: { '@type': 'Person', name: 'Jatin Malik', url: 'https://x.com/jatinkrmalik' },
      },
      { '@type': 'WebSite', '@id': SITE + '/#website', name: 'Labelarium', url: SITE + '/', publisher: { '@id': SITE + '/#app' } },
      {
        '@type': 'ItemList', '@id': SITE + '/#makers', name: 'Supported label makers', numberOfItems: devices.length,
        itemListElement: devices.map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + '/d/' + d.id, name: deviceLabel(d) })),
      },
    ],
  };
}
function applyNotFoundSeo(path) {
  const title = 'Not found · Labelarium';
  const desc = 'That page is not in Labelarium.';
  const p = path && path !== '/' ? path : '/';
  applySeo(title, desc, p, webPageLd(title, desc, absUrl(p)), { noindex: true });
}
function knownHomeBrand(b) {
  return b && devices.some(d => d.brand === b) ? b : '';
}
function homeBrand() {
  try { return knownHomeBrand(sessionStorage.getItem('lab:homeBrand')) || 'all'; } catch { return 'all'; }
}
function saveHomeBrand(b) {
  try {
    if (!b || b === 'all') sessionStorage.removeItem('lab:homeBrand');
    else if (knownHomeBrand(b)) sessionStorage.setItem('lab:homeBrand', b);
  } catch {}
}
function adoptHomeBrandQuery() {
  const params = new URLSearchParams(location.search);
  if (!params.has('brand')) return;
  const b = params.get('brand');
  if (knownHomeBrand(b)) saveHomeBrand(b);
  else if (b === 'all') saveHomeBrand('all');
  params.delete('brand');
  const qs = params.toString();
  history.replaceState(null, '', (location.pathname || '/') + (qs ? '?' + qs : '') + location.hash);
}
function applyHomeSeo() {
  const hash = routeHash();
  if (hash === 'favorites') {
    applySeo('Pinned · Labelarium', 'Label makers you pinned on Labelarium.', '/', homeJsonLd());
    return;
  }
  const brand = homeBrand();
  if (brand !== 'all') {
    const names = devices.filter(d => d.brand === brand).map(d => d.name).join(', ');
    // Filtered home is not a distinct URL: keep brand in title/desc, canonicalize to /.
    applySeo(`${brand} label makers · Labelarium`, `${brand} in Labelarium: ${names}. Searchable, with pictures, offline.`, '/', homeJsonLd());
    return;
  }
  applySeo(HOME_TITLE, HOME_DESC, '/', homeJsonLd());
}
function applyDeviceSeo(d, section, rest = [], q = {}) {
  const label = deviceLabel(d), tab = deviceTab(d), hash = routeHash();
  // Each device has its own link-preview card (site/icons/og/<id>.png).
  const og = { image: `${SITE}/icons/og/${d.id}.png`, imageAlt: `${label} on Labelarium` };
  const sec = section === 'home' ? undefined : section;
  const qtext = String(q.q || '').trim();
  if (!sec && qtext) return applySeo(`Search “${qtext}” · ${tab} · Labelarium`, `Search results for “${qtext}” on the ${label}.`, `/d/${d.id}?q=${encodeURIComponent(qtext)}`, null, { ...og, noindex: true });
  // Title, description, canonical and JSON-LD come from site/pack.js, exactly as scripts/prerender.mjs writes them.
  const meta = seoMeta(d, sec, rest);
  if (!meta) return applyNotFoundSeo(location.pathname);
  // In-page anchors and filters share the canonical page; only the title says where you are.
  let title = meta.title;
  const filter = sec === 'frames' && { basic: 'Box and line frames', pictures: 'Picture frames', wide: '12 mm frames' }[q.f];
  const anchor = !rest.length && { tips: 'Quick tips', offline: 'Offline', search: 'Search', errors: 'Error messages', problems: 'Problems', styles: 'Styles' }[hash];
  if (filter) title = `${filter} · ${tab} · Labelarium`;
  else if (anchor) title = `${anchor} · ${tab} · Labelarium`;
  applySeo(title, meta.desc, meta.path, pageJsonLd(d, sec, rest, meta), og);
}
function applyLocationSeo() {
  const { seg, q, path } = route();
  if (!seg.length) { applyHomeSeo(); return; }
  if (seg[0] !== 'd' || !seg[1]) { applyNotFoundSeo(path); return; }
  const d = loaded[seg[1]];
  if (d) applyDeviceSeo(d, seg[2] || 'home', seg.slice(3), q);
}
function scrollRouteHash() {
  const id = routeHash();
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ block: 'start' });
  if (id === 'search') {
    const i = $('#q');
    if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }
}

async function render() {
  const { seg, q } = route();
  sheet.open && sheet.close();
  try {
    if (!devices.length) { await loadIndex(); syncSavedFlags(); }
    if (!seg.length) { adoptHomeBrandQuery(); applyHomeSeo(); renderHome(); ensureFooter(app); maybeShowInstallBar(); return; }
    if (seg[0] !== 'd' || !seg[1]) {
      applyNotFoundSeo(route().path);
      setTop('Nothing here', { back: '/' });
      app.className = 'app';
      app.innerHTML = `<div class="empty"><b>Nothing here</b><br><span class="small">This screen isn’t available. It may have moved.</span><div class="empty-actions"><a class="btn" href="/">Back to label makers</a></div></div>`;
      maybeShowInstallBar();
      return;
    }
    const d = await loadDevice(seg[1]);
    const section = seg[2] || 'home';
    const views = { home: viewDeviceHome, symbols: viewSymbols, frames: viewFrames, templates: viewTemplates, fonts: viewFonts, shortcuts: viewShortcuts, keyboard: viewKeyboard, howto: viewHowto, trouble: viewTrouble, preview: viewPreview, specs: viewSpecs };
    if (!views[section]) return go(`/d/${d.id}`, true);
    applyDeviceSeo(d, section, seg.slice(3), q);
    views[section](d, seg.slice(3), q);
    maybeShowInstallBar();
    openFromQuery(d, q);
  } catch (e) {
    setTop('Labelarium', { back: '/' });
    applySeo('Not found · Labelarium', e.message || 'That page is not in Labelarium.', route().path || '/', null, { noindex: true });
    app.className = 'app';
    const offline = !navigator.onLine || /fetch|import|network|load/i.test(String(e.message));
    const saved = devices.filter(x => store.get('offline:' + x.id, false));
    app.innerHTML = offline
      ? `<div class="empty offline-state"><b>You’re offline</b><br><span class="small">This label maker isn’t saved on this device yet. It opens as soon as you’re back online.</span>${saved.length ? `<p class="small" style="margin-top:18px">Saved for offline:</p><div class="empty-actions">${saved.map(x => `<a class="chip" href="/d/${x.id}">${esc(deviceTab(x))}</a>`).join('')}</div>` : ''}<br><a href="/">All label makers</a></div>`
      : `<div class="empty">Something went wrong.<br><span class="small">${esc(e.message)}</span><br><br><a href="/">Back to all label makers</a></div>`;
    ensureFooter(app);
    console.error(e);
  } finally {
    if (routeHash()) requestAnimationFrame(scrollRouteHash);
    else if (!route().q.q) window.scrollTo(0, 0);
    focusPage();
  }
}
let lastPath = null;
function focusPage() {
  const path = location.pathname;
  if (lastPath === null || lastPath === path) { lastPath = path; return; } // first paint and in-page re-renders keep focus where it is
  lastPath = path;
  const active = document.activeElement;
  if (active && active !== document.body && document.contains(active)) return;
  const h = document.querySelector('.topbar h1') || document.querySelector('#app h1');
  if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
}

// Diagonal ABC tape. viewBox is sized for rotate(-26) of the 88×22 strip so nothing is clipped.
const TAPE_MARK = `<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="-22 -16 100 70" width="57" height="40" overflow="visible" aria-hidden="true" focusable="false"><g transform="rotate(-26 28 19)"><rect x="-16" y="8" width="88" height="22" fill="#e8b820"/><rect x="-16" y="8" width="88" height="3" fill="#141414"/><rect x="-16" y="27" width="88" height="3" fill="#141414"/><text x="28" y="24" text-anchor="middle" font-family="Jost,Futura,'Century Gothic',sans-serif" font-weight="700" font-size="13" fill="#141414">ABC</text></g></svg>`;

function iconBtn({ tag='button', href, cls='', label, title, extra='', inner }) {
  const hrefAttr = href ? ` href="${esc(href)}"` : '';
  const typeAttr = tag === 'button' && !/\btype=/.test(extra) ? ' type="button"' : '';
  const extraAttr = extra ? ` ${extra}` : '';
  return `<${tag} class="iconbtn labeled ${cls}"${hrefAttr}${typeAttr}${extraAttr} aria-label="${esc(label)}" title="${esc(title || label)}"><span class="ico" aria-hidden="true">${inner}</span><span class="lbl">${esc(label)}</span></${tag}>`;
}

function setTop(title, { back, sub, right = '', deviceId } = {}) {
  topbar.classList.toggle('home', !back);
  if (back) topbar.removeAttribute('aria-label');
  else topbar.setAttribute('aria-label', 'Labelarium');
  const logo = back
    ? `<a class="iconbtn back" href="${esc(back)}" aria-label="Back">${icon('back', 22)}</a>`
    : `<a class="wordmark" href="/" aria-label="Labelarium home">${TAPE_MARK}<span>Labelarium</span></a>`;
  const deviceIcon = deviceId
    ? `<img class="dev-top" src="/icons/devices/${esc(deviceId)}.svg" alt="" width="48" height="48">`
    : '';
  const actions = right ? `<div class="top-right">${right}</div>` : '';
  const titleHtml = back
    ? `<div class="title"><h1>${esc(title)}</h1>${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</div>`
    : '';
  const innerLabel = back ? '' : ' aria-label="Labelarium"';
  topbar.innerHTML = `<div class="inner"${innerLabel}>${logo}${deviceIcon}${titleHtml}${actions}</div>`;
  syncTopOffset();
}
// Sticky search and the sticky label preview sit just under the app bar.
function syncTopOffset() {
  document.documentElement.style.setProperty('--top-h', Math.round(topbar.getBoundingClientRect().height) + 'px');
}
if ('ResizeObserver' in window) new ResizeObserver(syncTopOffset).observe(topbar);
// Overlay scrollbars: mark whatever is scrolling so CSS shows its thumb, then let it fade after a pause.
document.addEventListener('scroll', e => {
  // The window's own scrollbar takes its style from <body> in Chromium, so mark both for page scrolls.
  const els = e.target === document ? [document.documentElement, document.body] : [e.target];
  for (const el of els) {
    if (!(el instanceof Element)) continue;
    el.classList.add('is-scrolling');
    clearTimeout(el._scrollIdle);
    el._scrollIdle = setTimeout(() => el.classList.remove('is-scrolling'), 900);
  }
}, { capture: true, passive: true });
window.addEventListener('scroll', () => {
  topbar.classList.toggle('scrolled', window.scrollY > 4);
  const h = document.querySelector('.hero-home h1');
  topbar.classList.toggle('past-hero', !!h && h.getBoundingClientRect().bottom < topbar.getBoundingClientRect().bottom);
}, { passive: true });

function deviceTileLabel(dev) {
  const brand = dev.brand || '', model = dev.model || '';
  if (!model || model.toLowerCase() === brand.toLowerCase()) return deviceLabel(dev);
  const m = model.toLowerCase(), b = brand.toLowerCase();
  const tile = !brand || m.startsWith(b + ' ') ? model : `${brand} ${model}`;
  const full = deviceLabel(dev);
  return tile.length <= full.length ? tile : full;
}

// Made-by copy variants (flip data-made-by / uncomment one):
// A: Made with ❤️ and ☕ by @jatinkrmalik
// B (default): Hand-labeled with care by @jatinkrmalik
// C: Built one label at a time by @jatinkrmalik
// const MADE_BY = 'Made with ❤️ and ☕ by @jatinkrmalik'; // A
const MADE_BY = 'Hand-labeled with care by @jatinkrmalik'; // B
// const MADE_BY = 'Built one label at a time by @jatinkrmalik'; // C

// Document-flow site footer. Not sticky: lives at the end of the page content.
function siteFooter() {
  return `<footer class="site-foot">
    <div class="foot-mark">${TAPE_MARK}<span>Labelarium</span></div>
    <nav class="footer" aria-label="About Labelarium">
      <a href="https://github.com/jatinkrmalik/labelarium" target="_blank" rel="noopener"><svg class="f-gh" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg><span>Open source</span></a>
      <a href="https://github.com/sponsors/jatinkrmalik" target="_blank" rel="noopener">${icon('cup', 16)}<span>Buy me a coffee</span></a>
      <button type="button" onclick="shareApp()">${shareIcon()}<span>Share</span></button>
    </nav>
    <p class="foot-by"><a href="https://x.com/jatinkrmalik" target="_blank" rel="noopener" data-made-by="b">${MADE_BY}</a></p>
    <p class="footer-legal">Unofficial and not affiliated. Brother, DYMO, NIIMBOT, Brady, Phomemo and related marks belong to their owners. <a href="https://github.com/jatinkrmalik/labelarium/blob/main/TRADEMARK.md" target="_blank" rel="noopener">Trademarks</a></p>
  </footer>`;
}
function ensureFooter(el) {
  if (!el || el.querySelector(':scope > .site-foot')) return;
  el.insertAdjacentHTML('beforeend', siteFooter());
  // Search results hide the in-main footer; renderResults may run before this.
  if (el.classList.contains('has-q')) el.querySelector(':scope > .site-foot').hidden = true;
}

// ---------- appearance: Auto follows the system, Light and Dark override it ----------
// The choice is applied before first paint by window.labTheme (inline in index.html), which swaps dark.css's media.
const APPEARANCE = [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']];
const appearance = () => { const m = store.get('appearance'); return m === 'light' || m === 'dark' ? m : 'auto'; };
const appearanceControl = () => `<div class="seg appearance" role="radiogroup" aria-label="Appearance">${APPEARANCE.map(([m, name]) =>
  `<button type="button" role="radio" aria-checked="${m === appearance()}" onclick="setAppearance('${m}')">${icon('theme-' + m, 17)}<span>${name}</span></button>`).join('')}</div>`;
const appearanceButton = () => iconBtn({ cls: 'js-appearance', label: 'Appearance', title: 'Appearance: Auto, Light or Dark', extra: 'aria-haspopup="dialog" onclick="openAppearance()"', inner: icon('theme-' + appearance(), 18) });
window.openAppearance = () => openSheet(`<div class="appearance-sheet"><h2 class="t">Appearance</h2>${appearanceControl()}<p class="hint">Auto matches your device's light or dark setting.</p></div>`, 'narrow');
window.setAppearance = m => {
  try { if (m === 'auto') localStorage.removeItem('lab:appearance'); else store.set('appearance', m); } catch {}
  window.labTheme?.(m);
  document.querySelectorAll('.appearance [role=radio]').forEach((b, i) => b.setAttribute('aria-checked', String(APPEARANCE[i % 3][0] === m)));
  document.querySelectorAll('.js-appearance .ico').forEach(el => { el.innerHTML = icon('theme-' + m, 18); });
};

// ---------- home ----------
let homeQuery = '';
function renderHome() {
  setTop('Labelarium', { right: appearanceButton() + installIconButton() });
  app.className = 'app'; main = app;
  const favs = store.get('favs', []);
  const brand = homeBrand();
  const brands = [...new Set(devices.map(d => d.brand))];
  const list = brand === 'all' ? devices : devices.filter(d => d.brand === brand);
  const favDevs = devices.filter(d => favs.includes(d.id));
  const last = devices.find(d => d.id === store.get('last'));
  const model = dev => dev.model && dev.model.toLowerCase() !== String(dev.brand).toLowerCase() ? dev.model : deviceTileLabel(dev);
  const card = dev => `<div class="card devtile link" data-q="${esc(norm(`${deviceLabel(dev)} ${dev.model} ${dev.tagline}`))}">
      <button class="star ${favs.includes(dev.id) ? 'on' : ''}" aria-label="${favs.includes(dev.id) ? 'Unpin' : 'Pin'} ${esc(deviceTab(dev))}" aria-pressed="${favs.includes(dev.id)}" title="Pin to top" onclick="toggleFav('${dev.id}')">${icon(favs.includes(dev.id) ? 'pinned' : 'pin', 17)}</button>
      <a class="devtile-hit" href="/d/${dev.id}">
      <div class="dev-icon"><img src="/icons/devices/${esc(dev.id)}.svg" alt="" loading="lazy"></div>
      <div class="dev-copy"><span class="brand-k">${esc(dev.brand)}</span><b>${esc(model(dev))}</b><div class="muted">${esc(dev.tagline)}</div></div>
      </a>
    </div>`;
  const continueCard = last ? `<a class="card link continue" href="/d/${last.id}"><img src="/icons/devices/${esc(last.id)}.svg" alt=""><span><span class="k">Continue where you left off</span><b>${esc(deviceTab(last))}</b></span><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>` : '';
  const designDev = last || devices.find(x => favs.includes(x.id));
  const designCard = `<a class="card link designer-cta home" href="${designDev ? `/d/${designDev.id}/preview` : '#design'}"${designDev ? '' : ' onclick="event.preventDefault();openDesignPicker()"'}>${designDev ? miniTape(loaded[designDev.id] || { ...designDev, fonts: [] }, store.get('preview:' + designDev.id, null)) : '<span class="mini-tape finish-gloss" aria-hidden="true" style="background:linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0) 38%), #f7c900;color:#141414"><span>Your label</span></span>'}<span class="cta-copy"><span class="k">Label preview</span><b>Design a label${designDev ? ` for the ${esc(deviceTab(designDev))}` : ''}</b><span class="muted">See it on real tape colours, then follow the key-by-key recipe.</span></span><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`;
  const requestTile = `<a class="card devtile link request-tile" href="https://github.com/jatinkrmalik/labelarium/issues/new?template=label_maker_request.yml" target="_blank" rel="noopener" aria-label="Request a label maker">
      <span class="devtile-hit">
      <span class="dev-icon" aria-hidden="true"><span class="request-q">?</span></span>
      <span class="dev-copy"><b>Request a label maker</b><span class="muted">Don't see yours?</span></span>
      </span>
    </a>`;
  const chip = (id, label) => `<button type="button" class="chip ${brand === id ? 'on' : ''}" aria-pressed="${brand === id}" onclick="setHomeBrand('${id}')">${label}</button>`;
  const startHere = (brand === 'all' || brand === 'Brady') ? `<section class="card start-here" aria-label="Start here">
      <p class="start-kicker">Start here</p>
      <p>Looking up a Brady M210? This unofficial reference covers the manual, how to use the printer, and troubleshooting. Not affiliated with Brady.</p>
      <p class="start-here-links"><a class="chip" href="/d/brady-m210">Brady M210</a><a class="chip" href="/d/brady-m210/howto">How to use</a><a class="chip" href="/d/brady-m210/trouble">Troubleshooting</a></p>
    </section>` : '';
  // Phone-first order: find your maker in one glance. The hero is two lines, the finder and the grid follow straight away.
  app.innerHTML = `<div class="hero-home"><div class="kicker">The label maker companion</div><h1 class="big">Labelarium</h1><p>Every symbol, frame, template and shortcut of your label maker. Searchable, with pictures, offline.</p>
    <div class="finder" role="search"><span class="mag" aria-hidden="true">${icon('search')}</span><input id="finder" type="search" aria-label="Find your label maker" placeholder="Find your label maker: D220, DYMO…" autocomplete="off" autocapitalize="off" value="${esc(homeQuery)}" oninput="filterDevices(this.value)"></div>
    ${continueCard}${designCard}</div>
    ${favDevs.length ? `<h2 id="favorites">Pinned</h2><div class="devgrid">${favDevs.map(card).join('')}</div>` : ''}
    <h2>Label makers <span class="muted" id="devcount">${list.length}</span></h2>
    <div class="home-toolbar">
      <div class="chips" role="group" aria-label="Filter by brand">${chip('all', 'All')}${brands.map(b => chip(b, b)).join('')}</div>
    </div>
    <div class="devgrid" id="devgrid">${list.map(card).join('')}${requestTile}</div>
    <p class="finder-empty" id="finder-empty" hidden>No label maker matches that. <a href="https://github.com/jatinkrmalik/labelarium/issues/new?template=label_maker_request.yml" target="_blank" rel="noopener">Request it</a>.</p>
    <section class="card share-home" aria-label="Share Labelarium">
      <div><b>Know someone with a label maker?</b><p class="muted small">Send them Labelarium. Free, no sign-up, works offline.</p></div>
      <button type="button" class="btn" onclick="shareApp()">${shareIcon()} Share Labelarium</button>
    </section>
    ${startHere}
    ${siteFooter()}`;
  if (homeQuery) filterDevices(homeQuery);
}
window.openDesignPicker = () => openSheet(`<h2 class="t">Design a label <span class="muted">Which label maker?</span></h2><div class="list plate">${devices.map(dev => `<a class="card link pick-dev" href="/d/${dev.id}/preview" onclick="document.getElementById('sheet').close()"><img src="/icons/devices/${esc(dev.id)}.svg" alt="" width="40" height="40"><span><b>${esc(deviceTab(dev))}</b><span class="muted small">${esc(dev.tagline)}</span></span><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`).join('')}</div>`);
window.filterDevices = v => {
  homeQuery = v;
  const terms = norm(v).split(/\s+/).filter(Boolean);
  let shown = 0;
  document.querySelectorAll('#devgrid .devtile[data-q]').forEach(el => {
    const hit = terms.every(t => el.dataset.q.includes(t));
    el.hidden = !hit;
    if (hit) shown++;
  });
  const req = document.querySelector('#devgrid .request-tile');
  if (req) req.hidden = !!terms.length && !shown;
  const empty = $('#finder-empty');
  if (empty) empty.hidden = !!shown || !terms.length;
  const cnt = $('#devcount');
  if (cnt) cnt.textContent = shown;
  if (terms.length) announce(shown ? `${shown} label maker${shown === 1 ? '' : 's'}` : 'No label maker matches');
};
window.setHomeBrand = b => {
  saveHomeBrand(b);
  history.replaceState(null, '', '/' + (location.hash || ''));
  render();
};
window.toggleFav = id => {
  const f = store.get('favs', []), on = !f.includes(id);
  store.set('favs', on ? [...f, id] : f.filter(x => x !== id));
  render(); haptic();
  const dev = devices.find(x => x.id === id);
  toast(on ? `Pinned ${dev ? deviceTab(dev) : ''} to the top` : 'Unpinned');
};

// ---------- device home + search ----------
// A pack only offers the sections it has content for (no empty "0 templates" tiles).
const sectionsFor = d => SECTIONS.filter(([id]) => !HAS[id] || HAS[id](d));
// Bottom tabs keep fixed slots across every pack: Search · Preview · Symbols · Frames (+ More).
function tabSlots(d) {
  const has = id => !HAS[id] || HAS[id](d);
  const pick = (...ids) => ids.find(has);
  const second = pick('symbols', 'keyboard', 'howto');
  const third = ['frames', 'templates', 'keyboard', 'howto'].filter(id => id !== second).find(has);
  return ['home', 'preview', second, third].filter(Boolean);
}
const SECTIONS = [
  ['preview', 'strip', 'Label preview', 'Design a label, get the recipe'],
  ['keyboard', 'keys', 'Keyboard map', 'Where every key is and what it does'],
  ['symbols', 'ci-red', 'Symbols', d => `${d.symbols.categories.reduce((n, c) => n + (c.items.length || (c.charsNote ? 99 : c.chars.split(' ').length)), 0)} in ${d.symbols.categories.length} categories`],
  ['frames', 'hollow', 'Frames', d => `${plural(d.frames.items.filter(f => f.n !== 'off').length, 'design')}, by number`],
  ['templates', 'tr-yellow', 'Templates', d => [d.templates.text.length && `${d.templates.text.length} text`, d.templates.pattern.length && `${d.templates.pattern.length} pattern`].filter(Boolean).join(' · ')],
  ['fonts', 'half', 'Fonts & styles', d => [plural(d.fonts.length, 'font'), d.styles.length > 1 && plural(d.styles.length, 'style')].filter(Boolean).join(' · ')],
  ['shortcuts', 'dia', 'Shortcuts', d => plural(d.shortcuts.length, 'key combo')],
  ['howto', 'lines', 'How-to guides', d => `${plural(d.howto.length, 'step-by-step guide')}`],
  ['trouble', 'cross', 'Troubleshooting', d => [d.errors.length && plural(d.errors.length, 'message'), d.problems.length && plural(d.problems.length, 'fix', 'fixes')].filter(Boolean).join(' · ')],
  ['specs', 'quarter', 'Specs & tapes', 'Tape widths, limits, links'],
];
function deviceTop(d, section, sub, back) {
  const favs = store.get('favs', []);
  const star = iconBtn({ cls: favs.includes(d.id) ? 'fav' : '', label: 'Pin', title: 'Pin to home', extra: `onclick="toggleFav('${d.id}')" aria-pressed="${favs.includes(d.id)}"`, inner: icon(favs.includes(d.id) ? 'pinned' : 'pin', 18) });
  const search = section ? iconBtn({ tag: 'a', href: `/d/${d.id}`, cls: 'top-search', label: 'Search', inner: icon('search', 18) }) : '';
  const bradyHub = !section && d.id === 'brady-m210';
  const title = bradyHub ? 'Brady M210' : (section || d.model);
  const subtitle = bradyHub ? 'Unofficial reference' : (section ? d.model : d.brand);
  // Install lives in the rail (tablet/desktop) and the More sheet (phone), so the app bar stays one row.
  setTop(title, { back: back || (section ? `/d/${d.id}` : '/'), sub: subtitle, deviceId: d.id, right: search + star });
  store.set('last', d.id);
  const cur = route().seg[2] || 'home';
  const all = [['home', 'ring', 'Search'], ...sectionsFor(d).map(([id, ico, name]) => [id, ico, name])];
  const SHORT = { home: 'Search', keyboard: 'Keyboard', symbols: 'Symbols', frames: 'Frames', templates: 'Templates', fonts: 'Fonts', shortcuts: 'Shortcuts', howto: 'How-to', trouble: 'Trouble', preview: 'Preview', specs: 'Specs' };
  const link = ([id, ico, name], short) => `<a href="/d/${d.id}${id === 'home' ? '#search' : '/' + id}" class="${cur === id ? 'on' : ''}"${cur === id ? ' aria-current="page"' : ''}${id === 'home' ? ' onclick="focusDeviceSearch(event)"' : ''}><span class="nav-ico">${id === 'home' ? icon('search', 21) : icon(id, 21)}</span><span>${short ? SHORT[id] : name}</span></a>`;
  const rail = `<nav class="rail" aria-label="Sections"><a class="brand" href="/" title="All label makers"><img class="dev-rail" src="/icons/devices/${esc(d.id)}.svg" alt=""><b>${esc(d.model)}</b></a>${all.map(x => link(x, true)).join('')}<div class="rail-foot"><button type="button" class="iconbtn" aria-label="Share" title="Share" onclick="sharePage()">${shareIcon()}</button>${appearanceButton()}${installIconButton()}</div></nav>`;
  const tabIds = tabSlots(d);
  const tabs = `<nav class="tabs" aria-label="Quick navigation">${all.filter(x => tabIds.includes(x[0])).map(x => link(x, true)).join('')}<button type="button" class="${tabIds.includes(cur) ? '' : 'on'}" aria-haspopup="dialog" onclick="openMore('${d.id}')"><span class="nav-ico">${icon('more', 21)}</span><span>More</span></button></nav>`;
  app.className = 'app device';
  app.innerHTML = `${rail}<section class="main" id="main"></section>${tabs}`;
  main = $('#main');
  const on = app.querySelector('.rail a.on');
  if (on) requestAnimationFrame(() => on.scrollIntoView({ block: 'nearest' }));
}
window.openMore = id => {
  const d = loaded[id], cur = route().seg[2] || 'home';
  const inTabs = tabSlots(d).slice(1);
  const rest = sectionsFor(d).filter(([sid]) => !inTabs.includes(sid));
  const install = `<div class="more-actions"><button type="button" class="btn ghost" onclick="shareDevice('${id}')">${shareIcon()} Share</button>${shouldShowInstallControls() ? `<button type="button" class="btn ghost js-install" onclick="requestInstall()">${installIconSvg()} ${esc(installActionLabel())}</button>` : ''}<a class="btn ghost" href="/">All label makers</a></div>
    <div class="more-about"><a href="https://github.com/jatinkrmalik/labelarium" target="_blank" rel="noopener">Open source on GitHub${icon('ext', 16)}</a><a href="https://github.com/sponsors/jatinkrmalik" target="_blank" rel="noopener">Buy me a coffee${icon('ext', 16)}</a><a href="https://x.com/jatinkrmalik" target="_blank" rel="noopener">${MADE_BY}${icon('ext', 16)}</a></div>`;
  const look = `<div class="more-appearance"><span>Appearance</span>${appearanceControl()}</div>`;
  openSheet(`<h2 class="t">${esc(d.model)} <span class="muted">Everything in this pack</span></h2><div class="more">${rest.map(([sid, ico, name, sub]) => `<a href="/d/${id}/${sid}" class="${cur === sid ? 'on' : ''}" onclick="document.getElementById('sheet').close()">${appIcon(sid)}<span><b>${name}</b><small>${typeof sub === 'function' ? sub(d) : sub}</small></span></a>`).join('')}</div>${look}${install}`);
};
function searchBox(d, q) {
  return `<div class="search" id="search" role="search"><span class="mag" aria-hidden="true">${icon('search')}</span><input id="q" type="search" aria-label="Search this label maker" placeholder="Search: warning, gift, margin…" value="${esc(q || '')}" autocomplete="off" autocapitalize="off" oninput="onSearch('${d.id}', this.value)">${q ? `<button type="button" class="clr" aria-label="Clear search" onclick="onSearch('${d.id}','');document.getElementById('q').focus()">${icon('close', 16)}</button>` : ''}</div>`;
}
let searchTimer;
window.onSearch = (id, v) => {
  const i = $('#q');
  if (i && i.value !== v) i.value = v;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    history.replaceState(null, '', `/d/${id}${v ? '?q=' + encodeURIComponent(v) : ''}`);
    const d = loaded[id];
    applyDeviceSeo(d, 'home', [], { q: v });
    renderResults(d, v);
  }, 80);
};
window.focusDeviceSearch = e => {
  const i = $('#q');
  if (!i) return;
  e.preventDefault();
  i.focus();
  i.setSelectionRange(i.value.length, i.value.length);
};

function viewDeviceHome(d, _, q) {
  deviceTop(d);
  main.innerHTML = `${searchBox(d, q.q)}<div id="results"></div><div id="sections" class="twocol"></div>`;
  if (q.q) renderResults(d, q.q, true); else renderSections(d);
  if (location.hash === '#search' || q.q) {
    const i = $('#q');
    if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }
}
function packIntro(d) {
  if (d.id !== 'brady-m210') return '';
  const hasHowto = d.howto && d.howto.length;
  const hasTrouble = (d.errors && d.errors.length) || (d.problems && d.problems.length);
  if (d.id === 'brady-m210') {
    return `<p class="hint pack-intro">An unofficial searchable reference covering Brady M210 manual topics (symbols, <a href="/d/${d.id}/howto">how-to guides</a>, and <a href="/d/${d.id}/trouble">troubleshooting</a>). Not affiliated with Brady.</p>`;
  }
  const bits = [];
  if (hasHowto) bits.push(`<a href="/d/${d.id}/howto">how-to guides</a>`);
  if (hasTrouble) bits.push(`<a href="/d/${d.id}/trouble">troubleshooting</a>`);
  if (!bits.length) return '';
  const joined = bits.length === 2 ? `${bits[0]} and ${bits[1]}` : bits[0];
  return `<p class="hint pack-intro">This pack includes ${joined}.</p>`;
}
function renderSections(d) {
  const tiles = sectionsFor(d).filter(([id]) => id !== 'preview').map(([id, ico, name, sub]) => `<a class="tile" href="/d/${d.id}/${id}"><span class="ico">${appIcon(id)}</span><b>${name}</b><span class="n">${typeof sub === 'function' ? sub(d) : sub}</span></a>`).join('');
  const saved = store.get('offline:' + d.id);
  const tries = ['warning', 'no smoking', 'gift', 'serial number', 'save tape', 'reset'].filter(t => search(d, t).length);
  const suggest = tries.length ? `<div class="suggest" aria-label="Try a search"><span class="lbl">Try</span>${tries.map(t => `<button type="button" class="chip" onclick="onSearch('${d.id}','${t}')">${t}</button>`).join('')}</div>` : '';
  const design = `<a class="card link designer-cta" href="/d/${d.id}/preview">${miniTape(d, store.get('preview:' + d.id, null))}<span class="cta-copy"><span class="k">Label preview</span><b>Design a label</b><span class="muted">See it on the tape, then follow the ${familyOf(d).app ? 'steps' : 'exact key presses'}.</span></span><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`;
  $('#sections').innerHTML = `<div class="col">${design}${suggest}<h2>Browse</h2><div class="grid">${tiles}</div>${packIntro(d)}</div>
    <div class="col"><h2 id="tips">Quick tips</h2><div class="list plate">${d.tips.map((t, i) => `<div class="card" style="display:flex;gap:12px;font-size:15px"><span style="font:600 15px/1.5 var(--sans);color:var(--red);min-width:1.2em">${i + 1}</span><span>${fmt(t)}</span></div>`).join('')}</div>
    <div class="card" id="offline" style="margin-top:12px"><div class="row" style="flex-wrap:nowrap"><div style="min-width:0"><b>Offline copy</b><div class="muted small">${saved ? 'All images for this label maker are saved on this device.' : 'Save all pictures so everything works without a network.'}</div></div>
    ${saved ? `<button type="button" class="btn ghost" style="margin-left:auto;flex:0 0 auto" onclick="removeOffline('${d.id}')" aria-label="Remove the offline copy">Saved ✓ · Remove</button>` : `<button type="button" class="btn" style="margin-left:auto;flex:0 0 auto" onclick="saveOffline('${d.id}')">Save offline</button>`}</div></div>
    <div class="card share-card" style="margin-top:12px"><div class="row" style="flex-wrap:nowrap"><div style="min-width:0"><b>Know someone with a ${esc(d.model)}?</b><div class="muted small">Send them this pack. It opens straight to the symbols and key presses.</div></div>
    <button type="button" class="btn ghost" style="margin-left:auto;flex:0 0 auto" onclick="shareDevice('${d.id}')">${shareIcon()} Share</button></div></div></div>`;
}
function renderResults(d, q, firstPaint) {
  const box = $('#results'), sections = $('#sections');
  main.classList.toggle('has-q', !!q);
  const foot = main.querySelector(':scope > .site-foot');
  if (foot) foot.hidden = !!q;
  if (!q) { box.innerHTML = ''; sections.hidden = false; if (!sections.innerHTML) renderSections(d); return; }
  sections.hidden = true;
  const res = search(d, q);
  announce(res.length ? `${res.length} result${res.length === 1 ? '' : 's'}` : `Nothing matches ${q}`);
  if (!res.length) {
    box.innerHTML = `<div class="empty">Nothing matches “${esc(q)}”.<p class="small">Try a simpler word</p>
      <div class="empty-actions">
        <button type="button" class="chip" onclick="onSearch('${d.id}','sign')">sign</button>
        <button type="button" class="chip" onclick="onSearch('${d.id}','star')">star</button>
        <button type="button" class="chip" onclick="onSearch('${d.id}','tape')">tape</button>
      </div></div>`;
    return;
  }
  const groups = {}; res.forEach(r => (groups[r.type] ||= []).push(r));
  const names = { symbol: 'Symbols', frame: 'Frames', template: 'Templates', howto: 'How-to', shortcut: 'Shortcuts', 'symbol-category': 'Symbol categories', font: 'Fonts', style: 'Styles', error: 'Error messages', problem: 'Problems & fixes', key: 'Keys' };
  const terms = norm(q).split(/\s+/).filter(w => w.length > 1).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = terms.length ? new RegExp(`(${terms.join('|')})`, 'ig') : null;
  const hi = s => re ? String(s).split(re).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('') : esc(s);
  let html = '';
  for (const type of Object.keys(names)) {
    const g = groups[type]; if (!g) continue;
    html += `<div class="result-h"><h2>${names[type]}</h2><span class="cnt">${g.length}</span></div>`;
    if (type === 'symbol') html += `<div class="symgrid">${g.slice(0, 60).map(r => glyphTile(d, r.item, true)).join('')}</div>`;
    else if (type === 'frame') html += `<div class="framelist">${g.map(r => frameTile(d, r.item)).join('')}</div>`;
    else if (type === 'template') html += `<div class="framelist">${g.map(r => tplTile(d, r.item)).join('')}</div>`;
    else if (type === 'symbol-category') html += g.map(r => catCard(d, r.cat)).join('');
    else if (type === 'howto') html += g.map(r => `<a class="card link" href="/d/${d.id}/howto/${r.item.id}"><div><b>${hi(r.item.title)}</b><div class="muted small">${fmt(r.item.steps[0])}</div></div><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`).join('');
    else if (type === 'shortcut') html += g.map(r => `<div class="card"><div>${fmt(r.item.keys)}</div><div style="margin-top:6px"><b>${hi(r.item.action)}</b></div></div>`).join('');
    else if (type === 'font') html += g.map(r => `<a class="card link" href="/d/${d.id}/fonts"><img class="font-img" src="${r.item.img}" alt=""><div><b>${hi(r.item.name)}</b><div class="muted small">${esc(r.item.desc)}</div></div><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`).join('');
    else if (type === 'style') html += g.map(r => `<a class="card link" href="/d/${d.id}/fonts"><img class="font-img" src="${r.item.img}" alt=""><div><b>${hi(r.item.name)}</b><div class="muted small">${fmt('[Font] → {Style} → [OK]')}</div></div></a>`).join('');
    else if (type === 'error') html += g.map(r => chevRow(`/d/${d.id}/trouble/${r.item.slug}`, `<b class="lcd">${hi(r.item.msg)}</b><div class="small" style="margin-top:6px">${hi(r.item.cause)}</div>`)).join('');
    else if (type === 'problem') html += g.map(r => chevRow(`/d/${d.id}/trouble/${r.item.slug}`, `<b>${hi(r.item.problem)}</b><div class="small muted" style="margin-top:4px">${esc(clip(r.item.fix, 120))}</div>`)).join('');
    else if (type === 'key') html += g.map(r => `<a class="card link" href="/d/${d.id}/keyboard"><div><b>${hi(r.item.name)}</b> <span class="pill">key ${r.item.n}</span><div class="muted small">${fmt(r.item.desc)}</div></div><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`).join('');
  }
  box.innerHTML = html;
}
function offlineUrls(d, id) {
  const meta = devices.find(x => x.id === id);
  const urls = [meta.data, d.keyboard.image, d.symbols.accented.image, ...d.symbols.categories.flatMap(c => [c.img, ...c.items.map(i => i.img)]),
    ...d.frames.items.map(f => f.img), ...d.templates.text.map(t => t.img), ...d.templates.pattern.map(t => t.img), ...d.fonts.map(f => f.img),
    ...['sizes', 'widths', 'styles', 'alignments'].flatMap(k => d[k].map(x => x.img)), `/icons/devices/${id}.svg`];
  return [...new Set(urls.filter(Boolean))];
}
window.saveOffline = async id => {
  const d = loaded[id], meta = devices.find(x => x.id === id);
  const urls = offlineUrls(d, id);
  const btn = document.querySelector('#offline .btn'); if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }
  try {
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {}); // ask the browser not to evict it
    await swAsk({ type: 'precache', id, urls }, 'precached', 120000);
    store.set('offline:' + id, true);
    haptic();
    toast(`${deviceTab(meta)} works offline now`, canInstall() ? { action: 'Install app', onAction: requestInstall, ms: 6000 } : {});
  } catch (e) { toast('Could not save offline: ' + e.message); }
  if ($('#sections')) renderSections(d);
};
window.removeOffline = async id => {
  try { await swAsk({ type: 'unsave', id }, 'unsaved', 15000); } catch {}
  store.set('offline:' + id, false);
  if ($('#sections') && loaded[id]) renderSections(loaded[id]);
  toast('Offline copy removed');
};
// Post a message to the service worker and wait for its reply for this device.
async function swAsk(msg, okType, ms) {
  const reg = await Promise.race([navigator.serviceWorker?.ready, new Promise(res => setTimeout(res, 4000))]);
  if (!reg?.active) throw new Error('needs https or localhost');
  return new Promise((res, rej) => {
    const sw = navigator.serviceWorker;
    const t = setTimeout(() => { sw.removeEventListener('message', h); rej(new Error('timed out')); }, ms);
    function h(e) {
      if (e.data?.id && e.data.id !== msg.id) return;
      if (e.data.type === okType) { clearTimeout(t); sw.removeEventListener('message', h); res(); }
      else if (e.data.type === 'precache-failed') { clearTimeout(t); sw.removeEventListener('message', h); rej(new Error(e.data.error || 'download failed')); }
    }
    sw.addEventListener('message', h);
    reg.active.postMessage(msg);
  });
}

// ---------- tiles & sheets ----------
function glyphTile(d, it, showName) {
  return `<button class="glyph" onclick="openSymbol('${d.id}','${it.cat.id}',${it.n})" title="${esc(it.name)}"><span class="badge">${it.n}</span><img src="${it.img}" alt="${esc(it.name)}" loading="lazy">${showName ? `<span class="name">${esc(it.name)}</span>` : ''}</button>`;
}
function frameTile(d, f) {
  return `<button class="frame" onclick="openFrame('${d.id}','${f.n}')"><span class="badge">${f.n === 'off' ? 'Off' : 'Frame'}</span>${f.wide ? '<span class="pill warn" style="position:absolute;right:8px;top:6px">12 mm</span>' : ''}<img class="frame-img" src="${f.img}" alt="" loading="lazy"><div class="lbl"><span class="num">${f.n === 'off' ? 'Off' : f.n}</span><span>${esc(f.name)}</span></div></button>`;
}
function tplTile(d, t) {
  return `<button class="frame" onclick="openTemplate('${d.id}','${t.kind}',${t.n})"><span class="badge">${t.kind === 'text' ? 'Text' : 'Pattern'}</span><img class="tpl-img" src="${t.img}" alt="" loading="lazy"><div class="lbl"><span class="num">${pad2(t.n)}</span><span>${esc(t.name)}</span></div></button>`;
}
function catCard(d, c) {
  const preview = c.items.length ? c.items.slice(0, 4).map(i => `<img src="${i.img}" alt="" style="height:22px">`).join(' ') : `<span style="font-size:1.1rem">${esc(c.chars.split(' ').slice(0, 8).join(' '))}</span>`;
  return `<a class="card link" href="/d/${d.id}/symbols/${c.id}"><div style="min-width:0"><b>${esc(c.name)}</b> <span class="pill">${c.group}</span> <span class="pill">key ${esc(c.key)}</span><div class="row img-card" style="gap:6px;margin-top:6px;flex-wrap:nowrap;overflow:hidden">${preview}</div></div><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`;
}
function openSheet(html, cls = '') {
  sheet.classList.remove('zoom', 'narrow', 'zoomed');
  if (cls) sheet.classList.add(cls);
  sheet.innerHTML = `<div class="inner"><div class="grab" aria-hidden="true"></div><button class="iconbtn close" aria-label="Close" onclick="document.getElementById('sheet').close()">${icon('close', 18)}</button>${html}</div>`;
  const t = sheet.querySelector('h2.t');
  if (t) { t.id = 'sheet-t'; sheet.setAttribute('aria-labelledby', 'sheet-t'); sheet.removeAttribute('aria-label'); }
  sheet.style.transform = '';
  if (!sheet.open) { sheet.showModal(); pushSheetEntry(); }
}
// Bottom sheet: drag down from the handle or the top of the content to dismiss (phones), like a native sheet.
(() => {
  let y0 = null, dy = 0, t0 = 0;
  const inner = () => sheet.querySelector('.inner');
  sheet.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' || innerWidth >= 700) return;
    const fromHandle = e.target.closest('.grab');
    if (!fromHandle && (inner()?.scrollTop > 0 || e.target.closest('input, select, textarea, .zoom-hero, .tapewrap'))) return;
    y0 = e.clientY; dy = 0; t0 = performance.now();
  });
  sheet.addEventListener('pointermove', e => {
    if (y0 === null) return;
    dy = Math.max(0, e.clientY - y0);
    if (dy > 6) { sheet.classList.add('dragging'); sheet.style.transform = `translateY(${dy}px)`; }
  });
  const end = () => {
    if (y0 === null) return;
    const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
    sheet.classList.remove('dragging');
    if (dy > 120 || (fast && dy > 40)) { sheet.classList.add('settle'); sheet.style.transform = 'translateY(100%)'; setTimeout(() => { sheet.close(); sheet.classList.remove('settle'); sheet.style.transform = ''; }, 200); }
    else if (dy > 0) { sheet.classList.add('settle'); sheet.style.transform = ''; setTimeout(() => sheet.classList.remove('settle'), 220); }
    y0 = null; dy = 0;
  };
  sheet.addEventListener('pointerup', end);
  sheet.addEventListener('pointercancel', end);
})();
// Toast: one at a time, bottom of the screen above the tabs, optional action (Undo, Reload…).
let toastTimer;
function toast(msg, { action, onAction, ms = 3800 } = {}) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); if ('popover' in el) el.popover = 'manual'; document.body.append(el); }
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  if (action) el.querySelector('button').onclick = () => { el.classList.remove('show'); onAction && onAction(); };
  el.classList.remove('show');
  // Re-enter the top layer each time so the toast sits above an open sheet (<dialog> is top layer too).
  if (el.popover) { try { if (el.matches(':popover-open')) el.hidePopover(); el.showPopover(); } catch {} }
  void el.offsetWidth; // restart the slide-in
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}
window.toast = toast;
// A tiny tap of haptic feedback on Android for toggles and saves (no-op elsewhere).
const haptic = () => { try { navigator.vibrate && !reduceMotion() && navigator.vibrate(8); } catch {} };
// Polite live region for result counts (search, device finder).
function announce(msg) {
  let el = document.getElementById('sr-live');
  if (!el) { el = document.createElement('div'); el.id = 'sr-live'; el.className = 'sr-only'; el.setAttribute('aria-live', 'polite'); document.body.append(el); }
  el.textContent = '';
  setTimeout(() => { el.textContent = msg; }, 50);
}
function zoomable(src, alt, extraClass) {
  return `<button type="button" class="${extraClass} zoomable" data-src="${esc(src)}" data-alt="${esc(alt)}" onclick="openZoom(this.dataset.src, this.dataset.alt)"><img src="${esc(src)}" alt="${esc(alt)}"><span class="kbd-hint">${TAP} to zoom</span></button>`;
}
window.openZoom = (src, alt) => {
  sheet.classList.add('zoom');
  sheet.classList.toggle('photo', /\.jpe?g$/i.test(src));
  sheet.removeAttribute('aria-labelledby'); sheet.setAttribute('aria-label', alt || 'Zoomed image');
  sheet.style.transform = '';
  sheet.innerHTML = `<div class="inner"><div class="grab"></div><button class="iconbtn close" aria-label="Close" onclick="document.getElementById('sheet').close()">${icon('close', 18)}</button><div class="zoom-hero" onclick="document.getElementById('sheet').classList.toggle('zoomed')"><img src="${esc(src)}" alt="${esc(alt)}"></div><p class="zoom-hint">${TAP} the picture to zoom in or out</p></div>`;
  if (!sheet.open) { sheet.showModal(); pushSheetEntry(); }
};
sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
sheet.addEventListener('close', () => {
  sheet.classList.remove('zoom', 'photo');
  if (sheetEntry) { sheetEntry = false; ignorePop = true; history.back(); } // closed by ×, Esc, swipe or backdrop: drop its entry
});
const steps = arr => `<ol class="steps">${arr.map(s => `<li>${fmt(s)}</li>`).join('')}</ol>`;
// One-line summary of a recipe, e.g. [Symbol] → {Pictograph} [OK] → [Space] [OK] → {#4} [OK]
const keypath = s => `<span class="keypath">${fmt(s)}</span>`;
const glance = s => `<div class="glance"><div class="glance-h">At a glance</div>${keypath(s)}</div>`;
const symbolPath = (c, n) => `[Symbol] → {${c.group}} [OK] → [${c.key}] [OK] → ${n ? `{#${n}}` : '{#}'} [OK]`;

window.openSymbol = (id, catId, n) => {
  const d = loaded[id], c = d.symbols.categories.find(x => x.id === catId), it = c.items[n - 1];
  openSheet(`<div class="hero"><img src="${it.img}" alt=""></div><h2 class="t">${esc(it.name)}</h2>
    <p class="muted small">${esc(c.name)} · ${c.group} · position ${it.n} of ${c.items.length}${it.ch ? ` · looks like ${it.ch}` : ''}</p>
    ${glance(symbolPath(c, it.n))}
    <h3>Step by step</h3>${steps([`Press [Symbol].`, `[◀] / [▶] to {${c.group}} → [OK].`, `Press [${c.key}] to jump to {${c.name}} (or [◀] / [▶] to it) → [OK].`, `[◀] / [▶] to symbol number ${it.n} → [OK].`])}
    <div class="note">Recently used? Pick <b>History</b> instead. It keeps your last 7 symbols.</div>
    <div class="btn-row"><button type="button" class="btn ghost" onclick="shareSymbol('${id}','${c.id}',${it.n})">${shareIcon()} Share</button><a class="btn ghost" href="/d/${id}/symbols/${c.id}">All ${esc(c.name)} ›</a></div>`);
};
window.openFrame = (id, n) => {
  const d = loaded[id], f = d.frames.items.find(x => String(x.n) === String(n));
  const digits = f.n === 'off' ? null : String(f.n).split('').map(x => `[${x}]`).join(' ');
  openSheet(`<div class="hero"><img src="${f.img}" alt=""></div><h2 class="t">${f.n === 'off' ? 'No frame' : `Frame ${f.n}`} <span class="muted">${esc(f.name)}</span></h2>
    ${f.wide ? '<p><span class="pill warn">12 mm (0.47") tape only</span></p>' : ''}
    ${glance(digits ? `[Frame] → ${digits} → [OK]` : '[Frame] → {Off} → [OK]')}
    <h3>Step by step</h3>${steps(digits ? ['Press [Frame].', `Type ${digits} (or [◀] / [▶] to ${f.n}).`, 'Press [OK].'] : ['Press [Frame].', '[◀] / [▶] to {Off}.', 'Press [OK].'])}
    <div class="note">Frames apply to the whole label. On narrower tape than allowed you get <b>No Frame OK?</b>. [OK] prints without it.</div>
    <div class="btn-row"><button type="button" class="btn ghost" onclick="shareFrame('${id}','${f.n}')">${shareIcon()} Share</button><a class="btn" href="/d/${id}/preview?frame=${f.n}">Try it in Label preview</a></div>`);
};
window.openTemplate = (id, kind, n) => {
  const d = loaded[id], t = d.templates[kind].find(x => x.n === n);
  openSheet(`<div class="hero"><img src="${t.img}" alt=""></div><h2 class="t">${kind === 'text' ? 'Text' : 'Pattern'} template ${pad2(t.n)} <span class="muted">${esc(t.name)}</span></h2><p class="small">${esc(t.desc)}</p>
    <p><span class="pill warn">12 mm (0.47") tape only</span></p>
    <h3 style="margin-top:14px">How to use</h3>${steps((kind === 'text' ? d.templates.textHowto : d.templates.patternHowto).map(s => s.replace('the design (number below)', `design number ${pad2(t.n)}`).replace('pick the pattern', `pick pattern ${pad2(t.n)}`)))}
    <div class="note">${d.templates.notes.map(fmt).join('<br>')}</div>
    <div class="btn-row"><button type="button" class="btn ghost" onclick="shareTemplate('${id}','${kind}',${t.n})">${shareIcon()} Share</button></div>`);
};

// ---------- sections ----------
function viewSymbols(d, [catId]) {
  if (catId) return viewCategory(d, catId);
  deviceTop(d, 'Symbols');
  const grp = g => { const cs = d.symbols.categories.filter(c => c.group === g); return cs.length ? `<div class="catgrid">${cs.map(c => catCard(d, c)).join('')}</div>` : ''; };
  main.innerHTML = `<div class="card fold"><details class="howto-fold"><summary><span class="sum-t">How to insert any symbol</span><span class="muted small">${d.symbols.howto.length} steps</span></summary>${steps(d.symbols.howto)}</details></div>
    ${grp('Basic') ? `<h2>Basic <span class="muted small">(text characters)</span></h2>${grp('Basic')}` : ''}
    ${grp('Pictograph') ? `<h2>Pictograph <span class="muted small">(pictures)</span></h2>${grp('Pictograph')}` : ''}
    ${Object.keys(d.symbols.accented.table || {}).length ? `<h2>Accented letters</h2><a class="card link" href="/d/${d.id}/symbols/accented"><div><b>Accent key table</b><div class="muted small">á ç ñ ö ß ž … via the [Accent] key</div></div><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>` : ''}`;
}
function viewCategory(d, catId) {
  if (catId === 'accented') {
    const a = d.symbols.accented;
    deviceTop(d, 'Accented letters', undefined, `/d/${d.id}/symbols`);
    main.innerHTML = `<div class="card"><h2 class="h3">How to type them</h2>${steps(a.howto)}</div><h2>All variants</h2>${zoomable(a.image, "Accented characters table", "card img-card")}
      <div class="card acc-table" style="margin-top:10px">${Object.entries(a.table).map(([k, v]) => `<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line)"><b style="min-width:20px">${k}</b><span style="letter-spacing:.15em">${v}</span></div>`).join('')}</div>`;
    return;
  }
  const c = d.symbols.categories.find(x => x.id === catId);
  if (!c) return viewSymbols(d, []);
  deviceTop(d, c.name, undefined, `/d/${d.id}/symbols`);
  const how = steps(['Press [Symbol].', `[◀] / [▶] to {${c.group}} → [OK].`, `Press [${c.key}] to jump straight to {${c.name}} (or [◀] / [▶] to it) → [OK].`, '[◀] / [▶] to the symbol (numbers below = position) → [OK].']);
  let body;
  if (c.items.length) body = `<div class="symgrid">${c.items.map(it => glyphTile(d, it, true)).join('')}</div><h2>As printed in the manual</h2>${zoomable(c.img, c.name + " as printed in the manual", "card img-card")}`;
  else body = `<div class="card"><div class="chars">${c.chars.split(' ').map((ch, i) => `<span class="c" title="position ${i + 1}">${esc(ch)}</span>`).join('')}</div>${c.charsNote ? `<p class="muted small">${esc(c.charsNote)}</p>` : ''}</div><h2>As printed in the manual</h2>${zoomable(c.img, c.name + " as printed in the manual", "card img-card")}`;
  main.innerHTML = `<div class="row" style="margin:2px 0 10px"><span class="pill">${c.group}</span><span class="pill">shortcut key: ${esc(c.key)}</span><span class="pill">${c.items.length || c.chars.split(' ').length}${c.charsNote ? '+' : ''} symbols</span></div>
    <div class="card fold"><details class="howto-fold"><summary><span class="sum-t">How to insert</span>${keypath(symbolPath(c))}</summary>${how}</details></div>
    <h2>Symbols <span class="muted small">${TAP.toLowerCase()} one for its exact steps</span></h2>${body}`;
}
function viewFrames(d, _, q) {
  deviceTop(d, 'Frames');
  const filter = q.f || 'all';
  const numbered = d.frames.items.filter(f => f.n !== 'off' && Number.isFinite(+f.n));
  const hasBasic = numbered.some(f => +f.n <= 17);
  const hasPictures = numbered.some(f => +f.n > 17);
  const hasWide = d.frames.items.some(f => f.wide);
  const items = d.frames.items.filter(f => filter === 'all' || (filter === 'basic' && f.n !== 'off' && f.n <= 17) || (filter === 'pictures' && f.n !== 'off' && f.n > 17) || (filter === 'wide' && f.wide));
  const chip = (id, label) => `<button type="button" class="chip ${filter === id ? 'on' : ''}" aria-pressed="${filter === id}" onclick="setFilter('${d.id}','${id}')">${label}</button>`;
  const chips = [chip('all', 'All')];
  if (hasBasic && hasPictures) {
    chips.push(chip('basic', 'Boxes & lines (0–17)'));
    chips.push(chip('pictures', 'With pictures (18–99)'));
  }
  if (hasWide) chips.push(chip('wide', '12 mm only'));
  const chipRow = chips.length > 1 ? `<div class="chips">${chips.join('')}</div>` : '';
  main.innerHTML = `<div class="card fold"><details class="howto-fold"><summary><span class="sum-t">How to apply a frame</span><span class="muted small">${d.frames.howto.length} steps</span></summary>${steps(d.frames.howto)}<div class="note">${d.frames.notes.map(fmt).join('<br>')}</div></details></div>
    ${chipRow}
    ${items.length ? `<div class="framelist">${items.map(f => frameTile(d, f)).join('')}</div>` : ''}`;
}
// Filter chips: swap the query string in place and re-render without losing the scroll position.
window.setFilter = (id, f) => { const y = window.scrollY; history.replaceState(null, '', `/d/${id}/frames?f=${f}`); render().then(() => requestAnimationFrame(() => window.scrollTo(0, y))); };
function viewTemplates(d) {
  deviceTop(d, 'Templates');
  const block = (title, sub, howto, items) => items.length
    ? `<h2>${title} <span class="muted small">(${sub})</span></h2><div class="card"><h3>How</h3>${steps(howto)}</div><div class="framelist" style="margin-top:10px">${items.map(t => tplTile(d, t)).join('')}</div>`
    : '';
  main.innerHTML = `<div class="card"><div class="note">${d.templates.notes.map(fmt).join('<br>')}</div></div>
    ${block('Text label templates', 'your text, their layout', d.templates.textHowto, d.templates.text)}
    ${block('Pattern label templates', 'decorative tape, no text', d.templates.patternHowto, d.templates.pattern)}`;
}
function viewFonts(d) {
  deviceTop(d, 'Fonts & styles');
  const list = (title, arr, id) => `<h2 id="${esc(id)}">${title}</h2><div class="fontlist plate">${arr.map((f, i) => `<div class="card"><span class="pill">${i + 1}</span><img class="font-img" src="${f.img}" alt=""><div><b>${esc(f.name)}</b>${f.desc ? `<div class="muted small">${esc(f.desc)}</div>` : ''}</div>${f.css ? `<span class="font-sample" style="font-family:${cssq(f.css)};font-weight:${f.weight};font-style:${f.style}">Abc 1</span>` : ''}</div>`).join('')}</div>`;
  main.innerHTML = `<div class="card"><h2 class="h3">How to change text settings</h2>${steps(['Press [Font].', '[◀] / [▶] to {Font}, {Size}, {Width}, {Style} or {Alignment} → [OK].', '[◀] / [▶] to the setting → [OK].'])}<div class="note">${esc(d.fontNote)} The samples on screen are close approximations of the printed font.</div></div>
    ${list('Fonts', d.fonts, 'fonts')}${list('Sizes', d.sizes, 'sizes')}${list('Widths', d.widths, 'widths')}${list('Styles', d.styles, 'styles')}${list('Alignment', d.alignments, 'alignment')}`;
}
function viewShortcuts(d) {
  deviceTop(d, 'Shortcuts');
  main.innerHTML = `<p class="hint">Key combos and hidden tricks. Menu shortcuts work from the text screen.</p><div class="list plate sc">${d.shortcuts.map(s => `<div class="card"><div class="sc-keys">${fmt(s.keys)}</div><div class="sc-what"><b>${esc(s.action)}</b></div></div>`).join('')}</div>`;
}
function viewKeyboard(d) {
  deviceTop(d, 'Keyboard map');
  const low = d.keyboard.legend.filter(([n]) => n <= 7);
  const high = d.keyboard.legend.filter(([n]) => n > 7);
  const photo = /\.jpe?g$/i.test(d.keyboard.image);
  const band = (arr, label) => arr.length
    ? `<h2>${label} (${arr[0][0]}–${arr[arr.length - 1][0]})</h2><div class="card legend">${arr.map(([n, name, desc]) => `<div><b>${n}</b> <strong>${esc(name)}</strong><div class="muted small">${fmt(desc)}</div></div>`).join('')}</div>`
    : '';
  main.innerHTML = `${zoomable(d.keyboard.image, 'Diagram', photo ? 'card kbd-card kbd-photo' : 'card kbd-card')}
    ${band(low, 'Callouts')}${band(high, 'Callouts')}`;
}
const chevRow = (href, inner) => `<a class="card link" href="${href}"><div style="min-width:0">${inner}</div><span class="chev" aria-hidden="true">${icon('chev', 18)}</span></a>`;
function viewHowto(d, [topic]) {
  const brady = d.id === 'brady-m210';
  const h = topic && d.howto.find(x => x.id === topic);
  if (h) {
    deviceTop(d, plain(h.title), undefined, `/d/${d.id}/howto`);
    const at = d.howto.indexOf(h);
    const more = [...d.howto.slice(at + 1), ...d.howto.slice(0, at)].slice(0, 6);
    main.innerHTML = `<div class="card"><h2 class="h3">Step by step</h2>${steps(h.steps)}${h.notes ? `<div class="note">${h.notes.map(fmt).join('<br>')}</div>` : ''}
      <div class="btn-row"><button type="button" class="btn ghost" onclick="sharePage()">${shareIcon()} Share this guide</button></div></div>
      <h2>More guides</h2><div class="list plate">${more.map(x => chevRow(`/d/${d.id}/howto/${x.id}`, `<b>${esc(x.title)}</b><div class="muted small">${plural(x.steps.length, 'step')}</div>`)).join('')}</div>
      <p class="hint"><a href="/d/${d.id}/howto">All ${d.howto.length} ${esc(d.model)} guides</a></p>`;
    return;
  }
  deviceTop(d, brady ? 'M210 how-to guides' : 'How-to guides');
  const intro = brady ? `<p class="hint pack-intro">Unofficial how-to guides for the Brady M210. Not affiliated with Brady.</p>` : '';
  main.innerHTML = `${intro}<div class="list plate">${d.howto.map(x => chevRow(`/d/${d.id}/howto/${x.id}`, `<b>${esc(x.title)}</b><div class="muted small">${esc(clip(plain(x.steps.join(' ')), 96))}</div>`)).join('')}</div>`;
}
function viewTrouble(d, [slug]) {
  const brady = d.id === 'brady-m210';
  const t = slug && d.trouble.find(x => x.slug === slug);
  const errRow = e => chevRow(`/d/${d.id}/trouble/${e.slug}`, `<span class="lcd">${esc(e.msg)}</span><div class="muted small" style="margin-top:6px">${esc(clip(e.cause, 110))}</div>`);
  const probRow = p => chevRow(`/d/${d.id}/trouble/${p.slug}`, `<b>${esc(p.problem)}</b><div class="muted small">${esc(clip(p.fix, 110))}</div>`);
  if (t) {
    deviceTop(d, t.kind === 'error' ? plain(t.msg) : plain(t.problem), undefined, `/d/${d.id}/trouble`);
    const others = (t.kind === 'error' ? d.errors : d.problems).filter(x => x !== t);
    main.innerHTML = `<div class="card trouble-detail">${t.kind === 'error'
        ? `<p class="small muted" style="margin:0 0 8px">The ${esc(d.model)} shows:</p><div class="lcd lcd-big">${esc(t.msg)}</div><h2 class="h3">What it means</h2><p>${fmt(t.cause)}</p><h2 class="h3">How to fix it</h2><div class="note">${fmt(t.fix)}</div>`
        : `<h2 class="h3">How to fix it</h2><div class="note">${fmt(t.fix)}</div>`}
      <div class="btn-row"><button type="button" class="btn ghost" onclick="sharePage()">${shareIcon()} Share this fix</button></div></div>
      ${others.length ? `<h2>${t.kind === 'error' ? 'Other error messages' : 'Other problems'}</h2><div class="list plate">${others.map(t.kind === 'error' ? errRow : probRow).join('')}</div>` : ''}
      <p class="hint"><a href="/d/${d.id}/trouble">All ${esc(d.model)} troubleshooting</a></p>`;
    return;
  }
  deviceTop(d, brady ? 'M210 troubleshooting' : 'Troubleshooting');
  const intro = brady ? `<p class="hint pack-intro">Unofficial LCD error messages and fixes for the Brady M210. Not affiliated with Brady.</p>` : '';
  main.innerHTML = `${intro}${d.errors.length ? `<h2 id="errors">Error messages on the LCD</h2><div class="list plate">${d.errors.map(errRow).join('')}</div>` : ''}
    ${d.problems.length ? `<h2 id="problems">What to do when…</h2><div class="list plate">${d.problems.map(probRow).join('')}</div>` : ''}`;
}
function viewSpecs(d) {
  deviceTop(d, 'Specs & tapes');
  main.innerHTML = `<div class="card"><dl class="kv">${d.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
    <h2>Tape widths</h2><div class="list plate">${d.tapes.map(t => `<div class="card"><b>${t.mm} mm <span class="muted">(${t.in})</span></b> <span class="pill">${t.lines} line${t.lines > 1 ? 's' : ''}</span><div class="small muted">${esc(t.note)}</div></div>`).join('')}</div>
    <h2>Links</h2><div class="list plate">${d.links.map(([t, u]) => `<a class="card link" href="${esc(u)}" target="_blank" rel="noopener"><b>${esc(t)}</b><span class="chev" aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span></a>`).join('')}</div>`;
}

// ---------- label preview / designer ----------
// Each family of label maker takes its own media and is driven its own way (keys, menus or a phone app), so the
// designer offers that family's tapes and controls and writes that family's steps.
// Tape: [name, tape colour, ink colour, finish]. Finish: '' laminated gloss, 'clear', 'metal', 'fluoro', 'paper' (die-cut thermal).
// The first TZe entries keep their original order: saved labels and shared links store the index.
const MEDIA = {
  tze: { item: w => `${w} TZe cassette`, verb: 'Insert a', tapes: [
    ['Black on white', '#fbfbf7', '#141414', ''], ['Black on yellow', '#f7c900', '#141414', ''], ['Black on clear', 'clear', '#141414', 'clear'],
    ['Black on red', '#d3302a', '#141414', ''], ['Black on blue', '#2f72c6', '#141414', ''], ['Black on green', '#2e9a4d', '#141414', ''],
    ['White on black', '#171717', '#f7f7f2', ''], ['Red on white', '#fbfbf7', '#c8261f', ''], ['Blue on white', '#fbfbf7', '#1d4fb8', ''],
    ['Black on fluorescent orange', '#ff6a14', '#141414', 'fluoro'], ['Black on matte silver', '#c3c6ca', '#141414', 'metal'],
    ['Gold on black', '#171717', '#d4ac4a', ''], ['White on blue', '#2f72c6', '#ffffff', ''], ['White on red', '#d3302a', '#ffffff', ''],
    ['White on clear', 'clear', '#ffffff', 'clear'], ['Black on gold', '#cda547', '#141414', 'metal']] },
  d1: { item: w => `${w} D1 cassette`, verb: 'Insert a', tapes: [
    ['Black on white', '#fbfbf7', '#141414', ''], ['Black on yellow', '#f7cf1d', '#141414', ''], ['Black on clear', 'clear', '#141414', 'clear'],
    ['Blue on white', '#fbfbf7', '#1d4fb8', ''], ['Red on white', '#fbfbf7', '#c8261f', ''], ['White on black', '#171717', '#f7f7f2', ''],
    ['Black on red', '#d3302a', '#141414', ''], ['Black on blue', '#3d7fd0', '#141414', ''], ['Black on green', '#34a352', '#141414', ''],
    ['White on clear', 'clear', '#ffffff', 'clear']] },
  m21: { item: w => `${w} M21 cartridge`, verb: 'Insert a', tapes: [
    ['Black on white', '#fbfbf7', '#141414', ''], ['Black on yellow', '#f7cf1d', '#141414', ''], ['Black on clear', 'clear', '#141414', 'clear'],
    ['Black on orange', '#f2782a', '#141414', '']] },
  thermal: { item: w => `${w} label roll`, verb: 'Load a', tapes: [
    ['Black on white', '#fdfdfb', '#1a1a1a', 'paper'], ['Black on clear', 'clear', '#1a1a1a', 'clear'], ['Black on yellow', '#fde58a', '#1a1a1a', 'paper'],
    ['Black on pink', '#f9c6d3', '#1a1a1a', 'paper'], ['Black on blue', '#bcd9f2', '#1a1a1a', 'paper'], ['Black on green', '#cdeac0', '#1a1a1a', 'paper']] },
};
const ALL_TYPE = ['font', 'size', 'width', 'style', 'align', 'frame', 'margin', 'length', 'mirror'];
const FAMILIES = {
  brother: { media: 'tze', controls: ALL_TYPE, margins: { Full: 25, Half: 12, Narrow: 4, 'Chain Print': 4 }, lengthMax: 300 },
  brotherFn: { media: 'tze', controls: ALL_TYPE, margins: { 'Large margin': 25, 'Small margin': 2, Chain: 2 }, lengthMax: 300 },
  dymo160: { media: 'd1', controls: ['size', 'style', 'frame'], margins: { Auto: 8 }, frameLabel: 'Box' },
  dymo280: { media: 'd1', controls: ['font', 'size', 'style', 'frame', 'length', 'align', 'mirror'], margins: { Auto: 8 }, lengthMax: 400, frameLabel: 'Border' },
  brady: { media: 'm21', controls: ['size', 'style'], margins: { Auto: 5 } },
  app: { controls: ['align', 'length'], margins: { Auto: 4 }, lengthMax: 300 },
};
const DEVICE_FAMILY = { 'brother-pt-d210': 'brother', 'brother-pt-d220': 'brother', 'brother-pt-d610bt': 'brotherFn', 'dymo-lm160': 'dymo160', 'dymo-lm280': 'dymo280', 'brady-m210': 'brady' };
const DEVICE_APP = { 'brother-pt-p710bt': ['Brother iPrint&Label or P-touch Design&Print 2', 'tze'], 'niimbot-d110': ['the NIIMBOT or NIIM app', 'thermal'], 'phomemo-m110': ['Print Master', 'thermal'], 'brady-m211': ['Brady Express Labels', 'm21'] };
function familyOf(d) {
  const app = DEVICE_APP[d.id];
  if (app) return { ...FAMILIES.app, key: 'app', app: app[0], media: app[1] };
  const key = DEVICE_FAMILY[d.id] || (/brady/i.test(d.brand) ? 'brady' : /dymo/i.test(d.brand) ? 'dymo280' : 'brother');
  return { ...FAMILIES[key], key };
}
// What the tape looks like: laminate gloss, frosted clear, brushed metal or matte die-cut paper.
function tapeFill([, bg, ink, finish]) {
  if (finish === 'clear') return luminanceOf(ink) > 0.5
    ? 'linear-gradient(180deg, rgba(40,40,40,.62), rgba(20,20,20,.48) 45%, rgba(40,40,40,.58))'
    : 'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.5) 45%, rgba(255,255,255,.64))';
  if (finish === 'metal') return `linear-gradient(180deg, color-mix(in srgb, ${bg} 50%, #fff) 0%, ${bg} 42%, color-mix(in srgb, ${bg} 80%, #000) 100%)`;
  if (finish === 'paper') return bg;
  return `linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0) 38%, rgba(0,0,0,.05)), ${bg}`;
}
const hexRgb = h => { const m = String(h).replace('#', ''); const f = m.length === 3 ? m.split('').map(c => c + c).join('') : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16) || 0); };
const luminanceOf = h => { const [r, g, b] = hexRgb(h).map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
// Frame art in the manuals is black lines on white paper. A printer prints the frame in the ink colour onto the tape,
// so turn each scan into ink-coloured lines on transparency (cached per image and ink), then redraw.
const inkArtCache = new Map();
function inkArt(url, ink) {
  const key = url + '|' + ink, hit = inkArtCache.get(key);
  if (hit) return hit === 'pending' ? null : hit;
  inkArtCache.set(key, 'pending');
  const img = new Image();
  img.onload = () => {
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      const px = x.getImageData(0, 0, c.width, c.height), a = px.data, [r, g, b] = hexRgb(ink);
      for (let i = 0; i < a.length; i += 4) {
        const lum = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2];
        a[i + 3] = Math.max(0, Math.min(255, (232 - lum) * 1.3)) * (a[i + 3] / 255);
        a[i] = r; a[i + 1] = g; a[i + 2] = b;
      }
      x.putImageData(px, 0, 0);
      c.toBlob(bl => { inkArtCache.set(key, bl ? URL.createObjectURL(bl) : url); redrawPreview?.(); });
    } catch { inkArtCache.set(key, url); }
  };
  img.onerror = () => inkArtCache.set(key, url);
  img.src = url;
  return null;
}
const maxLines = (d, mm) => d.tapes.find(t => t.mm === +mm)?.lines ?? (+mm >= 9 ? 2 : 1);
const biggestSize = d => d.sizes.reduce((best, x, i, a) => (x.factor ?? 0) > (a[best].factor ?? 0) ? i : best, 0);
// A small strip of tape with the label on it, for the "Design a label" cards.
function miniTape(d, s) {
  const fam = familyOf(d), tapes = MEDIA[fam.media].tapes, t = tapes[Math.min(tapes.length - 1, Math.max(0, +s?.color || 0))];
  const font = d.fonts[+s?.font || 0] || d.fonts[0];
  const text = String(s?.text1 || '').trim() || 'Your label';
  return `<span class="mini-tape finish-${t[3] || 'gloss'}" aria-hidden="true" style="background:${tapeFill(t)};color:${t[2]};font-family:${cssq(font?.css || 'inherit')}"><span>${esc(text.slice(0, 18))}</span></span>`;
}
function viewPreview(d, _, q) {
  deviceTop(d, 'Label preview');
  const fam = familyOf(d), media = MEDIA[fam.media], tapes = media.tapes, marginKeys = Object.keys(fam.margins);
  const s = Object.assign({ text1: 'HELLO', text2: '', tape: 12, color: 0, font: 0, size: biggestSize(d), width: 0, style: 0, align: 1, frame: 'off', margin: marginKeys[0], length: 0, mirror: false }, store.get('preview:' + d.id, {}), q.frame ? { frame: q.frame } : {}, q.label ? decodeLabel(q.label) : {});
  // Clamp everything that came from storage or a shared link into what this device actually has.
  const clampI = (v, arr) => Math.min(Math.max(0, Math.round(+v) || 0), Math.max(0, arr.length - 1));
  for (const [k, arr] of [['font', d.fonts], ['size', d.sizes], ['width', d.widths], ['style', d.styles], ['align', d.alignments], ['color', tapes]]) s[k] = clampI(s[k], arr);
  if (!Object.hasOwn(fam.margins, s.margin)) s.margin = marginKeys[0];
  if (!d.frames.items.some(f => String(f.n) === String(s.frame))) s.frame = 'off';
  s.length = Math.min(fam.lengthMax || 300, Math.max(0, +s.length || 0)); s.mirror = !!s.mirror;
  s.text1 = String(s.text1 ?? ''); s.text2 = String(s.text2 ?? '');
  // Settings this family has no control for go back to the device default, so the recipe never asks for them.
  const has = k => fam.controls.includes(k) && ({ font: d.fonts, size: d.sizes, width: d.widths, style: d.styles, align: d.alignments, frame: d.frames.items }[k]?.length ?? 2) > 1;
  if (!has('font')) s.font = 0; if (!has('width')) s.width = 0; if (!has('style')) s.style = 0; if (!has('frame')) s.frame = 'off';
  if (!has('align')) s.align = Math.min(1, d.alignments.length - 1); if (!has('length')) s.length = 0; if (!has('mirror')) s.mirror = false;
  if (!d.tapes.some(t => t.mm === +s.tape)) s.tape = (d.tapes.find(t => t.mm === 12) || d.tapes[0] || { mm: 12 }).mm;
  if (maxLines(d, s.tape) < 2) s.text2 = '';
  if (q.label) {
    store.set('preview:' + d.id, s);
    history.replaceState(null, '', `/d/${d.id}/preview`);
    setTimeout(() => toast('Shared label loaded', { action: 'Save', onAction: () => saveLabel(d.id), ms: 7000 }), 300);
  }
  const opt = (arr, sel, label = x => x.name) => arr.map((x, i) => `<option value="${i}" ${i === +sel ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  const sel = (k, label, options, cls = '') => has(k) ? `<label${cls ? ` class="${cls}"` : ''}>${label}<select data-k="${k}">${options}</select></label>` : '';
  const twoLineTapes = d.tapes.filter(t => (t.lines ?? (t.mm >= 9 ? 2 : 1)) >= 2).map(t => t.mm);
  const line2Hint = twoLineTapes.length && twoLineTapes.length < d.tapes.length ? ` <span class="muted">· ${twoLineTapes.join(' / ')} mm tape only</span>` : '';
  const swatches = tapes.map(([name, bg, ink, fin], i) => `<button type="button" class="sw finish-${fin || 'gloss'}${i === s.color ? ' on' : ''}" data-k="color" data-v="${i}" aria-pressed="${i === s.color}" aria-label="${esc(name)}" title="${esc(name)}" style="background:${tapeFill([name, bg, ink, fin])}${fin === 'clear' ? ', repeating-conic-gradient(#cfc9bc 0 25%, #fff 0 50%) 0 0 / 10px 10px' : ''};color:${ink}"><span aria-hidden="true">Aa</span></button>`).join('');
  const typeCtl = [sel('font', 'Font', opt(d.fonts, s.font), 'full'), sel('size', 'Size', opt(d.sizes, s.size)), sel('width', 'Width', opt(d.widths, s.width)), sel('style', 'Style', opt(d.styles, s.style)), sel('align', 'Alignment', opt(d.alignments, s.align))].join('');
  const layoutCtl = [
    has('frame') ? `<label class="full">${fam.frameLabel || 'Frame'}<select data-k="frame">${d.frames.items.map(f => `<option value="${f.n}" ${String(f.n) === String(s.frame) ? 'selected' : ''}>${f.n === 'off' ? 'Off' : (fam.frameLabel ? f.name : f.n + ' · ' + f.name)}${f.wide ? ' (12 mm)' : ''}</option>`).join('')}</select></label>` : '',
    has('margin') && marginKeys.length > 1 ? `<label>Margin<select data-k="margin">${marginKeys.map(m => `<option ${m === s.margin ? 'selected' : ''}>${m}</option>`).join('')}</select></label>` : '',
    has('length') ? `<label><span>Length <span class="muted">mm · 0 = auto</span></span><input type="number" inputmode="numeric" min="0" max="${fam.lengthMax || 300}" step="1" data-k="length" value="${s.length}"></label>` : '',
    has('mirror') ? `<div class="full ctl-lbl" role="group" aria-labelledby="mirror-l"><span id="mirror-l">Mirror</span><div class="seg"><button type="button" data-k="mirror" data-v="false" class="${!s.mirror ? 'on' : ''}" aria-pressed="${!s.mirror}">Off</button><button type="button" data-k="mirror" data-v="true" class="${s.mirror ? 'on' : ''}" aria-pressed="${s.mirror}">On (clear tape)</button></div></div>` : ''].join('');
  const doneHow = fam.app ? `Follow it in ${esc(fam.app)}` : `${TAP} a step to tick it off`;
  // Phones and tablets: the tape stays pinned on top and Design / Recipe switch underneath it.
  // Desktop: controls on the left, the recipe stays in view on the right.
  main.innerHTML = `<div class="designer${q.label ? ' show-recipe' : ''}"><div class="d-left">
  <div class="card tapecard"><div class="tapewrap" tabindex="0" role="region" aria-label="Label preview"><div id="tape"></div></div><p id="len" class="muted"></p>
    <div class="seg d-switch" role="group" aria-label="Show"><button type="button" data-view="design" class="${q.label ? '' : 'on'}" aria-pressed="${!q.label}">Design</button><button type="button" data-view="recipe" class="${q.label ? 'on' : ''}" aria-pressed="${!!q.label}">Recipe <span id="recipe-n" class="muted"></span></button></div></div>
  <div class="ctl" id="ctl">
    <fieldset class="grp"><legend>Text</legend>
      <label class="full">Line 1<input type="text" maxlength="80" data-k="text1" value="${esc(s.text1)}" enterkeyhint="next"></label>
      <label class="full"><span>Line 2${line2Hint}</span><input type="text" maxlength="80" data-k="text2" value="${esc(s.text2)}" ${maxLines(d, s.tape) < 2 ? 'disabled' : ''} enterkeyhint="done"></label>
    </fieldset>
    <fieldset class="grp"><legend>Tape</legend>
      <label class="full">Width<select data-k="tape">${d.tapes.map(t => `<option value="${t.mm}" ${t.mm === +s.tape ? 'selected' : ''}>${t.mm} mm (${t.in})</option>`).join('')}</select></label>
      <div class="full ctl-lbl" role="group" aria-labelledby="color-l"><span id="color-l">Colour <span class="muted" id="color-name">· ${esc(tapes[s.color][0])}</span></span><div class="swatches">${swatches}</div></div>
    </fieldset>
    ${typeCtl ? `<fieldset class="grp wide"><legend>Type</legend>${typeCtl}</fieldset>` : ''}
    ${layoutCtl ? `<fieldset class="grp"><legend>Layout</legend>${layoutCtl}</fieldset>` : ''}
  </div></div>
  <div class="d-right"><div class="card" id="recipe-card"><div class="recipe-h"><h2 class="h3">Recipe for the ${esc(d.model)}</h2><span class="muted">${doneHow}</span></div><ol class="steps recipe" id="recipe"></ol>
    <div class="btn-row"><button type="button" class="btn" onclick="saveLabel('${d.id}')">Save this label</button><button type="button" class="btn ghost" onclick="shareLabel('${d.id}')">${shareIcon()} Share recipe</button><button type="button" class="btn ghost" onclick="resetPreview('${d.id}')">Start over</button></div>
    <div class="note">Preview is an approximation: fonts are on-screen look-alikes, and real print length varies slightly.</div></div>
  <h2>Saved labels</h2><div id="saved"></div></div></div>`;
  const tick = li => { const on = li.classList.toggle('done'); li.querySelector('[role=checkbox]')?.setAttribute('aria-checked', on); haptic(); };
  $('#recipe').addEventListener('click', e => { const li = e.target.closest('li'); if (li) tick(li); });
  $('#recipe').addEventListener('keydown', e => { const li = e.target.closest('li'); if (li && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); tick(li); } });
  main.querySelector('.d-switch').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]'); if (!b) return;
    const recipe = b.dataset.view === 'recipe';
    main.querySelector('.designer').classList.toggle('show-recipe', recipe);
    b.parentElement.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    haptic();
  });
  renderSaved(d);
  const ctl = $('#ctl');
  ctl.addEventListener('input', e => {
    const k = e.target.dataset.k; if (!k) return;
    s[k] = e.target.type === 'number' || e.target.tagName === 'SELECT' && k !== 'margin' && k !== 'frame' ? +e.target.value : e.target.value;
    if (k === 'tape') { const one = maxLines(d, s.tape) < 2; ctl.querySelector('[data-k=text2]').disabled = one; if (one) s.text2 = ''; }
    draw();
  });
  ctl.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b) return;
    const k = b.dataset.k;
    s[k] = k === 'color' ? +b.dataset.v : b.dataset.v === 'true';
    b.parentElement.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    if (k === 'color') $('#color-name').textContent = '· ' + tapes[s.color][0];
    draw();
  });
  const draw = () => { store.set('preview:' + d.id, s); drawTape(d, s); };
  redrawPreview = draw;
  draw();
}
const savedKey = id => 'labels:' + id;
function renderSaved(d) {
  const box = $('#saved'); if (!box) return;
  const list = store.get(savedKey(d.id), []);
  if (!list.length) { box.innerHTML = '<p class="hint">Nothing saved yet. Design a label above and press “Save this label”. It comes back with its full recipe.</p>'; return; }
  box.innerHTML = `<div class="list plate">${list.map((l, i) => `<div class="card saved"><button type="button" class="saved-open" onclick="loadLabel('${d.id}',${i})"><i class="mark strip" aria-hidden="true"></i><span style="min-width:0;flex:1"><b>${esc(l.name)}</b><span class="small muted saved-sub">${esc(l.s.text1)}${l.s.text2 ? ' / ' + esc(l.s.text2) : ''} · ${l.s.tape} mm${l.s.frame !== 'off' ? ' · frame ' + l.s.frame : ''} · ${esc(d.fonts[l.s.font]?.name || '')}</span></span></button><button type="button" class="iconbtn" aria-label="Share ${esc(l.name)}" title="Share" onclick="shareLabel('${d.id}',${i})">${shareIcon()}</button><button type="button" class="iconbtn" aria-label="Delete ${esc(l.name)}" title="Delete" onclick="deleteLabel('${d.id}',${i})">${icon('close', 18)}</button></div>`).join('')}</div>`;
}
// In-app sheet instead of window.prompt(), which looks like a browser, not an app.
window.saveLabel = id => {
  const s = store.get('preview:' + id, {});
  openSheet(`<h2 class="t" id="sheet-t">Save this label <span class="muted">It comes back with its full recipe.</span></h2>
    <form class="save-form" onsubmit="event.preventDefault();confirmSaveLabel('${id}', this.elements.name.value)">
      <label class="ctl-lbl" for="save-name">Name</label>
      <input id="save-name" name="name" type="text" maxlength="60" value="${esc(s.text1 || 'My label')}" enterkeyhint="done" autocomplete="off" required>
      <div class="btn-row dialog-actions"><button type="button" class="btn ghost" onclick="document.getElementById('sheet').close()">Cancel</button><button type="submit" class="btn">Save</button></div>
    </form>`, 'narrow');
  const i = $('#save-name'); if (i) { i.focus(); i.select(); }
};
window.confirmSaveLabel = (id, name) => {
  name = String(name || '').trim(); if (!name) return;
  const s = store.get('preview:' + id, {});
  const list = store.get(savedKey(id), []); list.unshift({ name, s, ts: Date.now() }); store.set(savedKey(id), list.slice(0, 50));
  sheet.close();
  renderSaved(loaded[id]);
  haptic();
  toast(`Saved “${name}”`);
};
window.loadLabel = (id, i) => { const l = store.get(savedKey(id), [])[i]; if (!l) return; store.set('preview:' + id, l.s); render(); window.scrollTo(0, 0); toast(`Loaded “${l.name}”`); };
// Delete straight away with Undo, like a native list, instead of a confirm() dialog.
window.deleteLabel = (id, i) => {
  const list = store.get(savedKey(id), []); const [gone] = list.splice(i, 1); if (!gone) return;
  store.set(savedKey(id), list); renderSaved(loaded[id]); haptic();
  toast(`Deleted “${gone.name}”`, { action: 'Undo', onAction: () => { const l = store.get(savedKey(id), []); l.splice(i, 0, gone); store.set(savedKey(id), l); renderSaved(loaded[id]); } });
};
window.resetPreview = id => { localStorage.removeItem('lab:preview:' + id); render(); };
let redrawPreview = null;
function drawTape(d, s) {
  const el = $('#tape');
  if (!el) return; // left the designer while frame art was still being prepared
  const PX = 9; // px per mm
  const fam = familyOf(d), media = MEDIA[fam.media], tape = media.tapes[s.color] || media.tapes[0];
  const [tapeName, tapeBg, ink, finish] = tape;
  const font = d.fonts[s.font], style = d.styles[s.style].name, width = d.widths[s.width].factor, size = d.sizes[s.size].factor ?? 1;
  const frame = d.frames.items.find(f => String(f.n) === String(s.frame));
  const lines = [s.text1, s.text2].filter((t, i) => i === 0 || (t && maxLines(d, s.tape) >= 2));
  const imgFrame = frame && frame.n !== 'off' && frame.n !== 0;
  const printH = Math.max(8, (s.tape - (s.tape >= 9 ? 2.5 : 1.5)) * PX);
  const fontPx = Math.max(8, printH * size / (lines.length === 2 ? 2.05 : 1.15) / (imgFrame ? 1.45 : 1));
  const italic = /Italic|I\+/.test(style), bold = /Bold|Solid/.test(style) || font.weight >= 800;
  const solidBg = finish === 'clear' ? 'transparent' : tapeBg;
  let fx = '';
  if (/Outline/.test(style)) fx = `color:transparent;-webkit-text-stroke:1.5px ${ink};`;
  else if (/Shadow/.test(style)) fx = `color:transparent;-webkit-text-stroke:1.5px ${ink};text-shadow:3px 3px 0 ${ink};`;
  else if (/Solid/.test(style)) fx = `text-shadow:2px 2px 0 ${solidBg},4px 4px 0 ${ink};`;
  if (/Underline/.test(style)) fx += 'text-decoration:underline;';
  if (/Strikeout/.test(style)) fx += 'text-decoration:line-through;';
  const alignCss = ['flex-start', 'center', 'flex-end', 'stretch'][s.align] || 'center';
  const vertical = /Vertical/.test(style);
  const renderLine = t => vertical ? [...t].map(ch => `<span style="display:inline-block;transform:rotate(-90deg);width:1em;text-align:center">${esc(ch)}</span>`).join('') : esc(t) || '&nbsp;';
  const marginKeys = Object.keys(fam.margins);
  const marginMm = fam.margins[s.margin] ?? fam.margins[marginKeys[0]];
  // Frames print in the ink colour on the tape. Until the ink version of a scan is ready, multiply the scan over the tape.
  const art = imgFrame ? inkArt(frame.img, ink) : null;
  const artUrl = art || (imgFrame ? frame.img : '');
  const artBlend = imgFrame && !art ? 'mix-blend-mode:multiply;' : '';
  let frameCss = 'padding:0 4px;';
  let frameBoxOpen = '';
  const sampleArt = /dymo/i.test(String(d.brand || '')) || /dymo/i.test(String(d.id || ''));
  if (frame && frame.n !== 'off') {
    if (frame.n === 0) {
      frameCss = 'text-decoration:underline;padding:0 4px;';
    } else if (sampleArt) {
      const tapeH = s.tape * PX;
      const bwY = Math.max(4, Math.round(tapeH * 0.1));
      const bwX = Math.max(12, Math.round(tapeH * 0.22));
      frameCss = 'padding:2px 8px;';
      frameBoxOpen = `<div class="framebox${s.mirror ? ' mirror' : ''}" style="${artBlend}border-style:solid;border-color:transparent;border-width:${bwY}px ${bwX}px;border-image-source:url('${cssq(artUrl)}');border-image-slice:8% 5%;border-image-repeat:stretch;min-width:${2 * bwX + 40}px">`;
    } else {
      // Left/right caps at native aspect (house, flourishes, icons). Middle is a 1-column slice stretched, not the whole PNG.
      const capW = Math.max(36, Math.round(s.tape * PX * 1.45));
      const bg = `background-image:url('${cssq(artUrl)}');${artBlend}`;
      frameCss = `padding:6px ${capW}px;`;
      frameBoxOpen = `<div class="framebox caps${s.mirror ? ' mirror' : ''}" style="--cap:${capW}px"><span class="frame-cap l" style="${bg};width:${capW}px"></span><span class="frame-mid"><span class="frame-mid-slice" style="${bg}"></span></span><span class="frame-cap r" style="${bg};width:${capW}px"></span>`;
    }
  }
  // Mirror must live in the same transform as width. An inline scaleX(width) was overriding .tape.mirror CSS.
  // When a frame box is present it carries the mirror so the caps flip with the text.
  const textSx = (s.mirror && !frameBoxOpen ? -1 : 1) * width;
  const txt = `<div class="txt" style="align-items:${alignCss};font-family:${cssq(font.css)};font-weight:${bold ? 900 : font.weight};font-style:${italic || font.style === 'italic' ? 'italic' : 'normal'};font-size:${fontPx}px;color:${ink};${fx}${frameCss}transform:scaleX(${textSx});transform-origin:center">${lines.map(t => `<div class="line">${renderLine(t)}</div>`).join('')}</div>`;
  const body = frameBoxOpen ? `${frameBoxOpen}${txt}</div>` : txt;
  const cutDots = marginKeys.length > 1 && s.margin !== marginKeys[0];
  el.innerHTML = `<div class="tape finish-${finish || 'gloss'} ${s.mirror ? 'mirror' : ''}" style="height:${s.tape * PX}px;background:${tapeFill(tape)};padding:0 ${marginMm * PX}px;display:inline-flex;min-width:${Math.max(0, s.length) * PX}px">${body}${cutDots ? `<span class="dots" style="left:${marginMm * PX - 1}px"></span><span class="dots" style="right:${marginMm * PX - 1}px"></span>` : ''}</div>`;
  const t = el.firstElementChild;
  const inner = t.querySelector('.txt');
  const applyWidthPad = () => {
    inner.style.margin = '0';
    if (width !== 1) {
      const box = inner.getBoundingClientRect().width;
      inner.style.margin = `0 ${(box * Math.abs(width) - box) / 2}px`;
    }
  };
  applyWidthPad();
  // Printers shrink type to the tape, they do not let letters spill off the strip.
  const maxTextH = t.clientHeight * (imgFrame ? 0.58 : 0.96);
  let fh = fontPx;
  for (let i = 0; i < 12 && inner.getBoundingClientRect().height > maxTextH; i++) {
    fh = Math.max(8, fh * 0.9);
    inner.style.fontSize = fh + 'px';
    applyWidthPad();
  }
  const midSlice = t.querySelector('.frame-mid-slice');
  const mid = t.querySelector('.frame-mid');
  if (midSlice && mid) {
    const mw = Math.max(4, mid.clientWidth);
    midSlice.style.transform = `scaleX(${Math.ceil(mw / 4)})`;
  }
  const tapeW = t.getBoundingClientRect().width, tapeH = s.tape * PX;
  const totalMm = Math.round(tapeW / PX);
  // Show the whole label when it fits at a readable size; only very long strips scroll (centred on the text).
  const wrap = el.parentElement;
  const padX = wrap ? (parseFloat(getComputedStyle(wrap).paddingLeft) || 0) + (parseFloat(getComputedStyle(wrap).paddingRight) || 0) : 28;
  const avail = Math.max(80, (wrap ? wrap.clientWidth : tapeW) - padX);
  let k = Math.min(1, avail / Math.max(1, tapeW));
  const floorH = Math.min(tapeH, 36);
  k = Math.max(k, floorH / Math.max(1, tapeH));
  const shownW = tapeW * k, shownH = tapeH * k;
  const scrolls = shownW > avail + 1;
  el.className = 'tapefit';
  el.style.width = `${shownW}px`;
  el.style.height = `${shownH}px`;
  el.style.margin = scrolls ? '0' : '0 auto';
  t.style.transform = `scale(${k})`;
  if (wrap) {
    wrap.classList.toggle('scrolls', scrolls);
    // Start a long strip centred on the text, not on the blank lead-in margin.
    if (scrolls) wrap.scrollLeft = Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / 2);
  }
  const over = s.length && totalMm > s.length;
  $('#len').innerHTML = `≈ ${totalMm} mm (${(totalMm / 25.4).toFixed(1)}") long · ${s.tape} mm ${esc(tapeName.toLowerCase())}${over ? ' · <b style="color:var(--red)">Change Length! text exceeds fixed length</b>' : s.length ? ' · 🔒 fixed length' : ''}${scrolls ? ' · scroll to see the rest' : ''}${/chain/i.test(s.margin) ? ' · chain: full lead-in only on the first label' : ''}`;
  const r = recipeSteps(d, s, { fam, media, tapeName, font, style, frame, lines });
  $('#recipe').innerHTML = r.map(x => `<li><span class="tick-t" role="checkbox" aria-checked="false" tabindex="0">${fmt(x)}</span></li>`).join('');
  const n = $('#recipe-n'); if (n) n.textContent = `· ${r.length} steps`;
}
// The steps for this design on this family of label maker: its keys, its menus, or its phone app.
function recipeSteps(d, s, { fam, media, tapeName, font, style, frame, lines }) {
  const tapeInfo = d.tapes.find(t => t.mm === +s.tape);
  const mm = /brady/i.test(d.brand) && tapeInfo ? `${s.tape} mm (${tapeInfo.in})` : `${s.tape} mm`;
  const colour = tapeName.toLowerCase();
  const typed = `Type “${s.text1}”`;
  const nm = (arr, i) => arr[i]?.name;
  const r = [];
  const sizeName = nm(d.sizes, s.size), widthName = nm(d.widths, s.width), alignName = nm(d.alignments, s.align);
  const framed = frame && frame.n !== 'off';
  switch (fam.key) {
    case 'brother':
      if (s.tape < 12 && frame && frame.wide) r.push(`Insert 12 mm tape. Frame ${frame.n} needs it (you have ${s.tape} mm).`);
      else r.push(`${media.verb} ${media.item(mm)} (${colour}).`);
      r.push(`${typed}${lines.length === 2 ? ` → [Enter] → type “${s.text2}”` : ''}.`);
      if (s.font) r.push(`[Font] → {Font} → [OK] → [◀] / [▶] to {${font.name}} → [OK].`);
      if (s.size) r.push(`[Font] → {Size} → [OK] → {${sizeName}} → [OK].`);
      if (s.width) r.push(`[Font] → {Width} → [OK] → {${widthName}} → [OK].`);
      if (s.style) r.push(`[Font] → {Style} → [OK] → {${style}} → [OK].`);
      if (s.align !== 1) r.push(`[Font] → {Alignment} → [OK] → {${alignName}} → [OK].`);
      if (framed) r.push(`[Frame] → type ${String(frame.n).split('').map(x => `[${x}]`).join(' ')} → [OK].`);
      if (s.margin !== 'Full') r.push(`[Label] → {Margin} → [OK] → {${s.margin}} → [OK].`);
      if (s.length) r.push(`[Label] → {Label Length} → [OK] → [◀] / [▶] to ${s.length} mm → [OK].`);
      if (s.mirror) r.push(`[Shift] + [Print] → {Mirror} → [OK] → {Mirror Print?} → [OK]. Use clear tape.`);
      else r.push(`[Preview] to check, then [Print] → [OK]. Push the cutter after “Please Cut”.`);
      break;
    case 'brotherFn': {
      r.push(`${media.verb} ${media.item(mm)} (${colour}).`);
      r.push(`${typed}${lines.length === 2 ? ` → [Enter] → type “${s.text2}”` : ''}.`);
      const attr = (what, val) => r.push(`With the cursor in the text: [Shift] + [Fn] → {${what}} → {${val}} → [OK].`);
      if (s.font) attr('Font', font.name);
      if (s.size) attr('Size', sizeName);
      if (s.width) attr('Width', widthName);
      if (s.style) attr('Style', style);
      if (s.align !== 1) attr('Alignment', alignName);
      if (framed) r.push(`[Fn] → [▲] / [▼] to {Frame} → [OK] → frame ${frame.n} (type ${String(frame.n).split('').map(x => `[${x}]`).join(' ')}) → [OK].`);
      if (s.margin !== 'Large margin') r.push(`[Fn] → {Cut Option} → [OK] → {${s.margin === 'Chain' ? 'Chain' : 'Small Margin'}} → [OK].`);
      if (s.length) r.push(`[Fn] → {Length} → [OK] → ${s.length} mm → [OK].`);
      if (s.mirror) r.push(`[Shift] + [Print] → {Mirror} → [OK]. Use clear tape.`);
      r.push(`[Preview] to check, then [Print] → [OK] for one copy.`);
      break;
    }
    case 'dymo160':
      r.push(`${media.verb} ${media.item(mm)} (${colour}) until it clicks, and close the cover.`);
      r.push(`${typed}${lines.length === 2 ? ` → [Return] → type “${s.text2}”` : ''}.`);
      r.push(`Press [Size] until {${sizeName}} shows.`);
      if (/Bold/.test(style)) r.push('Press [B] for bold.');
      if (/Italic/.test(style)) r.push('Press [I] for italic.');
      if (/Vertical/.test(style)) r.push('Press [Vertical] for vertical text.');
      if (framed) r.push(`Press [Box] until {${frame.name}} shows.`);
      r.push('Press [Print], then press the cutter button.');
      break;
    case 'dymo280': {
      const fmtMenu = (item, val) => `[Menu] → {Format} → [OK] → {${item}} → [OK] → {${val}} → [OK].`;
      r.push(`${media.verb} ${media.item(mm)} (${colour}) until it clicks, and close the cover.`);
      r.push(`${typed}${lines.length === 2 ? ` → [Return] → type “${s.text2}”` : ''}.`);
      if (s.font) r.push(fmtMenu('Font', font.name));
      r.push(`Press [AAA] until {${sizeName}} shows.`);
      if (s.style) r.push(fmtMenu('Style', style));
      if (framed) r.push(fmtMenu('Borders', frame.name));
      if (s.length) {
        r.push(`[Menu] → {Format} → [OK] → {Label length} → [OK] → {Fixed} → ${s.length} mm → [OK].`);
        if (s.align !== 1) r.push(fmtMenu('Alignment', alignName));
      }
      if (s.mirror) r.push(fmtMenu('Mirror', 'On'));
      r.push('Press [Print], then press the cutter button.');
      break;
    }
    case 'brady':
      r.push(`${media.verb} ${media.item(mm)} (${colour}) and turn the lock to vertical.`);
      r.push(`${typed}${lines.length === 2 ? ` → [Enter] → type “${s.text2}”` : ''}.`);
      r.push(`[Font Size] → {${sizeName}${/Bold/.test(style) ? ' Bold' : ''}} → [Enter].`);
      r.push('Press [Print], then squeeze the cutter levers.');
      break;
    default: // phone app
      r.push(`${media.verb} ${media.item(mm)} (${colour}).`);
      r.push(`Open ${fam.app} and connect to the ${d.model} over Bluetooth.`);
      r.push(`Start a new ${s.tape} mm label and type “${s.text1}”${lines.length === 2 ? `, then “${s.text2}” on a second line` : ''}.`);
      if (s.align !== 1 && alignName && d.alignments.length > 1) r.push(`Set the text alignment to ${alignName}.`);
      if (s.length) r.push(`Set the label length to ${s.length} mm.`);
      r.push('Check the preview in the app, then tap Print.');
  }
  return r;
}

// ---------- install (PWA) ----------
// Chromium (Chrome, Edge, Samsung, Android) fires beforeinstallprompt when the app is installable: we show Install only then.
// Safari (iOS, iPadOS, macOS), Firefox Android and in-app browsers never fire it, so they get short, platform-specific steps.
// The install bar appears after a few distinct device screens; explicit Install controls ignore its 7-day snooze.
let deferredInstall = null;
const INSTALL_SCREENS = 3;
const INSTALL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.matchMedia('(display-mode: window-controls-overlay)').matches
    || window.navigator.standalone === true;
}
function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function installPlatform() {
  const ua = navigator.userAgent;
  if (/FBAN|FBAV|Instagram|Line\/|LinkedInApp|Snapchat|musical_ly|TikTok/i.test(ua)) return 'inapp';
  if (isIosDevice()) return /CriOS|FxiOS|EdgiOS/.test(ua) ? 'ios-other' : 'ios';
  if (/SamsungBrowser/.test(ua)) return 'samsung';
  if (/Android/.test(ua) && /Firefox\//.test(ua)) return 'firefox-android';
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints === 0 && /Version\/[\d.]+.*Safari/.test(ua) && !/Chrome|Chromium|Edg\/|Firefox|OPR/.test(ua)) return 'mac-safari';
  if ('onbeforeinstallprompt' in window) return 'chromium';
  return 'other';
}
const INSTALL_STEPS = {
  ios: ['Tap <b>Share</b> <span class="muted">(on iOS 26 it sits under <b>•••</b> next to the address bar)</span>.', 'Scroll down and tap <b>Add to Home Screen</b>.', 'Keep <b>Open as Web App</b> on, then tap <b>Add</b>.'],
  'ios-other': ['Tap <b>Share</b> in the browser menu.', 'Tap <b>Add to Home Screen</b>, then <b>Add</b>.'],
  'mac-safari': ['In the menu bar choose <b>File → Add to Dock…</b>', 'Click <b>Add</b>. Labelarium opens in its own window from the Dock.'],
  'firefox-android': ['Tap <b>⋮</b> in the toolbar.', 'Tap <b>Add app to Home screen</b>, then <b>Add</b>.'],
  samsung: ['Tap <b>≡</b> in the toolbar.', 'Tap <b>Add page to → Home screen</b>.'],
  chromium: ['Click the install icon at the right end of the address bar.', 'Or open the browser menu → <b>Cast, save and share → Install page as app</b> (Edge: <b>Apps → Install this site as an app</b>).'],
  inapp: ['This in-app browser can’t install apps.', 'Tap <b>•••</b> or <b>⋮</b> → <b>Open in browser</b>, then install from there.'],
};
const PLATFORM = installPlatform();
const MANUAL = PLATFORM in INSTALL_STEPS && PLATFORM !== 'chromium';
function canInstall() {
  return !isStandaloneApp() && (!!deferredInstall || (MANUAL && !store.get('install-done', false)));
}
// One class on <html> decides whether any Install control shows (CSS: html:not(.can-install) .js-install).
function syncInstallUi() { document.documentElement.classList.toggle('can-install', canInstall()); }
function shouldShowInstallControls() { return !isStandaloneApp(); }
function installActionLabel() {
  return PLATFORM === 'mac-safari' ? 'Add to Dock' : isIosDevice() ? 'Add to Home Screen' : 'Install app';
}
function installIconSvg() {
  return `<svg class="install-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 4v11M8.5 11.5 12 15l3.5-3.5M6 19.5h12"/></svg>`;
}
function installIconButton() {
  if (!shouldShowInstallControls()) return '';
  return iconBtn({ cls: 'js-install', label: 'Install', title: installActionLabel(), extra: 'type="button" data-install="icon" onclick="requestInstall()"', inner: installIconSvg() });
}
function hideInstallControls() { syncInstallUi(); }
function syncInstallBarOffset() {
  const bar = document.getElementById('install-bar');
  const h = bar && !bar.hidden && getComputedStyle(bar).position === 'sticky' ? Math.round(bar.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty('--install-bar-h', h + 'px');
}

// Old builds hid forever on dismiss via install-hide. Convert once to a 7-day snooze.
if (store.get('install-hide', false) === true) {
  store.set('install-hide-until', Date.now() + INSTALL_SNOOZE_MS);
  try { localStorage.removeItem('lab:install-hide'); } catch {}
}

function hideInstallBar(persist) {
  const bar = document.getElementById('install-bar');
  if (bar) bar.hidden = true;
  if (persist) store.set('install-done', true);
  syncInstallUi();
  syncInstallBarOffset();
}
function showInstallBar() {
  if (!canInstall()) return;
  if (Date.now() < store.get('install-hide-until', 0)) return;
  let bar = document.getElementById('install-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'install-bar';
    bar.className = 'install-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Install Labelarium');
    document.body.prepend(bar);
  }
  bar.innerHTML = `<img src="/icons/icon-192.png" alt="" width="40" height="40" class="install-bar-ico"><p><b>Labelarium app</b><span>Full screen, works offline, no app store.</span></p>
    <button class="btn" type="button" onclick="requestInstall()">${PLATFORM === 'chromium' || deferredInstall ? 'Install' : 'How'}</button>
    <button class="iconbtn" type="button" aria-label="Not now" onclick="dismissInstall()">${icon('close', 18)}</button>`;
  bar.hidden = false;
  requestAnimationFrame(syncInstallBarOffset);
}
function noteInstallScreen() {
  if (store.get('install-ready', false)) return;
  const path = (location.pathname || '/').replace(/\/+$/, '') || '/';
  if (!/^\/d\/[^/]+/.test(path)) return;
  const seen = store.get('install-screens', []);
  if (seen.includes(path)) return;
  seen.push(path);
  store.set('install-screens', seen);
  if (seen.length >= INSTALL_SCREENS) store.set('install-ready', true);
}
function maybeShowInstallBar() {
  noteInstallScreen();
  syncInstallUi();
  // A visible Install button is already on screen (home app bar, tablet rail): don't stack a second prompt.
  if ([...document.querySelectorAll('.js-install')].some(el => el.getClientRects().length)) {
    const bar = document.getElementById('install-bar');
    if (bar) bar.hidden = true;
    syncInstallBarOffset();
    return;
  }
  if (!store.get('install-ready', false)) return;
  let shown = false; try { shown = sessionStorage.getItem('lab:install-bar') === '1'; } catch {}
  const bar = document.getElementById('install-bar');
  if (shown) { if (bar && !bar.dataset.path) bar.dataset.path = location.pathname; if (bar && bar.dataset.path !== location.pathname) { bar.hidden = true; syncInstallBarOffset(); } return; }
  showInstallBar();
  const b = document.getElementById('install-bar');
  if (b && !b.hidden) { b.dataset.path = location.pathname; try { sessionStorage.setItem('lab:install-bar', '1'); } catch {} }
}
// The install sheet: what you get, then either the browser's own prompt or the exact steps for this browser.
function openInstallHelp() {
  const s = INSTALL_STEPS[PLATFORM];
  const perks = `<ul class="perks"><li><b>Opens like an app</b>Its own icon, full screen, no browser bars.</li><li><b>Works offline</b>Save a label maker and look things up with no signal.</li><li><b>No app store, no account</b>Free, tiny, and updates itself.</li></ul>`;
  const done = /^(ios|mac-safari)/.test(PLATFORM) ? `<button class="btn ghost" type="button" onclick="markInstalled()">I’ve added it</button>` : '';
  const steps = s ? `<h3>${deferredInstall ? 'If nothing happens' : 'How to install'}</h3><ol class="steps">${s.map(x => `<li>${x}</li>`).join('')}</ol>`
    : '<p class="note">Open labelarium.com in Safari, Chrome or Edge to install it.</p>';
  openSheet(`<div class="app-hero"><img src="/icons/icon-192.png" alt="" width="64" height="64"><div><h2 class="t">Labelarium</h2><p class="muted small">The label maker companion</p></div></div>
    ${perks}${deferredInstall ? `<div class="btn-row"><button class="btn" type="button" onclick="acceptInstall()">${installIconSvg()} Install app</button></div>` : ''}${steps}${done ? `<div class="btn-row">${done}</div>` : ''}`);
}
window.markInstalled = () => { store.set('install-done', true); hideInstallBar(false); sheet.close(); toast('Nice. Open Labelarium from your Home Screen.'); };
window.dismissInstall = () => {
  hideInstallBar(false);
  store.set('install-hide-until', Date.now() + INSTALL_SNOOZE_MS);
};
window.acceptInstall = async () => {
  if (!deferredInstall) return openInstallHelp();
  const p = deferredInstall;
  deferredInstall = null;
  if (sheet.open) sheet.close();
  p.prompt();
  let outcome = 'dismissed';
  try { const choice = await p.userChoice; if (choice && choice.outcome) outcome = choice.outcome; } catch {}
  if (outcome === 'accepted') hideInstallBar(true);
  syncInstallUi();
};
window.requestInstall = async () => {
  if (isStandaloneApp()) return syncInstallUi();
  if (deferredInstall) return acceptInstall();
  openInstallHelp();
};
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  store.set('install-done', false); // came back after an uninstall
  syncInstallUi();
  maybeShowInstallBar();
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  hideInstallBar(true);
  toast('Labelarium is installed. Open it from your apps.');
});

// ---------- share ----------
// Native share sheet where it exists (phones, Safari, Edge, Chrome on Windows/ChromeOS); otherwise copy the link.
// Shared URLs always land on pre-rendered pages (good link previews) and use ?open= / ?label= for the detail.
function shareIcon() {
  return `<svg class="share-ico" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v6.5h14V13"/></svg>`;
}
async function shareLink({ title, text, path }) {
  const data = { title, text, url: absUrl(path) };
  if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
    try { await navigator.share(data); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(data.url); toast('Link copied. Paste it anywhere.'); haptic(); }
  catch { openSheet(`<h2 class="t">Share</h2><p class="muted small">Copy this link:</p><input class="share-url" aria-label="Link to share" readonly value="${esc(data.url)}" onfocus="this.select()">`); }
}
window.shareApp = () => shareLink({ title: 'Labelarium', text: 'Every symbol, frame and key press for your label maker, with pictures. Free, works offline:', path: '/' });
window.shareDevice = id => {
  const d = loaded[id] || devices.find(x => x.id === id);
  shareLink({ title: `${deviceTab(d)} · Labelarium`, text: `Every symbol, frame and shortcut on the ${deviceTab(d)}, with the exact key presses:`, path: `/d/${id}` });
};
window.sharePage = () => {
  const { seg } = route();
  if (seg[0] === 'd' && seg[1] && !seg[2]) return shareDevice(seg[1]);
  shareLink({ title: document.title, text: document.querySelector('meta[name=description]')?.content || '', path: location.pathname });
};
window.shareSymbol = (id, catId, n) => {
  const d = loaded[id], c = d.symbols.categories.find(x => x.id === catId), it = c.items[n - 1];
  shareLink({ title: `${it.name} · ${deviceTab(d)}`, text: `How to type “${it.name}” on a ${d.model}: ${plain(symbolPath(c, n))}`, path: `/d/${id}/symbols?open=sym:${catId}:${n}` });
};
window.shareFrame = (id, n) => {
  const d = loaded[id], f = d.frames.items.find(x => String(x.n) === String(n));
  shareLink({ title: `Frame ${f.n}: ${f.name} · ${deviceTab(d)}`, text: `Frame ${f.n} (${f.name}) on a ${d.model}:`, path: `/d/${id}/frames?open=frame:${f.n}` });
};
window.shareTemplate = (id, kind, n) => {
  const d = loaded[id], t = d.templates[kind].find(x => x.n === n);
  shareLink({ title: `${t.name} template · ${deviceTab(d)}`, text: `The “${t.name}” template on a ${d.model}:`, path: `/d/${id}/templates?open=tpl:${kind}:${n}` });
};
// A label design travels in the URL: whitelisted keys, type-checked and clamped on the way in.
const LABEL_KEYS = { text1: 's', text2: 's', tape: 'n', color: 'n', font: 'n', size: 'n', width: 'n', style: 'n', align: 'n', frame: 's', margin: 's', length: 'n', mirror: 'b' };
const b64u = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
const encodeLabel = s => b64u(JSON.stringify(Object.fromEntries(Object.keys(LABEL_KEYS).filter(k => s[k] !== undefined).map(k => [k, s[k]]))));
function decodeLabel(str) {
  try {
    const o = JSON.parse(unb64u(String(str).slice(0, 2000))), out = {};
    for (const [k, t] of Object.entries(LABEL_KEYS)) {
      const v = o[k];
      if (t === 's' && (typeof v === 'string' || typeof v === 'number')) out[k] = String(v).slice(0, 80);
      if (t === 'n' && Number.isFinite(v)) out[k] = v;
      if (t === 'b' && typeof v === 'boolean') out[k] = v;
    }
    return out;
  } catch { return {}; }
}
window.shareLabel = (id, i) => {
  const d = loaded[id], l = i == null ? { s: store.get('preview:' + id, {}) } : store.get(savedKey(id), [])[i];
  if (!l) return;
  const txt = l.s.text1 || 'my label';
  shareLink({ title: `“${txt}” · ${deviceTab(d)} label`, text: `How to print “${txt}” on a ${d.model}, key by key:`, path: `/d/${id}/preview?label=${encodeLabel(l.s)}` });
};
// Deep links from shares: open the right sheet once the page is drawn.
function openFromQuery(d, q) {
  if (!q.open) return;
  const [k, a, b] = String(q.open).split(':');
  history.replaceState(null, '', location.pathname + location.hash); // the sheet opens once; Back returns to the page
  try {
    if (k === 'sym' && d.symbols.categories.some(c => c.id === a && c.items[+b - 1])) openSymbol(d.id, a, +b);
    else if (k === 'frame' && d.frames.items.some(f => String(f.n) === a)) openFrame(d.id, a);
    else if (k === 'tpl' && /^(text|pattern)$/.test(a) && d.templates[a].some(t => t.n === +b)) openTemplate(d.id, a, +b);
  } catch {}
}

// ---------- offline + updates ----------
// Offline flags can outlive their cache (cleared site data, old builds): trust the cache, not the flag.
// Saves made before per-device caches (v40 and older) were wiped by the upgrade: re-save them quietly when online.
async function syncSavedFlags() {
  if (!('caches' in window)) return;
  for (const x of devices) {
    if (!store.get('offline:' + x.id, false) || await caches.has('labelarium-saved-' + x.id)) continue;
    if (!navigator.onLine) continue; // keep the flag; try again next time
    try { const d = await loadDevice(x.id); await swAsk({ type: 'precache', id: x.id, urls: offlineUrls(d, x.id) }, 'precached', 180000); }
    catch { store.set('offline:' + x.id, false); }
  }
}
const BUILD = 'v44'; // must equal sw.js VERSION suffix
window.addEventListener('online', () => { if (document.querySelector('.offline-state')) render(); });

window.addEventListener('resize', () => {
  syncInstallBarOffset();
  if (redrawPreview && $('#tape')) {
    cancelAnimationFrame(drawTape._rz);
    drawTape._rz = requestAnimationFrame(redrawPreview);
  }
});

// ---------- boot ----------
try { localStorage.removeItem('lab:theme'); } catch {}
migrateHash();
syncInstallUi();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const sw = navigator.serviceWorker, num = s => +String(s).replace(/\D/g, '');
  sw.register('/sw.js', { scope: '/' })
    .then(reg => document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); }))
    .catch(console.warn);
  // The shell is network-first, so a page loaded online already runs fresh code. Only a page served from cache
  // can be older than its service worker: offer a reload then.
  sw.addEventListener('message', e => {
    if (e.data?.type === 'version' && num(e.data.version) > num(BUILD)) toast('A new version of Labelarium is ready.', { action: 'Reload', onAction: () => location.reload(), ms: 12000 });
  });
  sw.addEventListener('controllerchange', () => sw.controller?.postMessage({ type: 'version' }));
  sw.controller?.postMessage({ type: 'version' });
}
document.documentElement.classList.add('app-ready');
render();
