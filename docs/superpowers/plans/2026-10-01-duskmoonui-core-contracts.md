# DuskMoonUI Core 1.20.0 contract report — 2026-10-01

> Historical target: this report remains the pinned 1.20.0 source review. For the current 1.20.3 delta, dispositions, and carry-forward limits, see [the 1.20.3 report](2026-10-01-duskmoonui-1203-contracts.md). Its changed-family findings supersede corresponding 1.20.0 rows; all original audit tasks below remain `NOT_RUN`.

Status: **PARTIAL** source review; runtime **NOT_RUN**. Baseline: `main` at `139fb7861d028dcb9ef117da5725f516ff4e6ccf`. Target: published `@duskmoon-dev/core@1.20.0`; registry `gitHead` `86b7ec15de00ff195a423dabb47ad0972980e165`; tag `v1.20.0` peeled to `d8cc0223d76a3923d5923264f0595f76587adad8`. Published CSS establishes shipped selectors. Pinned docs describe intended markup and behavior. Their examples are illustrative unless prose makes a requirement. The different registry commit and tag are recorded, not assumed equivalent.

This report covers **84 component families** in two source reviews. Each has design, markup/style, interaction, accessibility, and local compatibility findings plus a future audit marked `NOT_RUN`. `UNKNOWN` is an unresolved source comparison, independent of runtime `NOT_RUN`. `ALIGNED_SOURCE` applies only to the explicitly compared selector or structure, never an unseen wrapper or the full family. `N/A` requires an evidenced absence of the contract; generic uncertainty is `UNKNOWN`. Source-only changes elsewhere in this worktree may still be in progress; a proposed `adapt` row is not implementation proof.

No public React API removal or new deprecation window is proposed. Keep root/subpath exports, refs, callbacks, and React-only APIs while adapting DOM and behavior where source requirements differ. Existing overlay, Menu, Modal, Select, Rate, Timeline, and Toast divergences remain open despite local compatibility motives. The separate four Core effects (`aura`, `hover-3d`, `hover-gallery`, `text-rotate`) are CSS effects, and base/theme/import are CSS/plugin surfaces; they are not part of the 84 component count and do not demand fictitious React wrappers. Their published package imports and local CSS build composition require a separate scoped audit when verification resumes.

## Difference mapping and dispositions

The seven columns below are the decision ledger. Rows with `retain` preserve a CSS composition or React-specific API only for the stated reason; they do not certify complete alignment. Rows with `add`, `adapt`, or `block` remain open until source implementation and actual validation establish closure. See each anchored family section for the five checks and future audit.

