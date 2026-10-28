#!/usr/bin/env python3
"""Builds src/assets/items-v6 from items-v5: same 32x32 sprites, simplified to a few flat colors with
a darker outline, no shading or speckle, so each item reads from its silhouette and main colors.

    python3 -m venv .venv && .venv/bin/pip install Pillow numpy
    .venv/bin/python scripts/make-items-v6.py
"""
import colorsys
import math
import pathlib

import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'assets'
SRC, OUT = ROOT / 'items-v5', ROOT / 'items-v6'
DEFAULT_COLORS = 7
COLORS = {'goldenRetriever': 8, 'helicopter': 5, 'carCrash': 5, 'lawyerSuit': 7, 'wine': 6, 'rollingPin': 5, 'planner': 5, 'gavelHammer': 4, 'handkerchief': 5}
OUTLINE_DARKEN = 0.45


def boost(rgb):
    """Slightly more saturated and contrasty, so flat regions stay distinct."""
    out = np.empty_like(rgb, dtype=float)
    for i, (r, g, b) in enumerate(rgb / 255.0):
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        out[i] = colorsys.hsv_to_rgb(h, min(1, s * 1.15), v)
    return out * 255


def kmeans(points, k, iters=20):
    rng = np.random.default_rng(1)
    centers = [points[rng.integers(len(points))]]
    for _ in range(k - 1):  # k-means++ seeding
        d = np.min([((points - c) ** 2).sum(1) for c in centers], axis=0)
        centers.append(points[np.argmax(d)])
    centers = np.array(centers, dtype=float)
    for _ in range(iters):
        labels = np.argmin(((points[:, None] - centers[None]) ** 2).sum(2), axis=1)
        for j in range(k):
            if (labels == j).any():
                centers[j] = points[labels == j].mean(0)
    return centers


def neighbours(labels, mask, y, x):
    out = []
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            yy, xx = y + dy, x + dx
            if (dy or dx) and 0 <= yy < labels.shape[0] and 0 <= xx < labels.shape[1] and mask[yy, xx]:
                out.append(labels[yy, xx])
    return out


def smooth(labels, mask, passes=2):
    """Replace a pixel by the majority of its neighbours when it is outvoted, which removes speckle."""
    for _ in range(passes):
        new = labels.copy()
        for y, x in zip(*np.nonzero(mask)):
            n = neighbours(labels, mask, y, x)
            if not n:
                continue
            vals, counts = np.unique(n, return_counts=True)
            best = vals[np.argmax(counts)]
            if best != labels[y, x] and counts.max() >= 5:
                new[y, x] = best
        labels = new
    return labels


def process(path, k):
    img = np.array(Image.open(path).convert('RGBA'))
    mask = img[..., 3] >= 128
    ys, xs = np.nonzero(mask)
    pts = boost(img[ys, xs, :3].astype(float))
    centers = kmeans(pts, k)
    labels = np.full(mask.shape, -1)
    labels[ys, xs] = np.argmin(((pts[:, None] - centers[None]) ** 2).sum(2), axis=1)
    labels = smooth(labels, mask)

    out = np.zeros_like(img)
    pal = np.clip(centers, 0, 255).astype(np.uint8)
    for y, x in zip(*np.nonzero(mask)):
        out[y, x, :3], out[y, x, 3] = pal[labels[y, x]], 255
    return outline(out)


def outline(out):
    """Opaque pixels touching transparency (or the canvas edge) take a darker shade of their own color."""
    mask = out[..., 3] >= 128
    padded = np.pad(mask, 1)
    for y, x in zip(*np.nonzero(mask)):
        if not (padded[y, x + 1] and padded[y + 2, x + 1] and padded[y + 1, x] and padded[y + 1, x + 2]):
            out[y, x, :3] = (out[y, x, :3] * OUTLINE_DARKEN).astype(np.uint8)
    return Image.fromarray(out)


def star(cx, cy, outer, inner, points=8):
    return [(cx + (outer if i % 2 == 0 else inner) * math.cos(math.pi * i / points - math.pi / 2),
             cy + (outer if i % 2 == 0 else inner) * math.sin(math.pi * i / points - math.pi / 2)) for i in range(points * 2)]


def canvas():
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


