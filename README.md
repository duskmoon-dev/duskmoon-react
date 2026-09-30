# DuskMoon React

[![CI](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/ci.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/ci.yml)
[![Deploy Documentation](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/docs.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/docs.yml)
[![Release](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/release.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/release.yml)
[![Publish Packages](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/publish-packages.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-react/actions/workflows/publish-packages.yml)
[![GitHub Release](https://img.shields.io/github/v/release/duskmoon-dev/duskmoon-react?include_prereleases&sort=semver)](https://github.com/duskmoon-dev/duskmoon-react/releases)
[![npm @duskmoon-dev/components](https://img.shields.io/npm/v/%40duskmoon-dev%2Fcomponents?label=%40duskmoon-dev%2Fcomponents)](https://www.npmjs.com/package/@duskmoon-dev/components)
[![npm @duskmoon-dev/art-components](https://img.shields.io/npm/v/%40duskmoon-dev%2Fart-components?label=%40duskmoon-dev%2Fart-components)](https://www.npmjs.com/package/@duskmoon-dev/art-components)

A React 19+ component library for the DuskMoon design system, built with
TypeScript and Bun.

[Documentation](https://duskmoon-dev.github.io/duskmoon-react/) ·
[@duskmoon-dev/components](https://www.npmjs.com/package/@duskmoon-dev/components) ·
[@duskmoon-dev/art-components](https://www.npmjs.com/package/@duskmoon-dev/art-components)

## Packages

This Bun monorepo contains two public packages, an Astro documentation site,
and a framework smoke test.

| Workspace                                              | Description                                                                                                                    |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [`packages/components`](packages/components)           | `@duskmoon-dev/components`: 73 standard components, 21 `Dm*` workflow components, theme helpers, class helpers, and utilities. |
| [`packages/art-components`](packages/art-components)   | `@duskmoon-dev/art-components`: 15 React wrappers for `@duskmoon-dev/css-art` illustrations.                                   |
| [`packages/docs`](packages/docs)                       | Internal Astro site containing API references, demos, and theme previews; not published to npm.                                |
| [`examples/nextjs-15-smoke`](examples/nextjs-15-smoke) | Internal Next.js 16 smoke app; not published to npm. The directory name is retained from its Next.js 15 setup.                 |

## Repository Development

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine. The repository does not pin
  a Bun version; CI uses the current release.

### Local Setup

From the repository root, install dependencies and start the documentation
site:

```bash
bun install
bun run dev
```

The local documentation server listens at <http://localhost:4334>.

### Development Commands

| Command                                                 | Purpose                                                                             |
| :------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| `bun run dev`                                           | Start the Astro documentation site on port 4334.                                    |
| `bun run build`                                         | Build `@duskmoon-dev/components` only.                                              |
| `bun run --filter "@duskmoon-dev/art-components" build` | Build `@duskmoon-dev/art-components` only.                                          |
| `bun run build:all`                                     | Build every workspace, including the docs and Next.js smoke app.                    |
| `bun run test`                                          | Run both public-package unit-test suites; this does not run Playwright smoke tests. |
| `bun x playwright test`                                 | Run the Playwright smoke and accessibility test.                                    |
| `bun run typecheck`                                     | Type-check every workspace that defines a `typecheck` script.                       |
| `bun run lint`                                          | Run ESLint across the repository.                                                   |
| `bun run format:check`                                  | Check formatting without changing files.                                            |
| `bun run format`                                        | Format supported files with Prettier.                                               |
| `bun run parity:components`                             | Verify component APIs against package exports and build entries.                    |

Install the Playwright browser once before running its smoke test:

```bash
bun x playwright install chromium
```

## Usage

### Components

Install the component package and its peer dependencies:

```bash
bun add @duskmoon-dev/components @duskmoon-dev/core react react-dom
```

Import the package stylesheet once in your application, then import a
component from its individual subpath:

```tsx
import "@duskmoon-dev/components/styles.css";
import { Button } from "@duskmoon-dev/components/button";

function App() {
  return <Button>Click me</Button>;
}
```

Root imports are also supported, for example
`import { Button, DmTable, ThemeProvider } from "@duskmoon-dev/components"`.

### CSS Art Wrappers

Install the wrapper package and its peer dependencies:

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

| Package                        | Required peers                                                           |
| :----------------------------- | :----------------------------------------------------------------------- |
| `@duskmoon-dev/components`     | `@duskmoon-dev/core >=1.17.0`, `react >=19.0.0`, `react-dom >=19.0.0`    |
| `@duskmoon-dev/art-components` | `@duskmoon-dev/css-art >=1.17.0`, `react >=19.0.0`, `react-dom >=19.0.0` |

The npm badges above show the current published versions. The React packages are
versioned together from this monorepo. The CSS design system and CSS art
packages are external peer dependencies and should be kept compatible with the
ranges declared in each package's `package.json`.
