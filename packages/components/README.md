# @duskmoon-dev/components

The DuskMoon React component package.

## Installation

```bash
bun add @duskmoon-dev/components @duskmoon-dev/core react react-dom
```

Import the stylesheet once in your app:

```tsx
import "@duskmoon-dev/components/styles.css";
```

## Features

- **React 19 ready**: Components and examples target the current React runtime.
- **TypeScript first**: Public props and helper APIs ship with declarations.
- **Modular exports**: Import from the root package or from component subpaths.
- **DuskMoon styling**: Component classes and CSS are backed by
  `@duskmoon-dev/core`.

## Usage

```tsx
import "@duskmoon-dev/components/styles.css";
import { Button } from "@duskmoon-dev/components/button";

export default function MyComponent() {
  return <Button>Hello World</Button>;
}
```

Root imports are also supported:

```tsx
import { Button, DmTable, theme } from "@duskmoon-dev/components";
```

## Public Surface

- 79 standard components such as `Button`, `Chat`, `OtpInput`, `Swap`, `Fab`,
  `Megamenu`, `ConsolePage`, `Table`, `Modal`, `Select`, and `Typography`.
- 21 DuskMoon workflow components such as `DmLayout`, `DmSearch`, `DmTable`,
  `DmProTable`, and `DmToolbar`.
- 13 infrastructure exports including `theme`, `version`,
  `unstableSetRender`, `GetProps`, `GetRef`, and DuskMoon theme helpers.
- Component subpath exports follow `@duskmoon-dev/components/{component-id}`,
  for example `@duskmoon-dev/components/date-picker`.

`OtpInput` uses one native input with decorative slots. `Swap` uses a native
checkbox. `Fab`, `Megamenu`, and the mobile menu in `ConsolePage` use the
browser's Popover API for opening, Escape dismissal, and focus restoration.
These components require `@duskmoon-dev/core` 1.20.0 or newer.

`Form.Item` associates its label with a single child control, preserving an
existing child `id`. For composite controls, pass `htmlFor` with the target
control's `id`. `Badge appearance="outline"` emits both `badge-outlined` and
the supported `badge-outline` alias.

`Chat.Scroll` provides a fixed-height transcript with a sticky reply rail.
Pair assistant rows and indicator buttons with timeline slots 1–24; user rows
do not need ticks. `Chat.Status` and `Chat.Actions` accept ordinary content and
button callbacks, so the application owns generation state and metrics. The
Chat docs include RTL, live states, tool statuses, message actions and the Core
1.20.6 agent, queue and long-message contracts. Use `Chat.Agent` with
`Chat.Content` for unboxed assistant answers. Group activity in native
`Chat.Work`, `Chat.WorkSummary` and `Chat.WorkBody` disclosures, keeping the final
answer outside them. User messages use `Chat placement="end"` and `Chat.Bubble`;
opt into `collapsible` for automatic six-line measurement, resize/text updates,
accessible expansion and focus cleanup. The package now requires Core 1.21.1,
which supplies the shared Composer editor, attachment, suggestion and status parts.

`Chat.InputArea` attaches a controlled `Chat.Queue` to native
`Chat.ComposerForm`, `Chat.ComposerInput`, `Chat.ComposerActions` and
`Chat.ComposerHint` primitives. Queue items have stable `id`/`text` values and
optional `{ src, alt }` attachments. `onSteer` and `onRemove` request application
actions; the component never dequeues locally. Supply `pendingIds` while awaiting
acknowledgment and update items only after success. Restore focus after removing
a focused row, and announce queue changes once in an application status region.
The application owns Enter/Shift+Enter/steering, IME guards, transport, ordering
and failure policy. The interactive docs demonstrate those actual state changes.

The existing controlled `Chat.Composer` retains its div ref, attachment and
completion APIs, revision-safe asynchronous draft clearing, and Cmd/Ctrl+Enter
submission with ordinary Enter for newlines. Use the native composer primitives
when form submission and the reference's Enter-to-queue contract are needed.
Supply `scope={{ contextKey, conversationId }}` when reusing a Composer between
repositories or conversations: a late acceptance or error from the previous
scope cannot clear the current draft or call its error handler. Pending admission
leaves editing available. The host still owns the controlled draft and files.

Composer actions use icon buttons with accessible names and `title` hints in both
layouts. `attachLabel`, `sendLabel` and `stopLabel` customize those names and hints.
Attachment retry/cancel/remove and default queue actions follow the same pattern.
The shared composer padding is 0.5rem.

