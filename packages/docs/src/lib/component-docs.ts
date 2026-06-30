import fs from "node:fs";
import path from "node:path";
import { docsPath } from "./paths";

type Target = {
  id: string;
  kind: string;
  source: string;
  exportName: string | null;
  directory: string | null;
  packageSubpath: string | null;
  status: string;
  packageName?: "components" | "art-components";
  manualScenarios?: string[];
};

type Manifest = {
  publicTargets: Target[];
  internalTargets: Target[];
};

export type ApiProp = {
  name: string;
  type: string;
  required: boolean;
  description: string;
};

export type ApiSection = {
  name: string;
  kind: "interface" | "type";
  extendsText?: string;
  props: ApiProp[];
  definition?: string;
};

export type ComponentDoc = Target & {
  title: string;
  route: string;
  category: string;
  intro: string;
  importPath: string;
  typeFile: string | null;
  testFile: string | null;
  scenarios: string[];
  keyProps: string[];
  api: ApiSection[];
  demos: DemoSpec[];
};

export type DemoSpec = {
  title: string;
  description: string;
  code: string;
};

function findRepoRoot() {
  const candidates = [
    path.resolve(import.meta.dirname, "../../../.."),
    path.resolve(import.meta.dirname, "../../../../.."),
    path.resolve(process.cwd(), "../.."),
    process.cwd(),
  ];

  return (
    candidates.find((candidate) =>
      fs.existsSync(
        path.join(
          candidate,
          "packages/components/scripts/parity/component-api.manifest.json",
        ),
      ),
    ) ?? path.resolve(import.meta.dirname, "../../../..")
  );
}

const repoRoot = findRepoRoot();
const manifestPath = path.join(
  repoRoot,
  "packages/components/scripts/parity/component-api.manifest.json",
);
const componentsRoot = path.join(
  repoRoot,
  "packages/components/src/components",
);
const artComponentsRoot = path.join(repoRoot, "packages/art-components/src");
const artComponentsTest = path.join(
  repoRoot,
  "packages/art-components/tests/art-components.test.tsx",
);

function artTarget(
  id: string,
  exportName: string,
  manualScenarios: string[],
): Target {
  return {
    id,
    kind: "art-component",
    source: "art-components",
    exportName,
    directory: null,
    packageSubpath: null,
    status: "implemented",
    packageName: "art-components",
    manualScenarios,
  };
}

const artComponentTargets: Target[] = [
  artTarget("art-moon", "ArtMoon", ["Renders crescent and glow variants"]),
  artTarget("art-sun", "ArtSun", ["Renders rays, sunset, and pulse variants"]),
  artTarget("art-atom", "ArtAtom", ["Renders electron orbit structure"]),
  artTarget("art-eclipse", "ArtEclipse", ["Renders layered eclipse structure"]),
  artTarget("art-mountain", "ArtMountain", [
    "Renders mountain, tree, and borealis layers",
  ]),
  artTarget("art-snowflake", "ArtSnowflake", [
    "Supports unicode and falling snowflake variants",
  ]),
  artTarget("art-plasma-ball", "ArtPlasmaBall", [
    "Renders interactive plasma rays and switch state",
  ]),
  artTarget("art-circular-gallery", "ArtCircularGallery", [
    "Renders targetable gallery cards",
  ]),
  artTarget("art-cat-stargazer", "ArtCatStargazer", [
    "Renders the stargazing scene structure",
  ]),
  artTarget("art-flower-animation", "ArtFlowerAnimation", [
    "Renders flowers, grass, and animated bubbles",
  ]),
  artTarget("art-color-spin", "ArtColorSpin", [
    "Renders generated color spin segments",
  ]),
  artTarget("art-synthwave-starfield", "ArtSynthwaveStarfield", [
    "Supports pausing the starfield animation",
  ]),
  artTarget("art-csswitch", "ArtCsswitch", [
    "Renders the console body and joycon controls",
  ]),
  artTarget("art-snowball-preloader", "ArtSnowballPreloader", [
    "Renders snowball preloader rings and track",
  ]),
  artTarget("art-gemini-input", "ArtGeminiInput", [
    "Renders textarea controls and action buttons",
  ]),
];

function readManifest(): Manifest {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
}

