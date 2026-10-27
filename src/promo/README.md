# promo

The hooks that tie the game to the series.

## Built

- **Promos tab (the Bake Love Feeling page)** and the links config in `config.ts`:
  - the **pilot** (YouTube, https://www.youtube.com/watch?v=NFFWV0X4i_c), played inside the game in two ways (`src/promo/pilot.ts`, `src/ui/videoPlayer.ts`):
    - **on the receipt**, the pilot window is built into the screen and starts by itself, muted (browsers only allow sound after a tap; viewers unmute with the player's own button). It disappears when you leave the receipt. To show the poster with a play button instead, set `autoplay: false` in `embedPilot`;
    - **in a pop-up window** from the Promos tab's big button and the Express tile on the home screen (with a Close button, and an "Open on YouTube" link in case embedding is ever turned off). The home "Watch the pilot now" strip opens the Promos page;
  - the **official account** (X only), the **two main leads** and **Vimmy** (the playable dog); the leads and Vimmy each have X, Instagram and TikTok buttons.

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

Open `src/promo/config.ts` and set the handles (without the @) in `OFFICIAL` (X only), `LEADS` and `VIMMY`, for example `x: 'bakelovefeeling'`. A button shows "soon" and does nothing until its handle is set; once set, it opens `https://x.com/<handle>`, `https://www.instagram.com/<handle>` or `https://www.tiktok.com/@<handle>` in a new tab. The leads' names are placeholders ("name TBD"); set `name` too. Links are only built from plain usernames and always use https.

An account only gets buttons for the platforms listed in its `handles`, so the official account shows just X. Add a platform key to give it another button.