# Items whose photo-derived v5 shape does not survive simplification are drawn from flat shapes instead.
def draw_goldenRetriever():
    img, d = canvas()
    d.ellipse((1, 8, 11, 27), fill='#c8701f')   # ears
    d.ellipse((20, 8, 30, 27), fill='#c8701f')
    for x0 in (1, 20):                           # shaggy fringe at the ear tips
        for i in range(3):
            d.polygon([(x0 + 3 * i, 23), (x0 + 3 * i + 2, 29), (x0 + 3 * i + 4, 23)], fill='#c8701f')
    for x, y in ((0, 13), (0, 18), (30, 13), (30, 18)):   # wisps on the outer ear edges
        d.rectangle((x, y, x + 1, y + 1), fill='#c8701f')
    for x in (4, 7, 23, 26):                     # fur strands inside the ears
        d.line((x, 12, x - 1 if x < 16 else x + 1, 24), fill='#a85a16')
    d.ellipse((5, 2, 26, 28), fill='#f2a93b')   # head
    for side in (-1, 1):                         # fluffy cheek fur
        cx = 15.5 + side * 10
        d.polygon([(cx, 18), (cx + side * 3, 21), (cx, 22), (cx + side * 2, 25), (cx - side * 2, 26)], fill='#f2a93b')
    for x, y in ((8, 6), (22, 6), (7, 20), (24, 20)):     # strokes of fur on the face
        d.line((x, y, x + 1, y + 2), fill='#d98a2a')
    d.ellipse((9, 15, 22, 30), fill='#ffe7b0')  # muzzle
    d.rectangle((10, 10, 12, 13), fill='#2a1a14')  # eyes
    d.rectangle((19, 10, 21, 13), fill='#2a1a14')
    d.rectangle((10, 10, 10, 10), fill='#ffffff')
    d.rectangle((19, 10, 19, 10), fill='#ffffff')
    d.ellipse((13, 15, 18, 19), fill='#2a1a14')  # nose
    d.line((15, 19, 15, 21), fill='#2a1a14')     # mouth
    d.line((12, 22, 15, 21), fill='#2a1a14')
    d.line((18, 22, 15, 21), fill='#2a1a14')
    d.rectangle((14, 22, 17, 25), fill='#f48fa0')  # tongue
    return img


def draw_pasta():
    img, d = canvas()
    d.ellipse((1, 13, 30, 30), fill='#e8eef2')               # plate
    d.ellipse((4, 15, 27, 28), fill='#ffffff')
    d.ellipse((5, 7, 26, 25), fill='#f4d27a')                # spaghetti mound
    for box in ((7, 10, 24, 23), (9, 12, 22, 21), (11, 14, 20, 19), (6, 13, 18, 24), (13, 9, 25, 20)):
        d.arc(box, 200, 520, fill='#d9a63a')                 # swirling noodles
    d.ellipse((11, 9, 20, 16), fill='#d8432f')               # tomato sauce
    d.ellipse((14, 10, 17, 13), fill='#a8281c')              # meatball
    d.polygon([(19, 9), (23, 7), (21, 11)], fill='#4caf50')  # basil
    for x, y in ((9, 18), (20, 19), (15, 21)):               # parmesan
        d.point((x, y), fill='#fff8e1')
    return img


def draw_lawyerSuit():
    img, d = canvas()
    d.polygon([(9, 4), (23, 4), (29, 10), (30, 29), (2, 29), (3, 10)], fill='#26262c')  # gown
    d.polygon([(12, 4), (20, 4), (16, 14)], fill='#ffffff')                              # shirt
    d.rectangle((20, 6, 23, 28), fill='#ffca28')                                         # ceremonial ribbon
    d.rectangle((22, 6, 22, 28), fill='#ffffff')
    d.line((16, 14, 16, 29), fill='#3a3a42')                                             # gown front seam
    return img


def draw_handkerchief():
    img, d = canvas()
    d.polygon([(16, 3), (29, 16), (16, 29), (3, 16)], fill='#6fa8dc')   # blue border
    d.polygon([(16, 6), (26, 16), (16, 26), (6, 16)], fill='#ffffff')
    d.polygon([(16, 6), (26, 16), (16, 16)], fill='#e3eaf2')             # folded corner
    for x, y in ((12, 16), (20, 20), (16, 22), (12, 20)):                # embroidered dots
        d.rectangle((x, y, x + 1, y + 1), fill='#6fa8dc')
    return img


def draw_shrimpFriedRiceBox():
    img, d = canvas()
    d.rounded_rectangle((1, 4, 30, 28), radius=4, fill='#c62828')             # lunch box
    d.rounded_rectangle((4, 7, 27, 25), radius=3, fill='#fff3d6')             # inner rim
    d.rounded_rectangle((5, 8, 26, 24), radius=3, fill='#f6d56a')             # fried rice
    for x, y, c in ((7, 11, '#66bb6a'), (12, 20, '#ff8a3d'), (22, 12, '#66bb6a'), (24, 19, '#ff8a3d'),
                    (9, 17, '#fff3d6'), (17, 23, '#66bb6a'), (20, 9, '#fff3d6'), (6, 22, '#fff3d6')):
        d.rectangle((x, y, x + 1, y + 1), fill=c)
    for cx, cy in ((12, 12), (21, 16)):                                       # two shrimp
        d.arc((cx - 5, cy - 5, cx + 5, cy + 5), 110, 350, fill='#ff6f4a', width=3)
        d.polygon([(cx + 4, cy + 3), (cx + 8, cy + 2), (cx + 5, cy + 6)], fill='#ff6f4a')
        d.rectangle((cx - 4, cy - 3, cx - 3, cy - 2), fill='#37474f')
    return img


