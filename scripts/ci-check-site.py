import json
import re
import sys
from pathlib import Path

root = Path("site")
errors = []


def err(msg):
    errors.append(msg)


required = [
    "index.html",
    "404.html",
    "app.js",
    "style.css",
    "sw.js",
    "manifest.webmanifest",
    "robots.txt",
    "sitemap.xml",
    "CNAME",
    "devices/index.json",
]
for rel in required:
    path = root / rel
    if not path.is_file():
        err(f"missing required file: site/{rel}")

cname = root / "CNAME"
if cname.is_file():
    text = cname.read_text(encoding="utf-8").strip()
    if text != "labelarium.com":
        err(f"site/CNAME must trim to 'labelarium.com', got {text!r}")

index_path = root / "devices" / "index.json"
data = None
if index_path.is_file():
    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        err(f"site/devices/index.json is not valid JSON: {exc}")

if data is not None:
    if not isinstance(data, list):
        err("site/devices/index.json must be a JSON array")
    else:
        for i, entry in enumerate(data):
            if not isinstance(entry, dict):
                err(f"site/devices/index.json[{i}] is not an object")
                continue
            device_id = entry.get("id")
            if not device_id or not isinstance(device_id, str):
                err(f"site/devices/index.json[{i}] is missing a string id")
                continue
            device_js = root / "devices" / device_id / "device.js"
            if not device_js.is_file():
                err(f"device {device_id}: missing site/devices/{device_id}/device.js")
            data_path = entry.get("data")
            if data_path:
                if not isinstance(data_path, str) or data_path.startswith("/") or ".." in Path(data_path).parts:
                    err(f"device {device_id}: data path {data_path!r} is not a relative path under site/")
                else:
                    resolved = (root / data_path).resolve()
                    try:
                        resolved.relative_to(root.resolve())
                    except ValueError:
                        err(f"device {device_id}: data path {data_path!r} escapes site/")
                    else:
                        if not resolved.is_file():
                            err(f"device {device_id}: data path {data_path!r} does not resolve to a file under site/")

indexnow_key = re.compile(r"^[A-Za-z0-9\-]{8,128}$")
indexnow_files = [
    p.name for p in root.glob("*.txt")
    if indexnow_key.fullmatch(p.stem) and p.read_text(encoding="utf-8").strip() == p.stem
]
if len(indexnow_files) != 1:
    found = ", ".join(indexnow_files) or "none"
    err(f"need exactly one IndexNow key file in site/ (<key>.txt containing the key); found {found}")

# PWA: every manifest image exists at its declared size; the SW shell list exists; SW and app versions agree;
# iOS launch screens referenced from index.html / 404.html exist at the size their name says.
def png_size(path):
    head = path.read_bytes()[:24]
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return int.from_bytes(head[16:20], "big"), int.from_bytes(head[20:24], "big")


manifest_path = root / "manifest.webmanifest"
if manifest_path.is_file():
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        err(f"site/manifest.webmanifest is not valid JSON: {exc}")
        manifest = {}
    if "orientation" in manifest:
        err("manifest: do not lock orientation (foldables and tablets rotate)")
    images = list(manifest.get("icons", [])) + list(manifest.get("screenshots", []))
    images += [icon for sc in manifest.get("shortcuts", []) for icon in sc.get("icons", [])]
    for item in images:
        p = root / item["src"].lstrip("/")
        if not p.is_file():
            err(f"manifest: missing {item['src']}")
            continue
        size = png_size(p)
        if size and item.get("sizes") and f"{size[0]}x{size[1]}" != item["sizes"]:
            err(f"manifest: {item['src']} is {size[0]}x{size[1]}, declared {item['sizes']}")

sw_path = root / "sw.js"
if sw_path.is_file():
    sw = sw_path.read_text(encoding="utf-8")
    shell = re.search(r"const SHELL = \[(.*?)\];", sw, re.S)
    for rel in re.findall(r"'([^']+)'", shell.group(1) if shell else ""):
        if rel != "./" and not (root / rel).is_file():
            err(f"sw.js SHELL lists a missing file: {rel}")
    sw_version = re.search(r"VERSION = 'labelarium-(v\d+)'", sw)
    app_build = re.search(r"const BUILD = '(v\d+)'", (root / "app.js").read_text(encoding="utf-8"))
    if not sw_version or not app_build or sw_version.group(1) != app_build.group(1):
        err("sw.js VERSION and app.js BUILD must match (bump both together)")

for page in ("index.html", "404.html"):
    html_path = root / page
    if not html_path.is_file():
        continue
    for href in re.findall(r'rel="apple-touch-startup-image"[^>]*href="([^"]+)"', html_path.read_text(encoding="utf-8")):
        p = root / href.lstrip("/")
        m = re.search(r"(\d+)x(\d+)\.png$", href)
        if not p.is_file():
            err(f"{page}: missing launch screen {href}")
        elif m and png_size(p) != (int(m.group(1)), int(m.group(2))):
            err(f"{page}: launch screen {href} is {png_size(p)}, name says {m.group(1)}x{m.group(2)}")

if errors:
    print("CI failed:", file=sys.stderr)
    for message in errors:
        print(f"  - {message}", file=sys.stderr)
    sys.exit(1)

print("OK: site layout, CNAME, device packs, IndexNow key, manifest, service worker and launch screens")
