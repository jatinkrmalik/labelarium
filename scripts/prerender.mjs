#!/usr/bin/env node
// Pre-render one static HTML page per app route so GitHub Pages answers deep links with 200
// (and real <title>/<meta> tags) instead of the 404.html fallback. The page body is still the
// app shell; app.js takes over on load exactly as before.
//
//   node scripts/prerender.mjs          write site/d/<id>[.html|/index.html] and site/d/<id>/<section>[.html|/index.html]
//   node scripts/prerender.mjs --check  only verify that every sitemap URL would be covered (CI)
//
// Routes come from site/devices/index.json × SECTIONS below. The script fails if site/sitemap.xml
// lists a path this list does not produce, so the two cannot drift apart silently.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const ORIGIN = 'https://labelarium.com';
const CHECK = process.argv.includes('--check');

// Mirrors SECTIONS in site/app.js (ids + names). Descriptions are static because the page is
// rendered before any device data is loaded in the browser.
const SECTIONS = [
  ['keyboard', 'Keyboard map', d => `Where every key on the ${d} is and what it does: LCD indicators, menu keys and shortcuts.`],
  ['symbols', 'Symbols', d => `All built-in symbols and pictograms on the ${d}, by category, with pictures, positions and the exact key presses to insert them.`],
  ['frames', 'Frames', d => `Every frame design on the ${d} with its number, a picture and its tape-width limits.`],
  ['templates', 'Templates', d => `Built-in text and pattern label templates on the ${d}, with pictures and steps.`],
  ['fonts', 'Fonts & styles', d => `Fonts, sizes, widths, styles and alignment on the ${d}, with printed samples.`],
  ['shortcuts', 'Shortcuts', d => `Key combinations and hidden tricks on the ${d}.`],
  ['howto', 'How-to guides', d => `Step-by-step guides for the ${d}: margins, chain print, numbering, mirror, saving labels and more.`],
  ['trouble', 'Troubleshooting', d => `Every LCD error message on the ${d}, what causes it and how to fix it.`],
  ['preview', 'Label preview', d => `Design a label for the ${d} and get the exact key presses to make it on the device.`],
  ['specs', 'Specs & tapes', d => `Tape widths, limits and specifications for the ${d}.`],
];

const template = readFileSync(join(SITE, 'index.html'), 'utf8');
const devices = JSON.parse(readFileSync(join(SITE, 'devices', 'index.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function page({ path, title, desc, crumbs }) {
  const url = ORIGIN + path;
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ORIGIN + p })),
  });
  let html = template;
  const swap = (re, repl, what) => { if (!re.test(html)) throw new Error(`template lacks ${what}`); html = html.replace(re, repl); };
  swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, '<title>');
  swap(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`, 'meta description');
  swap(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical');
  swap(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`, 'og:url');
  swap(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`, 'og:title');
  swap(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`, 'og:description');
  swap(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`, 'twitter:title');
  swap(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`, 'twitter:description');
  swap(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/, `<script type="application/ld+json" id="jsonld">${jsonld}</script>`, 'JSON-LD');
  return `<!-- Pre-rendered by scripts/prerender.mjs for ${path}; the app takes over on load. -->\n` + html;
}

const routes = [];
for (const dev of devices) {
  if (!/^[a-z0-9-]+$/.test(dev.id)) throw new Error(`unsafe device id ${dev.id}`);
  const name = `${dev.brand} ${dev.model}`;
  const home = `/d/${dev.id}`;
  routes.push({ path: home, title: `${name} · Labelarium`, crumbs: [['Labelarium', '/'], [name, home]],
    desc: `${name}${dev.tagline ? ` (${dev.tagline})` : ''}: every symbol, frame, template and shortcut, searchable with pictures, plus a label previewer that writes the key presses. Works offline.` });
  for (const [id, label, describe] of SECTIONS) {
    routes.push({ path: `${home}/${id}`, title: `${label} · ${name} · Labelarium`, desc: describe(name), crumbs: [['Labelarium', '/'], [name, home], [label, `${home}/${id}`]] });
  }
}

// Every sitemap path (ignoring query strings) must be either "/" or a route we render.
const sitemap = readFileSync(join(SITE, 'sitemap.xml'), 'utf8');
const wanted = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname.replace(/\/+$/, '') || '/');
const have = new Set(routes.map(r => r.path));
const missing = [...new Set(wanted)].filter(p => p !== '/' && !have.has(p));
if (missing.length) { console.error(`sitemap lists ${missing.length} path(s) with no pre-rendered page:\n  ${missing.join('\n  ')}`); process.exit(1); }

if (CHECK) { console.log(`ok: ${routes.length} routes would be rendered; all ${wanted.length} sitemap URLs covered`); process.exit(0); }

const out = join(SITE, 'd');
if (existsSync(out)) rmSync(out, { recursive: true });
let files = 0;
for (const r of routes) {
  const html = page(r);
  const rel = r.path.replace(/^\//, '');
  for (const target of [`${rel}.html`, `${rel}/index.html`]) {      // /d/x → d/x.html; /d/x/ → d/x/index.html
    const file = join(SITE, target); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, html); files++;
  }
}
console.log(`pre-rendered ${routes.length} routes → ${files} files under site/d/ (${devices.length} devices × ${1 + SECTIONS.length} pages)`);
