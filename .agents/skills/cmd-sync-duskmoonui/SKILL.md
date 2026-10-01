---
name: cmd-sync-duskmoonui
description: Update DuskMoonUI dependencies in duskmoon-react and align React components, art wrappers, CSS, and docs with the target version's public API, design principles, markup, and interaction contracts.
---

# Sync DuskMoonUI with duskmoon-react

Run from the repository root. The optional `--only=core` or `--only=css-art` argument limits dependency and wrapper work to one upstream package. With no argument, sync both.

## 1. Establish scope and inspect versions

Read `git status --short` first and preserve unrelated changes. Identify whether the request is preparation-only, whether verification is paused, and which packages and surfaces are authorized. For preparation-only requests, make a read-only inventory and change mapping, then outline actionable follow-up tasks. Do not modify integrations or dependencies or run verification. When the user pauses tests, leave verification pending and do not claim the sync is complete. Do not add a permission checkpoint when the requested scope already authorizes the sync and the mapping settles the actions.

Read the current exact versions from these manifests:

| Upstream package        | Manifest locations                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `@duskmoon-dev/core`    | `packages/components/package.json` (`devDependencies`), `packages/docs/package.json` (`dependencies`) |
| `@duskmoon-dev/css-art` | `packages/art-components/package.json` (`devDependencies`)                                            |

Use `npm view @duskmoon-dev/core version` and `npm view @duskmoon-dev/css-art version` for selected packages. Check that all existing pins for a package agree. Verify package repository metadata from the package registry or package contents; do not assume its source repository or source paths. Record exact installed and target versions/tags and the source of each fact. If a selected package is current, still check whether an earlier partial sync left its React API, CSS, or docs out of date; otherwise report it as current.

The `peerDependencies` in the two library manifests express the oldest supported upstream version. Do not replace their lower bounds with the latest version just because the development pin changed. Change a peer bound only when a new required feature makes the old version incompatible, and verify that boundary.

## 2. Build the upstream-to-local change map

Before implementation, compare the old and target public package contracts, plus upstream documentation and examples. Inspect the full target inventory and changes in public package exports, component CSS and class names, art classes and variants, design tokens, markup guidance, interaction guidance, and deprecations. Use published package contents, release notes, documentation, examples, or corresponding source tags as evidence. When using Git tags, verify both tags exist and find the actual source directories before constructing a path-limited diff. Record unavailable or unverified evidence explicitly.

Use evidence for the exact target version: inspect the published package and documentation/source at its verified tag or commit. A local upstream checkout or the live documentation site may describe another version; record its revision and do not use it to override the target contract. If published CSS, versioned docs, and examples disagree, record the conflict and resolve which contract applies before implementing that surface; do not silently select the older or easier implementation.

Inventory actual local root and subpath exports, build entries and output, wrappers, CSS, docs, and tests. Include public surfaces discovered in package contents even when absent from a manifest: the parity manifest is not exhaustive. Compare both the old-to-new upstream delta and the target-to-local gaps, even when the versions match or are both pinned to `latest`; this detects additions missed by earlier syncs. Neither a manifest nor a successful build proves parity.

### Required design-contract review

Review every upstream component/art family in the selected package's target inventory, including unchanged families and existing wrappers. Inventory presence alone is not a design review. Record the following contract checks per family in the mapping or an accompanying table:

| Contract check | Required comparison |
| --- | --- |
| Design principles | Explicit requirements, breaking-change notices, intended use, and supported browser capabilities; distinguish requirements from recommendations and illustrative examples |
| Markup and styling | Element hierarchy, semantic elements, required attributes/selectors, classes, variants, tokens, positioning, and deprecated structures |
| Interaction | Required native APIs, triggers, state transitions, dismissal, form submission, loading/disabled behavior, and lifecycle cleanup where applicable |
| Accessibility | Roles and trigger associations, keyboard/focus behavior, and permitted interactive content |
| Local compatibility | Public React props/refs/callbacks, local overrides/adapters, migration needs, and docs/demo coverage |

Give each check a source reference and a result: `ALIGNED_SOURCE`, `GAP`, `CONFLICT`, `UNKNOWN`, or `N/A` with a reason. `ALIGNED_SOURCE` means source agreement only, not runtime validation. Unavailable evidence is `UNKNOWN`, never assumed parity. A discovered mismatch needs its own mapping disposition and follow-up task even if it predates this version update.

