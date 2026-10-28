// Draws the 16x16 pixel-art item sprites from text grids and writes PNGs. No dependencies.
//   node scripts/make-item-sprites.mjs
// Output: src/assets/items/<id>.png (one per item) and src/assets/items/_preview.png (contact sheet, 8x).
// Each sprite is a grid of palette letters, up to 16x16; smaller grids are centred automatically.
// Edit a grid, rerun, done. Keep the palette small so the art stays consistent.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 16;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'items');

const PALETTE = {
  '.': null, // transparent
  K: '#3b2a24', // outline
  W: '#ffffff',
  L: '#dfe7ea', // light gray
  A: '#90a4ae', // gray
  D: '#546e7a', // dark gray
  N: '#37474f', // navy
  n: '#5c7480', // navy highlight
  Y: '#ffd54f', // yellow
  y: '#f9a825', // gold
  O: '#ff8f00', // orange
  B: '#e8b36b', // bread
  b: '#b9783f', // bread shadow
  C: '#fff3d6', // cream
  R: '#e53935', // red
  r: '#a31515', // dark red
  G: '#8bc34a', // green
  g: '#4e7a27', // dark green
  U: '#6d4c41', // brown
  u: '#a1887f', // light brown
  P: '#8e24aa', // purple
  p: '#5e1670', // dark purple
  S: '#4fc3f7', // sky blue
  T: '#f48fb1', // pink
};