def draw_tomYum():
    img, d = canvas()
    # A deep bowl and a few large ingredients read more clearly than many tiny toppings.
    d.line([(10, 8), (9, 6), (11, 4), (10, 2)], fill='#d6ddd9', width=2)         # steam
    d.line([(20, 7), (22, 5), (21, 3)], fill='#d6ddd9', width=2)
    d.ellipse((2, 13, 29, 30), fill='#dbe2e5')                                  # bowl body
    d.ellipse((2, 10, 29, 24), fill='#ffffff')                                  # thick white rim
    d.ellipse((4, 12, 27, 22), fill='#c93619')                                  # dark soup edge
    d.ellipse((5, 13, 26, 21), fill='#ef6424')                                  # orange-red broth

    d.ellipse((6, 14, 11, 18), fill='#f4e3c5')                                  # straw mushroom halves
    d.line((8, 17, 8, 20), fill='#c8a77d', width=2)
    d.ellipse((20, 14, 25, 18), fill='#f4e3c5')
    d.line((22, 17, 22, 20), fill='#c8a77d', width=2)
    d.polygon([(6, 19), (10, 16), (13, 18), (10, 21)], fill='#276b35')          # kaffir-lime leaves
    d.polygon([(18, 19), (21, 16), (25, 18), (22, 21)], fill='#276b35')
    d.line((13, 20, 17, 14), fill='#d7d56b', width=2)                           # lemongrass
    d.line((21, 20, 26, 18), fill='#b71c1c', width=2)                           # bird's-eye chili

    # One shell-on prawn is the focal point. The internal outline keeps it separate from the broth.
    d.arc((7, 8, 25, 25), 205, 520, fill='#9e2c14', width=6)
    d.arc((7, 8, 25, 25), 205, 520, fill='#ff9a52', width=3)
    d.ellipse((16, 9, 24, 16), fill='#9e2c14')
    d.ellipse((18, 10, 23, 14), fill='#ff9a52')
    d.polygon([(9, 16), (4, 13), (6, 17), (3, 20), (10, 19)], fill='#9e2c14')
    d.polygon([(8, 16), (5, 15), (7, 17), (5, 19), (9, 18)], fill='#ff9a52')
    d.point((21, 11), fill='#2b1b16')
    d.line((22, 10, 26, 7), fill='#9e2c14')                                     # antennae
    d.line((22, 11, 28, 10), fill='#9e2c14')

    d.arc((3, 11, 28, 25), 5, 175, fill='#eef3f4', width=2)                    # front lip
    return img


DRAWN = {f.__name__[5:]: f for f in (draw_pasta, draw_shrimpFriedRiceBox, draw_goldenRetriever, draw_lawyerSuit, draw_handkerchief, draw_tomYum)}


def patch(name, img):
    """Small additions that make a simplified sprite unmistakable."""
    d = ImageDraw.Draw(img)
    if name == 'fishSauceBread':   # a small fish on top, with an amber fish-sauce drizzle under it
        d.line([(7, 22), (11, 25), (15, 22), (19, 25), (24, 22)], fill='#7a3a12', width=2)
        d.polygon([(12, 11), (14, 8), (17, 11)], fill='#1f3a55', outline='#0f1c2b')            # dorsal fin
        d.polygon([(18, 14), (23, 10), (22, 14), (23, 18)], fill='#1f3a55', outline='#0f1c2b')  # forked tail
        d.ellipse((8, 11, 19, 17), fill='#2f5273', outline='#0f1c2b')                          # body
        d.line((10, 16, 17, 16), fill='#6f93b0')                                               # pale belly
        d.line((12, 12, 12, 16), fill='#0f1c2b')                                               # gill
        d.point((10, 13), fill='#ffffff')                                                      # eye
    if name == 'planner':          # elastic band and ribbon bookmark
        d.rectangle((22, 3, 23, 25), fill='#e53935')
        d.rectangle((14, 27, 15, 31), fill='#ffca28')
    return img


def main():
    OUT.mkdir(exist_ok=True)
    names = sorted({p.stem for p in SRC.glob('*.png')} | set(DRAWN))
    sheet = Image.new('RGBA', (5 * 32 * 6, ((len(names) + 4) // 5) * 32 * 6), (255, 255, 255, 255))
    for i, name in enumerate(names):
        sprite = outline(np.array(DRAWN[name]())) if name in DRAWN else patch(name, process(SRC / f'{name}.png', COLORS.get(name, DEFAULT_COLORS)))
        sprite.save(OUT / f'{name}.png')
        big = sprite.resize((192, 192), Image.NEAREST)
        sheet.alpha_composite(big, ((i % 5) * 192, (i // 5) * 192))
    sheet.save(ROOT / 'items-v6-preview.png')
    print(f'{len(names)} sprites -> {OUT}')


main()
