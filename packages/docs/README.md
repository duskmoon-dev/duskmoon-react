# @duskmoon-dev/docs

Astro documentation site for DuskMoon React.

The docs render pages for `@duskmoon-dev/components` public targets,
infrastructure exports, and `@duskmoon-dev/art-components` wrappers. Component
metadata is derived from the parity manifest, package source files, and
`packages/docs/src/lib/component-docs.ts`.

## Development

```bash
# Start the local docs server on port 4334
bun run dev

# Build static docs
bun run build

# Preview a built docs site
bun run preview
```

From the repo root, use:

```bash
bun run dev
bun run --filter "@duskmoon-dev/docs" build
```

## Source Layout

- `src/pages/components/*.astro`: component, infrastructure, and art wrapper
  pages.
- `src/components/ComponentDocPage.astro`: shared component docs page layout.
- `src/lib/component-docs.ts`: docs metadata assembled from the component
  parity manifest and art wrapper definitions.
- `src/lib/component-page-content.ts`: generated prose and usage guidance per
  component family.
