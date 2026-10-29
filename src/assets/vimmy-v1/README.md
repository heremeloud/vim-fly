# Vimmy v1 playable sprite

Eighteen transparent 64x64 pixel-art frames replace the game's placeholder player rectangle.

## Character reference

- Front identity reference: `/Users/fran/Downloads/1.jpeg`
- Back costume reference: `/Users/fran/Downloads/2.jpeg`
- Character: warm-tan cocker spaniel dog in a black-and-yellow bee suit
- Defining features: very large fluffy dark-brown ears, yellow petal skirt, two tiny water-blue back wings, lashes attached directly to the eyes—never detached eyebrows—and the same tiny centered caramel U on every frame where it is visible

The original photos are references only and are not bundled into the game.

## Animations

- `fly-0.png` through `fly-3.png`: looping back-view flight. The body remains stable while the ears wave and both blue wings flap.
- `flip-0.png` through `flip-3.png`: one backward somersault after contacting the helicopter item. The sequence rotates through back, side, upside-down front and recovery views while ears and wings continue moving.
- `buff-oyster.png`: the approved star-eyed front face, unchanged, for double points.
- `buff-lawyerSuit.png`: a confident wink, one flower eye and blush for the shield, keeping Vimmy's original curved-line mouth.
- `buff-handkerchief.png`: relieved closed eyes and blush for cleanse, keeping Vimmy's original curved-line mouth.
- `buff-rollingPin.png`: golden sparkle pupils and blush for stronger flaps, keeping the original line mouth and looking cheerful rather than angry.
- `buff-helicopter.png`: wide round pupils and blush before the existing backward flip; the floating icon reinforces the surprise while her mouth stays the original line.
- `points-goldenRetriever.png`: an extra-joyful face with bright golden heart-shaped eyes, blush, the original curved-line mouth and the mascot's tiny centered caramel U. It preserves the black eye outlines, attached lashes, two-wing silhouette and plain dark antennae.
- `dash-left.png` and `dash-right.png`: mirrored streamlined side views used by the emergency swipe dash. The face remains alert and the large ears trail behind the movement.
- `debuff-stunned.png`: flower-eyed dizzy surprise with honey sparkles and a tiny wobbling line mouth for the gavel hammer.
- `debuff-disappointed.png`: a planner-specific cute annoyed face with squeezed eyes, a tiny line-mouth pout and a red manga anger mark.
- `debuff-queasy.png`: gently squeezed eyes, blush and a tiny uncertain mouth, shared by cilantro and fish sauce bread.
- `debuff-crash.png`: wide round eyes, tiny blue tears, blush and a small worried line mouth for the car crash—startled, but never hurt-looking.

During normal flight the 64x64 frames display at 80x80. Front reactions pop to 120x120 over a high-contrast white disc: regular faces hold for 760 ms, the stronger crash face for 940 ms, the golden retriever celebration for 1100 ms, and the helicopter face for 380 ms before flowing into the existing somersault. This presentation makes the tiny eye and mouth changes readable against moving backdrops without changing the character art or collision size. Each reaction also pops an emoji above her head (drawn by the game, not part of the sprite) so the reactions are easy to tell apart. The dash pose remains visible for the full sideways movement and faces its travel direction. All frames use nearest-neighbour filtering, and collision remains a smaller 44px hit box.

## Reactions

`scripts/make-vimmy-reactions.py` uses the manually edited `buff-handkerchief.png` as the canonical front-view body/style baseline. It preserves that sprite's proportions, palette and forehead U, restores the approved flower eyes for a neutral base, and then changes only the pixels needed for each expression. The exact forehead patch is also copied onto the upside-down front view in `flip-2.png`; side-view dash poses still come from the flip animation.
