# Contributing

Thanks for wanting to help. Labelarium is a static progressive web app: plain
HTML, CSS and JS, no build step, no package manager. Read this, then open a
draft pull request. We follow a [code of conduct](CODE_OF_CONDUCT.md).

## Run it locally

From the repo root, serve `site/` as the web root. There is no build step.

```bash
python3 -m http.server -d site 8080
```

Open <http://localhost:8080>. On a phone on the same Wi-Fi use
`http://<your-computer-ip>:8080`. Installing as an app (and the offline cache)
needs a secure context: `localhost`, or HTTPS.

That is the whole toolchain.

## Add a device pack

Do not invent catalogs. Crops come from official user guides or support pages
only, never from memory, a photo of the LCD, or a third-party listing.

The steps live in the README under **Add another label maker**. Copy an existing
`site/devices/<id>/` pack, fill `device.js` from the official document, drop only the
images you actually reference, add a line to `site/devices/index.json`, and put a
flat top-view SVG in `site/icons/devices/`. If you do not have the manual yet, open a
[label maker request](https://github.com/jatinkrmalik/labelarium/issues/new?template=label_maker_request.yml)
instead of guessing.

## Issues

Please use the templates. Blank issues are allowed if nothing fits.

- [Bug report](https://github.com/jatinkrmalik/labelarium/issues/new?template=bug_report.yml)
- [Enhancement](https://github.com/jatinkrmalik/labelarium/issues/new?template=enhancement.yml)
  (not a new device pack)
- [Request a label maker](https://github.com/jatinkrmalik/labelarium/issues/new?template=label_maker_request.yml)

Security issues are private. See [SECURITY.md](SECURITY.md).

## Pull requests

1. Open the PR as a **draft** first. Say what you changed and which official
   manual (or support page) the catalog comes from.
2. Do not invent symbols, frames, templates, fonts or shortcuts. If the guide
   does not list it, leave it out.
3. Image crops must come from the official manual or support pages for that
   model. Keep them tight; do not ship whole PDF pages.
4. Match the existing device-pack shape. The PT-D220 pack is the schema
   reference.
5. Bump `site/sw.js` `VERSION` if you change cached app-shell files (`site/index.html`,
   `site/app.js`, `site/style.css`, `site/devices/index.json`, fonts, icons). Docs-only PRs
   do not need a bump unless a maintainer asks.

A small, reviewable pack beats a giant dump. Maintainers will mark the PR ready
when it is.

## Licence

Code is AGPL-3.0 (`LICENSE`). Device imagery is reproduced from each
manufacturer's guide for reference; see the README Licence section. The name
and marks are separate (`TRADEMARK.md`).
