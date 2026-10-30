import Phaser from 'phaser';
import { GAME_WIDTH } from '../core/constants';
import { t } from '../i18n';
import { COLORS, FONT, hex } from './theme';

export interface VideoOptions {
  /** The 11-character YouTube video id. */
  videoId: string;
  /** The video's YouTube page, offered as a fallback link. */
  watchUrl: string;
}

const YOUTUBE = 'https://www.youtube-nocookie.com';

interface Player {
  /** A 16:9 box holding the player. Size and position it yourself. */
  element: HTMLElement;
  /** Stop listening for the player's messages. Remove `element` from the page separately. */
  dispose(): void;
}

/**
 * The YouTube player itself, with a "Loading..." message on top until the video reports it is
 * ready (so a slow connection never looks like nothing is playing). Shared by the pop-up window
 * and the player built into the receipt.
 *
 * With `facade`, the real player preloads paused under the video's thumbnail so it is ready for one-tap playback.
 * The thumbnail remains over the whole iframe until its central play button is tapped, preventing inactive edges
 * of the embed from taking focus away from the game.
 */
function createPlayer(videoId: string, { autoplay, muted, facade = false }: { autoplay: boolean; muted: boolean; facade?: boolean }): Player {
  const box = document.createElement('div');
  Object.assign(box.style, {
    background: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: '16 / 9',
  } satisfies Partial<CSSStyleDeclaration>);

  const loading = document.createElement('div');
  // The receipt facade keeps its thumbnail visible while the player starts, so it does not need loading text.
  // Standalone video windows still show the message because they have no poster underneath.
  loading.textContent = facade ? '' : t('video.loading');
  Object.assign(loading.style, {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '16px',
    textShadow: '0 1px 6px rgba(0, 0, 0, 0.9)',
    pointerEvents: 'none', // lets taps through to the player underneath
    fontFamily: FONT.family,
    background: facade ? 'rgba(0, 0, 0, 0.4)' : 'transparent', // darkens the thumbnail while the player gets ready
  } satisfies Partial<CSSStyleDeclaration>);
  let giveUp = 0;
  let frame: HTMLIFrameElement | null = null;
  let poster: HTMLElement | null = null;
  let ready = false;
  let wantPlay = false;
  // When the player is ready (or we give up waiting), drop the loading message and thumbnail and show the player.
  const hideLoading = (): void => {
    loading.remove();
    if (frame) frame.style.opacity = '1';
    poster?.remove();
  };

  const mountFrame = (autoplayNow: boolean): void => {
    const f = document.createElement('iframe');
    const params = new URLSearchParams({
      autoplay: autoplayNow ? '1' : '0',
      mute: muted ? '1' : '0',
      rel: '0',
      playsinline: '1',
      enablejsapi: '1',
      origin: window.location.origin,
    });
    f.src = `${YOUTUBE}/embed/${videoId}?${params}`;
    f.title = t('video.title');
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.referrerPolicy = 'strict-origin-when-cross-origin'; // YouTube embeds need a referrer
    // With a thumbnail showing, keep the player invisible until it is ready so the box never flashes black.
    Object.assign(f.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', border: '0', background: 'transparent', opacity: facade ? '0' : '1' } satisfies Partial<CSSStyleDeclaration>);
    // Ask the player to report its state, and hide the loading message once it is playing, paused, ended or ready.
    f.addEventListener('load', () => {
      f.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), YOUTUBE);
    });
    frame = f;
    // A preloaded facade must never expose the iframe on its own: its poster is what makes edge taps harmless.
    // After an intentional play tap, give up waiting eventually so a broken embed does not stay covered forever.
    giveUp = window.setTimeout(() => {
      if (!facade || wantPlay) hideLoading();
    }, 20000);
    // Keep a facade above the iframe until the player is ready. Appending the iframe here would put it over
    // the poster, allowing its inactive edges to steal focus while the loading message is visible.
    if (facade) box.prepend(f);
    else box.append(f, loading);
  };

  const onMessage = (e: MessageEvent) => {
    if (!frame || e.origin !== YOUTUBE || e.source !== frame.contentWindow) return;
    let msg: { event?: string; info?: unknown };
    try {
      msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    } catch {
      return;
    }
    const info = msg?.info as { playerState?: number } | number | undefined;
    const state = msg?.event === 'onStateChange' ? info : (info as { playerState?: number } | undefined)?.playerState;
    if ((!facade || wantPlay) && (state === 1 || state === 2 || state === 0 || state === 5)) hideLoading();
    // The preloaded player is ready. Keep it protected until the play button is intentionally pressed.
    if (facade && !ready && (msg?.event === 'onReady' || msg?.event === 'initialDelivery')) {
      ready = true;
      if (wantPlay) {
        frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), YOUTUBE);
        hideLoading();
      }
    }
  };
  window.addEventListener('message', onMessage);

  if (facade) {
    poster = document.createElement('div');
    Object.assign(poster.style, {
      position: 'absolute',
      inset: '0',
      backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } satisfies Partial<CSSStyleDeclaration>);
    const play = document.createElement('button');
    play.type = 'button';
    play.setAttribute('aria-label', t('video.title'));
    Object.assign(play.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '68px',
      height: '48px',
      transform: 'translate(-50%, -50%)',
      borderRadius: '14px',
      border: '0',
      padding: '0',
      background: 'rgba(255, 0, 0, 0.92)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
      cursor: 'pointer',
    } satisfies Partial<CSSStyleDeclaration>);
    const triangle = document.createElement('div');
    Object.assign(triangle.style, {
      position: 'absolute',
      left: '27px',
      top: '14px',
      borderStyle: 'solid',
      borderWidth: '10px 0 10px 18px',
      borderColor: 'transparent transparent transparent #ffffff',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    play.append(triangle);
    poster.append(play);
    // Only the play button activates the protected iframe. Taps around it land on the poster and do nothing.
    const start = () => {
      if (wantPlay) return;
      wantPlay = true;
      play.remove();
      if (ready && frame) {
        frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), YOUTUBE);
        hideLoading();
      } else {
        box.append(loading);
      }
    };
    play.addEventListener('click', start);
    mountFrame(false);
    box.append(poster);
  } else {
    mountFrame(autoplay);
  }

  return {
    element: box,
    dispose: () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(giveUp);
    },
  };
}

