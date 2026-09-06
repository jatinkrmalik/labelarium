# Impeccable audit: homepage and Brother PT-D220

Surfaces: `#/` (device grid, brand chips, topbar) and `#/d/brother-pt-d220` (device home, plus Symbols as a representative inner section).

Method: `impeccable detect --json` on `index.html`, `style.css`, `app.js`; code review; rendered screenshots at 1440×900 and 390×844 via Playwright against `http://127.0.0.1:8331`. Audit only; fixes belong to polish.

Detector warnings that are **false positives against the binding world**:

- `cream-palette` on paper `#efe7d6` (opium-tinted paper is required)
- `side-tab` on `.rail a.on` (the 3 px red inset is the active rail mark)
- `border-accent-on-rounded` on `.mark.tr-yellow` (the templates triangle)

`design-system-*` advisories are mostly sizes and radii the incumbent uses on purpose (10 px rail labels, 11 px tabs, circular step numbers). Missing tokens `--line` and `--danger` are real.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | Device tiles and symbol-category rows are `div`/`onclick`, not links; several 32–40 px targets |
| 2 | Performance | 4 | Static zero-dep PWA, lazy glyph crops, network-first shell |
| 3 | Responsive Design | 3 | Phone and rail layouts work; home uses tab-bar bottom padding; chips clip with no fade |
| 4 | Theming | 3 | Paper/ink tokens are coherent and light-only by design; `--line` / `--danger` are undefined |
| 5 | Implementation Integrity | 4 | Tabs, rail, plates, marks, Bodoni/Jost match the incumbent world |
| **Total** | | **16/20** | **Good** |

## Implementation Integrity Verdict

**Pass.** The shipped UI is a specific insertion-sheet system (warm paper, white double-rule plates, geometric marks, phone tabs / 112 px rail). It is not a generic dashboard. Detector “AI slop” hits collide with the brief and are not treated as defects.

## Executive Summary

- Audit Health Score: **16/20** (Good)
- Issues: **0 P0**, **5 P1**, **9 P2**, plus P3 notes
- Top issues: keyboard-inaccessible catalog tiles, short touch targets, tab-bar padding on the tabless homepage, sparse home rhythm, undefined CSS variables in secondary views
- Next: `/impeccable polish` on homepage + D220 shared shell, with a narrow layout/typeset pass for rhythm, caption wrap, and targets

## Detailed Findings

### P1 Major

**[P1] Device tiles are not keyboard-operable**
- Location: `app.js` `renderHome` — `div.card.devtile.link` with `onclick`
- Category: Accessibility
- Impact: Keyboard and assistive-tech users cannot open a pack from home. Pin is a real `<button>`; the tile itself is not.
- WCAG: 2.1.1 Keyboard, 4.1.2 Name, Role, Value
- Recommendation: Make the tile an `<a href="#/d/…">`. Keep the pin as a sibling button, not nested inside the link.
- Suggested command: `/impeccable polish`

**[P1] Symbol category rows are not keyboard-operable**
- Location: `app.js` `catCard` — `div.card.link` with `onclick`
- Category: Accessibility
- Impact: Same gap on the D220 Symbols list (and search hits that reuse `catCard`).
- WCAG: 2.1.1, 4.1.2
- Recommendation: `<a class="card link" href="#/d/…/symbols/…">` with link color reset.
- Suggested command: `/impeccable polish`

**[P1] Touch targets under 44 px**
- Location: `.iconbtn` 40×40; `.devtile .star` 32×32; `.chip` ~32 px tall; search `.clr` 36 px
- Category: Responsive / Accessibility
- Impact: Pin, back, search, and brand filters are easy to miss on a phone held with the other hand on the printer.
- WCAG: 2.5.8 Target Size (minimum) is 24 px (AA); 44 px is the platform comfort floor used here.
- Recommendation: 44 px hit areas; keep the visible mark optically smaller if the double rule needs room.
- Suggested command: `/impeccable polish` / `/impeccable adapt`

**[P1] Homepage inherits device tab-bar padding**
- Location: `style.css` `.app { padding-bottom: 108px }`
- Category: Responsive / Layout
- Impact: Home has no tab bar. Phone screenshots show a large empty band below the footer.
- Recommendation: 108 px only on `.app.device`.
- Suggested command: `/impeccable layout`

**[P1] Undefined tokens `--line` and `--danger`**
- Location: `app.js` accented-letter rows (`var(--line)`); label preview overflow (`var(--danger)`)
- Category: Theming
- Impact: Borders and the length-overflow warning fall back to nothing / currentcolor. Accented letters is a Symbols subview.
- Recommendation: Use `--soft` and `--red` (or define the aliases on `:root`).
- Suggested command: `/impeccable polish`

### P2 Minor

**[P2] Home hero and catalog are disconnected**
- Location: `.hero-home` padding; orphaned pin hint between hero and `h2.Label makers`
- Category: Layout
- Impact: Desktop 1440 shot: a wide paper gap, then a lone “Tap ○…” line, then the grid. The catalog is the job; it arrives late.
- Recommendation: Tighten hero padding; move the pin hint into the Label makers heading; keep the kicker (incumbent Neoclassical, not a new eyebrow).
- Suggested command: `/impeccable layout`

