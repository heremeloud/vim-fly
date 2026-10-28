# avatars

Photos for the round avatars on the Promos page (the official account, the two main leads, Vimmy).

## How to use a photo

1. Put the image file in **this folder**, for example `view.jpg`, `mim.jpg`, `vimmy.png`.
2. In `src/promo/links.json`, write the **file name** where the emoji is now:

   ```json
   "avatar": "view.jpg"
   ```

3. Run `npm run check:links`. It tells you if a file name has no matching file here, and shows each photo's size.

Anything that is not an image file name (`.png`, `.jpg`, `.jpeg` or `.webp`) is shown as text, so an emoji still works. If a named photo is missing, the avatar shows 🙂 instead of breaking.

## What makes a good photo

- **Square, or close to it.** The game crops the photo into a circle to fill it. Non-square photos are cropped from the middle, a little biased towards the top so faces are kept.
- **At least 256 × 256 px** (bigger is fine; it is shown at up to about 180 px on sharp screens).
- **Small file.** Aim for **under 200 KB** each. JPG or WebP is best for photos; PNG for artwork with transparency. Large files slow the page for everyone.
- **Face centred and a bit of space around it**, because the circle trims the corners.

## Before you publish

Only use photos you have permission to use (the actors' photos need their or their agency's approval, and the right credit if they ask for it). Do not use photos you found online without a licence. Vimmy's artwork can be added the same way once it exists.

Note: the file names are part of the page's public files. Do not put anything private in this folder.
