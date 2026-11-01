// Labelarium. Copyright (C) 2026 the Labelarium authors. Licensed under the GNU AGPL v3.0 or later; see LICENSE.
// Shared by the app (site/app.js) and the build (scripts/prerender.mjs): pack normalisation, slugs,
// and every page's title, description, canonical path and structured data. One source, so the HTML
// crawlers read and the page the app renders always agree.
export const SITE = 'https://labelarium.com';
export const OG_IMAGE = SITE + '/icons/og.png';

export const pad2 = n => String(n).padStart(2, '0');
export const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// "No/Invalid Cartridge" → "no-invalid-cartridge"; long sentences keep their first words.
export function slugify(s, max = 60) {
  let out = norm(s).replace(/[“”"'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (out.length > max) out = out.slice(0, max).replace(/-[^-]*$/, '');
  return out || 'item';
}
// Pack text uses [Key] for keycaps and {LCD} for screen text; this is the plain reading of it.
export const plain = s => String(s ?? '').replace(/\[([^\]]+)\]/g, '$1').replace(/\{([^}]+)\}/g, '“$1”').replace(/\s+/g, ' ').trim();
export function clip(s, n = 158) {
  s = plain(s);
  if (s.length <= n) return s;
  return s.slice(0, n - 1).replace(/[\s,;:.–—-]+\S*$/, '') + '…';
}
export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

export function deviceLabel(dev) {
  const brand = dev.brand || '', name = dev.name || '';
  if (!brand) return name;
  const n = name.toLowerCase(), b = brand.toLowerCase();
  if (n === b || n.startsWith(b + ' ')) return name;
  return `${brand} ${name}`;
}
export function deviceTab(dev) {
  const brand = dev.brand || '';
  const model = dev.model || dev.name || '';
  if (!brand) return model;
  if (!model) return brand;
  const m = model.toLowerCase(), b = brand.toLowerCase();
  if (m === b || m.startsWith(b + ' ')) return model;
  return `${brand} ${model}`;
}

