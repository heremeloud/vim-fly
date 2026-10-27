import { t } from '../i18n';
import { COLORS, FONT, hex } from './theme';

export interface VideoOptions {
  /** The 11-character YouTube video id. */
  videoId: string;
  /** The video's YouTube page, offered as a fallback link. */
  watchUrl: string;
}

let current: HTMLElement | null = null;

/**
 * Play a YouTube video inside the game, in an overlay on top of the canvas. Close it with the
 * button, a tap outside the video, or Escape. If the video cannot be embedded (the owner can
 * turn that off), the "Open on YouTube" link under it still works.
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

  const close = () => {
    overlay.remove(); // removing the iframe also stops the video
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

  const frameBox = document.createElement('div');
  Object.assign(frameBox.style, {
    // As wide as fits, but never taller than the screen allows (16:9).
    width: 'min(100%, calc((100vh - 150px) * 16 / 9))',
    aspectRatio: '16 / 9',
    background: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
  } satisfies Partial<CSSStyleDeclaration>);

  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
  frame.title = 'Video';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.referrerPolicy = 'strict-origin-when-cross-origin'; // YouTube embeds need a referrer
  Object.assign(frame.style, { width: '100%', height: '100%', border: '0' } satisfies Partial<CSSStyleDeclaration>);
  frameBox.append(frame);

  const fallback = document.createElement('a');
  fallback.href = watchUrl;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = t('video.openYoutube');
  Object.assign(fallback.style, { color: '#ffffff', fontSize: '15px', opacity: '0.85' } satisfies Partial<CSSStyleDeclaration>);

  overlay.append(closeButton, frameBox, fallback);
  document.body.append(overlay);
  current = overlay;
}
