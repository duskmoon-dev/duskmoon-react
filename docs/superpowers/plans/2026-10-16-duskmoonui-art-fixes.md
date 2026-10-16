# CSS Art 1.20.7 upstream-fix audit — 2026-10-16

Status: DONE for this bounded CSS Art 1.20.7 follow-up. This follows the full 15-family source review in `2026-10-15-duskmoonui-art-contracts.md`; it does not replace that historical evidence or claim a new full runtime audit. Only the Circular Gallery family changed between exact published CSS Art 1.20.6 and 1.20.7. Integrated dependency/build/release verification remains parent-owned.

## Exact evidence

- Repository/worktree: `/home/gao/Workspace/duskmoon-dev/duskmoon-react`, branch `main`, baseline `dfcfe49e30af2e053bd0b2b55bd61c9fc0f6bd8a`. Existing integrated sync changes were present before this follow-up and are preserved.
- npm metadata for `@duskmoon-dev/css-art@1.20.7` identifies `duskmoon-dev/duskmoonui`, directory `packages/css-art`, gitHead `fc9d2d28550c564f92e7c573969481877f92e0ea`. Package tarball `https://registry.npmjs.org/@duskmoon-dev/css-art/-/css-art-1.20.7.tgz`, shasum `b3f69dc13e3e046b231f5b511eadcb11ce31e07d`, integrity `sha512-nwS26AXkaW3TtFAK/fNEFwClTMEKszoh/3cBZLFHv0poiWL0SpqBxAfaj4h148Lo3FIv1gtUQrIAn2VQOS1X7g==`.
- `git ls-remote --tags https://github.com/duskmoon-dev/duskmoonui.git 'v1.20.7*'`: annotated tag object `85600a22b467d998a52f50e1ebabb41b6f2d0fa8`, peeled source commit `48bf133483af5c53bd3373dfa09f087e4296c11c`. Source/docs were downloaded from that exact commit; no live documentation substituted for it.
- Current evidence: `/tmp/duskmoon-art-fixes-20261016.yeBRXa` (`npm-metadata.json`, `npm-pack.json`, exact published tarball/unpacked `package-1.20.7/package`, `upstream-v1.20.7`). Previous exact package/source evidence: `/tmp/duskmoon-react-sync-2026-10-15.BwiWiA` (`css-art-1.20.6/package`, `upstream-v1.20.6`).
- [duskmoonui#77](https://github.com/duskmoon-dev/duskmoonui/issues/77) is CLOSED, closedAt `2026-10-16T01:32:40Z` (current GitHub read). Closure alone is not runtime proof.

## Public delta and dispositions (written before local source cleanup)

| Target                                 | Category   | Old/new contract and evidence                                                                                                                                                                                                                                                                                                                   | Affected local surfaces                                             | Action | Compatibility or migration reason                                                                                                                        | Verification/evidence status                                                                            |
| -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Circular Gallery native center preview | behavior   | Exact published `dist/art/circular-gallery.css` and tagged `packages/css-art/src/art/circular-gallery.css` add only `inset: 0; margin: auto;` to card `::before`. Anchor name, native hash selector, width, scale and rotation behavior remain. Tagged docs `packages/docs/src/content/docs/en/css-art/circular-gallery.mdx` embed the same fix | Installed upstream CSS; ArtCircularGallery inherited native preview | adapt  | Receive upstream fix through dependency update; do not introduce local CSS positioning override                                                          | PASS: source/package/docs agree; exact published CSS, actual React wrapper and built docs browser proof |
| Obsolete issue77 TODO                  | local-only | Existing ArtCircularGallery callsite flags the now-closed upstream defect                                                                                                                                                                                                                                                                       | packages/art-components/src/index.tsx                               | remove | Remove only the obsolete comment after exact-target plain/wrapper geometry proves fixed; preserve runtime code/API                                       | PASS: comment removed after independent proof; no runtime implementation change                         |
| Upstream inventory / other 14 families | design     | All other per-family published CSS and tagged source/docs unchanged. Aggregate `dist/art/index.css`, `dist/index.css`, `dist/index.min.css` include the same gallery delta. README release marker and package version change only                                                                                                               | Existing 15 wrappers, type/root exports, styles import and docs     | retain | No added/removed/renamed variants, public classes, tokens, native interaction mechanism or art families; no migration/deprecation/removal window applies | Byte/source comparison PASS                                                                             |
| Historical blocker guidance            | gap        | Existing package README/art usage notes mention the 1.20.6 defect; current target is fixed once verified                                                                                                                                                                                                                                        | README/docs/mapping (parent ownership)                              | adapt  | Parent resolves stale blocker messaging for 1.20.7 while retaining historical reports as dated evidence                                                  | Parent reports README/shared component-page-content updated; integrated review parent-owned             |

The public React surface remains 15 families plus the ArtCSSwitch alias, typed props/item data, root refs and caller-owned href/ARIA/style controls. No public API is removed/deprecated. Existing peer minimum is not changed by this worker; the fixed centering behavior requires upstream CSS Art 1.20.7, while no new wrapper API/selector feature is introduced.

## Circular Gallery five-contract review

| Check               | Source reference                                                                                                                 | Result at mapping time                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Design principles   | Exact 1.20.7 docs introduction/HTML Structure: 20 cards, native hash preview centered in gallery, motion path/anchor positioning | ALIGNED_SOURCE: intended design unchanged; two declarations address the recorded implementation defect                                     |
| Markup/styling      | Exact published circular-gallery.css `::before`; tagged equivalent plus docs embedded CSS                                        | ALIGNED_SOURCE: inset/margin repair agrees across package/source/docs; wrapper's cards-before-heading DOM remains compatible               |
| Interaction         | Published `:target`, `:has(a:hover)`, native `<a href="#id">` and adjacent-card spread selectors                                 | ALIGNED_SOURCE; runtime PASS: native keyboard/hash activation and adjacent-card hover spread in plain markup, wrapper and built docs       |
| Accessibility       | Tagged native links/alt text and existing wrapper decorative/ARIA handling                                                       | ALIGNED_SOURCE; runtime PASS: keyboard activation and decorative links excluded from tab order; no ARIA/focus contract delta               |
| Local compatibility | ArtCircularGallery props/ref/item API, styles import and shared docs                                                             | ALIGNED_SOURCE; runtime PASS: generated IDs, root ref/class/click forwarding and stable root identity across size/title/decorative updates |

## Validation results

- ART-77-PLAIN — PASS: exact published 1.20.7 CSS with plain documented section/card/heading markup preserves native activation/hover and centers its visible preview. The exact 1.20.6 control reproduces the old off-center defect. Small and large roots plus a changed title pass.
- ART-77-REACT — PASS: actual source ArtCircularGallery with exact published CSS supplies 20 cards and preserves native keyboard/hash/hover behavior, generated own-card IDs, root ref/class/click forwarding, and stable root identity across size/title/decorative updates. Decorative links have `tabIndex=-1`. Plain/wrapper proof has 24 passing assertions and no page errors.
- ART-77-DOCS — PASS: actual built `/components/art-circular-gallery/` route mounts basic/accessible demos; first gallery has 20 cards; Enter activates its own-card hash; preview is visible and centered; upstream anchor and native neighbor spread remain. Nine assertions pass with no page errors. This was the parent's 0.5.2 docs build using target CSS Art 1.20.7, before any later 0.5.3 rebuild/release.
- `bun run --cwd packages/art-components test` — PASS: 9 tests, 98 assertions after obsolete comment cleanup.
- `bun run --cwd packages/art-components typecheck` — PASS after cleanup.
- `git diff --check` — PASS after cleanup.

All browser checks used JavaScript Playwright with system Chromium `152.0.7977.64`. The exact published gallery CSS is byte-identical to tagged source; SHA256 `c3390c208c590a6dfc6d792622d2ee2632c9a85c813035e5da8b59436b3cb597`.

| Surface                           | Root size | Preview size | Effective left/top inset       |
| --------------------------------- | --------- | ------------ | ------------------------------ |
| React small                       | 400px     | 160px        | 120px / 120px                  |
| React default, changed title      | 600px     | 240px        | 180px / 180px                  |
| React large, changed title        | 800px     | 320px        | 240px / 240px                  |
| Plain 1.20.6 regression control   | 400px     | 160px        | 171.859px / 191px (old defect) |
| Plain 1.20.7 small                | 400px     | 160px        | 120px / 120px                  |
| Plain 1.20.7 large, changed title | 800px     | 320px        | 240px / 240px                  |
| Actual built docs small           | 400px     | 160px        | 120px / 120px                  |

Effective inset includes margin: the new small preview computes `left/top: 0px`, `margin-left/top: 120px`, `opacity: 1`, `scale: 1`. Measuring raw `left/top` alone would misclassify this fixed layout.

Reproduction commands (from repository root):

```sh
bun /tmp/duskmoon-art-fixes-20261016.yeBRXa/build-fixture.mjs
python3 /home/gao/.agents/skills/webapp-testing/scripts/with_server.py \
  --server 'python3 -m http.server 48762 --bind 127.0.0.1 --directory /tmp/duskmoon-art-fixes-20261016.yeBRXa' \
  --port 48762 \
  -- bun /tmp/duskmoon-art-fixes-20261016.yeBRXa/browser-proof.mjs
python3 /home/gao/.agents/skills/webapp-testing/scripts/with_server.py \
  --server 'python3 -m http.server 4399 --bind 127.0.0.1 --directory /home/gao/Workspace/duskmoon-dev/duskmoon-react/packages/docs/dist' \
  --port 4399 \
  -- bun /tmp/duskmoon-art-fixes-20261016.yeBRXa/docs-browser-proof.mjs
```

Evidence files: `browser-results.json`, `built-docs-results.json`, `react-gallery.png`, `plain-gallery-fixed.png`, and `built-docs-gallery.png` in the current evidence directory. Screenshots were visually inspected. Initial plain-fixture hover validation exposed a missing doctype: quirks mode prevented the universal hover selector from matching; an intermediate polling attempt also timed out. Adding the standard `<!doctype html>` to the temporary harness restored the documented selector behavior, and the complete proof then passed. No application repair was needed; source Sol repair rounds: 0.

## Ownership and limits

- This follow-up changes only this report and removes the obsolete issue77 callsite comment. Earlier art markup/tests/docs changes remain preserved under the historical audit.
- No runtime API, public export, variant, token, peer minimum, migration/deprecation window, or local positioning override changes here.
- Parent owns dependency pins/lockfile, integrated builds/tests/types, shared docs, main mapping, release/version decisions and public artifact verification. The parent reports integrated checks passed; this worker does not independently claim those checks or any later release.
- Browser proof covers Chromium only. Built docs intercepted 20 Picsum image requests with deterministic SVG responses, while built docs JS/CSS/markup were unmodified; image-service availability is unverified.
- The other 14 families retain the historical five-contract source review because their exact package/source/docs did not change; their full runtime suite was not rerun in this bounded follow-up.
- Owned temporary servers/browser commands finished normally; no port 48762/4399 server or browser-proof process remained at final inspection. No commit, push or publish was performed. No remaining technical blocker in this bounded task.
