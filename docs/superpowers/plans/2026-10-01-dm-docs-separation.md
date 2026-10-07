# Separate Dm Documentation Plan

> **For agentic workers:** This document is preparation only. It records the proposed implementation scope and future acceptance checks; it does not authorize implementation in this phase.

**Goal:** Place the 21 Dm workflow component documents in purpose subgroups separate from standard component documents, while preserving existing routes, search, navigation, and document totals.

**Architecture:** Keep the existing standard purpose categories and add Dm-specific categories with unique `dm-*` IDs and titles such as `Dm / Actions`. Classify the 21 manifest entries by their `dm-workflow-component` kind and explicit component ID. Keep Dm-prefixed infrastructure exports in their existing Theming or Utilities groups, because an ID prefix alone does not make an export a workflow component.

**Tech Stack:** Astro, TypeScript, Bun tests, existing docs category and navigation modules.

---

## Superseding decision

The accepted 2026-09-30 docs-categories design grouped Dm components beside standard counterparts and identified them with a Dm badge. The user's newer preference is to separate Dm documentation from standard documentation and provide purpose subgroups. This plan supersedes that mixed-grouping decision for catalog and navigation grouping. It does not remove Dm badges or change the shared page structure.

## Fixed category order and mapping

Preserve the current standard categories in their current order through `Surfaces`. Insert all Dm categories next, ordered by purpose, then continue with `CSS Art`, `Theming & Configuration`, and `Utilities & Types`:

| Category ID | Display title | Dm component IDs |
| --- | --- | --- |
| `dm-actions` | Dm / Actions | `dm-toolbar` |
| `dm-layout` | Dm / Layout | `dm-layout`, `dm-page-header`, `dm-splitter` |
| `dm-navigation` | Dm / Navigation | `dm-breadcrumb`, `dm-menu`, `dm-pagination`, `dm-tabs` |
| `dm-data-entry` | Dm / Data Entry | `dm-date-picker`, `dm-query`, `dm-search` |
| `dm-data-display` | Dm / Data Display | `dm-infinite-scroll`, `dm-pro-table`, `dm-status`, `dm-table`, `dm-tree`, `dm-truncate` |
| `dm-feedback` | Dm / Feedback | `dm-message` |
| `dm-surfaces` | Dm / Surfaces | `dm-auxiliary`, `dm-drawer` |
| `dm-theming` | Dm / Theming & Configuration | `dm-provider` |

The 21 IDs above are the complete `dm-workflow-component` set in `packages/components/scripts/parity/component-api.manifest.json`. Keep the existing standard-purpose groups unchanged. Keep `dm-provider` in its own Dm subgroup. Keep infrastructure exports such as `get-dm-theme`, `on-dm-theme-update`, `set-dm-prefix-cls`, `set-dm-primary-color`, and `set-dm-date-picker-locale` in Theming & Configuration; classify all other infrastructure exports by their current mapping, including Utilities & Types.

## Expected file scope

| File | Planned responsibility |
| --- | --- |
| `packages/docs/src/lib/docs-categories.ts` | Add ordered Dm category metadata; add explicit Dm-purpose classification for `dm-workflow-component` targets; preserve current standard and infrastructure mappings and unknown-target failure. |
| `packages/docs/src/lib/docs-categories.test.ts` | Assert the new full order, all 21 Dm category assignments, that standard documents stay in standard groups, and that Dm-prefixed infrastructure exports stay in Theming or Utilities. Preserve exact-once classification and route-count checks. |
| `packages/docs/src/lib/component-docs.ts` | No change is expected if its existing category-ordered `getDocsByCategory()` continues to consume the expanded category configuration. Change only if implementation reveals a concrete compatibility issue, and keep that change within categorization. |
| `packages/docs/src/components/DocsNavigation.astro` | No structural change is expected: it already renders categories in supplied order, resolves their configured IDs, preserves per-component routes, and marks Dm-kind entries. Confirm `Dm / …` titles render correctly. |
| `packages/docs/src/pages/index.astro` | No structural change is expected: it already renders groups from `getDocsByCategory()` and derives section anchors from category IDs. Confirm all Dm subgroups appear separately and links remain valid. |

Do not change component pages, package exports, component behavior, manifest contents, search semantics, shared navigation behavior, theme behavior, or route paths. Keep the existing 122-document catalog, 109 component count, 13 API-reference count, and 21 Dm workflow components.

## Implementation tasks for a later phase

### Task 1: Update category metadata and classification

**Files:** Modify `packages/docs/src/lib/docs-categories.ts` and `packages/docs/src/lib/docs-categories.test.ts` only.

- [ ] Add the eight Dm categories in the specified order between `Surfaces` and `CSS Art`, with non-empty descriptions and unique category IDs.
- [ ] Make `categoryForTarget` classify `kind === "dm-workflow-component"` by an explicit ID-to-Dm-category map. Require every one of the 21 IDs to be present; unknown Dm workflow IDs must fail explicitly.
- [ ] Remove the 21 Dm workflow IDs from standard-category assignments. Leave Dm-prefixed `infrastructure-export` IDs mapped under their existing non-Dm categories.
- [ ] Update the category order and mapping assertions. Assert each listed Dm ID appears exactly once in its expected Dm group; assert representative standard counterparts remain in standard groups; assert Dm-prefixed infrastructure IDs remain in Theming/Utilities; preserve the 122-doc, unique-route, and exact-once invariants.

### Task 2: Verify generated navigation and catalog

**Files:** Review `packages/docs/src/lib/component-docs.ts`, `packages/docs/src/components/DocsNavigation.astro`, and `packages/docs/src/pages/index.astro`. Modify only if category IDs/titles fail to flow through the current interfaces.

- [ ] Confirm `getDocsByCategory()` preserves `DOC_CATEGORIES` order and omits empty categories.
- [ ] Confirm catalog section IDs and navigation anchors use each unique Dm category ID and that all Dm documents link to the existing `/components/<id>` routes.
- [ ] Confirm the Dm badge remains on each Dm workflow component card and nav entry, and that standard cards remain standard-only.
- [ ] Run the future browser review against the docs catalog and representative Dm detail pages after implementation; do not treat this plan's file review or a passing unit test as browser evidence.

## Future acceptance checks (not executed in this preparation phase)

- The category order is the existing standard purpose sequence through Surfaces, then the eight Dm subgroups in the table order, then CSS Art, Theming & Configuration, and Utilities & Types.
- Each of the 21 `dm-workflow-component` manifest entries appears once in exactly its mapped Dm subgroup; none appears in a standard subgroup.
- Standard component assignments stay unchanged. Dm-prefixed infrastructure exports remain outside Dm workflow groups and keep their current Theming/Utilities purpose classification.
- All 122 documents remain reachable once at their existing URLs; totals remain 109 components and 13 API references; the catalog remains at 21 Dm workflow components.
- Catalog navigation, category anchors, case-insensitive name/ID search, no-match state, clear behavior, detail-page navigation, theme toggle, and mobile layout continue to work.
- No empty category is shown. Catalog cards and navigation entries retain Dm badges; the Dm-prefixed category title is clear and does not cause overflow at the supported mobile widths.
- Future implementation runs scoped category tests, docs build, and browser checks. Those checks were not run while preparing this document.

## Preparation record

This plan was prepared from `docs/superpowers/specs/2026-09-30-docs-categories-design.md`, the existing implementation plan, `docs-categories.ts`, `DocsNavigation.astro`, `index.astro`, and the component API manifest. Existing workspace edits were preserved. No code, tests, build, browser, or network actions were performed.
