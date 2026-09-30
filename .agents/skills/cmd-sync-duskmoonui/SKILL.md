---
name: cmd-sync-duskmoonui
description: Update DuskMoonUI dependencies in duskmoon-react and sync affected React components, art wrappers, CSS, and docs with the upstream public API.
disable-model-invocation: true
---

# Sync DuskMoonUI with duskmoon-react

Run from the repository root. The optional `--only=core` or `--only=css-art` argument limits the dependency and wrapper work to one upstream package. With no argument, sync both.

## 1. Inspect the checkout and published versions

Read `git status --short` first and preserve unrelated changes. Read the current exact versions from these manifests:

| Upstream package        | Manifest locations                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `@duskmoon-dev/core`    | `packages/components/package.json` (`devDependencies`), `packages/docs/package.json` (`dependencies`) |
| `@duskmoon-dev/css-art` | `packages/art-components/package.json` (`devDependencies`)                                            |

Use `npm view @duskmoon-dev/core version` and `npm view @duskmoon-dev/css-art version` for the selected packages. Check that all existing pins for a package agree. If a selected package is current, still check whether an earlier partial sync left its React API, CSS, or docs out of date; otherwise report it as current.

The `peerDependencies` in the two library manifests express the oldest supported upstream version. Do not replace their lower bounds with the latest version just because the development pin changed. Change a peer bound only when a new required feature makes the old version incompatible, and verify that boundary.

## 2. Review the public upstream changes

Compare the old and new npm package contents, release notes, or corresponding tags in `duskmoon-dev/duskmoonui`. Inspect public exports, component CSS and class names, design tokens, art classes and variants, and any deprecations. When using Git tags, verify both tags exist and find the actual source directories before constructing a path-limited diff. Do not infer parity from a successful build alone.

Map relevant changes against these local surfaces:

- Core: `packages/components/src/components/`, `src/classes/`, `src/index.ts`, `src/styles.css`, `scripts/build-css.ts`, `build.ts`, package `exports`, and component tests. Core CSS comes from the installed `@duskmoon-dev/core` package during the build.
- CSS art: `packages/art-components/src/index.tsx`, `src/styles.css`, tests, and package README. This is one React wrapper package, not one workspace package per illustration.
- Documentation: `packages/docs/src/pages/components/`, `packages/docs/src/lib/`, and the relevant package README files.

The manifest at `packages/components/scripts/parity/component-api.manifest.json` records known React targets; `bun run parity:components` checks its local wiring. Compare it with upstream yourself and update it when a public target changes. It does not discover new upstream components automatically. Keep intentionally React-specific components and APIs independent of upstream CSS inventory.

## 3. Update selected dependencies and React integration

Edit only the selected upstream package pins, keeping their existing version style, then run `bun install` to update `bun.lock`. Implement the public changes that affect React usage:

- Add a React component only when the upstream public component has a meaningful React contract; follow an existing component's source, props, tests, root export, package subpath, build entrypoint, parity manifest, and docs. Do not copy upstream implementation code wholesale.
- Update affected class recipes, props, and CSS imports for renamed or changed upstream APIs. Preserve existing public React APIs where compatible. Handle removals or breaking changes explicitly rather than deleting a React component solely because upstream CSS changed.
- Add or update art wrappers and variants when public art classes or documented variants change; update art tests and docs. Do not create `art-elements/` or individual art packages.
- Review any local CSS overrides against the new upstream CSS and remove an override only after proving the upstream behavior now covers it.

If a dependency bug or missing feature under the listed upstream organizations blocks the work, follow this repo's `AGENTS.md` issue-routing and blocker policy. Do not hide it with an untracked local workaround.

## 4. Verify and report

Run the checks relevant to the selected packages and changed surfaces. At minimum, run the selected package builds, tests, and typechecks; run `bun run parity:components` when core or component wiring changed. Run the docs build when docs, component exports, or CSS imports changed. Inspect built `dist` output for changed exports and CSS; use a browser check for visual or interactive behavior changes. Run root `bun run build:all`, `bun run test`, and `bun run typecheck` when syncing both packages. Resolve regressions caused by this update, then check `git diff --check` and the final scoped diff.

Report the old and new versions, React and art API changes, checks run and their outcomes, and any remaining upstream issue or unverified behavior. Do not claim full upstream parity from the static parity script alone. Do not publish or change this repo's release version as part of a dependency sync unless requested.
