#!/usr/bin/env node
// Pre-render one static HTML page per app route, with the page's real content in the HTML.
//
// Why: the app builds every page in JavaScript. Search engines queue JS rendering (so 100+ pages that
// all start as the same empty shell look thin and sit in "Discovered – currently not indexed"), and
// most AI crawlers do not run JavaScript at all. So each page ships:
//   - its own <title>, description, canonical, Open Graph and JSON-LD (from site/pack.js, the same
//     code the app uses, so the HTML and the rendered app never disagree), and
//   - its content as plain semantic HTML inside <main class="ssr"> (steps, error messages, symbols,
//     links to related pages). The app replaces it on load; with JS on it is hidden from first paint.
//
//   node scripts/prerender.mjs          write site/d/**, site/index.html (home content), sitemap.xml, llms.txt, llms-full.txt
//   node scripts/prerender.mjs --check  fail if the committed sitemap.xml / llms*.txt / index.html are stale (CI)
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const CHECK = process.argv.includes('--check');
const P = await import(pathToFileURL(join(SITE, 'pack.js')).href);
const { SITE: ORIGIN, seoMeta, pageJsonLd, deviceLabel, deviceTab, plain, clip, plural, packSummary, hasSection, SECTION_NAMES } = P;
const SECTIONS = Object.keys(SECTION_NAMES);

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Pack text → HTML: [Key] → <kbd>, {LCD text} → LCD chip (same markup language as the app).
const fmt = s => esc(s).replace(/\[([^\]]+)\]/g, '<kbd>$1</kbd>').replace(/\{([^}]+)\}/g, '<span class="lcd">$1</span>');
const md = s => String(s ?? '').replace(/\[([^\]]+)\]/g, '`$1`').replace(/\{([^}]+)\}/g, '“$1”');
const a = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const ol = items => `<ol>${items.map(x => `<li>${x}</li>`).join('')}</ol>`;
const ul = items => `<ul>${items.map(x => `<li>${x}</li>`).join('')}</ul>`;

const MAIN_RE = /(<main id="app" class="app">)[\s\S]*?(<\/main>)/;
const NOSCRIPT = '<noscript><p style="padding:24px;text-align:center">Labelarium works best with JavaScript on: search, the label preview and offline use need it.</p></noscript>';
const indexHtml = readFileSync(join(SITE, 'index.html'), 'utf8');
if (!MAIN_RE.test(indexHtml)) throw new Error('site/index.html lacks <main id="app" class="app">…</main>');
const template = indexHtml.replace(MAIN_RE, '$1$2'); // content-free shell, so re-running is idempotent
const devices = JSON.parse(readFileSync(join(SITE, 'devices', 'index.json'), 'utf8'));

