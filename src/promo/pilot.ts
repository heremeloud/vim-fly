import { openVideo } from '../ui/videoPlayer';
import { PILOT } from './config';

/** Play the pilot inside the game. Used by the home strip, the Promos tab and the receipt. */
export function watchPilot(): void {
  openVideo({ videoId: PILOT.videoId, watchUrl: PILOT.url });
}
