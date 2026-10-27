# scenes

Every screen. The menus are a parody of a Thai delivery app: a bee-themed "BEE MAN" with the series' own look, not a copy of any real app's logo or branding. See `src/ui/README.md` for the parody rules.

## Current scenes

| Scene | File | State |
| --- | --- | --- |
| Boot | `BootScene.ts` | Generates a placeholder backdrop texture per height zone, then opens Home |
| Home | `HomeScene.ts` | Storefront: deliver-to line, search bar (opens Menu), BEE MAN banner (placeholder key art), service tiles (BeeFood, BeeMart, BeeExpress, BeeRide), episode countdown, popular menu, "Order now" |
| Menu | `MenuScene.ts` | Item guide: scrollable menu with Points / Buffs / Debuffs filter, descriptions and "prices" read from `ITEMS` |
| ComingSoon | `ComingSoonScene.ts` | Placeholder for the Orders and Promos tabs and the joke service tiles |
| Game | `GameScene.ts` | Playable loop: camera climb, falling items, height-zone backdrops and tier banners (the novel's locations), HUD (placeholder rectangles) |
| Receipt | `ReceiptScene.ts` | Zone reached, height, line items per collected item, total, "Order again" and "Menu" buttons side by side, plus a "Back to store" link |

Scenes are registered in `src/main.ts`. Scene keys live in `SCENES` in `src/core/constants.ts`.

## Design direction

The story is set in Thailand and follows a bakery shop owner and a lawyer. The playable character is a dog in a bee costume. The menu is a parody of two Thai delivery apps, LINE MAN (shop page, menu cards with prices, bottom tab bar) and Grab (the super-app grid of services), called "BEE MAN" after the dog in a bee costume. It uses the series' own name, colors and logo. Both apps' branding is trademarked; do not copy either one's logo, mascot, exact green, icons or assets.

Thai text needs a font with Thai glyphs; decide Thai, English or both for menu labels (see `src/assets/README.md`).

## Ordering-app screen to game function (built = Home, Menu)

| App screen | Game function |
| --- | --- |
| Bakery storefront with key art banner | Home screen, episode countdown |
| "Order now" button | Play |
| Menu list with item "prices" | Item guide: what each item does, price = point value |
| Order history | Your best runs |
| Top customers | Leaderboard |
| Receipt | Game over: items collected as line items, total = score |
| Promotions tab | Series links (see `src/promo`) |

## Conventions

- Scenes pass data through `scene.start(key, data)`; the Receipt receives `{ result }` (a `RunResult` from `src/core/RunState.ts`).
- Menu screens use the shared widgets in `src/ui` (see its README).
- Keep game rules out of scenes where possible; put reusable logic in `core` or `items`.
