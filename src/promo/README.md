# promo

The hooks that tie the game to the series.

## Built

- **Promos tab ("About the show")** and the links config in `config.ts`:
  - the **pilot** (YouTube, https://www.youtube.com/watch?v=NFFWV0X4i_c), shown as a big button on the Promos tab, a "Watch the pilot" strip on the home screen, and a button on the receipt;
  - the **official account**, the **two main leads** and **Vimmy** (the playable dog), each with X, Instagram and TikTok buttons.

- `config.ts`: the show's title ("Bake Love Feeling", spelling to confirm), air date and hashtag in one place, plus `countdownText()` used by the home screen (translated). Set `SHOW.airDate` (ISO date with timezone) and the countdown starts working.

## Planned features

- **The Promos tab is "About the show":** the series, its stars, where to watch, and the links below.

- **Promotions tab:** links to the leads' socials, the series' socials and its YouTube channel.
- **Receipt button:** "Watch the latest clip", linking to the newest YouTube video.
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

Open `src/promo/config.ts` and set the handles (without the @) in `OFFICIAL`, `LEADS` and `VIMMY`, for example `x: 'bakelovefeeling'`. A button shows "soon" and does nothing until its handle is set; once set, it opens `https://x.com/<handle>`, `https://www.instagram.com/<handle>` or `https://www.tiktok.com/@<handle>` in a new tab. The leads' names are placeholders ("name TBD"); set `name` too. Links are only built from plain usernames and always use https.
