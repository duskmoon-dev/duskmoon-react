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

- 73 standard components such as `Button`, `Chat`, `Table`, `Modal`, `Select`,
  and `Typography`.
- 21 DuskMoon workflow components such as `DmLayout`, `DmSearch`, `DmTable`,
  `DmProTable`, and `DmToolbar`.
- 13 infrastructure exports including `theme`, `version`,
  `unstableSetRender`, `GetProps`, `GetRef`, and DuskMoon theme helpers.
- Component subpath exports follow `@duskmoon-dev/components/{component-id}`,
  for example `@duskmoon-dev/components/date-picker`.

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
