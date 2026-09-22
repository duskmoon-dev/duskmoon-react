---
name: cmd-first-publish
description: Bootstrap the first npm publication of a new public duskmoon-react package with the NPM_TOKEN GitHub workflow, then verify registry availability and prepare trusted publishing.
disable-model-invocation: true
---

# First publish a React package to npm

Use this when a new public package under `packages/` cannot yet use npm trusted publishing because the package name does not exist on npm. The runnable workflow is `.github/workflows/first-publish.yml`. This skill does not replace the normal Changesets release or `publish-packages.yml` workflows.

## Check the package

1. Read `git status --short` and preserve unrelated work. Identify a direct `packages/<name>` child with a public `package.json`, a `@duskmoon-dev/` package name, a version, and `publishConfig.access` set to `public`. Do not select private `packages/docs` or an `examples/` workspace.
2. Run `bun run release:check-versions`, then the relevant tests, typecheck, and build. Check the package's `dist/`, exports, `files`, and `npm pack --dry-run` output. Resolve any `workspace:*` dependency in a publishable package before dispatching; the workflow rejects unresolved workspace references.
3. Query the public registry for the **exact** `name@version`. If it exists, do not first-publish it. Use the normal release path for later versions. Confirm `NPM_TOKEN` is configured as a repository secret with permission to create the package in the `@duskmoon-dev` scope. Never print the token.

## Dispatch and verify

After the package source and workflow are on `main`, dispatch the workflow for the package path:

```sh
gh workflow run first-publish.yml --repo duskmoon-dev/duskmoon-react --ref main -f package=packages/<name>
```

Watch the run to completion. Verify the exact version through the public npm registry, including `latest`, tarball contents and exports, and provenance. A completed workflow or successful `npm publish` command alone is insufficient. Once the name exists, configure npm trusted publishers for this repository's `release.yml` and `publish-packages.yml` workflow filenames so later publications can use OIDC. Do not start a Changesets release, create a tag, or publish another package as part of this bootstrap unless separately requested.

Report the package, version, workflow run, registry evidence, and any remaining trusted-publisher setup. Follow `AGENTS.md` for any dependency issue discovered during validation.
