"""
Remove a resampling "ringing" halo baked into public/icon-512.png along the
rounded-square edge of the icon's own background shape.

The source PNG carries an embedded Display P3 ICC profile. Somewhere in its
original export/resize history, a sharpening or Lanczos-style resample was
applied across the hard alpha cutout at that rounded-square boundary, leaving
a ~6px band of bright overshoot immediately followed by dark undershoot
before the fill colour settles - a classic ringing artifact. It was never
visible on the web (favicon/PWA icon, always shown small or over light
backgrounds) but became an obvious "thin white outline tracing the rounded
corners" once used as an Android adaptive-icon foreground composited over a
matching solid-colour background layer (see generate-android-icons.mjs).

Uses Pillow rather than sharp deliberately: sharp's raw() pixel extraction
colour-manages P3 -> sRGB on read, which shifts EVERY pixel's byte values by
a few units (not just the flagged ones) once written back out - confirmed by
diffing a sharp-raw-roundtripped copy against the original (262k of 262144
pixels differed). Pillow reads/writes the literal bytes untouched and lets us
pass the original icc_profile straight through on save, so only the pixels
we explicitly flag change at all.

Algorithm: for every fully-opaque pixel within a small radius of a
near-transparent one (i.e. sitting right on the icon's outer edge) whose
colour deviates from a sampled reference fill colour beyond a threshold,
snap it to that reference colour. Interior artwork (the compass rose) never
sits near a transparent pixel, so it's untouched by construction. Re-running
this on an already-clean file is a no-op (0 pixels flagged) - useful as a
sanity check after re-exporting the source artwork.

Run with: python3 scripts/fix-icon-halo.py
"""

from PIL import Image

SRC = "public/icon-512.png"
REF_POINTS = [
    (256, 40), (256, 472), (40, 256), (472, 256),
    (100, 40), (412, 40), (100, 472), (412, 472),
    (40, 100), (40, 412), (472, 100), (472, 412),
]
RADIUS = 6
THRESHOLD = 10


def median(values):
    s = sorted(values)
    return s[len(s) // 2]


def main():
    im = Image.open(SRC)
    icc = im.info.get("icc_profile")
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    ref = tuple(median([px[p][c] for p in REF_POINTS]) for c in range(3))
    print(f"Reference fill colour: {ref}")

    # Snapshot original pixels so the "near transparent" check always looks at
    # unmodified alpha values, independent of edits made earlier in the scan.
    orig = [[px[x, y] for x in range(w)] for y in range(h)]
    out = im.copy()
    out_px = out.load()

    fixed = 0
    for y in range(h):
        row = orig[y]
        for x in range(w):
            r, g, b, a = row[x]
            if a < 200:
                continue
            near_transparent = False
            for dy in range(-RADIUS, RADIUS + 1):
                ny = y + dy
                if ny < 0 or ny >= h:
                    continue
                orow = orig[ny]
                for dx in range(-RADIUS, RADIUS + 1):
                    nx = x + dx
                    if 0 <= nx < w and orow[nx][3] <= 40:
                        near_transparent = True
                        break
                if near_transparent:
                    break
            if not near_transparent:
                continue
            deviation = abs(r - ref[0]) + abs(g - ref[1]) + abs(b - ref[2])
            if deviation > THRESHOLD:
                out_px[x, y] = (ref[0], ref[1], ref[2], a)
                fixed += 1

    print(f"Pixels fixed: {fixed}")
    if icc:
        out.save(SRC, icc_profile=icc)
    else:
        out.save(SRC)
    print(f"Saved {SRC} (ICC profile preserved: {bool(icc)})")


if __name__ == "__main__":
    main()