Set `compact` on `Chat.Composer`, `ChatSessionComposer` or `RichChatComposer`
for a compact toolbar with accessible icon buttons and a horizontal strip of
simple ready-image thumbnails. Mixed files, preparation, errors and custom
attachment renderers retain full rows. The default wrapping layout remains
available. Compose host-owned settings through `children`, using Core's native
`popover chat-composer-menu` classes when a configuration menu is needed.
The compact `+` opens a native Add menu for files, explicit draft save/reload
and optional `addMenu` content. Routine save/admission status is announced without
adding rows. Its primary button sends an eligible draft or stops the running turn
when submission is unavailable; the default layout retains separate controls.

Root and `/chat` exports also provide editor-independent `ComposerDocument`,
`ComposerDraft`, submission/receipt, provider, attachment and queue types.
`readComposerDocument` and `readComposerDraft` preserve incompatible input for
recovery; `snapshotComposerDocument` and `snapshotComposerSubmission` validate,
copy and freeze portable JSON. `exportComposerText` and `exportComposerMarkdown`
project references through `plainText` and retain quote attribution. Invalid
snapshots throw instead of silently discarding unsupported fields. Portable
examples are published at `@duskmoon-dev/components/chat/contracts.v1.json`.
`ChatSessionComposer` uses those contracts with a controlled semantic document,
application-owned `ComposerSessionHost`, scope and draft key. The original
string/File-based `Chat.Composer` remains available with its existing ref and
callbacks. The optional editor is imported separately:

```tsx
import { useState } from "react";
import type {
  ComposerDocumentUpdate,
  ComposerScope,
  ComposerSessionHost,
} from "@duskmoon-dev/components/chat";
import { RichChatComposer } from "@duskmoon-dev/components/chat/rich";

export function PromptBox({
  host,
  scope,
}: {
  host: ComposerSessionHost;
  scope: ComposerScope;
}) {
  const [value, setValue] = useState<ComposerDocumentUpdate>({
    document: { schemaVersion: 1, content: [{ type: "text", text: "" }] },
    revision: 0,
    origin: "replace",
    originId: "initial-draft",
  });
  return (
    <RichChatComposer
      value={value}
      onDocumentChange={setValue}
      scope={scope}
      draftKey="main-prompt"
      host={host}
    />
  );
}
```

Use `ChatSessionComposer` from root or `/chat` with the same props for text-only
semantic drafts. RichChatComposer is available only from `/chat/rich`. Keep a
single compatible Lexical runtime in consumers that also import Lexical directly;
ordinary root and `/chat` imports do not initialize it.

Echo each `onDocumentChange` update unchanged. The rich editor retains selection
and undo for echoes; explicit replace, restore, scope switch and clear operations
reset its history. Remounts restore semantic content, not undo history. Its ref
inserts references, quotes, text and claimed commands without exposing Lexical.
References and quotes are atomic. Claimed command identity stays distinct from
editable skill text. Rich copy/cut includes portable semantic content and plain
text; rich paste creates fresh occurrence IDs, while external paste uses plain
text. Mixed file/text paste preserves text and validates files through the shared
picker/paste/drop policy. Unsupported content is retained for recovery rather
than silently flattened if the editor cannot load or a draft is incompatible.

Keep `host.recovery = createComposerRecoveryOwner()` outside the editor's mount
lifetime. Pending and unknown attempts retain the exact immutable submission
snapshot and ID. An accepted prompt reports actual delivery and persistence;
an accepted command returns a result without claiming a queued prompt or turn.
Unknown outcomes preserve the draft: reconcile using `host.reconcile` before any
explicit `host.authorizeRetry` of the same snapshot. Admission is not completed
generation. Stop is a separate `onStop` action and remains available while file
preparation or admission is pending. Host capabilities determine which active-turn
intents and controls are available.

Optional `attachmentOptions` validates and prepares each file occurrence, with
cancellation, progress, failure and retry. Only ready portable handles enter a
submission; runtime `File` objects and preview URLs stay out of saved documents.
Recovered files require reattachment unless the host explicitly confirms handle
recovery. A stable optional `draftAdapter` loads scoped drafts and supports explicit
Save draft; storage durability, retention and coordination with other writers
belong to the application. The UI never automatically overwrites incompatible
stored content.

