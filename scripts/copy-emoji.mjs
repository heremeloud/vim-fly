// Copies the Google (Noto) emoji PNGs used by the zone backdrops and the in-run effects into src/assets/emoji/,
// so the backdrops look the same on every device instead of using the OS emoji font.
// Run after changing src/core/zoneIcons.ts or src/core/effectIcons.ts:  npm run emoji
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { ZONE_ICONS } from '../src/core/zoneIcons.ts';
import { EFFECT_EMOJI } from '../src/core/effectIcons.ts';
import { emojiFileName } from '../src/core/emojiFile.ts';

const SRC = 'node_modules/emoji-datasource-google/img/google/64';
const OUT = 'src/assets/emoji';
rmSync(OUT, { recursive: true, force: true }); // drop emoji no zone uses any more
mkdirSync(OUT, { recursive: true });

let missing = 0;
for (const emoji of new Set([...Object.values(ZONE_ICONS).flat(2), ...EFFECT_EMOJI])) {
  const name = emojiFileName(emoji);
  // The package sometimes omits the fe0f variation selector that our string has.
  const candidates = [name, name.replace(/-fe0f/g, '')];
  const found = candidates.find((c) => existsSync(`${SRC}/${c}.png`));
  if (!found) {
    console.error(`missing: ${emoji} (${name})`);
    missing++;
    continue;
  }
  copyFileSync(`${SRC}/${found}.png`, `${OUT}/${name}.png`);
}
console.log(missing ? `${missing} missing` : 'all emoji copied');
process.exit(missing ? 1 : 0);
