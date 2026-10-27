# promo

The hooks that tie the game to the series.

## Built

- `config.ts`: the show's title, air date and hashtag in one place (placeholders for now), plus `countdownText()` used by the home screen. Set `SHOW.airDate` (ISO date with timezone) and the countdown starts working.

## Planned features

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
