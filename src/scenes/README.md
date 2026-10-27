# scenes

Every screen. The menus are styled as a bakery food-ordering app, using the series' own name and colors, not a copy of a real delivery app's logo or look.

## Current scenes

| Scene | File | State |
| --- | --- | --- |
| Boot | `BootScene.ts` | Generates a placeholder backdrop texture per height zone, then opens Home |
| Home | `HomeScene.ts` | Title and "Order now" button (placeholder) |
| Game | `GameScene.ts` | Playable loop: camera climb, falling items, height-zone backdrops and banners, HUD (placeholder rectangles) |
| Receipt | `ReceiptScene.ts` | Line items per collected item, height and total, "Order again" |

Scenes are registered in `src/main.ts`. Scene keys live in `SCENES` in `src/core/constants.ts`.

## Design direction

The story is set in Thailand and follows a bakery shop owner and a lawyer. The playable character is a dog in a bee costume. The menu style is inspired by the layout conventions of Thai delivery apps such as LINE MAN (storefront header, category chips, menu cards with prices, bottom tab bar, order status), but must use the series' own name, colors and logo. LINE MAN's branding is trademarked; do not copy its logo, exact green, icons or assets.

Thai text needs a font with Thai glyphs; decide Thai, English or both for menu labels (see `src/assets/README.md`).

## Planned mapping: ordering-app screen to game function

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
- Keep game rules out of scenes where possible; put reusable logic in `core` or `items`.
