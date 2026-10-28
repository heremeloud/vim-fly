# assets

Art, animation and sound. The active item set is the complete 32x32, palette-limited collection in `items-v5/`. It is derived from the v4 art but intentionally reduced to a maximum of 20 colors per sprite so it feels less polished and more like native game pixel art. Phaser displays the sprites at 48x48 in gameplay and primary item cards using nearest-neighbour filtering, keeping them larger and crisp without increasing the source resolution. The Thai courtroom lawyer item keeps its black gown and yellow/white ceremonial ribbon but has no tie. `items-v4/` and `items-v4-sources/` remain as the previous pass and editable masters. Zone backdrops are not image files: each is a flat color, a seam line and two emoji drawn in code (`src/core/zoneIcons.ts`).

## Approach

Start with free CC0 packs from [Kenney.nl](https://kenney.nl), then replace them with original art. Check every pack's license before shipping.

## License ledger

Add a row for every third-party file or pack you use.

| Asset / pack | Source | License | Attribution required | Used for |
| --- | --- | --- | --- | --- |
| X, Instagram and TikTok icons (`src/assets/icons`) | Simple Icons (simpleicons.org) | CC0 1.0 for the shapes; the logos belong to the platforms | No; used only to link to the platforms' own pages | Social buttons on the Promos page |
| Noto Sans Thai (Thai glyphs, weights 400 and 700) | `@fontsource/noto-sans-thai` (npm) | SIL Open Font License 1.1 | No (keep the license with the font files) | Thai text everywhere |
| Pixel Mart | [ghostpixxells on itch.io](https://ghostpixxells.itch.io/pixel-mart) | CC0 1.0 | No | Active white-wine and rolling-pin sprites |

The item-production record and free-resource links are in [RESOURCES.md](RESOURCES.md).

## Where to look

| Need | Resource | License |
| --- | --- | --- |
| Art | Kenney.nl | CC0 |
| Art | itch.io Game Assets | Varies |
| Art | OpenGameArt.org | Mixed, read each |
| Art | CraftPix.net | Free and paid |
| Sound effects | jsfxr / ChipTone | Generated, free |
| Sound effects | Freesound.org | Mixed, read each |
| Music | Incompetech | Free with attribution |

## Backdrops

One tileable (vertically repeating) image per height zone, ten in all, one per location in the novel (rural road, heartwarming bakery, suburban cafés, shopping mall, CC law office, fitness gym, courtroom, beach, Noey's residence, Bake Love Bakery). They are generated at startup from a flat color plus themed emoji (`src/core/zoneIcons.ts`). See `src/core/ZONES.md`.

## Branding

The in-game delivery app is a parody of LINE MAN and Grab called VIMMY (see `src/ui/README.md`). It needs its own logo and a bee mascot; do not reuse either real app's logo or mascot.

## Character

The playable character is a dog in a bee costume. Needs idle/flap, boost and hurt/stunned frames.

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
