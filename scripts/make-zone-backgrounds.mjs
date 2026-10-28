// Draws ten subdued, story-specific pixel-art backdrop tiles without external dependencies.
// Art is composed at 120x50 and enlarged 4x with nearest-neighbour pixels to 480x200.
// Run: node scripts/make-zone-backgrounds.mjs

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 120, H = 50, SCALE = 4;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'zones-v2');

const C = {
  ink: '#49352f', cream: '#fff2cf', paper: '#f8e8c6', white: '#fffaf0',
  honey: '#e9ad3c', gold: '#f3ca58', brown: '#9d6540', wood: '#74472f',
  green: '#719b58', leaf: '#467448', mint: '#a8c9a0',
  sky: '#9fd5dd', sky2: '#d5eef0', blue: '#5fa8bf', sea: '#4ca9bd',
  coral: '#df7b68', pink: '#e9a5ae', red: '#b9554e',
  plum: '#72526f', lavender: '#b8a9c9', navy: '#526776', gray: '#89979a',
  paleGray: '#c9d1cf', yellow: '#ffe18a', black: '#302927',
};

function rgba(hex) {
  const h = hex.slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
}
function canvas(fill) {
  const px = new Uint8Array(W * H * 4), color = rgba(fill);
  for (let i = 0; i < px.length; i += 4) px.set(color, i);
  return px;
}
function dot(px, x, y, color) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  px.set(rgba(color), (y * W + x) * 4);
}
function rect(px, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) dot(px, xx, yy, color);
}
function frame(px, x, y, w, h, color, thickness = 1) {
  rect(px, x, y, w, thickness, color); rect(px, x, y + h - thickness, w, thickness, color);
  rect(px, x, y, thickness, h, color); rect(px, x + w - thickness, y, thickness, h, color);
}
function line(px, x0, y0, x1, y1, color, thickness = 1) {
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, err = dx + dy;
  while (true) {
    rect(px, x0 - Math.floor(thickness / 2), y0 - Math.floor(thickness / 2), thickness, thickness, color);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function circle(px, cx, cy, r, color) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) dot(px, cx + x, cy + y, color);
}
function tri(px, ax, ay, bx, by, cx, cy, color) {
  const minX = Math.floor(Math.min(ax, bx, cx)), maxX = Math.ceil(Math.max(ax, bx, cx));
  const minY = Math.floor(Math.min(ay, by, cy)), maxY = Math.ceil(Math.max(ay, by, cy));
  const edge = (x1, y1, x2, y2, x, y) => (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const e1 = edge(ax, ay, bx, by, x, y), e2 = edge(bx, by, cx, cy, x, y), e3 = edge(cx, cy, ax, ay, x, y);
    if ((e1 >= 0 && e2 >= 0 && e3 >= 0) || (e1 <= 0 && e2 <= 0 && e3 <= 0)) dot(px, x, y, color);
  }
}
function window(px, x, y, w, h, lit = true) {
  frame(px, x, y, w, h, C.ink); rect(px, x + 1, y + 1, w - 2, h - 2, lit ? C.yellow : C.sky2);
  line(px, x + Math.floor(w / 2), y + 1, x + Math.floor(w / 2), y + h - 2, C.ink);
}
function car(px, x, y, color, facing = 1) {
  rect(px, x + 2, y + 3, 14, 4, C.ink); rect(px, x + 4, y, 8, 4, C.ink);
  rect(px, x + 3, y + 3, 12, 3, color); rect(px, x + 5, y + 1, 6, 2, C.sky2);
  circle(px, x + 5, y + 7, 2, C.black); circle(px, x + 13, y + 7, 2, C.black);
  dot(px, facing > 0 ? x + 16 : x + 1, y + 4, C.yellow);
}
function loaf(px, x, y, color = C.honey) {
  rect(px, x + 1, y + 2, 9, 4, C.ink); rect(px, x + 2, y + 1, 7, 5, color);
  dot(px, x + 4, y + 1, C.cream); dot(px, x + 7, y + 1, C.cream);
}

