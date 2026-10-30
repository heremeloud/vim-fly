# i18n

The game speaks five languages: **English, Thai (ไทย), Japanese (日本語), Simplified Chinese (简体中文), and Traditional Chinese (繁體中文)**. The language picker uses the language names only. **No flags**, since a language is not a country.

## Files

- `en.ts`: the English strings, which are the source of truth.
- `common.json`: strings that are the same in every language (the tagline, `x2`, `EP1 COMING SOON`). Edit them here once; they are merged under each language at load time.
- `th.ts`, `ja.ts`, `zh.ts`, `zhHant.ts`: the other languages. Each has exactly the same keys as English (TypeScript enforces it).
- `index.ts`: `t(key, params)` to translate, plus `itemName`, `zoneName`, `getLocale`, `setLocale` and the `LOCALES` list.

## How it works

- Screens call `t('menu.title')` or `t('effect.dash', { s: 3 })`. `{placeholders}` are filled from the params.
- The language is saved in the browser (`localStorage`). On first visit it follows the browser language. Traditional Chinese browser locales (`zh-Hant`, `zh-TW`, `zh-HK`, and `zh-MO`) use Traditional Chinese; other Chinese locales use Simplified Chinese.
- The language button is on the home screen (top right, a globe and the language name). Choosing one restarts the scene so everything is redrawn.
- Item names and zone names are strings too (`item.<id>`, `zone.<id>`); the stage banner is `zone.stage` ("Stage {n}"). Item descriptions are built from the item's effect with `effect.*` strings, so they cannot disagree with the game.
- Protected English text stays unchanged in every language: `Thank you for baking・loving・feeling`. Chinese translates `Cafe` as `咖啡店` and `pilot` as `试播集` (Simplified) or `試播集` (Traditional); the other languages keep those words in English.
- Character names stay in English in every language except Thai, which uses the Thai names ชีส (Cheese) and เนย (Noey). Brand-style names also stay unchanged: the app name (VIMMY FLY), the shop name (Bake Love Bakery), the platform names (X, Instagram, TikTok), and the lead and Vimmy names.
- Dates on the Orders screen use the language's own format. Thai uses the Thai Buddhist-era year (for example 2569), which is correct in Thailand.
- Thai uses the bundled Noto Sans Thai font (loaded before the first screen). Japanese and both Chinese variants use the device's own fonts for now. See `src/assets/README.md`.

## Checking translations

```bash
npm run check:i18n
```

It fails if any language is missing a key, has an extra or empty key, uses different `{placeholders}` than English, or if an item or zone has no name. It needs Node 22.6 or newer. Run it after adding any string.

## Key order

Keys are grouped by area under `// Section` comments, in the same order in every language file: language and tabs, app shell, home, menu, orders, receipt, onboarding, settings, promos and video, HUD, zones and finales, effects, item names, then buff and debuff callouts. Put a new key in its section, in the same place in all five files.

## Adding or changing a string

If the text is identical in every language, add it to `common.json` only (and nowhere else). Otherwise:

1. Add the key to `en.ts`.
2. Add the same key to `th.ts`, `ja.ts`, `zh.ts`, and `zhHant.ts` (TypeScript will complain until you do).
3. Use `t('your.key')` in the screen.
4. Run `npm run check:i18n`.

Adding an **item** or a **zone** also needs `item.<id>` or `zone.<id>` in all five files.

## Adding a language

Add a file like `ko.ts`, add it to `TABLES` and `LOCALES` in `index.ts` (with a `dateLocale`), add it to `Locale`, and to `scripts/check-i18n.mjs`.

## Status: drafts

**All Thai, Japanese, Simplified Chinese, and Traditional Chinese text is a first draft written without a native speaker.** Have native speakers review it before release, especially:

- the jokes and puns (the tagline),
- food and item names (for example 鱼露面包 for fish sauce bread, ナンプラーパン, ขนมปังสังขยาใบเตย),
- Thai character names and official location names; use the show's official Thai spellings where they exist.
