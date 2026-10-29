import Phaser from 'phaser';
import { SCENES } from '../core/constants';

// Sound effects are synthesised at start-up into Web Audio buffers and registered in Phaser's audio cache,
// so the game plays them through Phaser's own sound manager (this.sound) and ships no audio files.
// Swap any of them for a real recording later by loading a file under the same key.

/** Public key lists also power the local `?sfx` soundboard, so every new effect appears there automatically. */
export const SFX_KEYS = [
  'flap', 'point', 'buff', 'yips', 'debuff', 'disappointed', 'shy', 'hammer', 'crash', 'dash',
  'munch', 'sip', 'slurp', 'jackpot', 'bark', 'shield', 'block', 'sparkle', 'power',
  'spool', 'warble', 'sag', 'thud', 'sniff', 'meow',
] as const;
export type Sfx = (typeof SFX_KEYS)[number];
export const SFX_LOOP_KEYS = ['buzz', 'copter'] as const;
export type SfxLoop = (typeof SFX_LOOP_KEYS)[number];

const KEY = 'vimmy-fly.sound';
const RATE = 44100;
const TAU = Math.PI * 2;
const BUILD_SLICE_DELAY_MS = 50;
const BUILD_RETRY_WHILE_PLAYING_MS = 500;

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
      return (s + hit) * 0.6;
    });
  },
  // Crunchy bite for bread and sandwiches.
  munch: (ctx) => {
    const crunch = noise(() => 0.5);
    return render(ctx, 0.2, (t) => {
      const bite = t < 0.08 ? decay(t, 0.08, 2) : t > 0.1 ? decay(t - 0.1, 0.1, 2) : 0;
      return crunch(t) * bite * 1.4 * 0.5;
    });
  },
  // Bubbly gulp for drinks.
  sip: (ctx) => {
    const tone = oscillator((t) => 300 + 500 * Math.min(1, t / 0.12) - 200 * Math.max(0, (t - 0.12) / 0.1), sine);
    return render(ctx, 0.26, (t) => tone(t) * (0.6 + 0.4 * sine(TAU * 28 * t)) * decay(t, 0.26, 1) * 0.5);
  },
  // Noodle slurp: a wet rising whistle.
  slurp: (ctx) => {
    const tone = oscillator((t) => 500 + 1100 * t * t * 6, triangle);
    const spit = noise(() => 0.3);
    return render(ctx, 0.3, (t) => (tone(t) * 0.5 + spit(t) * 0.25) * (0.7 + 0.3 * sine(TAU * 35 * t)) * decay(t, 0.3, 0.7) * 0.5);
  },
  // Two quick nasal inhales for the smelly cilantro and fish-sauce breads.
  sniff: (ctx) => {
    const breath = noise((t) => 0.24 + 0.12 * sine(TAU * 18 * t));
    const nose = oscillator((t) => 430 + 90 * sine(TAU * 7 * t), sine);
    return render(ctx, 0.44, (t) => {
      const local = t < 0.19 ? t : t - 0.24;
      if (local < 0 || local > 0.16) return 0;
      const inhale = Math.sin((Math.PI * local) / 0.16) ** 0.7;
      return (breath(t) * 1.15 + nose(t) * 0.16) * inhale * 0.55;
    });
  },
  // Big treat: a bright run up with a held top note.
  jackpot: (ctx) => {
    const notes = [784, 988, 1175, 1568, 1976];
    const tone = oscillator((t) => notes[Math.min(4, Math.floor(t / 0.07))], square);
    return render(ctx, 0.6, (t) => tone(t) * decay(t % 0.07, 0.12, 1) * decay(t, 0.65, 0.8) * 0.28);
  },
  // One deep woof for the golden retriever.
  bark: (ctx) => {
    const voice = oscillator((t) => 220 - 90 * Math.min(1, t / 0.18), saw);
    const breath = noise(() => 0.2);
    return render(ctx, 0.28, (t) => (voice(t) * 0.55 + breath(t) * 0.25) * Math.sin((Math.PI * Math.min(1, t / 0.22))) ** 0.5 * decay(t, 0.28, 1.2) * 0.8);
  },
  // Metallic clang as the suit goes on.
  shield: (ctx) => {
    const a = oscillator(() => 660, sine);
    const b = oscillator(() => 1580, sine);
    const c = oscillator(() => 2310, sine);
    return render(ctx, 0.5, (t) => (a(t) * 0.5 + b(t) * 0.35 + c(t) * 0.2) * decay(t, 0.5, 2) * 0.45);
  },
  // Sharp "ting" as the suit deflects a debuff: a hard knock, then a bright ring that bends up.
  block: (ctx) => {
    const knock = noise(() => 0.7);
    const a = oscillator((t) => 880 + 260 * Math.min(1, t / 0.06), sine);
    const b = oscillator(() => 1980, sine);
    const c = oscillator(() => 3150, sine);
    return render(ctx, 0.45, (t) => (knock(t) * decay(t, 0.03, 2) * 0.6 + (a(t) * 0.5 + b(t) * 0.3 + c(t) * 0.18) * decay(t, 0.45, 2.2)) * 0.5);
  },
  // Twinkling chime for cleansing.
  sparkle: (ctx) => {
    const tone = oscillator((t) => 1400 + 1400 * (Math.floor(t / 0.06) % 3) * 0.5, sine);
    return render(ctx, 0.45, (t) => tone(t) * decay(t % 0.06, 0.1, 1) * decay(t, 0.45, 1) * 0.4);
  },
  // Chunky power-up sweep.
  power: (ctx) => {
    const tone = oscillator((t) => 180 + 900 * Math.min(1, t / 0.3), square);
    return render(ctx, 0.45, (t) => tone(t) * Math.min(1, t / 0.02) * decay(t, 0.45, 0.8) * 0.26);
  },
  // Rotor spooling up.
  spool: (ctx) => {
    const air = noise(() => 0.15);
    return render(ctx, 0.6, (t) => {
      const rate = 6 + 26 * (t / 0.6);
      return (air(t) * 3 + sine(TAU * 60 * t) * 0.4) * (0.5 + 0.5 * sine(TAU * rate * t)) * Math.min(1, t / 0.15) * 0.7;
    });
  },
  // Dizzy wobble for disorientation.
  warble: (ctx) => {
    const tone = oscillator((t) => 420 + 160 * sine(TAU * 7 * t), triangle);
    return render(ctx, 0.5, (t) => tone(t) * decay(t, 0.5, 1) * 0.45);
  },
  // Deflating slide for slowdowns.
  sag: (ctx) => {
    const tone = oscillator((t) => 500 * Math.pow(0.35, t / 0.4), saw);
    return render(ctx, 0.45, (t) => tone(t) * decay(t, 0.45, 1.5) * 0.3);
  },
  // Heavy book-slam thud.
  thud: (ctx) => {
    const low = oscillator((t) => 110 - 60 * Math.min(1, t / 0.2), sine);
    const slap = noise(() => 0.25);
    return render(ctx, 0.45, (t) => (low(t) * 0.9 + slap(t) * 0.7 * decay(t, 0.05, 2)) * decay(t, 0.45, 1.5) * 0.6);
  },
  // Two gentle descending cartoon notes for Vimmy's disappointed planner reaction.
  disappointed: (ctx) => {
    const tone = oscillator((t) => {
      const second = t >= 0.27;
      const local = second ? t - 0.27 : t;
      const start = second ? 390 : 520;
      return start - 150 * Math.min(1, local / 0.2);
    }, triangle);
    return render(ctx, 0.56, (t) => {
      const local = t >= 0.27 ? t - 0.27 : t;
      if (local > 0.22) return 0;
      const envelope = Math.sin((Math.PI * local) / 0.22) ** 0.7 * decay(local, 0.22, 0.8);
      return tone(t) * envelope * 0.85;
    });
  },
  // Two soft, rising nervous chirps for the dog-ear headband's manga embarrassment beat.
  shy: (ctx) => {
    const tone = oscillator((t) => {
      const second = t >= 0.2;
      const local = second ? t - 0.2 : t;
      return (second ? 760 : 610) + 150 * Math.min(1, local / 0.13) + 12 * sine(TAU * 11 * t);
    }, triangle);
    const breath = noise(() => 0.12);
    return render(ctx, 0.42, (t) => {
      const local = t >= 0.2 ? t - 0.2 : t;
      if (local > 0.15) return 0;
      const envelope = Math.sin((Math.PI * local) / 0.15) ** 0.7 * decay(local, 0.15, 0.8);
      return (tone(t) * 0.72 + breath(t) * 0.12) * envelope * 0.58;
    });
  },
  // A cat's "mi-aow": a quick rise into the "mi", then a long slide down through the "aow", with a nasal buzz and a little wobble.
  meow: (ctx) => {
    const len = 0.55;
    const pitch = (t: number) => (t < 0.14 ? 420 + 2800 * t : 810 - 780 * ((t - 0.14) / 0.41) ** 0.8) * (1 + 0.02 * Math.sin(TAU * 7 * t));
    const voice = oscillator(pitch, saw);
    const nasal = oscillator((t) => pitch(t) * 2, triangle);
    return render(ctx, len, (t) => {
      const env = Math.min(1, t / 0.03) * Math.sin((Math.PI * Math.min(1, t / len)) ** 0.9) ** 0.5;
      const open = t < 0.14 ? 0.5 : 1; // the mouth opens from "mi" to "aow"
      return (voice(t) * 0.45 * open + nasal(t) * 0.35) * env * 0.85;
    });
  },
  // Air whoosh for the sideways dash: bright rushing air over a quick downward swoop, loud enough to cut through the buzz.
  dash: (ctx) => {
    const air = noise((t) => 0.12 + 0.5 * Math.sin((Math.PI * t) / 0.35));
    const swoop = oscillator((t) => 1100 - 2000 * t, sine);
    return render(ctx, 0.35, (t) => {
      const env = Math.sin((Math.PI * t) / 0.35) ** 0.6;
      return (air(t) * 2.2 + swoop(t) * 0.25) * env * 0.9;
    });
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
  applyAudioSession(enabled);
  // Synthesising every sound takes a noticeable moment on a phone. Spread it across the non-game screens and pause
  // the queue completely during a run: even one buffer build can steal a frame on iOS. playSfx already skips a sound
  // that is not ready yet, so keeping gameplay smooth is more important than preparing every effect immediately.
  const pending = Object.entries(BUILDERS);
  const buildNext = (): void => {
    if (game.scene.isActive(SCENES.game)) {
      window.setTimeout(buildNext, BUILD_RETRY_WHILE_PLAYING_MS);
      return;
    }
    const next = pending.shift();
    if (!next) return;
    game.cache.audio.add(next[0], next[1](manager.context));
    window.setTimeout(buildNext, BUILD_SLICE_DELAY_MS);
  };
  window.setTimeout(buildNext, 300);

  // The browser can suspend the audio context behind Phaser's back (a page that lost focus, an iOS interruption, a
  // browser prompt after a language change). Phaser only unlocks it once, so wake it on any tap, key or return to the page.
  const wake = (): void => {
    if (manager.context.state !== 'running') void manager.context.resume().catch(() => undefined);
  };
  for (const type of ['pointerdown', 'touchend', 'keydown']) document.addEventListener(type, wake, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wake();
  });
}

