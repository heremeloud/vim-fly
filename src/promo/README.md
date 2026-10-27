# promo

The hooks that tie the game to the series. Empty for now; nothing is built here yet.

## Planned features

- **Promotions tab:** links to the leads' socials, the series' socials and its YouTube channel.
- **Receipt button:** "Watch the latest clip", linking to the newest YouTube video.
- **Shareable score card:** the show's title, air date and hashtag, generated from the player's score.
- **Episode countdown** on the home screen.

## Suggested structure

Keep all links, the air date and the hashtag in one config file here (for example `config.ts`) so they can be updated in one place without touching scenes.

## Open questions

- Show title, air date, hashtag, colors and links are not decided yet.
- How "latest clip" is found: a hard-coded link updated by hand is simplest; the YouTube API can come later.
