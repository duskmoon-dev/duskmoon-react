# Button confirmation and demos implementation plan

> **For agentic workers:** Use the approved task briefs and disjoint component/docs ownership below. User approved implementation; verification is paused.

**Goal:** Add a Button `confirm` property that delays `onClick` until confirmation, and expose Button features in authored docs demos.

**Architecture:** Keep the ordinary Button path intact. Confirmation uses a native popover form rendered through a portal and one approved click on the original button, preserving native event/default behavior. Docs use the same public interface and existing Tooltip composition.

**Tech Stack:** React, TypeScript, Core 1.20.0 native popover CSS, Astro docs.

## Approved interface

```tsx
<Button
  color="error"
  confirm={{
    title: "Delete item?",
    description: "This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
  }}
  onClick={(event) => {
    // Runs only after confirmation. currentTarget is this original button.
    event.preventDefault();
    deleteItem();
  }}
>
  Delete
</Button>
```

`confirm` accepts a boolean or the object above; object values are React nodes. `true` uses English defaults. Absent/false preserves Button behavior. Initial activation prevents default without calling user `onClick`. Cancel, Escape and outside dismissal do not execute the action. Confirmation executes a genuine original-button click; native form submit/reset behavior and user cancellation remain applicable. A promise-returning callback displays pending state, prevents duplicate confirmation, closes on success and retains the popup with an accessible error on rejection. A portal avoids invalid nested forms. Ref, disabled/loading, multiple instances, focus and stale settlements require source review now and runtime checks when verification resumes.

## Task ownership and routing

| Task ID | Initial/current worker | Reason | Sol escalated | Astra escalated | Sol repairs | Astra repairs |
| --- | --- | --- | --- | --- | --- | --- |
| button-confirm-implementation | sol_worker | Native events, portal form and async state lifecycle | false | false | 2/2 | 0/2 |
| button-docs-implementation | luna_worker / sol_worker | Luna source failure: title dispatch in the wrong scope | true | false | 1/2 | 0/2 |

Baseline: main at `e63d807bbe6191fccf3be6705ac2ed244693a635`; preserve pre-existing sync changes and skill edits. No commit, push, release or package version bump is authorized for this task.

### Component source

- [x] Extend `packages/components/src/components/button/` with confirmation options and native popover form behavior.
- [x] Keep `packages/components/scripts/specs/button.json` consistent with the generated Button props; do not regenerate unrelated components or lose semantic colors.
- [x] Expose the options through `ButtonProps` and existing button subpath/root exports.
- [x] Add a scoped feature changeset (`quiet-buttons-confirm.md`).
- [x] Review source for callback timing, original target/ref, native submit/reset, async guards, dialog labels, dismissal, focus and SSR. Runtime verification remains deferred.

### Authored docs

- [x] Add `packages/docs/src/components/ButtonPreviews.tsx` and surgical dispatch in `DemoRenderer.tsx`.
- [x] Add authored examples in `component-docs.ts`, preserving existing colors/basic demos and sync edits.
- [x] Cover filled/outline/tonal/ghost/text, loading variants/sizes and interaction, disabled, icon slots, icon-only shapes with accessible labels, Tooltip composition and confirmation with an action counter.
- [x] Source review snippets and rendered previews for matching props and behaviors.

### Deferred verification

All commands below are **NOT_RUN** while the user's test/build pause remains active. Do not mark source implementation as verified completion.

- [ ] Scoped Button tests: `bun test --preload ./test/setup.ts packages/components/src/components/button/` from repository root. Add cases for first-click suppression, confirm/cancel, native event target, form submission/preventDefault/reset, disabled/loading, promises, duplicate submit and stale settlement once test work resumes.
- [ ] Components typecheck: `bun run --cwd packages/components typecheck`.
- [ ] Components build: `bun run --cwd packages/components build` (needed to refresh exports consumed by docs).
- [ ] Docs build: `bun run --cwd packages/docs build`.
- [ ] Browser: loading/disabled/icon/tooltip demos, keyboard confirmation and cancellation, native form defaults, errors and focus return, multiple buttons and SSR hydration.

### Knowledge capture

