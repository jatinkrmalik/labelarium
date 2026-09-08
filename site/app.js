// Labelarium. Copyright (C) 2026 the Labelarium authors. Licensed under the GNU AGPL v3.0 or later; see LICENSE.
// Labelarium, vanilla JS, History API router, no build step.
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
  .replace(/→/g, '<span class="arrow">→</span>');
const pad2 = n => String(n).padStart(2, '0');
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

// Expand compact arrays into objects and build the search index.
function normalize(d, base) {
  if (base && base[0] !== '/') base = '/' + base;
  d.base = base;
  d.symbols.categories.forEach(c => {
    c.items = (c.items || []).map(([name, kw, ch], i) => ({ n: i + 1, name, kw, ch, img: `${base}img/symbols/${c.id}-${pad2(i + 1)}.png`, cat: c }));
    c.img = `${base}img/symbols/${c.id}.png`;
  });
  d.symbols.accented.image = base + d.symbols.accented.image;
  d.frames.items = d.frames.items.map(([n, name, kw, wide]) => ({ n, name, kw, wide: !!wide, img: `${base}img/frames/${n}.png` }));
  d.templates.text = d.templates.text.map(([n, name, kw, desc]) => ({ n, name, kw, desc, kind: 'text', img: `${base}img/templates/text-${pad2(n)}.png` }));
  d.templates.pattern = d.templates.pattern.map(([n, name, kw, desc]) => ({ n, name, kw, desc, kind: 'pattern', img: `${base}img/templates/pattern-${pad2(n)}.png` }));
  d.fonts = d.fonts.map(([name, img, desc, css, weight, style], i) => ({ n: i + 1, name, desc, css, weight, style, img: `${base}img/fonts/${img}` }));
  for (const k of ['sizes', 'widths', 'styles', 'alignments']) d[k] = d[k].map(([name, img, factor]) => ({ name, factor, img: `${base}img/fonts/${img}` }));
  d.keyboard.image = base + d.keyboard.image;
  d.errors = d.errors.map(([msg, cause, fix]) => ({ msg, cause, fix }));
  d.problems = d.problems.map(([problem, fix]) => ({ problem, fix }));

  const idx = [];
  const add = (type, title, kw, extra) => idx.push({ type, title, kw: kw || '', ...extra, _t: norm(title), _k: norm(kw || '') });
  d.symbols.categories.forEach(c => {
    add('symbol-category', `${c.name} symbols`, `${c.kw || ''} ${c.chars || ''} ${c.group}`, { cat: c });
    c.items.forEach(it => add('symbol', it.name, it.kw, { item: it, sub: `${c.name} · #${it.n}` }));
  });
  d.frames.items.forEach(f => add('frame', `Frame ${f.n}: ${f.name}`, f.kw + (f.wide ? ' 12mm' : ''), { item: f }));
  [...d.templates.text, ...d.templates.pattern].forEach(t => add('template', `${t.kind === 'text' ? 'Text' : 'Pattern'} template ${pad2(t.n)}: ${t.name}`, `${t.kw} ${t.desc}`, { item: t }));
  d.howto.forEach(h => add('howto', h.title, h.kw + ' ' + h.steps.join(' '), { item: h }));
  d.shortcuts.forEach(s => add('shortcut', s.action, s.kw + ' ' + s.keys, { item: s }));
  d.fonts.forEach(f => add('font', `${f.name} font`, f.desc, { item: f }));
  d.styles.forEach(s => add('style', `${s.name} style`, 'style text effect', { item: s }));
  d.errors.forEach(e => add('error', e.msg, e.cause + ' ' + e.fix, { item: e }));
  d.problems.forEach(p => add('problem', p.problem, p.fix, { item: p }));
  d.keyboard.legend.forEach(([n, name, desc]) => add('key', `${name} (key ${n})`, desc, { item: { n, name, desc } }));
  d.index = idx;
  return d;
}

const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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
const SITE = 'https://labelarium.com';
const OG_IMAGE = SITE + '/icons/og.png';
const OG_ALT = 'Labelarium, the label maker companion';
const HOME_TITLE = 'Labelarium · the label maker companion';
const HOME_DESC = 'Every symbol, frame, template and shortcut of your label maker. Searchable, with pictures, offline.';

