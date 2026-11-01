# Changelog

## [Unreleased]

- One SVG icon set (back, close, search, pin, chevrons) replaces text glyphs (‹ × ⌕ ○ ● ›) that rendered in mixed weights; the pin is a real pin, filled red when pinned. Nav icons share one box so tab and rail labels line up.
- System Back closes an open sheet instead of leaving the page (Android back gesture, browser Back); a link inside a sheet replaces its history entry. Opening a sheet from a sheet (Install from More) no longer throws.
- Sections a pack doesn't have are no longer offered (no "0 text · 0 pattern" tiles, rail items or empty "Basic" headings), counts are pluralised, and the bottom tabs fill a missing section with the next one the pack has.
- App screens drop the website footer and the "this pack includes…" link sentence; the home footer becomes a compact About block and About moves into the More sheet. The install banner shows at most once per session, scrolls away, and never on tablets, desktops or short screens (the app bar and rail carry Install). Plain-language "Page not found".
- Fold cover screens: makers become one row each (art left), frames two-up, specs stacked, titles shrink and never break mid-word, and the header drops its Search button (the tab is right there).
- Phones held sideways: the search box keeps its icon and clear button, the rail goes icon-only and scrolls to the active item, the home hero compacts, and the label designer becomes two panes (label left, controls right).
- Tablets and desktops: symbol categories, shortcuts, fonts and accented letters use grids; long text keeps a readable measure; the keyboard diagram is larger; the recipe column stays beside the designer; the toast centres on the content.
- Sheets: the close button gets its own header row, actions stay visible at the bottom of tall dialogs, Save is a compact dialog with Cancel then Save, keyboard zoom opens fitted to the window (tap or click to zoom in), and landscape sheets use a compact hero.
- Home: the big "Labelarium" title hands over to the app bar as you scroll (iOS large-title pattern); laptops and installed windows get a shorter hero so makers are above the fold. Installed windows get short window titles.
- Interface copy says "Click" with a mouse and "Tap" on touch; symbol names get two lines instead of an ellipsis; trailing punctuation never wraps away from a key chip.
- Service worker: images refresh in the background after being served from cache (redrawn art reaches returning users, saved packs stay current); the offline fallback prefers this release's files; slow responses still land in the cache. Offline saves made before per-device caches are re-saved quietly instead of being lost. The page waits for a pack to load before starting a page transition, so a slow network never freezes the old page.
- Show the whole printer on home tiles. The square device art was being cropped at the bottom by its 4:3 well at every screen size; it is now sized by the box. The pin button moves off the artwork.
- Fit every screen from a 280 px Fold cover screen to a 1920 px desktop: no sideways scrolling at 280 px (section tiles go single column, tabs and symbol grid shrink), long titles wrap to two lines on phones, font rows and the keyboard legend wrap.
- Phones held sideways (and other short screens) get the side rail instead of bottom tabs, and only the app bar stays sticky, so content gets the screen. Notch and rounded-corner safe areas are respected on all four sides.
- Label preview: the long strip starts centred on your text instead of the blank lead-in, the recipe column is no longer sticky (its bottom was unreachable on laptops), and the pinned tape stays compact on short phones.
- Feel like an installed app: page-to-page slide transitions (View Transitions, off with reduced motion), swipe-down to close sheets, pressed states instead of hover on touch, no text selection or long-press callouts on controls, haptic tick on Android, no overscroll bounce when installed.
- Replace browser `prompt()` / `confirm()` / `alert()` with in-app UI: a naming sheet for "Save this label", instant delete with Undo, and toasts that sit above open sheets.
- Share: a Share button on device pages, the More sheet and rail, symbol / frame / template sheets, saved labels ("Share recipe"), and a "Share Labelarium" card on home. Uses the system share sheet, falls back to copying the link. Shared links open the exact symbol, frame or template (`?open=`), and a shared label design arrives in the previewer (`?label=`, whitelisted and clamped).
- Per-device link previews: each label maker has its own 1200×630 Open Graph card (`site/icons/og/<id>.png`), used by `scripts/prerender.mjs` and the live page meta.
- Install: Install only appears where it can work (Chromium after `beforeinstallprompt`), with short, specific steps for iPhone/iPad Safari, Mac Safari (Add to Dock), Firefox Android, Samsung Internet and in-app browsers. A richer install sheet; the install bar now actually shows on phones; prompts after "Save offline". Uninstalling brings Install back.
- Manifest: no orientation lock (foldables and tablets rotate), store screenshots for Chrome's richer install dialog (narrow and wide), app shortcuts, `lang`, categories, `launch_handler` (one window) and `handle_links`. iOS launch screens for current iPhones and iPads so the installed app never opens on a white flash. Icon backgrounds re-tinted to the paper colour.
- Service worker: "Save offline" now lives in a per-device cache that updates no longer wipe (previously every release silently deleted saved devices while the app still said "Saved ✓"); responses are cloned before the page reads them; navigations fall back to the app shell after 4 s instead of hanging on a bad connection; navigation preload; the runtime image cache is capped. A "new version" toast appears only when a cached page is older than its service worker. Offline visits to an unsaved device explain what's going on and list the saved ones.
- Accessibility: focus moves to the page title on navigation; spec links, saved labels and recipe steps are keyboard operable; chips, toggles and nav state are exposed (`aria-pressed`, `aria-current`); sheets are named; search and finder results are announced; `--ink-3` darkened to pass contrast; focus rings survive forced-colors mode; 44 px touch targets in the app bar, rail and search.
- CI checks every manifest image and iOS launch screen exists at its declared size, the service worker's shell list exists, and `sw.js` VERSION matches `app.js` BUILD.
- Bump the service worker cache to `labelarium-v41`.