- [x] Save the confirmation event/default-action boundary in Agent Note with labels `project: duskmoon`, `variant: react`; distinguish uncommitted source from runtime evidence. ID: `3bc760c0-e429-4856-b121-0c577ca2bd63`, revision 1, direct retrieval verified.

## Current status

Both source tasks are IMPLEMENTED_UNVERIFIED after worker handoffs and parent source review. Tests, builds, typechecks and browser validation are paused. Existing dist artifacts remain stale. No commit, push or release was performed.

Parent source review requested component repair round 1 for ordinary/ref-callback cleanup preservation, visible pending spinner, confirmation mode-change invalidation and synchronous submission guards. Round 2 restores explicit nullable trigger guarding and keeps async duplicate-action protection across Escape/outside dismissal and confirmation mode changes. Luna stopped on an out-of-scope `demoTitle` insertion in the color preview helper; docs transferred to Sol for repair round 1 with all changes preserved. Docs source repair and review are complete (IMPLEMENTED_UNVERIFIED). These are source findings, not test failures.

## User-requested follow-up: structured content and native Tooltip

The user refined the confirmation payload to a structure containing either a JSX `component` or simple `message`, with optional `title`. This is a new feature slice; the earlier task repair counters above remain intact.

```tsx
<Button confirm={{ message: "Delete this item?" }} onClick={deleteItem}>
  Delete
</Button>
<Button confirm={{ component: <DeleteConfirmContent /> }} onClick={deleteItem}>
  Delete with details
</Button>
```

`component` is a React element rendered inside the library-owned confirmation form; it does not own another form or replace the confirmation actions. Selection is `component`, then `message`, then legacy `description`. Existing booleans, `description`, confirm/cancel text, and confirmation event/async lifecycle are retained. An omitted configuration title omits the visible header but keeps an accessible dialog name. Add a matching authored custom-content demo and change standard examples to `message`.

The user also requested that Tooltip use the native Popover API. Published Core 1.20.0 already implements `.tooltip[popover]`, hint popovers and CSS anchor positioning with placement flipping. Migrate the React Tooltip surface to these native styles/state, preserving wrapper ref/events, controlled/uncontrolled open, sizes and child semantics. Coordinate hover and focus; associate the actual trigger with a unique tooltip ID and preserve existing descriptions. Native tooltips follow Core's arrowless design so automatic placement does not leave an incorrect arrow; retain the legacy arrow option for source compatibility and document deprecation. Scope legacy show-class/relative-position rules to non-popover surfaces rather than removing styles used by other components.

| Task ID | Initial/current worker | Reason | Sol escalated | Astra escalated | Sol repairs | Astra repairs |
| --- | --- | --- | --- | --- | --- | --- |
| button-confirm-content-implementation | sol_worker | Structured content normalization, optional accessible title and docs | false | false | 0/2 | 0/2 |
| tooltip-native-popover | sol_worker | Native popup state and anchor/CSS compatibility | false | false | 2/2 | 0/2 |

- [x] Extend Button config types and codegen spec with `component` and `message`, retaining `description` compatibility.
- [x] Render configured content/title through the existing native confirmation form without altering action lifecycle.
- [x] Add a separate custom-content docs preview and matching code; keep prior demos.
- [x] Migrate Tooltip native popover markup/state/anchors and child descriptions.
- [x] Isolate legacy CSS selectors; retain native size variants and source compatibility for arrow.
- [x] Review source and record durable boundaries in Agent Note. Button note revision 2 and native compatibility note revision 5 were retrieved directly after writes.

All tests/builds/typechecks/browser checks remain NOT_RUN by user request. Tooltip's current tests assert class-driven visibility and need migration after verification resumes. No tests are edited now. Both follow-up tasks are IMPLEMENTED_UNVERIFIED after handoffs and parent source review. Agent Note `3bc760c0-e429-4856-b121-0c577ca2bd63` is at revision 2; native compatibility note `cc29b85a-378c-4888-b5e0-8472d03f44ac` is at revision 5. Persistence verified through direct retrieval. No commit, push or release was performed.