**[P2] Device tile captions wrap mid-model**
- Location: `deviceLabel()` + `.devtile b` 2.4 em forced height, 14 px on phone
- Category: Typography
- Impact: Phone tiles wrap “Brother P-touch PT-” / “D220”. Forced caption heights leave empty lines on short names.
- Recommendation: Lead with `model`; put brand (and tagline) in the muted line; drop fixed em heights, keep line-clamp.
- Suggested command: `/impeccable typeset`

**[P2] Brand chips clip with no overflow cue**
- Location: `.chips` on home (390 px)
- Category: Responsive
- Impact: DYMO/Brady are off-canvas with no fade or hint to scroll.
- Recommendation: Edge fade on paper; slightly taller chips.
- Suggested command: `/impeccable adapt`

**[P2] Two `h1`s on the homepage**
- Location: `setTop('Labelarium')` plus `.hero-home h1.big`
- Category: Accessibility
- Impact: Screen readers hear the name twice; the topbar one is 13 px small caps.
- Recommendation: Topbar home word as a `<p>`, leave the Bodoni wordmark as the only `h1`.
- Suggested command: `/impeccable polish`

**[P2] Callout uses a 3 px yellow side bar**
- Location: `.note { border-left: 3px solid var(--yellow) }`
- Category: Implementation Integrity
- Impact: Detector `side-tab`; craft-floor refuses colored side bars on callouts. Notes appear in D220 how-tos and sheets.
- Recommendation: Tape-edge treatment: plate-2 fill, 2 px yellow along the top, no left bar.
- Suggested command: `/impeccable polish`

**[P2] Em dashes in UI chrome**
- Location: `app.js` section `h2` subs (`— text characters`, template block title separator)
- Category: Content
- Impact: Binding copy rule. Catalog `device.js` strings are out of scope.
- Recommendation: Use a middle dot or spaced hyphen in chrome only.
- Suggested command: `/impeccable clarify`

**[P2] Search clear and chips missing names/state**
- Location: `.clr` has no `aria-label`; chips have no `aria-pressed`
- Category: Accessibility
- Recommendation: Label the clear control; `aria-pressed` on brand/frame chips.
- Suggested command: `/impeccable polish`

**[P2] More tab is `href="#"`**
- Location: `deviceTop` tabs
- Category: Accessibility
- Impact: Hash jumps / fake link. Should be a button that opens the sheet.
- Suggested command: `/impeccable polish`

**[P2] Symbols how-to buries the catalog on phone**
- Location: `viewSymbols` first card (five long steps)
- Category: Layout
- Impact: 390×844 shot: the entire first screen is the recipe; BASIC categories sit under the tab bar.
- Recommendation: Tighter step rhythm; keep the recipe, do not hide it.
- Suggested command: `/impeccable layout`

### P3 Polish

- `.more a.on b` red on paper is about 4.3:1 (short of 4.5). Prefer ink + the existing mark.
- `::selection` and caret are unthemed (craft-floor browser surfaces).
- Rail 10 px labels are small but on-world; do not enlarge into a second type voice.
- Duplicate device SVG in rail brand and topbar on desktop is redundant, not blocking.

## Patterns

- Interactive catalog surfaces were built as clickable `div`s. Buttons exist where the author thought of them (tiles on device home, glyphs, frames, icon buttons).
- Hit areas follow the 40 px icon-button module, not 44 px.
- Spacing scale is real but uneven: 10 px grid gaps vs 32–48 px hero/section gaps that strand secondary copy.

## Positive findings

- Paper / ink / plate / red / blue / yellow tokens are used with restraint. Primaries are marks and LCD, not fills.
- Double-rule plates are consistent; nested plates are correctly avoided on `.chars`.
- Phone tabs and the 900 px rail match `concepts/v2.html` variation E + C.
- Search, section tiles, glyphs, and frames are real `<button>`s or `<input>`s with a visible 2 px blue focus ring.
- `prefers-reduced-motion` is honored. `lang="en"`, viewport-fit, theme-color, and PWA icons are present.
- Glyph images include `alt` from the symbol name. Lazy-loading is on.

## Recommended actions

1. **[P1] `/impeccable polish`**: links for tiles and category rows; 44 px targets; heading/ARIA; note treatment; missing tokens; More as a button.
2. **[P1] `/impeccable layout`**: home padding and hero-to-grid rhythm; device-home hint vs two-column; tighter symbol steps on phone.
3. **[P2] `/impeccable typeset`**: device tile title hierarchy (model first) without new families.
4. **[P2] `/impeccable adapt`**: chip overflow fade and chip height.
5. **[P2] `/impeccable clarify`**: em dashes in chrome `h2` subs only.
6. **[P2] `/impeccable polish`**: final pass after the above.

Re-run `/impeccable audit` after fixes to see the score move. This session continues with polish as requested.
