# Locations (height zones)

The game's backdrops are the locations of the series' original novel. The climb moves through the story in five stages, two locations per stage, from humble beginnings to the leads' shared future. The code is in [zones.ts](zones.ts); keep this file in step with it.

## Story context

- **Cheese** is a baker who inherits her father's bakery. **Noey** is a lawyer. **Lal** works at the gym.
- The story starts when Cheese swerves to avoid a kitten on a rural road and crashes into Noey's Benz (the "car kissed" moment).
- A forged signature drives the legal conflict, which is fought and won in court.
- By the end Cheese runs her own independent shop, Bake Love Bakery, where the "Cheese-Noey Bread" is made.

## Zones

Each location is `ZONE_SPACING_METERS` (350 m) apart, so a stage is 700 m and the last location starts at 3150 m. Change the one constant in `zones.ts` to spread the story out more or less.

Difficulty is separate: it reaches full strength at `DIFFICULTY.fullAtMeters` (1000 m, in `constants.ts`), which is partway through stage 2 (Suburban Cafés starts at 700 m). Everything after that stays at full difficulty. This is deliberate: reaching full difficulty sooner keeps the game harder. Raising `fullAtMeters` toward 1440 would spread the ramp across the whole story but make the middle easier.

| Stage | From | Location | Vibe | Placeholder backdrop |
| --- | --- | --- | --- | --- |
| **Stage 1** | 0 m | Rural Road (near rice fields) | Quiet road through golden fields; where the inciting crash happens | Gold with rice stalks and road edges |
| | 350 m | Heartwarming Bakery | Cheese's inherited two-story shop, the cozy starting hub, under her father's shadow | Cream with shelves and loaves |
| **Stage 2** | 700 m | Suburban Cafés | Local spots where Cheese delivers bread samples and builds her reputation | Pale green with coffee cups |
| | 1050 m | Shopping Mall and Popcorn Shop | Busy downtown spot to relax, meet other characters, boost morale (the cheese popcorn counter) | Lavender with popcorn dots and shop frames |
| **Stage 3** | 1400 m | CC Law Office | Sharp corporate setting: legal help, bread peace offerings, Cheese and Noey grow closer | Grey-blue with a window grid |
| | 1750 m | Gym | Where Lal works and Cheese secretly trains for fitness and confidence | Peach with dumbbells |
| **Stage 4** | 2100 m | The Courtroom | Tense, formal arena where the forged-signature fight is won | Brown with wooden pillars |
| | 2450 m | Noey's Apartment (YZ Village) | Gated community house: late-night recipe tests, a shared domestic future | Lavender-blue with gate bars |
| **Stage 5** | 2800 m | Aquarium | A day out among the fish tanks: Cheese opens up about her past and the romance is sealed (draft; adjust to the story) | Aqua with fish and bubbles |
| | 3150 m | Bake Love Bakery | Cheese's own shop, free of her father's shadow; home of the Cheese-Noey Bread | Pink with hearts |

The banner shows the stage number and the location (for example "Stage 3 / CC Law Office"). Stages have no names of their own. The receipt lists the last location reached.

## Location finales (the last 100 m)

Every location except the last (Bake Love Bakery, which never ends) finishes with a short themed stretch, `FINALE_METERS` (100 m) long, defined in [finales.ts](finales.ts). A banner announces it, the items that fit the place fall more often, and a few add a mild effect. They are flavour, not extra difficulty.

| Location | Banner (English) | More of | Effect |
| --- | --- | --- | --- |
| Rural Road | Car crash hour! | Exactly two car crashes are guaranteed (a third and two thirds of the way through), on top of the normal chance | |
| Heartwarming Bakery | Fresh from the oven! | Every kind of bread: the good ones (x3) and the debuff breads, cilantro and fish sauce (x2) | |
| Cafe | Coffee rush! | Coffee (x8), sandwich (x2), golden retriever (x12, even though it normally starts at stage 3) | Flaps 8% stronger |
| Shopping Mall | Shopping spree! | Nothing: the banner only | |
| CC Law Office | Paperwork pile-up! | Planners (x3) | Flaps 5% weaker |
| Gym | Pump it up! | Rolling pins (x8) | Flaps 8% stronger |
| The Courtroom | Order in the court! | Gavels (x2, already common) | |
| Noey's Apartment | Cozy night in! | Wine (x6), pasta (x4), handkerchief (x4) | |
| Aquarium | Noey, you like Wan, don't you?! | Fish sauce bread (x3), planners (x4) | Sideways current, up to about 60 px/s |

The banner texts are `finale.<zoneId>` in `src/i18n` (drafts, like the location names).

## Names in other languages

Location names are in `src/i18n` (`zone.<id>`) in all four languages, and the "Stage {n}" label is `zone.stage`. They are drafts; use the show's official names where they exist.

## Changing a zone

Edit `ZONE_DEFS` in `zones.ts` (id, label, stage, fallback colors); start heights come from the order and `ZONE_SPACING_METERS`. Add the new zone's two emoji to `ZONE_ICONS` in `zoneIcons.ts`.

## Testing a zone quickly

In dev (`npm run dev`), open the game with `?zone=<id>`, for example `http://localhost:5173/?zone=courtroom`, then press "Order now". The run starts at that zone's height with its difficulty. Ids: `ruralRoad`, `bakery`, `cafes`, `mall`, `lawOffice`, `gym`, `courtroom`, `aquarium`, `residence`, `bakeLove`. This only works in dev builds.

## Ideas this suggests (not built)

- Items drawn from the story: a kitten, a Benz, cheese popcorn, the Cheese-Noey Bread as a top points item, Lal's gym gear.
- Zone-specific hazards or items (courtroom gavels, gym weights, aquarium tanks).
- Zone-specific music and a short story line on each banner.
