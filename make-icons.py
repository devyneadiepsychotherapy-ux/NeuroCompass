#!/usr/bin/env python3
"""Generates properly cropped, sage-green-background app icons for NeuroCompass."""
import subprocess, sys

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"])
    from PIL import Image

SRC = "/Users/devyneadie/Library/Application Support/Claude/local-agent-mode-sessions/4a6925b5-2260-4e24-8301-0d1f761b3c79/d6223e63-14b9-48fb-9c05-acca47dabe14/agent/local_ditto_d6223e63-14b9-48fb-9c05-acca47dabe14/uploads/05e434b6-Screenshot_20260610_at_10.30.35AM.png"
DEST = "/Volumes/Seagate/ND Compass/public"
BG = (107, 143, 113)   # sage green #6B8F71

img = Image.open(SRC).convert("RGBA")
w, h = img.size

# Centre-crop to square
side = min(w, h)
left = (w - side) // 2
top  = (h - side) // 2
img  = img.crop((left, top, left + side, top + side))

def make_icon(size):
    bg = Image.new("RGB", (size, size), BG)
    # Slight inset (4%) so the compass has a little breathing room
    inset = int(size * 0.04)
    inner = size - inset * 2
    fg = img.resize((inner, inner), Image.LANCZOS)
    # Paste with alpha mask
    bg.paste(fg, (inset, inset), fg.split()[3])
    return bg

sizes = [
    (192,  "icon-192.png"),
    (512,  "icon-512.png"),
    (180,  "apple-touch-icon.png"),
    (512,  "icon.png"),
]

for size, name in sizes:
    out = f"{DEST}/{name}"
    make_icon(size).save(out, "PNG")
    print(f"  saved {out}")

print("Done — all icons regenerated.")
