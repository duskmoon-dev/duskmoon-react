# Component Parity Todo

Snapshot date: 2026-05-25

## Objective

Implement the React component surface in `@duskmoon-dev/components` as a
DuskMoon-owned component library using DuskMoon design tokens and DuskMoon UI
component styles as the visual source of truth.

## Evidence Snapshot

- Current repo: `/Users/gao/Workspace/duskmoon-dev/duskmoon-react`, commit
  `ecbe9cf`.
- Token source: `https://github.com/duskmoon-dev/design`, HEAD `b9a7701`, with
  generated CSS, JSON, TypeScript, and Dart tokens.
- Style source: `/Users/gao/Workspace/duskmoon-dev/duskmoonui`, branch
  `develop`, commit `2c79aee`; local checkout is dirty and must be treated as
  read-only until intentionally updated.
- Current implemented component directories:
  `affix`, `alert`, `anchor`, `auto-complete`, `avatar`, `back-top`, `badge`,
  `breadcrumb`, `button`, `app`, `card`, `carousel`, `cascader`, `checkbox`, `col`,
  `collapse`, `calendar`, `config-provider`, `color-picker`, `date-picker`,
  `descriptions`, `divider`, `drawer`, `dropdown`, `empty`, `flex`,
  `float-button`, `grid`, `image`, `input`, `input-number`, `layout`,
  `list`, `mentions`, `menu`, `message`, `modal`, `notification`,
  `pagination`, `popover`, `popconfirm`, `progress`, `qr-code`, `radio`,
  `rate`, `result`, `row`, `segmented`, `select`, `skeleton`, `slider`,
  `space`, `spin`, `splitter`, `statistic`, `steps`, `switch`, `tabs`, `tag`,
  `time-picker`, `timeline`, `tooltip`, `tour`, `transfer`,
  `typography`, `upload`, `watermark`.
- Missing component directories in this repo: 1.
- Executable parity status: 105/105 public targets complete.
- The unprefixed standard component set is part of the target surface.
- Component/API inventory: `docs/component-api-inventory.md`.
- Machine-readable parity manifest:
  `packages/components/scripts/parity/component-api.manifest.json`.
- Executable parity status command: `bun run parity:components`.

## Source Priority

1. Public API and behavior decisions come from the DuskMoon component inventory,
   local component implementations, tests, and docs.
2. Visual tokens come from `@duskmoon-dev/design` generated tokens:
   colors, shape, typography, spacing, radius, and elevation. These generated
   tokens win over older or locally modified token values in `duskmoonui`.
3. Component class recipes come from `@duskmoon-dev/core` in the local
   `duskmoonui` checkout, especially `packages/core/src/components/*.ts`.
4. Existing local conventions come from `packages/components/src/components`,
   `packages/components/src/classes`, `packages/components/scripts/specs`,
   `packages/components/scripts/codegen.ts`, `packages/components/build.ts`, and
   `packages/components/package.json`.

## Target Naming Policy

- [ ] Use `Dm` as the DuskMoon public prefix for workflow components.
- [ ] Keep unprefixed standard component names unprefixed where the DuskMoon API
      uses generic names: `Button`, `Input`, `Table`, `Modal`, `Select`, etc.
- [ ] If compatibility aliases are needed later, add them intentionally and
      document them as aliases. The primary API, docs, directories, package
      subpaths, and tests should use `Dm`.
- [ ] Own explicit root exports, subpath exports, tests, and docs in this repo.

## Architecture Gaps To Resolve First

- [ ] Standardize ref handling before bulk implementation. Current components
      mix React 19 `ref` props and wrapper patterns.
- [ ] Decide provider parity. DuskMoon React currently has `ThemeProvider` and
      `ThemeInitScript`; decide whether to add a `DmProvider` API or expose the
      current DuskMoon-native provider with documented differences.
- [ ] Decide locale parity. DuskMoon React needs a locale story before shipping
      `Dm*` composite components with user-facing text.
- [ ] Decide dependency policy for large interaction models. DuskMoon React must
      decide case-by-case whether to depend on proven behavior libraries or
      implement DuskMoon-native behavior.
- [ ] Fix generated asset/export drift. `scripts/codegen.ts` only generates
      types and class helpers; it does not update package exports, build entrypoints,
      docs, tests, or public class indexes. `src/classes/index.ts` currently exports
      only `button`.
- [ ] Fix style packaging. `packages/components/package.json` exports
      `./styles.css`, but the current build does not obviously produce
      `dist/styles.css`.
- [ ] Expand CSS module declarations. `src/env.d.ts` only declares
      `@duskmoon-dev/core/components/button`, but parity work will need the broader
      DuskMoon core component style set.
- [ ] Replace the current static Playwright smoke with a real Next example
      smoke once more components exist.

## Definition Of Done

- [ ] Every public target in the component inventory has a matching React export
      in `@duskmoon-dev/components`.
