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
