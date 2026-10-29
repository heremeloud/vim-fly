# Tap-to-Fly Web Game: Tech Stack & Starter Plan

Oct 27, 2026 

## Game design: series tie-in

One cute character climbs an endless sky, steering with left/right taps to catch pastries and dodge objection hammers. The menus look like a food-ordering app.

### Controls (decided)

Tap the left half of the screen to flap up and drift left; tap the right half to flap up and drift right. Stop tapping and the character falls; dropping off the bottom of the screen ends the run. On desktop, the left/right arrow keys or A/D do the same.

Why: items fall from above, so players must steer to catch or dodge them. Alternating taps to climb straight up gives no steering, which would make item pickups pure luck.

### Length (decided)

Endless, with difficulty rising with height. An open-ended score suits a leaderboard, and runs of roughly 30–90 seconds invite "one more try" and sharing.

Height zones give a sense of progress and a backdrop change at each milestone, e.g. bakery street → downtown rooftops → courthouse → clouds.

### Items

Durations and values are starting points to tune in playtesting.

| Item | Type | Effect |
| --- | --- | --- |
| Croissant, bread, cupcake | Buff | Small points |
| Cake | Rare buff | Big points |
| Delivery car | Buff | Upward dash for about 3 s |
| Helicopter | Buff | Auto-lift and pulls in nearby items for about 4 s |
| Briefcase | Buff | Shield: blocks the next debuff |
| Objection hammer | Debuff | Stuns for about 1 s |
| Burnt bread | Debuff | Lose points |
| Rain cloud | Debuff | Slows the climb |

### Menus in ordering-app style

| App screen | Game function |
| --- | --- |
| Bakery storefront page, with key art banner | Home screen, episode countdown |
| "Order now" button | Play |
| Menu list with item "prices" | Item guide: what each item does, "price" = point value |
| Order history | Your best runs |
| Top customers | Leaderboard |
| Receipt | Game over: items collected as line items, total = score |
| Promotions tab | Series links (below) |

Style it as the series' own bakery app, with the show's name and colors, not a copy of a real delivery app's logo or look.

### Promo hooks

- Promotions tab linking the leads' socials, the series' socials and its YouTube channel.
- Game-over receipt with a "Watch the latest clip" button to the newest YouTube video.
- Shareable score card with the show's title, air date and hashtag.
- Episode countdown on the home screen.

## Tech stack

Use Phaser with Vite for the game, Supabase for the leaderboard, and a free static host.

| Layer | Pick | Why | Alternatives |
| --- | --- | --- | --- |
| Game engine | Phaser (JS/TS) + Vite | Mature 2D web framework: sprites, animations, physics, touch input, sound, mobile scaling, many examples. Vite gives a fast dev server and builds. | Kaplay (formerly Kaboom.js), simpler for beginners; PixiJS, renderer only |
| Leaderboard backend | Supabase | Postgres, auth and serverless functions on a generous free tier. A `scores` table (name, score, created\_at) and a top-100 query is enough to start. | Firebase |
| Hosting | Vercel, Netlify or Cloudflare Pages | Free static hosting | itch.io, which also brings players |

### Anti-cheat basics

If the browser writes scores straight to the database, fake scores will appear within days of launch. These basics stop casual cheating:

- Submit scores through a server function, never a direct database insert.
- Check the score is plausible for the run's duration; issue a session token at run start and verify it on submit.
- Rate-limit submissions.

## Build order

This is the original starter plan; current release status lives in `PROGRESS.md`. The core product is now built.

- [x] **Core loop.** Character rises on left/right taps, gravity pulls it down and the camera scrolls up.
- [x] **Falling items.** Weighted points, buffs and debuffs with collisions and themed location rushes.
- [x] **Score, game over and replay flow.** Receipt, local history and score sharing are built.
- [x] **Difficulty curve.** Spawn rate, fall speed, camera speed, item mix and debuff movement rise with height.
- [x] **Art, animation and sound.** Pixel-art items, animated Vimmy, location backdrops and synthesized effects are built.
- [x] **Leaderboard.** Name entry, server-checked score submission and worldwide top scores are built.
- [ ] **Optional polish.** Combo/Love meter, music and additional particles or screen shake can be post-launch work.

## Art, animation and sound

Start with Kenney's free CC0 packs, then replace them with your own art; check every pack's license before shipping.

| Need | Resource | Cost / license | Notes |
| --- | --- | --- | --- |
| Ready-made art | [Kenney.nl](https://kenney.nl) | Free, CC0 (commercial OK) | Characters, items, UI, sounds. Best first stop. |
| Ready-made art | [itch.io Game Assets](https://itch.io/game-assets) | Free and paid | Many cute character and item packs |
| Ready-made art | [OpenGameArt.org](https://opengameart.org) | Free, mixed licenses | Read each license |
| Ready-made art | [CraftPix.net](https://craftpix.net) | Free and paid | Polished packs |
| Drawing and animating | Aseprite | Paid | Standard for pixel art and sprite animation |
| Drawing and animating | LibreSprite / Piskel | Free | Aseprite fork / in-browser editor |
| Drawing and animating | Krita or Procreate | Free / paid | For a non-pixel cute style; export frames as a sprite sheet |
| Sprite sheets | TexturePacker | Free tier | Packs frames into sheets Phaser loads directly |
| Sound effects | jsfxr / ChipTone | Free | Generate retro jump, pickup and hit sounds in the browser |
| Sound effects | [Freesound.org](https://freesound.org) | Free, mixed licenses | Large effects library |
| Music | [Incompetech](https://incompetech.com) | Free with attribution |  |

**Animation tip:** a cute character needs only about 3 animations: idle/flap (4–6 frames), a boost pose, and a hurt/stunned pose. Squash-and-stretch tweens in code add charm for free.
