"""Build Vimmy's compact reactions and dash poses from existing flip frames.

The sources are rotated or mirrored instead of redrawn so the proportions and palette
stay identical to the approved v1 sprite. Only a few face pixels change per reaction.
"""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "vimmy-v1"
FRONT_SOURCE = ASSETS / "flip-2.png"
SIDE_SOURCE = ASSETS / "flip-1.png"

INK = (25, 5, 5, 255)
TAN = (224, 144, 69, 255)
CREAM = (252, 239, 220, 255)


def base_front() -> Image.Image:
    return Image.open(FRONT_SOURCE).convert("RGBA").rotate(180)


def base_dash_left() -> Image.Image:
    return Image.open(SIDE_SOURCE).convert("RGBA")


PINK = (255, 140, 170, 255)
BLUE = (79, 195, 247, 255)
HONEY = (255, 193, 7, 255)
SKIN = {(224, 144, 69), (252, 239, 220), (240, 232, 212), (231, 165, 70), (246, 219, 185), (210, 130, 66)}

# The front face: eyes are 5px wide at x 21-25 and 33-37, y 27-33; the nose sits at x 27-31, y 33-35.
LEFT, RIGHT = 21, 33


def pts(image: Image.Image, points: list[tuple[int, int]], fill=INK) -> None:
    ImageDraw.Draw(image).point(points, fill=fill)


def both(left_points: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """The same shape on the right eye, mirrored about the face centre line (x = 29)."""
    return left_points + [(58 - x, y) for x, y in left_points]


def clear_eyes(image: Image.Image) -> None:
    """Erase the original eyes (dark pixels, lashes and sparkle) back to the tan fur."""
    for x0 in (LEFT, RIGHT):
        for y in range(26, 34):
            for x in range(x0 - 1, x0 + 6):
                inside = x0 <= x <= x0 + 4
                r, g, b, a = image.getpixel((x, y))
                dark = r + g + b < 330 and (r, g, b) not in SKIN
                if dark or (inside and (r, g, b) in {(252, 239, 220), (200, 190, 175)}):
                    image.putpixel((x, y), TAN)


def clear_mouth(image: Image.Image) -> None:
    ImageDraw.Draw(image).rectangle((25, 36, 33, 37), fill=CREAM)


def add_blush(image: Image.Image) -> None:
    pts(image, [(22, 34), (23, 34), (35, 34), (36, 34)], PINK)


def happy_closed_eyes(image: Image.Image) -> None:
    clear_eyes(image)
    pts(image, both([(21, 32), (22, 31), (23, 30), (24, 31), (25, 32)]))


def soft_closed_eyes(image: Image.Image) -> None:
    clear_eyes(image)
    pts(image, both([(21, 31), (22, 30), (23, 30), (24, 30), (25, 31)]))


def soft_smile(image: Image.Image) -> None:
    clear_mouth(image)
    pts(image, [(26, 36), (27, 37), (28, 37), (29, 37), (30, 37), (31, 36)])


def tiny_gasp(image: Image.Image) -> None:
    clear_mouth(image)
    ImageDraw.Draw(image).rectangle((28, 36, 30, 37), fill=INK)


def debuff_faces() -> dict[str, Image.Image]:
    # Stunned: keep Vimmy's flower-highlight eyes and add two honey dizzy sparkles.
    stunned = base_front()
    pts(stunned, [(19, 27), (18, 28), (19, 28), (20, 28), (19, 29)], HONEY)
    pts(stunned, [(39, 26), (38, 27), (39, 27), (40, 27), (39, 28)], HONEY)
    tiny_gasp(stunned)
    add_blush(stunned)

    # Queasy: gently squeezed eyes and a tiny uncertain mouth, without sickly face tinting.
    queasy = base_front()
    soft_closed_eyes(queasy)
    clear_mouth(queasy)
    pts(queasy, [(27, 37), (28, 36), (29, 36), (30, 36), (31, 37)])
    add_blush(queasy)

    # Crash: startled closed eyes, tiny tears and a gasp—upset, but never hurt-looking.
    crash = base_front()
    soft_closed_eyes(crash)
    pts(crash, [(20, 32), (20, 33), (38, 32), (38, 33)], BLUE)
    tiny_gasp(crash)
    add_blush(crash)
    return {
        "debuff-stunned": stunned,
        "debuff-queasy": queasy,
        "debuff-crash": crash,
    }


def buff_faces() -> dict[str, Image.Image]:
    # Oyster: the approved star-eyed face, unchanged.
    oyster = base_front()

    # Lawyer suit: bright flower eyes, soft confident brows and a smile.
    shield = base_front()
    pts(shield, both([(21, 25), (22, 24), (23, 24), (24, 24), (25, 25)]))
    soft_smile(shield)
    add_blush(shield)

    # Handkerchief: happy closed eyes, blush and a soft smile.
    relieved = base_front()
    happy_closed_eyes(relieved)
    add_blush(relieved)
    soft_smile(relieved)

    # Rolling pin: brave flower eyes and softly raised brows, not anger or gritted teeth.
    power = base_front()
    pts(power, both([(21, 25), (22, 24), (23, 24), (24, 24), (25, 25)]))
    soft_smile(power)
    add_blush(power)

    # Helicopter: raised brows and a small gasp.
    surprised = base_front()
    pts(surprised, both([(21, 24), (22, 23), (23, 23), (24, 23), (25, 24)]))
    tiny_gasp(surprised)
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


def make() -> None:
    buffs = buff_faces()
    actions = {**dash_faces(), **debuff_faces()}
    for name, image in {**buffs, **actions}.items():
        image.save(ASSETS / f"{name}.png", optimize=True)

    preview = Image.new("RGBA", (64 * 3, 64 * 2), (255, 255, 255, 255))
    for index, image in enumerate(buffs.values()):
        preview.alpha_composite(image, ((index % 3) * 64, (index // 3) * 64))
    preview.resize((64 * 3 * 4, 64 * 2 * 4), Image.Resampling.NEAREST).convert("RGB").save(
        ROOT / "src" / "assets" / "vimmy-v1-buff-preview.png",
        optimize=True,
    )

    action_preview = Image.new("RGBA", (64 * 3, 64 * 2), (255, 255, 255, 255))
    for index, image in enumerate(actions.values()):
        action_preview.alpha_composite(image, ((index % 3) * 64, (index // 3) * 64))
    action_preview.resize((64 * 3 * 4, 64 * 2 * 4), Image.Resampling.NEAREST).convert("RGB").save(
        ROOT / "src" / "assets" / "vimmy-v1-action-preview.png",
        optimize=True,
    )


if __name__ == "__main__":
    make()
