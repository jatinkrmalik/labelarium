#!/usr/bin/env python3
"""Composite a phone screenshot into the Labelarium iPhone frame."""
import json, sys
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
meta = json.loads((ROOT / "_iphone-frame.json").read_text())
frame = Image.open(ROOT / "_iphone-frame.png").convert("RGBA")
sl, st, sr, sb = meta["screen"]
pad = meta["pad"]
cw, ch = meta["canvas"]
sw, sh = sr - sl, sb - st

def frame_shot(src: Path, dst: Path, bg=(245, 241, 227, 255)):
    shot = Image.open(src).convert("RGBA")
    # cover fit into screen
    scale = max(sw / shot.width, sh / shot.height)
    nw, nh = int(shot.width * scale), int(shot.height * scale)
    shot = shot.resize((nw, nh), Image.Resampling.LANCZOS)
    # center crop
    left = (nw - sw) // 2
    top = (nh - sh) // 2
    shot = shot.crop((left, top, left + sw, top + sh))
    # rounded mask matching screen
    mask = Image.new("L", (sw, sh), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1], radius=46 * 3, fill=255)
    # assemble device
    device = Image.new("RGBA", (frame.width, frame.height), (0, 0, 0, 0))
    device.paste(shot, (sl, st), mask)
    device = Image.alpha_composite(device, frame)
    # canvas with soft shadow
    canvas = Image.new("RGBA", (cw, ch), bg)
    shadow = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    sd = Image.new("RGBA", (frame.width, frame.height), (0, 0, 0, 90))
    # approximate device silhouette for shadow
    from PIL import ImageDraw as ID
    sil = Image.new("L", (frame.width, frame.height), 0)
    ID.Draw(sil).rounded_rectangle([0, 0, frame.width - 1, frame.height - 1], radius=58 * 3, fill=255)
    shad = Image.new("RGBA", (frame.width, frame.height), (0, 0, 0, 0))
    shad.putalpha(sil)
    shad = Image.new("RGBA", (frame.width, frame.height), (0, 0, 0, 70))
    shad.putalpha(sil)
    shadow.paste(shad, (pad + 8, pad + 18), shad)
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(device, (pad, pad), device)
    dst.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(dst, "PNG", optimize=True)
    print(dst, canvas.size)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("usage: frame_iphone.py in.png out.png")
        sys.exit(2)
    frame_shot(Path(sys.argv[1]), Path(sys.argv[2]))
