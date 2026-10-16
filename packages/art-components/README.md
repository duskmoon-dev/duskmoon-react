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

## CSS and browser contracts

The wrappers supply the HTML required by CSS Art 1.20.7. They do not add
JavaScript animation engines or browser polyfills. CSS art uses modern CSS;
check feature support in your supported browsers, especially the following:

- `ArtCircularGallery` uses CSS Motion Path, `:has()`, `@property`, and CSS
  Anchor Positioning. The upstream design has 20 items indexed 1–20; smaller
  arrays remain supported but occupy only part of that arc. An item opens its
  native hash-target preview when its `href` is omitted or points to its own
  ID. A custom `href` performs ordinary link navigation. The published CSS sets
  card width to `0.09 * --art-circular-gallery-size` (the upstream docs token
  table's `0.07` differs from the shipped stylesheet). CSS Art 1.20.7 fixes
  native preview centering ([duskmoonui#77](https://github.com/duskmoon-dev/duskmoonui/issues/77));
  upgrade the CSS dependency to receive that fix. The wrapper uses upstream
  positioning without a local override.
- `ArtCsswitch` changes its layout at viewport widths 1010, 670, 460, and 360px.
  These are viewport breakpoints, independent of the `size` prop. Its native
  buttons provide press feedback; app actions are consumer-owned.
- `ArtSnowballPreloader` requires `--art-snowball-preloader-bg` to match the
  surrounding background so its track mask blends in. Upstream documents
  relative-color support as Chrome 119+, Firefox 128+, or Safari 16.4+; verify
  the features in your actual browser. Its snow texture loads from the URL in
  upstream CSS. It is decorative by default; add a separate status message
  when announcing loading.
- `ArtGeminiInput` uses `field-sizing: content` for multiline growth and
  `@property`, gradients, and masks for its border. It defaults to `rows={1}`;
  callers can set `rows` explicitly. Give the textarea an accessible name with
  `textareaProps={{ "aria-label": "Message" }}` or an associated `<label>`.
  The Add and Send buttons have no default application action. Set
  `afterButtonProps={{ type: "submit" }}` to submit a surrounding form, or
  provide button callbacks. `disabled` disables the textarea and both actions.

```tsx
<ArtSnowballPreloader
  style={{ "--art-snowball-preloader-bg": "#101827" }}
/>
<ArtGeminiInput
  placeholder="Write a message"
  textareaProps={{ "aria-label": "Message" }}
  afterButtonProps={{ type: "submit" }}
/>
```

Animation customization stays in CSS. Moon glow, Sun rays/pulse, Atom orbits,
Eclipse layers, Mountain aurora, falling Snowflake, Cat blinking, Flower garden
growth, ColorSpin rings, and Snowball orbit have no additional React activation
API. `ArtSynthwaveStarfield paused` freezes the upstream scene animations.
`ArtPlasmaBall` provides native checkbox state through `checked`,
`defaultChecked`, `onCheckedChange`, and `inputProps`; use
`inputProps={{ disabled: true }}` to prevent activation. Its checkbox precedes
the glass ball so upstream checked/hover selectors remain effective.

## Development

```bash
# Build the wrapper package
bun run build

# Run wrapper tests
bun run test

# Typecheck
bun run typecheck
```