function page({ path, title, desc, jsonld, image, imageAlt, noindex, body }) {
  const url = ORIGIN + path;
  let html = template;
  const swap = (re, repl, what) => { if (!re.test(html)) throw new Error(`template lacks ${what}`); html = html.replace(re, repl); };
  swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, '<title>');
  swap(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`, 'meta description');
  swap(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical');
  swap(/(<meta name="robots" content=")[^"]*(")/, `$1${noindex ? 'noindex, follow' : 'index, follow'}$2`, 'robots');
  swap(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`, 'og:url');
  swap(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`, 'og:title');
  swap(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`, 'og:description');
  swap(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`, 'twitter:title');
  swap(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`, 'twitter:description');
  if (image) { // per-device link-preview card (site/icons/og/<id>.png), so shared links show that printer
    const img = ORIGIN + image;
    swap(/(<meta property="og:image" content=")[^"]*(")/, `$1${img}$2`, 'og:image');
    swap(/(<meta property="og:image:secure_url" content=")[^"]*(")/, `$1${img}$2`, 'og:image:secure_url');
    swap(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${img}$2`, 'twitter:image');
    swap(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(imageAlt)}$2`, 'og:image:alt');
    swap(/(<meta name="twitter:image:alt" content=")[^"]*(")/, `$1${esc(imageAlt)}$2`, 'twitter:image:alt');
  }
  // JSON in a script element: escape "<" so text can never close the tag.
  swap(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/, `<script type="application/ld+json" id="jsonld">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>`, 'JSON-LD');
  html = html.replace(MAIN_RE, `$1<div class="ssr">${body}</div>${NOSCRIPT}$2`);
  return `<!-- Pre-rendered by scripts/prerender.mjs for ${path}; the app takes over on load. -->\n` + html;
}

// ---------- content ----------
function crumbs(list) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${list.map(([t, h], i) => i < list.length - 1 ? a(h, t) : `<span aria-current="page">${esc(t)}</span>`).join(' › ')}</nav>`;
}
function insertSteps(c) {
  return ['Press [Symbol].', `[◀] / [▶] to {${c.group}} → [OK].`, `Press [${c.key}] to jump to {${c.name}} (or [◀] / [▶] to it) → [OK].`, '[◀] / [▶] to the symbol number → [OK].'];
}
function deviceNav(d, here) {
  const links = SECTIONS.filter(s => hasSection(d, s) && s !== here).map(s => a(`/d/${d.id}/${s}`, `${deviceTab(d)} ${SECTION_NAMES[s].toLowerCase()}`));
  return `<h2>More on the ${esc(deviceTab(d))}</h2>${ul([a(`/d/${d.id}`, `${deviceTab(d)} guide`), ...links, a('/', 'All label makers')])}`;
}
function sectionBody(d, s, sub, meta) {
  const tab = deviceTab(d), label = deviceLabel(d), id = d.id;
  const head = (h1, lede) => crumbs([['Labelarium', '/'], [tab, `/d/${id}`], ...(s ? [[SECTION_NAMES[s], `/d/${id}/${s}`]] : []), ...(sub ? [[meta.crumb, meta.path]] : [])])
    + `<h1>${esc(h1)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}`;
  switch (s) {
    case undefined: {
      const sections = SECTIONS.filter(x => hasSection(d, x)).map(x => `${a(`/d/${id}/${x}`, SECTION_NAMES[x])}: ${esc(seoMeta(d, x).desc)}`);
      return head(label, `${d.tagline}. ${packSummary(d)}.`)
        + `<h2>In this guide</h2>${ul(sections)}`
        + (d.howto.length ? `<h2>Popular how-to guides</h2>${ul(d.howto.slice(0, 10).map(h => a(`/d/${id}/howto/${h.id}`, h.title)))}` : '')
        + (d.errors.length ? `<h2>Error messages</h2>${ul(d.errors.map(e => a(`/d/${id}/trouble/${e.slug}`, `“${plain(e.msg)}”`) + ` ${esc(clip(plain(e.cause), 100))}`))}` : '')
        + (d.tips.length ? `<h2>Quick tips</h2>${ol(d.tips.map(fmt))}` : '')
        + `<p>${a('/', 'All label makers')}</p>`;
    }
    case 'keyboard':
      return head(`${tab} keyboard map`, `Every key and indicator on the ${label}, numbered as on the diagram.`)
        + ol(d.keyboard.legend.map(([n, name, desc]) => `<b>${esc(n)}. ${esc(name)}</b>: ${fmt(desc)}`)) + deviceNav(d, s);
    case 'symbols': {
      if (sub === 'accented') {
        const acc = d.symbols.accented;
        return head(`${tab} accented letters`, '') + `<h2>How to type them</h2>${ol(acc.howto.map(fmt))}<h2>All variants</h2>${ul(Object.entries(acc.table).map(([k, v]) => `<b>${esc(k)}</b>: ${esc(v)}`))}` + deviceNav(d, null);
      }
      if (sub) {
        const c = d.symbols.categories.find(x => x.id === sub);
        const list = c.items.length ? ol(c.items.map(it => `${esc(it.name)}${it.ch ? ` (${esc(it.ch)})` : ''}`)) : `<p>${esc(c.chars)}</p>${c.charsNote ? `<p>${esc(c.charsNote)}</p>` : ''}`;
        const others = d.symbols.categories.filter(x => x !== c).map(x => a(`/d/${id}/symbols/${x.id}`, `${x.name} symbols`));
        return head(`${c.name} symbols on the ${tab}`, `${c.group} category, shortcut key ${c.key}. Numbers are the position on the device.`)
          + `<h2>How to insert</h2>${ol(insertSteps(c).map(fmt))}<h2>All ${esc(c.name)} symbols</h2>${list}<h2>Other symbol categories</h2>${ul(others)}` + deviceNav(d, null);
      }
      const groups = [...new Set(d.symbols.categories.map(c => c.group))];
      return head(`${tab} symbols`, `${P.countSymbols(d)} symbols in ${d.symbols.categories.length} categories.`)
        + `<h2>How to insert any symbol</h2>${ol(d.symbols.howto.map(fmt))}`
        + groups.map(g => `<h2>${esc(g)}</h2>${ul(d.symbols.categories.filter(c => c.group === g).map(c => `${a(`/d/${id}/symbols/${c.id}`, `${c.name} symbols`)} (${c.items.length || (c.chars || '').split(' ').length}): ${esc(c.items.slice(0, 6).map(i => i.name).join(', ') || c.chars || '')}`))}`).join('')
        + (Object.keys(d.symbols.accented.table || {}).length ? `<p>${a(`/d/${id}/symbols/accented`, 'Accented letters (á, ç, ñ, ö…)')}</p>` : '') + deviceNav(d, s);
    }
    case 'frames':
      return head(`${tab} frames`, `${d.frames.items.filter(f => f.n !== 'off').length} frames, numbered as on the device.`)
        + `<h2>How to apply a frame</h2>${ol(d.frames.howto.map(fmt))}${d.frames.notes.length ? ul(d.frames.notes.map(fmt)) : ''}`
        + `<h2>All frames</h2>${ul(d.frames.items.filter(f => f.n !== 'off').map(f => `Frame ${esc(f.n)}: ${esc(f.name)}${f.wide ? ' (12 mm tape only)' : ''}`))}` + deviceNav(d, s);
    case 'templates': {
      const block = (t, how, items) => items.length ? `<h2>${t}</h2>${ol(how.map(fmt))}${ul(items.map(x => `<b>${String(x.n).padStart(2, '0')} ${esc(x.name)}</b>: ${esc(x.desc)}`))}` : '';
      return head(`${tab} templates`, '') + ul(d.templates.notes.map(fmt))
        + block('Text label templates', d.templates.textHowto, d.templates.text) + block('Pattern label templates', d.templates.patternHowto, d.templates.pattern) + deviceNav(d, s);
    }
    case 'fonts': {
      const list = (t, arr) => arr.length ? `<h2>${t}</h2>${ol(arr.map(f => `<b>${esc(f.name)}</b>${f.desc ? `: ${esc(f.desc)}` : ''}`))}` : '';
      return head(`${tab} fonts & styles`, plain(d.fontNote || ''))
        + list('Fonts', d.fonts) + list('Sizes', d.sizes) + list('Widths', d.widths) + list('Styles', d.styles) + list('Alignment', d.alignments) + deviceNav(d, s);
    }
    case 'shortcuts':
      return head(`${tab} shortcuts`, 'Key combinations and hidden tricks.') + `<dl>${d.shortcuts.map(x => `<dt>${fmt(x.keys)}</dt><dd>${esc(x.action)}</dd>`).join('')}</dl>` + deviceNav(d, s);
    case 'howto': {
      if (sub) {
        const h = d.howto.find(x => x.id === sub);
        const at = d.howto.indexOf(h);
        const more = [...d.howto.slice(at + 1), ...d.howto.slice(0, at)].slice(0, 8);
        return head(`${plain(h.title)} on the ${tab}`, '') + `<h2>Step by step</h2>${ol(h.steps.map(fmt))}${h.notes ? `<h2>Notes</h2>${ul(h.notes.map(fmt))}` : ''}`
          + `<h2>More ${esc(tab)} guides</h2>${ul(more.map(x => a(`/d/${id}/howto/${x.id}`, x.title)))}<p>${a(`/d/${id}/howto`, `All ${d.howto.length} guides`)}</p>` + deviceNav(d, null);
      }
      return head(`${tab} how-to guides`, `${plural(d.howto.length, 'step-by-step guide')}.`)
        + ul(d.howto.map(h => `${a(`/d/${id}/howto/${h.id}`, h.title)}: ${esc(clip(plain(h.steps.join(' ')), 140))}`)) + deviceNav(d, s);
    }
    case 'trouble': {
      const errItem = e => `${a(`/d/${id}/trouble/${e.slug}`, `“${plain(e.msg)}”`)}: ${esc(e.cause)} <b>Fix:</b> ${fmt(e.fix)}`;
      const probItem = p => `${a(`/d/${id}/trouble/${p.slug}`, plain(p.problem))}: ${fmt(p.fix)}`;
      if (sub) {
        const t = d.trouble.find(x => x.slug === sub);
        const others = (t.kind === 'error' ? d.errors : d.problems).filter(x => x !== t);
        const main = t.kind === 'error'
          ? head(`${tab} “${plain(t.msg)}” error`, '') + `<h2>What it means</h2><p>${fmt(t.cause)}</p><h2>How to fix it</h2><p>${fmt(t.fix)}</p>`
          : head(`${tab}: ${plain(t.problem)}`, '') + `<h2>How to fix it</h2><p>${fmt(t.fix)}</p>`;
        return main + (others.length ? `<h2>${t.kind === 'error' ? 'Other error messages' : 'Other problems'}</h2>${ul(others.map(x => a(`/d/${id}/trouble/${x.slug}`, x.kind === 'error' ? `“${plain(x.msg)}”` : plain(x.problem))))}` : '')
          + `<p>${a(`/d/${id}/trouble`, `All ${tab} troubleshooting`)}</p>` + deviceNav(d, null);
      }
      return head(`${tab} troubleshooting`, `${plural(d.errors.length, 'LCD error message')} and ${plural(d.problems.length, 'common problem')}, with causes and fixes.`)
        + (d.errors.length ? `<h2>Error messages on the LCD</h2>${ul(d.errors.map(errItem))}` : '')
        + (d.problems.length ? `<h2>What to do when…</h2>${ul(d.problems.map(probItem))}` : '') + deviceNav(d, s);
    }
    case 'preview':
      return head(`${tab} label designer`, `Design a label for the ${label} and get the exact key presses to print it.`)
        + `<p>Choose text (one or two lines), tape width and colour, font, size, style, frame, margins and length. Labelarium previews the label and writes the step-by-step recipe for the device. Supported tapes: ${esc(d.tapes.map(t => `${t.mm} mm (${t.in})`).join(', '))}.</p>` + deviceNav(d, s);
    case 'specs':
      return head(`${tab} specs & tapes`, '') + `<dl>${d.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`
        + `<h2>Tape widths</h2>${ul(d.tapes.map(t => `<b>${esc(t.mm)} mm (${esc(t.in)})</b>, ${plural(t.lines, 'line')}: ${esc(t.note)}`))}`
        + (d.links.length ? `<h2>Official links</h2>${ul(d.links.map(([t, u]) => `<a href="${esc(u)}" rel="noopener">${esc(t)}</a>`))}` : '') + deviceNav(d, s);
  }
  return '';
}

// ---------- routes ----------
const packs = [];
for (const dev of devices) {
  if (!/^[a-z0-9-]+$/.test(dev.id)) throw new Error(`unsafe device id ${dev.id}`);
  const raw = (await import(pathToFileURL(join(SITE, dev.data)).href)).default;
  packs.push(P.normalize(raw, dev.data.slice(0, dev.data.lastIndexOf('/') + 1)));
}
const routes = [];
for (const d of packs) {
  const og = existsSync(join(SITE, 'icons', 'og', `${d.id}.png`)) ? { image: `/icons/og/${d.id}.png`, imageAlt: `${deviceLabel(d)} on Labelarium` } : {};
  const add = (s, rest, noindex) => {
    const meta = seoMeta(d, s, rest);
    if (!meta) throw new Error(`no page meta for ${d.id} ${s} ${rest}`);
    routes.push({ ...og, ...meta, noindex, jsonld: pageJsonLd(d, s, rest, meta), body: sectionBody(d, s, rest[0], meta) });
  };
  add(undefined, []);
  // Sections a pack has no content for still answer (old links keep working) but stay out of the index.
  for (const s of SECTIONS) add(s, [], !hasSection(d, s));
  d.symbols.categories.forEach(c => add('symbols', [c.id]));
  if (Object.keys(d.symbols.accented.table || {}).length) add('symbols', ['accented']);
  d.howto.forEach(h => add('howto', [h.id]));
  d.trouble.forEach(t => add('trouble', [t.slug]));
}

// ---------- home ----------
const homeBody = `<h1>Labelarium</h1><p class="lede">The label maker companion: every symbol, frame, template and shortcut of your label maker, searchable, with pictures and the exact key presses. Free, no account, works offline.</p>`
  + `<h2>Label makers</h2>${ul(packs.map(d => `${a(`/d/${d.id}`, deviceLabel(d))}: ${esc(d.tagline)}. ${esc(packSummary(d))}.`))}`
  + `<h2>Popular guides</h2>${ul(packs.flatMap(d => d.howto.slice(0, 2).map(h => a(`/d/${d.id}/howto/${h.id}`, `${deviceTab(d)}: ${plain(h.title)}`))))}`
  + `<h2>Error messages, explained</h2>${ul(packs.filter(d => d.errors.length).map(d => a(`/d/${d.id}/trouble`, `${deviceTab(d)} error messages and fixes`)))}`;
const homeHtml = indexHtml.replace(MAIN_RE, `$1<div class="ssr">${homeBody}</div>${NOSCRIPT}$2`);

// ---------- sitemap + llms.txt (generated, committed, verified in CI) ----------
const indexed = ['/', ...routes.filter(r => !r.noindex).map(r => r.path)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/prerender.mjs: every indexable page, canonical paths only. Do not edit by hand. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexed.map(p => `  <url><loc>${ORIGIN}${p === '/' ? '/' : p}</loc></url>`).join('\n')}
</urlset>
`;
const llms = `# Labelarium

> Labelarium is a free, unofficial companion for label makers (Brother P-touch, DYMO, NIIMBOT, Brady, Phomemo). For each model it documents every built-in symbol, frame and template with pictures and the exact key presses, plus step-by-step how-to guides, keyboard maps, shortcuts, specs, and every LCD error message with its cause and fix. It works offline as an installable web app. Not affiliated with any manufacturer.

The full text of every guide and error message is in [llms-full.txt](${ORIGIN}/llms-full.txt).

## Label makers
${packs.map(d => `- [${deviceLabel(d)}](${ORIGIN}/d/${d.id}): ${d.tagline}. ${packSummary(d)}.`).join('\n')}

${packs.map(d => `## ${deviceLabel(d)}
${SECTIONS.filter(s => hasSection(d, s)).map(s => { const m = seoMeta(d, s); return `- [${SECTION_NAMES[s]}](${ORIGIN}${m.path}): ${m.desc}`; }).join('\n')}`).join('\n\n')}

## Optional
- [Privacy](${ORIGIN}/privacy.html)
- [Source code](https://github.com/jatinkrmalik/labelarium)
`;
const llmsFull = `# Labelarium: full reference

Unofficial reference for label makers. Key names are in \`backticks\`; text shown on the device's screen is in “quotes”. Source: ${ORIGIN}

${packs.map(d => {
  const tab = deviceTab(d);
  return `## ${deviceLabel(d)}
${d.tagline}. ${packSummary(d)}. Page: ${ORIGIN}/d/${d.id}

${d.howto.length ? `### How-to guides\n\n${d.howto.map(h => `#### ${plain(h.title)} (${tab})\n${ORIGIN}/d/${d.id}/howto/${h.id}\n\n${h.steps.map((x, i) => `${i + 1}. ${md(x)}`).join('\n')}${h.notes ? '\n\n' + h.notes.map(n => `Note: ${md(n)}`).join('\n') : ''}`).join('\n\n')}\n` : ''}
${d.errors.length ? `### Error messages\n\n${d.errors.map(e => `#### “${plain(e.msg)}” (${tab})\n${ORIGIN}/d/${d.id}/trouble/${e.slug}\n\nMeaning: ${md(e.cause)}\nFix: ${md(e.fix)}`).join('\n\n')}\n` : ''}
${d.problems.length ? `### Problems and fixes\n\n${d.problems.map(p => `#### ${plain(p.problem)} (${tab})\n${ORIGIN}/d/${d.id}/trouble/${p.slug}\n\n${md(p.fix)}`).join('\n\n')}\n` : ''}
${d.shortcuts.length ? `### Shortcuts\n\n${d.shortcuts.map(x => `- ${md(x.keys)}: ${md(x.action)}`).join('\n')}\n` : ''}
### Specs\n\n${d.specs.map(([k, v]) => `- ${k}: ${md(v)}`).join('\n')}
`;
}).join('\n')}`;

// ---------- write or check ----------
const generated = { 'sitemap.xml': sitemap, 'llms.txt': llms, 'llms-full.txt': llmsFull, 'index.html': homeHtml };
const nl = s => s.replace(/\r\n/g, '\n');
if (CHECK) {
  const stale = Object.entries(generated).filter(([f, txt]) => !existsSync(join(SITE, f)) || nl(readFileSync(join(SITE, f), 'utf8')) !== nl(txt)).map(([f]) => f);
  if (stale.length) { console.error(`stale generated file(s): ${stale.join(', ')}. Run: node scripts/prerender.mjs, then commit.`); process.exit(1); }
  console.log(`ok: ${routes.length} routes, ${indexed.length} sitemap URLs, llms.txt, llms-full.txt and home content are up to date`);
  process.exit(0);
}
for (const [f, txt] of Object.entries(generated)) writeFileSync(join(SITE, f), txt);
const out = join(SITE, 'd');
if (existsSync(out)) rmSync(out, { recursive: true });
let files = 0;
for (const r of routes) {
  const html = page(r);
  const rel = r.path.replace(/^\//, '');
  for (const target of [`${rel}.html`, `${rel}/index.html`]) { // /d/x → d/x.html; /d/x/ → d/x/index.html
    const file = join(SITE, target); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, html); files++;
  }
}
console.log(`pre-rendered ${routes.length} routes → ${files} files under site/d/; sitemap ${indexed.length} URLs; llms.txt, llms-full.txt, home content`);
