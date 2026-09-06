# Product

<!-- impeccable:product-schema 1 -->

<!--
  Interview substitution: AskUserQuestion was unavailable in this unattended
  session (one probe, no channel). Facts below are from the task brief and the
  repository (README.md, app.js, style.css, devices/, manifest.webmanifest,
  TRADEMARK.md, LICENSE). Items marked (inferred) were not confirmed live.
-->

## Platform

web

## Stack

Static HTML, CSS, and vanilla JS. Zero npm, no build step, no Node toolchain. Progressive web app (`manifest.webmanifest`, `sw.js`). Hash router in `app.js`. Served as a folder of static files (GitHub Pages, Netlify, Cloudflare Pages, or `python3 -m http.server`).

## Users

Primary users are people who own a handheld label maker and need to find a symbol, frame, template, font, shortcut, or error message without flipping the paper insertion sheet. They use the app at a desk, in a garage, kitchen, or shop, often with the printer in the other hand. Offline use after "Save offline" is expected. (inferred from brief + README)

Other audiences: pack contributors who add another model from an official manual (`CONTRIBUTING.md`). Not a design audience for the UI itself.

## Product Purpose

Labelarium is a searchable, pictured catalog of what a specific label maker can print and which keys produce it. Success is: the owner finds the glyph or setting, sees the official crop, and can press the recipe on the device without the paper guide. (inferred)

## Positioning

A per-model official catalog with pictures plus key-press recipes, searchable and installable offline. Neighboring products (manufacturer PDFs, generic symbol lists, companion apps that design labels but do not map every on-device menu) cannot truthfully copy that combination. (inferred from brief + README)

## Operating Context

- Hash routes: `#/` home, `#/d/<id>` device home/search, `#/d/<id>/<section>` for keyboard, symbols, frames, templates, fonts, shortcuts, howto, trouble, preview, specs.
- Ten packs in `devices/index.json` (Brother, DYMO, NIIMBOT, Brady, Phomemo). Deepest coverage is Brother PT-D220 and PT-D210.
- Search is AND-scored over names and keywords, with prefix and edit-distance-1 fuzz. Results group by type.
- Pin (favorites) and saved labels live in `localStorage` under `lab:` keys. Theme storage is actively cleared; light only.
- "Save offline" precaches that model's images through the service worker (HTTPS or localhost).
- Label preview approximates tape, then writes the key-press recipe. Steps tick off on tap. Preview fonts are web look-alikes, not printer fonts.
- Install as a PWA (iOS Add to Home Screen, Android Install app). Phone: bottom tab bar. From 900 px: left rail.
- Device imagery under `devices/*/img` is reproduced from each manufacturer's user guide (or support pages) for reference.

## Capabilities and Constraints

Capabilities (from `app.js` and README):

- Catalog: symbols (categories, pictographs, accented table), frames, templates, fonts/sizes/widths/styles/alignment, shortcuts, keyboard map, how-to, LCD errors, problems, specs/tapes, label preview with recipes.
- Home: brand filter chips, square device tiles, pin to home.
- Per-device search, glyph/frame/template sheets, zoom for keyboard and manual crops.
- Offline save per device; shell network-first, images cache-first (`sw.js`, version `labelarium-v22` at time of writing).

Constraints (binding):

- AGPL-3.0-or-later for code. Name and marks are not under the AGPL (`TRADEMARK.md`).
- Zero npm. No bundler, no framework migration, no `package.json`.
- Do not invent features or rewrite device data. Catalog accuracy follows `devices/index.json` and each pack. Do not invent symbols or frames.
- Preserve fonts under `fonts/` (Bodoni Moda + Jost, SIL OFL) and the eleven geometric section marks.
- Warm opium-tinted paper and ink only. Light theme only. No dark mode.
- Human copy: no em dashes, no AI slop. Accurate to devices and packs.
- Service worker version bumps only when shell assets change; precache list must match.
- Out of scope for this product record: OG/SEO work, merging to main, Node toolchain.

Undecided (not confirmed): paid hosting, analytics, accounts, i18n beyond English UI, a formal WCAG target.

## Brand Commitments

- Name: Labelarium. Marks: the red circle, blue square and yellow triangle set, and the tape-strip icon (`TRADEMARK.md`). Forks must rename.
- Voice: short, factual, device-accurate. Manual tone: keycaps, LCD chips, numbered steps. Tagline in the manifest: "Every symbol, frame, template and shortcut of your label maker. Searchable, offline."
- Binding visual constraints (from the product owner, not a new world): Neoclassical × Bauhaus; Tabs and rail + Plates; paper `#efe7d6`; ink `#141414`; white plates with a double rule; Bodoni Moda for page titles only; Jost for body and UI; light only.
- Personality: a well-set insertion sheet, not a consumer-gadget skin and not a generic dashboard.

## Evidence on Hand

- Live app: `index.html`, `app.js`, `style.css`, `sw.js`, `manifest.webmanifest`.
- Catalog: `devices/index.json` and `devices/<id>/device.js` plus `img/` crops.
- Device chrome SVGs: `icons/devices/`.
- Concepts: `concepts/index.html` (six styles), `concepts/v2.html` (five variations; shipped structure is E Tabs & rail + C Plates).
- Phone gallery: `docs/screenshots/` (README). Do not treat `phone-home-dark.png` as a current theme; dark mode was removed.
- No customer testimonials, usage metrics, or press quotes. Do not fabricate them.
- Support: GitHub Sponsors, Issues (label-maker request template).

## Product Principles

1. The catalog is the product. Pictures, names, positions, and key recipes must match the pack. Do not invent glyphs.
2. One-handed lookup. Search and the five phone tabs (Search, Symbols, Frames, Preview, More) beat browsing a PDF.
3. Offline is a feature, not a fallback. After Save offline, the pack should work without a network.
4. Paper and ink, not chrome. The UI is an insertion sheet: plates, rules, geometric marks. No dark theme, no extra brand colors.
5. Static and forkable. Plain files, AGPL, no toolchain. A new maker is a folder, an index row, and an SVG.

## Accessibility & Inclusion

No product-specific WCAG target was confirmed. (inferred) The shipped UI is English (`lang="en"`), uses some `aria-label`s on icon buttons, a `:focus-visible` ring, and a global `prefers-reduced-motion` cut of transitions. Catalog images often have empty `alt` when a visible name sits next to them; glyph tiles include `alt` on the crop. Keyboard and screen-reader completeness is not a stated product requirement, but interactive controls should remain operable without a pointer.
