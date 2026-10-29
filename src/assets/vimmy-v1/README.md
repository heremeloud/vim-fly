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
- `buff-lawyerSuit.png`: bright flower eyes, soft confident brows, blush and a smile for the shield.
- `buff-handkerchief.png`: relieved closed eyes, blush and a soft smile for cleanse.
- `buff-rollingPin.png`: brave flower eyes and softly raised brows for stronger flaps, cheerful rather than angry.
- `buff-helicopter.png`: a small surprised mouth and blush before the existing backward flip.
- `dash-left.png` and `dash-right.png`: mirrored streamlined side views used by the emergency swipe dash. The face remains alert and the large ears trail behind the movement.
- `debuff-stunned.png`: flower-eyed dizzy surprise with honey sparkles, shared by the planner and gavel hammer.
- `debuff-queasy.png`: gently squeezed eyes, blush and a tiny uncertain mouth, shared by cilantro and fish sauce bread.
- `debuff-crash.png`: startled closed eyes, tiny blue tears, blush and a gasp for the car crash—upset, but never hurt-looking.

During normal flight the 64x64 frames display at 80x80. Front reactions pop to 120x120 over a high-contrast white disc: regular faces hold for 760 ms, the stronger crash face for 940 ms, and the helicopter face for 380 ms before flowing into the existing somersault. This presentation makes the tiny eye and mouth changes readable against moving backdrops without changing the character art or collision size. Each reaction also pops an emoji above her head (drawn by the game, not part of the sprite) so the reactions are easy to tell apart. The dash pose remains visible for the full sideways movement and faces its travel direction. All frames use nearest-neighbour filtering, and collision remains a smaller 44px hit box.

## Reactions

`scripts/make-vimmy-reactions.py` builds the added reactions by rotating or mirroring approved frames from the flip animation and changing only a few face pixels, preserving the exact proportions, palette and star-eyed face.
