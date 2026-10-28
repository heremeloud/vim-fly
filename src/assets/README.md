# assets

Art, animation and sound. The active item set is the complete 32x32 collection in `items-v6/`. Phaser displays the sprites at 48x48 in gameplay and primary item cards using nearest-neighbour filtering, keeping them larger and crisp without increasing the source resolution. The Thai courtroom lawyer item keeps its black gown and yellow/white ceremonial ribbon but has no tie. Earlier passes remain available as editable references. Zone backdrops are not image files: each is a flat color, a seam line and two emoji drawn in code (`src/core/zoneIcons.ts`).

## Backdrops

One tileable (vertically repeating) image per height zone, ten in all, one per location in the novel (rural road, heartwarming bakery, suburban cafés, shopping mall, CC law office, fitness gym, courtroom, beach, Noey's residence, Bake Love Bakery). They are generated at startup from a flat color plus themed emoji (`src/core/zoneIcons.ts`). See `src/core/ZONES.md`.

## Branding

The in-game delivery app is called VIMMY FLY (see `src/ui/README.md`). It needs its own logo and a bee mascot.

## Character

The playable cocker spaniel in a bee costume is implemented in `vimmy-v1/`. Four back-view normal-flight frames animate her large fluffy ears and tiny water-blue wings. Five brief front-view buff reactions use her approved star-eyed face, two side-view poses face the direction of an emergency dash, and three compact negative faces cover queasy, stunned and crash effects. Four helicopter-contact frames perform a backward somersault before returning to normal flight. Full-resolution sheet masters are in `vimmy-v1-sources/`.

## Fonts for Thai, Japanese and Chinese

The game is in four languages (`src/i18n/README.md`).

- **Thai:** **Noto Sans Thai** (weights 400 and 700) is bundled from the `@fontsource/noto-sans-thai` package (SIL OFL). Device fallback fonts for Thai can look odd, so it is listed first in `FONT.family` (`src/ui/theme.ts`); it only covers Thai characters, so Latin text still uses the device font. `main.ts` waits for it to load (up to 3 s) before the first screen draws, because text on the canvas is drawn once.
- **Japanese and Chinese:** these use the device's own fonts (Hiragino, PingFang, Noto and so on), with Noto Sans JP / SC as fallbacks. Bundling them is possible later, but CJK fonts are large.

## Animation scope

About 3 animations for the character: idle/flap (4-6 frames), a boost pose, and a hurt/stunned pose. Squash-and-stretch tweens in code add charm for free.

## Conventions

- Put files under `src/assets/` in subfolders such as `sprites/`, `audio/`, `ui/`.
- Load them in `BootScene.preload`.
- Pack sprite frames into sheets (TexturePacker free tier) that Phaser can load directly.
