# icons

Small SVG icons for the social buttons on the Promos page: `x.svg`, `instagram.svg`, `tiktok.svg`.

- **Source of the shapes:** the [Simple Icons](https://simpleicons.org) set, released under CC0 1.0 (public domain).
- **Colour:** each file is filled dark brown (`#3e2723`) to sit on the honey-yellow buttons. To change the colour, change `fill` in the file.
- **The logos themselves** belong to X, Instagram and TikTok. They are used only to link to those platforms' own pages, which is what the buttons do. Do not use them for anything that suggests the platforms endorse the game, and follow each platform's brand guidelines if you use them elsewhere.
- **How they load:** `PromosScene` loads them as real files (the `?no-inline` import keeps Vite from turning them into inline data, which Phaser's SVG loader cannot read) and draws them at 20 px inside 36 px round buttons.
- **Adding a platform:** drop another SVG here, add its name to `Platform` and `PLATFORMS` in `src/promo/config.ts`, to `HOSTS` and `profileUrl`, and to `ICON_URLS` in `PromosScene`, and to the checker in `scripts/check-links.mjs`.
