"""Build Vimmy's compact reactions and dash poses from existing flip frames.

The sources are rotated or mirrored instead of redrawn so the proportions and palette
stay identical to the approved v1 sprite. Only a few face pixels change per reaction.
"""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "vimmy-v1"
FRONT_BASELINE = ASSETS / "buff-handkerchief.png"
FLOWER_EYE_SOURCE = ASSETS / "buff-oyster.png"
FLIP_FRONT = ASSETS / "flip-2.png"
SIDE_SOURCE = ASSETS / "flip-1.png"

INK = (25, 5, 5, 255)
TAN = (224, 144, 69, 255)
CREAM = (252, 239, 220, 255)


def base_front() -> Image.Image:
    # The manually edited handkerchief sprite owns Vimmy's front-view body, proportions, palette and forehead U.
    # Reopen the flower eyes and remove the handkerchief blush to get a neutral base for every other reaction.
    image = Image.open(FRONT_BASELINE).convert("RGBA")
    restore_flower_eyes(image)
    for point in [(22, 34), (23, 34), (35, 34), (36, 34)]:
        image.putpixel(point, TAN)
    return image


def base_dash_left() -> Image.Image:
    return Image.open(SIDE_SOURCE).convert("RGBA")


PINK = (255, 140, 170, 255)
BLUE = (79, 195, 247, 255)
HONEY = (255, 193, 7, 255)
MANGA_RED = (214, 48, 49, 255)
SKIN = {(224, 144, 69), (252, 239, 220), (240, 232, 212), (231, 165, 70), (246, 219, 185), (210, 130, 66)}

# The front face: eyes are 5px wide at x 21-25 and 33-37, y 27-33; the nose sits at x 27-31, y 33-35.
LEFT, RIGHT = 21, 33


def pts(image: Image.Image, points: list[tuple[int, int]], fill=INK) -> None:
    ImageDraw.Draw(image).point(points, fill=fill)