const SPRITES = {
  pandanCustardBread: [
    '....KKKKKK....',
    '..KKGGGGGGKK..',
    '.KGGGgGGGgGGK.',
    'KGGGGGGGGGGGGK',
    'KGGgGGGGGGgGGK',
    'KYYYYYYYYYYYYK',
    'KYYCCCCCCCCYYK',
    'KGGGGGGGGGGGGK',
    '.KGgGGGGGGgGK.',
    '..KKggggggKK..',
    '....KKKKKK....',
  ],
  cheeseButterBread: [
    '..KKKKKKKKKK..',
    '.KYYYYYYYYYYK.',
    'KYYyYYYYYYyYYK',
    'KYYYYYYYYYYYYK',
    'KYWWWWWWWWWWYK',
    'KYWCCCCCCCCWYK',
    'KYWWWWWWWWWWYK',
    'KBBBBBBBBBBBBK',
    'KBBbBBBBBBbBBK',
    '.KBBBBBBBBBBK.',
    '..KKKKKKKKKK..',
  ],
  shiopan: [
    '...KKKKKKKKK...',
    '.KKBBBBBBBBBKK.',
    'KBBWBBBBbBBBWBK',
    'KBBBBbBBBBbBBBK',
    'KBBbBBBBbBBBBbK',
    'KBBBBBBBBBBBBBK',
    '.KbbBBBBBBBBbK.',
    '..KKbbbbbbbKK..',
    '....KKKKKKK....',
  ],
  sandwich: [
    '......KK......',
    '....KKCCKK....',
    '..KKCCCCCCKK..',
    '.KCCCCCCCCCCK.',
    'KGgGGgGGgGGgGK',
    'KRRRRRRRRRRRRK',
    'KTTTTTTTTTTTTK',
    'KCCCCCCCCCCCCK',
    '.KKKKKKKKKKKK.',
  ],
  pasta: [
    '...KKKKKKKK...',
    '.KKYyYYyYYyKK.',
    'KYyYYGYyYYyYYK',
    'KYYRRRRRRRRYYK',
    'KyYRrRRRRrRYyK',
    '.KYYRRRRRRYYK.',
    '.KWWWWWWWWWWK.',
    '..KWLLLLLLWK..',
    '...KKKKKKKK...',
  ],
  coffee: [
    '....L..L.......',
    '...L..L........',
    '..KKKKKKKKKK...',
    '.KUUUUUUUUUUK..',
    '.KUuUUUUUUuUK..',
    '.KWWWWWWWWWWKKK',
    '.KWWWWWWWWWWK.K',
    '.KWWWWWWWWWWK.K',
    '.KWWWWWWWWWWKKK',
    '..KWWWWWWWWK...',
    '...KKKKKKKK....',
  ],
  wine: [
    '.KKKKKKKKK.',
    'KLWWWWWWWLK',
    'KLWPPPPPWLK',
    'KLPPpPPPPLK',
    '.KLPPPPPLK.',
    '..KLPPPLK..',
    '...KPPPK...',
    '....KLK....',
    '....KLK....',
    '....KLK....',
    '..KKLLLKK..',
    '.KKKKKKKKK.',
  ],
  shrimpFriedRiceBox: [
    '.KKKKKKKKKKKKK.',
    'KRRRRRRRRRRRRRK',
    'KRrrrrrrrrrrrRK',
    'KKKKKKKKKKKKKKK',
    'KYyYYYyYYYyYYyK',
    'KYYWYYYYGYYYyYK',
    'KYyYOOYYYYOOYYK',
    'KYYOOOYyYOOOYYK',
    'KYYYYYYYYYYYYYK',
    '.KKKKKKKKKKKKK.',
  ],
  goldenRetriever: [
    '..KKKKKKKKKK..',
    '.KYYYYYYYYYYK.',
    'KOKYYYYYYYYKOK',
    'KOOYKYYYYKYOOK',
    'KOOYYYYYYYYOOK',
    'KOOYYCCCCYYOOK',
    '.KOYCCKKCCYOK.',
    '.KOYYCTTCYYOK.',
    '..KOYYTTYYOK..',
    '...KKKKKKKK...',
  ],

  oyster: [
    '...KKKKKKKK...',
    '.KKLLLLLLLLKK.',
    'KLALLLALLLALLK',
    'KLLALLALLALLLK',
    'KDDDDDDDDDDDDK',
    'KDWWWWWWWWWWDK',
    'KDWWWWCCWWWWDK',
    '.KDDWWWWWWDDK.',
    '..KKDDDDDDKK..',
    '....KKKKKK....',
  ],
  lawyerSuit: [
    '..KKKKK.KKKKK..',
    '.KNNNNKWKNNNNK.',
    'KNNnNNKRKNNnNNK',
    'KNNNNNKRKNNNNNK',
    'KNNNNNKRKNNNNNK',
    'KNnNNNKrKNNNnNK',
    'KNNNNNNKNNNNNNK',
    'KNNNNNNKNNNNNNK',
    'KnNNNNNKNNNNNnK',
    'KKKKKKKKKKKKKKK',
  ],
  handkerchief: [
    'KKKKKKKKKKKKKK',
    'KSSSSSSSSSSSSK',
    'KSWWWWWWWWWWSK',
    'KSWWWRWWRWWWSK',
    'KSWWRRRRRRWWSK',
    'KSWWWRRRRWWWSK',
    'KSWWWWRRWWWWSK',
    'KSWWWWWWWWWWSK',
    'KSSSSSSSSSSSSK',
    'KKKKKKKKKKKKKK',
  ],
  rollingPin: [
    '...KKKKKKKKKK...',
    '..KBBBBBBBBBBK..',
    'KKKBBBbBBbBBBKKK',
    'KbbKBBBBBBBBKbbK',
    'KbbKBBbBBbBBKbbK',
    'KKKBBBBBBBBBBKKK',
    '..KBBBBBBBBBBK..',
    '...KKKKKKKKKK...',
  ],
  helicopter: [
    'DDDDDDDDDDDDDDDD',
    '.......KK.......',
    '..KKKKKKKK....KK',
    '.KRRSSLLRRKKKK.K',
    'KRRSSSLLRRRRRRRK',
    'KRRRRRRRRRKKKKK.',
    '.KKKKKKKKKK.....',
    '.KKKKKKKKKKKK...',
  ],

  gavelHammer: [
    'Y.............Y.',
    '.KKKKKKKKKKKK...',
    'KUUKBBBBBBKUUK..',
    'KUUKBBBBbbKUUK..',
    'KUUKbbbbbbKUUK..',
    '.KKKKKKKKKKKK...',
    '....KBbK........',
    '....KBbK........',
    '....KBbK........',
    '....KBbK........',
    '....KBbK........',
    '....KKKK........',
  ],
  cilantroBread: [
    '.G.gG..Gg.G...',
    '.gGGgGGgGGgG..',
    '..KKKKKKKKKK..',
    '.KBBBBBBBBBBK.',
    'KBBbBBBBBBbBBK',
    'KBBBBBBBBBBBBK',
    'KBBBBbBBbBBBBK',
    'KBBBBBBBBBBBBK',
    '.KbBBBBBBBBbK.',
    '..KKbbbbbbKK..',
    '....KKKKKK....',
  ],
  fishSauceBread: [
    '...KKKKKKKK...',
    '.KKBBBBBBBBKK.',
    'KBBBBBBBBBBBBK',
    'KUUUUUUUUUUUUK',
    'KUuUUUUuUUUuUK',
    'KBUUBBBUUBUBBK',
    'KBBUBBBBUBBUBK',
    'KBBBBBBBBBBBBK',
    '.KbBBBBBBBBbK.',
    '..KKbbbbbbKK..',
    '....KKKKKK....',
  ],
  planner: [
    '..A.A.A.A.A..',
    '.KKKKKKKKKKK.',
    'KPPPPPPPPPPPK',
    'KPPWWWWWWWPPK',
    'KPPWKKKKKWPPK',
    'KPPWWWWWWWPPK',
    'KPPWKKKKKWPPK',
    'KPPWWWWWWWPPK',
    'KppppppppppPK',
    'KKKKKKKKKKKKK',
  ],
  carCrash: [
    'Y..yKKKKKKK.y..Y',
    '...KSSSKSSSK....',
    '..KSSSSKSSSSK...',
    'KKKKKKKKKKKKKKKK',
    'KOOOOOOOOOOOOOOK',
    'KOOOOOOOOOOOOYYK',
    'KOOOOOOOOOOOOOOK',
    'KKKKKKKKKKKKKKKK',
    '.KKWWKK..KKWWKK.',
    '.KKKKKK..KKKKKK.',
  ],
};

