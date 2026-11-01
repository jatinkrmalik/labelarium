# Google Play listing: Labelarium

Labelarium ships to Google Play as a **Trusted Web Activity (TWA)**: a thin Android app that opens
https://labelarium.com full screen, without browser UI, using the installed Chrome. Updates to the
website reach Play users immediately; only the Android wrapper needs a new upload when its
settings change.

## 1. Build the Android package (PWABuilder)

Use https://www.pwabuilder.com → enter `https://labelarium.com` → **Package for stores → Android**.

| Setting | Value |
|---|---|
| Package ID | `com.labelarium.app` |
| App name | Labelarium |
| Launcher name | Labelarium |
| App version / version code | 1.0.0 / 1 |
| Host / start URL | labelarium.com / `/` |
| Theme colour / background | `#f2ede3` / `#f2ede3` |
| Display mode | Standalone |
| Notification delegation | Off |
| Location delegation | Off |
| Include source code | No |
| Signing key | **New** (first release). Keep the downloaded `signing.keystore` and its passwords somewhere safe and private (a password manager), never in this repo. You need it for every future update. |

The download contains `app-release-bundle.aab` (upload this to Play), an `.apk` for side-loading
tests, the signing key, and a sample `assetlinks.json`.

## 2. Prove you own labelarium.com (Digital Asset Links)

Without this, the app shows a browser address bar instead of opening full screen.

1. In Play Console → the app → **Test and release → App integrity → App signing**, copy the
   **SHA-256 certificate fingerprint of the app signing key** (Play re-signs the bundle, so use
   Play's key, not only the upload key).
2. Create `site/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.labelarium.app",
    "sha256_cert_fingerprints": ["<PLAY APP SIGNING SHA-256>", "<UPLOAD KEY SHA-256>"]
  }
}]
```

3. Deploy. `.github/workflows/pages.yml` sets `include-hidden-files: true` so the `.well-known`
   folder is published. Check that https://labelarium.com/.well-known/assetlinks.json returns the JSON.

## 3. Store listing

**App name** (30 max): `Labelarium: label maker guide` (29)

**Short description** (80 max):
`Every symbol, frame and key press for your Brother, DYMO or NIIMBOT label maker.` (79)

**Full description** (4000 max):

```
Labelarium is the companion your label maker never came with. Find any symbol, frame, template or shortcut in seconds, see a picture of it, and get the exact key presses to make it on your device. No more paging through menus or squinting at the insertion sheet.

SEARCH, DON'T SCROLL
Type “warning”, “recycle”, “gift” or “serial number” and jump straight to the right symbol, frame or how-to guide, with its picture and position.

EVERY SYMBOL, WITH THE KEY PATH
Hundreds of pictographs and characters, sorted the way your device sorts them. Tap one to see it at a glance: which key to press, which category, which position, then OK.

FRAMES AND TEMPLATES, BY NUMBER
All 99 frames and every built-in template, pictured and numbered as on the device, with the tape widths they need.

LABEL PREVIEW
Design a label (text, two lines, tape colour and width, font, size, style, frame, margins, mirror) and Labelarium writes the step-by-step recipe for your exact model. Save your favourite designs and share them with a link.

KEYBOARD MAP, HOW-TOS AND TROUBLESHOOTING
What every key does, step-by-step guides for margins, chain printing, numbering and more, and every LCD error message with its cause and fix.

WORKS OFFLINE
Save a label maker once and look everything up with no signal: in the garage, the warehouse or the classroom.

SUPPORTED LABEL MAKERS
Brother P-touch PT-D220, PT-D210, PT-D610BT, PT-P710BT (CUBE Plus) · DYMO LabelManager 160 and 280 · NIIMBOT D110 · Brady M210 and M211 · Phomemo M110

Free, no account, no ads, no tracking. Open source.

Labelarium is an independent, unofficial reference. Brother, DYMO, NIIMBOT, Brady, Phomemo and related marks belong to their owners; Labelarium is not affiliated with or endorsed by them.
```

**Category:** Tools (alternative: Productivity)
**Tags:** Tools, Productivity, Reference
**Contact email:** _your support address_ (required, shown publicly)
**Website:** https://labelarium.com
**Privacy policy:** https://labelarium.com/privacy.html

### Graphics (in `site/` and `docs/store/`)

| Asset | Requirement | File |
|---|---|---|
| App icon | 512×512 PNG | `site/icons/icon-512.png` |
| Feature graphic | 1024×500 PNG/JPG | `docs/store/feature-graphic.png` |
| Phone screenshots | 2–8, 9:16, min 1080px side recommended | `site/screenshots/narrow-*.png` (1080×1920 ×4) |
| 7" / 10" tablet screenshots | optional, improves tablet ranking | `docs/store/tablet-*.png` |

## 4. App content answers

| Form | Answer |
|---|---|
| Privacy policy | https://labelarium.com/privacy.html |
| Ads | No ads |
| App access | All functionality available without special access (no login) |
| Content rating (IARC) | Category: Reference, News, or Educational / Utility. No violence, sexuality, language, controlled substances, gambling, user-generated content, location sharing or purchases → rated Everyone / PEGI 3 |
| Target audience | 13 and over (choosing under-13 brings in the Families policy for no benefit) |
| News app | No |
| Data safety | **No data collected or shared.** Data is not encrypted in transit? → Yes, encrypted (HTTPS). Users can request deletion? → Not applicable (nothing collected; local data is cleared by uninstalling). |
| Government app / financial features / health | No |

## 5. Release

- **Organization account or personal account created before 13 Nov 2023:** create a production
  release with the `.aab`, submit for review.
- **Personal account created after 13 Nov 2023:** Google first requires a **closed test with at
  least 12 opted-in testers for 14 continuous days** for each new app, then you can apply for
  production access.

Every later release of the wrapper needs a higher version code and the same signing key.
