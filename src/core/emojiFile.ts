/** File name (without extension) of an emoji's image in src/assets/emoji: its code points in hex, joined by dashes. */
export function emojiFileName(emoji: string): string {
  return [...emoji].map((c) => c.codePointAt(0)!.toString(16).padStart(4, '0')).join('-');
}

export function emojiTextureKey(emoji: string): string {
  return `emoji-${emojiFileName(emoji)}`;
}