function titleCase(id: string) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function componentName(target: Target) {
  if (target.exportName) return target.exportName;
  return target.id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function categoryFor(kind: string) {
  if (kind === "art-component") return "CSS Art";
  if (kind === "dm-workflow-component") return "DuskMoon workflow";
  if (kind === "infrastructure-export") return "Infrastructure";
  if (kind === "internal-component") return "Internal";
  return "Standard";
}

function sentenceCase(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function humanList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function scenarioPhrase(scenarios: string[]) {
  return scenarios
    .slice(0, 3)
    .map((scenario) =>
      scenario
        .replace(
          /^(renders|supports|applies|exposes|uses|calls|adds|maps|binds|validates)\s+/i,
          "",
        )
        .replace(/\.$/, ""),
    )
    .map(sentenceCase);
}

function introFor(
  target: Target,
  name: string,
  scenarios: string[],
  keyProps: string[],
) {
  const features = scenarioPhrase(scenarios);
  const featureText = features.length
    ? ` It is documented here around ${humanList(features).toLowerCase()}.`
    : "";
  const propText = keyProps.length
    ? ` The main API surface centers on ${humanList(keyProps.map((prop) => `\`${prop}\``))}.`
    : "";

  if (target.kind === "dm-workflow-component") {
    return `${name} is a DuskMoon-prefixed workflow component exported by this React package.${featureText}${propText}`;
  }

  if (target.kind === "art-component") {
    return `${name} wraps a @duskmoon-dev/css-art illustration as a typed React component. Import the art component styles once in the application entry before rendering it.${featureText}${propText}`;
  }

  if (target.kind === "internal-component") {
    return `${name} is an internal implementation target used by higher-level DuskMoon workflow components. This standalone page records the maintainer-facing API and scenarios that keep the internal surface explicit.${featureText}${propText}`;
  }

  if (target.kind === "infrastructure-export") {
    return `${name} is a compatibility export for theme, render, or helper behavior expected by component consumers.${featureText}${propText}`;
  }

  return `${name} is a standard DuskMoon React component exported as part of the component library.${featureText}${propText}`;
}

function findTypeFile(target: Target, name: string) {
  if (target.packageName === "art-components") {
    return path.join(artComponentsRoot, "index.tsx");
  }

  if (!target.directory) return null;

  const componentDir = path.join(componentsRoot, target.directory);
  if (!fs.existsSync(componentDir)) return null;

  const direct = path.join(componentDir, `${name}.types.ts`);
  if (fs.existsSync(direct)) return direct;

  return (
    fs
      .readdirSync(componentDir)
      .find((file) => file.endsWith(".types.ts"))
      ?.replace(/^/, `${componentDir}/`) ?? null
  );
}

function findTestFile(target: Target, name: string) {
  if (target.packageName === "art-components") {
    return artComponentsTest;
  }

  if (!target.directory) return null;

  const componentDir = path.join(componentsRoot, target.directory);
  if (!fs.existsSync(componentDir)) return null;

  const direct = path.join(componentDir, `${name}.test.tsx`);
  if (fs.existsSync(direct)) return direct;

  return (
    fs
      .readdirSync(componentDir)
      .find((file) => file.endsWith(".test.tsx") || file.endsWith(".test.ts"))
      ?.replace(/^/, `${componentDir}/`) ?? null
  );
}

function compactType(typeText: string) {
  return typeText.replace(/\s+/g, " ").replace(/;$/, "").trim();
}

function splitInterfaceBody(source: string, interfaceName: string) {
  const match = new RegExp(
    `export\\s+interface\\s+${interfaceName}\\b([^\\{]*)\\{`,
    "m",
  ).exec(source);
  if (!match || match.index === undefined) return null;

  const start = match.index + match[0].length;
  let depth = 1;
  let index = start;

  while (index < source.length && depth > 0) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    index += 1;
  }

  return {
    extendsText: match[1].replace(/^\s*extends\s*/, "").trim(),
    body: source.slice(start, index - 1),
  };
}

function parseProps(body: string): ApiProp[] {
  const props: ApiProp[] = [];
  const lines = body.split("\n");
  let pendingComment = "";

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index].trim();
    if (!rawLine) continue;

    if (rawLine.startsWith("/**")) {
      const commentLines = [rawLine];
      while (!lines[index].includes("*/") && index < lines.length - 1) {
        index += 1;
        commentLines.push(lines[index].trim());
      }
      pendingComment = commentLines
        .join(" ")
        .replace(/\/\*\*|\*\/|\*/g, "")
        .trim();
      continue;
    }

    if (rawLine.startsWith("//")) {
      pendingComment = rawLine.replace(/^\/\/\s?/, "");
      continue;
    }

    const propMatch = /^([A-Za-z_$][\w$-]*)\??:\s*(.+?);?$/.exec(rawLine);
    if (!propMatch) continue;

    props.push({
      name: propMatch[1],
      required: !rawLine.startsWith(`${propMatch[1]}?`),
      type: compactType(propMatch[2]),
      description: pendingComment,
    });
    pendingComment = "";
  }

  return props;
}

function parseApi(typeFile: string | null, name: string): ApiSection[] {
  if (!typeFile || !fs.existsSync(typeFile)) return [];

  const source = fs.readFileSync(typeFile, "utf8");
  const preferredNames = [
    `${name}Props`,
    `${name}Ref`,
    `${name}Item`,
    `${name}ColumnType`,
    `${name}ColumnsType`,
  ];
  const sections: ApiSection[] = [];
  const interfaceNames = Array.from(
    source.matchAll(/export\s+interface\s+([A-Za-z_$][\w$]*)/g),
    (match) => match[1],
  );
  const typeNames = Array.from(
    source.matchAll(/export\s+type\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g),
    (match) => ({ name: match[1], definition: compactType(match[2]) }),
  );
  const isArtTypeFile = typeFile.startsWith(artComponentsRoot);
  const orderedInterfaceNames = isArtTypeFile
    ? preferredNames.filter((item) => interfaceNames.includes(item))
    : [
        ...preferredNames.filter((item) => interfaceNames.includes(item)),
        ...interfaceNames.filter((item) => !preferredNames.includes(item)),
      ];
  const orderedTypeNames = isArtTypeFile
    ? preferredNames.flatMap((item) =>
        typeNames.filter((typeInfo) => typeInfo.name === item),
      )
    : typeNames.slice(0, 8);

  for (const interfaceName of orderedInterfaceNames.slice(0, 8)) {
    const parsed = splitInterfaceBody(source, interfaceName);
    if (!parsed) continue;

    sections.push({
      name: interfaceName,
      kind: "interface",
      extendsText: parsed.extendsText,
      props: parseProps(parsed.body),
    });
  }

  for (const typeInfo of orderedTypeNames) {
    if (sections.some((section) => section.name === typeInfo.name)) continue;
    sections.push({
      name: typeInfo.name,
      kind: "type",
      definition: typeInfo.definition,
      props: [],
    });
  }

  return sections;
}

function keyPropsFromApi(api: ApiSection[]) {
  return Array.from(
    new Set(
      api
        .flatMap((section) => section.props)
        .filter((prop) => prop.name !== "children" && prop.name !== "className")
        .map((prop) => prop.name),
    ),
  ).slice(0, 6);
}

function scenariosFromTest(testFile: string | null) {
  if (!testFile || !fs.existsSync(testFile)) return [];

  const source = fs.readFileSync(testFile, "utf8");
  return Array.from(
    source.matchAll(/\b(?:test|it)\(\s*["'`]([^"'`]+)["'`]/g),
    (match) => sentenceCase(match[1]),
  );
}

function propsObjectFromApi(api: ApiSection[], target: Target) {
  const propNames = keyPropsFromApi(api);
  const props: string[] = [];

  if (propNames.includes("items")) {
    props.push('items={[{ key: "main", label: "Main", title: "Main" }]}');
  }
  if (propNames.includes("columns")) {
    props.push('columns={[{ title: "Name", dataIndex: "name", key: "name" }]}');
  }
  if (propNames.includes("dataSource")) {
    props.push('dataSource={[{ key: 1, name: "DuskMoon" }]}');
  }
  if (propNames.includes("rowData")) {
    props.push('rowData={[{ name: "DuskMoon" }]}');
  }
  if (propNames.includes("treeData")) {
    props.push('treeData={[{ key: "root", title: "Root" }]}');
  }
  if (propNames.includes("options")) {
    props.push('options={[{ label: "Enabled", value: "enabled" }]}');
  }
  if (propNames.includes("value")) {
    props.push('value="enabled"');
  }
  if (propNames.includes("defaultValue")) {
    props.push('defaultValue="enabled"');
  }
  if (propNames.includes("total")) {
    props.push("total={120}");
  }
  if (propNames.includes("current")) {
    props.push("current={1}");
  }
  if (propNames.includes("pageSize")) {
    props.push("pageSize={10}");
  }
  if (propNames.includes("title")) {
    props.push('title="DuskMoon"');
  }
  if (propNames.includes("name")) {
    props.push('name="DuskMoon"');
  }
  if (propNames.includes("open")) {
    props.push("open");
  }
  if (propNames.includes("status")) {
    props.push('status="success"');
  }
  if (propNames.includes("color")) {
    props.push('color="primary"');
  }
  if (
    propNames.includes("appearance") &&
    !["alert", "button", "card"].includes(target.id)
  ) {
    props.push('appearance="tonal"');
  }
  if (propNames.includes("onChange")) {
    props.push("onChange={(value) => console.log(value)}");
  }
  if (propNames.includes("onSearch")) {
    props.push("onSearch={(values) => console.log(values)}");
  }

  if (target.id === "dm-query") {
    props.push(`queryItem={[{
    key: "name",
    type: "input",
    label: "Name",
    name: "name"
  }]}`);
  }
  if (target.id === "dm-search") {
    props.push(`items={[{
    key: "name",
    title: "Name",
    dataIndex: "name",
    search: { type: "input" }
  }]}`);
  }
  if (target.id === "button") {
    props.push('color="primary"', 'appearance="filled"');
  }
  if (target.id === "alert") {
    props.push('color="success"', 'appearance="tonal"');
  }
  if (target.id === "card") {
    props.push('appearance="elevated"');
  }
  if (target.id === "upload") {
    props.push('action="/api/upload"');
  }
  if (target.id === "form") {
    props.push("onFinish={(values) => console.log(values)}");
  }

  return Array.from(new Set(props)).slice(0, 6);
}

function artDemoCode(target: Target, name: string) {
  switch (target.id) {
    case "art-moon":
      return `<${name} size="lg" crescent glow />`;
    case "art-sun":
      return `<${name} size="lg" rays pulse />`;
    case "art-atom":
      return `<${name} size="sm" />`;
    case "art-eclipse":
      return `<${name} size="sm" />`;
    case "art-mountain":
      return `<${name} size="sm" />`;
    case "art-snowflake":
      return `<${name}
  unicode
  fall
  style={{
    "--art-snowflake-size": "32px",
    "--art-snowflake-color": "#76d7ff"
  }}
/>`;
    case "art-plasma-ball":
      return `<${name} size="sm" defaultChecked />`;
    case "art-circular-gallery":
      return `<${name}
  title="Moons"
  size="sm"
  items={[
    { title: "Crater", src: "https://picsum.photos/seed/dm-art-1/160/220" },
    { title: "Orbit", src: "https://picsum.photos/seed/dm-art-2/160/220" },
    { title: "Lunar", src: "https://picsum.photos/seed/dm-art-3/160/220" },
    { title: "Night", src: "https://picsum.photos/seed/dm-art-4/160/220" }
  ]}
/>`;
    case "art-cat-stargazer":
      return `<${name} size="sm" />`;
    case "art-flower-animation":
      return `<${name} size="sm" />`;
    case "art-color-spin":
      return `<${name} size="sm" />`;
    case "art-synthwave-starfield":
      return `<${name} size="sm" />`;
    case "art-csswitch":
      return `<${name} size="sm" />`;
    case "art-snowball-preloader":
      return `<${name} size="sm" />`;
    case "art-gemini-input":
      return `<${name}
  size="lg"
  placeholder="Ask DuskMoon"
  defaultValue="Pure CSS art"
  rows={2}
/>`;
    default:
      return `<${name} />`;
  }
}

function demoCode(
  target: Target,
  name: string,
  api: ApiSection[],
  scenario?: string,
) {
  if (target.kind === "art-component") {
    return artDemoCode(target, name);
  }

  const props = propsObjectFromApi(api, target);
  const scenarioComment = scenario ? `  // ${scenario}\n` : "";
  const noChildrenComponents = [
    "input",
    "input-number",
    "select",
    "date-picker",
    "color-picker",
    "cascader",
    "switch",
    "slider",
    "rate",
    "auto-complete",
    "tree-select",
    "segmented",
    "table",
    "dm-table",
    "dm-pro-table",
    "dm-pro-table-inner",
    "dm-query",
    "dm-search",
    "pagination",
    "dm-pagination",
  ];
  const childText = noChildrenComponents.includes(target.id)
    ? ""
    : `\n  DuskMoon ${titleCase(target.id)}\n`;

  if (target.id === "button") {
    return `<${name} color="primary">Save changes</${name}>`;
  }

  if (target.id === "alert") {
    return `<div style={{ display: "grid", gap: 12 }}>
  {(["filled", "outline", "tonal"] as const).map((appearance) => (
    <div key={appearance} style={{ display: "grid", gap: 8 }}>
      {(["info", "success", "warning", "error"] as const).map((color) => (
        <${name} key={color} color={color} appearance={appearance}>
          {color} alert
        </${name}>
      ))}
    </div>
  ))}
</div>`;
  }

  if (target.id === "auto-complete") {
    return `<${name}
  color="primary"
  allowClear
  defaultOpen
  defaultValue="re"
  options={[
    { value: "react", label: "React" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" }
  ]}
/>`;
  }

  if (target.id === "dm-table" || target.id === "table") {
    return `<${name}
  columns={[
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Owner", dataIndex: "owner", key: "owner" }
  ]}
  dataSource={[
    { key: 1, name: "Design tokens", status: "Ready", owner: "Luna" },
    { key: 2, name: "Components", status: "Review", owner: "Kai" }
  ]}
  pagination={false}
  bordered
/>`;
  }

  if (target.id === "dm-pro-table" || target.id === "dm-pro-table-inner") {
    return `<${name}
  columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
  rowData={[{ key: 1, name: "DuskMoon" }]}
/>`;
  }

  if (target.id === "dm-search") {
    return `<${name}
  items={[{
    key: "name",
    title: "Name",
    dataIndex: "name",
    search: { type: "input" }
  }]}
  onSearch={(values) => console.log(values)}
/>`;
  }

  if (target.id === "dm-query") {
    return `<${name}
  queryItem={[{
    key: "name",
    type: "input",
    label: "Name",
    name: "name"
  }]}
  onSearch={(values) => console.log(values)}
/>`;
  }

  if (target.id === "tree") {
    return `<${name}
  checkable
  showLine
  showIcon
  defaultExpandAll
  defaultSelectedKeys={["tokens"]}
  defaultCheckedKeys={["components"]}
  treeData={[
    {
      key: "workspace",
      title: "Workspace",
      icon: "W",
      children: [
        { key: "tokens", title: "Design tokens", icon: "T" },
        { key: "components", title: "Components", icon: "C" },
        {
          key: "release",
          title: "Release",
          icon: "R",
          children: [
            { key: "notes", title: "Notes" },
            { key: "qa", title: "Visual QA" }
          ]
        }
      ]
    }
  ]}
/>`;
  }

  if (target.id === "dm-tree" || target.id === "tree") {
    return `<${name}
  treeData={[
    {
      key: "root",
      title: "Root Node",
      children: [
        { key: "child-1", title: "Child Node 1" },
        { key: "child-2", title: "Child Node 2" }
      ]
    }
  ]}
/>`;
  }

  if (target.id.includes("pagination")) {
    return `<${name} total={120} current={1} pageSize={10} />`;
  }

  if (target.id === "anchor") {
    return `<${name}
  affix={false}
  showInkInFixed
  items={[
    {
      href: "#intro",
      title: "Intro",
      children: [{ href: "#demos", title: "Demos" }]
    }
  ]}
/>`;
  }

  if (target.id === "avatar") {
    return `<${name} className="avatar-primary">DM</${name}>`;
  }

  if (target.id === "back-top") {
    return `<${name} visibilityHeight={0}>Back to top</${name}>`;
  }

  if (target.id === "breadcrumb") {
    return `<${name}
  items={[
    { title: "Home", href: "/" },
    { title: "Components", href: "/components" },
    { title: "Breadcrumb" }
  ]}
/>`;
  }

  if (target.id === "carousel") {
    return `<${name} arrows>
  <div>Research</div>
  <div>Design</div>
  <div>Ship</div>
</${name}>`;
  }

  if (target.id === "cascader") {
    return `<${name}
  options={[
    {
      label: "Design",
      value: "design",
      children: [{ label: "Components", value: "components" }]
    },
    {
      label: "Engineering",
      value: "engineering",
      children: [{ label: "Release", value: "release" }]
    }
  ]}
  placeholder="Select workflow"
/>`;
  }

  if (target.id === "col") {
    return `<${name}
  span={12}
  style={{
    width: "50%",
    padding: "12px",
    background: "var(--color-primary-container)",
    color: "var(--color-primary)",
    borderRadius: "6px",
    fontWeight: 700
  }}
>
  span 12
</${name}>`;
  }

  if (target.id === "collapse") {
    return `<${name}
  defaultActiveKey="intro"
  items={[
    {
      key: "intro",
      label: "What is DuskMoon?",
      children: "DuskMoon React components provide typed, themeable UI primitives."
    }
  ]}
/>`;
  }

  if (target.id === "descriptions") {
    return `<${name}
  title="Release summary"
  bordered
  column={2}
  items={[
    { key: "status", label: "Status", children: "Ready" },
    { key: "owner", label: "Owner", children: "DuskMoon" },
    { key: "version", label: "Version", children: "0.1.2" },
    { key: "channel", label: "Channel", children: "Stable" }
  ]}
/>`;
  }

  if (target.id === "dropdown") {
    return `<${name}
  defaultOpen
  trigger={["click"]}
  menu={{
    items: [
      { key: "edit", label: "Edit" },
      { key: "divider", type: "divider" },
      { key: "delete", label: "Delete", danger: true }
    ]
  }}
>
  Actions
</${name}>`;
  }

  if (target.id === "flex") {
    return `<${name} gap="middle" wrap align="center">
  <span>Alpha</span>
  <span>Beta</span>
  <span>Gamma</span>
</${name}>`;
  }

  if (target.id === "row") {
    return `<${name} gutter={[12, 12]} align="middle" justify="space-between">
  <div style={{ flex: "0 0 29.167%" }}>span 7</div>
  <div style={{ flex: "0 0 29.167%" }}>span 7</div>
  <div style={{ flex: "0 0 29.167%" }}>span 7</div>
</${name}>`;
  }

  if (target.id === "float-button") {
    return `<${name} type="primary" icon="+" tooltip="Create" />`;
  }

  if (target.id === "form") {
    return `<${name}
  layout="vertical"
  initialValues={{ project: "DuskMoon" }}
  onFinish={(values) => console.log(values)}
>
  <${name}.Item
    name="project"
    label="Project"
    rules={[{ required: true, message: "Project is required" }]}
    extra="The name shown in dashboards."
  >
    <input placeholder="Project name" />
  </${name}.Item>
  <${name}.Item>
    <button type="submit">Save</button>
  </${name}.Item>
</${name}>`;
  }

  if (target.id === "date-picker") {
    return `<${name}
  defaultValue="2026-05-25"
  size="lg"
  status="success"
  onChange={(value) => console.log(value)}
/>`;
  }

  if (target.id === "color-picker") {
    return `<${name}
  defaultValue="#1677ff"
  size="large"
  format="hex"
  showText
  onChange={(value, css) => console.log(value, css)}
/>`;
  }

  if (target.id === "popover") {
    return `<${name}
  title="DuskMoon"
  content="Popover content"
  placement="bottom"
  open
>
  Hover target
</${name}>`;
  }

  if (target.id === "image") {
    return `<${name}
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100'%3E%3Crect width='160' height='100' rx='12' fill='%23e58f00'/%3E%3Ccircle cx='118' cy='34' r='20' fill='%23fff7d6'/%3E%3Cpath d='M24 72h112' stroke='%23fff7d6' stroke-width='8' stroke-linecap='round'/%3E%3C/svg%3E"
  alt="DuskMoon preview"
  width={160}
  height={100}
  placeholder="Loading image"
/>`;
  }

  if (target.id === "input-number") {
    return `<${name}
  defaultValue={24}
  min={0}
  max={100}
  step={1}
  status="success"
/>`;
  }

  if (target.id === "layout") {
    return `<${name} style={{ width: "100%", maxWidth: 640 }}>
  <${name}.Header>Header</${name}.Header>
  <${name} hasSider>
    <${name}.Sider width={160}>Sider</${name}.Sider>
    <${name}.Content>Content</${name}.Content>
  </${name}>
  <${name}.Footer>Footer</${name}.Footer>
</${name}>`;
  }

  if (target.id === "list") {
    return `<${name} bordered>
  {[
    { title: "Design tokens", description: "Updated color and spacing scale" },
    { title: "Components", description: "Reviewed visual states" },
    { title: "Release", description: "Ready for package validation" }
  ].map((item) => (
    <${name}.Item key={item.title} extra="Open">
      <${name}.Item.Meta
        title={item.title}
        description={item.description}
      />
    </${name}.Item>
  ))}
</${name}>`;
  }

  if (target.id === "mentions") {
    return `<${name}
  defaultValue="@design"
  placeholder="Mention a teammate"
  options={[
    { value: "design", label: "Design team" },
    { value: "engineering", label: "Engineering" },
    { value: "release", label: "Release desk" }
  ]}
/>`;
  }

  if (target.id === "menu") {
    return `<${name}
  defaultSelectedKeys={["overview"]}
  defaultOpenKeys={["workspace"]}
  items={[
    { key: "overview", label: "Overview", extra: "⌘1" },
    {
      key: "workspace",
      label: "Workspace",
      children: [
        { key: "tasks", label: "Tasks" },
        { key: "reports", label: "Reports" }
      ]
    },
    { type: "divider" },
    { key: "settings", label: "Settings" }
  ]}
/>`;
  }

  if (target.id === "modal") {
    return `<${name}
  open
  title="Release checklist"
  width={420}
  onOk={() => console.log("ok")}
  onCancel={() => console.log("cancel")}
>
  Review component styles before publishing the package.
</${name}>`;
  }

  if (target.id === "progress") {
    return `<${name}
  percent={68}
  showInfo
  color="success"
  size="lg"
/>`;
  }

  if (target.id === "qr-code") {
    return `<${name}
  value="https://duskmoon.dev/components"
  size={160}
  color="#111827"
  bgColor="#ffffff"
/>`;
  }

  if (target.id === "rate") {
    return `<${name}
  defaultValue={3.5}
  allowHalf
  color="warning"
  size="lg"
/>`;
  }

  if (target.id === "segmented") {
    return `<${name}
  options={["Overview", "Usage", "API"]}
  defaultValue="Usage"
  size="lg"
/>`;
  }

  if (target.id === "select") {
    return `<${name}
  options={[
    { label: "React", value: "react" },
    { label: "Astro", value: "astro" },
    { label: "TypeScript", value: "typescript" }
  ]}
  defaultValue="react"
  placeholder="Select a stack"
  allowClear
/>`;
  }

  if (target.id === "slider") {
    return `<${name}
  defaultValue={48}
  marks={{ 0: "0", 50: "50", 100: "100" }}
  tooltip={{ open: true }}
  color="secondary"
/>`;
  }

  if (target.id === "space") {
    return `<${name} size="middle" wrap split="|">
  <span>Design</span>
  <span>Build</span>
  <span>Ship</span>
</${name}>`;
  }

  if (target.id === "statistic") {
    return `<${name}
  title="Uptime"
  value={98.6}
  precision={1}
  suffix="%"
/>`;
  }

  if (target.id === "steps") {
    return `<${name}
  current={1}
  items={[
    { title: "Plan", description: "Define scope" },
    { title: "Build", description: "Implement UI" },
    { title: "Ship", description: "Release" }
  ]}
/>`;
  }

  if (target.id === "switch") {
    return `<${name}
  defaultChecked
  checkedChildren="On"
  unCheckedChildren="Off"
/>`;
  }

  if (target.id === "tabs") {
    return `<${name}
  defaultActiveKey="usage"
  items={[
    { key: "overview", label: "Overview", children: "Component status overview." },
    { key: "usage", label: "Usage", children: "Tabs organize related views." },
    { key: "api", label: "API", children: "Document props and events." }
  ]}
/>`;
  }

  if (target.id === "time-picker") {
    return `<${name}
  defaultValue="09:30:00"
  format="HH:mm:ss"
  allowClear
/>`;
  }

  if (target.id === "tooltip") {
    return `<${name}
  title="Review details"
  placement="bottom"
  size="lg"
  open
>
  Hover for details
</${name}>`;
  }

  if (target.id === "timeline") {
    return `<${name}
  items={[
    { label: "09:00", children: "Kickoff and scope review", color: "primary" },
    { label: "11:30", children: "Design QA completed", color: "success" },
    { label: "14:00", children: "Release notes prepared", color: "secondary" }
  ]}
/>`;
  }

  if (target.id === "skeleton") {
    return `<${name}
  active
  avatar
  paragraph={{ rows: 3 }}
  style={{ width: "420px", maxWidth: "100%" }}
/>`;
  }

  if (target.id === "splitter") {
    return `<${name}
  defaultSizes={[180, "1fr"]}
  style={{ width: "100%" }}
>
  <${name}.Panel>Navigation</${name}.Panel>
  <${name}.Panel>Workspace</${name}.Panel>
</${name}>`;
  }

  if (target.id === "dm-splitter") {
    return `<${name}
  defaultSizes={[180, "1fr"]}
  gap={8}
  style={{ width: "100%" }}
>
  <${name}.Panel>Navigation</${name}.Panel>
  <${name}.Panel>Workspace</${name}.Panel>
</${name}>`;
  }

  if (target.id === "tour") {
    return `<${name}
  open
  mask={false}
  steps={[
    {
      title: "Welcome",
      description: "Review the highlighted workflow.",
      style: {
        position: "static",
        left: "auto",
        top: "auto",
        transform: "none"
      }
    }
  ]}
/>`;
  }

  if (target.id === "transfer") {
    return `<${name}
  dataSource={[
    { key: "tokens", title: "Design tokens", description: "Theme primitives" },
    { key: "docs", title: "Docs site", description: "Examples and API pages" },
    { key: "qa", title: "Visual QA", description: "Review queue" },
    { key: "release", title: "Release notes", description: "Publish checklist" }
  ]}
  defaultTargetKeys={["release"]}
  defaultSelectedKeys={["tokens"]}
  titles={["Available", "Selected"]}
  showSearch
/>`;
  }

  if (noChildrenComponents.includes(target.id)) {
    if (props.length === 0) {
      return `<${name} />`;
    }
    return `<${name}
${scenarioComment}${props.map((prop) => `  ${prop}`).join("\n")}
/>`;
  }

  if (props.length === 0) {
    return `<${name}>${childText.trim() || `${name} demo`}</${name}>`;
  }

  return `<${name}
${scenarioComment}${props.map((prop) => `  ${prop}`).join("\n")}
>${childText}</${name}>`;
}

function importPathForTarget(target: Target) {
  if (target.packageName === "art-components") {
    return "@duskmoon-dev/art-components";
  }

  return target.packageSubpath
    ? `@duskmoon-dev/components/${target.packageSubpath.slice(2)}`
    : "@duskmoon-dev/components";
}

function demosFor(
  target: Target,
  name: string,
  api: ApiSection[],
  scenarios: string[],
): DemoSpec[] {
  const importPath = importPathForTarget(target);

  if (target.id === "breakpoint") {
    return [
      {
        title: "Type usage",
        description: `${name} is a TypeScript-only breakpoint union exported from the root package.`,
        code: `import type { ${name} } from "${importPath}";\n\nconst compact: ${name} = "sm";\nconst desktop: ${name} = "lg";\n\nexport const responsiveBreakpoints: ${name}[] = [compact, desktop];`,
      },
    ];
  }

  const usage = demoCode(target, name, api);
  const importLine =
    target.kind === "internal-component"
      ? `// Internal component: packages/components/src/components/${target.id}`
      : `import { ${name} } from "${importPath}";`;
  const componentStyleImport = `import "@duskmoon-dev/components/styles.css";`;

  if (target.kind === "art-component") {
    return [
      {
        title: "Basic usage",
        description: `Import ${name} and the art component stylesheet before rendering the CSS art scene.`,
        code: `import "@duskmoon-dev/art-components/styles.css";\n${importLine}\n\nexport function Example() {\n  return (${usage});\n}`,
      },
    ];
  }

  if (target.id === "alert") {
    return [
      {
        title: "Colors and appearances",
        description: `${name} supports info, success, warning, and error colors across filled, outline, and tonal appearances.`,
        code: `${componentStyleImport}\n${importLine}\n\nexport function AlertDemo() {\n  return (${usage});\n}`,
      },
    ];
  }

  if (target.id === "auto-complete") {
    return [
      {
        title: "Colors and matching",
        description: `${name} supports primary, secondary, tertiary, info, success, warning, and error colors with filtered options, async matches, and clearable values.`,
        code: `${componentStyleImport}\nimport React from "react";\n${importLine}\n\nconst colors = [\n  "primary",\n  "secondary",\n  "tertiary",\n  "info",\n  "success",\n  "warning",\n  "error"\n] as const;\n\nconst options = [\n  { value: "react", label: "React" },\n  { value: "remix", label: "Remix" },\n  { value: "astro", label: "Astro" },\n  { value: "solid", label: "Solid" }\n];\n\nconst remoteOptions = [\n  { value: "apollo", label: "Apollo" },\n  { value: "atlas", label: "Atlas" },\n  { value: "matrix", label: "Matrix" },\n  { value: "mercury", label: "Mercury" }\n];\n\nfunction matchOptions(query: string) {\n  const normalized = query.trim().toLowerCase();\n  return remoteOptions.filter((option) =>\n    option.label.toLowerCase().includes(normalized)\n  );\n}\n\nfunction AsyncMatchDemo() {\n  const [value, setValue] = React.useState("ma");\n  const [matches, setMatches] = React.useState(() => matchOptions("ma"));\n\n  React.useEffect(() => {\n    const timeout = window.setTimeout(() => {\n      setMatches(matchOptions(value));\n    }, 300);\n\n    return () => window.clearTimeout(timeout);\n  }, [value]);\n\n  return (\n    <${name}\n      open\n      value={value}\n      color="info"\n      options={matches}\n      notFoundContent="No matches"\n      onChange={setValue}\n      onSearch={setValue}\n    />\n  );\n}\n\nexport function AutoCompleteDemo() {\n  return (\n    <div style={{ display: "grid", gap: 16 }}>\n      <div style={{ display: "grid", gap: 10 }}>\n        {colors.map((color) => (\n          <${name}\n            key={color}\n            color={color}\n            placeholder={\`\${color} search\`}\n            options={options}\n          />\n        ))}\n      </div>\n\n      <${name}\n        defaultOpen\n        defaultValue="re"\n        color="primary"\n        options={options}\n      />\n\n      <AsyncMatchDemo />\n\n      <${name}\n        allowClear\n        defaultValue="astro"\n        color="success"\n        options={options}\n      />\n    </div>\n  );\n}`,
      },
    ];
  }

  const scenarioDemos = scenarios.slice(0, 3).map((scenario) => {
    const scenarioUsage = demoCode(target, name, api, scenario);

    return {
      title: scenario,
      description: `${name} scenario from the component test coverage: ${scenario.toLowerCase()}.`,
      code: `${componentStyleImport}\n${importLine}\n\nexport function ${name}${scenario
        .replace(/[^A-Za-z0-9]+/g, " ")
        .trim()
        .split(" ")
        .slice(0, 4)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")}Demo() {\n  return (${scenarioUsage});\n}`,
    };
  });

  return [
    {
      title: "Basic usage",
      description: `Import the component stylesheet and ${name} from its package subpath, then render it with the core props.`,
      code: `${componentStyleImport}\n${importLine}\n\nexport function Example() {\n  return (${usage});\n}`,
    },
    ...scenarioDemos,
    {
      title: "Theme aware",
      description:
        "Docs previews inherit the DuskMoon data-theme value. Use the header switch to compare light and dark rendering.",
      code: `<div data-theme="sunshine">\n  ${usage}\n</div>\n\n<div data-theme="moonlight">\n  ${usage}\n</div>`,
    },
  ];
}

function toDoc(target: Target): ComponentDoc {
  const name = componentName(target);
  const typeFile = findTypeFile(target, name);
  const testFile = findTestFile(target, name);
  const api = parseApi(typeFile, name);
  const scenarios =
    target.manualScenarios?.map(sentenceCase) ?? scenariosFromTest(testFile);
  const keyProps = keyPropsFromApi(api);

  return {
    ...target,
    title: name,
    route: docsPath(`/components/${target.id}`),
    category: categoryFor(target.kind),
    intro: introFor(target, name, scenarios, keyProps),
    importPath: importPathForTarget(target),
    typeFile,
    testFile,
    scenarios,
    keyProps,
    api,
    demos: demosFor(target, name, api, scenarios),
  };
}

export function getComponentDocs() {
  const manifest = readManifest();
  return [
    ...manifest.publicTargets,
    ...manifest.internalTargets,
    ...artComponentTargets,
  ]
    .filter((target) => target.status === "implemented")
    .map(toDoc)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getComponentDoc(id: string) {
  return getComponentDocs().find((component) => component.id === id);
}

export function getDocsByCategory() {
  return Map.groupBy(getComponentDocs(), (component) => component.category);
}