function route() {
  let path = location.pathname || '/';
  if (path.length > 1 && path.endsWith('/')) {
    path = path.replace(/\/+$/, '') || '/';
    history.replaceState(null, '', path + location.search + location.hash);
  }
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
  if (replace) history.replaceState(null, '', next);
  else history.pushState(null, '', next);
  return render();
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
  history.pushState(null, '', next);
  if (samePage) { applyLocationSeo(); scrollRouteHash(); return; }
  render();
});
window.addEventListener('popstate', () => render());
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
  document.title = title;
  const url = absUrl(path);
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
  canon.href = url;
  setMeta('description', desc);
  setMeta('robots', opts.noindex ? 'noindex, follow' : 'index, follow');
  setMeta('og:title', title, 'property');
  setMeta('og:description', desc, 'property');
  setMeta('og:url', url, 'property');
  setMeta('og:image', OG_IMAGE, 'property');
  setMeta('og:image:alt', OG_ALT, 'property');
  setMeta('twitter:title', title);
  setMeta('twitter:description', desc);
  setMeta('twitter:image', OG_IMAGE);
  setMeta('twitter:image:alt', OG_ALT);
  const ld = document.getElementById('jsonld');
  if (ld) ld.textContent = JSON.stringify(jsonld || webPageLd(title, desc, url));
}
function countSymbols(d) {
  return d.symbols.categories.reduce((n, c) => n + (c.items.length || (c.charsNote ? 99 : (c.chars ? c.chars.split(' ').length : 0))), 0);
}
function packSummary(d) {
  const bits = [];
  const nCat = d.symbols.categories.length;
  const nSym = countSymbols(d);
  if (nCat && nSym) bits.push(`${nSym} symbols in ${nCat} categories`);
  const nFrames = d.frames.items.filter(f => f.n !== 'off').length;
  if (nFrames) bits.push(`${nFrames} frames`);
  const nTpl = d.templates.text.length + d.templates.pattern.length;
  if (nTpl) bits.push(`${nTpl} templates`);
  if (d.fonts.length > 1) bits.push(`${d.fonts.length} fonts`);
  else if (d.fonts.length === 1 && d.fonts[0].name && !/app|print master|express labels|p-touch editor|niimbot/i.test(d.fonts[0].name))
    bits.push(`${d.fonts[0].name} typeface`);
  if (d.styles.length > 1) bits.push(`${d.styles.length} styles`);
  if (d.shortcuts.length) bits.push(`${d.shortcuts.length} shortcuts`);
  if (d.howto.length) bits.push(`${d.howto.length} how-to guides`);
  return bits.join(', ');
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
function applyHomeSeo(q = {}) {
  const hash = routeHash();
  if (hash === 'favorites') {
    applySeo('Pinned · Labelarium', 'Label makers you pinned on Labelarium.', '/', homeJsonLd());
    return;
  }
  const brand = q.brand;
  if (brand && devices.some(d => d.brand === brand)) {
    const names = devices.filter(d => d.brand === brand).map(d => d.name).join(', ');
    applySeo(`${brand} label makers · Labelarium`, `${brand} in Labelarium: ${names}. Searchable, with pictures, offline.`, `/?brand=${encodeURIComponent(brand)}`, homeJsonLd());
    return;
  }
  applySeo(HOME_TITLE, HOME_DESC, '/', homeJsonLd());
}
function applyDeviceSeo(d, section, rest = [], q = {}) {
  const label = deviceLabel(d);
  const tab = deviceTab(d);
  const hash = routeHash();
  const about = { '@type': 'Product', name: label, brand: d.brand, model: d.model };
  const page = (title, desc, path, opts) => applySeo(title, desc, path, webPageLd(title, desc, absUrl(path), { about }), opts);
  if (!section || section === 'home') {
    const sum = packSummary(d);
    const baseDesc = sum
      ? `${label}: ${d.tagline}. ${sum}. Searchable, with pictures, offline.`
      : `${label}: ${d.tagline}. Searchable, with pictures, offline.`;
    const qtext = String(q.q || '').trim();
    if (qtext) {
      return page(`Search “${qtext}” · ${tab} · Labelarium`, `Search results for “${qtext}” on the ${label}.`, `/d/${d.id}?q=${encodeURIComponent(qtext)}`, { noindex: true });
    }
    if (hash === 'tips') {
      const n = (d.tips || []).length;
      return page(`Tips · ${tab} · Labelarium`, n ? `${n} quick tips for the ${label}.` : `Quick tips for the ${label}.`, `/d/${d.id}`);
    }
    if (hash === 'offline') {
      return page(`Offline · ${tab} · Labelarium`, `Save pictures for the ${label} so this pack works without a network.`, `/d/${d.id}`);
    }
    if (hash === 'search') {
      return page(`Search · ${tab} · Labelarium`, `Search symbols, frames, templates, shortcuts and more on the ${label}.`, `/d/${d.id}`);
    }
    return page(`${tab} · Labelarium`, baseDesc, `/d/${d.id}`);
  }
  if (section === 'keyboard') return page(`Keyboard map · ${tab} · Labelarium`, `Controls on the ${label}: ${d.keyboard.legend.length} callouts, with a tap-to-zoom diagram.`, `/d/${d.id}/keyboard`);
  if (section === 'symbols') {
    const catId = rest[0];
    if (catId === 'accented') return page(`Accented letters · ${tab} · Labelarium`, `Accent key table for the ${label}.`, `/d/${d.id}/symbols/accented`);
    if (catId) {
      const c = d.symbols.categories.find(x => x.id === catId);
      if (c) {
        const n = c.items.length || (c.chars ? c.chars.split(' ').length : 0);
        return page(`${c.name} symbols · ${tab} · Labelarium`, `${c.name} (${c.group}) on the ${label}: ${n} symbols, with insert steps.`, `/d/${d.id}/symbols/${c.id}`);
      }
    }
    const nCat = d.symbols.categories.length, nSym = countSymbols(d);
    return page(`Symbols · ${tab} · Labelarium`, nCat ? `Symbol catalog for the ${label}: ${nSym} entries in ${nCat} categories, with on-device steps.` : `No on-device symbol catalog is published for the ${label} in this pack.`, `/d/${d.id}/symbols`);
  }
  if (section === 'frames') {
    const n = d.frames.items.filter(f => f.n !== 'off').length;
    const filter = q.f || 'all';
    const filterTitle = { basic: 'Box and line frames', pictures: 'Picture frames', wide: '12 mm frames' }[filter];
    const title = `${filterTitle || 'Frames'} · ${tab} · Labelarium`;
    const desc = n
      ? (filterTitle ? `${filterTitle} on the ${label}.` : `Frames on the ${label}: ${n} designs, numbered as on the device.`)
      : `No on-device frame sheet is published for the ${label} in this pack.`;
    const path = filterTitle ? `/d/${d.id}/frames?f=${encodeURIComponent(filter)}` : `/d/${d.id}/frames`;
    return page(title, desc, path);
  }
  if (section === 'templates') {
    const nText = d.templates.text.length, nPat = d.templates.pattern.length;
    return page(`Templates · ${tab} · Labelarium`, (nText + nPat) ? `Templates on the ${label}: ${nText} text, ${nPat} pattern.` : `No on-device template library is published for the ${label} in this pack.`, `/d/${d.id}/templates`);
  }
  if (section === 'fonts') {
    const nF = d.fonts.length, nS = d.styles.length;
    if (hash === 'styles') {
      return page(`Styles · ${tab} · Labelarium`, nS ? `${nS} text styles on the ${label}, plus fonts, size, width and alignment.` : `Text style settings for the ${label}.`, `/d/${d.id}/fonts`);
    }
    const desc = nF > 1
      ? `Type on the ${label}: ${nF} fonts, ${nS} styles, plus size, width and alignment.`
      : `Type settings for the ${label}${d.fontNote ? ': ' + String(d.fontNote).split('.')[0] + '.' : '.'}`;
    return page(`Fonts & styles · ${tab} · Labelarium`, desc, `/d/${d.id}/fonts`);
  }
  if (section === 'shortcuts') return page(`Shortcuts · ${tab} · Labelarium`, `${d.shortcuts.length} key combos and hidden tricks on the ${label}.`, `/d/${d.id}/shortcuts`);
  if (section === 'howto') {
    const topic = rest[0];
    const h = topic && d.howto.find(x => x.id === topic);
    if (h) return page(`${h.title} · ${tab} · Labelarium`, `${h.title} on the ${label}.`, `/d/${d.id}/howto/${h.id}`);
    return page(`How-to guides · ${tab} · Labelarium`, `${d.howto.length} step-by-step guides for the ${label}.`, `/d/${d.id}/howto`);
  }
  if (section === 'trouble') {
    if (hash === 'errors') {
      return page(`Error messages · ${tab} · Labelarium`, d.errors.length ? `LCD error messages for the ${label}: ${d.errors.length} messages, with causes and fixes.` : `LCD error messages for the ${label}.`, `/d/${d.id}/trouble`);
    }
    if (hash === 'problems') {
      return page(`Problems · ${tab} · Labelarium`, d.problems.length ? `${d.problems.length} problems and fixes for the ${label}.` : `Problems and fixes for the ${label}.`, `/d/${d.id}/trouble`);
    }
    const desc = (d.errors.length || d.problems.length)
      ? `LCD messages and fixes for the ${label}: ${d.errors.length} messages, ${d.problems.length} problems.`
      : `Troubleshooting notes for the ${label}.`;
    return page(`Troubleshooting · ${tab} · Labelarium`, desc, `/d/${d.id}/trouble`);
  }
  if (section === 'preview') return page(`Label preview · ${tab} · Labelarium`, `Design a label for the ${label} and get the key-press recipe.`, `/d/${d.id}/preview`);
  if (section === 'specs') return page(`Specs & tapes · ${tab} · Labelarium`, `Tape widths, limits and official links for the ${label}.`, `/d/${d.id}/specs`);
  return page(`${tab} · Labelarium`, `${label} in Labelarium.`, `/d/${d.id}`);
}
function applyLocationSeo() {
  const { seg, q, path } = route();
  if (!seg.length) { applyHomeSeo(q); return; }
  if (seg[0] !== 'd' || !seg[1]) { applyNotFoundSeo(path); return; }
  const d = loaded[seg[1]];
  if (d) applyDeviceSeo(d, seg[2] || 'home', seg.slice(3), q);
}
function scrollRouteHash() {
  const id = routeHash();
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ block: 'start' });
}

async function render() {
  const { seg, q } = route();
  sheet.open && sheet.close();
  try {
    if (!devices.length) await loadIndex();
    if (!seg.length) { applyHomeSeo(q); renderHome(q); ensureFooter(app); maybeShowInstallBar(); return; }
    if (seg[0] !== 'd' || !seg[1]) {
      applyNotFoundSeo(route().path);
      setTop('Not found', { back: '/' });
      app.className = 'app';
      app.innerHTML = `<div class="empty">Nothing at this address.<br><span class="small">Older links used a #/ hash; this app now uses ordinary paths.</span><br><br><a href="/">Back to all label makers</a></div>`;
      ensureFooter(app);
      maybeShowInstallBar();
      return;
    }
    const d = await loadDevice(seg[1]);
    const section = seg[2] || 'home';
    const views = { home: viewDeviceHome, symbols: viewSymbols, frames: viewFrames, templates: viewTemplates, fonts: viewFonts, shortcuts: viewShortcuts, keyboard: viewKeyboard, howto: viewHowto, trouble: viewTrouble, preview: viewPreview, specs: viewSpecs };
    if (!views[section]) return go(`/d/${d.id}`, true);
    applyDeviceSeo(d, section, seg.slice(3), q);
    views[section](d, seg.slice(3), q);
    ensureFooter(main);
    maybeShowInstallBar();
  } catch (e) {
    setTop('Labelarium', { back: '/' });
    applySeo('Not found · Labelarium', e.message || 'That page is not in Labelarium.', route().path || '/', null, { noindex: true });
    app.className = 'app';
    app.innerHTML = `<div class="empty">Something went wrong.<br><span class="small">${esc(e.message)}</span><br><br><a href="/">Back to all label makers</a></div>`;
    ensureFooter(app);
    console.error(e);
  } finally {
    if (routeHash()) requestAnimationFrame(scrollRouteHash);
    else if (!route().q.q) window.scrollTo(0, 0);
  }
}