const painters = {
  ruralRoad(px) {
    rect(px, 0, 0, W, 18, C.sky2); rect(px, 0, 18, W, 32, C.gold);
    for (let x = 1; x < W; x += 5) { line(px, x, 25 + (x % 4), x, 34 + (x % 5), C.brown); line(px, x, 27, x + 2, 25, C.honey); }
    tri(px, 48, 50, 72, 50, 63, 17, C.gray); line(px, 60, 48, 63, 20, C.cream);
    car(px, 45, 34, C.green, 1); car(px, 64, 32, C.black, -1);
    circle(px, 61, 40, 2, C.white); dot(px, 60, 38, C.ink); dot(px, 62, 38, C.ink);
    tri(px, 58, 39, 60, 36, 61, 39, C.white); tri(px, 62, 39, 64, 36, 64, 40, C.white);
  },
  bakery(px) {
    rect(px, 0, 0, W, H, C.cream); rect(px, 10, 4, 100, 46, C.coral);
    rect(px, 14, 8, 92, 42, C.paper); rect(px, 14, 25, 92, 3, C.wood);
    for (const x of [20, 42, 72, 94]) window(px, x, 11, 14, 10, true);
    rect(px, 42, 30, 36, 20, C.wood); rect(px, 45, 33, 30, 17, C.white);
    rect(px, 16, 29, 22, 13, C.brown); rect(px, 82, 29, 22, 13, C.brown);
    for (const [x, y] of [[18, 31], [27, 35], [84, 31], [93, 35]]) loaf(px, x, y);
    rect(px, 48, 4, 24, 6, C.ink); rect(px, 49, 5, 22, 4, C.honey); loaf(px, 55, 4, C.green);
  },
  cafes(px) {
    rect(px, 0, 0, W, 14, C.sky2); rect(px, 0, 14, W, 36, C.mint);
    for (const [x, color] of [[4, C.green], [43, C.coral], [82, C.plum]]) {
      rect(px, x, 13, 34, 37, C.paper); frame(px, x, 13, 34, 37, C.ink, 2);
      rect(px, x + 3, 17, 28, 5, color); window(px, x + 5, 27, 10, 12, false); window(px, x + 19, 27, 10, 12, true);
      rect(px, x + 11, 42, 12, 2, C.wood); loaf(px, x + 13, 36, C.honey);
      rect(px, x + 14, 17, 5, 3, C.white); circle(px, x + 20, 18, 2, C.white);
    }
  },
  mall(px) {
    rect(px, 0, 0, W, H, C.lavender); rect(px, 6, 5, 108, 45, C.paper); frame(px, 6, 5, 108, 45, C.plum, 2);
    line(px, 8, 42, 48, 18, C.gray, 4); line(px, 50, 18, 78, 42, C.gray, 4);
    for (let x = 12; x < 45; x += 7) line(px, x, 39 - Math.floor((x - 12) * 0.6), x, 44 - Math.floor((x - 12) * 0.6), C.ink);
    rect(px, 82, 20, 26, 25, C.red); rect(px, 85, 23, 20, 9, C.white);
    for (const [x, y] of [[88, 20], [94, 18], [101, 20], [90, 25], [99, 24]]) circle(px, x, y, 2, C.yellow);
    rect(px, 83, 33, 24, 2, C.ink); rect(px, 91, 36, 8, 9, C.honey);
  },
  lawOffice(px) {
    rect(px, 0, 0, W, H, C.navy); rect(px, 5, 4, 110, 29, C.sky2);
    for (let x = 7; x < 114; x += 13) for (let y = 6; y < 31; y += 8) window(px, x, y, 10, 6, (x + y) % 3 === 0);
    rect(px, 0, 34, W, 16, C.paleGray); rect(px, 35, 38, 50, 8, C.wood); rect(px, 40, 36, 16, 3, C.paper);
    rect(px, 62, 34, 12, 4, C.plum); rect(px, 65, 30, 6, 4, C.white); rect(px, 90, 36, 8, 10, C.green);
    line(px, 94, 36, 94, 28, C.leaf); circle(px, 90, 29, 3, C.leaf); circle(px, 98, 30, 3, C.leaf);
  },
  gym(px) {
    rect(px, 0, 0, W, H, C.paper); rect(px, 4, 4, 112, 29, C.sky2); frame(px, 4, 4, 112, 29, C.gray, 2);
    for (let x = 31; x < 116; x += 28) line(px, x, 5, x, 32, C.gray);
    rect(px, 0, 34, W, 16, C.coral);
    for (const x of [16, 76]) { rect(px, x, 38, 28, 3, C.ink); rect(px, x - 3, 35, 4, 9, C.ink); rect(px, x + 27, 35, 4, 9, C.ink); }
    line(px, 55, 44, 66, 34, C.ink, 2); circle(px, 54, 45, 4, C.navy); circle(px, 67, 33, 4, C.navy);
    rect(px, 100, 34, 12, 12, C.mint); line(px, 106, 34, 106, 26, C.leaf); circle(px, 102, 27, 3, C.leaf); circle(px, 109, 28, 3, C.leaf);
  },
  courtroom(px) {
    rect(px, 0, 0, W, H, C.cream); rect(px, 0, 0, W, 8, C.wood);
    for (const x of [7, 28, 91, 112]) { rect(px, x, 8, 5, 42, C.brown); rect(px, x - 2, 8, 9, 3, C.wood); }
    rect(px, 38, 21, 44, 22, C.wood); rect(px, 42, 18, 36, 5, C.brown); rect(px, 48, 12, 24, 7, C.ink);
    rect(px, 50, 13, 20, 5, C.gold); rect(px, 56, 26, 10, 8, C.brown);
    line(px, 60, 27, 69, 21, C.ink, 2); rect(px, 66, 18, 8, 4, C.ink); rect(px, 67, 19, 6, 2, C.honey);
    rect(px, 18, 40, 22, 5, C.brown); rect(px, 80, 40, 22, 5, C.brown);
  },
  beach(px) {
    rect(px, 0, 0, W, 16, C.sky2); rect(px, 0, 16, W, 15, C.sea); rect(px, 0, 31, W, 19, C.yellow);
    for (let y = 19; y < 30; y += 5) for (let x = (y % 2) * 5; x < W; x += 18) line(px, x, y, x + 8, y, C.white);
    rect(px, 76, 5, 40, 28, C.paper); frame(px, 76, 5, 40, 28, C.ink); rect(px, 78, 8, 36, 5, C.coral);
    for (let x = 80; x < 114; x += 6) { line(px, x, 6, x + 3, 10, C.honey); circle(px, x, 6, 1, C.yellow); }
    rect(px, 84, 25, 20, 2, C.wood); rect(px, 88, 27, 2, 8, C.wood); rect(px, 100, 27, 2, 8, C.wood);
    circle(px, 91, 24, 2, C.white); circle(px, 98, 24, 2, C.white); line(px, 94, 24, 96, 18, C.white);
    rect(px, 14, 36, 20, 2, C.coral); line(px, 24, 36, 24, 46, C.wood); tri(px, 13, 36, 24, 27, 35, 36, C.coral);
  },
  residence(px) {
    rect(px, 0, 0, W, H, C.lavender); rect(px, 21, 7, 78, 43, C.paper); tri(px, 16, 13, 60, 0, 104, 13, C.navy);
    for (const [x, y] of [[29, 17], [77, 17], [29, 32], [77, 32]]) window(px, x, y, 14, 10, true);
    rect(px, 51, 25, 18, 25, C.wood); dot(px, 65, 37, C.gold);
    rect(px, 0, 38, 20, 12, C.gray); rect(px, 100, 38, 20, 12, C.gray);
    for (let x = 4; x < 117; x += 8) rect(px, x, 30, 2, 20, C.ink);
    rect(px, 0, 43, W, 3, C.ink); line(px, 58, 30, 58, 44, C.ink); line(px, 62, 30, 62, 44, C.ink);
    circle(px, 12, 35, 6, C.leaf); circle(px, 108, 35, 6, C.leaf);
  },
  bakeLove(px) {
    rect(px, 0, 0, W, H, C.sky2); rect(px, 13, 8, 94, 42, C.cream); frame(px, 13, 8, 94, 42, C.ink, 2);
    tri(px, 8, 12, 60, 0, 112, 12, C.coral); rect(px, 16, 13, 88, 7, C.pink);
    for (let x = 18; x < 103; x += 12) tri(px, x, 20, x + 6, 27, x + 12, 20, x % 24 ? C.white : C.coral);
    window(px, 22, 29, 22, 14, true); window(px, 76, 29, 22, 14, true);
    rect(px, 50, 27, 20, 23, C.wood); rect(px, 53, 30, 14, 20, C.white);
    rect(px, 44, 8, 32, 7, C.ink); rect(px, 46, 10, 28, 3, C.honey); loaf(px, 55, 8, C.coral);
    circle(px, 58, 36, 4, C.pink); circle(px, 64, 36, 4, C.pink); tri(px, 54, 37, 68, 37, 61, 45, C.pink);
    rect(px, 0, 46, W, 4, C.green); circle(px, 8, 43, 5, C.leaf); circle(px, 112, 43, 5, C.leaf);
  },
};

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0;
});
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(width, height, pixels) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (width * 4 + 1)] = 0; Buffer.from(pixels.buffer, y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function upscale(px) {
  const out = new Uint8Array(W * SCALE * H * SCALE * 4);
  for (let y = 0; y < H * SCALE; y++) for (let x = 0; x < W * SCALE; x++) {
    const src = (Math.floor(y / SCALE) * W + Math.floor(x / SCALE)) * 4;
    out.set(px.subarray(src, src + 4), (y * W * SCALE + x) * 4);
  }
  return out;
}

mkdirSync(OUT, { recursive: true });
const rendered = [];
for (const [id, paint] of Object.entries(painters)) {
  const px = canvas(C.cream); paint(px); const large = upscale(px); rendered.push({ id, large });
  writeFileSync(join(OUT, `${id}.png`), png(W * SCALE, H * SCALE, large));
}

const previewW = W * SCALE * 2, previewH = H * SCALE * 5;
const preview = new Uint8Array(previewW * previewH * 4);
for (const [i, { large }] of rendered.entries()) {
  const ox = (i % 2) * W * SCALE, oy = Math.floor(i / 2) * H * SCALE;
  for (let y = 0; y < H * SCALE; y++) {
    const src = y * W * SCALE * 4, dst = ((oy + y) * previewW + ox) * 4;
    preview.set(large.subarray(src, src + W * SCALE * 4), dst);
  }
}
writeFileSync(join(OUT, '_preview.png'), png(previewW, previewH, preview));
console.log(`Wrote ${rendered.length} zone tiles to ${OUT}`);
