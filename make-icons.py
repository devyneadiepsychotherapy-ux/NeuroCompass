#!/usr/bin/env python3
"""Generates NeuroCompass app icons — finds the compass rose centre via colour deviation."""
import subprocess, sys

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"])
    from PIL import Image

SRC  = "/Users/devyneadie/Library/Application Support/Claude/local-agent-mode-sessions/4a6925b5-2260-4e24-8301-0d1f761b3c79/d6223e63-14b9-48fb-9c05-acca47dabe14/agent/local_ditto_d6223e63-14b9-48fb-9c05-acca47dabe14/uploads/05e434b6-Screenshot_20260610_at_10.30.35AM.png"
DEST = "/Volumes/Seagate/ND Compass/public"

img = Image.open(SRC).convert("RGB")
w, h = img.size
print(f"Source size: {w} x {h}")

# Sample the sage-green background from the four corners of the image
# (the compass rose is in the middle; corners are background)
corner_samples = [
    img.getpixel((5, 5)),
    img.getpixel((w - 6, 5)),
    img.getpixel((5, h - 6)),
    img.getpixel((w - 6, h - 6)),
]
bg_r = sum(p[0] for p in corner_samples) // 4
bg_g = sum(p[1] for p in corner_samples) // 4
bg_b = sum(p[2] for p in corner_samples) // 4
print(f"Background colour (sampled from corners): ({bg_r}, {bg_g}, {bg_b})")

# Find pixels that deviate from the background — these are the compass rose
DEVIATION = 30  # minimum colour distance to count as "not background"

sum_x = 0
sum_y = 0
count = 0

for y in range(h):
    for x in range(w):
        r, g, b = img.getpixel((x, y))
        dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
        if dist > DEVIATION:
            sum_x += x
            sum_y += y
            count += 1

if count == 0:
    # Fallback: use geometric centre
    cx, cy = w // 2, h // 2
    print("No foreground pixels found — using geometric centre")
else:
    cx = sum_x // count
    cy = sum_y // count

print(f"Compass rose centroid: ({cx}, {cy}), from {count} pixels")

# Build a square crop centred on the compass rose centroid.
# Use the full shorter dimension of the image as the crop size.
side = min(w, h)
# Trim 2% from each edge to remove rounded-corner artefacts
trim = int(side * 0.02)
half = side // 2

crop_left   = cx - half + trim
crop_top    = cy - half + trim
crop_right  = cx + half - trim
crop_bottom = cy + half - trim

# Clamp to image bounds
crop_left   = max(0, crop_left)
crop_top    = max(0, crop_top)
crop_right  = min(w, crop_right)
crop_bottom = min(h, crop_bottom)

print(f"Crop box: ({crop_left}, {crop_top}, {crop_right}, {crop_bottom})")

cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))

sizes = [
    (192, "icon-192.png"),
    (512, "icon-512.png"),
    (180, "apple-touch-icon.png"),
    (512, "icon.png"),
]

for size, name in sizes:
    path = f"{DEST}/{name}"
    cropped.resize((size, size), Image.LANCZOS).save(path, "PNG")
    print(f"  saved {path}")

print("Done.")
