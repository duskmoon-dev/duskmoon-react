# Update Project Documentation

Refresh the existing project documentation and package-usage skills for this
`duskmoon-react` repo so they match the current source tree. Only update files
that already exist unless the user asks for new docs or skills explicitly.

## Scope

Update existing files in these locations when they are stale:

- `README.md`
- `docs/*.md`
- `packages/*/README.md`
- `skills/duskmoon-components/SKILL.md`
- `skills/duskmoon-art-components/SKILL.md`

Do not edit generated output or dependency folders:

- `dist/`
- `node_modules/`
- `packages/docs/.astro/`
- `packages/docs/dist/`

Do not edit application or package source files just to make the docs true. If
the source and docs disagree, update the docs and report any source issue as a
discrepancy.

## Execution Flow

### 1. Discover Current State

Read the source of truth from the repo, not from built output.

```
# Monorepo
package.json                                      -> workspaces, root scripts, versions
README.md                                         -> top-level package description

# @duskmoon-dev/components
packages/components/package.json                  -> package name, version, scripts, exports, dependencies
packages/components/src/components/*/             -> implemented component directories
packages/components/src/classes/*.ts              -> class recipe helpers
packages/components/src/index.ts                  -> root exports and infrastructure exports
packages/components/src/infrastructure.ts         -> helper APIs and version/theme exports
packages/components/src/theme/                    -> theme runtime exports
packages/components/build.ts                      -> build entrypoints
packages/components/scripts/specs/*.json          -> codegen component specs
packages/components/scripts/parity/component-api.manifest.json
                                                   -> public target manifest
packages/components/scripts/check-component-parity.ts
                                                   -> executable parity checks
packages/components/README.md                     -> package usage docs

# @duskmoon-dev/art-components
packages/art-components/package.json              -> package name, version, scripts, exports, peer deps
packages/art-components/src/index.tsx             -> React art wrapper exports and props
packages/art-components/src/styles.css            -> CSS entrypoint
packages/art-components/README.md                 -> package usage docs

# @duskmoon-dev/docs
packages/docs/package.json                        -> docs scripts and local workspace deps
packages/docs/src/pages/components/*.astro        -> documented component, infrastructure, and art pages
packages/docs/src/lib/*.ts                        -> docs page metadata/source logic
packages/docs/README.md                           -> docs package usage

# Project docs and agent docs
docs/*.md                                         -> inventory and parity docs
skills/duskmoon-components/SKILL.md              -> package usage skill for @duskmoon-dev/components
skills/duskmoon-art-components/SKILL.md          -> package usage skill for @duskmoon-dev/art-components
```

Collect:

- Root workspace packages and available root commands.
- Each package name, version, scripts, exports, peer dependencies, and runtime
  dependencies.
- Public component targets from
  `packages/components/scripts/parity/component-api.manifest.json`.
- Implemented component directories from `packages/components/src/components/`.
- Class helper files from `packages/components/src/classes/`.
- Root exports from `packages/components/src/index.ts`.
- Package subpath exports from `packages/components/package.json`.
- Build entrypoints from `packages/components/build.ts`.
- Component spec files from `packages/components/scripts/specs/`.
- Docs pages from `packages/docs/src/pages/components/*.astro`.
- Art wrapper exports, prop names, and size/variant options from
  `packages/art-components/src/index.tsx`.
- CSS-art peer package/version from `packages/art-components/package.json`.
- Package usage guidance from `skills/duskmoon-components/SKILL.md` and
  `skills/duskmoon-art-components/SKILL.md`.

Derive counts at runtime. Do not hardcode component, docs page, export, or art
wrapper counts in this command.

### 2. Update Top-Level and Package READMEs

Update only stale statements. Preserve the existing tone and compact structure.

| File                                | What to update                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                         | Monorepo package list, getting-started commands, package names, peer dependency guidance, usage imports, version contract if package relationships changed |
| `packages/components/README.md`     | Installation, style import, component import examples, scripts, React/Next compatibility, exported subpath pattern                                         |
| `packages/art-components/README.md` | Installation, required CSS import, peer dependency on `@duskmoon-dev/css-art`, exported art wrappers, variant/size props                                   |
| `packages/docs/README.md`           | Astro docs commands, dev/build/preview instructions, workspace dependencies, docs status                                                                   |

Do not describe non-existent local packages such as `packages/core` or
`packages/css-art`. It is valid to mention `@duskmoon-dev/core` or
`@duskmoon-dev/css-art` only when they are external dependencies shown in a
`package.json`.

### 3. Update Project Docs in `docs/`

Read the existing document first, then update in place.

