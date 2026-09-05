# Labelarium

Every symbol, frame, template and shortcut of your label maker — searchable, with pictures, offline.
A zero-dependency progressive web app (plain HTML/CSS/JS, no build step).

Currently covers the **Brother P-touch PT-D220**: 30 symbol categories (371 pictograph glyphs, each with
a name, keywords and its position on the device), 99 frames + underline, 25 templates, 14 fonts, 11 styles,
22 shortcuts, 25 how-to guides, every LCD error message, and a label previewer that writes the recipe of key
presses for the design you built.

## Design language

Neoclassical × Bauhaus: ivory paper, Bodoni/New York display type, hairline double rules and centred
small caps; a strict shared-border grid, Futura labels, and three primary marks (red circle, blue square,
yellow triangle) as the only iconography. Type is bundled: Bodoni Moda and Jost (SIL OFL, licences in
`fonts/`), subset to Latin as ~70 KB of woff2 so it renders identically on every platform. Light and dark. Responsive: compact single column on phones,
sticky section sidebar plus wide content column from 900 px up. Six alternative directions are mocked
side by side in `concepts/index.html` (open `/concepts/` on the dev server).

## Run it

```bash
python3 -m http.server 8321
```

Open <http://localhost:8321>. On a phone on the same Wi-Fi use `http://<your-computer-ip>:8321`.

Installing as an app (and the offline cache) requires a secure context: `localhost`, or any HTTPS host.
The whole thing is static files, so GitHub Pages / Netlify / Cloudflare Pages work as-is.
On iOS: Share → Add to Home Screen. On Android/Chrome: menu → Install app.

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
devices/brother-pt-d220/        device.js data + img/ assets cropped from the official user guide
icons/                          PWA icons
```
