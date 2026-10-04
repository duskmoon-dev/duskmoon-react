# Chat demo parity — 2026-10-01

Status: **IMPLEMENTED_UNVERIFIED** for this Chat demo correction; runtime **NOT_RUN**. The user requested all related Chat demos and styling consistent with the supplied DuskMoonUI screenshots and live demo. Repository `main` baseline `139fb7861d028dcb9ef117da5725f516ff4e6ccf`; all existing uncommitted work is preserved. No commit, push or release is authorized.

## Evidence and fixed scope

The live page `http://10.100.10.24:4321/duskmoonui/docs/en/components/chat/` was fetched as HTML, and its header identifies `v1.20.3`. Its ten showcase names and structures agree with the pinned source at `a6f74ecdd289f89977e6334a5252af5692b31b67`, `packages/docs/src/content/docs/en/components/chat.mdx`. Local fetched HTML at `http://localhost:4334/components/chat` initially contained only Colors, Interactive transcript and LLM primitives. HTTP source comparison does not establish browser appearance or behavior.

Both read-only diagnoses confirmed that the LLM preview put reasoning/tool siblings outside its bubble, unlike the required nested upstream structure. The transcript omitted avatar slots and had only three assistant ticks. Global unlayered docs `pre/code` declarations also override layered Core code-block styling. Local component CSS contains only the approved streaming caret adapter, without old grid/bubble/tool layout overrides; that adapter is outside this correction.

Use existing Chat compound parts and ordinary native elements with upstream structural classes. Add no new public API. Keep the final answer in `.chat-bubble-content.chat-bubble-streaming` inside a non-streaming outer bubble for the nested LLM demo; preserve `Chat.Bubble streaming` for existing plain-message compatibility. Every Chat preview root uses `.chat-demo`, allowing docs-only CSS to restore Core code styles and match upstream preview framing without changing other demos.

## Demo coverage and dispositions

| Target | Category | Old/new contract and evidence | Affected local surfaces | Action | Compatibility reason | Evidence status |
| --- | --- | --- | --- | --- | --- | --- |
| Basic Chat | gap | Pinned chat.mdx:27-54: start/end rows, avatar, header, bubble, footer | ChatPreviews, authored docs | add | Existing props/parts suffice | Source confirmed; runtime NOT_RUN |
| Scroll-Driven Chat Indicators | gap | chat.mdx:56-202: eight assistant ticks, interleaved users, 22rem panel | ChatPreviews, authored docs | adapt | Unique target IDs, existing scoped button navigation | Source confirmed; runtime NOT_RUN |
| Bubble Colors | gap | chat.mdx:204-239: default, soft semantic colors, filled primary | ChatPreviews, authored docs | adapt | Existing color/filled API | Source confirmed; runtime NOT_RUN |
| RTL Bubble Alignment | gap | chat.mdx:241-263: dir=rtl/lang=ar, start/end avatar layout | ChatPreviews, authored docs | add | Native direction attributes | Source confirmed; runtime NOT_RUN |
| Bubble Sizes | gap | chat.mdx:265-285: xs/sm/md/lg | ChatPreviews, authored docs | add | Existing size API | Source confirmed; runtime NOT_RUN |
| Reasoning, Tool Call, and Streaming | design | chat.mdx:287-362: nested running tool in reasoning, completed call/result panels, final answer inside one bubble | ChatPreviews, Chat usage snippet, README | adapt | Native structural divs retain public parts/caret adapter | Source mismatch confirmed; runtime NOT_RUN |
| Typing and Streaming | gap | chat.mdx:364-387: dedicated first-token/live comparison | ChatPreviews, authored docs | add | Existing Typing and Bubble.streaming | Source confirmed; runtime NOT_RUN |
| Token Metrics and Message Actions | gap | chat.mdx:389-462: user Sent/Edit, generating Stop, completed Retry/Copy | ChatPreviews, authored docs | adapt | App-owned local actions and approved Tooltip adapter | Source confirmed; runtime NOT_RUN |
| Tool Statuses | gap | chat.mdx:464-499: pending/running/success/error | ChatPreviews, authored docs | add | Existing status classes; running spinner belongs to Core | Source confirmed; runtime NOT_RUN |
| Markdown Body in a Bubble | gap | chat.mdx:501-523: rich content inside markdown-body | ChatPreviews, authored docs | add | Existing native markup and Core classes | Source confirmed; runtime NOT_RUN |
| Chat docs code styles/frame | design | Docs global pre/code overrides Core; pinned ComponentShowcase.astro:167-176,215-216 defines neutral frame | docs.css, .chat-demo roots | adapt | Scoped revert-layer exposes Core; frame uses matching base background token | Source conflict confirmed; runtime NOT_RUN |