- Redesign the UI for phone, tablet and desktop ("Tape & keys"): same paper, primaries, Bodoni and Jost, but hairline plates instead of double rules, tape-strip section headings, keycaps with depth, and LCD-style menu text.
- Home leads with a "Find your label maker" filter, a "Continue where you left off" card and swipeable brand chips; the Brady Start here card moves below the grid.
- Device pages get a one-row sticky app bar (icon-only actions on phones). Install moves to the rail on tablet/desktop and the More sheet on phones.
- Symbol category pages show the symbols first; the insert recipe folds behind a one-line key path. Symbol and frame sheets add an "At a glance" key path above the steps. Frames and templates are two-up on phones.
- Label preview keeps the tape pinned under the app bar while editing, groups controls into Text / Tape / Type / Layout, and keeps the recipe beside the controls on desktop.
- Search suggestions on the device home are tappable chips.
- Bump the service worker cache to `labelarium-v40`.
- Stop writing `?brand=` chip-filter URLs so Google Search Console no longer sees alternate-canonical noise for home filters; leftover `?brand=` on `/` is adopted once into sessionStorage then stripped. The settled URL is `/`.
- Bump the service worker cache to `labelarium-v39`.
- Fix the invalid Product snippet Google Search Console flagged: device pages now emit plain WebPage JSON-LD, with no made-up offers, reviews, or ratings.
- Drop `?brand=` filter URLs from the sitemap so crawlers get the 111 canonical path pages only (home plus each device hub and section).
- Point Brady M210 title, description, and hub copy at unofficial manual / how-to / troubleshooting, and add calm Start here links from home. Brand chips still filter the grid but canonicalize to `/`.
- Bump the service worker cache to `labelarium-v38`.

## [0.1.2]

- Pre-render a static HTML page for every device and section route at deploy time (`scripts/prerender.mjs`), with per-page title, description, canonical, Open Graph and breadcrumb JSON-LD. Deep links now return 200 to first-time visitors and crawlers instead of the 404.html fallback; CI fails if the sitemap lists a path that is not pre-rendered.
- Make the app readable on phone, tablet, and laptop: rail from 768px, wrapping brand chips, one-line model titles, labeled Install/Pin/Search, and a Search tab that focuses the field. Header controls are all 44px; Install is tape yellow on home and device pages, Search is blue, Pin stays cream (red when pinned). Preview uses a tape width the device actually has (Brady is 12.7 mm, not a fake 12 mm). Long preview text keeps letter height and scrolls the strip (like the printer) instead of shrinking 12 mm tape to a sliver. Frame artwork keeps its end drawings (flourishes, house, icons) at native shape and only stretches the middle rail, so a long line does not crop or squash the picture. On home, Install sits to the right of the brand chips instead of doubling with a top bar. Cancelling the browser install prompt no longer hides the button.
- Collapse Symbols and Frames how-to so the catalog is on the first screen. Empty search offers sign/star/tape chips instead of the footer.
- Darken `--red` for AA contrast on the paper background. 44px hit areas on footer links and home pin controls. Drop the NIIMBOT SKU from the tile subtitle.
- Ping Bing (and other IndexNow engines) with the sitemap URLs after each GitHub Pages deploy.

## [0.1.1]

- Redraw the ten homepage / rail device SVGs as flat top views from product photos and manuals, instead of the old schematic grids.
- Move the home Install control from a centered hero button to a top-right icon, matching the device pages.
- Record version `0.1.1` in root `package.json`.
- Bump the service worker cache name to `labelarium-v35`.

## [0.1.0]

- Move deployable web assets under `site/` so the GitHub Pages artifact is that folder only. OSS docs and `docs/og/` stay at the repo root. Unused `concepts/` design explorations are removed.
- Add CI (`.github/workflows/ci.yml`) on pull requests and pushes to `main`. It checks required files under `site/`, that `site/CNAME` trims to `labelarium.com`, that `site/devices/index.json` parses, and that every device id has `site/devices/<id>/device.js` (and that a `data` path resolves when present).
- Add a GitHub Pages Actions workflow (`.github/workflows/pages.yml`) that uploads `site/` on push to `main`. The repository Pages source must be set to GitHub Actions (not a branch deploy) before that path is live.
- Stop tracking `.claude/` in version control and ignore the directory.
- Record version `0.1.0` in root `package.json` (metadata only; no build step).
- Bump the service worker cache name to `labelarium-v32`.
- Add a dashed request tile at the end of the home label-maker grid. It stays visible with a brand filter and opens the GitHub label-maker request form in a new tab.
- Drop the duplicate "Request a label maker" link from the site footer so the tile is the one call to action. Coffee, AGPL, and credit stay.
- Bump the service worker cache name to `labelarium-v33`.
