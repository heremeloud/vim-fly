# Locations (height zones)

The game's backdrops are the locations of the series' original novel. The climb moves through the story in ten stages, one location per stage, from humble beginnings to the leads' shared future. The code is in [zones.ts](zones.ts); keep this file in step with it.

## Story context

- **Cheese** is a baker who inherits her father's bakery. **Noey** is a lawyer. **Lal** works at the gym.
- The story starts when Cheese swerves to avoid a kitten on a rural road and crashes into Noey's Benz (the "car kissed" moment).
- A forged signature drives the legal conflict, which is fought and won in court.
- By the end Cheese runs her own independent shop, Bake Love Bakery, where the "Cheese-Noey Bread" is made.

## Zones

Each location is `ZONE_SPACING_METERS` (350 m) apart, so a stage is 350 m and the last location starts at 3150 m. Change the one constant in `zones.ts` to spread the story out more or less.

Difficulty is separate: it reaches full strength at `DIFFICULTY.fullAtMeters` (1500 m, in `constants.ts`). Everything after that stays at full difficulty. The ramp is meant to stay demanding but let skilled players reach the later locations, the Aquarium included. Lower `fullAtMeters` to make the middle of the climb harder, raise it to make it easier.

| Stage | From | Location | Vibe | Placeholder backdrop |
| --- | --- | --- | --- | --- |
| **Stage 1** | 0 m | Rural Road (near rice fields) | Quiet road through golden fields; where the inciting crash happens | Gold with rice stalks and road edges |
| **Stage 2** | 350 m | Heartwarming Bakery | Cheese's inherited two-story shop, the cozy starting hub, under her father's shadow | Cream with shelves and loaves |
| **Stage 3** | 700 m | Suburban Cafés | Local spots where Cheese delivers bread samples and builds her reputation | Pale green with coffee cups |
| **Stage 4** | 1050 m | Shopping Mall and Popcorn Shop | Busy downtown spot to relax, meet other characters, boost morale (the cheese popcorn counter) | Lavender with popcorn dots and shop frames |
| **Stage 5** | 1400 m | CC Law Office | Sharp corporate setting: legal help, bread peace offerings, Cheese and Noey grow closer | Grey-blue with a window grid |
| **Stage 6** | 1750 m | Gym | Where Lal works and Cheese secretly trains for fitness and confidence | Peach with dumbbells |
| **Stage 7** | 2100 m | The Courtroom | Tense, formal arena where the forged-signature fight is won | Brown with wooden pillars |
| **Stage 8** | 2450 m | Noey's Apartment (YZ Village) | Gated community house: late-night recipe tests, a shared domestic future | Lavender-blue with gate bars |
| **Stage 9** | 2800 m | Aquarium | A day out among the fish tanks: Cheese opens up about her past and the romance is sealed (draft; adjust to the story) | Aqua with fish and bubbles |
| **Stage 10** | 3150 m | Bake Love Bakery | Cheese's own shop, free of her father's shadow; home of the Cheese-Noey Bread | Pink with hearts |

The banner shows the stage number and the location (for example "Stage 5 / CC Law Office"). Every stage is a single location, so stages have no names of their own. The receipt lists the last location reached.

## Themed drops all through a location

Outside the rush too, each location makes its own items fall more often (`ZONE_THEMES` in [zoneThemes.ts](zoneThemes.ts), mild multipliers of x1.5 to x3): the Bakery favours breads, the Cafe coffee and sandwiches, the Mall popcorn, the Law Office planners, lunch boxes and suits, the Gym rolling pins, the Courtroom gavels and suits, Noey's Apartment wine, pasta and tom yum, the Aquarium oysters, and so on. The rush boosts below stack on top of these.

## Location rushes (the last 100 m)

Every location except the last (Bake Love Bakery, which never ends) finishes with a short themed stretch, `FINALE_METERS` (100 m) long, defined in [finales.ts](finales.ts). A banner and pulsing frame announce it. Spawn beats run at 90% of their normal interval (about 11% more often), with another 15% chance of a double drop, and items that fit the place receive strong weight boosts. These are meant to feel like brief events, so tune them by hand if a later rush becomes unfair.

| Location | Banner (English) | More of | Effect |
| --- | --- | --- | --- |
| Rural Road | Don't crash! | Car crashes x5, kittens x4, and exactly two are guaranteed (a third and two thirds of the way through) on top of the normal chance | |
| Heartwarming Bakery | Fresh from the oven! | Every bread: pandan custard bread and shiopan x6, cheese butter bread x3 (each one refills a side dash, so it stays scarce), cilantro and fish sauce breads x4 | Exactly 40 drops, spread evenly over the 100 m (no random timer) |
| Cafe | Coffee rush! | Coffee x40 (and 75% of all drops, plus extras), sandwich x3, cilantro and fish sauce breads x3, golden retriever x12 (even before stage 5) | Flaps 12% stronger |
| Shopping Mall | Shopping spree! | Cheese popcorn x40 (and 75% of all drops, plus extras), cheese butter bread x8, helicopter x6, golden retriever x5 | |
| CC Law Office | Paperwork pile-up! | Planners x4, shrimp fried rice lunch box x6 | Flaps 10% weaker |
| Gym | Pump it up! | Rolling pins x14, ice cream x8 | Flaps 15% stronger |
| The Courtroom | Order in the court! | Gavels x5 | |
| Noey's Apartment | Cozy night in! | Wine x10, pasta x8, handkerchief x8 | |
| Aquarium | "Noey, you like Wan, don't you?!" | Fish sauce bread x7, planners x12 | Sideways current, up to about 90 px/s |

The banner texts are `finale.<zoneId>` in `src/i18n` (drafts, like the location names).

Each finale is announced on a board that suits its place, drawn by `src/ui/boards.ts` (`FINALE_BOARD` says which): a yellow road sign (Rural Road), a baguette (Bakery), a chalkboard (Cafe), a pink price tag (Mall), a memo sheet (Law Office), a treadmill console (Gym), a wooden nameplate (Courtroom), a night-blue cushion (Noey's Apartment) and a speech bubble (Aquarium, since it is a line from the series). A translation of the speech bubble can carry its own `\n` to choose where the two lines break. Preview all of them on the local Effects page (`/?fx`).

## Names in other languages

Location names are in `src/i18n` (`zone.<id>`) in all five languages, and the "Stage {n}" label is `zone.stage`. They are drafts; use the show's official names where they exist.

## Changing a zone

Edit `ZONE_DEFS` in `zones.ts` (id, label, fallback colors; the stage number is the position in the list); start heights come from the order and `ZONE_SPACING_METERS`. Add the new zone's two emoji to `ZONE_ICONS` in `zoneIcons.ts`.

## Testing a zone quickly

In dev (`npm run dev`), open the game with `?zone=<id>`, for example `http://localhost:5173/?zone=courtroom`, then press "Order now". The run starts at that zone's height with its difficulty. Ids: `ruralRoad`, `bakery`, `cafes`, `mall`, `lawOffice`, `gym`, `courtroom`, `aquarium`, `residence`, `bakeLove`. This only works in dev builds.

## Ideas this suggests (not built)

- Items drawn from the story: a kitten, a Benz, cheese popcorn, the Cheese-Noey Bread as a top points item, Lal's gym gear.
- Zone-specific hazards or items (courtroom gavels, gym weights, aquarium tanks).
- Zone-specific music and a short story line on each banner.
