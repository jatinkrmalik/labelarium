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

if errors:
    print("CI failed:", file=sys.stderr)
    for message in errors:
        print(f"  - {message}", file=sys.stderr)
    sys.exit(1)

print("OK: site layout, CNAME, device packs, and IndexNow key")
