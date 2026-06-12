# @duskmoon-dev/components

The core React component library for Duskmoon.

## Installation

```bash
bun add @duskmoon-dev/components
```

## Features

- **TypeScript First**: Written entirely in TypeScript for excellent developer experience.
- **Optimized for Next.js**: Compatible with Next.js 15 and React 19.
- **Modular Exports**: Import only what you need.

## Usage

```tsx
import "@duskmoon-dev/components/styles.css";
import { Button } from "@duskmoon-dev/components/button";

export default function MyComponent() {
  return <Button>Hello World</Button>;
}
```

## Development

```bash
# Build the package
bun run build

# Run tests
bun run test

# Typecheck
bun run typecheck
```
