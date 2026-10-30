# vim fly

## How to play

- **Tap the left half** of the screen to fly up and drift left.
- **Tap the right half** to fly up and drift right.
- On desktop, use the **left/right arrow keys** or **A / D**.
- Stop tapping and you fall. Drop off the bottom and the run ends.
- Climb as high as you can. The game is endless and gets harder the higher you go.

## Items

Full details in [src/items/ITEMS.md](src/items/ITEMS.md).

**Points** (food and drinks that add to your score)

| Item | Points |
| --- | --- |
| Pandan custard bread, shiopan, sandwich | Small |
| Pasta, coffee, wine, cheese popcorn, ice cream | Medium |
| Shrimp fried rice lunch box, cheese butter bread, tom yum | Big |

**Buffs** (power-ups)

| Item | Effect |
| --- | --- |
| Oyster | Double points for a few seconds |
| Lawyer suit | Shield: blocks the next debuff |
| Handkerchief | Clears stun and disorientation |
| Rolling pin | Stronger fly-ups for a few seconds |
| Golden retriever (rare, hidden) | Magnet: pulls nearby food and power-ups to you, plus 300 points |
| Helicopter | Upward dash |

**Debuffs** (dodge these)

| Item | Effect |
| --- | --- |
| Gavel hammer | Stuns you for about 1 s |
| Cilantro bread | Disoriented: left and right are swapped |
| Fish sauce bread | Slows your flying for a few seconds |
| Planner | Stuns you and costs a lot of points |
| Car crash | Big debuff: knocks you down, stuns you and costs points |

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To preview every synthesized sound effect, open `http://localhost:5173/?sfx` while the dev server is running. To check every finale board, status badge, reaction picture, the sideways dash and the pop-ups (in any language), open `http://localhost:5173/?fx`. Both pages work only on a local dev server.

Other commands:

```bash
npm run build      # type-check and produce a static build in dist/
npm run preview    # serve the production build locally
npm run check:i18n # check all five languages are complete (needs Node 22.6+)
npm run check:links # check src/promo/links.json and print what every link opens
```

## Tech

[Phaser](https://phaser.io) and TypeScript, built with [Vite](https://vite.dev). The worldwide leaderboard uses [Supabase](https://supabase.com) Edge Functions and Postgres. The game itself is a static site that any static host can serve.

## Project layout

Each folder under `src/` is one domain and has its own `README.md` explaining how it works.

| Folder | Domain |
| --- | --- |
| `src/core` | Physics values, input, the main game loop |
| `src/items` | Item definitions, spawning and effects |
| `src/scenes` | Screens: home storefront, item guide menu, orders (run history and ladder), game, receipt |
| `src/i18n` | The five languages and how to add text |
| `src/ui` | Shared look and widgets for the ordering-app menus |
| `src/leaderboard` | Score submission and top-scores |
| `src/promo` | Series links, countdown, share card |
| `src/assets` | Art and audio, with license tracking |
| `supabase` | Database schema |

Project status and next steps are in [PROGRESS.md](PROGRESS.md).

## Status

Feature-complete release candidate. The remaining work is final gameplay tuning, mobile/release QA, native-speaker review of translations and a legal review of the parody branding. See [PROGRESS.md](PROGRESS.md).

## Credits and licenses

Third-party art and audio are listed with their licenses in [src/assets/README.md](src/assets/README.md).
