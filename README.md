# Duskmoon React

[![CI](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/ci.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/ci.yml)
[![Deploy Documentation](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/docs.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/docs.yml)
[![Release](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/release.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/release.yml)
[![Publish Packages](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/publish-packages.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/publish-packages.yml)
[![GitHub Release](https://img.shields.io/github/v/release/duskmoon-dev/duskmoon-react?include_prereleases&sort=semver)](https://github.com/duskmoon-dev/duskmoon-react/releases)
[![npm @duskmoon-dev/components](https://img.shields.io/npm/v/%40duskmoon-dev%2Fcomponents?label=%40duskmoon-dev%2Fcomponents)](https://www.npmjs.com/package/@duskmoon-dev/components)
[![npm @duskmoon-dev/art-components](https://img.shields.io/npm/v/%40duskmoon-dev%2Fart-components?label=%40duskmoon-dev%2Fart-components)](https://www.npmjs.com/package/@duskmoon-dev/art-components)

A modern React component library for DuskMoon, built with TypeScript, Bun, and
React 19.

## Project Structure

This is a monorepo powered by [Bun](https://bun.sh/).

- `packages/components`: React components, class helpers, theme helpers, and
  package exports for `@duskmoon-dev/components`.
- `packages/art-components`: React wrappers for `@duskmoon-dev/css-art`
  illustrations, published as `@duskmoon-dev/art-components`.
- `packages/docs`: Astro documentation site for components, infrastructure
  exports, and art wrappers.
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
bun run test
```

Lint the codebase:

```bash
bun run lint
```

Format the codebase:

```bash
bun run format
```

Run component parity checks:

```bash
bun run parity:components
```

Start the docs site:

```bash
bun run dev
```

## Usage

To use the React components in your project, install
`@duskmoon-dev/components` and its peer dependencies.

```bash
bun add @duskmoon-dev/components @duskmoon-dev/core react react-dom
```

Example usage:

```tsx
import "@duskmoon-dev/components/styles.css";
import { Button } from "@duskmoon-dev/components/button";

function App() {
  return <Button>Click me</Button>;
}
```

To use the CSS art wrappers, install the wrapper package and the external CSS
art package:

```bash
bun add @duskmoon-dev/art-components @duskmoon-dev/css-art react react-dom
```

```tsx
import "@duskmoon-dev/art-components/styles.css";
import { ArtMoon } from "@duskmoon-dev/art-components";

function ArtDemo() {
  return <ArtMoon crescent glow size="lg" />;
}
```

## Package Compatibility

| Package                        | Current version | Key peer dependencies                              |
| :----------------------------- | :-------------- | :------------------------------------------------- |
| `@duskmoon-dev/components`     | `0.3.0`         | `@duskmoon-dev/core >=1.17.0`, `react >=19.0.0`    |
| `@duskmoon-dev/art-components` | `0.3.0`         | `@duskmoon-dev/css-art >=1.17.0`, `react >=19.0.0` |

The React packages are versioned from this monorepo. The CSS design system and
CSS art packages are external peer dependencies and should be kept compatible
with the ranges declared in each package's `package.json`.

## License

MIT