type AudioSession = { type: string };
const audioSession = (): AudioSession | undefined => (navigator as unknown as { audioSession?: AudioSession }).audioSession;

/**
 * iPhones silence Web Audio while the ringer switch is on silent, unless the page is in the "playback" audio
 * category. That category also makes iOS show the page in the Dynamic Island / Now Playing, so it is only
 * claimed while sound is on; with sound off the page goes back to "ambient". Older iOS has no such setting:
 * it switches category when an HTML audio element plays, so one short silent clip is played (once, never looped,
 * or the Dynamic Island would stay up) the first time sound is on.
 */
function applyAudioSession(on: boolean): void {
  try {
    const session = audioSession();
    if (session) session.type = on ? 'playback' : 'ambient';
    else if (on) playSilentClipOnce();
  } catch {
    // Not supported.
  }
}

let silentClipPlayed = false;

function playSilentClipOnce(): void {
  if (silentClipPlayed) return;
  silentClipPlayed = true;
  try {
    // 0.1 s of silence: 8-bit mono WAV, 8 kHz.
    const samples = 800;
    const bytes = new Uint8Array(44 + samples).fill(128);
    const view = new DataView(bytes.buffer);
    const text = (at: number, str: string): void => [...str].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
    text(0, 'RIFF'); view.setUint32(4, 36 + samples, true); text(8, 'WAVEfmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, 8000, true); view.setUint32(28, 8000, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true);
    text(36, 'data'); view.setUint32(40, samples, true);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
    const el = new Audio(url);
    el.addEventListener('ended', () => URL.revokeObjectURL(url));
    void el.play().catch(() => {
      silentClipPlayed = false; // blocked (no tap yet): try again on the next toggle
    });
  } catch {
    // Silent clip unavailable; sound still works with the ringer on.
  }
}

export function soundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(game: Phaser.Game, on: boolean): void {
  enabled = on;
  game.sound.mute = !on;
  if (on) void webAudio(game)?.context.resume(); // this tap is a user gesture, which iOS requires
  applyAudioSession(on);
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Not saved; still applies for this session.
  }
}

