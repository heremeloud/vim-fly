import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './core/constants';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { GameScene } from './scenes/GameScene';
import { ReceiptScene } from './scenes/ReceiptScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#fff3e0',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, HomeScene, GameScene, ReceiptScene],
});
