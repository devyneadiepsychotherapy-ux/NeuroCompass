#!/usr/bin/env python3
"""Generates NeuroCompass app icons — finds the visual centre of the icon automatically."""
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

# Detect the icon bounds by scanning for non-background pixels.
# The outer area of the screenshot is a light neutral colour; the icon has a
# sage-green rounded-square background.  We decide a pixel is "background"
# when all three channels are > 200 (i.e. near-white / light-grey).
BG_THRESHOLD = 200

def is_bg(r, g, b):
    return r > BG_THRESHOLD and g > BG_THRESHOLD and b > BG_THRESHOLD

# Find left edge
left_edge = 0
for x in range(w):
    col = [img.getpixel((x, y)) for y in range(h // 4, 3 * h // 4)]
    non_bg = sum(1 for r, g, b in col if not is_bg(r, g, b))
    if non_bg > len(col) * 0.5:
        left_edge = x
        break

# Find right edge
right_edge = w - 1
for x in range(w - 1, -1, -1):
    col = [img.getpixel((x, y)) for y in range(h // 4, 3 * h // 4)]
    non_bg = sum(1 for r, g, b in col if not is_bg(r, g, b))
    if non_bg > len(col) * 0.5:
        right_edge = x
        break

# Find top edge
top_edge = 0
for y in range(h):
    row = [img.getpixel((x, y)) for x in range(w // 4, 3 * w // 4)]
    non_bg = sum(1 for r, g, b in row if not is_bg(r, g, b))
    if non_bg > len(row) * 0.5:
        top_edge = y
        break

# Find bottom edge
bottom_edge = h - 1
for y in range(h - 1, -1, -1):
    row = [img.getpixel((x, y)) for x in range(w // 4, 3 * w // 4)]
    non_bg = sum(1 for r, g, b in row if not is_bg(r, g, b))
    if non_bg > len(row) * 0.5:
        bottom_edge = y
        break

print(f"Icon bounds: left={left_edge}, right={right_edge}, top={top_edge}, bottom={bottom_edge}")

icon_w = right_edge - left_edge
icon_h = bottom_edge - top_edge
cx = left_edge + icon_w // 2
cy = top_edge  + icon_h // 2
print(f"Icon size: {icon_w} x {icon_h}, centre: ({cx}, {cy})")

# Use the smaller of the two dimensions so the crop is square
side = min(icon_w, icon_h)
# Shave 2% from each edge to remove any rounded-corner artefacts
trim = int(side * 0.02)
side_trimmed = side - 2 * trim

crop_left   = cx - side // 2 + trim
crop_top    = cy - side // 2 + trim
crop_right  = crop_left + side_trimmed
crop_bottom = crop_top  + side_trimmed

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
