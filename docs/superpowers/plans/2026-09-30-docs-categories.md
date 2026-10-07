# Docs Categories Implementation Plan

> **For agentic workers:** Use subagent-driven-development with the ownership and fixed interfaces below. The user has approved implementation; no commit or push is authorized.

**Goal:** Make existing React documentation findable by purpose with shared navigation, search, and Dm badges.

**Architecture:** A docs-only category module supplies ordered category metadata and target classification. Existing catalog generation preserves its routes and category-label API while adding a category ID. A shared Astro navigation component filters links and catalog cards through a small client script; it does not filter detail content.

**Tech Stack:** Astro, TypeScript, Bun, existing semantic DuskMoon CSS tokens.

## Fixed interface

`packages/docs/src/lib/docs-categories.ts` exports `DOC_CATEGORIES` (ordered readonly objects with `id`, `title`, `description`), `DocCategoryId`, and `categoryForTarget({id, kind}) -> DocCategoryId`. IDs: `actions`, `layout`, `navigation`, `data-entry`, `data-display`, `feedback`, `surfaces`, `css-art`, `theming`, `utilities`.

`ComponentDoc` gains `categoryId: DocCategoryId`; `category: string` remains the display label. `getDocsByCategory()` remains a `Map<string, ComponentDoc[]>`, now in configuration order with empty categories omitted. UI identifies Dm components with `kind === "dm-workflow-component"`. Infrastructure exports count as API references rather than components.

## Task record

| task_id | initial_worker | current_worker | sol_escalated | astra_escalated | sol_repair_rounds | astra_repair_rounds |
| --- | --- | --- | --- | --- | --- | --- |
| docs-taxonomy | luna_worker | sol_worker | true | false | 1 | 0 |
| docs-ui | sol_worker | sol_worker | false | false | 2 | 0 |
| docs-review | sol_worker | sol_worker | false | false | 0 | 0 |

## Task 1: Taxonomy

Ownership: `packages/docs/src/lib/docs-categories.ts`, `packages/docs/src/lib/component-docs.ts`, `packages/docs/src/lib/docs-categories.test.ts` only.

- [x] Add scoped Bun assertions against existing `getDocsByCategory()` that standard/Dm counterparts share purpose groups; run and record the agreed expected red failures.
- [x] Add explicit ID classification for all current implemented targets and ordered metadata. Update `toDoc` and `getDocsByCategory()` using the fixed interface.
- [x] Verify every implemented target is classified once, every category is known, infrastructure/art classifications are appropriate, no existing routes/counts change, and unknown targets are surfaced.
- [x] Run `bun test packages/docs/src/lib/docs-categories.test.ts`; run scoped formatting checks on owned files. Do not build while the UI worker is editing.

Review handoff: Luna completed the initial implementation and stopped all writes. Parent verified that unknown IDs `toString` and `constructor` return inherited functions from the classification object rather than rejecting them (`bun -e` reproduction, exit 0). Transferred module/test ownership to Sol for one bounded repair, preserving the interface and all mappings. This inherited repair is Sol round 1; the new expected red regression tests are agreed.

## Task 2: Shared navigation and catalog

Ownership: `packages/docs/src/pages/index.astro`, `packages/docs/src/components/ComponentDocPage.astro`, `packages/docs/src/components/DocsNavigation.astro`, optional docs-only search script/test, `packages/docs/src/layouts/DocsLayout.astro`, `packages/docs/src/styles/docs.css`. Review repair additionally permits purpose text entries in `packages/docs/src/lib/component-page-content.ts` without changing its content-family behavior. Consume Task 1's fixed interface without editing its files.

- [x] Implement shared ordered navigation with current-document state, category anchors, Dm badges, accessible search and no-match/reset behavior.
- [x] Render catalog inside the shared navigation layout, purpose summaries, Dm badges, category counts, and separate component/API totals.
- [x] Integrate navigation in detail pages, preserve section links/demos/theme behavior, and make mobile navigation collapsible or bounded in height.
- [x] Rename docs `.hero` to a docs-specific class; add only layout/search styles required by the design.
- [x] Validate search with matching, whitespace, no-match and clear browser checks. Scoped TS/CSS formatting checks passed; Astro formatting was unavailable because the current Prettier setup has no Astro parser. Astro compilation passed.

UI repair history: round 1 supplied actual purpose descriptions for the 21 Dm and 13 infrastructure cards, replacing generic export descriptions. Round 2 wrapped long metadata paths, resolving Button detail-page overflow (390px viewport had 522px document width before the repair). Both handoffs stopped all writes; no third Sol repair was performed.

## Final acceptance (coordinator)

- [x] Review the spec and final diff, preserving the API parity manifest and package source.
- [x] Run scoped tests, supported formatting checks and `DOCS_BASE=/duskmoon-react bun run --filter '@duskmoon-dev/docs' build`.
- [x] Use Chrome DevTools to verify the live catalog, matching/empty/cleared search, Dm classification, detail page, theme toggle, hero geometry, and mobile overflow.
- [x] Verify GitHub Pages base-path output, save/verify the required project-scoped Agent Note, and report the result without committing.

## Final evidence (2026-09-30)

- 7 scoped Bun tests passed; supported TS/CSS Prettier checks, scoped ESLint for the new taxonomy files, and `git diff --check` passed.
- Final build: exit 0, 123 pages. Core CSS minification emits warnings for `@theme`/`@utility`; this change does not alter the dependency or these directives.
- Catalog: 122 unique document routes and 21 Dm badges across 10 groups; 109 components and 13 API references; no generic export summaries. All 122 existing page IDs match the catalog and their original routes.
- Search: mixed case and surrounding whitespace work; exact ID `DM-TABLE` returns one card/link in Data Display; no-match hides all category groups and presents status text; Clear restores 122 entries and focuses the search field. Detail search retains the Button article and its eight demos.
- Hero child rectangles do not overlap. Catalog and Button detail layouts were checked at 320px/390px. Button document width after the repair equals its client width (309px/379px), with internal code and table scrolling preserved.
- Theme changes persist after reload and were restored to the original light preference. Production preview verifies `/duskmoon-react/` links, search, and DmTable detail navigation/current-page state.
- Independent Sol spec/quality review passed. Agent Note `713c58e7-c9fc-4565-8798-24d5b4ca50cf` was saved and directly read back with project=duskmoon and variant=react.

ROUTE task=docs-taxonomy agent=luna_worker reason=fixed classification interface and explicit assignments
ROUTE task=docs-taxonomy agent=sol_worker reason=evidenced inherited-property classification defect
ROUTE task=docs-ui agent=sol_worker reason=shared search and responsive cross-file navigation
ROUTE task=docs-review agent=sol_worker reason=independent read-only spec and quality checks
