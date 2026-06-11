import fs from "node:fs";
import path from "node:path";

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
  artTarget("art-sun", "ArtSun", [
    "Renders rays, sunset, and pulse variants",
  ]),
  artTarget("art-atom", "ArtAtom", ["Renders electron orbit structure"]),
  artTarget("art-eclipse", "ArtEclipse", [
    "Renders layered eclipse structure",
  ]),
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
  if (propNames.includes("appearance")) {
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
    return `<${name} color="success" appearance="tonal">Saved successfully</${name}>`;
  }

  if (target.id === "dm-table" || target.id === "table") {
    return `<${name}
  columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
  dataSource={[{ key: 1, name: "DuskMoon" }]}
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
  const usage = demoCode(target, name, api);
  const importLine =
    target.kind === "internal-component"
      ? `// Internal component: packages/components/src/components/${target.id}`
      : `import { ${name} } from "${importPath}";`;

  if (target.kind === "art-component") {
    return [
      {
        title: "Basic usage",
        description: `Import ${name} and the art component stylesheet before rendering the CSS art scene.`,
        code: `import "@duskmoon-dev/art-components/styles.css";\n${importLine}\n\nexport function Example() {\n  return (${usage});\n}`,
      },
    ];
  }

  const scenarioDemos = scenarios.slice(0, 3).map((scenario) => {
    const scenarioUsage = demoCode(target, name, api, scenario);

    return {
      title: scenario,
      description: `${name} scenario from the component test coverage: ${scenario.toLowerCase()}.`,
      code: `${importLine}\n\nexport function ${name}${scenario
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
      description: `Import ${name} from its package subpath and render it with the core props.`,
      code: `${importLine}\n\nexport function Example() {\n  return (${usage});\n}`,
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
  const scenarios = target.manualScenarios?.map(sentenceCase) ?? scenariosFromTest(testFile);
  const keyProps = keyPropsFromApi(api);

  return {
    ...target,
    title: name,
    route: `/components/${target.id}`,
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
  return [...manifest.publicTargets, ...manifest.internalTargets, ...artComponentTargets]
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
