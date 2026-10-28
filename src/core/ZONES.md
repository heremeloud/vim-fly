# Locations (height zones)

The game's backdrops are the locations of the series' original novel. The climb moves through the story in five stages, two locations per stage, from humble beginnings to the leads' shared future. The code is in [zones.ts](zones.ts); keep this file in step with it.

## Story context

- **Cheese** is a baker who inherits her father's bakery. **Noey** is a lawyer. **Lal** works at the gym.
- The story starts when Cheese swerves to avoid a kitten on a rural road and crashes into Noey's Benz (the "car kissed" moment).
- A forged signature drives the legal conflict, which is fought and won in court.
- By the end Cheese runs her own independent shop, Bake Love Bakery, where the "Cheese-Noey Bread" is made.

## Zones

Each location is `ZONE_SPACING_METERS` (200 m) apart, so a stage is 400 m and the last location starts at 1800 m. Change the one constant in `zones.ts` to spread the story out more or less.

Difficulty is separate: it reaches full strength at `DIFFICULTY.fullAtMeters` (1000 m, in `constants.ts`), which is now partway through stage 3 (CC Law Office to the Gym). Everything after that stays at full difficulty. This is deliberate: reaching full difficulty sooner keeps the game harder. Raising `fullAtMeters` toward 1800 would spread the ramp across the whole story but make the middle easier.

| Stage | From | Location | Vibe | Placeholder backdrop |
| --- | --- | --- | --- | --- |
| **Stage 1** | 0 m | Rural Road (near rice fields) | Quiet road through golden fields; where the inciting crash happens | Gold with rice stalks and road edges |
| | 200 m | Heartwarming Bakery | Cheese's inherited two-story shop, the cozy starting hub, under her father's shadow | Cream with shelves and loaves |
| **Stage 2** | 400 m | Suburban Cafés | Local spots where Cheese delivers bread samples and builds her reputation | Pale green with coffee cups |
| | 600 m | Shopping Mall and Popcorn Shop | Busy downtown spot to relax, meet other characters, boost morale (the cheese popcorn counter) | Lavender with popcorn dots and shop frames |
| **Stage 3** | 800 m | CC Law Office | Sharp corporate setting: legal help, bread peace offerings, Cheese and Noey grow closer | Grey-blue with a window grid |
| | 1000 m | Gym | Where Lal works and Cheese secretly trains for fitness and confidence | Peach with dumbbells |
| **Stage 4** | 1200 m | The Courtroom | Tense, formal arena where the forged-signature fight is won | Brown with wooden pillars |
| | 1400 m | Beach and Seaside Restaurant | Coastal getaway: Cheese opens up about her past and the romance is sealed | Aqua with waves |
| **Stage 5** | 1600 m | Noey's Apartment (YZ Village) | Gated community house: late-night recipe tests, a shared domestic future | Lavender-blue with gate bars |
| | 1800 m | Bake Love Bakery | Cheese's own shop, free of her father's shadow; home of the Cheese-Noey Bread | Pink with hearts |

The banner shows the stage number and the location (for example "Stage 3 / CC Law Office"). Stages have no names of their own. The receipt lists the last location reached.

## Names in other languages

Location names are in `src/i18n` (`zone.<id>`) in all four languages, and the "Stage {n}" label is `zone.stage`. They are drafts; use the show's official names where they exist.

## Changing a zone

Edit `ZONE_DEFS` in `zones.ts` (id, label, stage, fallback colors); start heights come from the order and `ZONE_SPACING_METERS`. Add the new zone's two emoji to `ZONE_ICONS` in `zoneIcons.ts`.

## Testing a zone quickly

In dev (`npm run dev`), open the game with `?zone=<id>`, for example `http://localhost:5173/?zone=courtroom`, then press "Order now". The run starts at that zone's height with its difficulty. Ids: `ruralRoad`, `bakery`, `cafes`, `mall`, `lawOffice`, `gym`, `courtroom`, `beach`, `residence`, `bakeLove`. This only works in dev builds.

## Ideas this suggests (not built)

- Items drawn from the story: a kitten, a Benz, cheese popcorn, the Cheese-Noey Bread as a top points item, Lal's gym gear.
- Zone-specific hazards or items (courtroom gavels, gym weights, beach waves).
- Zone-specific music and a short story line on each banner.
