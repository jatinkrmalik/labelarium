# Labelarium

Every symbol, frame, template and shortcut of your label maker — searchable, with pictures, offline.
A zero-dependency progressive web app (plain HTML/CSS/JS, no build step).

Currently covers two Brother P-touch models:

- **PT-D220**: 30 symbol categories (371 pictograph glyphs, each with a name, keywords and its position
  on the device), 99 frames + underline, 25 templates, 14 fonts, 11 styles.
- **PT-D210**: 27 symbol categories (311 pictograph glyphs, each with a name, keywords, a per-item crop
  from the official D210 guide, and its position on the device), 99 frame slots on the sheet (01 is Off,
  02 is underline), 27 templates (17 text + 10 pattern), 14 fonts, 10 styles (no I+Solid). Counted from
  the D210 insertion sheet: 621 symbols (310 Basic including boxed/circled 1–99, plus 311 pictographs).
  Brother lists 617.

Both include 22 shortcuts, how-to guides, every LCD error message, and a label previewer that writes the
recipe of key presses for the design you built.

## Design language

Neoclassical × Bauhaus, in the "Tabs & rail" structure with "Plates" content (see `concepts/v2.html`,
variation E + C): warm paper ground, white plates with a double rule, Bodoni Moda only for page titles,
Jost for everything you read (16 px body, 12 px labels), and eleven distinct geometric marks, one per
section. Phones get a bottom tab bar (Search, Symbols, Frames, Preview, More); from 900 px a fixed left
rail. Light and dark. Fonts are bundled (SIL OFL, licences in `fonts/`), ~70 KB of woff2.
Earlier explorations: `concepts/index.html` (six styles) and `concepts/v2.html` (five variations).

## Label preview

Design a label (tape, colour, fonts, style, frame, margins, length, mirror, two lines) and get the exact
key-press recipe for the device. Steps tick off on tap. "Save this label" stores the design locally so it
can be recalled with its recipe later.

## Run it

```bash
python3 -m http.server 8321
```

Open <http://localhost:8321>. On a phone on the same Wi-Fi use `http://<your-computer-ip>:8321`.

Installing as an app (and the offline cache) requires a secure context: `localhost`, or any HTTPS host.
The whole thing is static files, so GitHub Pages / Netlify / Cloudflare Pages work as-is.
On iOS: Share → Add to Home Screen. On Android/Chrome: menu → Install app.

## Deploy

Everything is static. Push the repository to GitHub and enable Pages (root), or drop the folder on Netlify,
Cloudflare Pages or any web server. HTTPS is required for installation and the offline cache; all three
hosts provide it. No build step, no environment variables.

## Add another label maker

1. Create `devices/<brand>-<model>/device.js` exporting one object — copy `devices/brother-pt-d220/device.js`
   as the schema reference (symbols, frames, templates, fonts, shortcuts, howto, errors, problems, tips).
   Step strings use `[Key]` for a key on the device and `{Text}` for what the LCD shows.
2. Put pictures under `devices/<brand>-<model>/img/` (symbols/`<category>-NN.png`, frames/`N.png`,
   templates/`text-NN.png` …). Only referenced files are needed.
3. Add an entry to `devices/index.json`. Done — search, favorites, offline save and the previewer pick it up.

## Layout

```
index.html  app.js  style.css   app shell (hash router, search, views, previewer)
sw.js  manifest.webmanifest     PWA: precached shell, cache-first runtime, "Save offline" per device
devices/index.json              list of label makers
devices/brother-pt-d220/        device.js data + img/ assets cropped from the official D220 user guide
devices/brother-pt-d210/        device.js data + img/ assets cropped from the official D210 user guide
icons/                          PWA icons
```

## Licence

Code is licensed under the GNU Affero General Public License v3.0 — see `LICENSE`. In short: you may use,
study, modify and share it, but if you run a modified version for others over a network you must offer
them the modified source under the same licence. The name and marks are separate; see `TRADEMARK.md`.
Bundled fonts are under the SIL Open Font License (`fonts/`). The Brother PT-D220 and PT-D210 imagery in
`devices/brother-pt-d220/img` and `devices/brother-pt-d210/img` is reproduced from the manufacturer's user
guides for reference purposes.
