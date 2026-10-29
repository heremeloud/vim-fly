# ui

Shared building blocks for the ordering-app menus, so every screen looks like one app.

## Files

- `theme.ts`: the colors and font. This is the one place to change the look. The current honey-yellow and brown palette matches the bee costume and is a **placeholder** until the show's own colors and logo are decided.
- `brand.ts`: the in-game app's name, tagline, header text and the super-app service tiles (`VIMMY FLY`, Food/Mart/Express/Ride; text that changes with language is in `src/i18n`).
- `videoPlayer.ts`: `embedVideo()` builds a player into a scene at a spot in the layout (used on the receipt); `openVideo()` plays a YouTube video in a window over the game (close button, tap outside or Escape closes it, with an "Open on YouTube" fallback link). It shows "Loading the pilot…" until the player reports it is ready, using YouTube's player messages.
- `icons.ts`: `drawIcon` line icons (tabs, gear, globe, speaker, service tiles...).
- `howToPlay.ts`, `soundToggle.ts`: pieces shared by the welcome card and settings.
- `ScrollList.ts`: a drag/wheel scrolling list used by the Menu and Orders screens.
- `widgets.ts`: `label` (text; pass `maxWidth` for any single-line text whose length depends on the language or the player, so it shrinks and ends in "…" instead of overflowing), `roundedBox`, `hitArea` (invisible tap target), `button` (pill button, `primary` filled or `secondary` outlined) `tabBar` (bottom navigation) and `languageButton` (the language picker, text only, no flags).

## Design rules: a parody, not a copy

The menus are a **parody of two Thai delivery apps at once**: LINE MAN (the shop page, menu cards with prices, rider-style status) and Grab (the "super app" grid of services). The in-game app is called `VIMMY FLY`, after the dog who delivers ("Delivered by a very good bee dog"). It keeps its own colors, logo, mascot and assets. The home screen has Grab's row of service tiles (Food, Mart, Express, Ride). Each is a shortcut to something real: **Food** opens the item menu, **Mart** the Bake Love Feeling page (cast and links), **Express** opens the official X account, and **Ride** plays the pilot in a window (for now). Change a tile's `target`, or delete its line, in `SERVICES` in `brand.ts`. The header says "Deliver to: Current location", like the real apps' default (no real location is used).

To keep it clearly a joke and clearly the show's own:

- Use our own name, logo, mascot and colors. Do **not** use either app's logo, mascot, exact green, icons, screenshots or wording (neither LINE MAN's nor Grab's).
- Make the humor obvious (the bee, the dog, the taglines, the silly services), so nobody could mistake it for a real app or for an endorsement.
- Parody is not a guarantee against trademark complaints, and now two companies are involved. Before public release, get the name and look checked by someone qualified (the series has a lawyer, after all). This is not legal advice.

## Layout rules

- The screen is 480x800. The bottom tab bar is 54 px tall (`TAB_BAR_HEIGHT`); keep content above it.
- Text on the honey-yellow primary color is dark brown (`COLORS.onPrimary`); on white use `COLORS.accent` for highlights, since yellow on white is hard to read.
- Scrolling lists draw an opaque header and the tab bar on top (higher depth) to hide rows scrolled underneath. See `MenuScene`.

## Tab bar

Store, Menu, Orders, Promos. The Store tab always goes to the home page, even when another page is showing under a lit Store tab. All four tabs are built; the Promos tab is the Bake Love Feeling page. Tab targets are in `tabTarget` in `widgets.ts`; point a tab at its real scene when it exists.

## Adding a screen

1. Make a scene under `src/scenes/` and register it in `src/main.ts` and `SCENES`.
2. Build it from these widgets and call `tabBar(this, '<tab>')`.
3. Add it to `TAB_TARGETS` if it is a tab.

## Remaining visual options

Thai is bundled and all items have pixel art. Japanese and Chinese currently use system-font stacks to avoid shipping large CJK font files. Menu icons are line icons drawn in code (`icons.ts`), not emoji, so they look the same on every device.

## Look: the show's logo

Shapes follow the Bake Love Feeling lettering: plump, bread-like, chocolate crust outline, butter fill, cream dough blobs, gingham pink. Buttons are puffy with a shine, page headers end in a gingham hem with a dough blob, and the active tab sits on a butter bun. Corner sizes come from `RADIUS` in `theme.ts`; dialogs use `scrim` and `RADIUS.sheet`.