// Expand compact arrays into objects and build the search index.
export function normalize(d, base) {
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
  // Every LCD message and problem gets its own page: /d/<id>/trouble/<slug>. Slugs are unique per pack.
  const seen = new Set();
  const take = s => { let x = slugify(s), k = 2; while (seen.has(x)) x = `${slugify(s)}-${k++}`; seen.add(x); return x; };
  d.errors.forEach(e => { e.slug = take(e.msg); e.kind = 'error'; });
  d.problems.forEach(p => { p.slug = take(p.problem); p.kind = 'problem'; });
  d.trouble = [...d.errors, ...d.problems];

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

export function countSymbols(d) {
  return d.symbols.categories.reduce((n, c) => n + (c.items.length || (c.charsNote ? 99 : (c.chars ? c.chars.split(' ').length : 0))), 0);
}
export function packSummary(d) {
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

// Sections a pack actually has content for (no "0 templates" pages, tiles or links).
export const HAS = {
  keyboard: d => d.keyboard.legend.length > 0,
  symbols: d => d.symbols.categories.length > 0,
  frames: d => d.frames.items.some(f => f.n !== 'off'),
  templates: d => d.templates.text.length + d.templates.pattern.length > 0,
  shortcuts: d => d.shortcuts.length > 0,
  howto: d => d.howto.length > 0,
  trouble: d => d.errors.length + d.problems.length > 0,
};
export const SECTION_NAMES = { preview: 'Label preview', keyboard: 'Keyboard map', symbols: 'Symbols', frames: 'Frames', templates: 'Templates', fonts: 'Fonts & styles', shortcuts: 'Shortcuts', howto: 'How-to guides', trouble: 'Troubleshooting', specs: 'Specs & tapes' };
export const hasSection = (d, id) => !HAS[id] || HAS[id](d);

const BRAND = ' · Labelarium';
const unofficial = d => `Unofficial, not affiliated with ${d.brand}.`;
// The few short messages that make a troubleshooting title match what people search for.
function topMessages(d, max = 46) {
  const out = [];
  for (const e of d.errors) {
    const m = plain(e.msg);
    if (m.length > 26 || /^error$/i.test(m)) continue;
    if ((out.join(', ') + ', ' + m).length > max) break;
    out.push(m);
  }
  return out;
}

// Title, description and canonical path for one page. null when the page doesn't exist.
// section: undefined/'home' | a SECTION id; rest: [topic | category | trouble slug].
// Long titles drop the brand suffix so the part people searched for isn't cut off in results.
export function seoMeta(d, section, rest = []) {
  const m = baseMeta(d, section, rest);
  if (m && m.title.length > 70 && m.title.endsWith(BRAND)) m.title = m.title.slice(0, -BRAND.length);
  return m;
}
function baseMeta(d, section, rest = []) {
  const label = deviceLabel(d), tab = deviceTab(d), id = d.id, sub = rest[0];
  const P = s => `/d/${id}${s ? '/' + s : ''}`;
  if (!section || section === 'home') {
    const sum = packSummary(d);
    if (id === 'brady-m210') return { path: P(), title: 'Brady M210 manual (unofficial): how-tos, errors & symbols' + BRAND,
      desc: clip(`Searchable, unofficial Brady M210 manual: ${sum}, plus every LCD error message with its fix. ${unofficial(d)}`) };
    const has = ['symbols', 'frames', 'howto', 'trouble'].filter(s => hasSection(d, s)).map(s => ({ symbols: 'symbols', frames: 'frames', howto: 'how-tos', trouble: 'error fixes' })[s]);
    const feats = has.slice(0, 3).join(', ').replace(/, ([^,]*)$/, ' & $1');
    return { path: P(), title: `${tab} manual & guide${feats ? ': ' + feats : ''}` + BRAND,
      desc: clip(`${label}: ${d.tagline}. ${sum ? sum + '. ' : ''}Searchable, with pictures and the exact key presses. Works offline.`) };
  }
  if (!hasSection(d, section) && !SECTION_NAMES[section]) return null;
  switch (section) {
    case 'keyboard':
      return { path: P('keyboard'), title: `${tab} keyboard map: what every key does` + BRAND,
        desc: clip(`Every key and LCD indicator on the ${label}, numbered on a diagram: ${d.keyboard.legend.slice(0, 6).map(([, n]) => plain(n)).join(', ')} and more.`) };
    case 'symbols': {
      if (sub === 'accented') return { crumb: 'Accented letters', path: P('symbols/accented'), title: `${tab} accented letters (á, ç, ñ, ö…)` + BRAND,
        desc: clip(`How to type accented letters on the ${label} with the Accent key, with the full table of variants.`) };
      if (sub) {
        const c = d.symbols.categories.find(x => x.id === sub);
        if (!c) return null;
        const n = c.items.length || (c.chars ? c.chars.split(' ').length : 0);
        const names = c.items.slice(0, 5).map(i => plain(i.name).replace(/\s*\(.*\)$/, '')).join(', ');
        return { crumb: c.name, path: P('symbols/' + c.id), title: `${c.name} symbols on the ${tab} (${n})` + BRAND,
          desc: clip(`All ${n} ${c.name} symbols on the ${label}${names ? ': ' + names + '…' : ''} With pictures, positions and the key presses to insert each one.`) };
      }
      const nCat = d.symbols.categories.length, nSym = countSymbols(d);
      return { path: P('symbols'), title: `${tab} symbols list: all ${nSym} with key presses` + BRAND,
        desc: clip(`Every symbol on the ${label}: ${nSym} in ${nCat} categories (${d.symbols.categories.slice(0, 5).map(c => c.name).join(', ')}…), with pictures and how to insert them.`) };
    }
    case 'frames': {
      const n = d.frames.items.filter(f => f.n !== 'off').length;
      return { path: P('frames'), title: `${tab} frames: all ${n} designs by number` + BRAND,
        desc: clip(`Every frame on the ${label}, pictured and numbered as on the device, with the tape widths each one needs and how to apply it.`) };
    }
    case 'templates': {
      const nT = d.templates.text.length, nP = d.templates.pattern.length;
      return { path: P('templates'), title: `${tab} label templates (${nT + nP})` + BRAND,
        desc: clip(`Built-in templates on the ${label}: ${nT} text and ${nP} pattern designs, pictured, with step-by-step instructions.`) };
    }
    case 'fonts':
      return { path: P('fonts'), title: `${tab} fonts, sizes & text styles` + BRAND,
        desc: clip(d.fonts.length > 1 ? `All ${d.fonts.length} fonts and ${d.styles.length} styles on the ${label}, plus size, width and alignment, with printed samples.` : `Type settings on the ${label}: ${plain(d.fontNote || '').split('.')[0]}.`) };
    case 'shortcuts':
      return { path: P('shortcuts'), title: `${tab} shortcuts & hidden key combos` + BRAND,
        desc: clip(`${d.shortcuts.length} key combinations on the ${label}: ${d.shortcuts.slice(0, 4).map(s => plain(s.action)).join(', ')} and more.`) };
    case 'howto': {
      if (sub) {
        const h = d.howto.find(x => x.id === sub);
        if (!h) return null;
        return { crumb: plain(h.title), path: P('howto/' + h.id), title: `${plain(h.title)}: ${tab} how-to` + BRAND,
          desc: clip(`${plain(h.title)} on the ${label}, step by step: ${h.steps.map(plain).join(' ')}`) };
      }
      return { path: P('howto'), title: `${tab} how-to guides (${d.howto.length} step-by-step)` + BRAND,
        desc: clip(`${id === 'brady-m210' ? unofficial(d) + ' ' : ''}Step-by-step ${label} guides: ${d.howto.slice(0, 5).map(h => plain(h.title)).join('; ')}…`) };
    }
    case 'trouble': {
      if (sub) {
        const t = d.trouble.find(x => x.slug === sub);
        if (!t) return null;
        if (t.kind === 'error') return { crumb: plain(t.msg), path: P('trouble/' + t.slug), title: `${tab} “${plain(t.msg)}” error: cause & fix` + BRAND,
          desc: clip(`What “${plain(t.msg)}” means on the ${label}: ${plain(t.cause)} How to fix it: ${plain(t.fix)}`) };
        return { crumb: plain(t.problem), path: P('trouble/' + t.slug), title: `${tab}: ${plain(t.problem)} (fix)` + BRAND,
          desc: clip(`${plain(t.problem)} on the ${label}? ${plain(t.fix)}`) };
      }
      const top = topMessages(d);
      return { path: P('trouble'), title: `${tab} error messages & fixes${top.length ? ': ' + top.join(', ') : ''}` + BRAND,
        desc: clip(`${id === 'brady-m210' ? unofficial(d) + ' ' : ''}Every ${label} LCD error message (${d.errors.slice(0, 6).map(e => plain(e.msg)).join(', ')}) and ${plural(d.problems.length, 'common problem')}, with causes and fixes.`) };
    }
    case 'preview':
      return { path: P('preview'), title: `${tab} label designer: get the key presses` + BRAND,
        desc: clip(`Design a label for the ${label} (text, tape, font, frame, margins) and get the exact step-by-step key presses to print it.`) };
    case 'specs':
      return { path: P('specs'), title: `${tab} specs, tape sizes & compatible tapes` + BRAND,
        desc: clip(`${label} specifications: ${d.tapes.map(t => t.mm + ' mm').join(', ')} tapes, ${d.specs.slice(0, 2).map(([k, v]) => k.toLowerCase() + ' ' + plain(v)).join('; ')}`) };
  }
  return null;
}

// Structured data for one page: WebPage + BreadcrumbList, plus HowTo / FAQPage where the content is that.
export function pageJsonLd(d, section, rest, meta) {
  const url = SITE + meta.path, label = deviceLabel(d), tab = deviceTab(d);
  const crumbs = [['Labelarium', '/'], [tab, `/d/${d.id}`]];
  const sub = rest && rest[0];
  if (section && section !== 'home') {
    crumbs.push([SECTION_NAMES[section] || section, `/d/${d.id}/${section}`]);
    if (sub) crumbs.push([meta.crumb || sub, meta.path]);
  }
  const graph = [
    { '@type': 'WebPage', '@id': url, url, name: meta.title, description: meta.desc, inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', '@id': SITE + '/#website', name: 'Labelarium', url: SITE + '/' },
      about: { '@type': 'Thing', name: label },
      image: `${SITE}/icons/og/${d.id}.png`, breadcrumb: { '@id': url + '#breadcrumb' } },
    { '@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
      itemListElement: crumbs.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + p })) },
  ];
  if (section === 'howto' && sub) {
    const h = d.howto.find(x => x.id === sub);
    if (h) graph.push({ '@type': 'HowTo', name: `${plain(h.title)} on the ${label}`, step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: plain(s) })) });
  }
  if (section === 'trouble') {
    const qa = t => ({ '@type': 'Question', name: t.kind === 'error' ? `What does “${plain(t.msg)}” mean on the ${label}?` : `${plain(t.problem)}: what should I do on the ${label}?`,
      acceptedAnswer: { '@type': 'Answer', text: t.kind === 'error' ? `${plain(t.cause)} Fix: ${plain(t.fix)}` : plain(t.fix) } });
    const list = sub ? d.trouble.filter(x => x.slug === sub) : d.trouble;
    if (list.length) graph.push({ '@type': 'FAQPage', mainEntity: list.map(qa) });
  }
  // No Product markup: Google flags Product without offers/reviews, and this site must not invent those.
  return { '@context': 'https://schema.org', '@graph': graph };
}