- [ ] Each component has a stable root export and subpath export where parity
      requires one.
- [ ] Existing components are audited against DuskMoon API and visual rules, not
      assumed complete because files already exist.
- [ ] Component props, static members, forwarded refs, service APIs, and compound
      components match the DuskMoon contract unless an intentional difference is
      documented.
- [ ] Styling uses DuskMoon tokens and DuskMoon UI class recipes rather than
      copying legacy visual defaults.
- [ ] Tests cover rendering, class selection, accessibility basics, forwarded
      refs, controlled/uncontrolled state where relevant, and parity-specific API
      behavior.
- [ ] Docs include examples for every component and enough coverage to inspect
      the visual state matrix.
- [ ] Build, typecheck, tests, docs build, and export/package checks pass.

## Foundation Tasks

- [ ] Decide the adapter policy for standard components: DuskMoon-native first,
      but allow a focused behavior dependency only when parity would otherwise
      require reimplementing a large proven interaction model.
- [x] Add a first parity inventory script that compares the manifest against
      local component directories, DuskMoon target naming aliases, root exports,
      package subpath exports, and build entrypoints.
- [ ] Extend the parity inventory script to include docs pages once the docs
      component-page convention exists.
- [ ] Extend codegen so component specs can generate types, class helpers, and
      package export metadata consistently, then make generated-file drift visible in
      CI.
- [ ] Add a token bridge for `@duskmoon-dev/design` generated values and the
      existing `@duskmoon-dev/core` CSS variable/class system.
- [ ] Add component docs scaffolding under `packages/docs` so every component can
      get a predictable page and demo entry.
- [ ] Add a local component API checklist template covering props, static
      members, slots/children, refs, accessibility, controlled state, portals,
      locale, and tests.
- [ ] Add a single export integration path. Subagents should not independently
      edit `packages/components/package.json`, `packages/components/build.ts`, and
      `packages/components/src/index.ts` at the same time.

## Component Workstreams

Use these as subagent packets. Each worker owns only its component directories,
tests, specs, and docs stubs. A coordinator owns shared exports/build/package
files after worker patches are reviewed.

### Workstream A: Existing Components Audit

- [ ] `alert`
- [ ] `avatar`
- [ ] `badge`
- [ ] `button`
- [ ] `card`

For each component: compare current local props/classes, DuskMoon core style
recipe, tests, and docs.

### Workstream B: Standard Export Surface

- [ ] Implement or explicitly track every row in
      `docs/component-api-inventory.md#standard-components`.
- [ ] Add standard targets that are not already represented by local component
      directories: `App`, `BackTop`, `Breadcrumb`,
      `ConfigProvider`, `Grid`, `Layout`, `Menu`, `Splitter`, `theme`, `version`,
      and `unstableSetRender`.
- [ ] Own explicit root exports and package subpaths instead of using
      third-party blanket re-exports.
- [ ] For every standard component, decide whether implementation is
      DuskMoon-native, built on a behavior dependency, or intentionally deferred.

### Workstream C: DuskMoon Core Overlap

These have direct or close style coverage in `duskmoonui/packages/core` and
should be implemented before components without a DuskMoon recipe.

- [x] `autoComplete` using DuskMoon `autocomplete`
- [x] `checkbox`
- [x] `collapse`
- [x] `datePicker` using DuskMoon `datepicker`
- [x] `divider`
- [x] `drawer`
- [x] `input`
- [x] `list`
- [x] `modal`
- [x] `pagination`
- [x] `popover`
- [x] `progress`
- [x] `radio`
- [x] `select`
- [x] `skeleton`
- [x] `slider`
- [x] `switch`
- [x] `table`
- [x] `tabs`
- [x] `timeline`
- [x] `tooltip`
- [x] `upload` using DuskMoon `fileupload`

### Workstream D: Standard Surface Without Direct Core Match

- [x] `affix`
- [x] `anchor`
- [x] `calendar`
- [x] `carousel`
- [x] `cascader`
- [x] `colorPicker`
- [x] `descriptions`
- [x] `dropdown`
- [x] `empty`
- [x] `flex`
- [x] `floatButton`
- [x] `form`
- [x] `grid`
- [x] `image`
- [x] `inputNumber`
- [x] `mentions`
- [x] `popConfirm`
- [x] `qrCode`
- [x] `rate`
- [x] `result`
- [x] `segmented`
- [x] `space`
- [x] `spin`
- [x] `statistic`
- [x] `steps`
- [x] `tag`
- [x] `timePicker`
- [x] `tour`
- [x] `transfer`
- [x] `tree`
- [x] `treeSelect`
- [x] `typography`
- [x] `watermark`

### Workstream E: Feedback Service APIs

These are not plain components and need portal/service lifecycle tests.

- [x] `message`
- [x] `notification`
- [x] `dm-message`
- [ ] `modal` static APIs, if component parity requires them

