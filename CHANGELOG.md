# Changelog

## [Unreleased]

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
