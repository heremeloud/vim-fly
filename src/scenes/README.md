# scenes

Every screen. The menus are styled as a bakery food-ordering app, using the series' own name and colors, not a copy of a real delivery app's logo or look.

## Current scenes

| Scene | File | State |
| --- | --- | --- |
| Boot | `BootScene.ts` | Generates a placeholder backdrop texture per height zone, then opens Home |
| Home | `HomeScene.ts` | Storefront: banner (placeholder key art), shop info, episode countdown, popular menu, "Order now" |
| Menu | `MenuScene.ts` | Item guide: scrollable menu with Points / Buffs / Debuffs filter, descriptions and "prices" read from `ITEMS` |
| ComingSoon | `ComingSoonScene.ts` | Placeholder for the Orders and Promos tabs |
| Game | `GameScene.ts` | Playable loop: camera climb, falling items, height-zone backdrops and banners, HUD (placeholder rectangles) |
| Receipt | `ReceiptScene.ts` | Zone reached, height, line items per collected item, total, "Order again" and "Back to store" |

Scenes are registered in `src/main.ts`. Scene keys live in `SCENES` in `src/core/constants.ts`.

## Design direction

The story is set in Thailand and follows a bakery shop owner and a lawyer. The playable character is a dog in a bee costume. The menu style is inspired by the layout conventions of Thai delivery apps such as LINE MAN (storefront header, category chips, menu cards with prices, bottom tab bar, order status), but must use the series' own name, colors and logo. LINE MAN's branding is trademarked; do not copy its logo, exact green, icons or assets.

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
