# Progress

Last updated: 2026-10-27 (core loop session)

## Done

- [x] Project scaffold: Vite, TypeScript, Phaser, build verified
- [x] Scene skeleton: Boot, Home, Game, Receipt
- [x] Placeholder core loop: tap left/right to flap and drift, gravity, game over at bottom
- [x] Item definitions from the plan (`src/items/itemDefs.ts`)
- [x] Leaderboard interface and draft database schema
- [x] Docs: public README, one README per domain, private notes, this file
- [x] Git repo initialised, first commit made
- [x] Camera climb, height score, weighted item spawner, collisions and all item effects (placeholder rectangles)
- [x] Receipt shows height and collected items as line items
- [x] Item catalog doc (`src/items/ITEMS.md`); helicopter is now an upward dash; added the car crash big debuff
- [x] Play-tested in the browser with a bot: Home -> Game -> Receipt works, no console errors

## Next up (do these in order)

1. **Play it by hand and tune the feel.** Edit `PHYSICS` and `ITEM_RULES` in `src/core/constants.ts`. Not yet judged by a human; a bot climbs ~150 m in 5 s, so check pacing against 30-90 s runs.
2. **Height zones.** Backdrop changes at milestones (bakery street, rooftops, courthouse, clouds).
3. **Ordering-app menus.** Home storefront, item guide (menu with prices), order history, promotions tab. LINE MAN-inspired layout, original branding.
4. **Real art, animation and sound.** Dog-in-bee-costume character, Kenney packs for items; log licenses in `src/assets/README.md`.
5. **Local best runs** (order history) using localStorage.
6. **Leaderboard.** Supabase project, server functions with run tokens, name entry, top-scores screen.
7. **Promo hooks.** Countdown, links, share card, "Watch the latest clip".
8. **Polish.** Screen shake, particles, combo multipliers, mobile testing.

## Decisions waiting on me

- Show name and logo, brand colors, air date, hashtag and social/YouTube links (needed for the promo features and menu styling).
- Item questions in `src/items/ITEMS.md` (should the delivery car differ from the helicopter? does the shield block the car crash?).
- Menu language: Thai, English or both.
- Hosting choice: Vercel, Netlify or Cloudflare Pages.
- Phaser 4 was installed (latest). Switch to Phaser 3 if its smaller tutorial ecosystem matters more.

## Housekeeping

- [x] `git init` and first commit
- [ ] Item list conflict in the plan: the table and the build-order bullet differ. Code follows the table.

## Keep this file current

After each work session: tick what's done, reorder "Next up", and add anything that came up.