// Diagonal ABC tape. viewBox is sized for rotate(-26) of the 88×22 strip so nothing is clipped.
const TAPE_MARK = `<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="-22 -16 100 70" width="57" height="40" overflow="visible" aria-hidden="true" focusable="false"><g transform="rotate(-26 28 19)"><rect x="-16" y="8" width="88" height="22" fill="#e8b820"/><rect x="-16" y="8" width="88" height="3" fill="#141414"/><rect x="-16" y="27" width="88" height="3" fill="#141414"/><text x="28" y="24" text-anchor="middle" font-family="Jost,Futura,'Century Gothic',sans-serif" font-weight="700" font-size="13" fill="#141414">ABC</text></g></svg>`;

function setTop(title, { back, sub, right = '', deviceId } = {}) {
  topbar.classList.toggle('home', !back);
  if (back) topbar.removeAttribute('aria-label');
  else topbar.setAttribute('aria-label', 'Labelarium');
  const logo = back
    ? `<a class="iconbtn" href="${esc(back)}" aria-label="Back">‹</a>`
    : TAPE_MARK;
  const deviceIcon = deviceId
    ? `<img class="dev-top" src="/icons/devices/${esc(deviceId)}.svg" alt="" width="48" height="48">`
    : '';
  const actions = right ? `<div class="top-right">${right}</div>` : '';
  const titleHtml = back
    ? `<div class="title"><h1>${esc(title)}</h1>${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</div>`
    : '';
  const innerLabel = back ? '' : ' aria-label="Labelarium"';
  topbar.innerHTML = `<div class="inner"${innerLabel}>${logo}${deviceIcon}${titleHtml}${actions}</div>`;
}

function deviceLabel(dev) {
  const brand = dev.brand || '', name = dev.name || '';
  if (!brand) return name;
  const n = name.toLowerCase(), b = brand.toLowerCase();
  if (n === b || n.startsWith(b + ' ')) return name;
  return `${brand} ${name}`;
}
function deviceTab(dev) {
  const brand = dev.brand || '';
  const model = dev.model || dev.name || '';
  if (!brand) return model;
  if (!model) return brand;
  const m = model.toLowerCase(), b = brand.toLowerCase();
  if (m === b || m.startsWith(b + ' ')) return model;
  return `${brand} ${model}`;
}

// Document-flow site footer. Not sticky: lives at the end of the page content.
function siteFooter() {
  return `<footer class="site-foot">
    <p class="footer"><a class="f-left" href="https://github.com/sponsors/jatinkrmalik" target="_blank" rel="noopener">Buy me a coffee</a><span class="f-mid"><a href="https://github.com/jatinkrmalik/labelarium/blob/main/LICENSE" target="_blank" rel="noopener">AGPL-3.0</a></span><a class="f-right" href="https://x.com/jatinkrmalik" target="_blank" rel="noopener">Made by @jatinkrmalik</a></p>
    <p class="footer-legal">Brother, DYMO, NIIMBOT, Brady, Phomemo and related marks belong to their owners. Labelarium is unofficial and not affiliated. <a href="https://github.com/jatinkrmalik/labelarium/blob/main/TRADEMARK.md" target="_blank" rel="noopener">Trademarks</a></p>
  </footer>`;
}
function ensureFooter(el) {
  if (!el || el.querySelector(':scope > .site-foot')) return;
  el.insertAdjacentHTML('beforeend', siteFooter());
}

// ---------- home ----------
function renderHome(q = {}) {
  setTop('Labelarium', { right: installIconButton() });
  app.className = 'app'; main = app;
  const favs = store.get('favs', []);
  const brand = q.brand || 'all';
  const brands = [...new Set(devices.map(d => d.brand))];
  const list = brand === 'all' ? devices : devices.filter(d => d.brand === brand);
  const favDevs = devices.filter(d => favs.includes(d.id));
  const card = dev => `<div class="card devtile link">
      <button class="star ${favs.includes(dev.id) ? 'on' : ''}" aria-label="Pin" title="Pin to home" onclick="toggleFav('${dev.id}')">${favs.includes(dev.id) ? '●' : '○'}</button>
      <a class="devtile-hit" href="/d/${dev.id}">
      <div class="dev-icon"><img src="/icons/devices/${esc(dev.id)}.svg" alt=""></div>
      <div class="dev-copy"><b>${esc(deviceLabel(dev))}</b><div class="muted">${esc(dev.tagline)}</div></div>
      </a>
    </div>`;
  const requestTile = `<a class="card devtile link request-tile" href="https://github.com/jatinkrmalik/labelarium/issues/new?template=label_maker_request.yml" target="_blank" rel="noopener" aria-label="Request a label maker">
      <span class="devtile-hit">
      <span class="dev-icon" aria-hidden="true"><span class="request-q">?</span></span>
      <span class="dev-copy"><b>Request a label maker</b><span class="muted">Don't see yours?</span></span>
      </span>
    </a>`;
  const chip = (id, label) => `<button class="chip ${brand === id ? 'on' : ''}" onclick="setHomeBrand('${id}')">${label}</button>`;
  app.innerHTML = `<div class="hero-home"><div class="kicker">The label maker companion</div><h1 class="big">Labelarium</h1><p>Every symbol, frame, template and shortcut of your label maker. Searchable, with pictures, offline.</p><div class="marks"><i class="mark ci-red"></i><i class="mark sq-blue"></i><i class="mark tr-yellow"></i></div></div>
    ${favDevs.length ? `<h2 id="favorites">Pinned</h2><div class="devgrid">${favDevs.map(card).join('')}</div>` : '<p class="hint">Tap ○ on a label maker to pin it here.</p>'}
    <h2>Label makers</h2>
    <div class="chips">${chip('all', 'All')}${brands.map(b => chip(b, b)).join('')}</div>
    <div class="devgrid">${list.map(card).join('')}${requestTile}</div>
    ${siteFooter()}`;
}
window.setHomeBrand = b => { history.replaceState(null, '', b === 'all' ? '/' : '/?brand=' + encodeURIComponent(b)); render(); };
window.toggleFav = id => { const f = store.get('favs', []); store.set('favs', f.includes(id) ? f.filter(x => x !== id) : [...f, id]); render(); };