| File                                 | What to update                                                                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/component-api-inventory.md`    | Public API inventory, target component lists, infrastructure exports, implementation policy, source references                          |
| `docs/component-parity-todo.md`      | Snapshot date, evidence snapshot, implemented/missing component directories, parity status, completed workstream items, unresolved gaps |
| `docs/component-parity-todo-list.md` | Target status table generated from the parity manifest and current parity check output                                                  |

Rules:

- Treat `packages/components/scripts/parity/component-api.manifest.json` as the
  source of record for target IDs, kinds, export names, and planned status.
- Treat `packages/components/src/components/` as the source of record for
  implemented component directories.
- Treat `packages/components/package.json`, `packages/components/src/index.ts`,
  and `packages/components/build.ts` as the source of record for public package
  availability.
- Treat `packages/docs/src/pages/components/*.astro` as the source of record for
  docs-page coverage.
- If `docs/component-parity-todo-list.md` says it is generated and a generator
  exists, run the generator. If no generator exists, update the table manually
  from the manifest and parity check output.
- Remove or correct stale absolute paths, stale commits, and stale snapshot
  counts unless the section explicitly records historical evidence.

### 4. Update Package Usage Skills

When updating `skills/*/SKILL.md`, use the `skill-creator` skill if it is
available in the current agent environment. These files teach agents how to
consume the published packages, so keep them concise, executable, and tied to
the actual package APIs.

For `skills/duskmoon-components/SKILL.md`:

- Explain how to install `@duskmoon-dev/components` with its peer dependencies:
  `@duskmoon-dev/core`, `react`, and `react-dom`.
- Include the required stylesheet import:
  `@duskmoon-dev/components/styles.css`.
- Show root imports and component subpath imports such as
  `@duskmoon-dev/components/button`.
- Cover standard components, `Dm*` workflow components, and infrastructure
  helpers at a high level.
- Keep examples aligned with actual component props in
  `packages/components/src/components/*/*.types.ts`.
- Do not describe source-development workflows unless clearly marked as a note
  for users editing this repo.

For `skills/duskmoon-art-components/SKILL.md`:

- Explain how to install `@duskmoon-dev/art-components` with its peer
  dependencies: `@duskmoon-dev/css-art`, `react`, and `react-dom`.
- Include the required stylesheet import:
  `@duskmoon-dev/art-components/styles.css`.
- Preserve guidance that the underlying CSS art source lives in the external
  `@duskmoon-dev/css-art` package.
- List exported art wrapper components from
  `packages/art-components/src/index.tsx`.
- Cover wrapper variants, accessibility defaults, and common examples.
- Do not reference the old Claude skill directory or a local `packages/css-art`
  source package.

### 5. Validation

Run the narrow checks that prove the docs match the repo.

```bash
bun run parity:components
```

Then validate documentation consistency:

- Every public target in
  `packages/components/scripts/parity/component-api.manifest.json` has the
  expected current status in `docs/component-parity-todo-list.md`.
- Every implemented component directory under
  `packages/components/src/components/` is represented in the inventory or
  explicitly explained as internal/non-public.
- Every package subpath listed in docs exists in
  `packages/components/package.json` or
  `packages/art-components/package.json`.
- Every root command listed in docs exists in the root `package.json`.
- Every package command listed in docs exists in that package's `package.json`.
- Every component docs page referenced by docs exists under
  `packages/docs/src/pages/components/`.
- Every art wrapper listed in `packages/art-components/README.md` and
  `skills/duskmoon-art-components/SKILL.md` is exported from
  `packages/art-components/src/index.tsx`.
- Package setup commands and import paths listed in
  `skills/duskmoon-components/SKILL.md` and
  `skills/duskmoon-art-components/SKILL.md` match the package `exports` and
  peer dependencies.
- Docs do not claim that local `packages/core` or local `packages/css-art`
  directories exist.
- Package-usage skills live under `skills/`, not under the Claude command
  directory.

If docs-site content changed under `packages/docs`, also run:

```bash
bun run --filter "@duskmoon-dev/docs" build
```

If only Markdown docs changed, run formatting only when the repo already formats
Markdown as part of its normal workflow:

```bash
bun run format:check
```

If a broad formatting check fails because of unrelated pre-existing files,
report the failing files and stop. Do not fix unrelated formatting.

### 6. Summary

Report exactly what changed and what was validated.

```
Updated README.md:
  - Corrected package list and root commands

Updated packages/components/README.md:
  - Synced import examples with package exports

Updated docs/component-parity-todo.md:
  - Component status: 105/105 public targets complete
  - Removed stale missing component references

Updated skills/duskmoon-components/SKILL.md:
  - Synced install, style import, and usage examples

Updated skills/duskmoon-art-components/SKILL.md:
  - Synced art wrapper exports and accessibility guidance

Validation:
  - bun run parity:components passed
  - Package exports and docs references checked
```

If any discrepancy remains, list it with the exact file or source path and say
whether it is a docs issue, a source issue, or an upstream dependency issue.
