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

- 78 standard components such as `Button`, `Chat`, `OtpInput`, `Swap`, `Fab`,
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
            <Chat.StatusItem><Chat.StatusValue>42</Chat.StatusValue> token/s</Chat.StatusItem>
          </Chat.Status>
          <Chat.Actions hover>
            <button type="button" onClick={copyReply}>Copy reply</button>
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