// ---------- device home + search ----------
const SECTIONS = [
  ['keyboard', 'keys', 'Keyboard map', 'Where every key is and what it does'],
  ['symbols', 'ci-red', 'Symbols', d => `${d.symbols.categories.reduce((n, c) => n + (c.items.length || (c.charsNote ? 99 : c.chars.split(' ').length)), 0)} in ${d.symbols.categories.length} categories`],
  ['frames', 'hollow', 'Frames', d => `${d.frames.items.length - 1} designs, by number`],
  ['templates', 'tr-yellow', 'Templates', d => `${d.templates.text.length} text · ${d.templates.pattern.length} pattern`],
  ['fonts', 'half', 'Fonts & styles', d => `${d.fonts.length} fonts · ${d.styles.length} styles`],
  ['shortcuts', 'dia', 'Shortcuts', d => `${d.shortcuts.length} key combos`],
  ['howto', 'lines', 'How-to guides', d => `${d.howto.length} step-by-step guides`],
  ['trouble', 'cross', 'Troubleshooting', d => `${d.errors.length} messages · ${d.problems.length} fixes`],
  ['preview', 'strip', 'Label preview', 'Design a label, get the recipe'],
  ['specs', 'quarter', 'Specs & tapes', 'Tape widths, limits, links'],
];
function deviceTop(d, section, sub) {
  const favs = store.get('favs', []);
  const star = `<button class="iconbtn ${favs.includes(d.id) ? 'fav' : ''}" aria-label="Pin" title="Pin to home" onclick="toggleFav('${d.id}')">${favs.includes(d.id) ? '●' : '○'}</button>`;
  const search = section ? `<a class="iconbtn" href="/d/${d.id}" aria-label="Search">⌕</a>` : '';
  setTop(section ? section : d.model, { back: section ? `/d/${d.id}` : '/', sub: section ? d.model : d.brand, deviceId: d.id, right: installIconButton() + star + search });
  const cur = route().seg[2] || 'home';
  const all = [['home', 'ring', 'Search'], ...SECTIONS.map(([id, ico, name]) => [id, ico, name])];
  const SHORT = { home: 'Search', keyboard: 'Keyboard', symbols: 'Symbols', frames: 'Frames', templates: 'Templates', fonts: 'Fonts', shortcuts: 'Shortcuts', howto: 'How-to', trouble: 'Trouble', preview: 'Preview', specs: 'Specs' };
  const link = ([id, ico, name], short) => `<a href="/d/${d.id}${id === 'home' ? '' : '/' + id}" class="${cur === id ? 'on' : ''}"><i class="mark ${ico}"></i><span>${short ? SHORT[id] : name}</span></a>`;
  const rail = `<nav class="rail" aria-label="Sections"><a class="brand" href="/" title="All label makers"><img class="dev-rail" src="/icons/devices/${esc(d.id)}.svg" alt=""><b>${esc(d.model)}</b></a>${all.map(x => link(x, true)).join('')}</nav>`;
  const tabIds = ['home', 'symbols', 'frames', 'preview'];
  const tabs = `<nav class="tabs" aria-label="Quick navigation">${all.filter(x => tabIds.includes(x[0])).map(x => link(x, true)).join('')}<a href="#" class="${tabIds.includes(cur) ? '' : 'on'}" onclick="event.preventDefault();openMore('${d.id}')"><i class="mark dots"></i><span>More</span></a></nav>`;
  app.className = 'app device';
  app.innerHTML = `${rail}<section class="main" id="main"></section>${tabs}`;
  main = $('#main');
}
window.openMore = id => {
  const d = loaded[id], cur = route().seg[2] || 'home';
  const rest = SECTIONS.filter(([sid]) => !['symbols', 'frames', 'preview'].includes(sid));
  openSheet(`<h2 class="t">More</h2><div class="more">${rest.map(([sid, ico, name, sub]) => `<a href="/d/${id}/${sid}" class="${cur === sid ? 'on' : ''}" onclick="document.getElementById('sheet').close()"><i class="mark ${ico}"></i><span><b>${name}</b><small>${typeof sub === 'function' ? sub(d) : sub}</small></span></a>`).join('')}</div>`);
};
function searchBox(d, q) {
  return `<div class="search" id="search"><span class="mag">⌕</span><input id="q" type="search" aria-label="Search this label maker" placeholder="Search: warning, gift, margin…" value="${esc(q || '')}" autocomplete="off" autocapitalize="off" oninput="onSearch('${d.id}', this.value)">${q ? `<button class="clr" onclick="onSearch('${d.id}','')">×</button>` : ''}</div>`;
}
let searchTimer;
window.onSearch = (id, v) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { history.replaceState(null, '', `/d/${id}${v ? '?q=' + encodeURIComponent(v) : ''}`); const d = loaded[id]; applyDeviceSeo(d, 'home', [], { q: v }); renderResults(d, v); }, 80); };

function viewDeviceHome(d, _, q) {
  deviceTop(d);
  main.innerHTML = `${searchBox(d, q.q)}<div id="results"></div><div id="sections" class="twocol"></div>`;
  if (q.q) renderResults(d, q.q, true); else renderSections(d);
  if (q.q) { const i = $('#q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
}
function renderSections(d) {
  const tiles = SECTIONS.map(([id, ico, name, sub]) => `<a class="tile" href="/d/${d.id}/${id}"><span class="ico"><i class="mark ${ico}"></i></span><b>${name}</b><span class="n">${typeof sub === 'function' ? sub(d) : sub}</span></a>`).join('');
  const saved = store.get('offline:' + d.id);
  $('#sections').innerHTML = `<div class="col"><p class="hint">Try “warning”, “no smoking”, “gift”, “serial number”, “save tape”, “reset”…</p><div class="grid">${tiles}</div></div>
    <aside class="col"><h2 id="tips">Quick tips</h2><div class="list plate">${d.tips.map((t, i) => `<div class="card" style="display:flex;gap:14px;font-size:15px"><span style="font:600 15px/1.5 var(--sans);color:var(--red);min-width:1.4em">${i + 1}</span><span>${fmt(t)}</span></div>`).join('')}</div>
    <div class="card" id="offline" style="margin-top:14px"><div class="row"><div><b>Offline copy</b><div class="muted small">${saved ? 'All images for this label maker are saved on this device.' : 'Save all pictures so everything works without a network.'}</div></div>
    <button class="btn ${saved ? 'ghost' : ''}" style="margin-left:auto" onclick="saveOffline('${d.id}')">${saved ? 'Saved ✓' : 'Save offline'}</button></div></div></aside>`;
}
function renderResults(d, q, firstPaint) {
  const box = $('#results'), sections = $('#sections');
  if (!q) { box.innerHTML = ''; sections.hidden = false; if (!sections.innerHTML) renderSections(d); return; }
  sections.hidden = true;
  const res = search(d, q);
  if (!res.length) { box.innerHTML = `<div class="empty">Nothing matches “${esc(q)}”.<br><span class="small">Try a simpler word, e.g. “sign”, “star”, “tape”.</span></div>`; return; }
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
    else if (type === 'howto') html += g.map(r => `<a class="card link" href="/d/${d.id}/howto/${r.item.id}"><div><b>${hi(r.item.title)}</b><div class="muted small">${fmt(r.item.steps[0])}</div></div><span class="chev">›</span></a>`).join('');
    else if (type === 'shortcut') html += g.map(r => `<div class="card"><div>${fmt(r.item.keys)}</div><div style="margin-top:6px"><b>${hi(r.item.action)}</b></div></div>`).join('');
    else if (type === 'font') html += g.map(r => `<a class="card link" href="/d/${d.id}/fonts"><img class="font-img" src="${r.item.img}" alt=""><div><b>${hi(r.item.name)}</b><div class="muted small">${esc(r.item.desc)}</div></div><span class="chev">›</span></a>`).join('');
    else if (type === 'style') html += g.map(r => `<a class="card link" href="/d/${d.id}/fonts"><img class="font-img" src="${r.item.img}" alt=""><div><b>${hi(r.item.name)}</b><div class="muted small">${fmt('[Font] → {Style} → [OK]')}</div></div></a>`).join('');
    else if (type === 'error') html += g.map(r => `<div class="card"><b class="lcd">${hi(r.item.msg)}</b><div class="small" style="margin-top:6px">${hi(r.item.cause)}</div><div class="note">${fmt(r.item.fix)}</div></div>`).join('');
    else if (type === 'problem') html += g.map(r => `<div class="card"><b>${hi(r.item.problem)}</b><div class="small muted" style="margin-top:4px">${fmt(r.item.fix)}</div></div>`).join('');
    else if (type === 'key') html += g.map(r => `<a class="card link" href="/d/${d.id}/keyboard"><div><b>${hi(r.item.name)}</b> <span class="pill">key ${r.item.n}</span><div class="muted small">${fmt(r.item.desc)}</div></div><span class="chev">›</span></a>`).join('');
  }
  box.innerHTML = html;
}
window.saveOffline = async id => {
  const d = loaded[id], meta = devices.find(x => x.id === id);
  const urls = [meta.data, d.keyboard.image, d.symbols.accented.image, ...d.symbols.categories.flatMap(c => [c.img, ...c.items.map(i => i.img)]),
    ...d.frames.items.map(f => f.img), ...d.templates.text.map(t => t.img), ...d.templates.pattern.map(t => t.img), ...d.fonts.map(f => f.img),
    ...['sizes', 'widths', 'styles', 'alignments'].flatMap(k => d[k].map(x => x.img))];
  const btn = document.querySelector('#sections .btn'); if (btn) btn.textContent = 'Saving…';
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (!reg?.active) throw new Error('Service worker not available (needs https or localhost).');
    await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('Timed out')), 60000); navigator.serviceWorker.addEventListener('message', function h(e) { if (e.data?.type === 'precached') { clearTimeout(t); navigator.serviceWorker.removeEventListener('message', h); res(); } }); reg.active.postMessage({ type: 'precache', urls }); });
    store.set('offline:' + id, true);
  } catch (e) { alert('Could not save offline: ' + e.message); }
  renderSections(d);
};

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
  return `<a class="card link" href="/d/${d.id}/symbols/${c.id}"><div style="min-width:0"><b>${esc(c.name)}</b> <span class="pill">${c.group}</span> <span class="pill">key ${esc(c.key)}</span><div class="row img-card" style="gap:6px;margin-top:6px;flex-wrap:nowrap;overflow:hidden">${preview}</div></div><span class="chev">›</span></a>`;
}
function openSheet(html) {
  sheet.classList.remove('zoom');
  sheet.innerHTML = `<div class="inner"><div class="grab"></div><button class="iconbtn close" aria-label="Close" onclick="document.getElementById('sheet').close()">×</button>${html}</div>`;
  sheet.showModal();
}
function zoomable(src, alt, extraClass) {
  return `<button type="button" class="${extraClass} zoomable" data-src="${esc(src)}" data-alt="${esc(alt)}" onclick="openZoom(this.dataset.src, this.dataset.alt)"><img src="${esc(src)}" alt="${esc(alt)}"><span class="kbd-hint">Tap to zoom</span></button>`;
}
window.openZoom = (src, alt) => {
  sheet.classList.add('zoom');
  sheet.classList.toggle('photo', /\.jpe?g$/i.test(src));
  sheet.innerHTML = `<div class="inner"><div class="grab"></div><button class="iconbtn close" aria-label="Close" onclick="document.getElementById('sheet').close()">×</button><div class="zoom-hero"><img src="${esc(src)}" alt="${esc(alt)}"></div></div>`;
  sheet.showModal();
};
sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
sheet.addEventListener('close', () => sheet.classList.remove('zoom', 'photo'));
const steps = arr => `<ol class="steps">${arr.map(s => `<li>${fmt(s)}</li>`).join('')}</ol>`;