let current: HTMLElement | null = null;

/**
 * Play a YouTube video inside the game, in a window over the canvas. Close it with the button,
 * a tap outside the video, or Escape. If the video cannot be embedded (the owner can turn that
 * off), the "Open on YouTube" link under it still works.
 */
export function openVideo({ videoId, watchUrl }: VideoOptions): void {
  if (current || !/^[\w-]{11}$/.test(videoId)) return;

  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '1000',
    background: 'rgba(0, 0, 0, 0.88)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    padding: '12px',
    boxSizing: 'border-box',
    fontFamily: FONT.family,
  } satisfies Partial<CSSStyleDeclaration>);

  const player = createPlayer(videoId, { autoplay: true, muted: false });
  // As wide as fits, but never taller than the screen allows (16:9).
  player.element.style.width = 'min(100%, calc((100vh - 150px) * 16 / 9))';

  const close = () => {
    overlay.remove(); // removing the iframe also stops the video
    player.dispose();
    document.removeEventListener('keydown', onKey);
    current = null;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', onKey);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = `✕  ${t('video.close')}`;
  Object.assign(closeButton.style, {
    alignSelf: 'flex-end',
    background: hex(COLORS.primary),
    color: hex(COLORS.onPrimary),
    border: 'none',
    borderRadius: '999px',
    padding: '10px 18px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
  } satisfies Partial<CSSStyleDeclaration>);
  closeButton.addEventListener('click', close);

  const fallback = document.createElement('a');
  fallback.href = watchUrl;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = t('video.openYoutube');
  Object.assign(fallback.style, { color: '#ffffff', fontSize: '15px', opacity: '0.85' } satisfies Partial<CSSStyleDeclaration>);

  overlay.append(closeButton, player.element, fallback);
  document.body.append(overlay);
  current = overlay;
}

/** Where to put a player on the screen, in layout units (the 480x800 coordinate space). */
export interface LayoutBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A player built into a scene, at a spot in the layout (for example on the receipt). It follows the
 * canvas when the window is resized, and removes itself when the scene shuts down.
 * `muted` lets it start by itself in every browser; viewers can unmute with the player's own button.
 */
export function embedVideo(
  scene: Phaser.Scene,
  box: LayoutBox,
  { videoId, autoplay = true, muted = true, facade = false }: { videoId: string; autoplay?: boolean; muted?: boolean; facade?: boolean },
): void {
  if (!/^[\w-]{11}$/.test(videoId)) return;
  const player = createPlayer(videoId, { autoplay, muted, facade });
  const el = player.element;
  el.style.position = 'fixed';
  el.style.zIndex = '10';

  const place = () => {
    const canvas = scene.game.canvas;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const k = r.width / GAME_WIDTH; // CSS pixels per layout unit
    el.style.left = `${r.left + box.x * k}px`;
    el.style.top = `${r.top + box.y * k}px`;
    el.style.width = `${box.w * k}px`;
    el.style.height = `${box.h * k}px`;
  };
  place();
  window.addEventListener('resize', place);
  document.body.append(el);

  const remove = () => {
    window.removeEventListener('resize', place);
    player.dispose();
    el.remove();
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, remove);
  scene.events.once(Phaser.Scenes.Events.DESTROY, remove);
}
