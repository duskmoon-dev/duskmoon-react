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
Chat docs show all ten Core 1.20.3 showcases, including RTL bubbles, live states,
tool statuses, and message actions. For an LLM reply, place reasoning and tool
details inside one `Chat.Bubble`, with final content in
`.chat-bubble-content`. The new Chat styles and the `Avatar` `2xl` size require
Core 1.20.3 or newer.

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
        <Chat id={replyId} timeline={1}>
          <Chat.Bubble>The build passed.</Chat.Bubble>
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
        </Chat>
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
