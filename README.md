# Duskmoon React

A modern, high-quality React component library built with TypeScript and optimized for performance.

## Project Structure

This is a monorepo powered by [Bun](https://bun.sh/).

- `packages/components`: The core component library (`@duskmoon-dev/components`).
- `packages/docs`: Documentation for the library (`@duskmoon-dev/docs`).
- `examples/nextjs-15-smoke`: A smoke test example using Next.js 15.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.

### Installation

Install dependencies for the entire monorepo:

```bash
bun install
```

### Development

Build all packages:

```bash
bun run build:all
```

Run tests:

```bash
bun test
```

Lint the codebase:

```bash
bun run lint
```

Format the codebase:

```bash
bun run format
```

## Usage

To use the components in your project, install the `@duskmoon-dev/components` package and its peer dependencies.

```bash
bun add @duskmoon-dev/components react react-dom
```

Example usage:

```tsx
import { Button } from "@duskmoon-dev/components/button";

function App() {
  return <Button>Click me</Button>;
}
```

## Version Contract

This project adheres to a strict version contract between our React UI components and the core CSS design system:

| `@duskmoon-dev/components` version | `@duskmoon-dev/core` version |
| :--------------------------------- | :--------------------------- |
| `0.x.x` (pre-release)              | `0.x.x` (pre-release)        |
| `1.x.x`                            | `1.x.x`                      |
| `2.x.x`                            | `2.x.x`                      |

*Note: Minor and patch versions are compatible within the same major version. Breaking changes in the core design system will be accompanied by a major version bump in the components library to maintain sync.*

## License

MIT
