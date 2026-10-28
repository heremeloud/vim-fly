# Item v5 runtime art

The active item set contains nineteen transparent PNG sprites at exactly 32x32 pixels.

## Conversion

- Source: v4 runtime art, except for the revised lawyer sprite.
- Resize: nearest-neighbour to 32x32.
- Palette: maximum 20 colors per sprite plus transparency.
- Dithering: none.
- Display size: normally 48x48 in gameplay, home and menu; helicopter is stretched to 60x60 and car crash to 64x64 because their wide silhouettes need more room. Receipt lines stay compact. Phaser uses nearest-neighbour filtering, so every native 32x32 texture stays crisp when enlarged.

The palette reduction is intentional: v5 should read as compact game pixel art rather than highly polished miniature illustration.

## Simplified variants

- `planner` is a plain closed black book with a small cream page edge.
- `cilantroBread` and `fishSauceBread` share the same oval golden bread design. Only the topping changes: three cilantro leaves versus amber fish-sauce drizzle.
- `coffee` is only the coffee cup; its saucer and honey dipper were removed.
- `oyster` is only the open oyster; its ice, cloth and lemon were removed.
- `carCrash` is one green compact car with a yellow-orange impact burst at its front, rather than two tiny colliding cars.
- `gavelHammer` is one wooden courtroom gavel with no sound block or base.
- Helicopter, car crash, lawyer suit, golden retriever, pasta and sandwich use tighter palettes to remove noisy micro-shading without flattening their silhouettes completely.

## Lawyer revision

Built-in ImageGen was used for one precise source edit: remove only the black necktie while preserving the black Thai courtroom advocate gown and the full yellow/white ceremonial ribbon. The edited source was then reduced through the same 32x32, 20-color pipeline as the other items. No additional high-resolution v5 source collection is retained.
