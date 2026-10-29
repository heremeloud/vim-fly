# scenes

Every screen. The menus are a parody of a Thai delivery app: a bee-themed app called "VIMMY FLY" with the series' own visual identity, not a copy of any real app's logo or assets. See `src/ui/README.md` for the parody rules.

## Current scenes

| Scene | File | State |
| --- | --- | --- |
| Boot | `BootScene.ts` | Loads Vimmy, item, promo and emoji assets; builds fallback backdrops; then opens Home |
| Home | `HomeScene.ts` | Storefront with settings, language picker, search, VIMMY FLY banner, service shortcuts, pilot strip, popular menu and "Order now" |
| Menu | `MenuScene.ts` | Item guide: scrollable menu with Points / Buffs / Debuffs filter, descriptions and "prices" read from `ITEMS` |
| Orders | `OrdersScene.ts` | "My orders" from the local run store and the worldwide top 100 from Supabase, with an offline local fallback |
| Promos | `PromosScene.ts` | The Bake Love Feeling page: watch the pilot (plays in a window), then account cards with avatars (the official account as a wide card, the two main leads side by side, and Vimmy as a small one-line row). Each card shows round X / Instagram / TikTok / YouTube icon buttons only for platforms that are set up, or one quiet \"soon\" tag |
| Game | `GameScene.ts` | Complete loop with animated Vimmy, illustrated falling items, difficulty curve, location backdrops, themed rush finales, HUD and effects |
| Receipt | `ReceiptScene.ts` | Zone reached, height, the item lines (a scrolling list, so a long receipt never overlaps), total, a \"new best\" star, **the pilot player right on the receipt** (poster with a play button, no autoplay), \"Order again\" and \"Menu\" buttons, and a \"Back to store\" link. Also saves the run to the order history |
| Fx (admin) | `FxScene.ts` | Local-only effects page, open with `npm run dev` then `/?fx`: every finale board (drawn by `ui/boards.ts`), status badge, reaction picture, header blob face, the sideways dash and the pop-ups, all using the same code as the game. Has links to the sound page (`/?sfx`) |

Scenes are registered in `src/main.ts`. Scene keys live in `SCENES` in `src/core/constants.ts`.

## Design direction

The story is set in Thailand and follows a bakery shop owner and a lawyer. The playable character is a dog in a bee costume. The menu is a parody of two Thai delivery apps, LINE MAN (shop page, menu cards with prices, bottom tab bar) and Grab (the super-app grid of services), called "VIMMY FLY" after the dog in a bee costume who delivers. It uses the series' own colors and logo. Both apps' branding is trademarked; do not copy either one's logo, mascot, exact green, icons or assets.

Thai text needs a font with Thai glyphs; decide Thai, English or both for menu labels (see `src/assets/README.md`).

## Ordering-app screen to game function

| App screen | Game function |
| --- | --- |
| Bakery storefront with key art banner | Home screen, episode countdown |
| "Order now" button | Play |
| Menu list with item "prices" | Item guide: what each item does, price = point value |
| Order history / Top customers (the Orders tab) | Your local best runs and the worldwide ladder |
| Receipt | Game over: items collected as line items, total = score |
| Promotions tab | The Bake Love Feeling page: the series, its stars, links and where to watch (see `src/promo`). Built; links are edited in `src/promo/links.json` |

## Conventions

- Scenes pass data through `scene.start(key, data)`; the Receipt receives `{ result }` (a `RunResult` from `src/core/RunState.ts`).
- All text goes through `t()` from `src/i18n` (five languages, see its README). Never hard-code English in a scene.
- Menu screens use the shared widgets in `src/ui` (see its README).
- Keep game rules out of scenes where possible; put reusable logic in `core` or `items`.
