# Progress

Last updated: 2026-10-27

## Done

- [x] Project scaffold: Vite, TypeScript, Phaser, build verified
- [x] Scene skeleton: Boot, Home, Game, Receipt
- [x] Placeholder core loop: tap left/right to flap and drift, gravity, game over at bottom
- [x] Item definitions from the plan (`src/items/itemDefs.ts`)
- [x] Leaderboard interface and draft database schema
- [x] Docs: public README, one README per domain, private notes, this file

## Next up (do these in order)

1. **Play it and tune the feel.** Run `npm run dev` and adjust `PHYSICS` in `src/core/constants.ts` until flapping feels good.
2. **Camera scroll.** Make the camera follow the character upward; track height as the score basis.
3. **Falling items.** Weighted spawner from the top, collisions, apply effects (points, shield, dash, helicopter, stun, slow).
4. **Score, game over and restart.** Show collected items as receipt line items.
5. **Difficulty curve.** Spawn rate and debuff ratio rise with height; backdrop changes per height zone.
6. **Real art, animation and sound.** Kenney packs first; log licenses in `src/assets/README.md`.
7. **Leaderboard.** Supabase project, server functions with run tokens, name entry, top-scores screen.
8. **Polish.** Screen shake, particles, combo multipliers, mobile testing.

## Decisions waiting on me

- Show name, colors, air date, hashtag and social/YouTube links (needed for the promo features).
- Hosting choice: Vercel, Netlify or Cloudflare Pages.
- Phaser 4 was installed (latest). Switch to Phaser 3 if its smaller tutorial ecosystem matters more.

## Housekeeping

- [ ] `git init` and make a first commit (no git repo exists yet; `NOTES.private.md` is already in `.gitignore`)
- [ ] Item list conflict in the plan: the table and the build-order bullet differ. Code follows the table.

## Keep this file current

After each work session: tick what's done, reorder "Next up", and add anything that came up.