### Workstream F: DuskMoon-Prefixed Composite Components

These should come after foundation, data entry, overlays, table, tree, and
navigation primitives are stable. This repo should expose `Dm*`/`dm-*` targets.

- [x] `dm-auxiliary`
- [x] `dm-breadcrumb`
- [x] `dm-date-picker`
- [x] `dm-drawer`
- [x] `dm-infinite-scroll`
- [x] `dm-layout`
- [x] `dm-menu`
- [x] `dm-message`
- [x] `dm-page-header`
- [x] `dm-pagination`
- [x] `dm-pro-table`
- [x] `dm-query`
- [x] `dm-search`
- [x] `dm-splitter`
- [x] `dm-status`
- [x] `dm-table`
- [x] `dm-tabs`
- [x] `dm-toolbar`
- [x] `dm-tree`
- [x] `dm-truncate`

Composite contracts to preserve or intentionally replace:

- [ ] `DmLayout`, `DmMenu`, `DmBreadcrumb`, `DmAuxiliary`, and `DmDrawer`:
      preserve `IMenu` schema, selected/open keys, recent breadcrumb storage,
      HTML auxiliary content, and custom drawer footer/submit behavior.
- [x] `usePersistedPageSize`: preserve page-size persistence behavior.
- [ ] `DmQuery`, `DmSearch`, `DmTable`, and
      `DmPagination`: preserve schema-driven search items, compact/collapsed
      modes, derived table search items, hidden/order column settings, custom
      pagination, and `_pageSize` persistence.
- [x] `DmProTable`: preserve column transformation, toolbar/column setting
      behavior, `${persistenceKey}_ag_grid` persistence, and the chosen
      ag-grid/browser compatibility story.
- [ ] `DmSplitter`: expose `DmSplitter.Panel` while preserving local/network
      persistence modes, collapse/reset behavior, and resize tests.
- [ ] `DmToolbar`: keep primary actions visible, overflow secondary actions, and
      cover `ResizeObserver` behavior.
- [ ] `DmTruncate`: cover measurement, tooltip, copy fallback, and i18n strings.
- [x] `setDmDatePickerLocale`: Dm-prefixed locale setter is exposed.
- [x] `DmDatePicker`: exposes Dm picker wrappers and locale semantics, plus
      moment/dayjs conversion behavior.

## Cross-Cutting Parity Checks

- [ ] Static members: `Button.Group`, `Typography.*`, `Form.*`, `Input.*`,
      `Select.*`, `Table.*`, `Modal.*`, `FloatButton.*`, and other compound
      exports.
- [ ] Ref forwarding: components that wrap native elements or focusable widgets
      must forward refs consistently.
- [ ] Controlled and uncontrolled modes: inputs, overlays, disclosure widgets,
      picker widgets, pagination, table, tabs, tree, and transfer.
- [ ] Portal behavior: modal, drawer, popover, tooltip, message, notification,
      tour, dropdown, select, cascader, treeSelect, and date/time pickers.
- [ ] Keyboard behavior: menu, tabs, radio, checkbox, select, combobox widgets,
      tree, table selection, and dialogs.
- [ ] Locale hooks: map DuskMoon locale behavior to runtime locale support
      before implementing user-facing strings.
- [ ] CSS variable contract: all colors, radius, spacing, type, elevation, focus,
      disabled, and state-layer styling should resolve from DuskMoon tokens.
- [ ] Server safety: keep class utilities server-safe and mark client-only
      component entrypoints with the existing build banner model.

## Verification Commands

Run focused checks during each workstream, then full checks before claiming
completion.

- [ ] `bun run --filter "@duskmoon-dev/components" typecheck`
- [ ] `bun run --filter "@duskmoon-dev/components" test`
- [ ] `bun run --filter "@duskmoon-dev/components" build`
- [ ] `bun run --filter "@duskmoon-dev/docs" build`
- [ ] `bun run lint:check`
- [ ] `bun run format:check`
- [ ] `bun run build:all`
- [ ] `bun test`

## Subagent Operating Rules

- [ ] Give each subagent a disjoint component group and explicit file ownership.
- [ ] Tell each subagent that other edits may exist and must not be reverted.
- [ ] Keep shared files under coordinator control:
      `packages/components/package.json`, `packages/components/build.ts`,
      `packages/components/src/index.ts`, and root docs navigation.
- [ ] Require each subagent final report to list changed files, parity evidence,
      and commands run.
- [ ] Integrate one workstream at a time, then run focused tests before starting
      the next shared-export update.

## Initial Missing Component List

```text
autoComplete
checkbox
collapse
datePicker
drawer
empty
flex
input
list
pagination
radio
rate
result
segmented
slider
space
spin
splitter
statistic
steps
switch
tabs
tag
timeline
tooltip
upload
watermark
```
