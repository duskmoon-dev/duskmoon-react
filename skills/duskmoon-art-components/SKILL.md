---
name: duskmoon-art-components
description: >
  Use this skill whenever adding CSS art illustrations to a React or Next.js
  app with @duskmoon-dev/art-components, choosing Art* wrapper components,
  wiring @duskmoon-dev/css-art styles, configuring art variants, or explaining
  how consumers should install and use the package. This skill is for package
  consumption, not for editing the package source.
---

# DuskMoon Art Components Usage

Use `@duskmoon-dev/art-components` for React wrappers around the external
`@duskmoon-dev/css-art` CSS illustrations.

## Install

```bash
bun add @duskmoon-dev/art-components @duskmoon-dev/css-art react react-dom
```

Import the stylesheet once at the app root:

```tsx
import "@duskmoon-dev/art-components/styles.css";
```

For Next.js App Router, put the style import in `app/layout.tsx` or the root
client entry. Do not import files from `dist/` directly.

## Imports

All wrappers are exported from the package root:

```tsx
import { ArtMoon, ArtPlasmaBall } from "@duskmoon-dev/art-components";
```

The package also exports `@duskmoon-dev/art-components/styles.css`.

## Available Wrappers

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

`ArtCircularGalleryItem` is exported as a TypeScript item type for
`ArtCircularGallery`.

## Examples

Decorative art:

```tsx
import { ArtMoon, ArtSun } from "@duskmoon-dev/art-components";

export function HeaderArt() {
  return (
    <div>
      <ArtMoon crescent glow size="lg" />
      <ArtSun rays pulse size="sm" />
    </div>
  );
}
```

Accessible labeled art:

```tsx
import { ArtAtom } from "@duskmoon-dev/art-components";

export function AtomLogo() {
  return <ArtAtom decorative={false} aria-label="Orbiting atom logo" />;
}
```

Circular gallery:

```tsx
import { ArtCircularGallery } from "@duskmoon-dev/art-components";

export function Gallery() {
  return (
    <ArtCircularGallery
      title="Featured"
      items={[
        { title: "Moon", src: "/moon.jpg" },
        { title: "Sun", src: "/sun.jpg", alt: "Sun illustration" },
      ]}
    />
  );
}
```

Interactive plasma ball:

```tsx
import { ArtPlasmaBall } from "@duskmoon-dev/art-components";

export function PlasmaSwitch() {
  return (
    <ArtPlasmaBall
      defaultChecked
      onCheckedChange={(checked) => console.log(checked)}
    />
  );
}
```

## Variant Guidance

- Most wrappers accept `size="sm" | "default" | "lg"`.
- `ArtMoon` and `ArtSun` also accept `size="xl"`.
- `ArtMoon` supports `crescent` and `glow`.
- `ArtSun` supports `rays`, `sunset`, and `pulse`.
- `ArtSnowflake` supports `unicode` and `fall`.
- `ArtPlasmaBall` supports `checked`, `defaultChecked`, `hideBase`,
  `hideElectrode`, `inputProps`, and `onCheckedChange`.
- `ArtSynthwaveStarfield` supports `paused`.
- `ArtGeminiInput` behaves like a styled textarea wrapper with optional
  before/after buttons.

All wrappers accept `className`, `style`, and CSS custom properties through
`style`.

## Accessibility

- Decorative wrappers are hidden from assistive technology by default.
- Pass `decorative={false}` plus `aria-label`, `aria-labelledby`, `role`, or
  `title` when the art carries meaning.
- For interactive wrappers such as `ArtPlasmaBall` and `ArtGeminiInput`, pass
  native input or textarea props for labels, names, disabled state, and form
  integration.

## Guidance For Agents

- Always include the stylesheet import in first-time setup examples.
- Keep wrapper names exact, especially `ArtCsswitch` and its alias
  `ArtCSSwitch`.
- Do not claim this package owns the underlying CSS art source; it wraps
  `@duskmoon-dev/css-art`.
- Prefer package-root imports for wrappers.
- If the user is editing this repo's source rather than consuming the package,
  inspect `packages/art-components/src/index.tsx`,
  `packages/art-components/package.json`, and
  `packages/art-components/tests/art-components.test.tsx` before changing code.