For example, Core `1.20.0` explicitly replaces the old Tooltip wrapper/content structure with `popover="hint"`, Interest Invokers, and CSS Anchor Positioning. Check the local Tooltip markup, opening mechanism, positioning, arrow policy, accessibility, and overrides against that version's contract. Retaining a `.tooltip-show` adapter is a recorded design gap, not proof of alignment. This example is version-specific; derive each future target's requirements from its own evidence rather than mandating one mechanism for all versions or overlay families.

Persist a readable mapping at `docs/superpowers/plans/YYYY-MM-DD-duskmoonui-sync.md`, using the run date. Preparation-only work may write this planning document while leaving package and integration files untouched. Include one row for every discovered difference, with these columns:

| Target | Category | Old/new contract and evidence | Affected local surfaces | Action | Compatibility or migration reason | Verification/evidence status |
| --- | --- | --- | --- | --- | --- | --- |

Use categories `added`, `removed`, `renamed`, `design`, `behavior`, `deprecated`, `local-only`, or `gap`. Actions are `add`, `adapt`, `deprecate`, `remove`, `retain`, or `block`. Give every difference a disposition before editing; do not silently exclude rows. Record React-specific APIs as local-only and retain them with their compatibility rationale unless separately authorized for removal. Upstream absence by itself is not authority to delete them.

When upstream removes a local public API, deprecate it locally before removing it. Count the window in published stable releases of this project's affected React package; upstream versions, sync runs, patch releases, and prereleases do not count as minor advances. The first published stable release that deprecates the API starts the window. For a deprecation first published in `M.n.p`, the earliest same-major removal is `M.(n+3).0` (for example, deprecation in `0.4.2` permits removal no earlier than `0.7.0`; keep the API usable through `0.4.x`, `0.5.x`, and `0.6.x`). The minor advances used to reach the threshold must be real published stable releases; do not manufacture or rely on an unpublished version. A major bump alone does not waive the window. Across major versions, preserve verified published release history and the count; if the threshold is uncertain, retain the API and block removal rather than inventing arithmetic.

If the deprecation release has not shipped, plan it first and label its `deprecated-since` as proposed. Record the actual or proposed `deprecated-since`, earliest-removal threshold, upstream removal evidence, replacement and migration guidance (or explicitly state there is no replacement), and verified local release history in the mapping and report. Until removal is eligible, keep runtime exports, root and subpath exports, types, build entries, required styles, docs, and tests usable. Add JSDoc `@deprecated` to public TypeScript components and cover affected public subcomponents and aliases; mark the documentation and release notes too. If the upstream removal makes the local API unusable, for example because required CSS was dropped, follow the existing upstream blocker policy; an annotation does not preserve behavior, and do not silently delete the API. Once the threshold is met, removal is only eligible: perform cleanup and update affected exports, build entries, parity data, docs, and tests only within authorized implementation scope. Never auto-release, commit, or publish.

For any removal, distinguish a public removal from a rename, move, or an internal-only symbol, and record any replacement. Require explicit authorization covering migration, public compatibility, and release scope. Otherwise deprecate, retain, or block it. Do not guess at unresolved breaking contracts: mark them as blockers. Do not ask for routine permission when existing scope already settles an action.

## 3. Map changes to React and docs

Map relevant changes against these local surfaces:

- Core: `packages/components/src/components/`, `src/classes/`, `src/index.ts`, `src/styles.css`, `scripts/build-css.ts`, `build.ts`, package `exports`, component tests, and generated build output. Core CSS comes from the installed `@duskmoon-dev/core` package during the build.
- CSS art: `packages/art-components/src/index.tsx`, `src/styles.css`, tests, package exports, and package README. This is one React wrapper package, not one workspace package per illustration.
- Documentation: `packages/docs/src/pages/components/`, `packages/docs/src/lib/`, and the relevant package README files.

The manifest at `packages/components/scripts/parity/component-api.manifest.json` records known React targets; `bun run parity:components` checks its local wiring. Compare it with upstream and update it when a public target changes. It does not discover new upstream components automatically. Keep intentionally React-specific components and APIs independent of upstream CSS inventory.

