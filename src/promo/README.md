# promo

The hooks that tie the game to the series.

## Built

- **Promos tab (the Bake Love Feeling page)** and the links in `links.json` (edit that file; `config.ts` reads it):
  - the **pilot** (YouTube, https://www.youtube.com/watch?v=NFFWV0X4i_c), played inside the game in two ways (`src/promo/pilot.ts`, `src/ui/videoPlayer.ts`):
    - **on the receipt**, the pilot window is built into the screen and preloads paused behind its poster so the central play button starts it immediately. The poster covers the whole iframe, so taps on its inactive edges cannot steal focus from the game. It disappears when you leave the receipt. When the game gets sound, pause or lower it while the pilot plays. To start by itself instead, use `autoplay: true, muted: true` in `embedPilot` (browsers only allow muted autoplay);
    - **in a pop-up window** from the Promos tab's big button and the Express tile on the home screen (with a Close button, and an "Open on YouTube" link in case embedding is ever turned off). The home "Watch the pilot now" strip opens the Promos page;
  - the **accounts**, shown as cards with an avatar, a name and a role: the **official account** (X only) as a wide card, the **two main leads** side by side, and **Vimmy** as a small one-line row (a mascot, not the focus of this page, so it gets one very short phrase). The social buttons are round **icons** (X, Instagram, TikTok, YouTube; see `src/assets/icons`). A card only shows an icon for a platform that has a handle set; an account with nothing set yet shows a single quiet "soon" tag instead of a row of placeholders.

- `links.json`: **the file you edit**: the show's title, air date and hashtag, the pilot link, and every account (name, avatar, role, handles). See "Editing the links" below.
- `config.ts`: reads and checks `links.json`, and provides it to the screens (plus `countdownText()` for the home screen).

## Planned features

- **The Promos tab is the Bake Love Feeling page:** the series, its stars, where to watch, and the links below.

- **Promotions tab:** links to the leads' socials, the series' socials and its YouTube channel.
- **Receipt:** the pilot plays right on the receipt (built). Later this could become "the latest clip".
- **Shareable score card:** the show's title, air date and hashtag, generated from the player's score.
- **Episode countdown** on the home screen (built, shows "coming soon" until `airDate` is set).

## Suggested structure

All links, the air date and the hashtag live in `links.json`, so they can be updated in one place without touching code.

## Links to wire up

Series YouTube channel and videos, the series' socials and the leads' socials. All will live in the single config file above.

## Open questions

- Show title, air date, hashtag, colors and links are not decided yet.
- How "latest clip" is found: a hard-coded link updated by hand is simplest; the YouTube API can come later.

## Editing the links

Everything is in **`src/promo/links.json`**. You never need to touch the code.

```json
{
  "show":   { "title": "Bake Love Feeling", "airDate": null, "hashtag": "BakeLoveFeeling" },
  "pilot":  { "youtube": "https://www.youtube.com/watch?v=NFFWV0X4i_c" },
  "official": { "name": "Bake Love Feeling", "avatar": "🍞", "handles": { "x": "BakeLoveFeeling" } },
  "leads": [
    { "name": "Lead actor 1 (name TBD)", "avatar": "👩‍🍳", "roleKey": "promos.role.cheese",
      "handles": { "x": null, "instagram": null, "tiktok": null } },
    { "name": "Lead actor 2 (name TBD)", "avatar": "⚖️", "roleKey": "promos.role.noey",
      "handles": { "x": null, "instagram": null, "tiktok": null } }
  ],
  "vimmy": { "name": "Vimmy", "avatar": "🐶", "roleKey": "promos.vimmy.role",
             "handles": { "x": null, "instagram": null, "tiktok": null } }
}
```

- **Handles:** write the username (`"BakeLoveFeeling"` or `"@BakeLoveFeeling"`), or paste the full profile link (`"https://x.com/BakeLoveFeeling"`). A link must be https and on that platform's own site. Use `null` for "not yet".
- **Which buttons show:** an account only shows icons for the platforms listed in its `handles`, and only the ones with a value get an icon button. If it lists platforms but none has a value yet, it shows one quiet "soon" tag. The official account lists only `x`; add `"instagram": null` to it later if it gets one.
- **Pilot:** paste any normal YouTube link (watch, youtu.be or embed).
- **Air date:** an ISO date with timezone, for example `"2026-12-01T20:00:00+07:00"`. Once it is set, the home screen shows a countdown to Episode 1 instead of "Watch the pilot now".
- **banner:** (optional, official account only) the file name of a wide header photo in `src/assets/avatars/`, shown across the top of the card (3:1 works best, like an X header).
- **avatar:** an emoji, **or the file name of a photo** you put in `src/assets/avatars/` (for example `"view.jpg"`). Photos are cropped to a circle. See `src/assets/avatars/README.md` for sizes and tips; `npm run check:links` checks the file exists.
- **roleKey:** points at a line of text in `src/i18n` (so it is translated). Leave it out to show no role line. Use a new text key only after adding it to all five languages.
- **name:** shown as written, in every language (the leads' names are placeholders until you set them).

After editing, run:

```bash
npm run check:links
```

It checks the file and prints exactly what every button will open (for example `X -> https://x.com/BakeLoveFeeling`), and stops with a clear message if something is wrong. In dev (`npm run dev`) mistakes are also reported in the browser console.

## Vimmy (official description)

Vimmy (วิมมี่) is the character that represents the **fans of View Mim** (the two leads). The name is **View + Mim**. Vimmy is a long-eared **Cocker Spaniel** (View's charm) with the sweet little-bee spirit of Mim: bright, cheerful, always ready to spread her wings and sprinkle sweetness and brightness everywhere. This is why the playable character is a dog in a bee costume, and why Vimmy is always the playable character.

The official text, kept here for reference:

> VIMMY (วิมมี่) คาแรกเตอร์ตัวแทนแฟนคลับของ วิว - มิ้ม น้องสุนัขหูยาวสายพันธุ์ค็อกเกอร์ สแปเนียล ที่มาพร้อมความสดใสและพลังความร่าเริงเต็มร้อย ถ่ายทอดเสน่ห์ของวิวที่ผสมผสานเข้ากับผึ้งน้อยแสนหวานละมุนในแบบของมิ้ม จนกลายเป็นน้อง "VIMMY" สุดน่ารัก ที่พร้อมกางปีกแจกความหวาน และโปรยความสดใสให้ฟุ้งกระจายไปทุกพื้นที่ที่ได้เจอ
>
> VIMMY: a character representing the fans of View-Mim. Introducing a long-eared Cocker Spaniel brimming with brightness and 100% cheery energy, a perfect combination of View's charm and Mim's sweet, little-bee spirit, coming together as the adorable "VIMMY" who's always ready to spread her wings to sprinkle brightness wherever she goes.

On the Promos page this becomes one short line in each language (`promos.vimmy.role` in `src/i18n`): "Vimmy loves Mami and Mumu" (the two nicknames stay in English in every language). For art: a Cocker Spaniel with long ears and little bee wings.