`providers` supply scoped asynchronous candidates, disabled reasons, directory
drill-down and insert/invoke actions. In compact mode, results open in a native
popover above the composer, with grouped rows, keyboard navigation, filtering and
native dismissal. Optional provider `icon` and `sourceLabel` decorate the rows;
they never enter portable documents or submissions. Use a leading `/` provider
for skills and commands: skills insert editable instructions, rich claimed
commands retain their identity until submission, and `invoke` actions call
`onProviderInvoke` independently. The plain editor supports text skills and host
invocation; claimed commands require the rich editor.
The host resolves and authorizes references,
quote provenance, commands and attachment handles; portable validity is not
authorization. `ChatAuthoritativeQueue` renders confirmed projections and requests
revision-checked edit/remove/promote mutations. Apply canonical projections through
`onProjection`; an optimistic click does not confirm membership or order.
`ComposerSettings` likewise keeps values controlled until the host acknowledges
and applies a request. The host owns transport, model execution, uploads,
idempotency, persistence and execution policy. The Chat documentation includes
interactive fake-host examples with real local state transitions; their memory
storage survives editor remounts only and makes no durable delivery claim.

### Settings menus, context and timeline approvals

Core **1.21.5 or newer** is required. Import these APIs from the package root or
`@duskmoon-dev/components/chat`; import `@duskmoon-dev/components/styles.css`
for the complete Core and React stylesheet.

`ComposerSettings variant="menu"` uses the same serialized request, revision,
abort and acknowledgment protocol as the default select presentation. Choice
metadata accepts `description`, `tone="warning"` and `icon`. An `ordered` setting
renders its choices as a range and requests a change on pointer/key release;
`defaultValue` enables reset. `groups` combines `settingIds` under a trigger,
with optional `nestedSettingIds` and `appearance="access" | "model"`. Values
remain controlled by the host, including rejected or stale acknowledgments.
The menus close after choosing; status feedback remains announced outside them.

Both `Chat.Composer` and `ChatSessionComposer` accept `context`, rendered first
inside the composer. Compose `Chat.ComposerContext`, `Chat.ComposerContextItem`,
`Chat.ComposerContextEnd` and `Chat.ComposerConnection` there. Items accept an
`icon` and an optional `action` with a required accessible `label` and `onClick`.
Connection `state` is `connected`, `connecting` or `disconnected`; `label`
customizes its visible status. Core joins the bar to default, compact and ghost
composer surfaces using the shared inset; no additional consumer CSS is needed.

Place `Chat.Request` next to `Chat.Tool` inside `Chat.Agent`. Supply a `title`,
detail children and ordered `actions` (`id`, `label`, `onSelect`, optional
`tone="primary" | "danger"`). The host owns `pending` while deciding and `state`:
`pending`, `approved`, `approved-for-session`, `declined`, `expired` or
`answer-elsewhere`. Only the pending state renders actions; `pending` disables
them while a decision is in flight. `explanation` and `statusLabel` provide host
context and localized status. Status updates are polite; incoming updates never
move focus out of the composer. If resolution removes a focused decision, focus
stays on that request without scrolling.

