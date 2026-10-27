# Vimmy Fly

A tap-to-fly web game. One cute character climbs an endless sky, steering left and right to catch food and dodge gavel hammers. The menus look like a bakery food-ordering app.

## How to play

- **Tap the left half** of the screen to flap up and drift left.
- **Tap the right half** to flap up and drift right.
- On desktop, use the **left/right arrow keys** or **A / D**.
- Stop tapping and you fall. Drop off the bottom and the run ends.
- Climb as high as you can. The game is endless and gets harder the higher you go.

## Items

Full details in [src/items/ITEMS.md](src/items/ITEMS.md).

**Points** (food and drinks that add to your score)

| Item | Points |
| --- | --- |
| Pandan custard bread, cheese butter bread, shiopan, sandwich | Small |
| Pasta, coffee, wine | Medium |
| Shrimp fried rice lunch box | Big |
| Golden retriever | Biggest |

**Buffs** (power-ups)

| Item | Effect |
| --- | --- |
| Oyster | Double points for a few seconds |
| Lawyer suit | Shield: blocks the next debuff |
| Handkerchief | Clears stun and disorientation |
| Rolling pin | Stronger flaps for a few seconds |
| Helicopter | Upward dash |

**Debuffs** (dodge these)

| Item | Effect |
| --- | --- |
| Gavel hammer | Stuns you for about 1 s |
| Cilantro bread, fish sauce bread | Disoriented: left and right are swapped |
| Planner | Huge point loss |
| Car crash | Big debuff: knocks you down, stuns you and costs points |

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other commands:

```bash
npm run build      # type-check and produce a static build in dist/
npm run preview    # serve the production build locally
```

## Tech

[Phaser](https://phaser.io) and TypeScript, built with [Vite](https://vite.dev). The leaderboard will use [Supabase](https://supabase.com). The result is a static site that any free host can serve.

## Project layout

Each folder under `src/` is one domain and has its own `README.md` explaining how it works.

| Folder | Domain |
| --- | --- |
| `src/core` | Physics values, input, the main game loop |
| `src/items` | Item definitions, spawning and effects |
| `src/scenes` | Screens: home storefront, item guide menu, game, receipt |
| `src/ui` | Shared look and widgets for the ordering-app menus |
| `src/leaderboard` | Score submission and top-scores |
| `src/promo` | Series links, countdown, share card |
| `src/assets` | Art and audio, with license tracking |
| `supabase` | Database schema |

Project status and next steps are in [PROGRESS.md](PROGRESS.md).

## Status

Early development. The base project runs and has a placeholder core loop. See [PROGRESS.md](PROGRESS.md).

## Credits and licenses

Third-party art and audio are listed with their licenses in [src/assets/README.md](src/assets/README.md).
