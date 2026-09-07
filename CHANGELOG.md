# Changelog

## [0.1.0]

- Move deployable web assets under `site/` so the GitHub Pages artifact is that folder only. OSS docs, `concepts/`, and `docs/og/` stay at the repo root.
- Add CI (`.github/workflows/ci.yml`) on pull requests and pushes to `main`. It checks required files under `site/`, that `site/CNAME` trims to `labelarium.com`, that `site/devices/index.json` parses, and that every device id has `site/devices/<id>/device.js` (and that a `data` path resolves when present).
- Add a GitHub Pages Actions workflow (`.github/workflows/pages.yml`) that uploads `site/` on push to `main`. The repository Pages source must be set to GitHub Actions (not a branch deploy) before that path is live.
- Stop tracking `.claude/` in version control and ignore the directory.
- Record version `0.1.0` in root `package.json` (metadata only; no build step).
- Bump the service worker cache name to `labelarium-v32`.
