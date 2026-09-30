---
name: duskmoon-components
description: >
  Use this skill whenever building a React or Next.js UI with
  @duskmoon-dev/components, choosing DuskMoon React imports, wiring package
  styles, using standard components such as Button/Table/Form/Input, using Dm
  workflow components, or explaining how consumers should install and use the
  package. This skill is for package consumption, not for editing the package
  source.
---

# DuskMoon Components Usage

Use `@duskmoon-dev/components` as the React component package for DuskMoon UI.
It targets React 19 and depends on DuskMoon Core CSS through
`@duskmoon-dev/core`.

## Install

```bash
bun add @duskmoon-dev/components @duskmoon-dev/core react react-dom
```

Import the stylesheet once at the app root:

```tsx
import "@duskmoon-dev/components/styles.css";
```

For Next.js App Router, put the style import in `app/layout.tsx` or the root
client entry. Do not import files from `dist/` directly.

## Import Pattern

Prefer subpath imports for feature code:

```tsx
import { Button } from "@duskmoon-dev/components/button";
import { Input } from "@duskmoon-dev/components/input";
import { Table } from "@duskmoon-dev/components/table";
```

Root imports are valid when using several components or infrastructure helpers:

```tsx
import { Button, DmTable, theme, version } from "@duskmoon-dev/components";
```

Other stable package subpaths include:

- `@duskmoon-dev/components/theme`
- `@duskmoon-dev/components/classes`
- `@duskmoon-dev/components/utils`
- `@duskmoon-dev/components/{component-id}`, for example
  `@duskmoon-dev/components/date-picker`

## Common Component Examples

Button:

```tsx
import { Button } from "@duskmoon-dev/components/button";

export function SaveButton() {
  return (
    <Button color="primary" appearance="filled" size="md">
      Save
    </Button>
  );
}
```

Input:

```tsx
import { Input } from "@duskmoon-dev/components/input";

export function SearchField() {
  return (
    <Input.Search
      allowClear
      placeholder="Search records"
      onSearch={(value) => console.log(value)}
    />
  );
}
```

DmTable:

```tsx
import { DmTable } from "@duskmoon-dev/components/dm-table";
import type { DmTableColumnsType } from "@duskmoon-dev/components/dm-table";

type User = { id: string; name: string; status: string };

const columns: DmTableColumnsType<User> = [
  { key: "name", dataIndex: "name", title: "Name", search: { type: "input" } },
  { key: "status", dataIndex: "status", title: "Status" },
];

export function UsersTable({ dataSource }: { dataSource: User[] }) {
  return (
    <DmTable
      name="Users"
      rowKey="id"
      columns={columns}
      dataSource={dataSource}
      pagination={{ current: 1, pageSize: 10, total: dataSource.length }}
    />
  );
}
```

## What To Reach For

- Use standard components for generic UI: `Button`, `Input`, `Form`, `Table`,
  `Modal`, `Select`, `Tabs`, `Typography`, and similar unprefixed exports.
- Use `Dm*` workflow components for DuskMoon application patterns:
  `DmLayout`, `DmMenu`, `DmSearch`, `DmTable`, `DmProTable`, `DmToolbar`,
  `DmQuery`, and related composite components.
- Use infrastructure exports for compatibility helpers: `theme`, `version`,
  `unstableSetRender`, `getDmTheme`, `setDmPrimaryColor`,
  `setDmPrefixCls`, and `usePersistedPageSize`.

## Guidance For Agents

- Keep examples small and directly runnable.
- Include the stylesheet import when showing first-time setup.
- Prefer package exports over private file paths.
- Preserve DuskMoon names exactly: `DmTable`, `DmLayout`,
  `setDmPrimaryColor`, `@duskmoon-dev/components/styles.css`.
- Use React props shown by the package types; do not invent Ant Design-only
  props unless they exist in this package.
- If the user is editing this repo's source rather than consuming the package,
  inspect `packages/components/src/components`, `packages/components/src/index.ts`,
  and `packages/components/package.json` before changing code.
