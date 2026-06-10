#!/usr/bin/env python3
"""Generates NeuroCompass app icons from the original rounded-square compass screenshot."""
import subprocess, sys

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"])
    from PIL import Image

# Original screenshot: compass already on its own sage-green rounded-square background
SRC  = "/Users/devyneadie/Library/Application Support/Claude/local-agent-mode-sessions/4a6925b5-2260-4e24-8301-0d1f761b3c79/d6223e63-14b9-48fb-9c05-acca47dabe14/agent/local_ditto_d6223e63-14b9-48fb-9c05-acca47dabe14/uploads/05e434b6-Screenshot_20260610_at_10.30.35AM.png"
DEST = "/Volumes/Seagate/ND Compass/public"

img = Image.open(SRC).convert("RGB")
w, h = img.size

# The screenshot is taller than wide (phone screenshot).
# Find the green square: it's the shorter dimension, centred horizontally.
side = min(w, h)
left = (w - side) // 2
top  = (h - side) // 2

# Crop a bit tighter to eliminate any white edge from the screenshot capture
trim = int(side * 0.02)
img = img.crop((left + trim, top + trim, left + side - trim, top + side - trim))

sizes = [
    (192, "icon-192.png"),
    (512, "icon-512.png"),
    (180, "apple-touch-icon.png"),
    (512, "icon.png"),
]

for size, name in sizes:
    path = f"{DEST}/{name}"
    img.resize((size, size), Image.LANCZOS).save(path, "PNG")
    print(f"  saved {path}")

print("Done.")
