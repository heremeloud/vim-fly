# scenes

Every screen. The menus are styled as a bakery food-ordering app, using the series' own name and colors, not a copy of a real delivery app's logo or look.

## Current scenes

| Scene | File | State |
| --- | --- | --- |
| Boot | `BootScene.ts` | Preloads assets (none yet) then opens Home |
| Home | `HomeScene.ts` | Title and "Order now" button (placeholder) |
| Game | `GameScene.ts` | Core loop with placeholder rectangle |
| Receipt | `ReceiptScene.ts` | Shows the score and "Order again" |

Scenes are registered in `src/main.ts`. Scene keys live in `SCENES` in `src/core/constants.ts`.

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

- Scenes pass data through `scene.start(key, data)`; the Receipt receives `{ score }`.
- Keep game rules out of scenes where possible; put reusable logic in `core` or `items`.
