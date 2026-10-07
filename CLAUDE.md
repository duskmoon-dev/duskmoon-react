# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bun-workspace monorepo for `@duskmoon-dev/components` — a React 19 component library that renders CSS class recipes from `@duskmoon-dev/core` (peer dependency, version contract: major versions must match). No CSS-in-JS; components compose class names only.

- `packages/components` — the library (`@duskmoon-dev/components`)
- `packages/docs` — Astro docs site (`@duskmoon-dev/docs`)
- `examples/nextjs-15-smoke` — Next.js 15 smoke test

## Commands

All commands use Bun and run from the repo root unless noted.

```bash
bun install                  # install workspace deps
bun run build                # build @duskmoon-dev/components (JS via build.ts + d.ts via tsc)
bun run build:all            # build every package
bun run test                 # bun test packages/ (happy-dom, preload test/setup.ts via bunfig.toml)
bun test packages/components/src/components/button/Button.test.tsx   # single test file
bun x playwright test        # e2e + axe a11y tests in test/e2e (playwright.config.ts)
bun run lint                 # eslint .
bun run format               # prettier --write .
bun run typecheck            # tsc --noEmit in every package
bun run parity:components   # verify component-api.manifest.json against exports/dirs/build entrypoints
bun run dev                  # docs site dev server (Astro, port 4334)
cd packages/components && bun run scripts/codegen.ts   # regenerate classes/types from specs
```

Releases use Changesets (`bun run release`). CI runs lint, format:check, tests, typecheck, and bundle size (100 kB per dist JS file via bundlesize).

## Architecture

### Codegen pipeline (spec → generated code)

Component styling variants are defined as JSON specs in `packages/components/scripts/specs/*.json` (base class, axes like color/size/appearance, boolean modifiers). `scripts/codegen.ts` generates:

- `src/classes/<name>.ts` — class-name maps and `get<Name>Classes()` (marked `// GENERATED FILE. DO NOT EDIT.`)
- `src/components/<name>/<Name>.types.ts` — prop types

Never hand-edit generated files; edit the spec and re-run codegen. Hand-written component code (`<Name>.tsx`) consumes the generated class getters.

### Build and exports

`packages/components/build.ts` is a custom Bun build with three groups: server-safe entrypoints (`utils`, `classes`, with splitting), main entrypoints (`index`, `theme`, `infrastructure`) and per-component client entrypoints — both built with a `"use client"` banner. Every component has its own subpath export (`@duskmoon-dev/components/button`).

Adding a component requires touching all of: spec JSON → codegen → `src/components/<name>/` (component + index + tests) → `src/index.ts` → `package.json` `exports` → `build.ts` entrypoints → parity manifest (`scripts/parity/component-api.manifest.json`). `bun run parity:components` enforces that these stay in sync — run it after adding/renaming components.

### Public API policy (docs/component-api-inventory.md)

Two export layers: Ant Design-compatible generic components keep unprefixed names (`Button`, `Modal`, `Table`...), DuskMoon workflow components use the `Dm*` prefix (`DmLayout`, `DmProTable`, `DmProvider`...). z-design/Ant Design are API references only — do not port their source or expose `Z*` names. `src/infrastructure.ts` provides Ant-compatible helpers (`theme.useToken`, `GetProps`/`GetRef`, render override).

### Testing

Unit tests live next to components (`Button.test.tsx`, `Button.classes.test.ts`) and run with `bun test` against happy-dom; `test/setup.ts` registers the DOM and auto-runs Testing Library cleanup (configured in root `bunfig.toml`). E2E/a11y tests use Playwright + `@axe-core/playwright` in `test/e2e/`.