def both(left_points: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """The same shape on the right eye, mirrored about the face centre line (x = 29)."""
    return left_points + [(58 - x, y) for x, y in left_points]


def clear_eye(image: Image.Image, x0: int) -> None:
    """Erase one original eye (dark pixels, attached lashes and sparkle) back to tan fur."""
    for y in range(26, 34):
        for x in range(x0 - 1, x0 + 6):
            inside = x0 <= x <= x0 + 4
            r, g, b, a = image.getpixel((x, y))
            dark = r + g + b < 330 and (r, g, b) not in SKIN
            if dark or (inside and (r, g, b) in {(252, 239, 220), (200, 190, 175)}):
                image.putpixel((x, y), TAN)


def clear_eyes(image: Image.Image) -> None:
    for x0 in (LEFT, RIGHT):
        clear_eye(image, x0)


def restore_flower_eyes(image: Image.Image) -> None:
    """Copy only the eye/attached-lash pixels from the approved flower-eyed reaction onto the manual baseline."""
    source = Image.open(FLOWER_EYE_SOURCE).convert("RGBA")
    clear_eyes(image)
    for x0 in (LEFT, RIGHT):
        for y in range(26, 34):
            for x in range(x0 - 1, x0 + 6):
                r, g, b, a = source.getpixel((x, y))
                dark = r + g + b < 330 and (r, g, b) not in SKIN
                highlight = (r, g, b) in {(252, 239, 220), (200, 190, 175)}
                if a and (dark or highlight):
                    image.putpixel((x, y), (r, g, b, a))


def clear_mouth(image: Image.Image) -> None:
    ImageDraw.Draw(image).rectangle((25, 35, 33, 37), fill=CREAM)


def add_blush(image: Image.Image) -> None:
    pts(image, [(22, 34), (23, 34), (35, 34), (36, 34)], PINK)


def add_shy_blush(image: Image.Image) -> None:
    """Three tiny diagonal cheek marks make embarrassment readable at game scale."""
    left = [(19, 34), (20, 34), (20, 35), (21, 35), (22, 35), (21, 36), (22, 36)]
    pts(image, left + [(58 - x, y) for x, y in left], PINK)


def happy_closed_eyes(image: Image.Image) -> None:
    clear_eyes(image)
    pts(image, both([(21, 32), (22, 31), (23, 30), (24, 31), (25, 32)]))


def soft_closed_eyes(image: Image.Image) -> None:
    clear_eyes(image)
    pts(image, both([(21, 31), (22, 30), (23, 30), (24, 30), (25, 31)]))


def shy_downcast_eyes(image: Image.Image) -> None:
    """Small downward crescents read as bashful without looking sad or hurt."""
    clear_eyes(image)
    pts(image, both([(20, 29), (21, 29), (22, 30), (23, 31), (24, 31), (25, 30)]))


def wide_surprised_eyes(image: Image.Image) -> None:
    """Large pale eye whites with tiny pupils, deliberately unlike the oyster's dark flower eyes."""
    clear_eyes(image)
    outline = [
        (22, 27), (23, 27), (24, 27),
        (21, 28), (22, 28), (23, 28), (24, 28), (25, 28),
        *[(x, y) for y in range(29, 33) for x in range(20, 27)],
        (21, 33), (22, 33), (23, 33), (24, 33), (25, 33),
    ]
    whites = [
        (22, 28), (23, 28), (24, 28),
        *[(x, y) for y in range(29, 32) for x in range(21, 26)],
        (22, 32), (23, 32), (24, 32),
    ]
    pts(image, both(outline))
    pts(image, both(whites), CREAM)
    pts(image, [(23, 30), (35, 30)])
    # Keep Vimmy's lashes attached directly to the outer eye edges.
    pts(image, both([(20, 27), (19, 26), (20, 29)]))


def tiny_open_mouth(image: Image.Image) -> None:
    clear_mouth(image)
    pts(image, [(28, 35), (29, 35), (30, 35), (27, 36), (31, 36), (28, 37), (29, 37), (30, 37)])
    pts(image, [(29, 36)], PINK)


def tiny_worry_line(image: Image.Image) -> None:
    clear_mouth(image)
    pts(image, [(27, 36), (28, 35), (29, 35), (30, 35), (31, 36)])


def tiny_wobble_line(image: Image.Image) -> None:
    clear_mouth(image)
    pts(image, [(27, 35), (28, 36), (29, 35), (30, 36), (31, 35)])


def replace_eye_highlights(image: Image.Image, points: list[tuple[int, int]], color: tuple[int, int, int, int]) -> None:
    """Keep the black eye outlines and attached lashes, but give each reaction distinct inner highlights."""
    for x0 in (LEFT, RIGHT):
        ImageDraw.Draw(image).rectangle((x0, 28, x0 + 4, 32), fill=INK)
        pts(image, [(x0 + x, 28 + y) for x, y in points], color)


def points_faces() -> dict[str, Image.Image]:
    # Golden retriever: accurate two-wing silhouette, plain dark antennae, Vimmy's looped forehead
    # embroidery, exaggerated golden heart eyes and her original curved-line mouth.
    golden = base_front()
    add_blush(golden)
    heart = [(0, 0), (1, 0), (3, 0), (4, 0), (0, 1), (1, 1), (2, 1), (3, 1), (4, 1), (1, 2), (2, 2), (3, 2), (2, 3)]
    for x0 in (LEFT, RIGHT):
        # Retain the eye outline and attached lashes; replace only the inner flower highlight.
        ImageDraw.Draw(golden).rectangle((x0, 28, x0 + 4, 32), fill=INK)
        pts(golden, [(x0 + x, 28 + y) for x, y in heart], HONEY)
    return {"points-goldenRetriever": golden}


def debuff_faces() -> dict[str, Image.Image]:
    # Stunned: keep Vimmy's flower-highlight eyes and add two honey dizzy sparkles.
    stunned = base_front()
    pts(stunned, [(19, 27), (18, 28), (19, 28), (20, 28), (19, 29)], HONEY)
    pts(stunned, [(39, 26), (38, 27), (39, 27), (40, 27), (39, 28)], HONEY)
    tiny_wobble_line(stunned)
    add_blush(stunned)

    # Planner disappointment: cute squeezed eyes, a line-mouth pout and a small manga anger mark.
    disappointed = base_front()
    soft_closed_eyes(disappointed)
    tiny_worry_line(disappointed)
    add_blush(disappointed)
    anger_mark = [
        (39, 21), (39, 22), (40, 22), (40, 23),
        (43, 21), (43, 22), (42, 22), (42, 23),
        (39, 27), (39, 26), (40, 26), (40, 25),
        (43, 27), (43, 26), (42, 26), (42, 25),
    ]
    pts(disappointed, anger_mark, MANGA_RED)

    # Queasy: gently squeezed eyes and a tiny uncertain mouth, without sickly face tinting.
    queasy = base_front()
    soft_closed_eyes(queasy)
    tiny_worry_line(queasy)
    add_blush(queasy)

    # Crash: wide round eyes and tiny tears: startled, but never hurt-looking.
    crash = base_front()
    round_highlight = [(1, 1), (2, 1), (3, 1), (1, 2), (2, 2), (3, 2), (2, 3)]
    replace_eye_highlights(crash, round_highlight, CREAM)
    pts(crash, [(20, 32), (20, 33), (38, 32), (38, 33)], BLUE)
    tiny_worry_line(crash)
    add_blush(crash)

    # Dog ears: downcast crescent eyes, strong cheek marks and a nervous little mouth.
    embarrassed = base_front()
    shy_downcast_eyes(embarrassed)
    tiny_wobble_line(embarrassed)
    add_shy_blush(embarrassed)
    return {
        "debuff-stunned": stunned,
        "debuff-disappointed": disappointed,
        "debuff-queasy": queasy,
        "debuff-crash": crash,
        "debuff-embarrassed": embarrassed,
    }


def buff_faces() -> dict[str, Image.Image]:
    # Oyster: the approved star-eyed face, unchanged.
    oyster = base_front()

    # Lawyer suit: one confident wink, one flower eye and the original curved-line mouth.
    shield = base_front()
    clear_eye(shield, LEFT)
    pts(shield, [(21, 31), (22, 30), (23, 29), (24, 30), (25, 31)])
    add_blush(shield)

    # Handkerchief: happy closed eyes, blush and a soft smile.
    relieved = base_front()
    happy_closed_eyes(relieved)
    add_blush(relieved)

    # Rolling pin: golden sparkle pupils and the original line mouth, without floating brows or gritted teeth.
    power = base_front()
    diamond_highlight = [(2, 0), (1, 1), (2, 1), (3, 1), (2, 2)]
    replace_eye_highlights(power, diamond_highlight, HONEY)
    add_blush(power)

    # Helicopter: large pale eyes and a tiny open mouth, unmistakably different from oyster's flower eyes.
    surprised = base_front()
    wide_surprised_eyes(surprised)
    tiny_open_mouth(surprised)
    add_blush(surprised)

    return {
        "buff-oyster": oyster,
        "buff-lawyerSuit": shield,
        "buff-handkerchief": relieved,
        "buff-rollingPin": power,
        "buff-helicopter": surprised,
    }


def dash_faces() -> dict[str, Image.Image]:
    left = base_dash_left()
    # One bright eye pixel makes the sideways pose read as alert rather than unconscious.
    ImageDraw.Draw(left).point((22, 29), fill=CREAM)
    return {
        "dash-left": left,
        "dash-right": left.transpose(Image.Transpose.FLIP_LEFT_RIGHT),
    }


def sync_flip_forehead() -> None:
    """Copy the manual baseline's forehead patch onto the upside-down front flip frame."""
    baseline = Image.open(FRONT_BASELINE).convert("RGBA")
    upright = Image.open(FLIP_FRONT).convert("RGBA").rotate(180)
    box = (24, 19, 35, 28)  # cream forehead patch surrounding the small U
    upright.paste(baseline.crop(box), box)
    upright.rotate(180).save(FLIP_FRONT, optimize=True)


def make() -> None:
    points = points_faces()
    buffs = buff_faces()
    actions = {**dash_faces(), **debuff_faces()}
    for name, image in {**points, **buffs, **actions}.items():
        image.save(ASSETS / f"{name}.png", optimize=True)

    preview = Image.new("RGBA", (64 * 3, 64 * 2), (255, 255, 255, 255))
    for index, image in enumerate([*buffs.values(), *points.values()]):
        preview.alpha_composite(image, ((index % 3) * 64, (index // 3) * 64))
    preview.resize((64 * 3 * 4, 64 * 2 * 4), Image.Resampling.NEAREST).convert("RGB").save(
        ROOT / "src" / "assets" / "vimmy-v1-buff-preview.png",
        optimize=True,
    )

    action_rows = (len(actions) + 2) // 3
    action_preview = Image.new("RGBA", (64 * 3, 64 * action_rows), (255, 255, 255, 255))
    for index, image in enumerate(actions.values()):
        action_preview.alpha_composite(image, ((index % 3) * 64, (index // 3) * 64))
    action_preview.resize((64 * 3 * 4, 64 * action_rows * 4), Image.Resampling.NEAREST).convert("RGB").save(
        ROOT / "src" / "assets" / "vimmy-v1-action-preview.png",
        optimize=True,
    )
    sync_flip_forehead()


if __name__ == "__main__":
    make()
