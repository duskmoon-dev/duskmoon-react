# @duskmoon-dev/art-components

React wrappers for `@duskmoon-dev/css-art`.

## Installation

```bash
bun add @duskmoon-dev/art-components @duskmoon-dev/css-art
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

All decorative components forward refs to their root element, accept `className`,
`style`, and DuskMoon CSS custom properties through `style`.
