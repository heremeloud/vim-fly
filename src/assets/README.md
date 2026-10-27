# assets

Art, animation and sound. Empty for now: the base uses placeholder shapes.

## Approach

Start with free CC0 packs from [Kenney.nl](https://kenney.nl), then replace them with original art. Check every pack's license before shipping.

## License ledger

Add a row for every third-party file or pack you use.

| Asset / pack | Source | License | Attribution required | Used for |
| --- | --- | --- | --- | --- |
| (none yet) | | | | |

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

One tileable (vertically repeating) image per height zone: bakery street, downtown rooftops, the courthouse, above the clouds. See `src/core/zones.ts`.

## Branding

The in-game delivery app is a parody called BEE MAN (see `src/ui/README.md`). It needs its own logo and a bee mascot; do not reuse any real app's logo or mascot.

## Character

The playable character is a dog in a bee costume. Needs idle/flap, boost and hurt/stunned frames.

## Thai text

The menus are set in Thailand. Pick a font with Thai glyphs (for example Noto Sans Thai, SIL OFL) and check its license before shipping.

## Animation scope

About 3 animations for the character: idle/flap (4-6 frames), a boost pose, and a hurt/stunned pose. Squash-and-stretch tweens in code add charm for free.

## Conventions

- Put files under `src/assets/` in subfolders such as `sprites/`, `audio/`, `ui/`.
- Load them in `BootScene.preload`.
- Pack sprite frames into sheets (TexturePacker free tier) that Phaser can load directly.
