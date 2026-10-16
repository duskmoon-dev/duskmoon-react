# @duskmoon-dev/art-components

## 0.5.3

### Patch Changes

- 63f3c9c: Update Core and CSS Art to 1.20.7, including readable Markdown in colored Chat bubbles and centered native Circular Gallery previews.

  Add Chat agent/content/work, controlled waiting queue and native composer primitives, plus opt-in collapsible user messages. Existing Chat APIs remain available; the new primitives require Core >=1.20.6.

  Use native interest invokers for normal Tooltip controls and anchored native Popconfirm surfaces. Rich Popover/Popconfirm content retains caller-owned semantics. The already-deprecated Tooltip arrow option remains usable; the normal hint default is arrowless.

  Align Plasma, Cat, Flower, Synthwave and CSSwitch markup with upstream CSS while retaining public art APIs, and add executable interaction examples to the documentation.

## 0.5.2

### Patch Changes

- d99fb6b: Update Core and CSS Art build and documentation dependencies from 1.20.3 to 1.20.5. Rebuild the bundled component stylesheet with upstream screen-reader utility, pagination state, and megamenu viewport fallback fixes.

## 0.5.1

## 0.5.0

## 0.4.1

### Patch Changes

- Keep the CSS Art package version aligned with the components 0.4.1 patch release.

## 0.4.0

### Patch Changes

- 537c9ae: Expose the CSSwitch controls to keyboard users by default and name the default Gemini Input actions. Decorative CSSwitch controls remain outside the tab order. Parent disabled state cannot be re-enabled through child button props.
- 537c9ae: Align Mountain, Flower Animation, Circular Gallery, Gemini Input, Color Spin,
  and Snowball Preloader markup with DuskMoonUI CSS Art 1.20.0. Keep Circular
  Gallery links accessible by default and preserve explicit accessibility props.

## 0.3.3

### Patch Changes

- Align the package version with the coordinated 0.3.3 workspace release.

## 0.3.2

### Patch Changes

- Align the package version with the 0.3.2 workspace release and documentation app bar version.

## 0.3.1

## 0.3.0

## 0.2.1

## 0.2.0

### Minor Changes

- Release 0.2.0.

## 0.1.2

### Patch Changes

- 722a139: Fix component package lint, accessibility, export, and smoke build issues.
