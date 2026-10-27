# i18n

The game speaks four languages: **English, Thai (ไทย), Japanese (日本語) and Chinese (中文, Simplified)**. The language picker uses the language names only. **No flags**, since a language is not a country.

## Files

- `en.ts`: the English strings, which are the source of truth.
- `th.ts`, `ja.ts`, `zh.ts`: the other languages. Each has exactly the same keys as English (TypeScript enforces it).
- `index.ts`: `t(key, params)` to translate, plus `itemName`, `zoneName`, `getLocale`, `setLocale` and the `LOCALES` list.

## How it works

- Screens call `t('menu.title')` or `t('effect.dash', { s: 3 })`. `{placeholders}` are filled from the params.
- The language is saved in the browser (`localStorage`). On first visit it follows the browser language (Thai, Japanese or Chinese if it matches, otherwise English).
- The language button is on the home screen (top right, a globe and the language name). Choosing one restarts the scene so everything is redrawn.
- Item names and zone names are strings too (`item.<id>`, `zone.<id>`); the stage banner is `zone.stage` ("Stage {n}"). Item descriptions are built from the item's effect with `effect.*` strings, so they cannot disagree with the game.
- Brand-style names stay the same in every language: the app name (VIMMY), the shop name (Bake Love Bakery), the platform names (X, Instagram, TikTok) and the lead and Vimmy names.
- Dates on the Orders screen use the language's own format. Thai uses the Thai Buddhist-era year (for example 2569), which is correct in Thailand.
- Thai uses the bundled Noto Sans Thai font (loaded before the first screen). Japanese and Chinese use the device's own fonts for now. See `src/assets/README.md`.

## Checking translations

```bash
npm run check:i18n
```

It fails if any language is missing a key, has an extra or empty key, uses different `{placeholders}` than English, or if an item or zone has no name. It needs Node 22.6 or newer. Run it after adding any string.

## Adding or changing a string

1. Add the key to `en.ts`.
2. Add the same key to `th.ts`, `ja.ts` and `zh.ts` (TypeScript will complain until you do).
3. Use `t('your.key')` in the screen.
4. Run `npm run check:i18n`.

Adding an **item** or a **zone** also needs `item.<id>` or `zone.<id>` in all four files.

## Adding a language

Add a file like `ko.ts`, add it to `TABLES` and `LOCALES` in `index.ts` (with a `dateLocale`), add it to `Locale`, and to `scripts/check-i18n.mjs`. Traditional Chinese (繁體中文, common in Taiwan and Hong Kong) would be a separate locale, since it is not just a font change.

## Status: drafts

**All Thai, Japanese and Chinese text is a first draft written without a native speaker.** Have native speakers review it before release, especially:

- the jokes and puns (the tagline),
- food and item names (for example 鱼露面包 for fish sauce bread, ナンプラーパン, ขนมปังสังขยาใบเตย),
- the location and character names. Transliterations like ノイの家 (Noey's Residence) and บ้านของเนย are guesses; use the show's official names where they exist.

Which Chinese to ship (Simplified or Traditional) is an open decision.