window.openSymbol = (id, catId, n) => {
  const d = loaded[id], c = d.symbols.categories.find(x => x.id === catId), it = c.items[n - 1];
  openSheet(`<div class="hero"><img src="${it.img}" alt=""></div><h2 class="t">${esc(it.name)}</h2>
    <p class="muted small">${esc(c.name)} · ${c.group} · position ${it.n} of ${c.items.length}${it.ch ? ` · looks like ${it.ch}` : ''}</p>
    <h3 style="margin-top:14px">How to insert</h3>${steps([`Press [Symbol].`, `[◀] / [▶] to {${c.group}} → [OK].`, `Press [${c.key}] to jump to {${c.name}} (or [◀] / [▶] to it) → [OK].`, `[◀] / [▶] to symbol number ${it.n} → [OK].`])}
    <div class="note">Recently used? Pick <b>History</b> instead. It keeps your last 7 symbols.</div>
    <p style="margin-top:12px"><a href="/d/${id}/symbols/${c.id}" onclick="document.getElementById('sheet').close()">See all ${esc(c.name)} symbols ›</a></p>`);
};
window.openFrame = (id, n) => {
  const d = loaded[id], f = d.frames.items.find(x => String(x.n) === String(n));
  const digits = f.n === 'off' ? null : String(f.n).split('').map(x => `[${x}]`).join(' ');
  openSheet(`<div class="hero"><img src="${f.img}" alt=""></div><h2 class="t">${f.n === 'off' ? 'No frame' : `Frame ${f.n}`} <span class="muted" style="font-weight:400">· ${esc(f.name)}</span></h2>
    ${f.wide ? '<p><span class="pill warn">12 mm (0.47") tape only</span></p>' : ''}
    <h3 style="margin-top:14px">How to apply</h3>${steps(digits ? ['Press [Frame].', `Type ${digits} (or [◀] / [▶] to ${f.n}).`, 'Press [OK].'] : ['Press [Frame].', '[◀] / [▶] to {Off}.', 'Press [OK].'])}
    <div class="note">Frames apply to the whole label. On narrower tape than allowed you get <b>No Frame OK?</b>. [OK] prints without it.</div>
    <p style="margin-top:12px"><a href="/d/${id}/preview?frame=${f.n}" onclick="document.getElementById('sheet').close()">Try it in Label preview ›</a></p>`);
};
window.openTemplate = (id, kind, n) => {
  const d = loaded[id], t = d.templates[kind].find(x => x.n === n);
  openSheet(`<div class="hero"><img src="${t.img}" alt=""></div><h2 class="t">${kind === 'text' ? 'Text' : 'Pattern'} template ${pad2(t.n)} <span class="muted" style="font-weight:400">· ${esc(t.name)}</span></h2><p class="small">${esc(t.desc)}</p>
    <p><span class="pill warn">12 mm (0.47") tape only</span></p>
    <h3 style="margin-top:14px">How to use</h3>${steps((kind === 'text' ? d.templates.textHowto : d.templates.patternHowto).map(s => s.replace('the design (number below)', `design number ${pad2(t.n)}`).replace('pick the pattern', `pick pattern ${pad2(t.n)}`)))}
    <div class="note">${d.templates.notes.map(fmt).join('<br>')}</div>`);
};

