# Implementation Tasks

- [x] **Phase 0 — Stabilize the boundary**
  - Add `@duskmoon-dev/core` as a `peerDependency` (and `devDependency` for testing). Pin a range.
  - Move class lookup tables (`{ primary: "btn-primary", ... }`) out of components (like `Button`) and into a single `classes/` module.
  - Land an integration test that imports `@duskmoon-dev/core/components/button` (the CSS-as-string export) and asserts every class name emitted by `getButtonClasses` exists in the parsed CSS.
  - *Exit condition:* `bun test` fails if anyone renames `.btn-error` to `.btn-danger` in either repo.

- [x] **Phase 1 — Fix Button's API shape**
  - Redesign Button props to mirror the CSS axes: `color`, `appearance`, `shape`, `size`, `block`, `isLoading`.
  - Implement `asChild` (Radix Slot pattern) or remove it.
  - `aria-busy`, accessible loading label, focus-visible verification.
  - Decide controlled vs. uncontrolled story.
  - *Exit condition:* every duskmoonui Button class combination is reachable from a typed React prop.

- [x] **Phase 2 — RSC correctness**
  - Drop post-hoc directive injection in favor of per-entrypoint banners.
  - Split build into two entrypoint groups: **server-safe** and **client-only**.
  - Verify with an actual RSC harness in `nextjs-15-smoke`.
  - *Exit condition:* smoke test imports both server-safe and client components in RSC, builds clean, runtime works.

- [x] **Phase 3 — ThemeProvider, aligned with duskmoonui**
  - Theme names come from `@duskmoon-dev/design`'s generated TS — `sunshine | moonlight | ocean | forest`.
  - Single source of truth at runtime: the `data-theme` attribute set by the inline boot script.
  - `setTheme` wrapped in `useCallback`.
  - Export the boot script as a Next.js `<Script strategy="beforeInteractive">` component.
  - *Exit condition:* `nextjs-15-smoke` switches themes with no FOUC, no hydration warnings.

- [ ] **Phase 4 — Codegen pipeline (the multiplier)**
  - Define a component spec format in `duskmoonui` (YAML or TS).
  - Codegen target in `@duskmoon-dev/core`: emit `classes.ts` per component.
  - Codegen `duskmoonMerge` conflict groups.
  - *Exit condition:* renaming a CSS class in duskmoonui triggers a typecheck failure in duskmoon-react.

- [ ] **Phase 5 — Component rollout**
  - Tier 1: pure presentational (Card, Badge, Chip, Divider, Skeleton, Alert, Avatar, Progress).
  - Tier 2: controlled inputs.
  - Tier 3: popovers & overlays.
  - Tier 4: composite.
  - Tier 5: navigational.
  - *Exit condition:* every component has spec + types + tests + smoke test page.

- [ ] **Phase 6 — Docs & release engineering**
  - Pick a docs tool (Astro recommended).
  - Adopt `changesets`.
  - Define version contract.
  - *Exit condition:* new component → PR with changeset → merge → version bumped + changelog + published.

- [ ] **Phase 7 — Quality gates as code**
  - ESLint: `react-hooks`, `jsx-a11y`.
  - Visual regression: Playwright against the smoke test.
  - A11y: `@axe-core/playwright`.
  - Bundle size budget per component subpath export.
  - *Exit condition:* CI catches a11y regressions, bundle bloat, and visual diff before merge.
