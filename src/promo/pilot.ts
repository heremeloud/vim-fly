import Phaser from 'phaser';
import { embedVideo, openVideo, type LayoutBox } from '../ui/videoPlayer';
import { PILOT } from './config';

/** Play the pilot in a window over the game. Used by the Promos tab and the Express tile. */
export function watchPilot(): void {
  openVideo({ videoId: PILOT.videoId, watchUrl: PILOT.url });
}

/**
 * Build the pilot player into a scene (the receipt). It shows the poster with a play button and
 * waits for a tap, so it never competes with the game's own sound or streams on every game over.
 * The tap lets it play with sound. To start by itself instead, use `autoplay: true, muted: true`
 * (browsers only allow muted autoplay).
 */
export function embedPilot(scene: Phaser.Scene, box: LayoutBox): void {
  embedVideo(scene, box, { videoId: PILOT.videoId, autoplay: false, muted: false });
}
