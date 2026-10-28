import Phaser from 'phaser';
import type { ItemDef } from './itemDefs';

export const itemTextureKey = (id: string): string => `item-${id}`;

/**
 * An item's pixel-art sprite, drawn `size` px square. Items without art yet fall back to a tinted
 * square in the item's placeholder color.
 */
export function addItemSprite(scene: Phaser.Scene, x: number, y: number, item: Pick<ItemDef, 'id' | 'color'>, size: number): Phaser.GameObjects.Image {
  const key = itemTextureKey(item.id);
  if (scene.textures.exists(key)) return scene.add.image(x, y, key).setDisplaySize(size, size);
  return scene.add.image(x, y, '__WHITE').setDisplaySize(size, size).setTint(item.color);
}
