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
- [x] Food items replaced with the series' dishes (breads, sandwich, pasta, coffee, wine, shrimp fried rice lunch box)
- [x] Items split into three kinds (points, buffs, debuffs); cilantro and fish sauce bread are disorient debuffs; oyster added as a double-points buff
- [x] Item rework: removed delivery car, briefcase, rain cloud, burnt bread; added lawyer suit (shield), handkerchief (cleanse), rolling pin (strong flap), planner (-150), golden retriever (+150)
- [x] Single difficulty curve (0-1 over 1000 m) driving spawn rate, double spawns, fall speed, swerving debuffs, camera speed and item mix
- [x] Height zones: backdrop and banner change at 250, 500 and 800 m; receipt shows the zone reached (courthouse and clouds backdrops not yet seen in the browser)
- [x] Ordering-app menus, first part: shared UI (`src/ui`), home storefront, scrollable item guide with Points/Buffs/Debuffs filter, bottom tab bar, "coming soon" placeholders for Orders and Promos, promo config with countdown
- [x] Menus restyled as a bee-themed parody ("BEE MAN"): honey-yellow palette, deliver-to line and search bar on the home screen; receipt has "Order again" and "Menu" buttons side by side
- [x] Play-tested in the browser with a bot: Home -> Game -> Receipt works, no console errors

## Next up (do these in order)

1. **Play it by hand and tune the feel.** Edit `PHYSICS` and `ITEM_RULES` in `src/core/constants.ts`. Not yet judged by a human; a bot climbs ~150 m in 5 s, so check pacing against 30-90 s runs.
2. **Rest of the ordering-app menus.** Order history (best runs, needs local save) and the promotions tab (series links). Then real branding and Thai text once decided.
3. **Real art, animation and sound.** Dog-in-bee-costume character, Kenney packs for items; log licenses in `src/assets/README.md`.
4. **Local best runs** (order history) using localStorage.
5. **Leaderboard.** Supabase project, server functions with run tokens, name entry, top-scores screen.
6. **Promo hooks.** Countdown, links, share card, "Watch the latest clip".
7. **Polish.** Screen shake, particles, combo multipliers, mobile testing.

## Decisions waiting on me

- Parody name: "BEE MAN" is my placeholder pun. Keep it, or pick another? Have the final name and look checked by a lawyer before public release.

- Show name and logo, brand colors, air date, hashtag and social/YouTube links (needed for the promo features and menu styling).
- Confirm effects for lawyer suit, handkerchief, rolling pin, oyster. More debuff ideas? (see `src/items/ITEMS.md`)
- Is oyster = double points the buff you want? Do wine and coffee get effects? Thai names for each dish? (see `src/items/ITEMS.md`)
- Item questions in `src/items/ITEMS.md` (does the shield block the car crash and planner?).
- Menu language (the menus are English only so far): Thai, English or both.
- Hosting choice: Vercel, Netlify or Cloudflare Pages.
- Phaser 4 was installed (latest). Switch to Phaser 3 if its smaller tutorial ecosystem matters more.

## Housekeeping

- [x] `git init` and first commit
- [ ] Item list conflict in the plan: the table and the build-order bullet differ. Code follows the table.

## Keep this file current

After each work session: tick what's done, reorder "Next up", and add anything that came up.
