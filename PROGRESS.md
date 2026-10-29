# Progress

Last updated: 2026-10-29

## Status

Vimmy Fly is a **feature-complete release candidate**. The complete path from onboarding to a run, receipt, local history and worldwide leaderboard is built. The remaining work is a short tuning and release-readiness pass rather than another feature phase.

## Built

- [x] Endless tap-to-fly loop with left/right steering, wall penalties, swipe dashes, camera climb and a height-driven difficulty curve
- [x] Twenty illustrated items: points, buffs and debuffs, with collisions, effects, reactions and individual sound effects
- [x] Animated Vimmy character, story-location backdrops, transitions, HUD, status effects and five story stages
- [x] Ten locations spaced 350 m apart, with a themed 100 m rush at the end of each location except Bake Love Bakery
- [x] Ordering-app interface: Home, item Menu, Orders, Bake Love Feeling promos, Game and receipt
- [x] Local best-run history and a Supabase worldwide leaderboard capped at 1,000 players, with private browser IDs, duplicate-safe/editable moderated names, atomic rate limiting, plausibility checks and automatic token cleanup
- [x] First-run player name and controls card, settings, sound toggle and synthesized game audio
- [x] Receipt with collected items, score, location, best-score state, score sharing and the pilot player
- [x] Real promo photos and social links for Bake Love Feeling, View, Mim and Vimmy, all checked by `npm run check:links`
- [x] English, Thai, Japanese, Simplified Chinese and Traditional Chinese, all checked by `npm run check:i18n`
- [x] Retina-aware rendering, iOS startup/audio/focus handling and responsive 480x800 mobile layout
- [x] Authored UI pass: custom navigation icons, Vimmy-branded header, restrained corner shapes and removal of fake rating/template details
- [x] Production build, localization checker and promo-link checker passing

## Remaining before public release

1. **Play-test the location rushes.** They now increase spawn frequency, double drops and themed item weights, with a persistent visual cue. Check that the later rushes feel exciting without becoming unavoidable.
2. **Final mobile QA.** Run full games on current iPhone/iPad and Android devices, including Low Power Mode, rotation, background/resume, silent mode, sharing and the embedded YouTube player.
3. **Production leaderboard check.** Verify start/submit/top-100 against the deployed Supabase functions and confirm offline fallback on the production URL.
4. **Translation review.** Thai, Japanese and both Chinese translations are complete drafts but still need native-speaker review, especially jokes, names and gameplay instructions.
5. **Legal/brand review.** Have the final name and ordering-app parody checked before public promotion.
6. **Launch content.** Set the air date in `src/promo/links.json` when announced and replace the pilot link/copy when a newer official clip should become the featured video.

## Optional post-launch ideas

- Combo or Love meter
- Music, additional particles and screen shake
- Profanity handling and a way to change the saved leaderboard name
- "Your rank" outside the top 100
- New story items such as the kitten, Benz and cheese popcorn

## Verification

Run before release:

```bash
npm run build
npm run check:i18n
npm run check:links
```

Keep this file focused on current status. Historical design exploration remains in `plan.md` and the domain READMEs.
