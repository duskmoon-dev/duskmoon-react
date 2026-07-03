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
