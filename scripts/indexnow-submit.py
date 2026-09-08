#!/usr/bin/env python3
"""Ping IndexNow with every URL in site/sitemap.xml.

The key is the public IndexNow key file at the site root
(site/<hex>.txt containing the same hex). Search engines fetch that file
to verify ownership. It is meant to be in git.

Usage:
  python3 scripts/indexnow-submit.py
  python3 scripts/indexnow-submit.py --dry-run
  python3 scripts/indexnow-submit.py --wait 180
"""
import argparse
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

HOST = "labelarium.com"
ORIGIN = f"https://{HOST}"
ENDPOINT = "https://api.indexnow.org/indexnow"
KEY_RE = re.compile(r"^[A-Za-z0-9\-]{8,128}$")
SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def err(msg):
    print(msg, file=sys.stderr)


def find_key(site: Path):
    matches = []
    for path in site.glob("*.txt"):
        key = path.stem
        if not KEY_RE.fullmatch(key):
            continue
        body = path.read_text(encoding="utf-8").strip()
        if body == key:
            matches.append((key, path))
    if len(matches) != 1:
        names = ", ".join(p.name for _, p in matches) or "none"
        raise SystemExit(f"need exactly one IndexNow key file in site/ (<key>.txt containing the key); found {names}")
    return matches[0]


def sitemap_urls(site: Path):
    tree = ET.parse(site / "sitemap.xml")
    urls = []
    for loc in tree.getroot().findall("sm:url/sm:loc", SITEMAP_NS):
        url = (loc.text or "").strip()
        if url.startswith(ORIGIN + "/") or url == ORIGIN:
            urls.append(url)
    if not urls:
        raise SystemExit("site/sitemap.xml has no labelarium.com URLs")
    # IndexNow cap is 10,000 URLs per request.
    return list(dict.fromkeys(urls))


def wait_for_key(key: str, seconds: int):
    url = f"{ORIGIN}/{key}.txt"
    deadline = time.time() + seconds
    last = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=15, context=ssl.create_default_context()) as res:
                body = res.read().decode("utf-8").strip()
                if res.status == 200 and body == key:
                    print(f"key live at {url}")
                    return
                last = f"HTTP {res.status} body={body!r}"
        except urllib.error.URLError as exc:
            last = str(exc.reason if getattr(exc, "reason", None) else exc)
        time.sleep(10)
    raise SystemExit(f"timed out waiting for {url} ({last})")


def submit(key: str, urls):
    payload = json.dumps({
        "host": HOST,
        "key": key,
        "keyLocation": f"{ORIGIN}/{key}.txt",
        "urlList": urls,
    }).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT,
        data=payload,
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30, context=ssl.create_default_context()) as res:
            print(f"IndexNow {res.status} for {len(urls)} URLs")
            return
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"IndexNow HTTP {exc.code}: {detail}") from exc


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--wait", type=int, default=0, help="seconds to wait for the live key file before POST")
    args = parser.parse_args()
    site = Path("site")
    key, path = find_key(site)
    urls = sitemap_urls(site)
    print(f"key {path.name} ({len(urls)} URLs)")
    if args.dry_run:
        for url in urls:
            print(url)
        return
    if args.wait:
        wait_for_key(key, args.wait)
    submit(key, urls)


if __name__ == "__main__":
    main()
