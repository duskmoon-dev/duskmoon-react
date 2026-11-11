# @duskmoon-dev/components

## 0.6.3

### Patch Changes

- Publish host-owned Chat composer settings menus, an attached context bar, and timeline approval requests using Core 1.21.5 styles. Preserve serialized settings acknowledgments, accessible pending/resolved states, and keyboard focus.

## 0.6.2

### Patch Changes

- Scope React Radio wrapper styles to labels so Core native radio inputs retain
  their border and checked indicator when both stylesheets are loaded.

  Generate default Composer submission UUIDs with secure random bytes when
  `crypto.randomUUID` is unavailable, including LAN HTTP origins. Preserve
  immutable submission snapshots and reuse the original identity on retries in
  both plain and rich composers.

## 0.6.1

### Patch Changes

- Update Core to 1.21.1 and refine the Chat composers with compact controls,
  centered icon buttons, smaller padding, integrated editor styling, native
  completion menus, and slash skill and command examples. Preserve controlled
  drafts, attachment recovery, and host-owned admission and execution.

  Use a compact documentation appbar with a theme dropdown. Collapse example
  source, API type definitions, and JSON schema snippets by default, with native
  keyboard-accessible disclosure controls.

## 0.6.0

### Minor Changes

- 5ec48ae: Add a controlled semantic `ChatSessionComposer` and an optional `RichChatComposer` from `/chat/rich`, with shared attachment intake, cancellable completion providers, host-owned draft storage, typed admission and recovery, authoritative queue controls, and acknowledged settings.

  Preserve the existing plain `Chat.Composer` API and shortcuts. Keep the pinned optional Lexical runtime outside root and `/chat` import graphs, and preserve structured drafts when the rich editor is unavailable. These features require application adapters for authorization, execution, preparation, persistence, and reconciliation.

## 0.5.7

### Patch Changes

- Synchronize the fixed workspace lockfile versions and rebuild the existing Core 1.21.0 integration with the corrected browser CI configuration. No additional upstream dependency or public API changes.

## 0.5.6

### Patch Changes

- Adopt DuskMoon Core and CSS Art 1.21.0. Keep semantic surface text readable through React styling, scope docs metadata badges, and use Core's shared Composer attachment, suggestion and error presentation. Components now require Core >=1.21.0.

  Preserve plain Composer defaults while isolating pending admission and previews across optional application/conversation scopes. Export portable Composer v1 types, JSON fixtures and validated document/snapshot/export helpers as groundwork for later rich integration; no rich editor runtime is included.

## 0.5.5

### Patch Changes

- Align Timeline marker styles with @duskmoon-dev/core:
  - Render `.timeline-marker-dot` element directly when no custom dot is provided instead of generating a pseudo-element.
  - Remove intrusive `.timeline-marker:not(.timeline-marker-icon)::after` rule from styles.css that caused dual dots and icon collisions.
  - Remove default `box-shadow` on uncolored `.timeline-marker` so default markers display clean outline without primary halo.
  - Align `.timeline-sm` marker size to 1.5rem to match Core line offset.

## 0.5.4

### Patch Changes

- fix(select): migrate dropdown to HTML Popover API with anchor positioning, click-outside dismissal, and fix button layout style collision

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

### Patch Changes

- 77fd634: Honor InputNumber readOnly across typing, arrow keys, and step controls while keeping the input focusable.

  Forward Select aria-required to the interactive trigger in client and server rendering. Replace literal caret and clear characters with graphical icons, reset the inherited native caret, and reserve space so selection text and controls do not overlap.

  Add JsonSchemaForm className support on the generated native form while preserving its default classes, validation, submission, and reset behavior.

## 0.5.0

### Minor Changes

- 175347a: Add the public Chat.Composer and ChatComposer APIs for controlled multiline prompts, attachment previews, and application-supplied command or skill completion. Support IME-safe keyboard submission, independent follow-up admission and Stop actions, and asynchronous admission that preserves rejected drafts and edits or files added while submission is pending.

## 0.4.1

### Patch Changes

- Expose JSON Schema forms through the dedicated json-schema-form package subpath, with controlled values, backend errors, typed submission, widget contracts, and packaged layout styles. Associate Select labels and validation errors with the focusable trigger in single and multiple modes.

## 0.4.0

### Minor Changes

- 5e6d33e: Add compound React chat primitives for message bubbles, reasoning, tool calls,
  and live typing or streaming states.
- 7197c5c: Add Chat status, actions, and in-panel reply navigation primitives and expose the shipped Avatar 2XL size. Require Core 1.20.3 for the new styles.
- 7197c5c: Use a native dialog for Modal so opening it enters the browser top layer and provides focus containment, background inertness, Escape dismissal, and focus return. Keep the existing content div ref and props. `maskClassName` now applies to the dialog, where it can style the native `::backdrop`; the physical `.modal-backdrop` element is no longer rendered by Modal.
- b1d8400: Add native popover form confirmation to Button with deferred click actions and custom component or message content.
- e518075: Sync with DuskMoonUI Core 1.20.0 and add native OtpInput, Swap, Fab, Megamenu, and ConsolePage React components. Preserve existing React APIs while updating the Sunshine theme and chat streaming compatibility styles.
- 05c7d5f: Render Tooltip surfaces in the native popover top layer with CSS anchor positioning, coordinated hover and focus behavior, and native dismissal notifications.

### Patch Changes

- 1168ed3: Associate Form.Item labels with their controls and include the canonical Badge outline class while preserving its legacy alias.
- 65f7ec8: Improve DmLayout navigation and menu presentation in compact sidebars.
- b1d8400: Size circular icon buttons with the native DuskMoonUI icon button classes.

## 0.3.3

### Patch Changes

- Align the package version with the coordinated 0.3.3 workspace release.

## 0.3.2

### Patch Changes

- Align the package version with the 0.3.2 workspace release and documentation app bar version.

## 0.3.1

### Patch Changes

- 911572b: Add a Markdown component with GFM rendering, color chips, front matter modes, and soft line breaks enabled by default.

## 0.3.0

### Minor Changes

- 2d789e7: Add full semantic color variants across color-capable components and document every palette demo.

## 0.2.1

### Patch Changes

- f610a69: Remove the unused DmProTableInner implementation and package export.

## 0.2.0

### Minor Changes

- Release 0.2.0.

## 0.1.2

### Patch Changes

- 722a139: Fix component package lint, accessibility, export, and smoke build issues.
