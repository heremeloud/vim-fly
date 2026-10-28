// Checks that every language has exactly the same keys and {placeholders} as English,
// and that every item and zone has a name in every language.
// Run with: npm run check:i18n
import { en } from '../src/i18n/en.ts';
import { th } from '../src/i18n/th.ts';
import { ja } from '../src/i18n/ja.ts';
import { zh } from '../src/i18n/zh.ts';
import { zhHant } from '../src/i18n/zhHant.ts';
import { readFileSync } from 'node:fs';

const tables = { th, ja, zh, zhHant };
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
let problems = 0;
const fail = (msg) => {
  problems++;
  console.error('✗ ' + msg);
};

for (const [name, table] of Object.entries(tables)) {
  for (const key of Object.keys(en)) {
    if (!(key in table)) fail(`${name}: missing "${key}"`);
    else if (placeholders(table[key]) !== placeholders(en[key])) fail(`${name}: placeholders differ in "${key}"`);
    else if (table[key].trim() === '') fail(`${name}: empty "${key}"`);
  }
  for (const key of Object.keys(table)) if (!(key in en)) fail(`${name}: extra key "${key}"`);
}

// Every item id and zone id used by the game needs a name.
const ids = (file, re) => [...readFileSync(file, 'utf8').matchAll(re)].map((m) => m[1]);
const itemIds = ids('src/items/itemDefs.ts', /\{ id: '(\w+)', label:/g);
const zoneIds = ids('src/core/zones.ts', /\{ id: '(\w+)', label:/g);
for (const id of itemIds) if (!(`item.${id}` in en)) fail(`no item name for "${id}"`);
for (const id of zoneIds) if (!(`zone.${id}` in en)) fail(`no zone name for "${id}"`);

if (problems) {
  console.error(`\n${problems} problem(s).`);
  process.exit(1);
}
console.log(`✓ i18n OK: ${Object.keys(en).length} strings in ${Object.keys(tables).length + 1} languages, ${itemIds.length} items, ${zoneIds.length} zones.`);
