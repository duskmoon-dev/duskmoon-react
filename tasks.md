# Implementation Tasks

- [x] **Task 1: Alert Component**
  - Create spec in `packages/components/scripts/specs/alert.json`
  - Run codegen: `cd packages/components && bun run scripts/codegen.ts`
  - Write component `packages/components/src/components/alert/Alert.tsx`
  - Export component `packages/components/src/components/alert/index.ts`
  - Write failing test `packages/components/src/components/alert/Alert.test.tsx`
  - Ensure tests pass
  - Commit

- [ ] **Task 2: Avatar Component**
  - Create spec in `packages/components/scripts/specs/avatar.json`
  - Run codegen: `cd packages/components && bun run scripts/codegen.ts`
  - Write component `packages/components/src/components/avatar/Avatar.tsx`
  - Export component `packages/components/src/components/avatar/index.ts`
  - Write failing test `packages/components/src/components/avatar/Avatar.test.tsx`
  - Ensure tests pass
  - Commit

- [ ] **Task 3: Package Exports and Smoke Test Update**
  - Update `exports` in `packages/components/package.json` for alert and avatar
  - Update `packages/components/build.ts` to include the entrypoints
  - Update `packages/components/src/index.ts` to export the components
  - Update `examples/nextjs-15-smoke/app/page.tsx` to include `Alert` and `Avatar`
  - Run full build, test, and typecheck
  - Commit
