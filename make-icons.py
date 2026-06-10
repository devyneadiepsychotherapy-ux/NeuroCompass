#!/usr/bin/env python3
"""Generates NeuroCompass app icons: compass rose centred on muted sage green."""
import subprocess, sys

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"])
    from PIL import Image

SRC  = "/Users/devyneadie/Library/Application Support/Claude/local-agent-mode-sessions/4a6925b5-2260-4e24-8301-0d1f761b3c79/d6223e63-14b9-48fb-9c05-acca47dabe14/agent/local_ditto_d6223e63-14b9-48fb-9c05-acca47dabe14/uploads/2c437cd6-Screenshot_20260610_at_11.19.17AM.png"
DEST = "/Volumes/Seagate/ND Compass/public"
BG   = (107, 143, 113)   # muted sage green #6B8F71

# Load compass image and remove white background without numpy
raw = Image.open(SRC).convert("RGBA")
pixels = raw.load()
w, h = raw.size
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r > 230 and g > 230 and b > 230:
            pixels[x, y] = (r, g, b, 0)
compass = raw

# Centre-crop to square
side = min(w, h)
compass = compass.crop(((w-side)//2, (h-side)//2, (w+side)//2, (h+side)//2))

def make_icon(size):
    bg = Image.new("RGBA", (size, size), (*BG, 255))
    inner = int(size * 0.85)
    offset = (size - inner) // 2
    fg = compass.resize((inner, inner), Image.LANCZOS)
    bg.paste(fg, (offset, offset), fg)
    return bg.convert("RGB")

sizes = [
    (192, "icon-192.png"),
    (512, "icon-512.png"),
    (180, "apple-touch-icon.png"),
    (512, "icon.png"),
]

for size, name in sizes:
    path = f"{DEST}/{name}"
    make_icon(size).save(path, "PNG")
    print(f"  saved {path}")

print("Done.")
