import Phaser from 'phaser';
import { embedVideo, openVideo, type LayoutBox } from '../ui/videoPlayer';
import { PILOT } from './config';

/** Play the pilot in a window over the game. Used by the Promos tab and the Express tile. */
export function watchPilot(): void {
  openVideo({ videoId: PILOT.videoId, watchUrl: PILOT.url });
}

/**
 * Build the pilot player into a scene (the receipt). It starts by itself, muted so that every
 * browser allows it; the viewer can unmute it with the player's own button. Set `autoplay` to false
 * to show the poster with a play button instead.
 */
export function embedPilot(scene: Phaser.Scene, box: LayoutBox): void {
  embedVideo(scene, box, { videoId: PILOT.videoId, autoplay: true, muted: true });
}
