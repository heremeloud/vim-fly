// Checks src/promo/links.json and prints what every button will open.
// Run with: npm run check:links
import { existsSync, readFileSync, statSync } from 'node:fs';
import { en } from '../src/i18n/en.ts';

const links = JSON.parse(readFileSync('src/promo/links.json', 'utf8'));
let problems = 0;
const fail = (msg) => {
  problems++;
  console.error('✗ ' + msg);
};

const PLATFORMS = { x: ['x.com', 'twitter.com'], instagram: ['instagram.com'], tiktok: ['tiktok.com'] };
const NAMES = { x: 'X', instagram: 'Instagram', tiktok: 'TikTok' };

function profileUrl(platform, value) {
  const v = (value ?? '').trim();
  if (!v) return null;
  if (v.startsWith('https://')) {
    try {
      const u = new URL(v);
      return PLATFORMS[platform].includes(u.hostname.replace(/^www\./, '')) ? u.toString() : null;
    } catch {
      return null;
    }
  }
  const h = v.replace(/^@/, '');
  if (!/^[A-Za-z0-9._]{1,40}$/.test(h)) return null;
  return { x: `https://x.com/${h}`, instagram: `https://www.instagram.com/${h}`, tiktok: `https://www.tiktok.com/@${h}` }[platform];
}

// Show
if (!links.show?.title?.trim()) fail('show.title is empty');
if (links.show?.airDate != null && Number.isNaN(new Date(links.show.airDate).getTime())) fail(`show.airDate "${links.show.airDate}" is not a date (use e.g. 2026-12-01T20:00:00+07:00)`);
console.log(`Show: ${links.show?.title}   air date: ${links.show?.airDate ?? 'not announced'}   hashtag: ${links.show?.hashtag ? '#' + links.show.hashtag : '(none)'}`);

// Pilot
const id = (links.pilot?.youtube ?? '').match(/(?:[?&]v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];
if (!id) fail('pilot.youtube is not a YouTube link');
else console.log(`Pilot: https://www.youtube.com/watch?v=${id}`);

// Accounts
const accounts = [['official', links.official], ...(links.leads ?? []).map((a, i) => [`leads[${i}]`, a]), ['vimmy', links.vimmy]];
for (const [where, a] of accounts) {
  if (!a) {
    fail(`${where} is missing`);
    continue;
  }
  if (!a.name?.trim()) fail(`${where}: name is empty`);
  if (!a.avatar) fail(`${where}: avatar is empty`);
  else if (/\.(png|jpe?g|webp)$/i.test(a.avatar)) {
    // A photo: the file must be in src/assets/avatars.
    if (!existsSync(`src/assets/avatars/${a.avatar}`)) fail(`${where}: photo "${a.avatar}" is not in src/assets/avatars/`);
    else console.log(`  (${where}: photo ${a.avatar}, ${Math.round(statSync(`src/assets/avatars/${a.avatar}`).size / 1024)} KB)`);
  }
  if (a.roleKey && !(a.roleKey in en)) fail(`${where}: roleKey "${a.roleKey}" is not a known text key`);
  const parts = [];
  for (const [platform, value] of Object.entries(a.handles ?? {})) {
    if (!(platform in PLATFORMS)) {
      fail(`${where}: unknown platform "${platform}" (use x, instagram or tiktok)`);
      continue;
    }
    if (value == null || value === '') parts.push(`${NAMES[platform]}: not set`);
    else if (!profileUrl(platform, value)) fail(`${where}: "${value}" is not a valid ${NAMES[platform]} handle or link`);
    else parts.push(`${NAMES[platform]} -> ${profileUrl(platform, value)}`);
  }
  console.log(`${a.name} (${where}): ${parts.join('   ') || 'no platforms'}`);
}

if (problems) {
  console.error(`\n${problems} problem(s) in src/promo/links.json.`);
  process.exit(1);
}
console.log('\n✓ links.json looks good.');