// ---------- sections ----------
function viewSymbols(d, [catId]) {
  if (catId) return viewCategory(d, catId);
  deviceTop(d, 'Symbols');
  const grp = g => d.symbols.categories.filter(c => c.group === g).map(c => catCard(d, c)).join('');
  main.innerHTML = `<div class="card"><details class="howto-fold"><summary>How to insert any symbol</summary>${steps(d.symbols.howto)}</details></div>
    <h2>Basic <span class="muted small">(text characters)</span></h2>${grp('Basic')}
    <h2>Pictograph <span class="muted small">(pictures)</span></h2>${grp('Pictograph')}
    <h2>Accented letters</h2><a class="card link" href="/d/${d.id}/symbols/accented"><div><b>Accent key table</b><div class="muted small">á ç ñ ö ß ž … via the [Accent] key</div></div><span class="chev">›</span></a>`;
}
function viewCategory(d, catId) {
  if (catId === 'accented') {
    const a = d.symbols.accented;
    deviceTop(d, 'Accented letters');
    main.innerHTML = `<div class="card"><h3>How to type them</h3>${steps(a.howto)}</div><h2>All variants</h2>${zoomable(a.image, "Accented characters table", "card img-card")}
      <div class="card" style="margin-top:10px">${Object.entries(a.table).map(([k, v]) => `<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line)"><b style="min-width:20px">${k}</b><span style="letter-spacing:.15em">${v}</span></div>`).join('')}</div>`;
    return;
  }
  const c = d.symbols.categories.find(x => x.id === catId);
  if (!c) return viewSymbols(d, []);
  deviceTop(d, c.name);
  const how = steps(['Press [Symbol].', `[◀] / [▶] to {${c.group}} → [OK].`, `Press [${c.key}] to jump straight to {${c.name}} (or [◀] / [▶] to it) → [OK].`, '[◀] / [▶] to the symbol (numbers below = position) → [OK].']);
  let body;
  if (c.items.length) body = `<div class="symgrid">${c.items.map(it => glyphTile(d, it, true)).join('')}</div><h2>As printed in the manual</h2>${zoomable(c.img, c.name + " as printed in the manual", "card img-card")}`;
  else body = `<div class="card"><div class="chars">${c.chars.split(' ').map((ch, i) => `<span class="c" title="position ${i + 1}">${esc(ch)}</span>`).join('')}</div>${c.charsNote ? `<p class="muted small">${esc(c.charsNote)}</p>` : ''}</div><h2>As printed in the manual</h2>${zoomable(c.img, c.name + " as printed in the manual", "card img-card")}`;
  main.innerHTML = `<div class="card"><div class="row"><span class="pill">${c.group}</span><span class="pill">shortcut key: ${esc(c.key)}</span><span class="pill">${c.items.length || c.chars.split(' ').length}${c.charsNote ? '+' : ''} symbols</span></div>${how}</div><h2>Symbols</h2>${body}`;
}
function viewFrames(d, _, q) {
  deviceTop(d, 'Frames');
  const filter = q.f || 'all';
  const numbered = d.frames.items.filter(f => f.n !== 'off' && Number.isFinite(+f.n));
  const hasBasic = numbered.some(f => +f.n <= 17);
  const hasPictures = numbered.some(f => +f.n > 17);
  const hasWide = d.frames.items.some(f => f.wide);
  const items = d.frames.items.filter(f => filter === 'all' || (filter === 'basic' && f.n !== 'off' && f.n <= 17) || (filter === 'pictures' && f.n !== 'off' && f.n > 17) || (filter === 'wide' && f.wide));
  const chip = (id, label) => `<button class="chip ${filter === id ? 'on' : ''}" onclick="setFilter('${d.id}','${id}')">${label}</button>`;
  const chips = [chip('all', 'All')];
  if (hasBasic && hasPictures) {
    chips.push(chip('basic', 'Boxes & lines (0–17)'));
    chips.push(chip('pictures', 'With pictures (18–99)'));
  }
  if (hasWide) chips.push(chip('wide', '12 mm only'));
  const chipRow = chips.length > 1 ? `<div class="chips">${chips.join('')}</div>` : '';
  main.innerHTML = `<div class="card"><details class="howto-fold"><summary>How to apply a frame</summary>${steps(d.frames.howto)}<div class="note">${d.frames.notes.map(fmt).join('<br>')}</div></details></div>
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
  main.innerHTML = `<div class="card"><h3>How to change text settings</h3>${steps(['Press [Font].', '[◀] / [▶] to {Font}, {Size}, {Width}, {Style} or {Alignment} → [OK].', '[◀] / [▶] to the setting → [OK].'])}<div class="note">${esc(d.fontNote)} Web previews on the right are approximations of the printed font.</div></div>
    ${list('Fonts', d.fonts, 'fonts')}${list('Sizes', d.sizes, 'sizes')}${list('Widths', d.widths, 'widths')}${list('Styles', d.styles, 'styles')}${list('Alignment', d.alignments, 'alignment')}`;
}
function viewShortcuts(d) {
  deviceTop(d, 'Shortcuts');
  main.innerHTML = `<p class="hint">Key combos and hidden tricks. Menu shortcuts work from the text screen.</p><div class="list plate">${d.shortcuts.map(s => `<div class="card"><div>${fmt(s.keys)}</div><div style="margin-top:6px"><b>${esc(s.action)}</b></div></div>`).join('')}</div>`;
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
function viewHowto(d, [topic]) {
  deviceTop(d, 'How-to guides');
  main.innerHTML = `<div class="card">${d.howto.map(h => `<details id="h-${h.id}" ${h.id === topic ? 'open' : ''}><summary>${esc(h.title)}</summary><div class="body">${steps(h.steps)}${h.notes ? `<div class="note">${h.notes.map(fmt).join('<br>')}</div>` : ''}</div></details>`).join('')}</div>`;
  if (topic) setTimeout(() => document.getElementById('h-' + topic)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 50);
}
function viewTrouble(d) {
  deviceTop(d, 'Troubleshooting');
  main.innerHTML = `<h2 id="errors">Error messages on the LCD</h2><div class="card">${d.errors.map(e => `<details><summary><span class="lcd">${esc(e.msg)}</span></summary><div class="body small"><p>${esc(e.cause)}</p><div class="note">${fmt(e.fix)}</div></div></details>`).join('')}</div>
    <h2 id="problems">What to do when…</h2><div class="card">${d.problems.map(p => `<details><summary>${esc(p.problem)}</summary><div class="body small">${fmt(p.fix)}</div></details>`).join('')}</div>`;
}
function viewSpecs(d) {
  deviceTop(d, 'Specs & tapes');
  main.innerHTML = `<div class="card"><dl class="kv">${d.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
    <h2>Tape widths</h2><div class="list plate">${d.tapes.map(t => `<div class="card"><b>${t.mm} mm <span class="muted">(${t.in})</span></b> <span class="pill">${t.lines} line${t.lines > 1 ? 's' : ''}</span><div class="small muted">${esc(t.note)}</div></div>`).join('')}</div>
    <h2>Links</h2><div class="list plate">${d.links.map(([t, u]) => `<div class="card link" onclick="window.open('${u}','_blank')"><b>${esc(t)}</b><span class="chev">↗</span></div>`).join('')}</div>`;
}

// ---------- label preview / designer ----------
const TAPES = [['White · black text', '#ffffff', '#111'], ['Yellow · black text', '#f5c400', '#111'], ['Clear · black text', 'rgba(255,255,255,.35)', '#111'], ['Red · black text', '#e53935', '#111'],
  ['Blue · black text', '#3f7fd6', '#111'], ['Green · black text', '#3aa655', '#111'], ['Black · white text', '#151515', '#fff'], ['White · red text', '#ffffff', '#d32f2f'], ['White · blue text', '#ffffff', '#1e4fbf'], ['Fluorescent orange · black', '#ff7a1a', '#111'], ['Silver · black text', '#c9ccd1', '#111']];
const MARGINS = { Full: 25, Half: 12, Narrow: 4, 'Chain Print': 4 };
function viewPreview(d, _, q) {
  deviceTop(d, 'Label preview');
  const s = Object.assign({ text1: 'HELLO', text2: '', tape: 12, color: 0, font: 0, size: 0, width: 0, style: 0, align: 1, frame: 'off', margin: 'Full', length: 0, mirror: false }, store.get('preview:' + d.id, {}), q.frame ? { frame: q.frame } : {});
  const opt = (arr, sel, label = x => x.name) => arr.map((x, i) => `<option value="${i}" ${i === +sel ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  main.innerHTML = `<div class="twocol"><div class="col"><div class="card"><div class="tapewrap"><div id="tape"></div></div><p id="len" class="muted small" style="text-align:center;margin-top:8px"></p></div>
  <div class="card ctl" id="ctl">
    <label class="full">Line 1<input type="text" maxlength="80" data-k="text1" value="${esc(s.text1)}"></label>
    <label class="full">Line 2 <span class="muted">(9 / 12 mm tape)</span><input type="text" maxlength="80" data-k="text2" value="${esc(s.text2)}" ${s.tape < 9 ? 'disabled' : ''}></label>
    <label>Tape width<select data-k="tape">${d.tapes.map(t => `<option value="${t.mm}" ${t.mm === +s.tape ? 'selected' : ''}>${t.mm} mm (${t.in})</option>`).join('')}</select></label>
    <label>Tape colour<select data-k="color">${TAPES.map((t, i) => `<option value="${i}" ${i === +s.color ? 'selected' : ''}>${t[0]}</option>`).join('')}</select></label>
    <label>Font<select data-k="font">${opt(d.fonts, s.font)}</select></label>
    <label>Size<select data-k="size">${opt(d.sizes, s.size)}</select></label>
    <label>Width<select data-k="width">${opt(d.widths, s.width)}</select></label>
    <label>Style<select data-k="style">${opt(d.styles, s.style)}</select></label>
    <label>Alignment<select data-k="align">${opt(d.alignments, s.align)}</select></label>
    <label>Frame<select data-k="frame">${d.frames.items.map(f => `<option value="${f.n}" ${String(f.n) === String(s.frame) ? 'selected' : ''}>${f.n === 'off' ? 'Off' : f.n + ' · ' + f.name}${f.wide ? ' (12 mm)' : ''}</option>`).join('')}</select></label>
    <label>Margin<select data-k="margin">${Object.keys(MARGINS).map(m => `<option ${m === s.margin ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label>Label length (mm, 0 = Auto)<input type="number" min="0" max="300" step="1" data-k="length" value="${s.length}"></label>
    <label>Mirror<div class="seg"><button data-k="mirror" data-v="false" class="${!s.mirror ? 'on' : ''}">Off</button><button data-k="mirror" data-v="true" class="${s.mirror ? 'on' : ''}">On</button></div></label>
  </div></div>
  <div class="col"><div class="card"><div class="row" style="justify-content:space-between"><h3>Recipe for the ${esc(d.model)}</h3><span class="pill">tap a step to tick it off</span></div><ol class="steps recipe" id="recipe"></ol>
    <div class="row" style="margin-top:14px;gap:10px"><button class="btn" onclick="saveLabel('${d.id}')">Save this label</button><button class="btn ghost" onclick="resetPreview('${d.id}')">Start over</button></div>
    <div class="note">Preview is an approximation: fonts are web look-alikes, and real print length varies slightly.</div></div>
  <h2>Saved labels</h2><div id="saved"></div></div></div>`;
  $('#recipe').addEventListener('click', e => { const li = e.target.closest('li'); if (li) li.classList.toggle('done'); });
  renderSaved(d);
  const ctl = $('#ctl');
  ctl.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; s[k] = e.target.type === 'number' || e.target.tagName === 'SELECT' && k !== 'margin' && k !== 'frame' ? +e.target.value : e.target.value; if (k === 'tape') { ctl.querySelector('[data-k=text2]').disabled = s.tape < 9; if (s.tape < 9) s.text2 = ''; } draw(); });
  ctl.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (!b) return; s[b.dataset.k] = b.dataset.v === 'true'; b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); draw(); });
  const draw = () => { store.set('preview:' + d.id, s); drawTape(d, s); };
  draw();
}
const savedKey = id => 'labels:' + id;
function renderSaved(d) {
  const box = $('#saved'); if (!box) return;
  const list = store.get(savedKey(d.id), []);
  if (!list.length) { box.innerHTML = '<p class="hint">Nothing saved yet. Design a label above and press “Save this label”. It comes back with its full recipe.</p>'; return; }
  box.innerHTML = list.map((l, i) => `<div class="card link saved" onclick="loadLabel('${d.id}',${i})"><i class="mark strip"></i><div style="min-width:0;flex:1"><b>${esc(l.name)}</b><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(l.s.text1)}${l.s.text2 ? ' / ' + esc(l.s.text2) : ''} · ${l.s.tape} mm${l.s.frame !== 'off' ? ' · frame ' + l.s.frame : ''} · ${esc(d.fonts[l.s.font]?.name || '')}</div></div><button class="iconbtn" aria-label="Delete" title="Delete" onclick="event.stopPropagation();deleteLabel('${d.id}',${i})">×</button></div>`).join('');
}
window.saveLabel = id => {
  const d = loaded[id], s = store.get('preview:' + id, {});
  const name = prompt('Name this label', s.text1 || 'My label'); if (!name) return;
  const list = store.get(savedKey(id), []); list.unshift({ name, s, ts: Date.now() }); store.set(savedKey(id), list.slice(0, 50));
  renderSaved(d);
};
window.loadLabel = (id, i) => { const l = store.get(savedKey(id), [])[i]; if (!l) return; store.set('preview:' + id, l.s); render(); window.scrollTo(0, 0); };
window.deleteLabel = (id, i) => { const list = store.get(savedKey(id), []); if (!confirm(`Delete “${list[i]?.name}”?`)) return; list.splice(i, 1); store.set(savedKey(id), list); renderSaved(loaded[id]); };
window.resetPreview = id => { localStorage.removeItem('lab:preview:' + id); render(); };
function drawTape(d, s) {
  const PX = 9; // px per mm
  const tape = TAPES[s.color], font = d.fonts[s.font], style = d.styles[s.style].name, width = d.widths[s.width].factor, size = d.sizes[s.size].factor;
  const frame = d.frames.items.find(f => String(f.n) === String(s.frame));
  const lines = [s.text1, s.text2].filter((t, i) => i === 0 || (t && s.tape >= 9));
  const printH = (s.tape - (s.tape >= 9 ? 2.5 : 1.5)) * PX; // printable height in px
  const fontPx = Math.max(8, printH * size / (lines.length === 2 ? 2.05 : 1.15) / (frame && frame.n !== 'off' && frame.n !== 0 ? 1.25 : 1));
  const italic = /Italic|I\+/.test(style), bold = /Bold|Solid/.test(style) || font.weight >= 800;
  const ink = tape[2];
  let fx = '';
  if (/Outline/.test(style)) fx = `color:transparent;-webkit-text-stroke:1.5px ${ink};`;
  else if (/Shadow/.test(style)) fx = `color:transparent;-webkit-text-stroke:1.5px ${ink};text-shadow:3px 3px 0 ${ink};`;
  else if (/Solid/.test(style)) fx = `text-shadow:2px 2px 0 ${tape[1]},4px 4px 0 ${ink};`;
  const alignCss = ['flex-start', 'center', 'flex-end', 'stretch'][s.align];
  const vertical = style === 'Vertical';
  const renderLine = t => vertical ? [...t].map(ch => `<span style="display:inline-block;transform:rotate(-90deg);width:1em;text-align:center">${esc(ch)}</span>`).join('') : esc(t) || '&nbsp;';
  const marginMm = MARGINS[s.margin];
  let frameCss = '', frameImg = '';
  if (frame && frame.n !== 'off') {
    if (frame.n === 0) frameCss = 'text-decoration:underline;';
    else if (frame.n === 1) frameCss = `border-top:2px solid ${ink};border-bottom:2px solid ${ink};padding:2px 6px;`;
    else if (frame.n === 2) frameCss = `border:2px solid ${ink};border-radius:8px;padding:2px 10px;`;
    else frameImg = `<img class="frameimg${s.mirror ? ' mirror' : ''}" src="${frame.img}" alt="">`;
  }
  // Mirror must live in the same transform as width. An inline scaleX(width) was overriding .tape.mirror CSS.
  const sx = (s.mirror ? -1 : 1) * width;
  const txt = `<div class="txt" style="align-items:${alignCss};font-family:${cssq(font.css)};font-weight:${bold ? 900 : font.weight};font-style:${italic || font.style === 'italic' ? 'italic' : 'normal'};font-size:${fontPx}px;color:${ink};${fx}${frameCss}transform:scaleX(${sx});transform-origin:center;padding:0 ${frameImg ? Math.round(s.tape * PX * 1.15) : 4}px">${lines.map(t => `<div class="line">${renderLine(t)}</div>`).join('')}</div>`;
  const el = $('#tape');
  el.innerHTML = `<div class="tape ${s.mirror ? 'mirror' : ''}" style="height:${s.tape * PX}px;background:${tape[1]};padding:0 ${marginMm * PX}px;display:inline-flex;min-width:${Math.max(0, s.length) * PX}px;${tape[1].startsWith('rgba') ? 'border:1px dashed #888;' : ''}">${frameImg}${txt}${s.margin !== 'Full' ? `<span class="dots" style="left:${marginMm * PX - 1}px"></span><span class="dots" style="right:${marginMm * PX - 1}px"></span>` : ''}</div>`;
  const t = el.firstElementChild;
  // scaleX does not affect layout, so widen the box by hand
  const inner = t.querySelector('.txt'); const w = inner.getBoundingClientRect().width;
  if (width !== 1) inner.style.margin = `0 ${(w * width - w) / 2}px`;
  const tapeW = t.getBoundingClientRect().width, tapeH = s.tape * PX;
  const totalMm = Math.round(tapeW / PX);
  // shrink to fit the phone: real size when it fits, scaled down otherwise
  const avail = el.parentElement.clientWidth - 28, k = Math.min(1, avail / tapeW);
  el.className = 'tapefit'; el.style.width = `${tapeW * k}px`; el.style.height = `${tapeH * k}px`; t.style.transform = `scale(${k})`;
  const over = s.length && totalMm > s.length;
  $('#len').innerHTML = `≈ ${totalMm} mm (${(totalMm / 25.4).toFixed(1)}") long · ${s.tape} mm tape${over ? ' · <b style="color:var(--danger)">Change Length! text exceeds fixed length</b>' : s.length ? ' · 🔒 fixed length' : ''}${s.margin === 'Chain Print' ? ' · chain: 25 mm lead-in only on the first label' : ''}`;
  // recipe
  const r = [];
  if (s.tape < 12 && ((frame && frame.wide))) r.push(`Insert 12 mm tape. Frame ${frame.n} needs it (you have ${s.tape} mm).`); else r.push(`Insert ${s.tape} mm TZe tape (${TAPES[s.color][0].toLowerCase()}).`);
  r.push(`Type “${s.text1}”${lines.length === 2 ? ` → [Enter] → type “${s.text2}”` : ''}.`);
  if (s.font) r.push(`[Font] → {Font} → [OK] → [◀] / [▶] to {${font.name}} → [OK].`);
  if (s.size) r.push(`[Font] → {Size} → [OK] → {${d.sizes[s.size].name}} → [OK].`);
  if (s.width) r.push(`[Font] → {Width} → [OK] → {${d.widths[s.width].name}} → [OK].`);
  if (s.style) r.push(`[Font] → {Style} → [OK] → {${style}} → [OK].`);
  if (s.align !== 1) r.push(`[Font] → {Alignment} → [OK] → {${d.alignments[s.align].name}} → [OK].`);
  if (frame && frame.n !== 'off') r.push(`[Frame] → type ${String(frame.n).split('').map(x => `[${x}]`).join(' ')} → [OK].`);
  if (s.margin !== 'Full') r.push(`[Label] → {Margin} → [OK] → {${s.margin}} → [OK].`);
  if (s.length) r.push(`[Label] → {Label Length} → [OK] → [◀] / [▶] to ${s.length} mm → [OK].`);
  if (s.mirror) r.push(`[Shift] + [Print] → {Mirror} → [OK] → {Mirror Print?} → [OK]. Use clear tape.`);
  else r.push(`[Preview] to check, then [Print] → [OK]. Push the cutter after “Please Cut”.`);
  $('#recipe').innerHTML = r.map(x => `<li>${fmt(x)}</li>`).join('');
}

// ---------- install (PWA) ----------
// Android Chrome fires beforeinstallprompt after installability + engagement heuristics.
// iOS Safari has no beforeinstallprompt; Add to Home Screen is Share-sheet only.
// Capture the prompt immediately; only show the bar after a few distinct device screens.
// Explicit Install controls (home and device topbar icons) ignore the bar's 7-day snooze.
let deferredInstall = null;
const INSTALL_SCREENS = 3;
const INSTALL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.navigator.standalone === true;
}
function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function shouldShowInstallControls() {
  return !isStandaloneApp() && !store.get('install-done', false);
}
function installActionLabel() {
  return isIosDevice() ? 'Add to Home Screen' : 'Install';
}
function installIconSvg() {
  return `<svg class="install-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 4v11M8.5 11.5 12 15l3.5-3.5M6 19.5h12"/></svg>`;
}
function installIconButton() {
  if (!shouldShowInstallControls()) return '';
  const label = installActionLabel();
  return `<button class="iconbtn js-install" type="button" data-install="icon" aria-label="${esc(label)}" title="${esc(label)}" onclick="requestInstall()">${installIconSvg()}</button>`;
}
function hideInstallControls() {
  document.querySelectorAll('.js-install').forEach(el => { el.hidden = true; });
}
function syncInstallBarOffset() {
  const bar = document.getElementById('install-bar');
  const h = bar && !bar.hidden ? Math.round(bar.getBoundingClientRect().height) : 0;
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
  if (persist) {
    store.set('install-done', true);
    hideInstallControls();
  }
  syncInstallBarOffset();
}
function showInstallBar(kind) {
  if (isStandaloneApp() || store.get('install-done', false)) return;
  if (Date.now() < store.get('install-hide-until', 0)) return;
  let bar = document.getElementById('install-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'install-bar';
    bar.className = 'install-bar';
    document.body.prepend(bar);
  }
  if (kind === 'ios') {
    bar.innerHTML = `<p>Add Labelarium to your Home Screen to use it locally, even offline. Tap <b>Share</b>, then <b>Add to Home Screen</b>.</p>
      <button class="iconbtn" type="button" aria-label="Dismiss" onclick="dismissInstall()">×</button>`;
  } else {
    bar.innerHTML = `<p>Install Labelarium on your phone. Use it locally, even offline.</p>
      <button class="btn" type="button" onclick="acceptInstall()">Install</button>
      <button class="iconbtn" type="button" aria-label="Dismiss" onclick="dismissInstall()">×</button>`;
  }
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
  if (!store.get('install-ready', false)) return;
  if (deferredInstall) showInstallBar('chrome');
  else if (isIosDevice()) showInstallBar('ios');
}
function openInstallHelp(kind) {
  if (kind === 'ios') {
    openSheet(`<h2 class="t">Add to Home Screen</h2>
      <p>Add Labelarium to your Home Screen to use it locally, even offline.</p>
      <ol class="steps">
        <li>Tap <b>Share</b>.</li>
        <li>Tap <b>Add to Home Screen</b>.</li>
      </ol>`);
    return;
  }
  const body = window.isSecureContext
    ? `<p>This browser has not offered an install prompt.</p>
      <p class="small muted">Browse a few device screens and try again. Chrome and Edge can install over HTTPS. On iPhone, use Share, then Add to Home Screen.</p>`
    : `<p>Installing needs a secure context. Open this site over HTTPS, or on localhost.</p>`;
  openSheet(`<h2 class="t">Install</h2>${body}`);
}
window.dismissInstall = () => {
  hideInstallBar(false);
  store.set('install-hide-until', Date.now() + INSTALL_SNOOZE_MS);
};
window.acceptInstall = async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  try { await deferredInstall.userChoice; } catch {}
  deferredInstall = null;
  hideInstallBar(true);
};
window.requestInstall = async () => {
  if (isStandaloneApp() || store.get('install-done', false)) {
    hideInstallControls();
    return;
  }
  if (deferredInstall) {
    await acceptInstall();
    return;
  }
  openInstallHelp(isIosDevice() ? 'ios' : 'pending');
};
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  maybeShowInstallBar();
});
window.addEventListener('appinstalled', () => { deferredInstall = null; hideInstallBar(true); });
window.addEventListener('resize', syncInstallBarOffset);

// ---------- boot ----------
try { localStorage.removeItem('lab:theme'); } catch {}
migrateHash();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(console.warn);
render();
