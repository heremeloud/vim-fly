# Vimmy v1 playable sprite

Eighteen transparent 64x64 pixel-art frames replace the game's placeholder player rectangle.

## Character reference

- Front identity reference: `/Users/fran/Downloads/1.jpeg`
- Back costume reference: `/Users/fran/Downloads/2.jpeg`
- Character: warm-tan cocker spaniel dog in a black-and-yellow bee suit
- Defining features: very large fluffy dark-brown ears, yellow petal skirt and two tiny water-blue back wings

The original photos are references only and are not bundled into the game.

## Animations

- `fly-0.png` through `fly-3.png`: looping back-view flight. The body remains stable while the ears wave and both blue wings flap.
- `flip-0.png` through `flip-3.png`: one backward somersault after contacting the helicopter item. The sequence rotates through back, side, upside-down front and recovery views while ears and wings continue moving.
- `buff-oyster.png`: the approved star-eyed front face, unchanged, for double points.
- `buff-lawyerSuit.png`: a subtly confident front face for the shield.
- `buff-handkerchief.png`: relieved closed eyes for cleanse.
- `buff-rollingPin.png`: determined brows for stronger flaps.
- `buff-helicopter.png`: a small surprised mouth before the existing backward flip.
- `dash-left.png` and `dash-right.png`: mirrored streamlined side views used by the emergency swipe dash. The face remains alert and the large ears trail behind the movement.
- `debuff-stunned.png`: X-eyed dizzy face shared by the planner and gavel hammer.
- `debuff-queasy.png`: closed, worried face shared by cilantro and fish sauce bread.
- `debuff-crash.png`: shocked hurt face reserved for the car crash.

The regular front reactions last 560 ms, while the stronger crash face lasts 700 ms. The helicopter reaction lasts 280 ms and flows directly into the existing somersault. The dash pose remains visible for the full sideways movement and faces its travel direction. All frames use nearest-neighbour filtering. Gameplay displays the 64x64 frames at native size while collision remains a smaller 40px hit box.

## Generation

Built-in ImageGen created two transparent 2x2 animation sheets using both supplied photos as identity/costume references. The normal-flight sheet was also used as the character anchor for the flip sheet. Each quadrant was cropped, palette-limited to 24 colors without dithering and exported as a 64x64 PNG.

The added reactions are deliberately not AI-redrawn. `scripts/make-vimmy-reactions.py` rotates or mirrors approved frames from the flip animation and changes only a few face pixels, preserving the exact proportions, palette and star-eyed face.
