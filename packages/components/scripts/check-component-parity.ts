import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type TargetStatus = "implemented" | "planned";

interface ParityTarget {
  id: string;
  kind: string;
  source: string;
  exportName: string | null;
  directory: string | null;
  rootExport: string | null;
  packageSubpath: string | null;
  buildEntrypoint: string | null;
  status: TargetStatus;
}

interface Manifest {
  publicTargets: ParityTarget[];
  internalTargets: ParityTarget[];
}

interface TargetCheck extends ParityTarget {
  componentDir: boolean | null;
  rootExportPresent: boolean | null;
  packageExportPresent: boolean | null;
  buildEntrypointPresent: boolean | null;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const manifestPath = path.join(
  scriptDir,
  "parity",
  "component-api.manifest.json",
);
const componentsDir = path.join(packageRoot, "src/components");
const rootIndexPath = path.join(packageRoot, "src/index.ts");
const packageJsonPath = path.join(packageRoot, "package.json");
const buildPath = path.join(packageRoot, "build.ts");

const manifest = readJson<Manifest>(manifestPath);
const rootIndex = readText(rootIndexPath);
const packageJson = readJson<{ exports?: Record<string, unknown> }>(
  packageJsonPath,
);
const buildSource = readText(buildPath);
const packageExports = new Set(Object.keys(packageJson.exports ?? {}));
const componentDirs = new Set(
  fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);

const publicChecks = manifest.publicTargets.map(checkTarget);
const internalChecks = manifest.internalTargets.map(checkTarget);
const strict = process.argv.includes("--strict");

printGroup("Public targets", publicChecks);
printGroup("Internal targets", internalChecks);

const publicComplete = publicChecks.filter(isTargetComplete).length;
const internalComplete = internalChecks.filter(isTargetComplete).length;

console.log("");
console.log(
  `Overall public target status: ${publicComplete}/${publicChecks.length} complete`,
);
console.log(
  `Overall internal target status: ${internalComplete}/${internalChecks.length} complete`,
);

if (strict) {
  process.exit(publicComplete === publicChecks.length ? 0 : 1);
}

function checkTarget(target: ParityTarget): TargetCheck {
  return {
    ...target,
    componentDir:
      target.directory === null ? null : componentDirs.has(target.directory),
    rootExportPresent:
      target.rootExport === null ? null : hasRootExport(target.rootExport),
    packageExportPresent:
      target.packageSubpath === null
        ? null
        : packageExports.has(target.packageSubpath),
    buildEntrypointPresent:
      target.buildEntrypoint === null
        ? null
        : buildSource.includes(target.buildEntrypoint),
  };
}

function hasRootExport(expected: string) {
  if (expected.startsWith(".")) {
    return (
      rootIndex.includes(`"${expected}"`) || rootIndex.includes(`'${expected}'`)
    );
  }

  return new RegExp(`\\b${escapeRegExp(expected)}\\b`).test(rootIndex);
}

function isTargetComplete(target: TargetCheck) {
  return [
    target.componentDir,
    target.rootExportPresent,
    target.packageExportPresent,
    target.buildEntrypointPresent,
  ].every((value) => value !== false);
}

function printGroup(title: string, targets: TargetCheck[]) {
  const complete = targets.filter(isTargetComplete).length;
  const byKind = groupBy(targets, (target) => target.kind);

  console.log("");
  console.log(`${title}: ${complete}/${targets.length} complete`);

  for (const [kind, kindTargets] of Object.entries(byKind)) {
    const kindComplete = kindTargets.filter(isTargetComplete).length;
    console.log(`  ${kind}: ${kindComplete}/${kindTargets.length} complete`);
  }

  for (const target of targets.filter((item) => !isTargetComplete(item))) {
    console.log(
      `- ${target.id} (${target.source}, ${target.status}): missing ${missingParts(
        target,
      ).join(", ")}`,
    );
  }
}

function missingParts(target: TargetCheck) {
  return [
    target.componentDir === false && "component dir",
    target.rootExportPresent === false && "root export",
    target.packageExportPresent === false && "package export",
    target.buildEntrypointPresent === false && "build entrypoint",
  ].filter((value): value is string => typeof value === "string");
}

function groupBy<T>(
  values: T[],
  getKey: (value: T) => string,
): Record<string, T[]> {
  return values.reduce<Record<string, T[]>>((groups, value) => {
    const key = getKey(value);
    groups[key] ??= [];
    groups[key].push(value);
    return groups;
  }, {});
}

function readText(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readText(filePath)) as T;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