function available(scene: Phaser.Scene, key: string): boolean {
  return scene.cache.audio.exists(key);
}

/** `vary` randomises pitch by up to that fraction either way so repeats don't sound identical. */
export function playSfx(scene: Phaser.Scene, key: Sfx, volume = 1, vary = 0): void {
  if (available(scene, key)) scene.sound.play(key, { volume, rate: 1 + (Math.random() * 2 - 1) * vary });
}

const BY_ID: Record<string, Sfx> = {
  carCrash: 'crash', gavelHammer: 'hammer', planner: 'thud', cilantroBread: 'warble', fishSauceBread: 'sag',
  dogEars: 'shy',
  lawyerSuit: 'shield', handkerchief: 'sparkle', rollingPin: 'power', helicopter: 'spool', oyster: 'buff',
  goldenRetriever: 'bark', kitten: 'meow', iceCream: 'slurp', coffee: 'sip', wine: 'sip', pasta: 'slurp', tomYum: 'slurp',
  pandanCustardBread: 'munch', cheeseButterBread: 'munch', shiopan: 'munch', sandwich: 'munch', shrimpFriedRiceBox: 'munch',
};

/** The sound for picking up an item: specific to the item, else generic for its kind. */
export function itemSfx(id: string, kind: 'points' | 'buff' | 'debuff', amount = 0): Sfx {
  if (kind === 'points' && amount >= 110) return 'jackpot';
  return BY_ID[id] ?? (kind === 'debuff' ? 'debuff' : kind === 'buff' ? 'buff' : 'point');
}

/** A looping sound the caller starts and stops. Returns null when audio is unavailable. */
export function loopSfx(scene: Phaser.Scene, key: SfxLoop, volume = 1): Phaser.Sound.BaseSound | null {
  if (!available(scene, key)) return null;
  const sound = scene.sound.add(key, { loop: true, volume });
  sound.play();
  return sound;
}
