# @duskmoon-dev/art-components

React wrappers for `@duskmoon-dev/css-art`.

## Installation

```bash
bun add @duskmoon-dev/art-components @duskmoon-dev/css-art react react-dom
```

Import the CSS once in your app:

```css
@import "@duskmoon-dev/art-components/styles.css";
```

## Usage

```tsx
import { ArtMoon, ArtPlasmaBall } from "@duskmoon-dev/art-components";

export function Demo() {
  return (
    <>
      <ArtMoon crescent glow size="lg" />
      <ArtPlasmaBall defaultChecked />
    </>
  );
}
```

## Components

- `ArtMoon`
- `ArtSun`
- `ArtAtom`
- `ArtEclipse`
- `ArtMountain`
- `ArtSnowflake`
- `ArtPlasmaBall`
- `ArtCircularGallery`
- `ArtCatStargazer`
- `ArtFlowerAnimation`
- `ArtColorSpin`
- `ArtSynthwaveStarfield`
- `ArtCsswitch` / `ArtCSSwitch`
- `ArtSnowballPreloader`
- `ArtGeminiInput`

`ArtCircularGalleryItem` is exported as the item type for
`ArtCircularGallery`.

`ArtCircularGallery` keeps its image links accessible by default. Use
`decorative` only when the gallery is purely visual; its links are then removed
from keyboard tab order. An explicit `aria-hidden` value on the root takes
precedence.

`ArtCsswitch` buttons are keyboard accessible and named by default. Set
`decorative` when the console is only an illustration; its buttons then leave
the tab order. An explicit root `aria-hidden` value takes precedence.

`ArtGeminiInput` names its default `+` and `>` buttons Add and Send. When
replacing either glyph with custom icon content, provide an accessible button
name through `beforeButtonProps` or `afterButtonProps` if the content has none.

Most decorative components accept `size="sm" | "default" | "lg"`; `ArtMoon`
and `ArtSun` also accept `size="xl"`. Components forward refs to their root
element, accept `className`, `style`, and DuskMoon CSS custom properties through
`style`.

## Development

```bash
# Build the wrapper package
bun run build

# Run wrapper tests
bun run test

# Typecheck
bun run typecheck
```