| Target | Category | Old/new contract and evidence | Affected local surfaces | Action | Compatibility or migration reason | Verification/evidence status |
| --- | --- | --- | --- | --- | --- | --- |
| [accordion](#core-a-001) | gap | `components/accordion.mdx:14`, `dist/components/accordion.css:8` | no dedicated local TSX directory. | `add` | No dedicated wrapper; documented native and controlled contracts need an API decision. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [alert](#core-a-002) | design | `components/alert.mdx:14`, `dist/components/alert.css:8` | `packages/components/src/components/alert/Alert.tsx:8`. | `adapt` | Local role="alert" forces announcement for every alert; pinned docs delegate live-region policy to application (Alert.tsx:10; docs:14). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [appbar](#core-a-003) | gap | `components/appbar.mdx:14`, `dist/components/appbar.css:8` | no dedicated local TSX directory. | `add` | No dedicated wrapper for documented header/slot/position contract. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [autocomplete](#core-a-004) | local-only | `components/autocomplete.mdx:14`, `dist/components/autocomplete.css:10` | `packages/components/src/components/auto-complete/AutoComplete.tsx:79`. | `retain` | Local option nodes are buttons and listbox container is div; pinned example uses ul/li options. Semantics may be viable but CSS selector and active-descendant behavior need source audit (AutoComplete.tsx:245-250,328-336; docs:43-53). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [avatar](#core-a-005) | gap | `components/avatar.mdx:13`, `dist/components/avatar.css:8` | `packages/components/src/components/avatar/Avatar.tsx:24`. | `block` | Upstream docs advertise 2xl but the published avatar stylesheet lacks that selector; upstream issue duskmoon-dev/duskmoonui#67 blocks a usable local size. Retain current sizes; status/ring/indicator breadth remains unknown (docs:13-25,68-73). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [badge](#core-a-006) | design | `components/badge.mdx:13`, `dist/components/badge.css:8` | `packages/components/src/components/badge/Badge.tsx:22`. | `adapt` | Current source emits canonical and legacy outline aliases (`U:badge:11-18`, `C:badge:78-81`, `L:classes/badge.ts:24-29`). Preserve public appearance prop; other badge composition remains caller-owned. | Narrow source implemented; runtime NOT_RUN |
| [bottom-navigation](#core-a-007) | gap | `components/bottom-navigation.mdx:13`, `dist/components/bottom-navigation.css:8` | no dedicated local TSX directory. | `add` | No dedicated destination/dock wrapper; app composition could use CSS directly but current plan calls it a first-class gap. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [bottomsheet](#core-a-008) | local-only | `components/bottom-sheet.mdx:18`, `dist/components/bottomsheet.css:8` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; native popover/dialog and legacy class paths are available for CSS-only composition (docs:16-64). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [breadcrumbs](#core-a-009) | local-only | `components/breadcrumbs.mdx:13`, `dist/components/breadcrumbs.css:7` | `packages/components/src/components/breadcrumb/Breadcrumb.tsx:101`. | `retain` | React wrapper exists under singular Breadcrumb; inspect ordered-list structure, current-page and overflow semantics before treating alias as aligned (Breadcrumb.tsx:278-359; docs:13-20). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [button](#core-a-010) | local-only | `components/button.mdx:155`, `dist/components/button.css:8` | `packages/components/src/components/button/Button.tsx:207`. | `retain` | Button confirmation is an approved local Popover composition; retain public API. Check upstream color CSS/workaround issue #44 and documented icon/loading variants (Button.tsx:207-287; classes/button.ts:11-26; docs:151-209). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [card](#core-a-011) | local-only | `components/card.mdx:14`, `dist/components/card.css:8` | `packages/components/src/components/card/Card.tsx:20`. | `retain` | React card root exists; no default tilt in pinned contract; variant/subcomponent coverage needs source review (Card.tsx:20; docs:12-20). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [carousel](#core-a-012) | design | `components/carousel.mdx:12`, `dist/components/carousel.css:2` | `packages/components/src/components/carousel/Carousel.tsx:100`. | `adapt` | Local JS index, arrows, dots and aria-hidden slides differ from upstream native scroll-snap example; retain public API only after behavior/design decision (Carousel.tsx:102-165; docs:12-30). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [cascader](#core-a-013) | design | `components/cascader.mdx:18`, `dist/components/cascader.css:8` | `packages/components/src/components/cascader/Cascader.tsx:228`. | `adapt` | Local controlled menu roles and div dropdown differ from native popover trigger/panels example (Cascader.tsx:571-610; docs:15-25). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [chat](#core-a-014) | local-only | `components/chat.mdx:14`, `dist/components/chat.css:7` | `packages/components/src/components/chat/Chat.tsx:36`. | `retain` | Local compound primitives support streaming; long pre needs tabindex/label when scrollable, which is not supplied by ChatBubble itself (Chat.tsx:58-68; docs:12-20). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [checkbox](#core-a-015) | behavior | `components/checkbox.mdx:34`, `dist/components/checkbox.css:50` | `packages/components/src/components/checkbox/Checkbox.tsx:44`. | `retain` | Native input and CSS class placement agree (`U:checkbox:34-44`, `C:checkbox:81-155`, `L:Checkbox.tsx:34-61`); indeterminate restoration after form reset remains unresolved. Preserve local size/color/loading props. | Source partial; reset UNKNOWN; runtime NOT_RUN |
| [chip](#core-a-016) | design | `components/chip.mdx:13`, `dist/components/chip.css:8` | `packages/components/src/components/tag/Tag.tsx:30`. | `adapt` | Local Tag alias emits chip styles, but CheckableTag uses span role=checkbox; native control/keyboard and removable semantics need review (Tag.tsx:40-43,106-112; docs:19-25). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [circle-menu](#core-a-017) | gap | `components/circle-menu.mdx:13`, `dist/components/circle-menu.css:17` | no dedicated local TSX directory. | `add` | No dedicated wrapper; checkbox-label-link structure has stateful keyboard implications. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [code-block](#core-a-018) | gap | `components/code-block.mdx:17`, `dist/components/code-block.css:12` | no dedicated local TSX directory. | `add` | No dedicated wrapper; optional copy action needs application behavior. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [collapse](#core-a-019) | design | `components/collapse.mdx:17`, `dist/components/collapse.css:8` | `packages/components/src/components/collapse/Collapse.tsx:73`. | `adapt` | Closed panels are unmounted, so there is no residual focusable closed content; omission of hidden/inert is not itself a bug. Source gaps are aria-controls referencing an absent target when closed, possible ID collision across instances using the same key, and no focus return before a panel containing focus is unmounted by a controlled change or exclusive-group selection (Collapse.tsx:52-69,81,95-112; docs:17-24,45-72). Conditional unmount also skips the documented closing transition. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [console-page](#core-a-020) | local-only | `layout/console-page.mdx:14`, `dist/components/console-page.css:7` | `packages/components/src/components/console-page/ConsolePage.tsx:49`. | `retain` | Wrapper now exists despite stale plan absence row; compact popover and sidebar controls need source audit (ConsolePage.tsx:125-203; docs:14-16). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [countdown](#core-a-021) | gap | `components/countdown.mdx:13`, `dist/components/countdown.css:2` | no dedicated local TSX directory. | `block` | No dedicated wrapper; application owns timer, so a CSS-only span may be sufficient after API decision. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [datepicker](#core-a-022) | design | `components/datepicker.mdx:14`, `dist/components/datepicker.css:50` | `packages/components/src/components/date-picker/DatePicker.tsx:115`. | `adapt` | Local DatePicker input + class-controlled dropdown differs from native date input guidance; preserve local API while documenting/adding native path (DatePicker.tsx:118-158; docs:14-16,38-59). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [dialog](#core-a-023) | gap | `components/dialog.mdx:14`, `dist/components/dialog.css:31` | no dedicated local TSX directory. | `add` | No dedicated wrapper; native dialog and Modal overlap require API design decision. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [diff](#core-a-024) | gap | `components/diff.mdx:13`, `dist/components/diff.css:2` | no dedicated local TSX directory. | `add` | No dedicated wrapper; native range/comparison composition needs API decision. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [divider](#core-a-025) | design | `components/divider.mdx:14`, `dist/components/divider.css:13` | `packages/components/src/components/divider/Divider.tsx:32`. | `adapt` | Published canonical `.divider-start/end` (`U:divider:24-28`, `C:divider:227-241`) are not emitted by labelPosition, which emits supported legacy `.divider-text-left/right` (`L:Divider.tsx:22-43`). Emit canonical classes while retaining aliases. | Source GAP; runtime NOT_RUN |
| [drawer](#core-a-026) | design | `components/drawer.mdx:18`, `dist/components/drawer.css:8` | `packages/components/src/components/drawer/Drawer.tsx:60`. | `adapt` | Local Drawer uses class-controlled div/aria-hidden; pinned docs recommend native popover/dialog and retain legacy class path. Keep API but classify native path as gap (Drawer.tsx:58-83; docs:16-54). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [dropdown](#core-a-027) | design | `components/dropdown.mdx:22`, `dist/components/dropdown.css:7` | `packages/components/src/components/dropdown/Dropdown.tsx:46`. | `adapt` | Local controlled role=menu div conflicts with pinned native .dropdown-content[popover] contract and docs warning against menu roles without keyboard pattern (Dropdown.tsx:200-214; docs:20-22,61). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [fab](#core-a-028) | local-only | `components/fab.mdx:14`, `dist/components/fab.css:9` | `packages/components/src/components/fab/Fab.tsx:39`. | `retain` | Wrapper now exists despite stale plan absence row; native popover speed dial is emitted (Fab.tsx:38-55; docs:44-80). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [file-input](#core-a-029) | gap | `components/file-input.mdx:14`, `dist/components/file-input.css:50` | no dedicated local TSX directory. | `add` | No dedicated native file input wrapper; existing Upload is richer, separate contract. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [file-upload](#core-a-030) | design | `components/file-upload.mdx:14`, `dist/components/file-upload.css:8` | `packages/components/src/components/upload/Upload.tsx:240`. | `adapt` | Upload dropzone is focusable div role=button, expressly discouraged by pinned docs; retain Upload API but adapt to real input/button path (Upload.tsx:245-250; docs:54-58). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [filter-group](#core-a-031) | gap | `components/filter-group.mdx:14`, `dist/components/filter-group.css:8` | no dedicated local TSX directory. | `add` | No dedicated wrapper for real radio/checkbox chip grouping; React composition remains possible. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [footer](#core-a-032) | local-only | `components/footer.mdx:14`, `dist/components/footer.css:7` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; semantic footer/nav HTML composition matches CSS-only primitive. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [form](#core-a-033) | behavior | `components/form.mdx:14`, `dist/components/form.css:54` | `packages/components/src/components/form/Form.tsx:363`. | `adapt` | Form store prevents native submit and lacks native reset reconciliation (`U:form:14-15,42-73`, `L:Form.tsx:43-130,359-375`). Current label association fix is source implemented, while help/error IDs and fieldset disabled remain gaps. Preserve store API. | Label source implemented; remaining source GAP; runtime NOT_RUN |
| [form-group](#core-a-034) | local-only | `components/form-group.mdx:14`, `dist/components/form-group.css:50` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; native label/input/fieldset composition is intentionally CSS-only. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [hero](#core-a-035) | local-only | `components/hero.mdx:14`, `dist/components/hero.css:7` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; semantic section/content/overlay composition is intentionally CSS-only. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [home-page](#core-a-036) | gap | `layout/home-page.mdx:14`, `dist/components/home-page.css:7` | no dedicated local TSX directory. | `add` | No dedicated wrapper; documented compact popover/nav coordination needs an API decision. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [indicator](#core-a-037) | local-only | `components/indicator.mdx:14`, `dist/components/indicator.css:7` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; marker/content composition is intentionally CSS-only. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [input](#core-a-038) | behavior | `components/input.mdx:34`, `dist/components/input.css:50` | `packages/components/src/components/input/Input.tsx:101`. | `adapt` | Uncontrolled `InputRoot` holds React value state without native form reset synchronization (`U:input:34-45`, `L:Input.tsx:42-116`). Retain Search/Password/TextArea/Group APIs; add reset reconciliation in scoped implementation. | Source GAP; runtime NOT_RUN |
| [join](#core-a-039) | local-only | `components/join.mdx:14`, `dist/components/join.css:7` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; native grouped controls are intentionally CSS-only. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [kbd](#core-a-040) | local-only | `components/kbd.mdx:30`, `dist/components/kbd.css:2` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; native kbd composition is intentionally CSS-only. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [link](#core-a-041) | local-only | `components/link.mdx:14`, `dist/components/link.css:3` | no dedicated local TSX directory. | `retain` | No dedicated wrapper; native anchor composition is intentionally CSS-only. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [list](#core-a-042) | design | `components/list.mdx:14`, `dist/components/list.css:8` | `packages/components/src/components/list/List.tsx:44`. | `adapt` | Local List and List.Item render div elements; interactive List.Item gives the div role=button and a key handler. Pinned docs show semantic ul/li with native link/button for interactive items. Title/secondary use supported historical aliases (List.tsx:44-50,60-64,131-144; docs:12-22). | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [loading](#core-loading-b) | local-only | pinned docs `components/loading.mdx:14`; published CSS `loading.css:1` | `packages/components/src/components/spin/Spin.tsx:1` | `retain` | retain CSS composition; Spin is distinct. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [markdown-body](#core-markdown_body-b) | local-only | pinned docs `components/markdown-body.mdx:270`; published CSS `markdown-body.css:1` | `packages/components/src/components/markdown/Markdown.tsx:1` | `retain` | adapt Markdown class/semantics only if same selector applies. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [mask](#core-mask-b) | local-only | pinned docs `components/mask.mdx:14`; published CSS `mask.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS-only composition. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [megamenu](#core-megamenu-b) | local-only | pinned docs `components/megamenu.mdx:22`; published CSS `megamenu.css:1` | `packages/components/src/components/megamenu/Megamenu.tsx:1` | `retain` | adapt committed wrapper where native relationships are incomplete. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [menu](#core-menu-b) | design | pinned docs `components/menu.mdx:13`; published CSS `menu.css:1` | `packages/components/src/components/menu/Menu.tsx:1` | `adapt` | Menu defaults to ARIA menu/menuitem; upstream ordinary navigation explicitly rejects those roles. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [modal](#core-modal-b) | design | pinned docs `components/modal.mdx:14`; published CSS `modal.css:1` | `packages/components/src/components/modal/Modal.tsx:1` | `adapt` | Modal sets aria-modal without a focus trap or background inert handling. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [multi-select](#core-multi_select-b) | gap | pinned docs `components/multi-select.mdx:13`; published CSS `multi-select.css:1` | `packages/components/src/components (no dedicated wrapper)` | `add` | No dedicated React wrapper for multi-value trigger, tags, native popover.; design and CSS-only composition decision pending. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [navbar](#core-navbar-b) | gap | pinned docs `components/navbar.mdx:16`; published CSS `navbar.css:1` | `packages/components/src/components (no dedicated wrapper)` | `add` | No dedicated React wrapper for responsive navigation header.; design and CSS-only composition decision pending. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [navigation](#core-navigation-b) | local-only | pinned docs `no pinned page`; published CSS `navigation.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS-only, mark doc contract unknown. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [nested-menu](#core-nested_menu-b) | gap | pinned docs `components/nested-menu.mdx:3`; published CSS `nested-menu.css:1` | `packages/components/src/components (no dedicated wrapper)` | `add` | No dedicated React wrapper for native hierarchical disclosure.; design and CSS-only composition decision pending. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [otp-input](#core-otp_input-b) | local-only | pinned docs `components/otp-input.mdx:15`; published CSS `otp-input.css:1` | `packages/components/src/components/otp-input/OtpInput.tsx:1` | `retain` | retain new wrapper; audit native constraints. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [pagination](#core-pagination-b) | local-only | pinned docs `components/pagination.mdx:16`; published CSS `pagination.css:1` | `packages/components/src/components/pagination/Pagination.tsx:1` | `retain` | adapt if local controls diverge. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [popover](#core-popover-b) | design | pinned docs `components/popover.mdx:15`; published CSS `popover.css:1` | `packages/components/src/components/popover/Popover.tsx:1` | `adapt` | Popover uses .popover-show local state/tooltip role, not native [popover] and anchor positioning. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [progress](#core-progress-b) | gap | pinned docs `components/progress.mdx:24`; published CSS `progress.css:1` | `packages/components/src/components/progress/Progress.tsx:1` | `adapt` | Docs require a named progress indicator (`U:progress:24-27`); local root accepts caller `aria-label` but supplies none (`L:Progress.tsx:29-41`). Add consumer guidance; no defective default component behavior established. | Usage guidance GAP; runtime NOT_RUN |
| [radial-progress](#core-radial_progress-b) | local-only | pinned docs `components/radial-progress.mdx:20`; published CSS `radial-progress.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS-only if consumer supplies synchronized ARIA. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [radio](#core-radio-b) | design | pinned docs `components/radio.mdx:34`; published CSS `radio.css:1` | `packages/components/src/components/radio/Radio.tsx:1` | `adapt` | Published `.radio:checked/:focus-visible/:disabled` styles the input (`C:radio:81-215`); local `.radio` is on the label and input has `.radio-input` (`L:Radio.tsx:29-43`). Preserve local circle/props during migration. | Source GAP; runtime NOT_RUN |
| [range](#core-range-b) | gap | pinned docs `components/range.mdx:3`; published CSS `range.css:1` | `packages/components/src/components (no dedicated wrapper)` | `add` | No dedicated React wrapper for native range field.; design and CSS-only composition decision pending. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [rating](#core-rating-b) | design | pinned docs `components/rating.mdx:14`; published CSS `rating.css:1` | `packages/components/src/components/rate/Rate.tsx:1` | `adapt` | Rate emits div/span ARIA radios, while editable upstream rating is native radio-backed. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [segment-control](#core-segment_control-b) | local-only | pinned docs `components/segment-control.mdx:15`; published CSS `segment-control.css:1` | `packages/components/src/components/segmented/Segmented.tsx:1` | `retain` | adapt Segmented classes/semantics. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [select](#core-select-b) | design | pinned docs `components/select.mdx:14`; published CSS `select.css:1` | `packages/components/src/components/select/Select.tsx:1` | `adapt` | Select renders a custom button/listbox, while upstream `.select` is a native select; preserve custom API as separate pattern. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [sidebar-layout](#core-sidebar_layout-b) | local-only | pinned docs `layout/sidebar-layout.mdx:16`; published CSS `sidebar-layout.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS composition with semantic landmarks. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [sign-page](#core-sign_page-b) | local-only | pinned docs `layout/sign-page.mdx:16`; published CSS `sign-page.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS composition. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [skeleton](#core-skeleton-b) | gap | pinned docs `components/skeleton.mdx:13`; published CSS `skeleton.css:1` | `packages/components/src/components/skeleton/Skeleton.tsx:1` | `block` | Pinned docs promise `.skeleton-input` default 2.75rem (`U:skeleton:109-113,461`); published `C:skeleton.css` and `dist/index.css` omit the selector, and local CSS has none. Upstream duskmoon-dev/duskmoonui#68; retain API, no local CSS workaround. | Confirmed source CONFLICT; BLOCKED_UPSTREAM; runtime NOT_RUN |
| [slider](#core-slider-b) | local-only | pinned docs `components/slider.mdx:14`; published CSS `slider.css:1` | `packages/components/src/components/slider/Slider.tsx:1` | `retain` | retain Slider adapter, document range distinction. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [snackbar](#core-snackbar-b) | gap | pinned docs `components/snackbar.mdx:16`; published CSS `snackbar.css:1` | `packages/components/src/components (no dedicated wrapper)` | `add` | No dedicated React wrapper for brief message, optional action/dismiss.; design and CSS-only composition decision pending. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [stack](#core-stack-b) | local-only | pinned docs `components/stack.mdx:16`; published CSS `stack.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS-only composition. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [stat](#core-stat-b) | local-only | pinned docs `components/stat.mdx:34`; published CSS `stat.css:1` | `packages/components/src/components/statistic/Statistic.tsx:1` | `retain` | adapt Statistic class/slot mapping if needed. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [stepper](#core-stepper-b) | local-only | pinned docs `components/stepper.mdx:16`; published CSS `stepper.css:1` | `packages/components/src/components/steps/Steps.tsx:1` | `retain` | audit Steps class/state compatibility. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [swap](#core-swap-b) | local-only | pinned docs `components/swap.mdx:22`; published CSS `swap.css:1` | `packages/components/src/components/swap/Swap.tsx:1` | `retain` | retain new wrapper; audit reset/disabled. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [switch](#core-switch-b) | design | pinned docs `components/switch.mdx:33`; published CSS `switch.css:1` | `packages/components/src/components/switch/Switch.tsx:1` | `adapt` | Published `.switch` selectors target native input (`C:switch:81-191`); local class sits on label and `.switch-input` relies on overrides (`L:Switch.tsx:45-64`). Preserve callbacks/checkedChildren while aligning placement. | Source GAP; runtime NOT_RUN |
| [table](#core-table-b) | local-only | pinned docs `components/table.mdx:17`; published CSS `table.css:1` | `packages/components/src/components/table/Table.tsx:1` | `retain` | audit local Table semantics and sorting. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [tabs](#core-tabs-b) | local-only | pinned docs `components/tabs.mdx:15`; published CSS `tabs.css:1` | `packages/components/src/components/tabs/Tabs.tsx:1` | `retain` | audit local keyboard/hidden behavior. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [textarea](#core-textarea-b) | behavior | `U:textarea:70-79`; `L:Input.tsx:239-301` showCount/internal value lack native reset synchronization | `packages/components/src/components/input/Input.tsx`, classes and docs | `adapt` | Preserve `Input.TextArea` API while reconciling uncontrolled reset and visual count; native textarea selector placement otherwise aligns in source. | Source GAP; runtime NOT_RUN |
| [theme-controller](#core-theme_controller-b) | local-only | pinned docs `components/theme-controller.mdx:28`; published CSS `theme-controller.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS composition, no automatic persistence. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [time-input](#core-time_input-b) | local-only | pinned docs `components/time-input.mdx:15`; published CSS `time-input.css:1` | `packages/components/src/components/time-picker/TimePicker.tsx:1` | `retain` | adapt TimePicker if compatible, else separate API. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [timeline](#core-timeline-b) | design | pinned docs `components/timeline.mdx:21`; published CSS `timeline.css:1` | `packages/components/src/components/timeline/Timeline.tsx:1` | `adapt` | Timeline emits div chronology and span labels, while upstream calls for ol/li/time. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [toast](#core-toast-b) | design | pinned docs `components/toast.mdx:20`; published CSS `toast.css:1` | `packages/components/src/components/notification/Notification.tsx:1` | `adapt` | Notification defaults role=alert and local controller; upstream ordinary toast uses role=status and manual popover, though legacy open classes remain. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [toggle](#core-toggle-b) | gap | pinned docs `components/toggle.mdx:38`; published CSS `toggle.css:1` | `packages/components/src/components (no dedicated wrapper)` | `add` | No dedicated React wrapper for pressed action button, separate from Switch.; design and CSS-only composition decision pending. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [toggle-switch](#core-toggle_switch-b) | local-only | pinned docs `no pinned page`; published CSS `toggle-switch.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS-only; doc contract unknown. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [tooltip](#core-tooltip-b) | local-only | pinned docs `components/tooltip.mdx:14-20, :190-198`; published CSS `tooltip.css:5-8` | `packages/components/src/components/tooltip/Tooltip.tsx:73-105, :147-186; L:packages/components/src/classes/tooltip.ts:22-43` | `retain` | `retain` the approved React compatibility adapter; record the absent native Interest Invoker trigger as an upstream mechanism gap for a separately scoped decision; The native surface is arrowless: `arrow` defaults true in the React prop, but the component renders no `.tooltip-arrow` child and the published native CSS has no arrow selector. Do not infer a rendered-arrow mismatch from the prop default. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [tree-select](#core-tree_select-b) | design | pinned docs `components/tree-select.mdx:15`; published CSS `tree-select.css:1` | `packages/components/src/components/tree-select/TreeSelect.tsx:1` | `adapt` | TreeSelect renders a CSS dropdown without popover, unlike native [popover=auto] upstream. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [validator](#core-validator-b) | local-only | pinned docs `components/validator.mdx:15`; published CSS `validator.css:1` | `packages/components/src/components (no dedicated wrapper)` | `retain` | retain CSS-only utility; application owns messages. | Source PARTIAL or UNKNOWN; audit NOT_RUN |
| [Switch reset](#core-switch-b) | behavior | Native reset can change checkbox checked while local `isChecked`/`aria-checked` and track remain stale (`U:switch:33-47`, `L:Switch.tsx:27-63`). Synchronize uncontrolled state without removing controlled callback API. | Relevant local wrapper/CSS/README | `adapt` | Native reset can change checkbox checked while local `isChecked`/`aria-checked` and track remain stale (`U:switch:33-47`, `L:Switch.tsx:27-63`). Synchronize uncontrolled state without removing controlled callback API. | Source GAP; runtime NOT_RUN |
| [Textarea reset/count](#core-textarea-b) | behavior | `Input.TextArea` internal/currentValue and showCount lack native form reset path (`U:textarea:70-79`, `L:Input.tsx:239-301`). Keep autoSize/resize/count props and restore value/count on reset. | Relevant local wrapper/CSS/README | `adapt` | `Input.TextArea` internal/currentValue and showCount lack native form reset path (`U:textarea:70-79`, `L:Input.tsx:239-301`). Keep autoSize/resize/count props and restore value/count on reset. | Source GAP; runtime NOT_RUN |
| [Skeleton busy region](#core-skeleton-b) | gap | Pinned skeleton guidance puts aria-busy on the loaded region and hides decorative placeholders (`U:skeleton:13,17-20`) | Relevant local wrapper/CSS/README | `adapt` | Pinned skeleton guidance puts aria-busy on the loaded region and hides decorative placeholders (`U:skeleton:13,17-20`); local composite puts busy on wrapper and leaves lines/avatar unhidden (`L:Skeleton.tsx:138-177`). Preserve loading/subcomponents while reconciling semantics. | Source GAP; runtime NOT_RUN |
| [Switch loading](#core-switch-b) | behavior | Local loading disables native input (`L:Switch.tsx:32,54`), so it does not contribute a form value | Relevant local wrapper/CSS/README | `retain` | Local loading disables native input (`L:Switch.tsx:32,54`), so it does not contribute a form value; this is React-specific behavior to document, not an upstream native styling claim. | Source understood; runtime NOT_RUN |

## Family source reviews and future audits

In the ten refined entries, `U:<family>:line` refers to pinned `v1.20.0` component MDX, `C:<family>:line` to published Core 1.20.0 component CSS, and `L:` to local `packages/components/src/`. These references are source evidence; all browser behavior remains `NOT_RUN`.

## Priority findings

- **Adapt:** Dropdown native Popover contract; Collapse focus return/ID association on conditional unmount; Upload dropzone keyboard path; List interactive semantics; FormItem label association (source implemented, runtime NOT_RUN).
- **Design decision:** Carousel native scroll-snap versus retained JS API; Cascader native Popover versus controlled menu API; Drawer native path while preserving legacy; Dialog versus existing Modal; missing stateful wrappers (Accordion, Appbar, Bottom Navigation, Circle Menu, Code Block, Diff, Filter Group, Home Page).
- **Retain:** React aliases and CSS-only semantic compositions where a wrapper adds little value. ConsolePage and Fab exist now; the older plan rows saying absent are stale. Button confirmation and Tooltip lifecycle remain approved local contracts.
- **Potential upstream issue:** Button color workaround already cites `duskmoon-dev/duskmoonui#44`; no new dependency bug was proved in this read-only review.

## Per-family contracts and future audits

### CORE-A-001 `accordion`
Contract: native details/summary or controlled button plus hidden/inert panel. Evidence: `components/accordion.mdx:14`; `dist/components/accordion.css:8`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper; documented native and controlled contracts need an API decision.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/accordion.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/accordion.css:8`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/accordion.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/accordion.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-001 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `accordion` using the local React API or documented native composition. Action: open one panel then close it; focus must leave a hidden panel. Expected: native details/summary or controlled button plus hidden/inert panel behaves as described at `components/accordion.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-002 `alert`
Contract: inline alert row, optional bottom actions and named close button. Evidence: `components/alert.mdx:14`; `dist/components/alert.css:8`. Local: `packages/components/src/components/alert/Alert.tsx:8`.
Disposition: **adapt / retain public API**. Local role="alert" forces announcement for every alert; pinned docs delegate live-region policy to application (Alert.tsx:10; docs:14).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/alert.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/alert.css:8`; `packages/components/src/components/alert/Alert.tsx:8`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/alert.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | GAP | Pinned semantics `components/alert.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/alert/Alert.tsx:8`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-002 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `alert` using the local React API or documented native composition. Action: dismiss a closeable alert; inspect focus and announcement policy. Expected: inline alert row, optional bottom actions and named close button behaves as described at `components/alert.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-003 `appbar`
Contract: semantic header, leading/title/trailing slots and position variants. Evidence: `components/appbar.mdx:14`; `dist/components/appbar.css:8`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper for documented header/slot/position contract.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/appbar.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/appbar.css:8`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/appbar.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/appbar.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-003 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `appbar` using the local React API or documented native composition. Action: activate named navigation and search actions. Expected: semantic header, leading/title/trailing slots and position variants behaves as described at `components/appbar.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-004 `autocomplete`
Contract: combobox/listbox, selected and disabled option states. Evidence: `components/autocomplete.mdx:14`; `dist/components/autocomplete.css:10`. Local: `packages/components/src/components/auto-complete/AutoComplete.tsx:79`.
Disposition: **retain / audit**. Local option nodes are buttons and listbox container is div; pinned example uses ul/li options. Semantics may be viable but CSS selector and active-descendant behavior need source audit (AutoComplete.tsx:245-250,328-336; docs:43-53).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/autocomplete.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/autocomplete.css:10`; `packages/components/src/components/auto-complete/AutoComplete.tsx:79`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/autocomplete.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/autocomplete.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/auto-complete/AutoComplete.tsx:79`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-004 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `autocomplete` using the local React API or documented native composition. Action: filter, arrow through options, select, reset and try disabled option. Expected: combobox/listbox, selected and disabled option states behaves as described at `components/autocomplete.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-005 `avatar`
Contract: status classes or visible Indicator composition, without duplicate marker. Evidence: `components/avatar.mdx:13`; `dist/components/avatar.css:8`. Local: `packages/components/src/components/avatar/Avatar.tsx:24`.
Disposition: **block 2xl / retain current sizes**. Upstream docs advertise 2xl but the published avatar stylesheet lacks that selector; upstream issue duskmoon-dev/duskmoonui#67 blocks a usable local size. Retain current sizes; status/ring/indicator breadth remains unknown (docs:13-25,68-73).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/avatar.mdx:13`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | GAP | Published selectors `dist/components/avatar.css:8`; `packages/components/src/components/avatar/Avatar.tsx:24`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/avatar.mdx:13`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/avatar.mdx:13`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/avatar/Avatar.tsx:24`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-005 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `avatar` using the local React API or documented native composition. Action: render image/initials with status and clickable avatar. Expected: status classes or visible Indicator composition, without duplicate marker behaves as described at `components/avatar.mdx:13`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-006 `badge`
Contract: canonical outlined and default aliases; named remove button. Evidence: `components/badge.mdx:13`; `dist/components/badge.css:8`. Local: `packages/components/src/components/badge/Badge.tsx:22`.
Disposition: **adapt implemented in source / retain public API**. The baseline emitted only badge-outline; current source emits both badge-outlined and badge-outline for appearance="outline", preserving the public prop. Other variants remain under audit (classes/badge.ts:23-29; docs:13-18; CSS:78-81).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | ALIGNED_SOURCE | Canonical `badge-outlined` plus retained `badge-outline` alias (`U:badge:11-18`; `C:badge:78-81`) are both emitted for `appearance=outline` in current source (`L:classes/badge.ts:24-29`). This narrow source change is implemented; runtime remains NOT_RUN. |
| Markup/style | ALIGNED_SOURCE | Root `.badge` plus semantic color, appearance and size (`L:components/badge/Badge.tsx:5-24`; `L:classes/badge.ts:9-35`) match core selectors (`C:badge:8-81`). Badge `div` is valid for label content, while upstream examples use span; no span requirement was found. |
| Interaction | N/A | Badge itself has no removal handler (`L:components/badge/Badge.tsx:5-25`); docs say the application handles removal/focus restoration (`U:badge:16-19`). Caller may supply a named button as child. |
| Accessibility | UNKNOWN | Wrapper does not name icon-only/dot badges; docs require visible text or accessible label (`U:badge:253-263`). Caller-owned accessible content and removable button naming need audit. |
| Local compatibility | UNKNOWN | Disposition: Keep `appearance=outline` spelling, extra semantic colors and arbitrary children (`L:components/badge/Badge.types.ts:4-25`; `L:components/badge/Badge.tsx:10-24`). Notification/removable variants are CSS compositions (`C:badge:251-255`), not built-in React state APIs. |

Future audit **CORE-A-006 / NOT_RUN** — Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: render outline in each color/size and a long label; inspect canonical and alias classes/wrapping. Compose notification and removable badges with a named button, remove by keyboard and verify focus restoration. Expected: Outline emits canonical and compatibility classes; caller-composed removable control is named and focus restoration is application-owned. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes.

### CORE-A-007 `bottom-navigation`
Contract: fixed dock with destination anchors and current-page state. Evidence: `components/bottom-navigation.mdx:13`; `dist/components/bottom-navigation.css:8`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated destination/dock wrapper; app composition could use CSS directly but current plan calls it a first-class gap.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/bottom-navigation.mdx:13`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/bottom-navigation.css:8`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/bottom-navigation.mdx:13`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/bottom-navigation.mdx:13`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-007 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `bottom-navigation` using the local React API or documented native composition. Action: navigate with keyboard and inspect fixed safe-area spacing. Expected: fixed dock with destination anchors and current-page state behaves as described at `components/bottom-navigation.mdx:13`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-008 `bottomsheet`
Contract: native popover or dialog sheet; legacy class path remains supported. Evidence: `components/bottom-sheet.mdx:18`; `dist/components/bottomsheet.css:8`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only / decide native overlay wrapper**. No dedicated wrapper; native popover/dialog and legacy class paths are available for CSS-only composition (docs:16-64).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/bottom-sheet.mdx:18`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/bottomsheet.css:8`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/bottom-sheet.mdx:18`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/bottom-sheet.mdx:18`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-008 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `bottomsheet` using the local React API or documented native composition. Action: open, Escape/outside dismiss, then restore trigger focus. Expected: native popover or dialog sheet; legacy class path remains supported behaves as described at `components/bottom-sheet.mdx:18`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-009 `breadcrumbs`
Contract: labeled nav with ordered list, aria-current and hidden separators. Evidence: `components/breadcrumbs.mdx:13`; `dist/components/breadcrumbs.css:7`. Local: `packages/components/src/components/breadcrumb/Breadcrumb.tsx:101`.
Disposition: **retain / audit**. React wrapper exists under singular Breadcrumb; inspect ordered-list structure, current-page and overflow semantics before treating alias as aligned (Breadcrumb.tsx:278-359; docs:13-20).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/breadcrumbs.mdx:13`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/breadcrumbs.css:7`; `packages/components/src/components/breadcrumb/Breadcrumb.tsx:101`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/breadcrumbs.mdx:13`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/breadcrumbs.mdx:13`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/breadcrumb/Breadcrumb.tsx:101`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-009 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `breadcrumbs` using the local React API or documented native composition. Action: navigate ancestors and collapsed overflow with keyboard. Expected: labeled nav with ordered list, aria-current and hidden separators behaves as described at `components/breadcrumbs.mdx:13`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-010 `button`
Contract: native button variants, disabled/loading and named icon actions. Evidence: `components/button.mdx:155`; `dist/components/button.css:8`. Local: `packages/components/src/components/button/Button.tsx:207`.
Disposition: **retain / audit**. Button confirmation is an approved local Popover composition; retain public API. Check upstream color CSS/workaround issue #44 and documented icon/loading variants (Button.tsx:207-287; classes/button.ts:11-26; docs:151-209).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/button.mdx:155`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/button.css:8`; `packages/components/src/components/button/Button.tsx:207`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/button.mdx:155`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/button.mdx:155`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/button/Button.tsx:207`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-010 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `button` using the local React API or documented native composition. Action: activate normal, disabled, loading and icon-only buttons. Expected: native button variants, disabled/loading and named icon actions behaves as described at `components/button.mdx:155`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-011 `card`
Contract: card-body content composition without default tilt. Evidence: `components/card.mdx:14`; `dist/components/card.css:8`. Local: `packages/components/src/components/card/Card.tsx:20`.
Disposition: **retain / audit**. React card root exists; no default tilt in pinned contract; variant/subcomponent coverage needs source review (Card.tsx:20; docs:12-20).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/card.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/card.css:8`; `packages/components/src/components/card/Card.tsx:20`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/card.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/card.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/card/Card.tsx:20`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-011 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `card` using the local React API or documented native composition. Action: render structured card and confirm no unintended tilt. Expected: card-body content composition without default tilt behaves as described at `components/card.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-012 `carousel`
Contract: native scroll-snap with accessible slide controls. Evidence: `components/carousel.mdx:12`; `dist/components/carousel.css:2`. Local: `packages/components/src/components/carousel/Carousel.tsx:100`.
Disposition: **adapt / retain public API**. Local JS index, arrows, dots and aria-hidden slides differ from upstream native scroll-snap example; retain public API only after behavior/design decision (Carousel.tsx:102-165; docs:12-30).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | CONFLICT | Pinned contract `components/carousel.mdx:12`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/carousel.css:2`; `packages/components/src/components/carousel/Carousel.tsx:100`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/carousel.mdx:12`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/carousel.mdx:12`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/carousel/Carousel.tsx:100`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-012 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `carousel` using the local React API or documented native composition. Action: scroll with keyboard/pointer and inspect visible slide state. Expected: native scroll-snap with accessible slide controls behaves as described at `components/carousel.mdx:12`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-013 `cascader`
Contract: popover trigger and adjacent option panels. Evidence: `components/cascader.mdx:18`; `dist/components/cascader.css:8`. Local: `packages/components/src/components/cascader/Cascader.tsx:228`.
Disposition: **adapt / retain public API**. Local controlled menu roles and div dropdown differ from native popover trigger/panels example (Cascader.tsx:571-610; docs:15-25).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/cascader.mdx:18`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | GAP | Published selectors `dist/components/cascader.css:8`; `packages/components/src/components/cascader/Cascader.tsx:228`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | GAP | Pinned behavior `components/cascader.mdx:18`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/cascader.mdx:18`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/cascader/Cascader.tsx:228`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-013 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `cascader` using the local React API or documented native composition. Action: open, traverse levels, select leaf, Escape and restore focus. Expected: popover trigger and adjacent option panels behaves as described at `components/cascader.mdx:18`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-014 `chat`
Contract: CSS transcript primitives, wrapping and keyboard-scrollable code. Evidence: `components/chat.mdx:14`; `dist/components/chat.css:7`. Local: `packages/components/src/components/chat/Chat.tsx:36`.
Disposition: **retain / audit**. Local compound primitives support streaming; long pre needs tabindex/label when scrollable, which is not supplied by ChatBubble itself (Chat.tsx:58-68; docs:12-20).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/chat.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/chat.css:7`; `packages/components/src/components/chat/Chat.tsx:36`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/chat.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/chat.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/chat/Chat.tsx:36`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-014 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `chat` using the local React API or documented native composition. Action: append message and keyboard-scroll a long code block. Expected: CSS transcript primitives, wrapping and keyboard-scrollable code behaves as described at `components/chat.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-015 `checkbox`
Contract: native checked, disabled and form submission states. Evidence: `components/checkbox.mdx:34`; `dist/components/checkbox.css:50`. Local: `packages/components/src/components/checkbox/Checkbox.tsx:44`.
Disposition: **retain / audit**. Native input exists; check visual wrapper against form reset/disabled contract (Checkbox.tsx:44-58; docs:34-37).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | ALIGNED_SOURCE | Native checkbox owns selection/submission/reset (`U:checkbox:34-44`); local input remains `type=checkbox` (`L:components/checkbox/Checkbox.tsx:49-56`). Keep React color/size/loading props (`L:components/checkbox/Checkbox.types.ts:19-28`). |
| Markup/style | ALIGNED_SOURCE | `.checkbox` is on the input (`L:classes/checkbox.ts:8-10,60-75`; `L:components/checkbox/Checkbox.tsx:49-55`), matching `C:checkbox:81-155`; surrounding `.checkbox-wrapper` is a local presentation adapter (`L:styles.css:1655-1660`). |
| Interaction | UNKNOWN | `indeterminate` is set only in an effect when the prop changes (`L:components/checkbox/Checkbox.tsx:34-38`); the docs explicitly require application resynchronization after reset (`U:checkbox:43-44`). Native checked/disabled are forwarded, but reset of indeterminate with unchanged prop is not established. `loading` makes native disabled (`L:components/checkbox/Checkbox.tsx:40,54`). |
| Accessibility | ALIGNED_SOURCE | Wrapping label names the control when children exist; `aria-checked=mixed` and actual DOM `indeterminate` agree (`L:components/checkbox/Checkbox.tsx:43-61`; `U:checkbox:43-44`). With no children, caller must provide a name as in docs example (`U:checkbox:52`). |
| Local compatibility | UNKNOWN | Disposition: Local `error`, label position and loading are additive (`L:components/checkbox/Checkbox.types.ts:19-28`); do not remove. No upstream CSS defect established. |

Future audit **CORE-A-015 / NOT_RUN** — Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: mount checked/unchecked/indeterminate checkboxes in a named form, toggle with Space, reset, submit, and disable via input and fieldset. Observe actual checked/indeterminate state, submitted values, focus exclusion, and accessible names; then change `indeterminate` prop after reset. Expected: Native checked/disabled and mixed state match the submitted value and accessible name; any indeterminate state after reset is explicitly synchronized. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes.

### CORE-A-016 `chip`
Contract: assist/filter/input/selection chip semantics and removable actions. Evidence: `components/chip.mdx:13`; `dist/components/chip.css:8`. Local: `packages/components/src/components/tag/Tag.tsx:30`.
Disposition: **adapt / retain public API**. Local Tag alias emits chip styles, but CheckableTag uses span role=checkbox; native control/keyboard and removable semantics need review (Tag.tsx:40-43,106-112; docs:19-25).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/chip.mdx:13`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/chip.css:8`; `packages/components/src/components/tag/Tag.tsx:30`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/chip.mdx:13`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/chip.mdx:13`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/tag/Tag.tsx:30`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-016 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `chip` using the local React API or documented native composition. Action: toggle/filter/remove chips with keyboard and inspect state. Expected: assist/filter/input/selection chip semantics and removable actions behaves as described at `components/chip.mdx:13`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-017 `circle-menu`
Contract: checkbox-driven radial item list and labeled trigger. Evidence: `components/circle-menu.mdx:13`; `dist/components/circle-menu.css:17`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper; checkbox-label-link structure has stateful keyboard implications.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/circle-menu.mdx:13`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/circle-menu.css:17`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/circle-menu.mdx:13`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/circle-menu.mdx:13`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-017 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `circle-menu` using the local React API or documented native composition. Action: toggle radial menu by keyboard and follow an item. Expected: checkbox-driven radial item list and labeled trigger behaves as described at `components/circle-menu.mdx:13`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-018 `code-block`
Contract: code header/content with optional copy action. Evidence: `components/code-block.mdx:17`; `dist/components/code-block.css:12`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper; optional copy action needs application behavior.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/code-block.mdx:17`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/code-block.css:12`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/code-block.mdx:17`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/code-block.mdx:17`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-018 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `code-block` using the local React API or documented native composition. Action: copy code and inspect clipboard feedback and focus. Expected: code header/content with optional copy action behaves as described at `components/code-block.mdx:17`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-019 `collapse`
Contract: details[open] or controlled button with truthful ARIA and safe focus handling. Evidence: `components/collapse.mdx:17`; `dist/components/collapse.css:8`. Local: `packages/components/src/components/collapse/Collapse.tsx:73`.
Disposition: **adapt / retain public API**. Closed panels are unmounted, so there is no residual focusable closed content; omission of hidden/inert is not itself a bug. Source gaps are aria-controls referencing an absent target when closed, possible ID collision across instances using the same key, and no focus return before a panel containing focus is unmounted by a controlled change or exclusive-group selection (Collapse.tsx:52-69,81,95-112; docs:17-24,45-72). Conditional unmount also skips the documented closing transition.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/collapse.mdx:17`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/collapse.css:8`; `packages/components/src/components/collapse/Collapse.tsx:73`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | GAP | Pinned behavior `components/collapse.mdx:17`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | GAP | Pinned semantics `components/collapse.mdx:17`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/collapse/Collapse.tsx:73`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-019 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `collapse` using the local React API or documented native composition. Action: close while focus is inside; verify focus return, unique ID and valid aria-controls target. Expected: details[open] or controlled button with truthful ARIA and safe focus handling behaves as described at `components/collapse.mdx:17`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-020 `console-page`
Contract: appbar, sidebar state and compact popover navigation. Evidence: `layout/console-page.mdx:14`; `dist/components/console-page.css:7`. Local: `packages/components/src/components/console-page/ConsolePage.tsx:49`.
Disposition: **retain / audit**. Wrapper now exists despite stale plan absence row; compact popover and sidebar controls need source audit (ConsolePage.tsx:125-203; docs:14-16).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `layout/console-page.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/console-page.css:7`; `packages/components/src/components/console-page/ConsolePage.tsx:49`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `layout/console-page.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `layout/console-page.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/console-page/ConsolePage.tsx:49`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-020 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `console-page` using the local React API or documented native composition. Action: resize container, toggle sidebar and compact navigation. Expected: appbar, sidebar state and compact popover navigation behaves as described at `layout/console-page.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-021 `countdown`
Contract: numeric presentation with application-owned timekeeping. Evidence: `components/countdown.mdx:13`; `dist/components/countdown.css:2`. Local: no dedicated local TSX directory.
Disposition: **block API decision / retain CSS-only**. No dedicated wrapper; application owns timer, so a CSS-only span may be sufficient after API decision.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/countdown.mdx:13`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/countdown.css:2`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/countdown.mdx:13`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/countdown.mdx:13`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-021 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `countdown` using the local React API or documented native composition. Action: advance timer and inspect visible/announced value. Expected: numeric presentation with application-owned timekeeping behaves as described at `components/countdown.mdx:13`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-022 `datepicker`
Contract: native date input or truthful popup calendar selection. Evidence: `components/datepicker.mdx:14`; `dist/components/datepicker.css:50`. Local: `packages/components/src/components/date-picker/DatePicker.tsx:115`.
Disposition: **adapt / retain public API**. Local DatePicker input + class-controlled dropdown differs from native date input guidance; preserve local API while documenting/adding native path (DatePicker.tsx:118-158; docs:14-16,38-59).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/datepicker.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | GAP | Published selectors `dist/components/datepicker.css:50`; `packages/components/src/components/date-picker/DatePicker.tsx:115`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/datepicker.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/datepicker.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/date-picker/DatePicker.tsx:115`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-022 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `datepicker` using the local React API or documented native composition. Action: type date, choose date, reset and inspect form value. Expected: native date input or truthful popup calendar selection behaves as described at `components/datepicker.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-023 `dialog`
Contract: native dialog/showModal for modal focus/inertness. Evidence: `components/dialog.mdx:14`; `dist/components/dialog.css:31`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper; native dialog and Modal overlap require API design decision.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/dialog.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/dialog.css:31`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/dialog.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/dialog.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-023 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `dialog` using the local React API or documented native composition. Action: open modal, Escape, inspect background inertness/focus restore. Expected: native dialog/showModal for modal focus/inertness behaves as described at `components/dialog.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-024 `diff`
Contract: range-driven before/after comparison. Evidence: `components/diff.mdx:13`; `dist/components/diff.css:2`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper; native range/comparison composition needs API decision.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/diff.mdx:13`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/diff.css:2`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/diff.mdx:13`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/diff.mdx:13`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-024 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `diff` using the local React API or documented native composition. Action: move range with keyboard and pointer; inspect reveal. Expected: range-driven before/after comparison behaves as described at `components/diff.mdx:13`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-025 `divider`
Contract: decorative/content divider and orientation semantics. Evidence: `components/divider.mdx:14`; `dist/components/divider.css:13`. Local: `packages/components/src/components/divider/Divider.tsx:32`.
Disposition: **adapt canonical classes / retain public API**. The published start/end selectors are not emitted; keep legacy labelPosition and aliases while adding canonical classes in a scoped change.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | ALIGNED_SOURCE | Divider is a static separator; inline content between two lines is documented (`U:divider:14-28`; `C:divider:13-35`). Local div/children match this. |
| Markup/style | GAP | Local labelPosition emits legacy `.divider-text-left/right` (`L:components/divider/Divider.tsx:22-43`), which published CSS still supports (`C:divider:341-371`). Canonical `.divider-start/end` are documented (`U:divider:24-28`; `C:divider:227-241`) but never emitted by local labelPosition. Preserve aliases and add canonical classes in a scoped change. Other orientation/style/thickness classes match CSS (`L:classes/divider.ts:13-48`; `C:divider:38-132`). |
| Interaction | N/A | No component state or handlers (`L:components/divider/Divider.tsx:6-49`). |
| Accessibility | UNKNOWN | Default `role=separator` and `aria-orientation` are emitted (`L:components/divider/Divider.tsx:17,31-47`); whether every labelled decorative divider should have separator semantics is context dependent. Browser/AT review NOT_RUN. |
| Local compatibility | UNKNOWN | Disposition: Keep `labelPosition=left/right/center` and old classes while mapping to canonical start/end (`L:components/divider/Divider.types.ts:24-33`). No public prop removal. |

Future audit **CORE-A-025 / NOT_RUN** — Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: render plain/labelled/start/end/vertical dividers; inspect computed pseudo-elements, RTL positioning, role/orientation and whether decorative instances need `role=presentation`. Expected: Canonical start/end positioning and retained legacy aliases produce the intended lines in LTR/RTL; role/orientation follow use context. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes.

### CORE-A-026 `drawer`
Contract: native popover/dialog surface; legacy class path supported. Evidence: `components/drawer.mdx:18`; `dist/components/drawer.css:8`. Local: `packages/components/src/components/drawer/Drawer.tsx:60`.
Disposition: **adapt / retain public API**. Local Drawer uses class-controlled div/aria-hidden; pinned docs recommend native popover/dialog and retain legacy class path. Keep API but classify native path as gap (Drawer.tsx:58-83; docs:16-54).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/drawer.mdx:18`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | GAP | Published selectors `dist/components/drawer.css:8`; `packages/components/src/components/drawer/Drawer.tsx:60`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | GAP | Pinned behavior `components/drawer.mdx:18`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/drawer.mdx:18`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/drawer/Drawer.tsx:60`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-026 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `drawer` using the local React API or documented native composition. Action: open, Escape/outside dismiss and inspect focus return. Expected: native popover/dialog surface; legacy class path supported behaves as described at `components/drawer.mdx:18`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-027 `dropdown`
Contract: native popover content with button trigger; no automatic menu role. Evidence: `components/dropdown.mdx:22`; `dist/components/dropdown.css:7`. Local: `packages/components/src/components/dropdown/Dropdown.tsx:46`.
Disposition: **adapt / retain public API**. Local controlled role=menu div conflicts with pinned native .dropdown-content[popover] contract and docs warning against menu roles without keyboard pattern (Dropdown.tsx:200-214; docs:20-22,61).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | CONFLICT | Pinned contract `components/dropdown.mdx:22`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | CONFLICT | Published selectors `dist/components/dropdown.css:7`; `packages/components/src/components/dropdown/Dropdown.tsx:46`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | GAP | Pinned behavior `components/dropdown.mdx:22`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | GAP | Pinned semantics `components/dropdown.mdx:22`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/dropdown/Dropdown.tsx:46`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-027 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `dropdown` using the local React API or documented native composition. Action: open via button, dismiss by Escape/outside, inspect focus. Expected: native popover content with button trigger; no automatic menu role behaves as described at `components/dropdown.mdx:22`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-028 `fab`
Contract: Button-composed FAB and popover/controlled speed dial. Evidence: `components/fab.mdx:14`; `dist/components/fab.css:9`. Local: `packages/components/src/components/fab/Fab.tsx:39`.
Disposition: **retain / audit**. Wrapper now exists despite stale plan absence row; native popover speed dial is emitted (Fab.tsx:38-55; docs:44-80).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/fab.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | UNKNOWN | Published selectors `dist/components/fab.css:9`; `packages/components/src/components/fab/Fab.tsx:39`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/fab.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/fab.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/fab/Fab.tsx:39`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-028 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `fab` using the local React API or documented native composition. Action: open speed dial, activate action and dismiss by Escape. Expected: Button-composed FAB and popover/controlled speed dial behaves as described at `components/fab.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-029 `file-input`
Contract: native file input and browser-owned selection. Evidence: `components/file-input.mdx:14`; `dist/components/file-input.css:50`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated native file input wrapper; existing Upload is richer, separate contract.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/file-input.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/file-input.css:50`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/file-input.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/file-input.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-029 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `file-input` using the local React API or documented native composition. Action: select file, reset form and inspect submitted File. Expected: native file input and browser-owned selection behaves as described at `components/file-input.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-030 `file-upload`
Contract: presentational upload zone with real file selection path. Evidence: `components/file-upload.mdx:14`; `dist/components/file-upload.css:8`. Local: `packages/components/src/components/upload/Upload.tsx:240`.
Disposition: **adapt / retain public API**. Upload dropzone is focusable div role=button, expressly discouraged by pinned docs; retain Upload API but adapt to real input/button path (Upload.tsx:245-250; docs:54-58).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/file-upload.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | CONFLICT | Published selectors `dist/components/file-upload.css:8`; `packages/components/src/components/upload/Upload.tsx:240`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | GAP | Pinned behavior `components/file-upload.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | GAP | Pinned semantics `components/file-upload.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/upload/Upload.tsx:240`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-030 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `file-upload` using the local React API or documented native composition. Action: select/drop/remove file and inspect keyboard path and progress. Expected: presentational upload zone with real file selection path behaves as described at `components/file-upload.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-031 `filter-group`
Contract: native radio/checkbox controls styled as chips. Evidence: `components/filter-group.mdx:14`; `dist/components/filter-group.css:8`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper for real radio/checkbox chip grouping; React composition remains possible.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `components/filter-group.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/filter-group.css:8`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/filter-group.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/filter-group.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-031 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `filter-group` using the local React API or documented native composition. Action: choose single/multiple filters, reset and submit values. Expected: native radio/checkbox controls styled as chips behaves as described at `components/filter-group.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-032 `footer`
Contract: semantic footer and labeled navigation groups. Evidence: `components/footer.mdx:14`; `dist/components/footer.css:7`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only composition**. No dedicated wrapper; semantic footer/nav HTML composition matches CSS-only primitive.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/footer.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/footer.css:7`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/footer.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/footer.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-032 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `footer` using the local React API or documented native composition. Action: navigate footer links by keyboard at narrow width. Expected: semantic footer and labeled navigation groups behaves as described at `components/footer.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-033 `form`
Contract: native control submission/reset and associated labels. Evidence: `components/form.mdx:14`; `dist/components/form.css:54`. Local: `packages/components/src/components/form/Form.tsx:363`.
Disposition: **adapt implemented in source / retain public API**. The baseline lacked htmlFor/control ID association; current source uses useId and control cloning for an associated single native field, with explicit htmlFor for composite content. Other form behavior remains under audit (Form.tsx; docs:99-106).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Core expects native values, validation, submission and reset, with associated labels/fieldset disabled (`U:form:14-15,42-73,99-109`). Local Form maintains an external store and prevents native submit (`L:components/form/Form.tsx:43-130,359-375`); this is a React compatibility API, but native reset/constraint behavior must be explicitly reconciled. |
| Markup/style | GAP | `Form.Item` now assigns an ID to a single child and connects its label, or accepts `htmlFor` for composite content (`L:components/form/Form.tsx:382-414,424-483`; `L:components/form/Form.types.ts:72-87`). That closes one association case in source. Local `.form-item-label/.form-item-control` and `.form-disabled` are compatibility styling (`L:classes/form.ts:3-46`), not the documented `.form-group/.form-label` hierarchy (`U:form:99-106`). |
| Interaction | GAP | `<form>` has submit/change handlers but no `onReset`; `FormInstance.resetFields` is separate (`L:components/form/Form.tsx:43-130,359-375`). A native reset button can diverge from stored values. `required`/rules validate in JS (`:81-113,416-422`) but are not necessarily forwarded as native `required` on the child (`:443-461`). `Form.List` is store-managed (`:494-536`); `ErrorList` only renders supplied errors (`:538-551`); `Provider` supplies an empty context (`:553-558`). |
| Accessibility | GAP | Single control label association is now source aligned, but Item help/error blocks have no generated IDs or `aria-describedby`/`aria-invalid` linkage (`L:components/form/Form.tsx:478-491`; `U:form:48-54,99-109`). Form-level `disabled` is a class/context property, not native `fieldset disabled` for all descendants (`L:components/form/Form.tsx:332-375,443-447`). |
| Local compatibility | UNKNOWN | Disposition: Preserve `Form`, `Item`, `List`, `ErrorList`, `Provider`, refs and store callbacks (`L:components/form/Form.types.ts:24-45,49-148`). Native reset/fieldset/description integration needs a scoped design; do not replace the store or remove APIs based on upstream CSS. |

Future audit **CORE-A-033 / NOT_RUN** — Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: submit required field both valid/invalid, inspect native FormData and callback values, click reset, compare DOM/store, then disable a fieldset. Inspect Item label focus, composite htmlFor, noStyle/fragment, help/error descriptions, List add/remove/move, ErrorList, and Provider callbacks with keyboard and accessibility tree. Expected: Native FormData and store/callback values reconcile across submit/reset; label/help/error and disabled fieldset relationships are exposed. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes.

### CORE-A-034 `form-group`
Contract: associated label, help/error IDs and native fieldset. Evidence: `components/form-group.mdx:14`; `dist/components/form-group.css:50`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only composition**. No dedicated wrapper; native label/input/fieldset composition is intentionally CSS-only.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/form-group.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/form-group.css:50`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/form-group.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/form-group.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-034 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `form-group` using the local React API or documented native composition. Action: focus field, read help/error, disable fieldset and submit. Expected: associated label, help/error IDs and native fieldset behaves as described at `components/form-group.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-035 `hero`
Contract: semantic section with foreground content and optional decorative overlay. Evidence: `components/hero.mdx:14`; `dist/components/hero.css:7`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only composition**. No dedicated wrapper; semantic section/content/overlay composition is intentionally CSS-only.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/hero.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/hero.css:7`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/hero.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/hero.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-035 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `hero` using the local React API or documented native composition. Action: read heading/action and inspect overlay layering. Expected: semantic section with foreground content and optional decorative overlay behaves as described at `components/hero.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-036 `home-page`
Contract: appbar/nav/main/footer and compact popover nav. Evidence: `layout/home-page.mdx:14`; `dist/components/home-page.css:7`. Local: no dedicated local TSX directory.
Disposition: **add / block API design**. No dedicated wrapper; documented compact popover/nav coordination needs an API decision.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Pinned contract `layout/home-page.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | GAP | Published selectors `dist/components/home-page.css:7`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `layout/home-page.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `layout/home-page.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | GAP | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-036 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `home-page` using the local React API or documented native composition. Action: resize container, open compact menu and compare destinations. Expected: appbar/nav/main/footer and compact popover nav behaves as described at `layout/home-page.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-037 `indicator`
Contract: logical-position marker around content with meaningful status text. Evidence: `components/indicator.mdx:14`; `dist/components/indicator.css:7`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only composition**. No dedicated wrapper; marker/content composition is intentionally CSS-only.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/indicator.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/indicator.css:7`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/indicator.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/indicator.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-037 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `indicator` using the local React API or documented native composition. Action: inspect marker in RTL and accessible status text. Expected: logical-position marker around content with meaningful status text behaves as described at `components/indicator.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-038 `input`
Contract: native input states, disabled/readonly and validator semantics. Evidence: `components/input.mdx:34`; `dist/components/input.css:50`. Local: `packages/components/src/components/input/Input.tsx:101`.
Disposition: **adapt reset behavior / retain public API**. Preserve Input, Search, Password, TextArea and Group while reconciling uncontrolled value state with native reset.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | GAP | Docs require native values and reset (`U:input:34-45`); `InputRoot` always writes React `value` from state even in its defaultValue mode (`L:components/input/Input.tsx:42-76,100-109`) and has no form reset listener. Retain controlled/uncontrolled React API, add reset synchronization in a separately scoped repair. |
| Markup/style | ALIGNED_SOURCE | Native `<input>` receives `.input` plus size/appearance (`L:components/input/Input.tsx:100-109`; `L:classes/input.ts:27-40,66-83`), matching `C:input:118-147,154-225`. Search/Password/Group are local compositions (`L:components/input/Input.tsx:144-237,309-324`), not upstream standalone contracts. |
| Interaction | GAP | Browser reset can change the DOM value while internal state/clear visibility stays stale (`L:components/input/Input.tsx:62-66,79-116`); any later render restores stale value. Search Enter calls `onSearch` even while `loading` disables only its button (`L:components/input/Input.tsx:168-195`): local loading semantics need an explicit decision, not an upstream requirement. Password visibility button is native and named (`:205-233`). |
| Accessibility | ALIGNED_SOURCE | Native input supports caller `id`, `name`, `readOnly`, `disabled` and ARIA props (`L:components/input/Input.tsx:100-109`; `U:input:43-45`); clear and password buttons are named (`:125-132,210-220`). User must provide a field label. |
| Local compatibility | UNKNOWN | Disposition: Preserve `Input.Search`, `.Password`, `.TextArea`, `.Group` and their props (`L:components/input/Input.tsx:319-326`; `L:components/input/Input.types.ts:23-71`). Published CSS also offers ghost/XS classes not represented in `InputVariant`/`InputSize` (`U:input:43-44`; `L:components/input/Input.types.ts:11-15`); expose only if parity scope chooses it. |

Future audit **CORE-A-038 / NOT_RUN** — Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: type in uncontrolled Input with defaultValue, clear, reset the form, and trigger a React rerender; DOM value and clear control must reflect the default. Repeat controlled mode, readOnly/disabled/fieldset, Search Enter/button while loading, Password show/hide, and affix/Group styles in browser. Expected: Uncontrolled DOM value and clear control return to default after reset and stay synchronized after rerender; controlled mode follows its prop. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes.

### CORE-A-039 `join`
Contract: adjacent native controls with grouped borders. Evidence: `components/join.mdx:14`; `dist/components/join.css:7`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only composition**. No dedicated wrapper; native grouped controls are intentionally CSS-only.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/join.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/join.css:7`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/join.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/join.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-039 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `join` using the local React API or documented native composition. Action: tab through joined buttons/input and inspect RTL corners. Expected: adjacent native controls with grouped borders behaves as described at `components/join.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-040 `kbd`
Contract: native kbd element with readable key names. Evidence: `components/kbd.mdx:30`; `dist/components/kbd.css:2`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only composition**. No dedicated wrapper; native kbd composition is intentionally CSS-only.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/kbd.mdx:30`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/kbd.css:2`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/kbd.mdx:30`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/kbd.mdx:30`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-040 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `kbd` using the local React API or documented native composition. Action: read nested key sequence with assistive technology. Expected: native kbd element with readable key names behaves as described at `components/kbd.mdx:30`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-041 `link`
Contract: native href anchor with theme/focus underline. Evidence: `components/link.mdx:14`; `dist/components/link.css:3`. Local: no dedicated local TSX directory.
Disposition: **retain CSS-only composition**. No dedicated wrapper; native anchor composition is intentionally CSS-only.

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/link.mdx:14`; no dedicated API; component-level prop design unresolved. |
| Markup/style | UNKNOWN | Published selectors `dist/components/link.css:3`; no dedicated local TSX directory; consumer DOM/CSS selector match unexamined; see disposition. |
| Interaction | UNKNOWN | Pinned behavior `components/link.mdx:14`; consumer state ownership unspecified; runtime NOT_RUN. |
| Accessibility | UNKNOWN | Pinned semantics `components/link.mdx:14`; consumer semantic markup unspecified; browser NOT_RUN. |
| Local compatibility | UNKNOWN | no dedicated local TSX directory; consumer composition and generated CSS unverified; preserve public API. |

Future audit **CORE-A-041 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `link` using the local React API or documented native composition. Action: tab to link, follow destination and inspect focus underline. Expected: native href anchor with theme/focus underline behaves as described at `components/link.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.

### CORE-A-042 `list`
Contract: canonical title/subtitle slots; semantic list with native interactive controls. Evidence: `components/list.mdx:14`; `dist/components/list.css:8`. Local: `packages/components/src/components/list/List.tsx:44`.
Disposition: **adapt / retain public API**. Local List and List.Item render div elements; interactive List.Item gives the div role=button and a key handler. Pinned docs show semantic ul/li with native link/button for interactive items. Title/secondary use supported historical aliases (List.tsx:44-50,60-64,131-144; docs:12-22).

| Check | Result | Source reading / limitation |
| --- | --- | --- |
| Design | UNKNOWN | Pinned contract `components/list.mdx:14`; variant/prop mapping against documented purpose unexamined beyond disposition. |
| Markup/style | CONFLICT | Published selectors `dist/components/list.css:8`; `packages/components/src/components/list/List.tsx:44`; remaining descendant selectors and variants not fully matched to JSX; see disposition. |
| Interaction | GAP | Pinned behavior `components/list.mdx:14`; remaining handlers, state transitions and cleanup unexamined in source; runtime NOT_RUN. |
| Accessibility | GAP | Pinned semantics `components/list.mdx:14`; remaining roles, labels and focus paths unexamined in source; browser NOT_RUN. |
| Local compatibility | UNKNOWN | `packages/components/src/components/list/List.tsx:44`; root/subpath exports, docs and migration breadth unexamined; preserve public API. |

Future audit **CORE-A-042 / NOT_RUN** — Setup: load published `1.20.0` CSS through local styles and render `list` using the local React API or documented native composition. Action: tab to interactive item, activate and inspect selected state. Expected: canonical title/subtitle slots; semantic list with native interactive controls behaves as described at `components/list.mdx:14`, with working state/focus/keyboard behavior where applicable. Planned validation: scoped component tests and browser computed-style/keyboard inspection after verification resumes.


## CORE-LOADING-B

**Disposition:** `retain` CSS; possible React API `add` requires a separate design decision. **Evidence:** U:components/loading.mdx:14; C:loading.css:1; L:packages/components/src/components/spin/Spin.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | visual unknown-duration indicator; does not manage busy state. U:components/loading.mdx:14; C:loading.css:1. |
| Markup/style | UNKNOWN | named role=status or decorative aria-hidden. U:components/loading.mdx:14; C:loading.css:1; L:packages/components/src/components/spin/Spin.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/loading.mdx:14; L:packages/components/src/components/spin/Spin.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/loading.mdx:14; L:packages/components/src/components/spin/Spin.tsx:1. |
| Local compatibility | GAP | retain CSS composition; Spin is distinct. L:packages/components/src/components/spin/Spin.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-LOADING-B`:** Setup: load published 1.20.0 CSS and render the pinned `loading` example alongside the local spin. Action: Toggle busy content while inspecting indicator naming and whether parent aria-busy changes independently. Expected: visual unknown-duration indicator; does not manage busy state; named role=status or decorative aria-hidden; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-MARKDOWN_BODY-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/markdown-body.mdx:270; C:markdown-body.css:1; L:packages/components/src/components/markdown/Markdown.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | rendered markdown typography, not parser behavior. U:components/markdown-body.mdx:270; C:markdown-body.css:1. |
| Markup/style | UNKNOWN | container `.markdown-body` and semantic rendered HTML. U:components/markdown-body.mdx:270; C:markdown-body.css:1; L:packages/components/src/components/markdown/Markdown.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/markdown-body.mdx:270; L:packages/components/src/components/markdown/Markdown.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/markdown-body.mdx:270; L:packages/components/src/components/markdown/Markdown.tsx:1. |
| Local compatibility | UNKNOWN | adapt Markdown class/semantics only if same selector applies. L:packages/components/src/components/markdown/Markdown.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-MARKDOWN_BODY-B`:** Setup: load published 1.20.0 CSS and render the pinned `markdown-body` example alongside the local markdown. Action: Render heading, list, link and code sample; inspect semantic HTML and applied typography. Expected: rendered markdown typography, not parser behavior; container `.markdown-body` and semantic rendered HTML; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-MASK-B

**Disposition:** `retain`. **Evidence:** U:components/mask.mdx:14; C:mask.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | clip shapes are visual-only. U:components/mask.mdx:14; C:mask.css:1. |
| Markup/style | UNKNOWN | `.mask` plus shape; meaningful image alt. U:components/mask.mdx:14; C:mask.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/mask.mdx:14; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/mask.mdx:14; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS-only composition. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-MASK-B`:** Setup: load published 1.20.0 CSS and render the pinned `mask` example alongside the local CSS-only composition / proposed wrapper. Action: Render each clip shape around an image and inspect clipped silhouette and img alt. Expected: clip shapes are visual-only; `.mask` plus shape; meaningful image alt; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-MEGAMENU-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/megamenu.mdx:22; C:megamenu.css:1; L:packages/components/src/components/megamenu/Megamenu.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | native grouped navigation and responsive disclosure. U:components/megamenu.mdx:22; C:megamenu.css:1. |
| Markup/style | UNKNOWN | nav/list/button/panel[popover=auto] with unique ID and anchor. U:components/megamenu.mdx:22; C:megamenu.css:1; L:packages/components/src/components/megamenu/Megamenu.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/megamenu.mdx:22; L:packages/components/src/components/megamenu/Megamenu.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/megamenu.mdx:22; L:packages/components/src/components/megamenu/Megamenu.tsx:1. |
| Local compatibility | UNKNOWN | adapt committed wrapper where native relationships are incomplete. L:packages/components/src/components/megamenu/Megamenu.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-MEGAMENU-B`:** Setup: load published 1.20.0 CSS and render the pinned `megamenu` example alongside the local megamenu. Action: Open each group by keyboard, tab through links, dismiss and resize to mobile. Expected: native grouped navigation and responsive disclosure; nav/list/button/panel[popover=auto] with unique ID and anchor; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-MENU-B

**Disposition:** `adapt`. **Evidence:** U:components/menu.mdx:13; C:menu.css:1; L:packages/components/src/components/menu/Menu.tsx:1. Menu defaults to ARIA menu/menuitem; upstream ordinary navigation explicitly rejects those roles.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | inline list or native anchored popover; no ARIA menu roles for ordinary navigation. U:components/menu.mdx:13; C:menu.css:1. |
| Markup/style | CONFLICT | list/nav or [popover=auto], native command or popovertarget. U:components/menu.mdx:13; C:menu.css:1; L:packages/components/src/components/menu/Menu.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/menu.mdx:13; L:packages/components/src/components/menu/Menu.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/menu.mdx:13; L:packages/components/src/components/menu/Menu.tsx:1. |
| Local compatibility | CONFLICT | adapt Menu semantics or explicitly keep application ARIA menu as separate API. L:packages/components/src/components/menu/Menu.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-MENU-B`:** Setup: load published 1.20.0 CSS and render the pinned `menu` example alongside the local menu. Action: Tab through ordinary navigation links and open any disclosure; inspect roles and focus order. Expected: inline list or native anchored popover; no ARIA menu roles for ordinary navigation; list/nav or [popover=auto], native command or popovertarget; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-MODAL-B

**Disposition:** `adapt`. **Evidence:** U:components/modal.mdx:14; C:modal.css:1; L:packages/components/src/components/modal/Modal.tsx:1. Modal sets aria-modal without a focus trap or background inert handling.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | legacy CSS overlay; Dialog recommended for new accessible modal. U:components/modal.mdx:14; C:modal.css:1. |
| Markup/style | CONFLICT | regular `.modal`, not native dialog; app owns inert/focus. U:components/modal.mdx:14; C:modal.css:1; L:packages/components/src/components/modal/Modal.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/modal.mdx:14; L:packages/components/src/components/modal/Modal.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/modal.mdx:14; L:packages/components/src/components/modal/Modal.tsx:1. |
| Local compatibility | CONFLICT | adapt legacy Modal focus/inert contract; retain API. L:packages/components/src/components/modal/Modal.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-MODAL-B`:** Setup: load published 1.20.0 CSS and render the pinned `modal` example alongside the local modal. Action: Open modal, tab repeatedly, press Escape and inspect focus return and background inertness. Expected: legacy CSS overlay; Dialog recommended for new accessible modal; regular `.modal`, not native dialog; app owns inert/focus; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-MULTI_SELECT-B

**Disposition:** `add`. **Evidence:** U:components/multi-select.mdx:13; C:multi-select.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | multi-value trigger, tags, native popover. U:components/multi-select.mdx:13; C:multi-select.css:1. |
| Markup/style | GAP | trigger popovertarget and dropdown[popover=auto]. U:components/multi-select.mdx:13; C:multi-select.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | GAP | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/multi-select.mdx:13; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | GAP | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/multi-select.mdx:13; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | GAP | add dedicated wrapper with controlled values. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-MULTI_SELECT-B`:** Setup: load published 1.20.0 CSS and render the pinned `multi-select` example alongside the local CSS-only composition / proposed wrapper. Action: Choose two options, remove one tag, dismiss popover and inspect selected values. Expected: multi-value trigger, tags, native popover; trigger popovertarget and dropdown[popover=auto]; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-NAVBAR-B

**Disposition:** `add`. **Evidence:** U:components/navbar.mdx:16; C:navbar.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | responsive navigation header. U:components/navbar.mdx:16; C:navbar.css:1. |
| Markup/style | GAP | semantic nav, sections, mobile navigation. U:components/navbar.mdx:16; C:navbar.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | GAP | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/navbar.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | GAP | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/navbar.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | GAP | add dedicated wrapper or documented CSS composition. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-NAVBAR-B`:** Setup: load published 1.20.0 CSS and render the pinned `navbar` example alongside the local CSS-only composition / proposed wrapper. Action: Resize from wide to narrow, open mobile navigation and tab through links. Expected: responsive navigation header; semantic nav, sections, mobile navigation; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-NAVIGATION-B

**Disposition:** `retain`. **Evidence:** U: no pinned page; C:navigation.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | CSS stylesheet only; no pinned page. U: no pinned page; C:navigation.css:1. |
| Markup/style | UNKNOWN | inspect CSS selectors before declaring semantics. U: no pinned page; C:navigation.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U: no pinned page; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U: no pinned page; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS-only, mark doc contract unknown. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-NAVIGATION-B`:** Setup: load published 1.20.0 CSS and render the pinned `navigation` example alongside the local CSS-only composition / proposed wrapper. Action: Inspect published selectors, compose matching nav DOM and compare active-link styling. Expected: CSS stylesheet only; no pinned page; inspect CSS selectors before declaring semantics; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-NESTED_MENU-B

**Disposition:** `add`. **Evidence:** U:components/nested-menu.mdx:3; C:nested-menu.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | native hierarchical disclosure. U:components/nested-menu.mdx:3; C:nested-menu.css:1. |
| Markup/style | GAP | nested details/summary. U:components/nested-menu.mdx:3; C:nested-menu.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | GAP | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/nested-menu.mdx:3; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | GAP | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/nested-menu.mdx:3; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | GAP | add disclosure wrapper. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-NESTED_MENU-B`:** Setup: load published 1.20.0 CSS and render the pinned `nested-menu` example alongside the local CSS-only composition / proposed wrapper. Action: Open parent and child details with keyboard and collapse the parent. Expected: native hierarchical disclosure; nested details/summary; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-OTP_INPUT-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/otp-input.mdx:15; C:otp-input.css:1; L:packages/components/src/components/otp-input/OtpInput.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | one native input behind decorative slots. U:components/otp-input.mdx:15; C:otp-input.css:1. |
| Markup/style | UNKNOWN | label/empty aria-hidden spans/input. U:components/otp-input.mdx:15; C:otp-input.css:1; L:packages/components/src/components/otp-input/OtpInput.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/otp-input.mdx:15; L:packages/components/src/components/otp-input/OtpInput.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/otp-input.mdx:15; L:packages/components/src/components/otp-input/OtpInput.tsx:1. |
| Local compatibility | UNKNOWN | retain new wrapper; audit native constraints. L:packages/components/src/components/otp-input/OtpInput.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-OTP_INPUT-B`:** Setup: load published 1.20.0 CSS and render the pinned `otp-input` example alongside the local otp-input. Action: Type and paste a full code, backspace, and inspect the single native input value and decorative slots. Expected: one native input behind decorative slots; label/empty aria-hidden spans/input; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-PAGINATION-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/pagination.mdx:16; C:pagination.css:1; L:packages/components/src/components/pagination/Pagination.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | page links/buttons and responsive variants. U:components/pagination.mdx:16; C:pagination.css:1. |
| Markup/style | UNKNOWN | pagination list plus active/disabled states. U:components/pagination.mdx:16; C:pagination.css:1; L:packages/components/src/components/pagination/Pagination.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/pagination.mdx:16; L:packages/components/src/components/pagination/Pagination.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/pagination.mdx:16; L:packages/components/src/components/pagination/Pagination.tsx:1. |
| Local compatibility | UNKNOWN | adapt if local controls diverge. L:packages/components/src/components/pagination/Pagination.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-PAGINATION-B`:** Setup: load published 1.20.0 CSS and render the pinned `pagination` example alongside the local pagination. Action: Activate next/previous at middle and boundaries; inspect current-page and disabled semantics. Expected: page links/buttons and responsive variants; pagination list plus active/disabled states; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-POPOVER-B

**Disposition:** `adapt`. **Evidence:** U:components/popover.mdx:15; C:popover.css:1; L:packages/components/src/components/popover/Popover.tsx:1. Popover uses .popover-show local state/tooltip role, not native [popover] and anchor positioning.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | native Popover API and CSS Anchor Positioning. U:components/popover.mdx:15; C:popover.css:1. |
| Markup/style | CONFLICT | trigger native command, surface[popover], anchors. U:components/popover.mdx:15; C:popover.css:1; L:packages/components/src/components/popover/Popover.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/popover.mdx:15; L:packages/components/src/components/popover/Popover.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/popover.mdx:15; L:packages/components/src/components/popover/Popover.tsx:1. |
| Local compatibility | CONFLICT | adapt local stateful overlay to native contract. L:packages/components/src/components/popover/Popover.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-POPOVER-B`:** Setup: load published 1.20.0 CSS and render the pinned `popover` example alongside the local popover. Action: Invoke native trigger, inspect anchor placement, then Escape and light-dismiss. Expected: native Popover API and CSS Anchor Positioning; trigger native command, surface[popover], anchors; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-PROGRESS-B

**Disposition:** `retain` the custom linear adapter; `adapt` caller guidance to require an accessible name. **Evidence:** U:components/progress.mdx:14-27; C:progress.css:8-59; L:packages/components/src/components/progress/Progress.tsx:11-52.

| Check | Result | Source finding |
|---|---|---|
| Design | ALIGNED_SOURCE | Pinned docs allow custom linear div markup and separately native `<progress>` (`U:progress:14-27`); local API deliberately renders custom linear div (`L:components/progress/Progress.tsx:11-52`). Native progress is a documented composition, not an automatic wrapper obligation. |
| Markup/style | ALIGNED_SOURCE | `.progress > .progress-bar` and indeterminate class match published selectors (`L:components/progress/Progress.tsx:35-46`; `C:progress:8-18,48-59`). `showInfo` puts `.progress-labeled` on the progressbar rather than the docs' outer wrapper (`U:progress:79-89`): visual spacing is UNKNOWN until CSS/browser check. |
| Interaction | ALIGNED_SOURCE | Percent is clamped and width/`aria-valuenow` update together; indeterminate omits value (`L:components/progress/Progress.tsx:6-8,26-46`). No JS lifecycle. |
| Accessibility | GAP | Local root has `role=progressbar` and values but no default accessible name (`L:components/progress/Progress.tsx:29-41`); docs native example is named (`U:progress:24-27`). Caller can pass `aria-label` through props, but the usage contract should require it. This is caller usage guidance, not proof of a defective component default. |
| Local compatibility | UNKNOWN | Disposition: Keep `percent`, `format`, `showInfo`, and children (`L:components/progress/Progress.types.ts:18-26`); circular/buffer examples are not represented by this prop API (`U:progress:29-43,90-97`) and may remain CSS compositions. |

**Future audit `CORE-PROGRESS-B`:** Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: render 0, 60, 100 and indeterminate with an accessible name; inspect ARIA values, computed bar width, label layout and buffer/circular CSS compositions. Expected: ARIA value and bar width agree for determinate values; indeterminate has no value; consumer-supplied accessible name is announced. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes. **NOT_RUN**.

## CORE-RADIAL_PROGRESS-B

**Disposition:** `retain`. **Evidence:** U:components/radial-progress.mdx:20; C:radial-progress.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | determinate percentage via CSS property. U:components/radial-progress.mdx:20; C:radial-progress.css:1. |
| Markup/style | UNKNOWN | visual percent and matching aria-valuenow. U:components/radial-progress.mdx:20; C:radial-progress.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/radial-progress.mdx:20; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/radial-progress.mdx:20; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS-only if consumer supplies synchronized ARIA. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-RADIAL_PROGRESS-B`:** Setup: load published 1.20.0 CSS and render the pinned `radial-progress` example alongside the local CSS-only composition / proposed wrapper. Action: Set 25% then 75%; inspect CSS value, visual arc and aria-valuenow agreement. Expected: determinate percentage via CSS property; visual percent and matching aria-valuenow; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-RADIO-B

**Disposition:** `adapt` class placement while retaining the local circle/props. **Evidence:** U:components/radio.mdx:34; C:radio.css:81-215; L:packages/components/src/components/radio/Radio.tsx:29-50.

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | Upstream styles a native radio and specifies one shared name/fieldset (`U:radio:34-44`). Local input is native (`L:components/radio/Radio.tsx:37-43`), but its primary `.radio` class is on the wrapping label (`:29-35`; `L:classes/radio.ts:8-12,41-58`). |
| Markup/style | GAP | `C:radio:81-141,174-215` uses `.radio:checked`, `:focus-visible`, `:disabled` on the input. Local input instead has `.radio-input` and a decorative `.radio-circle`; only local override CSS styles these (`L:styles.css:3144-3218`). This local presentation path exists in source and should be retained until a scoped migration; runtime appearance is unverified and it is not parity with published native styling. |
| Interaction | ALIGNED_SOURCE | The actual radio receives `name`, `value`, `checked/defaultChecked` via spread and native disabled when `disabled || loading` (`L:components/radio/Radio.tsx:21-43`). No JS selection handler overrides native group/reset behavior; runtime remains NOT_RUN. |
| Accessibility | ALIGNED_SOURCE | Wrapping label names its native input; decorative circle is hidden (`L:components/radio/Radio.tsx:29-50`). Caller must group with fieldset/legend and shared name (`U:radio:43-44`); wrapper does not do this automatically. |
| Local compatibility | UNKNOWN | Disposition: Preserve size/color/error/loading/labelPosition (`L:components/radio/Radio.types.ts:19-27`). Decide native styling migration with local override impact; do not delete the circle adapter blindly. |

**Future audit `CORE-RADIO-B`:** Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: render three radios with shared name and fieldset, select by arrow keys, reset, submit and disable one; inspect input computed style/checked/focus and the local circle adapter under Core 1.20.0 CSS. Expected: The checked input, submitted value, focus style and native Core selector agree across keyboard selection and reset. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes. **NOT_RUN**.

## CORE-RANGE-B

**Disposition:** `add`. **Evidence:** U:components/range.mdx:3; C:range.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | native range field. U:components/range.mdx:3; C:range.css:1. |
| Markup/style | GAP | input[type=range].range. U:components/range.mdx:3; C:range.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | GAP | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/range.mdx:3; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | GAP | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/range.mdx:3; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | GAP | add simple React field or document CSS-only decision. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-RANGE-B`:** Setup: load published 1.20.0 CSS and render the pinned `range` example alongside the local CSS-only composition / proposed wrapper. Action: Move native range with arrows, submit/reset form and inspect value/track styling. Expected: native range field; input[type=range].range; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-RATING-B

**Disposition:** `adapt`. **Evidence:** U:components/rating.mdx:14; C:rating.css:1; L:packages/components/src/components/rate/Rate.tsx:1. Rate emits div/span ARIA radios, while editable upstream rating is native radio-backed.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | editable native radios versus static display. U:components/rating.mdx:14; C:rating.css:1. |
| Markup/style | CONFLICT | radio group for edit; static stars separate. U:components/rating.mdx:14; C:rating.css:1; L:packages/components/src/components/rate/Rate.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/rating.mdx:14; L:packages/components/src/components/rate/Rate.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/rating.mdx:14; L:packages/components/src/components/rate/Rate.tsx:1. |
| Local compatibility | CONFLICT | adapt Rate editable mode; retain static API. L:packages/components/src/components/rate/Rate.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-RATING-B`:** Setup: load published 1.20.0 CSS and render the pinned `rating` example alongside the local rate. Action: Choose a rating with keyboard, submit/reset form, then compare read-only star display. Expected: editable native radios versus static display; radio group for edit; static stars separate; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SEGMENT_CONTROL-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/segment-control.mdx:15; C:segment-control.css:1; L:packages/components/src/components/segmented/Segmented.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | segmented buttons. U:components/segment-control.mdx:15; C:segment-control.css:1. |
| Markup/style | UNKNOWN | `.segment-control-item` buttons and active state. U:components/segment-control.mdx:15; C:segment-control.css:1; L:packages/components/src/components/segmented/Segmented.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/segment-control.mdx:15; L:packages/components/src/components/segmented/Segmented.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/segment-control.mdx:15; L:packages/components/src/components/segmented/Segmented.tsx:1. |
| Local compatibility | UNKNOWN | adapt Segmented classes/semantics. L:packages/components/src/components/segmented/Segmented.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-SEGMENT_CONTROL-B`:** Setup: load published 1.20.0 CSS and render the pinned `segment-control` example alongside the local segmented. Action: Activate another segment with keyboard and inspect active state and event. Expected: segmented buttons; `.segment-control-item` buttons and active state; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SELECT-B

**Disposition:** `adapt`. **Evidence:** U:components/select.mdx:14; C:select.css:1; L:packages/components/src/components/select/Select.tsx:1. Select renders a custom button/listbox, while upstream `.select` is a native select; preserve custom API as separate pattern.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | native select for ordinary options. U:components/select.mdx:14; C:select.css:1. |
| Markup/style | CONFLICT | select.select/option; custom listbox is separate. U:components/select.mdx:14; C:select.css:1; L:packages/components/src/components/select/Select.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/select.mdx:14; L:packages/components/src/components/select/Select.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/select.mdx:14; L:packages/components/src/components/select/Select.tsx:1. |
| Local compatibility | CONFLICT | adapt or separate existing custom Select API. L:packages/components/src/components/select/Select.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-SELECT-B`:** Setup: load published 1.20.0 CSS and render the pinned `select` example alongside the local select. Action: Choose an option with keyboard, submit/reset native select, and compare local custom listbox behavior. Expected: native select for ordinary options; select.select/option; custom listbox is separate; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SIDEBAR_LAYOUT-B

**Disposition:** `retain`. **Evidence:** U:layout/sidebar-layout.mdx:16; C:sidebar-layout.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | persistent responsive sidebar and content. U:layout/sidebar-layout.mdx:16; C:sidebar-layout.css:1. |
| Markup/style | UNKNOWN | layout regions, responsive CSS. U:layout/sidebar-layout.mdx:16; C:sidebar-layout.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:layout/sidebar-layout.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:layout/sidebar-layout.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS composition with semantic landmarks. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-SIDEBAR_LAYOUT-B`:** Setup: load published 1.20.0 CSS and render the pinned `sidebar-layout` example alongside the local CSS-only composition / proposed wrapper. Action: Resize wide/narrow; inspect sidebar and content regions, reading order and overflow. Expected: persistent responsive sidebar and content; layout regions, responsive CSS; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SIGN_PAGE-B

**Disposition:** `retain`. **Evidence:** U:layout/sign-page.mdx:16; C:sign-page.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | responsive authentication layout. U:layout/sign-page.mdx:16; C:sign-page.css:1. |
| Markup/style | UNKNOWN | layout regions and form controls. U:layout/sign-page.mdx:16; C:sign-page.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:layout/sign-page.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:layout/sign-page.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS composition. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-SIGN_PAGE-B`:** Setup: load published 1.20.0 CSS and render the pinned `sign-page` example alongside the local CSS-only composition / proposed wrapper. Action: Resize auth layout and tab through form fields and submit button. Expected: responsive authentication layout; layout regions and form controls; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SKELETON-B

**Disposition:** `block` default Skeleton.Input dimensions on upstream issue duskmoon-dev/duskmoonui#68; `adapt` local busy-region/decorative semantics separately while retaining subcomponents. **Evidence:** U:components/skeleton.mdx:13,109-113,461; C:skeleton.css omits `.skeleton-input`; L:packages/components/src/components/skeleton/Skeleton.tsx:138-236.

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | Docs require `aria-busy` on the loading region and decorative skeleton shapes hidden (`U:skeleton:13,17-20`). Local composite root puts `aria-busy` on skeleton wrapper rather than the region being loaded (`L:components/skeleton/Skeleton.tsx:138-177`); primitive variant hides itself (`:115-127`). |
| Markup/style | CONFLICT | Confirmed published `C:skeleton.css` and `dist/index.css` omit `.skeleton-input` even though pinned `U:skeleton:109-113,461` promises 2.75rem default dimensions; local `L:classes/skeleton.ts:14` emits the class and local styles have no matching selector. Upstream issue duskmoon-dev/duskmoonui#68 blocks default dimensions; keep the API and do not add a local CSS workaround. |
| Interaction | ALIGNED_SOURCE | `loading=false` returns children; `active` selects wave and otherwise static (`L:components/skeleton/Skeleton.tsx:20-26,92-115`). This is React-specific behavior; no upstream state controller requirement. |
| Accessibility | GAP | Composite lines/avatar are not individually `aria-hidden` (`L:components/skeleton/Skeleton.tsx:46-64,148-175`); the composite wrapper only has `aria-busy`, so decorative nodes can remain in the accessibility tree. Primitive may expose children intentionally (`:67-89`), but decoration needs clear policy. |
| Local compatibility | UNKNOWN | Disposition: Preserve subcomponents and `loading` API (`L:components/skeleton/Skeleton.tsx:183-236`; `L:components/skeleton/Skeleton.types.ts:23-44`). Add region busy semantics or document caller responsibility in a scoped change; do not infer readiness from class inventory. Published input dimensions are BLOCKED_UPSTREAM (issue #68). |

**Future audit `CORE-SKELETON-B`:** Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: render composite and each subcomponent during loading, inspect accessibility tree for busy region/decorative hiding, then set loading=false and verify content replaces placeholders; inspect Input skeleton computed dimensions with published CSS. Expected: The loaded region exposes busy state, decorative shapes are hidden, and content replaces them when loading ends. Input default dimensions remain blocked by upstream issue #68. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes. **NOT_RUN**.

## CORE-SLIDER-B

**Disposition:** `retain`. **Evidence:** U:components/slider.mdx:14; C:slider.css:1; L:packages/components/src/components/slider/Slider.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | native Range recommended; custom slider is adapter. U:components/slider.mdx:14; C:slider.css:1. |
| Markup/style | UNKNOWN | input.range for basic; custom track/thumb requires ARIA controller. U:components/slider.mdx:14; C:slider.css:1; L:packages/components/src/components/slider/Slider.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/slider.mdx:14; L:packages/components/src/components/slider/Slider.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/slider.mdx:14; L:packages/components/src/components/slider/Slider.tsx:1. |
| Local compatibility | UNKNOWN | retain Slider adapter, document range distinction. L:packages/components/src/components/slider/Slider.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-SLIDER-B`:** Setup: load published 1.20.0 CSS and render the pinned `slider` example alongside the local slider. Action: Move thumb with arrows/Home/End and inspect value, focus and custom versus native track. Expected: native Range recommended; custom slider is adapter; input.range for basic; custom track/thumb requires ARIA controller; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SNACKBAR-B

**Disposition:** `add`. **Evidence:** U:components/snackbar.mdx:16; C:snackbar.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | brief message, optional action/dismiss. U:components/snackbar.mdx:16; C:snackbar.css:1. |
| Markup/style | GAP | snackbar with message/action. U:components/snackbar.mdx:16; C:snackbar.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | GAP | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/snackbar.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | GAP | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/snackbar.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | GAP | add wrapper with lifecycle and announcement contract. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-SNACKBAR-B`:** Setup: load published 1.20.0 CSS and render the pinned `snackbar` example alongside the local CSS-only composition / proposed wrapper. Action: Show message, activate action, dismiss and inspect announcement priority. Expected: brief message, optional action/dismiss; snackbar with message/action; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-STACK-B

**Disposition:** `retain`. **Evidence:** U:components/stack.mdx:16; C:stack.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | CSS grid overlap. U:components/stack.mdx:16; C:stack.css:1. |
| Markup/style | UNKNOWN | stack children with CSS positioning. U:components/stack.mdx:16; C:stack.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/stack.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/stack.mdx:16; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS-only composition. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-STACK-B`:** Setup: load published 1.20.0 CSS and render the pinned `stack` example alongside the local CSS-only composition / proposed wrapper. Action: Render three stacked children and inspect CSS position and reading order. Expected: CSS grid overlap; stack children with CSS positioning; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-STAT-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/stat.mdx:34; C:stat.css:1; L:packages/components/src/components/statistic/Statistic.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | responsive labelled statistics. U:components/stat.mdx:34; C:stat.css:1. |
| Markup/style | UNKNOWN | stat slots in labelled section or dl. U:components/stat.mdx:34; C:stat.css:1; L:packages/components/src/components/statistic/Statistic.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/stat.mdx:34; L:packages/components/src/components/statistic/Statistic.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/stat.mdx:34; L:packages/components/src/components/statistic/Statistic.tsx:1. |
| Local compatibility | UNKNOWN | adapt Statistic class/slot mapping if needed. L:packages/components/src/components/statistic/Statistic.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-STAT-B`:** Setup: load published 1.20.0 CSS and render the pinned `stat` example alongside the local statistic. Action: Render labelled value/delta and inspect semantic label-value association at narrow width. Expected: responsive labelled statistics; stat slots in labelled section or dl; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-STEPPER-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/stepper.mdx:16; C:stepper.css:1; L:packages/components/src/components/steps/Steps.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | static progress or interactive steps. U:components/stepper.mdx:16; C:stepper.css:1. |
| Markup/style | UNKNOWN | stepper items/state plus application control. U:components/stepper.mdx:16; C:stepper.css:1; L:packages/components/src/components/steps/Steps.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/stepper.mdx:16; L:packages/components/src/components/steps/Steps.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/stepper.mdx:16; L:packages/components/src/components/steps/Steps.tsx:1. |
| Local compatibility | UNKNOWN | audit Steps class/state compatibility. L:packages/components/src/components/steps/Steps.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-STEPPER-B`:** Setup: load published 1.20.0 CSS and render the pinned `stepper` example alongside the local steps. Action: Advance a step and inspect current/completed states plus focus if interactive. Expected: static progress or interactive steps; stepper items/state plus application control; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SWAP-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/swap.mdx:22; C:swap.css:1; L:packages/components/src/components/swap/Swap.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | native checkbox authoritative; button aria-pressed alternative. U:components/swap.mdx:22; C:swap.css:1. |
| Markup/style | UNKNOWN | checkbox plus decorative on/off slots. U:components/swap.mdx:22; C:swap.css:1; L:packages/components/src/components/swap/Swap.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/swap.mdx:22; L:packages/components/src/components/swap/Swap.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/swap.mdx:22; L:packages/components/src/components/swap/Swap.tsx:1. |
| Local compatibility | UNKNOWN | retain new wrapper; audit reset/disabled. L:packages/components/src/components/swap/Swap.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-SWAP-B`:** Setup: load published 1.20.0 CSS and render the pinned `swap` example alongside the local swap. Action: Toggle checkbox by keyboard and inspect on/off slot visibility and checked form value. Expected: native checkbox authoritative; button aria-pressed alternative; checkbox plus decorative on/off slots; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-SWITCH-B

**Disposition:** `adapt` class placement and reset synchronization; retain public callbacks/checkedChildren. **Evidence:** U:components/switch.mdx:33-47; C:switch.css:81-191; L:packages/components/src/components/switch/Switch.tsx:27-64.

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | Native checked state is required (`U:switch:33-47`). Local input is a checkbox with role=switch (`L:components/switch/Switch.tsx:47-57`), but internal `isChecked` state starts from defaultChecked and has no form reset synchronization (`:27-42`). |
| Markup/style | GAP | Published `.switch:checked/:disabled/:focus-visible` styles the input (`C:switch:81-191`). Local `.switch` is the label while input has `.switch-input` (`L:classes/switch.ts:7-10`; `L:components/switch/Switch.tsx:45-64`); local override CSS owns `.switch-track` (`L:styles.css:3917-3987`). Keep the local adapter until deliberate migration. |
| Interaction | GAP | On native reset, browser checked may reset while `isChecked`/`aria-checked` and track children remain stale until React state changes (`L:components/switch/Switch.tsx:27-42,53-63`). `loading` sets actual disabled (`:32,54`), so no form contribution while loading; this local behavior should be documented. |
| Accessibility | ALIGNED_SOURCE | `role=switch`, `aria-checked`, `aria-busy`, and hidden decorative track are source consistent (`L:components/switch/Switch.tsx:50-64`). No visible label text is rendered by this component; caller must supply `aria-label` or equivalent via spread. |
| Local compatibility | UNKNOWN | Disposition: Preserve boolean callback and checkedChildren API (`L:components/switch/Switch.types.ts:19-38`); decide whether to render a native-styled input or keep local presentation with explicit divergence. |

**Future audit `CORE-SWITCH-B`:** Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: toggle with Space, submit and reset an uncontrolled defaultChecked switch, then force rerender; checked DOM state, ARIA state, visible track, and submitted value must agree. Repeat controlled, disabled/loading, and label association. Expected: DOM checked, aria-checked, visible track and submitted value agree after toggle/reset/rerender; loading/disabled block change. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes. **NOT_RUN**.

## CORE-TABLE-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/table.mdx:17; C:table.css:1; L:packages/components/src/components/table/Table.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | native table and responsive container. U:components/table.mdx:17; C:table.css:1. |
| Markup/style | UNKNOWN | table-responsive/table/thead/tbody. U:components/table.mdx:17; C:table.css:1; L:packages/components/src/components/table/Table.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/table.mdx:17; L:packages/components/src/components/table/Table.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/table.mdx:17; L:packages/components/src/components/table/Table.tsx:1. |
| Local compatibility | UNKNOWN | audit local Table semantics and sorting. L:packages/components/src/components/table/Table.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TABLE-B`:** Setup: load published 1.20.0 CSS and render the pinned `table` example alongside the local table. Action: Render headers, rows and caption then resize; inspect native table relationships and horizontal overflow. Expected: native table and responsive container; table-responsive/table/thead/tbody; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TABS-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/tabs.mdx:15; C:tabs.css:1; L:packages/components/src/components/tabs/Tabs.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | route links versus interactive tab panels. U:components/tabs.mdx:15; C:tabs.css:1. |
| Markup/style | UNKNOWN | tablist/tab/tabpanel, hidden inactive panels. U:components/tabs.mdx:15; C:tabs.css:1; L:packages/components/src/components/tabs/Tabs.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/tabs.mdx:15; L:packages/components/src/components/tabs/Tabs.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/tabs.mdx:15; L:packages/components/src/components/tabs/Tabs.tsx:1. |
| Local compatibility | UNKNOWN | audit local keyboard/hidden behavior. L:packages/components/src/components/tabs/Tabs.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TABS-B`:** Setup: load published 1.20.0 CSS and render the pinned `tabs` example alongside the local tabs. Action: Switch tabs with arrow keys, inspect selected tab and hidden panel; separately test route-link variant. Expected: route links versus interactive tab panels; tablist/tab/tabpanel, hidden inactive panels; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TEXTAREA-B

**Disposition:** `adapt` uncontrolled reset/count synchronization; retain Input.TextArea props. **Evidence:** U:components/textarea.mdx:70-79; C:textarea.css:155-203; L:packages/components/src/components/input/Input.tsx:239-301.

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | Docs require native multiline editing/reset and counter synchronization after reset (`U:textarea:14,70-79`). Local textarea is native but always React-value driven (`L:components/input/Input.tsx:239-288`) with no reset path. |
| Markup/style | ALIGNED_SOURCE | `.textarea` and documented outlined/filled/resize/counter classes are emitted (`L:classes/input.ts:21-25,43-64,108-135`; `L:components/input/Input.tsx:273-301`); published CSS includes native textarea and counter selectors (`C:textarea:155-203,346-354`). Floating-label composition is app owned, not promised by local prop. |
| Interaction | GAP | `showCount` reads internal/currentValue, which can remain stale after native reset (`L:components/input/Input.tsx:257-269,295-301`; `U:textarea:77-79`). `maxLength` is passed to native control, but the counter's `exceeded` branch is mainly relevant to programmatic values. |
| Accessibility | ALIGNED_SOURCE | Native textarea receives caller labels/ARIA/required/readOnly/disabled through prop spread (`L:components/input/Input.tsx:273-288`; `U:textarea:53-68`); counter is visual text, and association/announcement is caller-owned. |
| Local compatibility | UNKNOWN | Disposition: Preserve `autoSize`, resize and `showCount`; docs list ghost/XS classes outside local unions (`L:components/input/Input.types.ts:11-17,51-63`; `U:textarea:55-66`). No automatic public API expansion in this read-only task. |

**Future audit `CORE-TEXTAREA-B`:** Setup: load published Core 1.20.0 CSS and render the local family in a named test fixture. Action: type in an uncontrolled textarea with defaultValue/showCount, reset its form and rerender; text and counter must return to default. Repeat maxlength, readOnly/disabled, explicit label/error description and autoSize fallback. Expected: Uncontrolled text and count return to defaults after reset and remain correct after rerender; native constraints and labels work. Planned validation: scoped component tests and browser DOM/computed-style/keyboard/AT inspection when verification resumes. **NOT_RUN**.

## CORE-THEME_CONTROLLER-B

**Disposition:** `retain`. **Evidence:** U:components/theme-controller.mdx:28; C:theme-controller.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | styled preference control; app owns persistence. U:components/theme-controller.mdx:28; C:theme-controller.css:1. |
| Markup/style | UNKNOWN | radio/dropdown/swap controls. U:components/theme-controller.mdx:28; C:theme-controller.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/theme-controller.mdx:28; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/theme-controller.mdx:28; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS composition, no automatic persistence. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-THEME_CONTROLLER-B`:** Setup: load published 1.20.0 CSS and render the pinned `theme-controller` example alongside the local CSS-only composition / proposed wrapper. Action: Switch theme through documented native control and inspect theme attribute; test persistence at app layer. Expected: styled preference control; app owns persistence; radio/dropdown/swap controls; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TIME_INPUT-B

**Disposition:** `retain` (source audit pending). **Evidence:** U:components/time-input.mdx:15; C:time-input.css:1; L:packages/components/src/components/time-picker/TimePicker.tsx:1. 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | segmented time input and picker presentation. U:components/time-input.mdx:15; C:time-input.css:1. |
| Markup/style | UNKNOWN | time-input segments/picker. U:components/time-input.mdx:15; C:time-input.css:1; L:packages/components/src/components/time-picker/TimePicker.tsx:1. |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/time-input.mdx:15; L:packages/components/src/components/time-picker/TimePicker.tsx:1. |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/time-input.mdx:15; L:packages/components/src/components/time-picker/TimePicker.tsx:1. |
| Local compatibility | UNKNOWN | adapt TimePicker if compatible, else separate API. L:packages/components/src/components/time-picker/TimePicker.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TIME_INPUT-B`:** Setup: load published 1.20.0 CSS and render the pinned `time-input` example alongside the local time-picker. Action: Enter each time segment, change picker value and inspect synchronized accessible value. Expected: segmented time input and picker presentation; time-input segments/picker; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TIMELINE-B

**Disposition:** `adapt`. **Evidence:** U:components/timeline.mdx:21; C:timeline.css:1; L:packages/components/src/components/timeline/Timeline.tsx:1. Timeline emits div chronology and span labels, while upstream calls for ol/li/time.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | chronological ordered list; CSS no controller. U:components/timeline.mdx:21; C:timeline.css:1. |
| Markup/style | CONFLICT | ol/li/time and semantic interactive disclosures. U:components/timeline.mdx:21; C:timeline.css:1; L:packages/components/src/components/timeline/Timeline.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/timeline.mdx:21; L:packages/components/src/components/timeline/Timeline.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/timeline.mdx:21; L:packages/components/src/components/timeline/Timeline.tsx:1. |
| Local compatibility | CONFLICT | adapt Timeline markup if nonsemantic. L:packages/components/src/components/timeline/Timeline.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TIMELINE-B`:** Setup: load published 1.20.0 CSS and render the pinned `timeline` example alongside the local timeline. Action: Render three dated entries and inspect ol/li/time ordering and any disclosure focus. Expected: chronological ordered list; CSS no controller; ol/li/time and semantic interactive disclosures; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TOAST-B

**Disposition:** `adapt`. **Evidence:** U:components/toast.mdx:20; C:toast.css:1; L:packages/components/src/components/notification/Notification.tsx:1. Notification defaults role=alert and local controller; upstream ordinary toast uses role=status and manual popover, though legacy open classes remain.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | manual native popover examples; legacy open classes supported. U:components/toast.mdx:20; C:toast.css:1. |
| Markup/style | CONFLICT | toast-container[popover=manual]/toast[role=status]. U:components/toast.mdx:20; C:toast.css:1; L:packages/components/src/components/notification/Notification.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/toast.mdx:20; L:packages/components/src/components/notification/Notification.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/toast.mdx:20; L:packages/components/src/components/notification/Notification.tsx:1. |
| Local compatibility | CONFLICT | retain Notification as separate controller; add native Toast if parity required. L:packages/components/src/components/notification/Notification.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TOAST-B`:** Setup: load published 1.20.0 CSS and render the pinned `toast` example alongside the local notification. Action: Show routine message, inspect role=status, close native manual popover and compare local notification role. Expected: manual native popover examples; legacy open classes supported; toast-container[popover=manual]/toast[role=status]; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TOGGLE-B

**Disposition:** `add`. **Evidence:** U:components/toggle.mdx:38; C:toggle.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | pressed action button, separate from Switch. U:components/toggle.mdx:38; C:toggle.css:1. |
| Markup/style | GAP | button.toggle-btn[aria-pressed]. U:components/toggle.mdx:38; C:toggle.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | GAP | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/toggle.mdx:38; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | GAP | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/toggle.mdx:38; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | GAP | add dedicated pressed-button wrapper. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TOGGLE-B`:** Setup: load published 1.20.0 CSS and render the pinned `toggle` example alongside the local CSS-only composition / proposed wrapper. Action: Press action button twice and inspect aria-pressed state and visual class. Expected: pressed action button, separate from Switch; button.toggle-btn[aria-pressed]; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TOGGLE_SWITCH-B

**Disposition:** `retain`. **Evidence:** U: no pinned page; C:toggle-switch.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | CSS stylesheet only; no pinned page. U: no pinned page; C:toggle-switch.css:1. |
| Markup/style | UNKNOWN | inspect selectors and relation to Switch. U: no pinned page; C:toggle-switch.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U: no pinned page; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U: no pinned page; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS-only; doc contract unknown. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TOGGLE_SWITCH-B`:** Setup: load published 1.20.0 CSS and render the pinned `toggle-switch` example alongside the local CSS-only composition / proposed wrapper. Action: Inspect published toggle-switch selectors, compose matching native control and compare with Switch. Expected: CSS stylesheet only; no pinned page; inspect selectors and relation to Switch; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-TOOLTIP-B

**Disposition:** `retain` the approved React compatibility adapter; record the absent native Interest Invoker trigger as an upstream mechanism gap for a separately scoped decision. **Evidence:** U:components/tooltip.mdx:14-20, :190-198; C:tooltip.css:5-8; L:packages/components/src/components/tooltip/Tooltip.tsx:73-105, :147-186; L:packages/components/src/classes/tooltip.ts:22-43. The native surface is arrowless: `arrow` defaults true in the React prop, but the component renders no `.tooltip-arrow` child and the published native CSS has no arrow selector. Do not infer a rendered-arrow mismatch from the prop default.

| Check | Result | Source finding |
|---|---|---|
| Design | GAP | The published design uses `popover="hint"`, `interestfor`, CSS anchors, and no arrow (U:components/tooltip.mdx:14-20; C:tooltip.css:5-8). The local default uses a native hint surface and anchors but wrapper-owned hover/focus state rather than `interestfor` (L:packages/components/src/components/tooltip/Tooltip.tsx:111-144, :162-186). The controlled `manual` path is an approved local compatibility adapter. |
| Markup/style | GAP | Local surface has `role="tooltip"`, `popover="hint"` when uncontrolled, and `positionAnchor`; the wrapper has `anchorName` and describedby association. No `interestfor` is emitted. No arrow child is rendered, so the native presentation agrees on arrow policy (U:components/tooltip.mdx:24-27, :190-198; L:packages/components/src/components/tooltip/Tooltip.tsx:147-186). |
| Interaction | GAP | Upstream uses browser Interest Invokers for hover/focus opening and native hint dismissal; local handlers and `showPopover`/`hidePopover` own open state (U:components/tooltip.mdx:14-20; L:packages/components/src/components/tooltip/Tooltip.tsx:73-144). Controlled `manual` and its document listeners are approved compatibility behavior, not a new repair request. |
| Accessibility | ALIGNED_SOURCE | Local child describedby association and `role="tooltip"` match the documented association; actual keyboard behavior remains NOT_RUN (U:components/tooltip.mdx:190-198; L:packages/components/src/components/tooltip/Tooltip.tsx:147-180). |
| Local compatibility | GAP | Keep the existing props and approved controlled/uncontrolled adapter. The source divergence is the missing `interestfor` mechanism; parent owns any future scope decision. `tooltip-show` CSS in L:packages/components/src/styles.css:4857-4989 is guarded by `:not([popover])` and does not prove the native surface uses it. |

**Future audit `CORE-TOOLTIP-B`:** Setup: render the pinned native Interest Invoker example and local Tooltip with an interactive trigger. Action: hover, focus, blur, Escape, and light-dismiss; separately exercise controlled `open`. Expected: upstream hint uses `interestfor` and native dismissal; local controlled mode reports close requests while retaining controlled state, and the native surface remains arrowless. Planned validation: browser DOM/focus/lifecycle inspection and scoped React tests after the existing popup repair boundary is resolved. **NOT_RUN**. Popup lifecycle repair has already consumed Sol 2/2 elsewhere; no repair or counter reset here.

## CORE-TREE_SELECT-B

**Disposition:** `adapt`. **Evidence:** U:components/tree-select.mdx:15; C:tree-select.css:1; L:packages/components/src/components/tree-select/TreeSelect.tsx:1. TreeSelect renders a CSS dropdown without popover, unlike native [popover=auto] upstream.

| Check | Result | Source finding |
|---|---|---|
| Design | CONFLICT | hierarchical native popover tree. U:components/tree-select.mdx:15; C:tree-select.css:1. |
| Markup/style | CONFLICT | trigger popovertarget/dropdown[popover=auto]/treeitem. U:components/tree-select.mdx:15; C:tree-select.css:1; L:packages/components/src/components/tree-select/TreeSelect.tsx:1. |
| Interaction | CONFLICT | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/tree-select.mdx:15; L:packages/components/src/components/tree-select/TreeSelect.tsx:1. |
| Accessibility | CONFLICT | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/tree-select.mdx:15; L:packages/components/src/components/tree-select/TreeSelect.tsx:1. |
| Local compatibility | CONFLICT | adapt local custom dropdown to native popover. L:packages/components/src/components/tree-select/TreeSelect.tsx:1; `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-TREE_SELECT-B`:** Setup: load published 1.20.0 CSS and render the pinned `tree-select` example alongside the local tree-select. Action: Open tree popover, expand node, select leaf, Escape and inspect treeitem state/focus. Expected: hierarchical native popover tree; trigger popovertarget/dropdown[popover=auto]/treeitem; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## CORE-VALIDATOR-B

**Disposition:** `retain`. **Evidence:** U:components/validator.mdx:15; C:validator.css:1; L: packages/components/src/components (no dedicated wrapper). 

| Check | Result | Source finding |
|---|---|---|
| Design | UNKNOWN | opt-in native validity styling plus explicit application error. U:components/validator.mdx:15; C:validator.css:1. |
| Markup/style | UNKNOWN | validator on native field; aria-invalid precedence. U:components/validator.mdx:15; C:validator.css:1; L: packages/components/src/components (no dedicated wrapper). |
| Interaction | UNKNOWN | Source comparison of documented state transitions and local handler wiring remains unresolved. Runtime validation is separately NOT_RUN. U:components/validator.mdx:15; L: packages/components/src/components (no dedicated wrapper). |
| Accessibility | UNKNOWN | Source comparison of names, keyboard/focus, roles, and decorative content remains unresolved. U:components/validator.mdx:15; L: packages/components/src/components (no dedicated wrapper). |
| Local compatibility | UNKNOWN | retain CSS-only utility; application owns messages. L: packages/components/src/components (no dedicated wrapper); `L:packages/components/src/styles.css:1` (local overrides may apply). |

**Future audit `CORE-VALIDATOR-B`:** Setup: load published 1.20.0 CSS and render the pinned `validator` example alongside the local CSS-only composition / proposed wrapper. Action: Submit invalid then valid native field; inspect aria-invalid precedence and visible app error. Expected: opt-in native validity styling plus explicit application error; validator on native field; aria-invalid precedence; appropriate accessible semantics. Planned validation: scoped source/unit tests after design, then browser DOM/computed-style/interaction inspection. **NOT_RUN**.

## Priority findings and boundaries

- `menu`: current default ARIA menu roles conflict with the pinned ordinary-navigation contract; a separate application menu mode may preserve local API. Review before changing behavior.
- `modal`: `aria-modal=true` requires actual background inertness and focus containment; local source only shows state, backdrop and Escape handling. Treat as evidenced implementation risk, not an upstream dependency bug.
- `popover`, `tree-select`, `select`, `rating`, `toast`: class overlap conceals different native/ARIA state contracts. Keep existing React APIs until migration design is settled; do not infer automatic removal from upstream CSS.
- `tooltip`: native hint surface and anchors are committed; the trigger lacks upstream `interestfor`. Controlled `manual` mode and document listeners are approved compatibility adapters. Popup repair budget is already Sol 2/2 outside this read-only assignment; no repair attempted.
- CSS-only compositions are reasonable for visual primitives (`mask`, `stack`, `radial-progress`, layout shells), but `loading` lacks a dedicated React API and cannot transfer state/announcements automatically. `navigation` and `toggle-switch` have no pinned component page, so design and accessibility remain `UNKNOWN`.

The preceding priority findings were produced by an earlier read-only subreview. This durable report now records upstream issues #67 and #68 and the scoped `TODO(upstream)` comment in `classes/skeleton.ts`. Runtime tests, builds, typechecks, parity, browser, formatter, and diff checks remain NOT_RUN for this cycle.

## Exact high-priority mismatch ledger

| Family | Upstream evidence | Local evidence | Disposition |
|---|---|---|---|
| menu | `U:components/menu.mdx:13`, `:64-72`: ordinary nav uses list/Tab semantics, no ARIA menu roles | `L:packages/components/src/components/menu/Menu.tsx:57`, `:300`: defaults menuitem/menu roles | adapt semantics or separate application-menu API |
| modal | `U:components/modal.mdx:197-207`: background inertness, focus containment before aria-modal | `L:packages/components/src/components/modal/Modal.tsx:93-101`, `:135-151`: only change callback effect, aria-modal true | adapt focus/inert; preserve legacy API |
| popover | `U:components/popover.mdx:13-17`, `:160-171`: native `[popover]` with anchors | `L:packages/components/src/components/popover/Popover.tsx:195-210`; `L:packages/components/src/styles.css:2773-2802`: local show class and role=tooltip | adapt native mechanism, preserve props if possible |
| rating | `U:components/rating.mdx:14`, `:37-60`: editable native radios/form state | `L:packages/components/src/components/rate/Rate.tsx:121-167`: div/span ARIA radios | adapt editable mode; retain static/half API |
| select | `U:components/select.mdx:14-15`, `:66-69`: native select; custom search/listbox separate | `L:packages/components/src/components/select/Select.tsx:363-393`: button/listbox | retain custom API separately; add/adapt native Select contract after design |
| tree-select | `U:components/tree-select.mdx:15-24`, `:47-83`: native auto popover plus tree state | `L:packages/components/src/components/tree-select/TreeSelect.tsx:551-600`: state button and plain dropdown div | adapt native overlay/ARIA state |
| timeline | `U:components/timeline.mdx:21-24`: chronological ol/li/time | `L:packages/components/src/components/timeline/Timeline.tsx:43-86`: divs/span labels | adapt semantic markup; preserve items API |
| toast | `U:components/toast.mdx:20`, `:261-273`: native manual popover, status for routine messages; legacy classes remain | `L:packages/components/src/components/notification/Notification.tsx:301`: alert default; local controller | retain Notification as distinct API; add/adapt Toast behavior |
| tooltip | `U:components/tooltip.mdx:14-20`, `:190-198`: hint, interestfor, anchors, no arrow | `L:packages/components/src/components/tooltip/Tooltip.tsx:111-144`, `:162-186`: native hint and anchors, wrapper JS, no interestfor; no arrow child; approved manual controlled surface | retain approved adapter; record interestfor divergence for a separate scope decision |

## CSS effects and base/theme/import surfaces — separate appendix

This appendix covers **four effect families plus one grouped infrastructure surface**. They are separate from the 84 component families above, so the component five-check and future-audit counts remain 84 × 5 and 84. All five appendix audits are `NOT_RUN`. The published `@duskmoon-dev/core@1.20.0` package exports `./effects/aura`, `./effects/hover-3d`, `./effects/hover-gallery`, `./effects/text-rotate`, their CSS subpaths, `./effects.css`, `./base.css`, `./plugin`, and four theme subpaths (`package.json:90-149`). The package's `dist/effects/index.css` says effects are explicitly opt-in and absent from the main Core/component index. `packages/components/scripts/build-css.ts` concatenates published Core `dist/index.css` with local `src/styles.css`; source inspection found no effect selector in that published main index. A consumer must import an effect stylesheet explicitly. No pinned effect-specific MDX page was found under the target tag's English docs tree; published CSS is the selector/behavior evidence. The grouped theme surface has pinned `api/theme-tokens.mdx`, `api/plugin-options.mdx`, and `guides/react.mdx`.

| Target | Category | Old/new contract and evidence | Affected local surfaces | Action | Compatibility or migration reason | Verification/evidence status |
| --- | --- | --- | --- | --- | --- | --- |
| Aura effect | local-only | Published `dist/effects/aura.css` defines `.aura`, modifiers and reduced-motion rules; `./effects/aura` and `./effects/*.css` are exported | Consumer CSS import; local `scripts/build-css.ts` | `retain` | Explicit CSS composition around existing child; no dedicated React wrapper contract | Source reviewed; import/render NOT_RUN |
| Hover 3D effect | local-only | Published `dist/effects/hover-3d.css` defines 3×3 hover zones and reduced-motion fallback | Consumer CSS import; local `scripts/build-css.ts` | `retain` | Direct CSS surface; child/zone markup is consumer-owned | Source reviewed; import/render NOT_RUN |
| Hover Gallery effect | local-only | Published `dist/effects/hover-gallery.css` reveals focus-visible as well as hovered child items | Consumer CSS import; local `scripts/build-css.ts` | `retain` | Direct CSS surface; accessible focusable items are consumer-owned | Source reviewed; import/render NOT_RUN |
| Text Rotate effect | local-only | Published `dist/effects/text-rotate.css` cycles 2–6 lines and pauses on hover/focus-within/class | Consumer CSS import; local `scripts/build-css.ts` | `retain` | Direct CSS surface; duplicate accessible text/announcement policy is consumer-owned | Source reviewed; import/render NOT_RUN |
| Base/theme/import/plugin | local-only | Published package exports `./base.css`, `./plugin`, theme subpaths and main `.`; docs `api/theme-tokens.mdx`, `api/plugin-options.mdx`, `guides/react.mdx`; local build concatenates main Core CSS and local styles | `scripts/build-css.ts`, `src/styles.css`, package CSS export and consumer imports | `retain` | Preserve direct CSS/plugin/theme APIs, including consumer data-theme/custom themes; do not invent React wrappers | Source reviewed; built artifact/theme switching NOT_RUN |

### EFFECT-AURA

| Check | Result | Source finding |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Published `dist/effects/aura.css:1-100` is a visual glow around arbitrary direct content, with dual/rainbow/holo/gold/silver/glow and size classes; it is an opt-in CSS API, not a stateful component. |
| Markup/styling | ALIGNED_SOURCE | `.aura` uses before/after pseudo-elements and `> *` stacking; `:has(> :is(.btn, .input, .select, .textarea))` changes radius. Consumer markup must supply the child and explicit stylesheet import. |
| Interaction | ALIGNED_SOURCE | Animation is inside `prefers-reduced-motion: no-preference`; print removes padding. No JavaScript lifecycle appears in the published CSS. |
| Accessibility | UNKNOWN | The aura itself adds no semantic node; actual focus, name and contrast depend on the consumer child and theme tokens, which have no pinned example here. |
| Local compatibility | ALIGNED_SOURCE | Core effect CSS is publicly exported; local build only concatenates main `dist/index.css`, so no React wrapper is required and explicit effect import is the known path. Built consumer output remains NOT_RUN. |

**Future audit `EFFECT-AURA` — NOT_RUN.** Setup: import `@duskmoon-dev/core/effects/aura.css` beside local component CSS; render `.aura.aura-rainbow` around a named Button. Action: inspect pseudo-element glow while focusing/clicking Button, then emulate reduced motion and print. Expected: glow frames the child without intercepting input; animation is absent under reduced motion and print padding is removed. Planned validation: browser computed styles, focus and media emulation.

### EFFECT-HOVER_3D

| Check | Result | Source finding |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Published `dist/effects/hover-3d.css` creates a visual 3D hover effect through CSS custom axes, angle, shadow and shine. |
| Markup/styling | ALIGNED_SOURCE | First child is the visual tile; children 2–9 form the 3×3 hover zones via `:nth-child` and `:has`. This is consumer DOM composition, not a local wrapper gap. |
| Interaction | ALIGNED_SOURCE | Hover zones set angle/shine under `prefers-reduced-motion: no-preference`; reduced-motion/print rules remove transform/transition/shine. CSS defines no focus-zone trigger, so keyboard parity is not asserted. |
| Accessibility | UNKNOWN | Any links or controls placed in hover zones need consumer-provided names and focus treatment; published CSS alone does not establish that contract. |
| Local compatibility | ALIGNED_SOURCE | `./effects/hover-3d` and CSS subpath are exported upstream; local CSS build does not embed this opt-in effect. |

**Future audit `EFFECT-HOVER_3D` — NOT_RUN.** Setup: import `@duskmoon-dev/core/effects/hover-3d.css`; render a tile plus eight zone children in `.hover-3d`. Action: hover corner/center zones and inspect tile transform and shine, then enable reduced motion. Expected: angle and shine vary by hovered zone; reduced motion removes the transforms and transitions. Also record keyboard reachability of any consumer controls without claiming CSS hover parity. Planned validation: browser DOM/computed styles and media emulation.

### EFFECT-HOVER_GALLERY

| Check | Result | Source finding |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Published `dist/effects/hover-gallery.css` is a CSS gallery reveal with a first-child default image and later preview items. |
| Markup/styling | ALIGNED_SOURCE | `.hover-gallery` uses `:has(> :nth-child(N))` for columns, first child as default panel, items 2–10 as focus/hover targets; 11+ are hidden. |
| Interaction | ALIGNED_SOURCE | `:is(:hover, :focus-visible)` reveals a later item; print keeps only the first child. No JS state controller is required. |
| Accessibility | UNKNOWN | Source does not determine whether consumer preview items are keyboard focusable or properly named; an unfocusable image cannot exercise the focus-visible path. |
| Local compatibility | ALIGNED_SOURCE | Published effect subpath/CSS is directly importable; local main-index concatenation does not make it a React wrapper. |

**Future audit `EFFECT-HOVER_GALLERY` — NOT_RUN.** Setup: import `@duskmoon-dev/core/effects/hover-gallery.css`; render first default image and three labelled focusable preview items. Action: hover and Tab to each preview, then inspect print mode. Expected: hovered or focused item replaces the default view, later items stay addressable, and print displays only the first item. Planned validation: browser computed styles, keyboard focus and print media emulation.

### EFFECT-TEXT_ROTATE

| Check | Result | Source finding |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Published `dist/effects/text-rotate.css` rotates 2–6 stacked text lines using CSS keyframes, with a custom duration variable. |
| Markup/styling | ALIGNED_SOURCE | `.text-rotate > * > *` requires an outer wrapper, inner grid and text-line children; selectors choose animation by child count. |
| Interaction | ALIGNED_SOURCE | Hover, focus-within and `.text-rotate-paused` set play state paused; reduced-motion users receive no animation. |
| Accessibility | UNKNOWN | CSS retains all text nodes; consumer must decide whether rotating duplicates are announced or hidden from assistive technology for their context. No pinned effect page resolves that policy. |
| Local compatibility | ALIGNED_SOURCE | Published effect export and CSS subpath are opt-in; local main stylesheet does not supply an effect-specific wrapper. |

**Future audit `EFFECT-TEXT_ROTATE` — NOT_RUN.** Setup: import `@duskmoon-dev/core/effects/text-rotate.css`; render three text lines in the required nested structure. Action: inspect cycling, then hover, focus a contained control, add paused class and emulate reduced motion. Expected: cycling pauses for each documented trigger and no animation runs under reduced motion; accessible reading of text is recorded separately. Planned validation: browser computed animation, focus and media emulation.

### CORE-INFRA-BASE_THEME_IMPORT

| Check | Result | Source finding |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Core 1.20.0 exposes base styles, generated themes and a Tailwind plugin as direct package APIs. Pinned `api/theme-tokens.mdx` documents token overrides; `api/plugin-options.mdx` documents built-in theme options; `api/theme-tokens.mdx:247-258` documents custom `[data-theme]` token CSS. The pinned plugin-options page lists only sunshine/moonlight as built-in options, while package CSS exports ocean/forest too; plugin handling of those latter two is UNKNOWN from this source review. |
| Markup/styling | ALIGNED_SOURCE | Published theme CSS includes `[data-theme="sunshine"]`, `moonlight`, `ocean`, `forest`; base.css defines root/data-theme color and focus/disabled defaults. No React wrapper is implied. |
| Interaction | UNKNOWN | Theme selection/persistence is consumer-owned; the pinned plugin-options page lists only sunshine/moonlight, so whether the plugin supports the exported ocean/forest styles remains unresolved. Custom themes are documented as consumer CSS `[data-theme]` overrides, not a verified plugin option. |
| Accessibility | UNKNOWN | Contrast and focus behavior of each theme or consumer custom theme require computed-style/browser evidence; package CSS alone is not an accessibility outcome. |
| Local compatibility | ALIGNED_SOURCE | `scripts/build-css.ts` reads published `dist/index.css` then appends local `src/styles.css`; package export exposes local built `styles.css`. The build has not been run in this cycle. |

**Future audit `CORE-INFRA-BASE_THEME_IMPORT` — NOT_RUN.** Setup: when verification resumes, build local `styles.css` with published Core 1.20.0; also import upstream `base.css`, each built-in theme subpath and `./plugin` in representative fixtures. Action: compare built CSS inclusion, switch `data-theme` among sunshine/moonlight/ocean/forest, then add a custom `[data-theme="my-theme"]` CSS token override as documented in `api/theme-tokens.mdx` and inspect token/focus styles. Check plugin options only with documented built-ins; separately inspect whether ocean/forest are accepted by that plugin. Expected: local artifact contains main Core plus local overrides; direct theme/plugin imports resolve; four direct theme CSS subpaths and the custom CSS override provide expected token values without duplicate or missing CSS; plugin support for ocean/forest is recorded according to observed behavior. Planned validation: scoped artifact inspection and browser computed-style/theme-switch checks.
