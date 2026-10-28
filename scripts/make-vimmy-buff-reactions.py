"""Build five subtle front-view Vimmy reactions from the existing flip frame.

The source is rotated instead of redrawn so the face, proportions and palette stay
identical to the approved v1 sprite. Only a few face pixels change per reaction.
"""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "vimmy-v1"
SOURCE = ASSETS / "flip-2.png"

INK = (25, 5, 5, 255)
TAN = (224, 144, 69, 255)
CREAM = (252, 239, 220, 255)


def base_front() -> Image.Image:
    return Image.open(SOURCE).convert("RGBA").rotate(180)


def add_brows(image: Image.Image, strong: bool = False) -> None:
    draw = ImageDraw.Draw(image)
    if strong:
        draw.point([(24, 28), (25, 29), (26, 29), (39, 28), (38, 29), (37, 29)], fill=INK)
    else:
        draw.point([(24, 29), (25, 28), (38, 28), (39, 29)], fill=INK)


def closed_eyes(image: Image.Image) -> None:
    draw = ImageDraw.Draw(image)
    # Remove only the four-pixel eye cores, keeping the original outline and face shading.
    draw.rectangle((25, 30, 28, 33), fill=TAN)
    draw.rectangle((35, 30, 38, 33), fill=TAN)
    draw.point([(25, 31), (26, 32), (27, 32), (28, 31)], fill=INK)
    draw.point([(35, 31), (36, 32), (37, 32), (38, 31)], fill=INK)


def small_o_mouth(image: Image.Image) -> None:
    draw = ImageDraw.Draw(image)
    draw.rectangle((30, 34, 34, 36), fill=CREAM)
    draw.point([(31, 34), (32, 34), (33, 34), (31, 35), (33, 35), (31, 36), (32, 36), (33, 36)], fill=INK)


def make() -> None:
    reactions: dict[str, Image.Image] = {}

    # Oyster: the approved star-eyed face is kept pixel-for-pixel.
    reactions["buff-oyster"] = base_front()

    shield = base_front()
    add_brows(shield)
    reactions["buff-lawyerSuit"] = shield

    relieved = base_front()
    closed_eyes(relieved)
    reactions["buff-handkerchief"] = relieved

    power = base_front()
    add_brows(power, strong=True)
    reactions["buff-rollingPin"] = power

    surprised = base_front()
    small_o_mouth(surprised)
    reactions["buff-helicopter"] = surprised

    for name, image in reactions.items():
        image.save(ASSETS / f"{name}.png", optimize=True)

    preview = Image.new("RGBA", (64 * 3, 64 * 2), (255, 255, 255, 255))
    for index, image in enumerate(reactions.values()):
        preview.alpha_composite(image, ((index % 3) * 64, (index // 3) * 64))
    preview.resize((64 * 3 * 4, 64 * 2 * 4), Image.Resampling.NEAREST).convert("RGB").save(
        ROOT / "src" / "assets" / "vimmy-v1-buff-preview.png",
        optimize=True,
    )


if __name__ == "__main__":
    make()
