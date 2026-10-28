# promo

The hooks that tie the game to the series.

## Built

- **Promos tab (the Bake Love Feeling page)** and the links config in `config.ts`:
  - the **pilot** (YouTube, https://www.youtube.com/watch?v=NFFWV0X4i_c), played inside the game in two ways (`src/promo/pilot.ts`, `src/ui/videoPlayer.ts`):
    - **on the receipt**, the pilot window is built into the screen and shows its poster with a play button; it waits for a tap (no autoplay), so it never competes with the game's sound or streams on every game over. It disappears when you leave the receipt. When the game gets sound, pause or lower it while the pilot plays. To start by itself instead, use `autoplay: true, muted: true` in `embedPilot` (browsers only allow muted autoplay);
    - **in a pop-up window** from the Promos tab's big button and the Express tile on the home screen (with a Close button, and an "Open on YouTube" link in case embedding is ever turned off). The home "Watch the pilot now" strip opens the Promos page;
  - the **accounts**, shown as cards with an avatar, a name and a role: the **official account** (X only) and **Vimmy** (the playable dog) as wide cards, and the **two main leads** side by side. A card only shows buttons for platforms that have a handle set; an account with nothing set yet shows a single quiet "soon" tag instead of a row of placeholders.

- `config.ts`: the show's title ("Bake Love Feeling", spelling to confirm), air date and hashtag in one place, plus `countdownText()` used by the home screen (translated). Set `SHOW.airDate` (ISO date with timezone) and the countdown starts working.

## Planned features

- **The Promos tab is the Bake Love Feeling page:** the series, its stars, where to watch, and the links below.

- **Promotions tab:** links to the leads' socials, the series' socials and its YouTube channel.
- **Receipt:** the pilot plays right on the receipt (built). Later this could become "the latest clip".
- **Shareable score card:** the show's title, air date and hashtag, generated from the player's score.
- **Episode countdown** on the home screen (built, shows "coming soon" until `airDate` is set).

## Suggested structure

Keep all links, the air date and the hashtag in one config file here (for example `config.ts`) so they can be updated in one place without touching scenes.

## Links to wire up

Series YouTube channel and videos, the series' socials and the leads' socials. All will live in the single config file above.

## Open questions

- Show title, air date, hashtag, colors and links are not decided yet.
- How "latest clip" is found: a hard-coded link updated by hand is simplest; the YouTube API can come later.

## Filling in the accounts

Open `src/promo/config.ts` and set the handles (without the @) in `OFFICIAL` (X only), `LEADS` and `VIMMY`, for example `x: 'bakelovefeeling'`. Until a handle is set the card just shows "soon"; once set, the button appears and it opens `https://x.com/<handle>`, `https://www.instagram.com/<handle>` or `https://www.tiktok.com/@<handle>` in a new tab. The leads' names are placeholders ("name TBD"); set `name` too. Links are only built from plain usernames and always use https.

An account only knows about the platforms listed in its `handles` (the official account lists just X). A listed platform that is still `null` counts as "coming"; once every listed platform has a handle, each gets its button. Each account also has an `avatar` (an emoji for now; a photo can replace it later).
