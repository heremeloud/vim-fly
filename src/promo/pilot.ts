import Phaser from 'phaser';
import { embedVideo, openVideo, type LayoutBox } from '../ui/videoPlayer';
import { PILOT } from './config';

/** Play the pilot in a window over the game. Used by the Promos tab. */
export function watchPilot(): void {
  openVideo({ videoId: PILOT.videoId, watchUrl: PILOT.url });
}

/**
 * Build the pilot player into a scene (the receipt). It shows the video's thumbnail with a play button
 * while the paused player gets ready underneath. The poster protects the iframe from accidental edge taps;
 * only the central play button reveals and starts it with sound. To start by itself instead, use `autoplay: true, muted: true`
 * (browsers only allow muted autoplay).
 */
export function embedPilot(scene: Phaser.Scene, box: LayoutBox): void {
  embedVideo(scene, box, { videoId: PILOT.videoId, autoplay: false, muted: false, facade: true });
}