Core 1.21.1 still has a known Moonlight contrast gap for neutral outlined/ghost
labels ([duskmoonui#78](https://github.com/duskmoon-dev/duskmoonui/issues/78)).
The upstream fix is required before claiming complete palette accessibility.

Existing `Chat.Bubble streaming` remains usable; `Chat.Content streaming` is the
preferred agent presentation. No public Chat API is removed or deprecated.

Normal `Tooltip` button/link triggers use native `interestfor`, hint popovers
and CSS anchors. Browsers must support those APIs; there is no feature polyfill.
Keep essential help inline. Controlled `open` uses native manual popovers;
non-invoker children retain the older imperative compatibility adapter. Custom
trigger components must forward `interestfor`, `style` and `aria-describedby`
to their native control. Tooltip content is brief and noninteractive; put links,
buttons and confirmation forms in Popover/Popconfirm. The existing deprecated
`arrow` prop remains accepted; native surfaces are arrowless.

```tsx
import { Chat } from "@duskmoon-dev/components/chat";
import { useId } from "react";

export function Conversation() {
  const replyId = useId();
  async function copyReply() {
    await navigator.clipboard.writeText("The build passed.");
  }

  return (
    <Chat.Scroll style={{ height: 320 }} aria-label="Conversation">
      <Chat.ScrollTrack aria-label="Assistant replies">
        <Chat.ScrollIndicator timeline={1} targetId={replyId} />
      </Chat.ScrollTrack>
      <Chat.ScrollBody>
        <Chat.Agent id={replyId} timeline={1}>
          <Chat.Content>The build passed.</Chat.Content>
          <Chat.Status>
            <Chat.StatusItem>Completed</Chat.StatusItem>
            <Chat.StatusItem>
              <Chat.StatusValue>42</Chat.StatusValue> token/s
            </Chat.StatusItem>
          </Chat.Status>
          <Chat.Actions hover>
            <button type="button" onClick={copyReply}>
              Copy reply
            </button>
          </Chat.Actions>
        </Chat.Agent>
      </Chat.ScrollBody>
    </Chat.Scroll>
  );
}
```

`Modal` requires a modern browser with native `<dialog>` support. It opens and
closes through `showModal()` and `close()`, while its forwarded ref and div props
remain on the inner modal box. Controlled callers must update `open` in
`onCancel`; `maskClassName` is applied to the dialog for `::backdrop` styling.
The static `Modal.confirm`, `info`, `success`, `error`, and `warning` handles
remain exported but do not render a service surface yet.

## Development

```bash
# Build the package
bun run build

# Run tests
bun run test

# Typecheck
bun run typecheck

# Check parity manifest coverage
bun run parity:components
```

## JSON Schema forms

`@duskmoon-dev/components/json-schema-form` exports `JsonSchemaForm`,
`compileForm`, `JsonSchemaWidget`, and the `RenderableSchema`, `CompiledForm`,
`FormValue`, `JsonValue`, `FormErrors`, `FormValidationResult`,
`JsonSchemaFormProps`, `JsonSchemaWidgetProps`, and widget contract types.
Ajv and ajv-formats are installed as package runtime dependencies. The package
stylesheet includes the renderer layout. Import these APIs from the explicit
subpath; schema compilation is kept separate from the root component bundle.

```tsx
import { useState } from "react";
import "@duskmoon-dev/components/styles.css";
import {
  JsonSchemaForm,
  type FormErrors,
  type FormValue,
  type RenderableSchema,
} from "@duskmoon-dev/components/json-schema-form";

const schema: RenderableSchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", title: "Name", minLength: 1 },
    age: { type: "integer", title: "Age", minimum: 0 },
  },
};

export function ProfileIsland({ send }: { send: (value: FormValue) => void }) {
  const [value, setValue] = useState<FormValue>({ name: "Ada" });
  const [errors, setErrors] = useState<FormErrors>({});
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={setValue}
      errors={errors}
      onErrorsChange={setErrors}
      onSubmit={send}
    />
  );
}
```

Mount the React root inside a LiveView element with a stable `id` and
`phx-update="ignore"`. Parse the backend's schema JSON and call `compileForm`
when accepting untrusted input; catch compilation errors before rendering.
Pass the returned object as `compiled` instead of `schema` to compile once.
Send the validated object from `onSubmit` through the island's LiveView hook;
backend validation is still required. Use a new React `key` when replacing a
schema and starting a fresh form.

`value` and `onChange` control values. Omit `value` for internal state, optionally
seeded by `defaultValue`. Reset restores `defaultValue` or schema defaults,
notifies `onChange`, clears validation errors, and calls `onReset`. Backend
`errors` merge with local errors and use escaped JSON Pointer keys such as
`/address/email` (the empty key denotes a form error). Clear backend errors in
`onErrorsChange`, which receives an empty object on edits/reset and validation
errors on submission. `onSubmit` runs only for valid values and receives a
copied JSON object with numbers and booleans preserved.

The supported schema is a strict JSON Schema draft 2020-12 subset: object roots,
nested objects, homogeneous arrays, primitive fields/enums/defaults, required
fields, `additionalProperties: false`, string constraints/formats, numeric
constraints, and array/object size constraints. References, combinators,
nullable types, and arbitrary keywords are rejected. Validation does not coerce,
remove, or default submitted values.

Use `x-widget` for explicit component selection, `x-options` for typed option
labels/hierarchies, and `x-widget-options` for orientation, length, count,
allowHalf, min, max, and step where supported. `widgetNames`, `WidgetName`,
`WidgetOption`, `WidgetConfig`, and `OrientationWidgetConfig` expose this
contract; `compileForm` checks widget/type/config compatibility. Upload widgets
submit JSON file metadata (`name`, `size`, `type`, `lastModified`), with file
transfer owned by the application.
