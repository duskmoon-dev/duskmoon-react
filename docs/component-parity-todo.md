# Component Parity Todo

Snapshot date: 2026-07-03

## Objective

Keep `@duskmoon-dev/components` aligned with the DuskMoon React public API
surface defined in `docs/component-api-inventory.md` and
`packages/components/scripts/parity/component-api.manifest.json`.

## Evidence Snapshot

- Current repo: `/home/gao/Workspace/duskmoon-dev/duskmoon-react`, branch
  `main`.
- Package version: `0.3.0`.
- Component package peer dependencies: `@duskmoon-dev/core >=1.16.1`,
  `react >=19.0.0`, and `react-dom >=19.0.0`.
- Art wrapper peer dependency: `@duskmoon-dev/css-art >=1.17.0`.
- Implemented component directories:
  `packages/components/src/components/*` contains 92 public component
  directories.
- Class helper files: `packages/components/src/classes/*.ts` contains 92 class
  helper files, excluding `index.ts`.
- Docs pages: `packages/docs/src/pages/components/*.astro` contains 120 pages:
  105 component/infrastructure pages and 15 art wrapper pages.
- Package exports: `packages/components/package.json` exposes 97 subpaths,
  including root, styles, theme, classes, utils, component subpaths, DuskMoon
  workflow subpaths, and infrastructure subpaths.
- Machine-readable parity manifest:
  `packages/components/scripts/parity/component-api.manifest.json`.
- Executable parity command: `bun run parity:components`.

## Current Parity Status

`bun run parity:components` currently reports:

```text
Public targets: 105/105 complete
  standard-component: 71/71 complete
  dm-workflow-component: 21/21 complete
  infrastructure-export: 13/13 complete

Internal targets: 0/0 complete
Overall public target status: 105/105 complete
Overall internal target status: 0/0 complete
```

There are no missing public component directories relative to the parity
manifest.

## Source Priority

1. Public target IDs, export names, and implementation status come from
   `packages/components/scripts/parity/component-api.manifest.json`.
2. Implemented component directories come from
   `packages/components/src/components/`.
3. Root exports come from `packages/components/src/index.ts`.
4. Package subpath exports come from `packages/components/package.json`.
5. Build entrypoints come from `packages/components/build.ts`.
6. Docs coverage comes from `packages/docs/src/pages/components/*.astro`.
7. Art wrapper coverage comes from `packages/art-components/src/index.tsx` and
   `packages/art-components/tests/art-components.test.tsx`.

## Maintenance Tasks

- [x] Keep every public target in the manifest represented by a component
      directory, root export, package export, and build entrypoint when the
      target requires those surfaces.
- [x] Keep all standard component directories implemented.
- [x] Keep all `Dm*` workflow component directories implemented.
- [x] Keep all infrastructure exports represented in the root package and docs.
- [x] Keep `docs/component-parity-todo-list.md` aligned with the manifest and
      parity command output.
- [x] Keep component docs pages available for every public target.
- [x] Keep art wrapper docs pages available for each concrete art wrapper.
- [ ] Add or document a generator for `docs/component-parity-todo-list.md` if
      the table is expected to remain generated.
- [ ] Expand parity checks to verify docs page coverage directly.
- [ ] Expand parity checks to verify package README examples against exported
      subpaths.

## Cross-Cutting Parity Checks

- [ ] Static members: `Button.Group`, `Typography.*`, `Form.*`, `Input.*`,
      `Select.*`, `Table.*`, `Modal.*`, `FloatButton.*`, and other compound
      exports.
- [ ] Ref forwarding: components that wrap native elements or focusable widgets
      should forward refs consistently.
- [ ] Controlled and uncontrolled modes: inputs, overlays, disclosure widgets,
      picker widgets, pagination, table, tabs, tree, and transfer.
- [ ] Portal behavior: modal, drawer, popover, tooltip, message, notification,
      tour, dropdown, select, cascader, tree-select, and date/time pickers.
- [ ] Keyboard behavior: menu, tabs, radio, checkbox, select, combobox widgets,
      tree, table selection, and dialogs.
- [ ] Locale behavior: keep DuskMoon locale helpers aligned with user-facing
      text in composite components.
- [ ] CSS variable contract: all colors, radius, spacing, type, elevation,
      focus, disabled, and state styling should resolve through DuskMoon Core
      classes or variables.
- [ ] Server safety: keep `classes` and `utils` server-safe while component
      entrypoints remain client-capable through the existing build banner model.

## Verification Commands

Run focused checks for package work, then full checks before release work.

- [ ] `bun run parity:components`
- [ ] `bun run --filter "@duskmoon-dev/components" typecheck`
- [ ] `bun run --filter "@duskmoon-dev/components" test`
- [ ] `bun run --filter "@duskmoon-dev/components" build`
- [ ] `bun run --filter "@duskmoon-dev/art-components" typecheck`
- [ ] `bun run --filter "@duskmoon-dev/art-components" test`
- [ ] `bun run --filter "@duskmoon-dev/docs" build`
- [ ] `bun run lint:check`
- [ ] `bun run format:check`
- [ ] `bun run build:all`

## Subagent Operating Rules

- [ ] Give each worker a disjoint component group and explicit file ownership.
- [ ] Tell each worker that other edits may exist and must not be reverted.
- [ ] Keep shared files under coordinator control:
      `packages/components/package.json`, `packages/components/build.ts`,
      `packages/components/src/index.ts`, and docs metadata files.
- [ ] Require each worker final report to list changed files, parity evidence,
      and commands run.
- [ ] Integrate one workstream at a time, then run focused tests before shared
      export updates.
