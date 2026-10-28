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
- [x] Height zones (first version, replaced by the novel's locations below)
- [x] Ordering-app menus, first part: shared UI (`src/ui`), home storefront, scrollable item guide with Points/Buffs/Debuffs filter, bottom tab bar, promo config with countdown
- [x] Menus restyled as a bee-themed parody ("BEE MAN"): honey-yellow palette, deliver-to line and search bar on the home screen; receipt has "Order again" and "Menu" buttons side by side
- [x] Height zones replaced with the novel's 10 locations in 5 stages, 200 m apart (`src/core/ZONES.md`); all 10 placeholder backdrops and banners checked in the browser; dev shortcut `?zone=<id>`
- [x] Menus now parody both LINE MAN and Grab: super-app service tile row on the home screen
- [x] Rebrand: app is now "LOVE MAN" (placeholder), "Delivered by a very good bee dog", shop "Bake Love Bakery", series title "Bake Love Feeling"
- [x] Four languages (English, Thai, Japanese, Chinese Simplified) with a text-only language picker; `npm run check:i18n`; all non-English text is a draft
- [x] Orders tab: local run history ("My orders") and ranking ("Top customers"), saved on the device; receipt saves runs and flags a new best
- [x] App renamed to VIMMY (after the dog); service tiles are plain Food / Mart / Express / Ride; header says "Deliver to Current location"
- [x] Promos tab built: pilot link, official account, two leads, Vimmy, each with X / Instagram / TikTok (handles not filled in yet); pilot also on home and receipt
- [x] Planner now stuns (1.5 s) and costs 150 points; fish sauce bread slows flying 40% for 5 s
- [x] Sharper rendering: canvas drawn up to 3x bigger with the same layout (`src/core/render.ts`); bundled Noto Sans Thai font for Thai text
- [x] "Tier" is now "Stage" everywhere (banner: "Stage 3" over the location; no stage names), in all four languages
- [x] The pilot plays inside the game in a window (Promos tab, receipt); the home strip opens the Promos page; official account is X only; receipt line is "Thank you for baking loving feeling" in all four languages
- [x] Cheese butter bread is now a high-points item (+100, rare)
- [x] The Store tab always returns to the home page (also when another page is showing under a lit Store tab)
- [x] Receipt rebuilt: fixed header and footer with a scrolling item list, long names wrap, nothing overlaps however long it gets
- [x] Service tiles do real things (Food = menu, Mart = Bake Love Feeling page, Express = pilot window, Ride = start a run); the joke pages are gone
- [x] Promos page is titled "Bake Love Feeling"; bottom tab bar is smaller (54 px, icon and label centered with equal space above and below); the pilot window shows "Loading the pilot…" until it is ready
- [x] The pilot player is built into the receipt (poster with a play button, no autoplay because the game will have sound); the pop-up window stays for the Promos tab and the Express tile. Receipt spacing tightened
- [x] Promos accounts redesigned: avatar cards (wide for official and Vimmy, side by side for the leads); only real platforms get buttons, otherwise one "soon" tag; wording says "the pilot" (Episode 1 is not out yet)
- [x] Play-tested in the browser with a bot: Home -> Game -> Receipt works, no console errors

## Next up (do these in order)

1. **Play it by hand and tune the feel.** Edit `PHYSICS` and `ITEM_RULES` in `src/core/constants.ts`. Not yet judged by a human; a bot climbs ~150 m in 5 s, so check pacing against 30-90 s runs.
2. **Fill in the Promos handles** (see decisions below), then story-driven items and real art.
3. **Real art, animation and sound.** Dog-in-bee-costume character, Kenney packs for items; log licenses in `src/assets/README.md`.
4. **Local best runs** (order history) using localStorage.
5. **Leaderboard.** Supabase project, server functions with run tokens, name entry, top-scores screen.
6. **Promo hooks.** Countdown, links, share card, "Watch the latest clip".
7. **Polish.** Screen shake, particles, combo multipliers, mobile testing.

## Decisions waiting on me

- Handles for the official account, the two leads (and their real names) and Vimmy, on X, Instagram and TikTok. The buttons say "soon" until `src/promo/config.ts` is filled in.
- App name: VIMMY (after the dog) is a placeholder; is that OK? Is the series title "Bake Love Feeling" exact?
- How should "Bake Love Feeling" show up in gameplay, beyond the names? Idea: a Love meter that fills as you collect food and bursts into a short double-points "Bake Love" moment.
- Chinese: Simplified or Traditional (or both)? Have native speakers review all Thai, Japanese and Chinese text.

- Story-driven items: add a kitten, the Benz, cheese popcorn, the Cheese-Noey Bread? (see `src/core/ZONES.md`)
- Is 200 m per location right? (Decided: difficulty stays topping out at 1000 m, the harder option.)

- Have the final app names and look checked by a lawyer before public release (two real brands are being parodied).

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
