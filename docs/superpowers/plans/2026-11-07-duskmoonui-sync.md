# Core 1.21.0 and React 0.5.7 patch release

Status: **RELEASED 0.5.7; broader design synchronization remains PARTIAL**.
The user explicitly selected Core **1.21.0**, already adopted by React 0.5.6.
This patch preserves that target, refreshes the fixed-version release metadata,
and corrects stale workspace versions in the lockfile. It introduces no new
upstream dependency version, component API, or deprecation.

## Scope and exact evidence

- Work remains on the existing `main` checkout. Release commit and public tag
  `v0.5.7` are `cb2ea1c6711aa71cdb801f0716646075ad614b06`, also verified as
  `origin/main` and both npm packages' `gitHead`.
- Components development and docs dependencies remain exactly Core `1.21.0`;
  the component peer floor remains `>=1.21.0`. Art development remains exactly
  CSS Art `1.21.0`, with its existing `>=1.17.0` peer floor.
- Published Core metadata identifies `duskmoon-dev/duskmoonui`, directory
  `packages/core`. The verified `v1.21.0` source tag resolves to
  `aec8d8be47ae7aac2731865f572a14698b34c58a`; registry `gitHead` is separately
  `f20555b5c7c891b33ad201ce9f45ca88c9fd0305`. There is no old-to-new Core
  package delta in this patch.
- [The November 5 mapping](2026-11-05-duskmoonui-sync.md),
  [Core family contracts](2026-11-05-duskmoonui-core-contracts.md), and
  [Art family contracts](2026-11-05-duskmoonui-art-contracts.md) contain the
  target-version source inventory and five-part family review: 84 concrete
  Core component CSS families and 15 React art wrappers. They also retain
  divergent adapters, missing evidence, and unexecuted family runtime tasks.
  Those findings are not promoted to PASS by this patch release.
- Existing Composer Plan 02 implementation, optional Lexical dependencies,
  browser CI additions, docs, fixtures, and the supplied `dsh-composer-plans/`
  remain outside the release commit. The patch contains only 11 reviewed
  release metadata, changelog, generated-version, and lockfile files.

## Change dispositions

| Target                          | Category   | Old/new contract and evidence                                                                                                      | Affected local surfaces                                        | Action | Compatibility or migration reason                                                                                       | Verification/evidence status                               |
| ------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Core dependency                 | design     | 1.21.0 to 1.21.0; user selected the already-adopted published target                                                               | Components/docs manifests and bundled CSS                      | retain | No new dependency version or wrapper adaptation is required by this target selection                                    | Exact package and published manifest evidence PASS         |
| CSS Art dependency              | local-only | 1.21.0 to 1.21.0                                                                                                                   | Art package and styles                                         | retain | Core target clarification does not change Art's upstream contract; Art follows the existing fixed-version release group | Published manifest and art consumer PASS                   |
| Peer compatibility              | design     | Existing Core >=1.21.0 and Art >=1.17.0 floors                                                                                     | Library peer dependencies                                      | retain | No newly required feature changes the supported boundary                                                                | Unchanged in release diff                                  |
| Workspace metadata              | gap        | Nested lockfile workspace entries still recorded 0.5.5 before this release                                                         | bun.lock workspace entries                                     | adapt  | Synchronize them to actual 0.5.7 manifests so frozen installs remain coherent                                           | Frozen install and version check PASS                      |
| Fixed-version release           | local-only | Public React packages 0.5.6 to 0.5.7                                                                                               | Workspace manifests, generated version, changelogs             | adapt  | Explicit patch request and existing Changesets fixed group                                                              | npm packages, GitHub tag/release, and live docs PASS       |
| Existing public APIs            | local-only | Plain string/File[] Composer, optional scope, portable v1 types/helpers and fixtures                                               | Root/chat exports, declarations, SSR, docs                     | retain | Preserve existing consumer behavior and API compatibility                                                               | Legacy browser and strict packaged-consumer checks PASS    |
| Tooltip compatibility           | deprecated | Existing arrow deprecation since stable 0.4.0; earliest same-major removal remains 0.7.0                                           | Existing API, runtime, styles and docs                         | retain | Patch releases do not advance the three-minor deprecation window; no removal authorized                                 | No removal or new deprecation performed                    |
| Neutral surface labels          | gap        | Published Core 1.21.0 retains the previously reproduced Moonlight neutral contrast defect; upstream duskmoonui#78 remains separate | Button/Badge/Tag/Alert neutral labels                          | block  | Upstream policy prohibits replacing a required dependency fix with local color overrides                                | BLOCKED; no claim of complete palette accessibility        |
| Other family contract gaps      | gap        | November 5 family tables retain compatibility adapters and NOT_RUN runtime tasks                                                   | Existing components and demos                                  | retain | Unchanged target does not establish alignment of those independent contracts                                            | PARTIAL; companion tasks remain open                       |
| Separate semantic/rich Composer | local-only | Completed Plan 02 R0-R7, with a minor Changeset for the next feature release                                                       | New semantic controllers, rich entry, peers, docs and fixtures | retain | A Core patch must not absorb an unpublished additive feature cohort                                                     | Validated and committed separately from 0.5.7; unpublished |

## Patch verification and public delivery

The release was built and tested from an exported clean release snapshot at
`/tmp/duskmoon-core-patch-20261107-7mzdwqdk`, without a new branch or Git worktree.
It contains the committed patch source, excluding the separate feature cohort.

- Full package/docs/Next build, root typecheck, frozen install, synchronized
  version check, **628 component tests + 9 art tests**, strict **113/113**
  public-target parity, and **10 Chromium Composer tests** passed.
- Hosted CI passes Build, Test, Typecheck, Format, Publish Dry Run, and the
  Chromium Composer/surface job. Full Lint retains six baseline errors in
  Button, Megamenu, Modal, and ChatPreviews. The root bundle exceeds the
  existing 120 kB limit; the isolated patch's level-9 gzip size is 136,218
  bytes. Hosted Bundle Size can also fail on the existing `iltorb.node`
  installation. These gates were not weakened or reported as passing.