For each added upstream component, require a meaningful React contract and map its props, classes, root and subpath exports, build entry, parity manifest, docs, and tests. Keep upstream CSS/HTML contract decisions distinct from React API design. Adapt markup, styles, and behavior only as the public contract requires, including event/state behavior, controlled or uncontrolled use, focus and keyboard behavior, accessibility, and overlay lifecycle cleanup. Do not copy upstream implementation code wholesale. Treat a docs preview as explanatory only: generic callback stubs and snippets that do not execute are not proof of package behavior.

Apply the same design-contract checks to existing components. Preserving public React APIs does not justify preserving obsolete DOM, CSS overrides, or interaction mechanisms. Where compatible, keep the public API and adapt the implementation to the target contract. If that is not possible within authorized scope, record the specific conflict, compatibility reason, affected surfaces, migration/deprecation path, and an actionable deferred or blocked task. Do not classify an implementation that contradicts an upstream requirement as aligned merely because it is intentional or currently renders. Browser fallbacks or polyfills absent from upstream are consumer-owned compatibility choices: document their differences and scope rather than claiming they implement the upstream design.

Map documented states and behaviors to meaningful React demos, including loading, disabled, visual variants, icon-only controls, and overlays where the component supports them. Separate upstream requirements from local enhancements: a confirmation form composed from Button and Popover is not an upstream Button API unless the target evidence says so. Interactive confirmation belongs in an appropriate popover/dialog, not a non-interactive tooltip.

Add or update art wrappers and variants when public art classes or documented variants change; update art tests and docs. Do not create `art-elements/` or individual art packages. Review local CSS overrides against the new upstream CSS and remove an override only after proving the upstream behavior now covers it.

## 4. Create future audit tasks from the mapping

After the mapping is complete, create one independently actionable future audit task for each affected component or component family. Include public subcomponents and deduplicate aliases. Each task must identify a stable task ID, exact upstream source or docs evidence, setup, action, observable expected outcome based on the public contract, and planned validation. Mark every task `NOT_RUN` until it has actually been executed. A rendered docs preview, generic callback stub, or nonexecuted snippet cannot receive `PASS`; verify actual state changes and event outcomes where the public contract defines them.

Include design and behavior gaps found in existing components, not only newly added components. Deferred tasks do not satisfy the sync's acceptance criteria; keep them visible as remaining work. The existence of a task or passing export parity cannot stand in for contract alignment.

## 5. Update selected dependencies and React integration

Edit only the selected upstream package pins, keeping their existing version style, then run `bun install` to update `bun.lock`. Implement mapped public changes that affect React usage. Preserve existing public React APIs where compatible. Handle removals or breaking changes according to the mapping and its evidence. If a dependency bug or missing feature under the listed upstream organizations blocks the work, follow this repo's `AGENTS.md` issue-routing and blocker policy. Do not hide it with an untracked local workaround.

## 6. Verify and report

Run checks relevant to the selected packages and changed surfaces. At minimum, run selected package builds, tests, and typechecks; run `bun run parity:components` when core or component wiring changed. Run the docs build when docs, component exports, or CSS imports changed. Inspect built `dist` output for changed exports and CSS; use a browser check for visual or interactive behavior changes. Run root `bun run build:all`, `bun run test`, and `bun run typecheck` when syncing both packages. Resolve regressions caused by this update, then check `git diff --check` and the final scoped diff. If verification is paused, do not run tests or other verification commands and leave their status pending.

Report old and new versions, each mapping row's disposition, affected React and art APIs, retained/deprecated/removed APIs and migration rationale, actual or proposed deprecation versions and removal thresholds with the release history supporting them, and checks with their outcomes. Separate completed checks from `NOT_RUN` and `BLOCKED` work. Do not claim full parity while any row remains unresolved or evidence is unverified, or claim a complete sync while required verification remains pending. Do not publish or change this repo's release version as part of a dependency sync unless requested.

Report dependency updates, component inventory coverage, design/markup alignment, interaction/accessibility alignment, docs/demo coverage, and runtime verification separately. State which target families have not received the required contract review. Use `PARTIAL` when any required gap is deferred, retained as a divergent compatibility adapter, blocked, or unknown; use `IMPLEMENTED_UNVERIFIED` when all required source changes are implemented but validation is pending. Claim complete design synchronization only when every selected target family has been reviewed, required contract gaps are resolved, and required checks pass. Do not describe a version bump plus new wrappers as a complete design sync.
