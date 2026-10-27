# ui

Shared building blocks for the ordering-app menus, so every screen looks like one app.

## Files

- `theme.ts`: the colors and font. This is the one place to change the look. The current honey-yellow and brown palette matches the bee costume and is a **placeholder** until the show's own colors and logo are decided.
- `brand.ts`: the in-game app's name, tagline and header text (`BEE MAN`, placeholders).
- `widgets.ts`: `label` (text), `roundedBox`, `hitArea` (invisible tap target), `button` (pill button, `primary` filled or `secondary` outlined) and `tabBar` (bottom navigation).

## Design rules: a parody, not a copy

The menus are a **parody** of Thai delivery apps such as LINE MAN: same kind of layout (deliver-to line, search bar, shop page, menu cards with prices, bottom tabs), but a pun name (`BEE MAN`, for the dog in a bee costume) and its own look.

To keep it clearly a joke and clearly the show's own:

- Use our own name, logo, mascot and colors. Do **not** use any real app's logo, mascot, exact green, icons, screenshots or wording.
- Make the humor obvious (the bee, the dog, the taglines), so nobody could mistake it for the real app or for an endorsement.
- Parody is not a guarantee against trademark complaints. Before public release, get the name and look checked by someone qualified (the series has a lawyer, after all). This is not legal advice.

## Layout rules

- The screen is 480x800. The bottom tab bar is 80 px tall (`TAB_BAR_HEIGHT`); keep content above it.
- Text on the honey-yellow primary color is dark brown (`COLORS.onPrimary`); on white use `COLORS.accent` for highlights, since yellow on white is hard to read.
- Scrolling lists draw an opaque header and the tab bar on top (higher depth) to hide rows scrolled underneath. See `MenuScene`.

## Tab bar

Store, Menu, Orders, Promos. Store and Menu are built. Orders and Promos open `ComingSoonScene`. Tab targets are in `TAB_TARGETS` in `widgets.ts`; point a tab at its real scene when it exists.

## Adding a screen

1. Make a scene under `src/scenes/` and register it in `src/main.ts` and `SCENES`.
2. Build it from these widgets and call `tabBar(this, '<tab>')`.
3. Add it to `TAB_TARGETS` if it is a tab.

## Not done yet

Thai fonts and text (need a font with Thai glyphs, see `src/assets/README.md`), real icons in place of the emoji tab icons, and real item art in place of colored squares.
