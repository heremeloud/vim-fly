# Pixel-art resources and production record

Free packs were evaluated during the item-art rebuild. The unused local vendor mirrors were removed after the custom set was completed; the links and licenses remain here so the research is not lost.

## Downloaded packs

| Pack | Creator | License | AI disclosure | Project status |
| --- | --- | --- | --- | --- |
| [Free Pixel foods](https://ghostpixxells.itch.io/pixelfood) | ghostpixxells | CC0 1.0; commercial use and modification allowed, attribution not required | Itch.io lists **No generative AI was used** | Evaluated, not used in the active set |
| [Pixel Mart](https://ghostpixxells.itch.io/pixel-mart) | ghostpixxells | CC0 1.0; commercial use and modification allowed, attribution not required | Itch.io lists **No generative AI was used** | Rolling pin and white wine retained in the active set |
| [FREE Pixel Art - Food Pack](https://karsiori.itch.io/free-pixel-art-food-pack) | Karsiori Studio | CC0 1.0; commercial use and modification allowed, attribution not required | Itch.io lists **No generative AI was used** | Evaluated, not used in the active set |

Even when attribution is optional, credit both creators in the shipped game as a courtesy.

## Active item set

`items-v5/` contains all nineteen active runtime sprites at exactly 32x32. Each uses at most 20 colors plus transparency, with no dithering. `items-v4/` remains as the previous 48x48 pass; `items-v4-sources/` contains its seventeen generated masters and prompt record. The rolling pin and white wine originate from the two approved Pixel Mart sprites.

The current full-set contact sheet is [`items-v5-preview.png`](items-v5-preview.png).

The lawyer item depicts a black Thai courtroom advocate gown over a white shirt, with the yellow/white ceremonial ribbon retained and the necktie removed.

The v5 planner is deliberately reduced to a plain black book. Cilantro bread and fish-sauce bread now use the same oval golden bread base, distinguished only by their green-leaf and amber-drizzle toppings.

For small-screen recognition, coffee contains only its cup and oyster contains only its open shell. The mechanically or visually complex sprites use reduced palettes rather than cast shadows or micro-texture. Runtime sizing is independent of the 32x32 files: ordinary items render at 48px, helicopter at 60px and car crash at 64px.

Car crash now uses a single green compact car with one yellow-orange impact mark at its front; the earlier two-car miniature was removed.

Gavel hammer now contains only a single wooden courtroom gavel; its separate sound block was removed.

## Style rules

- Use transparent backgrounds, strong silhouettes and restrained warm outlines.
- Keep story-defining details readable at 32x32: pandan filling, ham-and-cheese layers, honey, shrimp, ribbon, fish-sauce cue and impact spark.
- Use nearest-neighbour filtering in the game and during runtime export.
- Keep the generated masters so future edits do not need to work from a 48x48 export.

## Current status

Complete. `BootScene` loads only `items-v5/`
