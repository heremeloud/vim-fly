import Phaser from 'phaser';

// Sound effects are synthesised at start-up into Web Audio buffers and registered in Phaser's audio cache,
// so the game plays them through Phaser's own sound manager (this.sound) and ships no audio files.
// Swap any of them for a real recording later by loading a file under the same key.

export type Sfx = 'flap' | 'point' | 'buff' | 'yips' | 'debuff' | 'hammer' | 'crash' | 'dash';
export type SfxLoop = 'buzz' | 'copter';

const KEY = 'vimmy-fly.sound';
const RATE = 44100;
const TAU = Math.PI * 2;

type Gen = (t: number) => number;

function render(ctx: BaseAudioContext, seconds: number, gen: Gen): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.round(seconds * RATE), RATE);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.max(-1, Math.min(1, gen(i / RATE)));
  return buffer;
}

/** Wave whose pitch follows `freq(t)`. Phase is accumulated so sweeps stay smooth. */
function oscillator(freq: Gen, wave: (phase: number) => number): Gen {
  let phase = 0;
  return (t) => {
    phase += (TAU * freq(t)) / RATE;
    return wave(phase);
  };
}

const sine = Math.sin;
const saw = (p: number): number => ((p / TAU) % 1) * 2 - 1;
const square = (p: number): number => (Math.sin(p) >= 0 ? 1 : -1);
const triangle = (p: number): number => (2 / Math.PI) * Math.asin(Math.sin(p));

/** Noise through a one-pole low-pass; `cutoff(t)` is 0..1, higher lets more through. */
function noise(cutoff: Gen): Gen {
  let y = 0;
  return (t) => {
    y += cutoff(t) * (Math.random() * 2 - 1 - y);
    return y;
  };
}

const decay = (t: number, length: number, power = 2): number => Math.pow(Math.max(0, 1 - t / length), power);

/** One excited dog "yip": a quick up-and-down pitch bend with a little breath. */
function yip(start: number, pitch: number): Gen {
  const length = 0.15;
  const tone = (t: number) => pitch * (0.75 + 0.55 * Math.sin(Math.PI * Math.min(1, t / length) * 0.9));
  const voice = oscillator((t) => tone(t - start), saw);
  const breath = noise(() => 0.25);
  return (t) => {
    const local = t - start;
    if (local < 0 || local > length) {
      voice(t); // keep the phase advancing
      return 0;
    }
    const env = Math.sin((Math.PI * local) / length) ** 0.6 * decay(local, length, 0.8);
    return (voice(t) * 0.55 + breath(t) * 0.2) * env;
  };
}

