import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const rootManifestPath = path.join(rootDir, "package.json");
const command = process.argv[2] ?? "check";

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function resolveWorkspacePackagePaths(rootManifest) {
  const workspacePatterns = Array.isArray(rootManifest.workspaces)
    ? rootManifest.workspaces
    : rootManifest.workspaces?.packages;

  if (!Array.isArray(workspacePatterns)) {
    throw new Error("Root package.json must define workspaces.");
  }

  const packagePaths = new Set([rootManifestPath]);

  for (const pattern of workspacePatterns) {
    if (typeof pattern !== "string") {
      throw new Error(`Unsupported workspace pattern: ${String(pattern)}`);
    }

    if (pattern.endsWith("/*")) {
      const workspaceRoot = path.join(rootDir, pattern.slice(0, -2));
      const entries = await readdir(workspaceRoot, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          packagePaths.add(
            path.join(workspaceRoot, entry.name, "package.json"),
          );
        }
      }

      continue;
    }

    packagePaths.add(path.join(rootDir, pattern, "package.json"));
  }

  return [...packagePaths].sort();
}

async function readManifests() {
  const rootManifest = await readJson(rootManifestPath);
  const packagePaths = await resolveWorkspacePackagePaths(rootManifest);

  return Promise.all(
    packagePaths.map(async (filePath) => ({
      filePath,
      manifest: await readJson(filePath),
    })),
  );
}

function packageLabel({ filePath, manifest }) {
  return manifest.name ?? path.relative(rootDir, path.dirname(filePath));
}

function getReleaseVersion(manifests) {
  const publicManifests = manifests.filter(({ manifest }) => !manifest.private);
  const publicVersions = new Set(
    publicManifests.map(({ manifest }) => manifest.version),
  );

  if (publicManifests.length === 0) {
    throw new Error("No public workspace packages found.");
  }

  if (publicVersions.size !== 1) {
    throw new Error(
      `Public package versions must match: ${publicManifests
        .map((pkg) => `${packageLabel(pkg)}@${pkg.manifest.version}`)
        .join(", ")}`,
    );
  }

  return [...publicVersions][0];
}

function getMismatchedPackages(manifests, releaseVersion) {
  return manifests.filter(
    ({ manifest }) => manifest.version !== releaseVersion,
  );
}

async function syncVersions(manifests, releaseVersion) {
  const mismatches = getMismatchedPackages(manifests, releaseVersion);

  await Promise.all(
    mismatches.map(async ({ filePath, manifest }) => {
      manifest.version = releaseVersion;
      await writeJson(filePath, manifest);
    }),
  );

  if (mismatches.length > 0) {
    console.log(
      `Synced ${mismatches.length} package manifest version${
        mismatches.length === 1 ? "" : "s"
      } to ${releaseVersion}.`,
    );
  }
}

function checkVersions(manifests, releaseVersion, { quiet = false } = {}) {
  const mismatches = getMismatchedPackages(manifests, releaseVersion);

  if (mismatches.length === 0) {
    if (!quiet) {
      console.log(`All package manifests use version ${releaseVersion}.`);
    }
    return;
  }

  throw new Error(
    `Package manifest versions must all match ${releaseVersion}: ${mismatches
      .map((pkg) => `${packageLabel(pkg)}@${pkg.manifest.version}`)
      .join(", ")}`,
  );
}

const manifests = await readManifests();
const releaseVersion = getReleaseVersion(manifests);

switch (command) {
  case "check":
    checkVersions(manifests, releaseVersion);
    break;
  case "current":
    checkVersions(manifests, releaseVersion, { quiet: true });
    console.log(releaseVersion);
    break;
  case "sync":
    await syncVersions(manifests, releaseVersion);
    break;
  default:
    throw new Error(`Unknown release version command: ${command}`);
}
