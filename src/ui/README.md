# ui

Shared building blocks for the ordering-app menus, so every screen looks like one app.

## Files

- `theme.ts`: the colors and font. This is the one place to change the look. The current orange/cream palette is a **placeholder** until the show's own colors and logo are decided.
- `widgets.ts`: `label` (text), `roundedBox`, `hitArea` (invisible tap target), `button` (pill call-to-action) and `tabBar` (bottom navigation).

## Design rules

- Inspired by the layout conventions of Thai food-delivery apps such as LINE MAN (shop page, category chips, menu cards with prices, bottom tab bar). Use the series' own name, colors and logo. Do **not** copy any real app's logo, exact colors, icons or assets; they are trademarked.
- The screen is 480x800. The bottom tab bar is 80 px tall (`TAB_BAR_HEIGHT`); keep content above it.
- Scrolling lists draw an opaque header and the tab bar on top (higher depth) to hide rows scrolled underneath. See `MenuScene`.

## Tab bar

Store, Menu, Orders, Promos. Store and Menu are built. Orders and Promos open `ComingSoonScene`. Tab targets are in `TAB_TARGETS` in `widgets.ts`; point a tab at its real scene when it exists.

## Adding a screen

1. Make a scene under `src/scenes/` and register it in `src/main.ts` and `SCENES`.
2. Build it from these widgets and call `tabBar(this, '<tab>')`.
3. Add it to `TAB_TARGETS` if it is a tab.

## Not done yet

Thai fonts and text (need a font with Thai glyphs, see `src/assets/README.md`), real icons in place of the emoji tab icons, and real item art in place of colored squares.