Tooltip source review requested repair round 1: avoid controlled hint-popover reopening feedback between multiple tooltips; forward description IDs to component triggers such as Button; retain caller-id surface naming; scope legacy styles without raising their selector specificity. Controlled manual popovers with visibility-change requests are an acceptable solution; uncontrolled native hint dismissal remains browser-owned.

Repair round 2 handles native popover attribute changes when switching between controlled/manual and uncontrolled/hint modes even with unchanged visibility, guards stale queued toggle events, and retains the original base arrow selector specificity.

## User screenshot follow-up: round icon buttons and stale docs bundles

The user reported capsule-shaped icon buttons, followed by a still-clipped Tooltip demo. These authorize targeted live diagnosis of the current Button docs page; automated suites, typechecks and builds remain paused.

Evidence before the docs fix: current page 5 at `http://localhost:4334/components/button` had a Tooltip with no `popover` attribute, `tooltip-show` and a `.tooltip-arrow`. Docs consumed `packages/components/dist` from September 30, while the native Tooltip source was updated October 1. A code-only source implementation therefore did not fix the running UI.

The approved circular icon fix maps `shape="circle"` to upstream `btn-circle btn-icon`, with fixed native dimensions. XS/SM use `btn-icon-sm`, MD uses the default native icon size, LG uses `btn-icon-lg`. Optional spec compound modifiers keep generated helpers consistent with this mapping; no full regeneration or unrelated semantic-color edits. The preview and snippet use labelled SVG icon buttons and centered flex alignment.

The approved docs fix adds serve-only exact Vite aliases for the components root and stylesheet. A dev CSS entry imports Core first and local component styles second, matching the packaged stylesheet order. Production builds keep package exports. No package rebuild is needed for dev source changes.

| Task ID | Initial/current worker | Reason | Sol escalated | Astra escalated | Sol repairs | Astra repairs |
| --- | --- | --- | --- | --- | --- | --- |
| button-icon-round | sol_worker | Native icon sizing and generated/spec class consistency | false | false | 0/2 | 0/2 |
| docs-dev-source | luna_worker | Fixed dev-only Vite aliases and CSS entry | false | false | 0/2 | 0/2 |

- [x] Implement and source-review native circle class/size mappings in spec, codegen and generated class helper.
- [x] Update icon previews and matching snippets with accessible SVGs; add scoped patch changeset.
- [x] Add serve-only source and CSS aliases without changing production package resolution.
- [x] Reload current docs page after source changes and inspect the requested issue. Tooltip is now `popover="hint"`, `:popover-open`, arrowless and anchored; actual Button has `aria-describedby="save-help-tooltip"`. Screenshot confirms tooltip content extends past the overflow-hidden card boundary without clipping.
- [x] Inspect current circular demo sizes: SM 32x32, MD 40x40, LG 48x48 CSS pixels, all radius 9999px. These are targeted current-page observations, not a full component audit.
- [ ] Run automated tests/typechecks/codegen/builds after the user resumes them. None ran for these follow-ups.

Both screenshot follow-up source tasks have passing scoped live-page evidence in addition to source review. Earlier async/controlled-state, other component and production build checks remain deferred. No commit, push or release performed.

## User follow-up: default confirmation color

The approval action inherits the trigger's resolved `color` through `getButtonClasses({ color, size: "sm", isLoading: confirmLoading })`. It keeps filled/rect defaults and does not copy trigger appearance/shape/className or add a new override API. Cancellation and confirmation event/async behavior are unchanged.

| Task ID | Initial/current worker | Reason | Sol escalated | Astra escalated | Sol repairs | Astra repairs |
| --- | --- | --- | --- | --- | --- | --- |
| button-confirm-color | luna_worker | Existing class helper with fixed color/size/loading mapping | false | false | 0/2 | 0/2 |

Source review passed. Targeted Chrome observation on localhost:4334/components/button confirmed both error-colored triggers have `btn btn-error btn-sm` approval actions; the opened Delete item popover displays its error-colored submit button and unchanged `btn btn-text btn-sm` cancellation. Cancel closed the demo without executing its action. Automated tests/builds/typechecks remain NOT_RUN; no commit/push/release. This independent color task does not reset earlier repair counters. Button Agent Note updated to revision 3 with this boundary; persistence verified through direct retrieval.
