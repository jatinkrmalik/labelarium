---
name: Labelarium
description: Neoclassical × Bauhaus catalog UI — tabs and rail, plates on warm paper.
colors:
  paper: "#efe7d6"
  plate: "#ffffff"
  plate-2: "#f6f1e7"
  ink: "#141414"
  ink-2: "#5d574c"
  rule: "#141414"
  soft: "#d8cfbc"
  red: "#c8342a"
  blue: "#1f3f8f"
  yellow: "#e8b820"
typography:
  display:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(32px, 5vw, 68px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "normal"
  title:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.1em"
  body:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  2xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "12px 18px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 18px"
    typography: "{typography.label}"
  chip:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
    typography: "{typography.body}"
  chip-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
  plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "18px"
  icon-button:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "40px"
    width: "40px"
    height: "40px"
  search-input:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 44px 14px 46px"
    typography: "{typography.body}"
---

# Design System: Labelarium

<!-- Scan of incumbent style.css, index.html, app.js, concepts/v2.html.
     Qualitative language inferred after AskUserQuestion was unavailable.
     Do not invent a new palette or type pairing. -->

## Overview

**Creative North Star: "Tabs and rail, plates on paper"**

Labelarium looks like a well-set insertion sheet, not a gadget app. Warm opium-tinted paper is the page. Content sits on white plates with a double rule (2 px outer, hairline 4 px in). Navigation is an app shell: a bottom tab bar on phones, a 112 px left rail from 900 px. Eleven geometric marks, one per section, are the only iconography.

Neoclassical contribution: Bodoni Moda on page titles, centred home wordmark, hairline double rules, generous paper margin. Bauhaus contribution: Jost for everything you read, square corners, a shared-border glyph grid, and the primary trio (red circle, blue square, yellow triangle). Primaries are rare. They mark sections and LCD chips; they do not wash the catalog.

Light only. `color-scheme: light`. Dark mode is a rejected product decision, not an unimplemented theme.

**Key Characteristics:**

- Paper ground `#efe7d6`, ink `#141414`, white plates, double rule
- Bodoni Moda for titles only; Jost 16 px body / 12 px labels for UI
- Tabs (phone) and rail (900 px+); content max 1320 px
- Square geometry; radius is reserved for marks, step numbers, and the Print key
- One mark per section; the home hero uses the red / blue / yellow trio
- Flat surfaces; depth is the inset rule, not drop shadow

## Colors

Warm paper and near-black ink, with three primary spots used as marks and LCD, not as chrome.

### Primary
- **Ink** (`{colors.ink}`): Text, rules, selected chips, primary buttons, scrollbar thumb. The voice of the page.
- **Paper** (`{colors.paper}`): Page background, PWA theme color, selected-chip text on ink. Opium-tinted, not cream-white.

### Secondary
- **Bauhaus red** (`{colors.red}`): The circle mark (Symbols), pin-on, active More row, underline of links, hover scrollbar. One red at a time.
- **Bauhaus blue** (`{colors.blue}`): Focus ring, Frames mark, search-input focus border, square mark in the home trio.
- **Tape yellow** (`{colors.yellow}`): LCD chips, highlight `mark`, Templates / Shortcuts / Preview marks, 12 mm warning pills. Native to the printer, not a marketing gold.

### Neutral
- **Plate** (`{colors.plate}`): White content surfaces.
- **Plate 2** (`{colors.plate-2}`): Hover wash, code chips, notes, tape wrap, search track. Still paper-family, never gray.
- **Ink 2** (`{colors.ink-2}`): Secondary text, tab rest, captions. Warm brown-gray, not cool slate.
- **Rule** (`{colors.rule}`): Same as ink. Outer plate stroke and structural lines.
- **Soft** (`{colors.soft}`): Hairline dividers inside a plate (glyph grid, lists, footer).

### Named Rules
**The Paper-and-Ink Rule.** The page is paper. Surfaces are white plates. Do not introduce a third ground (slate, zinc, off-black). Do not add a dark theme.

**The Rare Primary Rule.** Red, blue, and yellow appear as marks, LCD, focus, and warnings. They do not fill headers, tiles, or buttons except the ink primary button.

## Typography

**Display Font:** Bodoni Moda (fallback Bodoni 72, Didot, Georgia)
**Body Font:** Jost (fallback Futura, Century Gothic, Avenir Next)
**Label/Mono Font:** Jost for labels; `ui-monospace, Menlo, Consolas` only for LCD chips, code, and character grids

**Character:** Didone titles, geometric sans for reading. The pairing is the Neoclassical × Bauhaus contract. Body is 16 px / 1.45. Labels are 12 px small caps. Never set UI copy in Bodoni.

### Hierarchy
- **Display** (400, 48 px phone / 68 px from 900 px, 1.05, tracking -0.02 em): Home wordmark `h1.big` only. Measure about 12 ch.
- **Headline** (400, 28 px in the topbar and sheets / 32 px body `h1` / 38 px from 900 px, 1.05–1.15): Device and section titles. Bodoni.
- **Title** (600, 13 px / 1, 0.1 em, uppercase): `h2` section labels with rules on both sides; home topbar word; kickers. Jost.
- **Body** (400, 16 px / 1.45): Default UI. Hero lead 17 px / 1.5, max 42 ch. Tile titles 17 px / 600. Device tile titles 15 px / 600 (14 px under 700 px).
- **Label** (600, 11–13 px, 0.04–0.14 em, uppercase): Tabs, rail, chips, pills, buttons, topbar sub, kbd. Caption 11–13 px / 500 in ink-2, sentence case.

### Named Rules
**The Bodoni-Titles-Only Rule.** Bodoni Moda is for `h1`, sheet titles (`h2.t`), and the home wordmark. Everything you read, tap, or scan is Jost.

**The Sixteen-and-Twelve Rule.** Body 16 px. Small caps and chrome labels 12 px (11 px on the phone tab bar). Do not introduce a third UI size for the same role.

## Layout

Phone-first catalog with a bottom tab bar (Search, Symbols, Frames, Preview, More), 108 px content padding under the tabs, 16 px page gutter.

From 900 px the tab bar hides and a fixed left rail (`--rail: 112 px`) appears. Header and main share one centred column (`--content: 1320 px`) with 40 px inner padding. Device views offset by the rail; home does not grow a rail.

Device home at 1200 px+ splits into two columns (3 fr catalog tiles, 2 fr tips, min 360 px). Homepage device grid: 2 columns, 3 from 700 px, 4 from 1100 px. Section tiles: 2 × 5 so ten sections have no widow.

Rhythm: 10 px between plates and grid cells; 14 px inside linked cards; 18 px plate padding; 32 px above section `h2`. Sticky search sits on paper, not on a plate.

Safe area: tab bar includes `env(safe-area-inset-bottom)`. Viewport-fit cover.

### Named Rules
**The One-Column-Then-Rail Rule.** Do not add a hamburger. Phone = tabs. Wide = rail. Content width is 1320 px, not full bleed.

## Elevation & Depth

Flat. Plates do not drop-shadow. Depth is the double rule: 2 px outer ink, 4 px of plate, then a 1 px hairline (implemented as `box-shadow: inset 0 0 0 4px plate, inset 0 0 0 5px rule`). Hover is a plate-2 wash, not a lift. The only cast shadow is the tape preview (`0 1px 0 rgba(0,0,0,.25)`), which is the physical tape edge. Sheets use a 50% ink backdrop and no box-shadow.

Scrollbar is a square 8 px ink thumb on plate-2, not a pill.

### Named Rules
**The Double-Rule Rule.** Plates, cards, tiles, device tiles, search field, sheets, symbol grids, and frame lists share the double rule. Nested plates inside a plate are forbidden (`.chars` is not a plate). Lists inside one plate drop the inner card chrome and use soft rules.

## Shapes

Square by default (`border-radius: 0`). Geometry lives in the marks: ring, four squares (keyboard), red circle, blue hollow square, yellow triangle, blue half-arch, yellow diamond, three lines, red cross, yellow tape strip, blue quarter-circle, three dots. Home hero trio: red circle, blue square, yellow triangle. The logo in the home topbar is a 14 px red circle.

Print keycaps are the exception: `border-radius: 999px`. Step numbers and some marks are circular. Do not round plates, chips, or buttons.

## Components

### Buttons
- **Shape:** Square. Primary fills ink, ghost is transparent with a 2 px ink rule. Padding 12 × 18. Jost 13 px / 600, 0.06 em, uppercase.
- **Icon button:** 40 × 40 plate with 2 px rule. Hover plate-2. Pin-on uses red.
- **Hover / Focus:** Plate-2 wash on ghosts and icon buttons. Focus is a 2 px blue ring, 2 px offset. Search input suppresses the ring and uses a blue border instead.

### Chips
- **Style:** Plate, 1.5 px rule, 8 × 14, Jost 13 px / 600. Horizontal scroll row, no scrollbar.
- **State:** On = ink fill, paper text. Used for brand filters on home and frame filters.

### Cards / Containers
- **Corner Style:** Square
- **Background:** Plate
- **Shadow Strategy:** Double-rule inset only
- **Border:** 2 px ink
- **Internal Padding:** 18 px (cards), 16 × 14 (section tiles, min-height 118 px), 10 px (device tiles)
- Device tiles are 1:1, icon on plate-2 with a soft rule, two-line clamp on title and tagline. Pin is a 32 px hit on the corner (○ / ●).

### Inputs / Fields
- **Style:** Search is a full-width plate with the double rule, 16 px Jost, 14 px vertical padding, magnifier inset left, clear control 36 px right.
- **Preview controls:** 1.5 px rule, 10 × 12 padding, square. Segmented mirror toggle is an ink fill on the active side.
- **Focus:** Blue border on search. Blue ring on other controls.
- **LCD chip:** Mono 13 px on yellow, padding 4 × 8, ink text.

### Navigation
- **Phone tabs:** Fixed bottom, plate, 2 px top rule. Five equal items. Mark 16 px above 11 px uppercase label. Active is ink / 600; rest is ink-2.
- **Rail:** 112 px, paper, 1 px right rule. Brand block with 40 px device SVG. Active item gets a 3 px red inset bar. Labels 10 px.
- **Topbar:** Back icon or 14 px red logo; optional 48 px (40 px phone) device SVG in a 1.5 px rule; Bodoni title; Jost uppercase sub; pin and search on the right. Phone device header wraps so the title is its own row.

### Keycaps and steps
- Keycaps: 1.5 px rule, 7 × 9 padding, 12 px / 600 uppercase. OK is ink fill. Print is a pill.
- Steps: numbered 26 px circles, 1.5 px rule, 40 px left indent, soft rules between. Recipe steps toggle `.done` (strike, check in the circle).

### Symbol grid and frame list
- Shared-border grid inside one plate. Soft 1 px inner lines, no gap. Glyph cell min 84 px, square, 11 px caption, number badge top-left. Frame cell min 260 px, 46 px crop.

### Bottom sheet
- Paper, 2 px rule, no bottom rule on phone (docked). Grab is a 36 × 2 ink bar. Title is Bodoni 28 px. Max-width 720 px (960 px zoom). Backdrop 50% ink.

## Do's and Don'ts

### Do:
- **Do** keep paper `#efe7d6` and ink `#141414` as the only page ground and text.
- **Do** set page titles in Bodoni Moda and UI in Jost 16 / 12.
- **Do** put content on white double-rule plates; use soft rules inside a plate.
- **Do** use the eleven marks consistently (ring = search, keys = keyboard, red circle = symbols, hollow = frames, yellow triangle = templates, and so on).
- **Do** keep tabs on the phone and the 112 px rail from 900 px.
- **Do** keep focus as a 2 px blue ring (offset 2 px).

### Don't:
- **Don't** add a dark theme, `prefers-color-scheme: dark` palette, or new neutrals.
- **Don't** introduce another font family. Do not set body copy in Bodoni.
- **Don't** round plates, chips, or primary buttons.
- **Don't** nest a double-rule plate inside another plate.
- **Don't** flood a screen with red, blue, or yellow fills.
- **Don't** invent symbols, frames, or catalog counts. Copy follows the pack.
- **Don't** use em dashes in UI copy.