Readable links, long-message wrapping and focusable named scrolling code belong in these examples rather than a speculative extra showcase. Rendered previews and displayed examples must have matching structure and meaningful local action outcomes. Tooltip remains the approved native hint/manual React adapter; Interest Invoker parity is still a separate recorded gap, not fixed here.

## Task routing and preserved budgets

| Task ID | Initial/current worker | Assignment | Sol escalated | Astra escalated | Sol repairs | Astra repairs |
| --- | --- | --- | --- | --- | --- | --- |
| chat-demo-layout-review | sol_worker | Read-only CSS/layout diagnosis completed | false | false | 0/2 | 0/2 |
| chat-demo-composition-review | sol_worker | Read-only composition/coverage diagnosis completed | false | false | 0/2 | 0/2 |
| sync-1203-chat | sol_worker / astra_worker | Sol 2/2 missed old Usage hierarchy; bounded Astra recovery of that branch after verified handoff | false | true | 2/2 | 1/2 |
| chat-docs-style-scope | luna_worker | Fixed docs-only CSS selectors/properties | false | false | 0/2 | 0/2 |

The earlier `sync-core-integration` and Tooltip implementation budgets remain exhausted at Sol 2/2 and are not reopened. No component caret implementation or Tooltip lifecycle change is assigned. Prior native Modal/report repairs remain 1/2, and unrelated Form/Badge/Art changes are preserved.

## Acceptance and future validation

Parent source review accepted the ten title/preview routes in `ChatPreviews.tsx` and `DemoRenderer.tsx`, corresponding standalone TSX snippets in `src/lib/chat-demo-examples.ts`, eight unique assistant navigation targets, native LLM nesting and Call/Result code panes, four tool statuses, RTL/sizes/Markdown/live comparisons, local action state handlers and the scoped docs stylesheet diff. The obsolete `demoCode()` Usage branch was initially missed by Sol; bounded Astra repair corrected it, and the parent reviewed the actual updated branch. Public component and approved caret/Tooltip implementations were not changed by this correction. Source acceptance does not establish computed style, keyboard, interaction or packaged-runtime success.

All worker commands are stopped. No tests, builds, typechecks, parity/codegen, formatting checks, `git diff --check` or browser audits ran. No output artifacts were regenerated, no project version was changed, and nothing was committed/pushed/released. The broader Core/Art sync remains **PARTIAL** with its previously recorded gaps.

Source acceptance requires all ten titles/preview routes, matching nested structures and snippets, scoped stylesheet resets, unchanged public component APIs, and no duplicate example target IDs. Final browser appearance is unverified until the user's pause lifts.

Future task `CHAT-DEMO-PARITY-AUDIT` (**NOT_RUN**): load all ten previews with Core 1.20.3 in the same theme/viewport as the reference, compare geometry/palette/code panels/RTL/tail/caret, collapse reasoning/tools, navigate all eight ticks without page/hash movement, exercise Edit/Stop/Retry/Copy, and check hover/focus/touch/reduced-motion/narrow-screen behavior. Run required scoped docs/component checks after authorization; no tests, builds, typechecks, parity/codegen, formatting checks, `git diff --check` or browser audits during this paused source work.
