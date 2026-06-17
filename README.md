# Duskmoon React

[![CI](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/ci.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/ci.yml)
[![Deploy Documentation](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/docs.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/docs.yml)
[![Release](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/release.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/release.yml)
[![Publish Packages](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/publish-packages.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/publish-packages.yml)
[![GitHub Release](https://img.shields.io/github/v/release/duskmoon-dev/duskmoon-react?include_prereleases&sort=semver)](https://github.com/duskmoon-dev/duskmoon-react/releases)
[![npm @duskmoon-dev/components](https://img.shields.io/npm/v/%40duskmoon-dev%2Fcomponents?label=%40duskmoon-dev%2Fcomponents)](https://www.npmjs.com/package/@duskmoon-dev/components)
[![npm @duskmoon-dev/art-components](https://img.shields.io/npm/v/%40duskmoon-dev%2Fart-components?label=%40duskmoon-dev%2Fart-components)](https://www.npmjs.com/package/@duskmoon-dev/art-components)

A modern, high-quality React component library built with TypeScript and optimized for performance.

## Project Structure

This is a monorepo powered by [Bun](https://bun.sh/).

- `packages/components`: The core component library (`@duskmoon-dev/components`).
- `packages/art-components`: React wrappers for CSS art illustrations (`@duskmoon-dev/art-components`).
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
import "@duskmoon-dev/components/styles.css";
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

_Note: Minor and patch versions are compatible within the same major version. Breaking changes in the core design system will be accompanied by a major version bump in the components library to maintain sync._

## License

MIT
