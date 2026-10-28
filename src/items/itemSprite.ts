import Phaser from 'phaser';
import type { ItemDef } from './itemDefs';

export const itemTextureKey = (id: string): string => `item-${id}`;

/** Some wide or mechanically complex silhouettes need more screen space than compact food icons. */
const DISPLAY_SCALE: Readonly<Record<string, number>> = {
  carCrash: 1.6,
  helicopter: 1.6,
  goldenRetriever: 1.6,
};

/** Runtime display size only; every v5 source texture remains exactly 32x32. */
export function itemDisplaySize(id: string, baseSize: number): number {
  return Math.round(baseSize * (DISPLAY_SCALE[id] ?? 1));
}

/**
 * An item's pixel-art sprite, drawn `size` px square. Items without art yet fall back to a tinted
 * square in the item's placeholder color.
 */
export function addItemSprite(scene: Phaser.Scene, x: number, y: number, item: Pick<ItemDef, 'id' | 'color'>, size: number): Phaser.GameObjects.Image {
  const key = itemTextureKey(item.id);
  if (scene.textures.exists(key)) return scene.add.image(x, y, key).setDisplaySize(size, size);
  return scene.add.image(x, y, '__WHITE').setDisplaySize(size, size).setTint(item.color);
}