const BUILDERS: Record<Sfx | SfxLoop, (ctx: BaseAudioContext) => AudioBuffer> = {
  // Quick wing flutter.
  flap: (ctx) => {
    const wing = oscillator((t) => 150 + 700 * t, saw);
    return render(ctx, 0.13, (t) => wing(t) * (0.55 + 0.45 * sine(TAU * 70 * t)) * decay(t, 0.13) * 0.45);
  },
  // Little coin blip.
  point: (ctx) => {
    const tone = oscillator((t) => (t < 0.07 ? 988 : 1319), sine);
    return render(ctx, 0.2, (t) => tone(t) * decay(t - (t < 0.07 ? 0 : 0.07), 0.13, 1.5) * 0.45);
  },
  // Rising arpeggio for any buff.
  buff: (ctx) => {
    const notes = [523, 659, 784, 1047];
    const tone = oscillator((t) => notes[Math.min(3, Math.floor(t / 0.09))], triangle);
    return render(ctx, 0.5, (t) => tone(t) * decay(t % 0.09, 0.2, 1) * decay(t, 0.55, 0.6) * 0.5);
  },
  // Three happy yips, each a little higher.
  yips: (ctx) => {
    const a = yip(0, 620);
    const b = yip(0.19, 700);
    const c = yip(0.38, 800);
    return render(ctx, 0.62, (t) => (a(t) + b(t) + c(t)) * 0.9);
  },
  // Sad "womp" for a debuff.
  debuff: (ctx) => {
    const tone = oscillator((t) => 330 - 190 * t, square);
    return render(ctx, 0.4, (t) => tone(t) * decay(t, 0.4, 1.2) * 0.28);
  },
  // Gavel: a sharp wooden knock, struck twice.
  hammer: (ctx) => {
    const knock = oscillator((t) => 260 - 120 * Math.min(1, (t % 0.2) / 0.1), sine);
    const click = noise(() => 0.6);
    return render(ctx, 0.4, (t) => {
      const local = t % 0.2;
      return (knock(t) * 0.9 + click(t) * 0.8) * decay(local, 0.09, 2.5) * (t < 0.4 ? 1 : 0) * 0.45;
    });
  },
  // Car crash: tyre screech, then a crunching impact.
  crash: (ctx) => {
    const screech = oscillator((t) => 950 - 500 * Math.min(1, t / 0.28), saw);
    const grit = noise(() => 0.35);
    const rumble = noise((t) => 0.5 - 0.4 * Math.min(1, (t - 0.28) / 0.5));
    const thump = oscillator((t) => 90 - 40 * Math.max(0, t - 0.28), sine);
    return render(ctx, 0.85, (t) => {
      const s = t < 0.28 ? (screech(t) * 0.35 + grit(t) * 0.25) * Math.min(1, t / 0.03) : 0;
      const hit = t >= 0.28 ? (rumble(t) * 1.2 + thump(t) * 0.8) * decay(t - 0.28, 0.57, 1.5) : 0;
      return (s + hit) * 0.4;
    });
  },
  // Air whoosh for the sideways dash.
  dash: (ctx) => {
    const air = noise((t) => 0.04 + 0.35 * Math.sin((Math.PI * t) / 0.4));
    return render(ctx, 0.4, (t) => air(t) * 3 * Math.sin((Math.PI * t) / 0.4) * 0.8);
  },
  // Bee wing buzz, loops seamlessly (every rate below fits a whole number of cycles in 0.5 s).
  buzz: (ctx) =>
    render(ctx, 0.5, (t) => {
      const wobble = 1 + 0.04 * sine(TAU * 6 * t);
      const body = saw(TAU * 190 * wobble * t) * 0.6 + sine(TAU * 380 * t) * 0.3;
      return body * (0.65 + 0.35 * sine(TAU * 30 * t)) * 0.5;
    }),
  // Helicopter rotor chop, also an exact loop.
  copter: (ctx) => {
    const air = noise(() => 0.12);
    return render(ctx, 0.5, (t) => {
      const chop = Math.pow(0.5 + 0.5 * sine(TAU * 12 * t), 3);
      return (air(t) * 4 + sine(TAU * 62 * t) * 0.5) * chop * 0.8;
    });
  },
};

let enabled = readEnabled();

function readEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on'; // off until the player turns it on
  } catch {
    return false;
  }
}

function webAudio(game: Phaser.Game): Phaser.Sound.WebAudioSoundManager | null {
  const manager = game.sound;
  return 'context' in manager ? (manager as Phaser.Sound.WebAudioSoundManager) : null;
}

/** Build every sound into the cache and apply the saved on/off choice. Call once after the game is created. */
export function initSfx(game: Phaser.Game): void {
  game.sound.mute = !enabled;
  const manager = webAudio(game);
  if (!manager) return; // no Web Audio (very old browser): the game stays silent
  for (const [key, build] of Object.entries(BUILDERS)) game.cache.audio.add(key, build(manager.context));
}

export function soundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(game: Phaser.Game, on: boolean): void {
  enabled = on;
  game.sound.mute = !on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Not saved; still applies for this session.
  }
}

function available(scene: Phaser.Scene, key: string): boolean {
  return scene.cache.audio.exists(key);
}

export function playSfx(scene: Phaser.Scene, key: Sfx, volume = 1): void {
  if (available(scene, key)) scene.sound.play(key, { volume });
}

/** A looping sound the caller starts and stops. Returns null when audio is unavailable. */
export function loopSfx(scene: Phaser.Scene, key: SfxLoop, volume = 1): Phaser.Sound.BaseSound | null {
  if (!available(scene, key)) return null;
  const sound = scene.sound.add(key, { loop: true, volume });
  sound.play();
  return sound;
}