- [Release run 42263411245](https://github.com/duskmoon-dev/duskmoon-react/actions/runs/42263411245)
  completed successfully on attempt 2. Attempt 1 published both packages but
  its immediate public-availability check encountered delayed registry
  visibility. The rerun used the same version and commit after both exact
  public endpoints became available; no workflow workaround was introduced.
- [GitHub v0.5.7](https://github.com/duskmoon-dev/duskmoon-react/releases/tag/v0.5.7)
  is a published stable release. Both packages are publicly downloadable as
  `@duskmoon-dev/components@0.5.7` and
  `@duskmoon-dev/art-components@0.5.7`.
- Public tarballs were downloaded independently; SHA-512 matches registry
  integrity, and npm/SLSA attestation subjects match those archive digests.
  Provenance identifies the release workflow and exact source commit above.
  Downloaded artifacts and metadata are under
  `/tmp/duskmoon-react-patch-public-20261107-YT9V29/`.
- Cryptographic `npm audit signatures` could not finish: Sigstore's
  `https://tuf-repo-cdn.sigstore.dev/17.root.json` returned HTTP 503 on all
  three npm fetch attempts. Attestation presence and source/digest matching
  are verified; successful cryptographic signature verification is not claimed.
- A fresh consumer outside the repository installed the public versions with
  Core/CSS Art 1.21.0 and React 19.2.8. Strict TypeScript with
  `skipLibCheck: false` and repository-compatible Bundler resolution passes.
  Root/chat/art SSR imports, legacy native textarea props/callback types,
  portable JSON contract helpers, exact versions, and exclusion of rich
  exports/optional Lexical peers pass. Evidence is under
  `/tmp/duskmoon-react-057-consumer-9k331f31/`. An exploratory NodeNext check
  rejects the existing extensionless generated declaration imports; NodeNext
  compatibility is not claimed or repaired by this patch.
- [Live Chat docs](https://duskmoon-dev.github.io/duskmoon-react/components/chat/)
  return HTTP 200 with version 0.5.7 and valid assets. Browser hydration,
  accepted submission, and rejected-file draft retention pass without page
  errors. Pages run `42263411136` succeeded.

## Follow-up contract tasks

- **SYNC-121-PATCH — PASS:** retain the selected Core target, synchronize and
  publish 0.5.7, then verify exact public artifacts, source refs, consumer
  behavior, and live docs as above.
- **SYNC-121-NEUTRAL — BLOCKED:** after
  [duskmoonui#78](https://github.com/duskmoon-dev/duskmoonui/issues/78) has a
  published fix, update the authorized Core target. Render real neutral
  Button/Badge/Tag/Alert states in Sunshine and Moonlight and measure their
  computed foreground/background contrast against WCAG AA without overrides.
- _*SYNC-121-FAMILY-* — NOT_RUN:_* retain the independently actionable family
  tasks and exact source references in the November 5 Core/Art tables. Their
  setup, required native behavior, keyboard/focus outcomes, and browser
  validation remain necessary before a complete design-sync claim.

Dependency adoption, existing package inventory, scoped compatibility, npm
publication, provenance-source matching, and live docs are verified. Complete
family interaction/accessibility alignment and all broader demo scenarios are
not established. The Core contrast blocker and baseline lint/bundle gates
remain visible; the authorized **0.5.7 patch release is complete**.

---

# Follow-up: Core 1.21.1 Chat integration

Status: **Core dependency and changed Chat integration VERIFIED; broader design synchronization remains PARTIAL.** This
follow-up is separate from the historical patch release above. Current React
version is 0.6.0 at `71669207f8ce60cfc9a2a3368b2c305e106ef7bc`. The user requested
a Core upgrade and review against the local Core Chat documentation. This does
not change React release versions or publish packages. CSS Art stays 1.21.0.
Work remains on the current `main` checkout; supplied `dsh-composer-plans/`
is preserved.

## Exact target and source review

- Published npm tarballs for Core 1.21.0 and 1.21.1 were downloaded and checked
  against their registry SHA-512 integrity. Evidence is under
  `/tmp/duskmoon-react-core1211-20261107-sm261iy7`.
- Core 1.21.1 registry metadata identifies `duskmoon-dev/duskmoonui`, directory
  `packages/core`, registry gitHead
  `d49836badf6bd0963fc31c6e86aede468f5b1b93`. Its dereferenced source tag and
  the local documentation checkout resolve to
  `a5dcf320b292dea368a3bb03a32d2d8fd8778aed`.
- Both packages contain 295 files and the same 101 export paths. Only Chat
  component CSS/ESM, aggregate/standalone artifacts, README and package metadata
  change. The 83 other concrete component styles, five themes, five effects and
  base CSS are byte-identical. The full 84-component-plus-aggregate five-part source
  review and retained family gaps are in the
  [1.21.1 contract ledger](2026-11-07-duskmoonui-core-1.21.1-contracts.md).
- The user's reference is
  <http://localhost:4321/duskmoonui/docs/en/components/chat/>. Its source is
  `packages/docs/src/content/docs/en/components/chat.mdx`, with the compact
  demo in `packages/docs/src/components/showcase/ChatComposerDemo.astro`.
  Documentation still calls compact selectors development changes, but the
  verified 1.21.1 package includes them. Published bytes establish availability.

## Change dispositions before implementation

| Target                      | Category   | Old/new contract and evidence                                                                                                       | Affected local surfaces                               | Action | Compatibility or migration reason                                                                                                                   | Verification/evidence status                                              |
| --------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Core dependency             | design     | Exact 1.21.0 to published 1.21.1; verified tarballs and source tag                                                                  | Components/docs manifests, bun.lock, bundled CSS      | adapt  | Adopt the requested published Core fixes; Art remains outside scope                                                                                 | Frozen install, exact resolution, package build and CSS prefix PASS       |
| Editor sizing               | design     | chat.css editor minimum 3rem to 1lh, field-sizing:content, resize:none                                                              | Plain/rich adapters, local CSS bounds, primitives     | adapt  | Consume Core surface sizing; retain numeric minRows/maxRows fallback because it is a public React contract                                          | Plain/rich/native size, growth, cap and shrink browser checks PASS        |
| Compact toolbar             | added      | chat.css:964-990 opts into nowrap toolbar/actions/config controls                                                                   | Shared ComposerShell, legacy/session/rich props, docs | add    | New optional compact prop; default layout, custom children, labels, root refs and independent Stop/Send remain usable                               | Unit and Chromium compact/default behavior PASS                           |
| Image thumbnails            | added      | chat.css:992-1022 supplies horizontal rail, 5.5rem tile and remove control                                                          | Shared attachment presentation and docs               | add    | Use tiles only for simple ready images; retain metadata rows for mixed files, progress, retries, cancellation, restored or custom entries           | Native previews/removal, URL cleanup and narrow strip PASS                |
| Preview image class         | design     | Existing direct attachment img is styled in both versions; tile selectors require chat-composer-preview                             | Both shell preview paths                              | adapt  | Add canonical class; do not misreport the old direct-img styling as a gap                                                                           | Source agreement and real image preview PASS                              |
| Attachment progress         | gap        | Chat docs recommend existing Core progress class; current native progress omits it                                                  | Shared ComposerShell                                  | adapt  | Preserve native values, accessible name and attachment occurrence ownership                                                                         | Compact lifecycle unit tests and default browser lifecycle PASS           |
| Native settings menus       | added      | chat.css:1024-1073 composes native popover/menu fields; docs sample choices are illustrative                                        | Focused executable compact docs composition           | add    | Compose host-owned settings with native invoker/anchor/dismissal; do not hardcode model or approval policy into generic Composer                    | Native open, Escape/light-dismiss, focus, bounds and acknowledgment PASS  |
| Core peer floor             | design     | New compact selectors absent in 1.21.0 and present in 1.21.1                                                                        | Components peer dependency                            | adapt  | New opt-in public presentation requires 1.21.1; raise only Core floor to >=1.21.1                                                                   | Selector comparison, nearest 1.21.1 resolution and peer floor PASS        |
| Host lifecycle and keyboard | local-only | React owns editing; host owns admission, settings, queue, draft storage and execution; Core docs allow host shortcut policy         | Session/legacy/rich, queue/settings/draft controllers | retain | Preserve Enter newline/default Ctrl/Cmd+Enter, IME gating, unknown recovery, revision-safe clearing and independent Stop/Send                       | 755 component tests and scoped Chromium lifecycle suite PASS              |
| Rich atomic markup          | gap        | chat.mdx:271 prescribes contenteditable=false; Lexical token TextNode DOM slots remain editable for native range/clipboard behavior | rich/nodes.ts and rich browser suite                  | retain | Unresolved source-contract conflict; blindly changing editable attributes would risk existing native editing. No workaround or full-alignment claim | CONFLICT; native behavior coverage exists, target resolution remains open |
| Other target families       | gap        | Companion ledger reviews unchanged target contracts and retains native/ARIA/runtime gaps                                            | Existing components, styles, demos                    | retain | This Chat-only upstream delta does not resolve unrelated adapter/runtime contracts                                                                  | ALIGNED_SOURCE where evidenced; remaining tasks NOT_RUN                   |
| Neutral contrast            | gap        | Core 1.21.1 Chat-only delta does not fix duskmoonui#78                                                                              | Neutral Button/Badge/Tag/Alert                        | block  | Required upstream palette repair remains separate; no local color workaround                                                                        | BLOCKED                                                                   |
| Tooltip compatibility       | deprecated | Published stable React 0.4.0 deprecates arrow; 0.5.0/0.6.0 published, earliest removal 0.7.0                                        | Tooltip public API/styles/docs                        | retain | Preserve the published three-minor window; no removal is requested                                                                                  | Published 0.4.0 tarball/release history verified in companion ledger      |

## Executable integration tasks

Additional local difference reproduced before its adaptation: the Lexical
adapter generates paragraph blocks whose browser-default margins keep an empty
editor at 52.5px despite Core's new 22.5px minimum. The rich adapter also accepts
the shared minRows/maxRows props without applying them. This is adapter-owned
DOM and sizing, rather than a change to Core CSS or the atom contract.

| Target                        | Category | Old/new contract and evidence                                                                                       | Affected local surfaces                                 | Action | Compatibility or migration reason                                                                                                           | Verification/evidence status                                                          |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Rich paragraph and row sizing | gap      | Browser reproduces 52.5px empty height from 15px paragraph margins; LexicalEditor ignores shared numeric row bounds | rich/LexicalEditor.tsx and adapter-scoped paragraph CSS | adapt  | Normalize only generated rich paragraphs and apply the existing public row limits without changing selection, history or atomic-node markup | Reproduced first; empty/multiline/clear and custom numeric bounds browser checks PASS |

The focused tasks below have executed; companion family tasks retain their independent statuses.

- **CHAT-1211-SIZE — PASS:** render actual plain/rich composers and primitive textarea
  with Core 1.21.1. Check compact empty height, multiline growth, public row cap,
  scrolling and shrink. Check Enter, Ctrl/Cmd+Enter and composition gating.
- **CHAT-1211-COMPACT — PASS:** render default and compact package components, custom
  actions and independent Stop/Send. At 320px and desktop in Sunshine/Moonlight
  and LTR/RTL, assert controls do not overlap or create page overflow and the
  configuration label can shrink. Verify unchanged default accessible labels.
- **CHAT-1211-MEDIA — PASS:** attach real images and files. Verify the simple-image
  strip precedes the editor and remains bounded/horizontally scrollable;
  removal revokes local object URLs. Mixed files and preparing/error/retry/cancel
  states retain complete named controls and visible messages.
- **CHAT-1211-MENU — PASS:** activate the real native settings invoker, choose a host
  setting, observe acknowledged state, dismiss by Escape/outside click and
  verify focus return and viewport-bounded positioning.
- **CHAT-1211-LIFECYCLE — PASS:** rerun actual package tests and browser suites for
  legacy/session/rich editing, scoped admission, recovery, attachments and
  settings; retain native atom cut/replacement/undo coverage. Synthetic
  composition checks do not establish real operating-system IME behavior.
- **CHAT-1211-PACKAGE — PASS:** verify frozen install and nearest Core resolution;
  run component tests/build/typecheck, strict public-target parity and docs
  build. Inspect built CSS for the new selectors and rich default sizing;
  keep the local dev server available with verified pages/assets.

The companion `C121-*` tasks remain independently actionable for every reviewed
family. Broad design synchronization is **PARTIAL** while their retained gaps,
the rich-atom conflict, upstream contrast blocker or required runtime checks
remain unresolved.

## Integrated results and review server

- Frozen `bun install`, exact nearest Core **1.21.1** resolution in both
  components/docs, and unchanged CSS Art **1.21.0** pins passed.
- Component build and typecheck passed, along with **755 tests / 3,118
  assertions**. Strict public-target parity is **117/117**. Documentation
  library checks passed **105 tests / 531 assertions**; the docs build emits
  **164 pages**.
- The final combined legacy/rich/compact Chromium suite passed **27 tests**,
  including six compact acceptance cases and explicit custom rich row bounds.
  Tests exercise
  actual native clipboard/range/undo behavior, scoped admission/recovery,
  attachment preparation/retry/removal, accepted/rejected host settings,
  Escape/outside dismissal, and compact 320px/desktop, LTR/RTL and both themes.
- Rich paragraph margins are normalized only inside the Lexical editor, and
  shared numeric minRows/maxRows now constrain its intrinsic content height.
  Actual empty/plain editor height is 24px; rich is 22.5px, versus its prior
  52.5px. The focused demo's single-line shells measure 98px plain and 96.5px
  rich. The native primitive grows to its upstream 256px cap, scrolls, then
  shrinks to 22.5px. Tests also verify a three-row minimum and four-row maximum
  from fractional public props.
- Fresh `dist/styles.css` is exactly the installed Core CSS followed by local
  styles (**758,224 bytes**). All new compact/menu/thumbnail selectors and both
  public compact declarations exist. npm pack dry-run includes CSS, declarations
  and the optional rich entry in the unchanged React **0.6.0** package.
- Scoped ESLint/Prettier pass. The first typecheck found a test selector inferred
  as Element instead of HTMLElement; explicit querySelector typing fixed it.
  Initial browser checks reproduced the rich paragraph gap. Later harness
  adjustments centered controls clear of the docs sticky header and clicked
  exposed editor space outside the overlapping native menu; no force clicks,
  weakened assertions or production dismiss/position workarounds were used.
- Local dev remains at <http://localhost:4334/components/chat/> (owned Astro
  daemon PID 124317). The first demo is **Compact Composer and Model Menu**;
  switch its rich-editor checkbox to compare adapters. Main Chat and all four
  Composer routes return HTTP 200, hydrate, and load assets without page errors
  or failed requests. Screenshots and machine-readable UI evidence are in the
  evidence directory above. The user's upstream docs server is untouched.
- This run does not rerun real OS IME, other browser engines, full-repository
  lint or the bundle budget. Existing IME coverage and characterized 0.6.0
  lint/size limits are historical evidence, not a new PASS. The unchanged rich
  atom markup conflict, upstream neutral contrast blocker, retained family
  adapter gaps and unexecuted C121 tasks keep the broader design sync PARTIAL.

No new public removal/deprecation or Art API change is introduced. The optional
compact prop preserves the default layouts and caller labels/actions; lifecycle
rows retain diagnostic and retry/cancel controls. This follow-up leaves React
release versions at 0.6.0 and prepares local changes for UI review.

---

# Follow-up: compact documentation Appbar

Status: **Scoped documentation Appbar implementation and verification PASS; broader Core design synchronization remains PARTIAL.**
The user requested a smaller Appbar matching Core while reviewing Chat. The
reproduced issue is the shared docs header, so this follow-up changes the docs
shell across all routes. Core stays 1.21.1; React stays 0.6.0. Existing Chat
changes and the supplied plans are preserved. No public component API, release,
branch or worktree is introduced.

## Source contract and before measurements

Installed and version-tagged Core 1.21.1 Appbar CSS agree byte-for-byte.
`packages/core/src/components/appbar.css:8` defines the flex Appbar; `:205-220`
provides a 3rem compact variant with 2rem icon controls and no vertical padding;
`:35` provides sticky positioning, `:314` primary styling, and `:639` narrow
horizontal padding. The tagged Appbar docs require the base class while size,
position and sections remain composition choices. Source `appbar.ts` contains
older object styles; the published CSS/ESM generated from CSS is authoritative.

Upstream docs `packages/docs/src/layouts/DocsLayout.astro:83-120` collapses links
into a native auto Popover below 1280px, updates expanded state, handles focus
at breakpoints, and closes on navigation. Its own 64/72px header padding is a
site choice, distinct from the documented compact Appbar variant.

The current React `.site-header` uses a separate padded grid; below 800px its
brand, navigation and theme control occupy separate rows. Actual heights are
66px at 1440px, 136px at 800/390px, and 164px at 320px. Core docs retain one row
at those widths. Evidence/screenshots are under
`/tmp/duskmoon-react-appbar-20261107-uicreprd`.

| Target                 | Category   | Old/new contract and evidence                                                                     | Affected local surfaces                                | Action | Compatibility or migration reason                                                                                            | Verification/evidence status                                           |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Shared header anatomy  | design     | Padded grid vs Core appbar/appbar-compact/appbar-primary/appbar-sticky                            | DocsLayout.astro, docs.css                             | adapt  | Use existing 48px Core styling across routes; preserve brand link/version and sticky navigation                              | Before/after geometry, both themes and 320-1440px PASS                 |
| Responsive navigation  | behavior   | Current links wrap into extra header rows; Core docs use native auto Popover below 1280px         | Shared Primary navigation and responsive controller    | adapt  | Keep ordinary named links/current-page semantics, native dismissal/focus, and usable no-JS links; no ARIA menu/toolbar roles | Native keyboard/dismissal, breakpoint focus, navigation and no-JS PASS |
| Theme action           | design     | Full-width text button below 800px vs Core compact icon action                                    | Existing theme toggle and localStorage synchronization | adapt  | Preserve stored Sunshine/Moonlight choice and expose an explicit action name/title with decorative SVG                       | Accessible action, stored theme and navigation persistence PASS        |
| Layout offsets         | design     | Sidebar/anchor offsets assume the older header height                                             | Shared docs.css sidebar and section offsets            | adapt  | Derive offsets from the 3rem header size without per-page overrides                                                          | Scrolled header/sidebar and section-anchor browser checks PASS         |
| Public Appbar surfaces | local-only | ConsolePage.Appbar already forwards Core classes/native props; no standalone React Appbar wrapper | Existing public exports/components                     | retain | This is a docs-shell request; no public default/API or export changes are necessary                                          | Source review complete; broader C121-APPBAR remains separate           |

Five-part review for this scoped composition: design and markup have confirmed
gaps mapped above; interaction/accessibility pass the focused native runtime checks;
local compatibility retains routes, primary labels, active section, version and
theme persistence. The full Core family inventory remains in the companion
ledger; this docs composition does not complete the standalone Appbar family.

- **APPBAR-DOCS-SIZE — PASS:** at 320/390/800/1280/1440px and both themes,
  verify a 48px single header row, visible version/actions, no overlap or page
  overflow, and sticky placement while scrolling.
- **APPBAR-DOCS-NAV — PASS:** use the native menu from keyboard and pointer;
  verify expanded state, link/current-section behavior, Escape/outside dismissal,
  focus return and viewport-bounded menu. Resize across the breakpoint with
  focus on the trigger or a link, and check mobile links without JavaScript.
- **APPBAR-DOCS-THEME — PASS:** change theme from the icon action, verify its
  accessible name, stored preference and survival across section navigation.
- **APPBAR-DOCS-BUILD — PASS:** build docs, inspect actual generated markup,
  run focused navigation/header browser checks and final diff/format checks.

## Actual scoped results

- The shared header now uses published Core compact/primary/sticky Appbar
  styling. Header height is **48px** at 320, 390, 800, 1280 and 1440px, versus
  164px, 136px, 136px, 66px and 66px previously. Icon targets remain 32px; brand,
  version and actions fit without horizontal overflow. JavaScript-disabled
  navigation intentionally retains wrapping ordinary links rather than hiding
  the routes.
- Below 1280px, existing primary links move into the native anchored dropdown.
  Escape/outside dismissal, aria-expanded, keyboard Tab order, link activation
  and focus preservation when crossing the breakpoint pass. Current section,
  accessible theme action and localStorage preference persist across routes.
- **15 Chromium checks pass**: six Appbar cases, three relevant shared-navigation
  cases and six existing compact Chat regressions. Both themes pass focused
  Axe checks; sticky/anchor geometry, no-JS route access and actual saved-theme
  behavior are exercised. The initial placement assertion assumed the menu
  began below the full header; it now checks the published dropdown's trigger
  anchor after its opening animation, without changing Core placement CSS.
- Docs build passes and emits **164 pages**. Built Chat HTML contains Core
  Appbar classes, the shared primary navigation ID, accessible theme action and
  compiled responsive controller. Scoped ESLint/Prettier and final whitespace
  checks pass. No component package code/API or dependency versions change in
  this follow-up; component suites and unrelated full-repository checks are
  not rerun for the docs-only update.
- The updated local Chat page returns 200, loads assets and initializes without
  page errors or failed requests. The existing dev server stays available at
  <http://localhost:4334/components/chat/>. Exact before/after measurements and
  desktop/mobile/theme screenshots are in the evidence directory above.

The standalone Appbar family API/variant tasks in the companion audit remain
separate. Existing Chat work, public component defaults and supplied plans are
preserved. This follow-up is a local shared-documentation-shell fix for review.

## Follow-up: Core theme preference dropdown

The user requested the Core-style theme dropdown in the compact Appbar. The
verified Core checkout is at tag `v1.21.1`, commit
`a5dcf320b292dea368a3bb03a32d2d8fd8778aed`. Its docs
`packages/docs/src/components/ui/ThemeToggle.tsx` compose a native auto Popover
and an accessible radio group with Auto (system), Light and Dark preferences.
The published Core 1.21.1 `dist/components/dropdown.css` and
`dist/components/theme-controller.css` provide the anchored panel, hidden native
radios, checked label styling and visible keyboard focus. This docs composition
supersedes the two-state icon action above; the compact Appbar remains 48px.

| Target                      | Category | Old/new contract and evidence                                                                                   | Affected local surfaces                              | Action | Compatibility or migration reason                                                                                                   | Verification/evidence status |
| --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Theme preference disclosure | behavior | Current icon immediately toggles; versioned Core docs open an independent auto Popover with a named radio group | DocsLayout.astro, docs.css, Appbar browser tests     | adapt  | Keep the compact icon trigger while exposing all three choices; native dismissal and focus return                                   | PASS                         |
| Preference resolution       | behavior | Current stored Sunshine/Moonlight choice vs Core Auto/system, Light and Dark                                    | Initial theme script and theme preference controller | adapt  | Preserve the existing duskmoon-docs-theme storage key and saved explicit themes; default to Auto and follow OS changes only in Auto | PASS                         |
| Shared theme test consumers | gap      | Existing form checks click the old Light toggle                                                                 | json-form-style.test.ts                              | adapt  | Select Dark from the real dropdown before checking rendered form surfaces                                                           | PASS                         |

- **APPBAR-DOCS-THEME-DROPDOWN — PASS:** select each radio, verify checked
  state, actual theme, trigger name/icon, stored preference, closing and focus
  return; restore the preference on reload and across sections.
- **APPBAR-DOCS-THEME-AUTO — PASS:** check initial system preference and
  live system changes in Auto, manual mode independence, saved explicit theme
  compatibility, invalid storage and unavailable storage.
- **APPBAR-DOCS-THEME-NATIVE — PASS:** verify keyboard radio selection,
  Escape/outside dismissal, expanded state, independent navigation disclosure,
  320px LTR/RTL bounds, focused accessibility and retained 48px Appbar.
- **APPBAR-DOCS-THEME-BUILD — PASS:** build docs, inspect generated panel
  markup and run scoped checks/final diff inspection.

Actual results for this follow-up:

- All **16 focused Chromium tests pass against the built docs**: eleven Appbar
  cases, three shared navigation cases and two form theme consumers. This includes
  all three preference choices, checked state and matching current-mode icon,
  keyboard radio selection, closing/focus return, native light dismissal and
  independent navigation, reload/section persistence, live OS changes only in
  Auto, saved legacy themes, invalid preferences, and unavailable localStorage.
- Theme dropdown and header pass focused Axe checks in Sunshine/Moonlight and
  320px LTR/RTL. Header remains 48px across 320/390/800/1280/1440px and menu
  placement uses Core's existing native anchor styling.
- Docs build passes with **164 pages**; generated Chat HTML contains the named
  radio group, auto Popover, three option values and initial preference script.
  Scoped ESLint/Prettier and final whitespace checks pass.
- The initial dev-server run passed ten of eleven cases. The full storage-denial
  case exposed an unrelated Astro dev toolbar error: its `getSettings` reads
  `astro:dev-toolbar:settings` without handling denied localStorage. No toolbar
  workaround or test weakening was introduced. The same unmodified denial test
  passes on the production build, along with the other fifteen checks.
- The normal live dev page at <http://localhost:4334/components/chat/> returns
  200, retains the 48px header and has no page errors or failed requests. Existing
  dev server stays running for UI review. Temporary production preview was used
  only for verification. Evidence and screenshots:
  `/tmp/duskmoon-react-theme-dropdown-20261107-0vwfabz2/`.

Only shared docs layout/styles, their scoped browser consumers and this mapping
change in this follow-up. Component code, dependency pins and release versions
remain as before; the broader Core synchronization remains PARTIAL.

## Follow-up: compact session controls and one editor focus surface

The user reported the crowded authoritative-queue/session demo controls and the
inner editor focus ring/background, and requested the current Core UI composition.
The local Core docs remain at verified v1.21.1 commit
`a5dcf320b292dea368a3bb03a32d2d8fd8778aed`.
`ChatComposerDemo.astro` and `chat.mdx` use dedicated native editor classes,
compact icon actions, anchored native popovers, and disclosure for help/settings.
Published `chat.css:732-758` keeps the inner editor borderless/transparent and
puts focus on the outer composer. Browser reproduction identifies the local
`Input.TextArea` adapter's `.textarea:hover`/`:focus-visible` as the unwanted
background and ring. Core's native usage has no such collision, so this is a
local integration fix, not an upstream workaround.

| Target                 | Category | Old/new contract and evidence                                                                                                         | Affected local surfaces                                      | Action | Compatibility or migration reason                                                                                                             | Verification/evidence status |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Native editor surface  | gap      | Dedicated Core textarea vs React standalone Input.TextArea classes supplying hover/focus effects                                      | PlainEditor.tsx, native/session browser coverage             | adapt  | Use the dedicated native editor; retain controlled input, ARIA/events, sizing, composition and optional character count                       | PASS                         |
| Session demo actions   | design   | Inline simulation controls, text actions and diagnostics vs Core compact icon controls/native disclosure                              | ChatSessionPreviews.tsx, docs.css, browser consumers         | adapt  | Keep existing host actions and accessible names; disclose simulation options, help and diagnostic output instead of reserving page space      | PASS                         |
| Optional draft actions | design   | Raw text buttons and routine host-storage prose vs named icon actions in compact presentation                                         | DraftLifecycle.tsx, SemanticComposer.tsx                     | adapt  | Preserve explicit saving/restoration, errors, incompatible-draft confirmation and default presentation                                        | PASS                         |
| Waiting row actions    | gap      | Core chat.mdx waiting-row example uses named square icons; local authoritative rows and save/cancel controls still render text labels | ChatAuthoritativeQueue.tsx, queue browser/component coverage | adapt  | Preserve action names, mutation callbacks and host acknowledgments; compose the existing Core button classes with decorative icons and titles | PASS                         |
| Focused compact demo   | design   | Always-visible editor switch, long instructions and host details vs Core settings/help disclosures                                    | CompactComposerPreview, browser consumers                    | adapt  | Keep host-acknowledged model choices and editor switching; put secondary information in native popovers                                       | PASS                         |

- **CHAT-EDITOR-FOCUS — PASS:** pointer/keyboard hover/focus in legacy,
  semantic and rich editors, Sunshine/Moonlight, error/read-only/disabled states;
  no inner ring/border/background change, outer composer focus remains visible.
- **CHAT-DEMO-CONTROLS — PASS:** exercise all existing actions and settings,
  disclosure keyboard/dismissal/focus, 320px LTR/RTL bounds, both themes and Axe.
- **CHAT-COMPACT-DRAFT — PASS:** explicit save/reload/remount, preparation
  failure/retry and incompatible-draft protection remain functional.
- **CHAT-DEMO-INTEGRATION — PASS:** focused component/browser suites,
  component build/typecheck, docs build and scoped final diff/style checks.

Actual evidence for this follow-up:

- The dedicated native textarea uses only `.chat-composer-editor` plus caller
  classes. Computed Sunshine/Moonlight styles stay transparent, borderless,
  without outline or inner shadow through hover, pointer and keyboard focus.
  Legacy, semantic and rich editors retain outer Composer focus styling in normal,
  error and supported read-only/disabled states. Native disabled controls retain
  their disabled semantics; rich noneditable surfaces are also checked with actual
  pointer and Tab navigation.
- The authoritative session demo's initial desktop height is 184.5px, down from
  671px. All initial action buttons have decorative icons, accessible names and
  titles. Controls, help, model settings, portable document and host diagnostics
  use native disclosures. Settings/help/inspector panels fit 320px LTR/RTL in both
  themes and pass focused Axe checks. Initial demo widths at 320/390/1440px do not
  overflow their container.
- 55 focused component tests / 272 assertions pass, including native props and
  character count, compact explicit save/reload, incompatible draft protection and
  authoritative queue mutations. Component typecheck/build, 117/117 public target
  parity, scoped ESLint/Prettier and final whitespace review pass.
- 31 distinct Chromium contracts pass: 20 cases in the integration run, the seven
  remaining rich contracts after correcting the disclosed host-state locator, and
  four focused controls/focus contracts. Coverage includes compact growth and
  shrink, legacy editing/IME guards, native files/clipboard/range/undo, provider and
  command outcomes, admission/recovery, preparation retry, draft remount, icon
  queue edit/cancel/save/steer/remove with host acknowledgments, native disclosure
  keyboard/dismissal/focus return, model rejection and viewport/accessibility.
  A separate browser probe verifies the disclosed `/review` action, running Steer
  setting and icon save/reload against the actual in-memory host.
- Browser helpers account for the native Popover closing transition via
  `:popover-open` and wait for dismissal. The host summary now also appears inside
  the inspector, so its original outcome assertion selects the exposed status
  role rather than an ambiguous duplicate text match. Both corrections preserve
  the underlying event and host-state assertions.
- Production docs build passes with 164 pages. Generated Chat markup contains
  three dedicated native editors, nine native group popovers and seven named
  disclosure triggers; the fresh component CSS contains the Core editor rules.
  The local dev Chat page returns 200 with no page errors or failed requests.
  Its focused compact editor has transparent background, no outline and no
  shadow. The existing dev server remains available for review at
  <http://localhost:4334/components/chat/>.

Only the mapped Chat integration, demos, related checks and this mapping change
in this follow-up. Existing unrelated changes and supplied plans are preserved.
Dependency/release versions remain as before. Broader Core synchronization remains
PARTIAL for the previously recorded family gaps and rich atom contract conflict.
Evidence: `/tmp/duskmoon-react-session-controls-20261107-1es8qbvt/`.

## User-reference correction: compact composer hierarchy

The user's supplied screenshots require the Core compact composition, not a
separate debug toolbar or routine draft status rows. The previous icon conversion
retained those rows and therefore did not meet the requested layout. Source:
verified Core v1.21.1 `ChatComposerDemo.astro`, plus the user's five composer/menu
screenshots supplied on 2026-11-07.

| Target               | Category | Old/new contract and evidence                                                                | Affected local surfaces                                | Action | Compatibility or migration reason                                                                                        | Verification/evidence status |
| -------------------- | -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Add disclosure       | design   | One + menu contains files and secondary actions, rather than permanent debug/draft buttons   | ComposerShell, composer props, DraftLifecycle, docs    | adapt  | Add optional menu content; preserve native file intake, explicit draft lifecycle and visible recovery errors             | PASS                         |
| Compact footer       | design   | Normal composer has editor and a single footer; routine status stays out of layout           | DraftLifecycle, SemanticComposer, ComposerShell        | adapt  | Keep errors/recovery actionable and defaults compatible; compact send/stop shares one state-dependent primary action     | PASS                         |
| Configuration        | design   | Left approval selector, right model/effort disclosure with model submenu and effort range    | ChatSessionPreviews, scoped docs styles                | adapt  | In-memory host owns acknowledged values; submitted options retain the selected settings, with no real permission changes | PASS                         |
| Reference acceptance | gap      | Initial, saved, running and attached states need visual proof against the supplied reference | Component and Chromium checks, screenshots, docs build | adapt  | Verify visible hierarchy and actual menu/host outcomes rather than icon presence alone                                   | PASS                         |

- Attachments precede the editor. The compact footer exposes only Add, approval,
  model/effort and one primary action. Files, explicit draft save/reload, help,
  simulation controls and diagnostics are disclosed from Add. Approval descriptions,
  the selected model, effort range and reset use native Core menus. The demo host
  serializes and acknowledges model/effort/approval changes; its settings enter
  submitted options without changing any real system permissions.
- Compact pending admission uses a passive screen-reader status, avoiding hidden
  summary/buttons in the tab order. Storage failures, late/incompatible drafts,
  unknown outcomes and deliberate recovery/overwrite remain visible. Default
  noncompact controls and independent host Stop behavior remain available.
- The footer composition preserves the mounted editor during draft save/reload.
  DraftLifecycle uses a qualified `draft-${generation}` key so it cannot collide
  with the sibling editor's numeric generation. Selecting a model returns focus
  to its parent settings panel while its trigger is temporarily disabled.
- **56 component tests / 280 assertions pass** across ChatComposer,
  ChatSessionComposer and ChatAuthoritativeQueue, including stable editor identity
  during saving, the single primary action and pending-to-unknown recovery.
- **33 distinct Chromium cases pass in the final integrated run**, covering legacy,
  semantic/rich and compact editing, clipboard/undo, scope safety, admission,
  attachment preparation/retry, queue/settings acknowledgments and native menus.
  Four reference cases exercise the actual native Files chooser, unchanged footer
  after save/reload/running/attachment, model rejection and effort reset, keyboard
  focus, and 320/390/1440px LTR/RTL in Sunshine/Moonlight with Axe checks. Native,
  semantic and rich inner editor surfaces remain invariant under hover/focus.
- Component build/typecheck, strict docs-preview TypeScript, 117/117 public-target
  parity, scoped ESLint/Prettier and whitespace checks pass. The docs build emits
  164 pages; inspection of five built Chat/Composer routes, both public `addMenu`
  declarations and published Core compact/menu CSS passes.
- Final private-browser capture measures the rich composer at **96.5px before and
  after saving** at 1440px; earlier capture measured 104.5px in its layout context.
  There is one footer in each case. Menu screenshots wait for native animations:
  all four menu surfaces have opacity 1 and an opaque theme-token background.
  The review route returns HTTP 200 with zero page errors or failed requests.

Evidence: `/tmp/duskmoon-react-composer-reference-20261107-qbbop9id/`, especially
`unit-final.log`, `integrated-browser.log`, `capture-verification.json`,
`built-contracts.json`, `main-verified.png`, `effort-verified.png`,
`approval-verified.png`, `model-verified.png` and `add-verified.png`.

The existing dev daemon remains available at
<http://localhost:4334/components/chat-authoritative-queue>; the normal Chat page
is <http://localhost:4334/components/chat/>. This is a local UI follow-up with no
new commit, publication or version change. Broader Core synchronization remains
**PARTIAL** for the previously recorded family gaps and upstream contract limits;
this acceptance covers the supplied compact Composer references only.

## User-reference follow-up: centered icons and slash picker

The user's corner-button report and slash-menu screenshot supplied on 2026-11-07
define this follow-up. Published Core 1.21.1 supplies the compact completion
popover selectors, positioning fallbacks and theme tokens. React retains the
existing completion/provider controllers and portable Composer contracts.

| Target                  | Category   | Old/new contract and evidence                                                                    | Affected local surfaces                                                | Action | Compatibility or migration reason                                                                                        | Verification/evidence status                                                                          |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Circular button content | gap        | React's 23px inline text box put an 18px SVG 2.5px above center                                  | Local Button content CSS                                               | adapt  | Center the React wrapper without replacing Core button styles                                                            | PASS: measured zero horizontal/vertical center offset                                                 |
| Compact corner actions  | design     | User reference requires equal, smaller Add and Send/Stop actions                                 | Compact toolbar CSS                                                    | adapt  | Scope 28px dimensions to compact footer corners; retain 18px icons                                                       | PASS: Send, Stop and follow-up states                                                                 |
| Completion layer        | design     | Reference shows an equal-width tray above the composer; Core supplies native popover positioning | CompletionList, ComposerShell, ChatComposer, SemanticComposer, CSS     | adapt  | Preserve default noncompact presentation and caller CSS anchor names; propagate native dismissal to existing controllers | PASS: native anchoring, clipping escape, tray-only scrolling, keyboard/focus, viewport and Axe checks |
| Completion presentation | local-only | Rows need icons, descriptions and source labels                                                  | ChatComposerCompletion, ComposerCompletionProvider, completion mapping | add    | Optional React view metadata only; portable candidates, documents and submissions remain unchanged                       | PASS: declarations, built CSS, strict TypeScript and existing protocol/controller tests               |
| Slash host integration  | gap        | Focused demo omitted existing providers; `/` now exposes Commands and Skills                     | CompactComposerPreview, provider descriptions, README                  | adapt  | Default this demo to rich editing; retain selectable plain mode and its capability limits; execution remains host-owned  | PASS: editable skill, claimed command submission and independent host invocation                      |

- **CHAT-ICON-CENTER — PASS:** actual 28x28px Add and Send buttons contain
  centered 18x18px SVGs with zero measured offsets. Circular React content uses
  inline flex instead of an inline text baseline. Core colors and focus rules
  remain authoritative.
- **CHAT-SLASH-PICKER — PASS:** typing `/` opens grouped horizontal rows with
  icons, descriptions and source labels. The native popup matches composer width,
  escapes ancestor clipping and keeps selection visible by scrolling its own tray.
  Filtering, Arrow keys, Enter/Tab selection, disabled-item skipping, Escape and
  outside dismissal retain editor focus and active-descendant behavior. Loading
  and error content stay in the popup. Existing noncompact layout remains usable.
- **CHAT-SLASH-HOST — PASS:** the demo uses its registered in-memory providers.
  `/summarize` inserts editable instructions; `/help` retains command identity
  until submission and produces a command result; `/inspect` invokes its host
  independently. Plain mode supports text skills and independent invocation and
  disables rich-only claimed commands with an explanation. This does not discover
  or execute installed operating-system skills.
- **CHAT-ICONS-SLASH-INTEGRATION — PASS:** 211 Chat tests / 1175 assertions and
  all 38 cases in the final integrated Chromium run pass. The latter includes
  editing, clipboard/undo, attachment preparation/retry, drafts, admission/recovery,
  queue/settings outcomes and both Sunshine/Moonlight at 320/1440px in LTR/RTL.
  Component build/typecheck, strict docs-preview/fixture TypeScript, 117/117
  public-target parity, scoped ESLint/Prettier and whitespace checks pass.
  Production docs build emits 164 pages; changed declaration and CSS outputs
  were inspected. Browser helpers wait for lazy editor readiness before opening
  menus or changing adapters; no retry policy or assertions were weakened.

Actual capture measures a 746px-wide, 218px-high popup above a 746px-wide,
96.5px-high composer, with an 8px gap at 1440px. The Chat route returns HTTP 200
with zero page errors and failed requests. The separately recorded, pre-existing
`favicon.ico` console 404 is outside this follow-up.

Evidence: `/tmp/duskmoon-react-composer-icons-20261107-8025uejb/`, including
`follow-up.diff`, `chat-unit-final.log`, `verified-browser.log`,
`live-verification.json`, `built-contracts.json`, the build/type/style logs,
`icons-final.png` and `slash-final.png`. The focused new coverage is
`test/e2e/chat-composer-slash.test.ts` and `test/e2e/chat-completion.fixture.tsx`.

The existing dev daemon remains at <http://localhost:4334/components/chat/>.
React 0.6.0, Core 1.21.1 and CSS Art 1.21.0 are unchanged. This is an uncommitted
local UI follow-up; it creates no release. Broader Core synchronization remains
**PARTIAL** for the previously recorded family gaps and rich atom conflict.

## User-reference follow-up: shared icon actions and half padding

The user's ordinary Composer and Waiting Queue screenshots require icon actions
throughout those surfaces. The subsequent compact Composer screenshot requests
half the existing outer padding. Published Core 1.21.1 `chat.css` supplies the
original 1rem inset; `button.css` supplies `btn-icon`/`btn-icon-sm`. This follow-up
adapts React presentation and the local demo, with no dependency or release change.

| Target                  | Category   | Old/new contract and evidence                                                                                                  | Affected local surfaces              | Action | Compatibility or migration reason                                                                                                                                      | Verification/evidence status                                                                  |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Shared Composer actions | design     | Ordinary Attach/Send/Stop and attachment Retry/Cancel/Remove still rendered words; user requests icon buttons                  | ComposerShell and component README   | adapt  | Reuse existing decorative SVGs; retain caller labels as accessible names and title hints, native picker, full attachment diagnostics and independent default Stop/Send | PASS                                                                                          |
| Waiting queue controls  | design     | Default queue Steer included text; demo Queue/Steer showed permanent shortcut labels and simulation controls were text buttons | ChatPrimitives, ChatContractPreviews | adapt  | Keep stable IDs, host-owned mutations, disabled/pressed state, form submission and keyboard policy; move action/shortcut descriptions to titles                        | PASS                                                                                          |
| Native icon sizing      | gap        | Native circle markup without icon sizing was 38px; native SVGs then shrank to 14px wide inside a 32px icon button              | Queue actions and local QueueIcon    | adapt  | Use Core's explicit small-icon classes and prevent owned SVGs from shrinking; keep 16px queue glyphs and 18px composer/demo glyphs                                     | PASS: square glyphs, centered icons, 32px ordinary actions and unchanged 28px compact corners |
| Shared outer padding    | local-only | Actual computed inset was 16px on all four sides; user explicitly requests half                                                | Local component CSS                  | adapt  | Set 0.5rem on shared .chat-composer; retain button dimensions, editor surface, internal gap and theme tokens                                                           | PASS: four computed 8px insets                                                                |
| Live chat subpath       | gap        | Dev plugin mapped root/rich imports to source but left /chat SSR cached from an earlier build                                  | Docs Astro source alias              | adapt  | Map the existing /chat entry to its source during serve, using the same convention as the other aliases; production keeps public built imports                         | PASS: matching server/client markup, clean hydration and fresh production SSR                 |

- **CHAT-SHARED-ICONS — PASS:** caller labels/titles, native Files selection,
  attachment-only admission, removal, sending and independent Stop remain usable.
  Queue Enter and Ctrl/Cmd+Enter steering retain their native behavior. Rejected
  actions preserve waiting messages; completion dispatches the oldest item;
  steering, removal and reset show the acknowledged local demo outcomes.
- **CHAT-COMPOSER-DENSITY — PASS:** at 1440px, the compact Composer changes from
  96.5px to 80.5px, the ordinary Composer from 108px to 82px, and the queue
  Composer from 106.5px to 80.5px. All four insets change from 16px to 8px. The
  ordinary reductions also include replacing the taller text buttons. The 8px
  editor/footer gap, 28px compact corners and 18px compact glyphs are unchanged.
- **CHAT-ICON-RESPONSIVE — PASS:** 320/1440px LTR/RTL in Sunshine/Moonlight retain
  bounded composers, centered square glyphs and 32px ordinary icon actions. Axe
  passes at 320px in both directions and themes. The test waits for actual native
  CSS transitions before inspecting settled theme colors; it does not exclude
  any accessibility rule or use retries. A private probe confirms that the model
  label color updates before its button background finishes transitioning.
- **CHAT-ICON-DENSITY-INTEGRATION — PASS:** 211 Chat tests / 1191 assertions;
  component build/typecheck; strict preview/browser TypeScript; 117/117 public
  target parity; scoped ESLint/Prettier and whitespace review. Production docs
  build emits 164 pages. All 38 existing Chromium regressions pass in the combined
  run, and the three new action/density cases pass in the final targeted run.
  The new queue assertion targets the collapsible message body so hidden
  Show-more control text is not mistaken for message content. Fresh built CSS
  exactly equals Core plus local styles (759613 bytes), and the public chat
  output and production HTML contain the current icon controls and hints.

Evidence: `/tmp/duskmoon-react-chat-icon-padding-20261107-r9ggo39h/`, including
`before.json`, `live-verification.json`, `glyph-sizing-probe.json`,
`theme-transitions.json`, `chat-unit-final.log`, `browser-final.log`,
`icon-actions-verified.log`, build/type/style logs and `built-contracts.json`.
The initial stale-SSR failure and subsequent test-selector/transition diagnostics
are preserved separately. `compact-after.png`, `composer-after.png` and
`queue-after.png` show actual final UI. Capture returns HTTP 200 with no page
errors, failed requests or hydration warnings; the pre-existing favicon console
404 remains outside this task. Astro's missing Prettier parser is recorded;
the Astro content compiles in the successful production build.

The existing dev server remains at <http://localhost:4334/components/chat/>.
The change stays in the current checkout with React 0.6.0, Core 1.21.1 and CSS
Art 1.21.0 unchanged. It creates no commit or release and preserves the earlier
working-tree changes. Broader Core synchronization remains **PARTIAL** for the
previously recorded family gaps and rich atom contract conflict.