// ---- rendering ----

function toRgba(grid, id) {
  const w = grid[0].length;
  for (const row of grid) {
    if (row.length !== w) throw new Error(`${id}: row "${row}" is ${row.length} wide, expected ${w}`);
  }
  if (w > SIZE || grid.length > SIZE) throw new Error(`${id}: ${w}x${grid.length} is bigger than ${SIZE}x${SIZE}`);
  const px = new Uint8Array(SIZE * SIZE * 4);
  const ox = Math.floor((SIZE - w) / 2);
  const oy = Math.floor((SIZE - grid.length) / 2);
  grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (!(ch in PALETTE)) throw new Error(`${id}: unknown palette letter "${ch}"`);
      const hex = PALETTE[ch];
      if (!hex) return;
      const i = ((y + oy) * SIZE + (x + ox)) * 4;
      px[i] = parseInt(hex.slice(1, 3), 16);
      px[i + 1] = parseInt(hex.slice(3, 5), 16);
      px[i + 2] = parseInt(hex.slice(5, 7), 16);
      px[i + 3] = 255;
    });
  });
  return px;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // no filter
    Buffer.from(rgba.buffer, y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });
const ids = Object.keys(SPRITES);
const rendered = ids.map((id) => ({ id, px: toRgba(SPRITES[id], id) }));
for (const { id, px } of rendered) writeFileSync(join(OUT, `${id}.png`), png(SIZE, SIZE, px));

// Contact sheet: 5 columns, 8x scale, on a light background.
const COLS = 5, SCALE = 8, CELL = SIZE * SCALE + 16;
const rows = Math.ceil(ids.length / COLS);
const W = COLS * CELL, H = rows * CELL;
const sheet = new Uint8Array(W * H * 4);
for (let i = 0; i < sheet.length; i += 4) sheet.set([255, 243, 224, 255], i);
rendered.forEach(({ px }, n) => {
  const cx = (n % COLS) * CELL + 8, cy = Math.floor(n / COLS) * CELL + 8;
  for (let y = 0; y < SIZE * SCALE; y++) {
    for (let x = 0; x < SIZE * SCALE; x++) {
      const s = ((Math.floor(y / SCALE)) * SIZE + Math.floor(x / SCALE)) * 4;
      if (!px[s + 3]) continue;
      sheet.set(px.subarray(s, s + 4), ((cy + y) * W + (cx + x)) * 4);
    }
  }
});
writeFileSync(join(OUT, '_preview.png'), png(W, H, sheet));
console.log(`Wrote ${ids.length} sprites to ${OUT}`);
