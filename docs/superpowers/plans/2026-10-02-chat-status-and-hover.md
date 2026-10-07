# Chat status and action visibility — 2026-10-02

Status: service CSS refresh confirmed by HTTP source; hover correction **IMPLEMENTED_UNVERIFIED**. Repository `main` baseline `139fb7861d028dcb9ef117da5725f516ff4e6ccf`, preserving all prior uncommitted changes. User screenshots show oversized, concatenated status items and visible hover actions. Latest user preference applies hover reveal to all action rows, including Stop; keyboard focus and touch access retain Core behavior.

## Root evidence

Installed `packages/docs/node_modules/@duskmoon-dev/core` is 1.20.3. Its `dist/index.css` contains `.chat-status` with `display:flex`, wrapping, `gap:0.25rem 0.75rem`, `font-size:0.75rem`, muted text and tabular numerals, plus `.chat-status-item` spacing and `.chat-actions-hover` visibility rules. However, an HTTP source read of `http://localhost:4334/src/styles/components-dev.css` returned CSS without `.chat-status`, `.chat-actions-hover` or `.avatar-2xl`. The running Astro process retained older dependency CSS despite updated installed pins.

The serve-only alias points component styles to `components-dev.css`, which imports installed Core and local component styles. Restart the docs listener at its original cwd/host/port to refresh dependencies. Do not add duplicate typography/hover CSS or change dependency files. This is local service remediation, not an upstream package issue.

## Task record

| Task ID | Initial/current worker | Ownership | Sol escalated | Astra escalated | Sol repairs | Astra repairs |
| --- | --- | --- | --- | --- | --- | --- |
| chat-served-css-refresh | sol_worker | Docs service restart and HTTP stylesheet source diagnosis; no repo edits | false | false | 0/2 | 0/2 |
| chat-action-hover | luna_worker / sol_worker | Stop hover prop; inherited snippet token-value corruption requires bounded repair | true | false | 1/2 | 0/2 |

These independent scopes do not reset earlier budgets: sync-1203-chat remains Sol 2/2, Astra 1/2; the old caret/Tooltip tasks remain Sol 2/2. No edits to those implementations are assigned.

## Acceptance boundary

Service remediation passed limited HTTP source inspection: the verified old listener PID 64589 was gracefully stopped, and `bun run dev` from `packages/docs` started the replacement Astro listener PID 7089 on the same host/port. The returned stylesheet now contains the 1.20.3 status font/gap, hover visibility and Avatar 2XL rules. The replacement service remains running. This result establishes served CSS freshness, not browser appearance.

Luna changed the Stop hover prop but also corrupted the displayed 12-token value by inserting `Chat.Actions` inside `Chat.StatusValue`. It reported its first failure and stopped without repair. Parent read the exact corruption, confirmed the handoff and transferred both existing files to Sol; no resets or source replacement from an old baseline were used. Sol restored the plain numeric value, preserving the Stop hover change and callback. Final source review confirms all three action rows use hover in both preview and snippet; runtime behavior remains NOT_RUN.

The original docs service identity is verified before graceful restart; keep cwd `packages/docs`, host `0.0.0.0`, port `4334`, and leave the restarted service running. HTTP source inspection must show the installed 1.20.3 status/hover/Avatar selectors reaching the browser. Preview and snippet must both use `Chat.Actions hover` for Edit, Stop and Retry/Copy without changing their callbacks.

Tests, builds, typechecks, codegen/parity, formatting, `git diff --check` and browser audits remain paused. Source/HTTP stylesheet inspection is limited diagnostic evidence; it does not establish computed font size, actual hover/focus/touch behavior or packaged artifacts. No commit, push or release is authorized.
