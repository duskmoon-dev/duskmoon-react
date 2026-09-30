# Docs categories and navigation

Accepted by the user on 2026-09-30: organize documentation by purpose using the Core website as a reference; put Dm components beside their standard counterparts and identify them with a Dm badge.

## Scope

Modify the docs package only, plus this design and its implementation plan. Preserve package exports, component behavior, dependency versions, existing document URLs, and the GitHub Pages base path. Work in the current checkout so the running localhost:4334 docs server reflects the changes. Do not commit or push.

## Information architecture

Ordered categories: Actions, Layout, Navigation, Data Entry, Data Display, Feedback, Surfaces, CSS Art, Theming & Configuration, Utilities & Types. The docs category configuration is independent of the API parity manifest's implementation kind. Each implemented document has exactly one category. All `art-component` targets automatically belong to CSS Art because that kind fully determines their purpose category; every other target requires an explicit ID assignment, and unassigned IDs must be surfaced rather than silently misclassified. No empty category is shown.

DmTable/DmProTable belong to Data Display; DmDatePicker/DmSearch/DmQuery to Data Entry; DmLayout/DmSplitter/DmPageHeader to Layout; DmBreadcrumb/DmMenu/DmPagination/DmTabs to Navigation; DmMessage to Feedback; DmDrawer/DmAuxiliary to Surfaces; DmToolbar to Actions; DmProvider to Theming & Configuration. Preserve CSS Art as its own category. Configuration APIs belong with providers, while type helpers, hooks, Breakpoint, and version belong to Utilities & Types.

## UI

Use the same ordered category navigation on the catalog and detail pages. Provide a labeled, case-insensitive name/ID search, empty state, and clear/reset behavior. Search filters the navigation and, on the catalog, cards and empty category sections; it leaves detail-page content visible. Cards show a concise existing purpose summary instead of a redundant slug. Show Dm badges and separate component totals from noncomponent API totals. Keep mobile navigation usable without forcing readers through all 122 entries before the content. Preserve theme switching.

Rename the docs hero class to prevent collision with Core's `.hero > * { grid-area: 1 / 1; }`. The dependency's hero behavior is intentional; this is a docs naming collision, not an upstream dependency defect.

## Acceptance

All 122 existing documents remain reachable exactly once in the catalog. Purpose groups replace Standard/Infrastructure/DuskMoon workflow. Dm and standard counterparts share groups. Shared search handles matching, case, whitespace, zero matches, and clearing. Homepage hero does not overlap. Desktop/mobile layouts do not overflow, and detail demos and theme switching continue to work. Scoped taxonomy tests and docs build pass; browser checks verify the live server and base-path links. Record the accepted taxonomy and CSS collision in Agent Note using project=duskmoon and variant=react.
