/** Run only against completed package artifacts; all install/output writes use a fresh temp directory. */
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
};
const artifact = option("--artifact");
const phoenix = option("--phoenix");
if (!artifact || !phoenix)
  throw new Error(
    "Usage: bun scripts/check-composer-package.ts --artifact /abs/components.tgz|package-directory --phoenix /abs/phoenix_duskmoon-package [--temp /existing/temp-parent] [--keep]",
  );
const repo = resolve(import.meta.dir, "..");
const tempParent = await realpath(option("--temp") ?? tmpdir());
const within = relative(repo, tempParent);
if (!isAbsolute(within) && !within.startsWith(".."))
  throw new Error(
    "Use a temp directory outside the repository to prove dependency isolation",
  );
const work = await mkdtemp(join(tempParent, "composer-consumer-"));
async function run(command: string[], cwd: string) {
  console.log(`RUN ${command.join(" ")} (${cwd})`);
  const child = Bun.spawn(command, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  });
  if ((await child.exited) !== 0)
    throw new Error(`Command failed: ${command.join(" ")}`);
}
try {
  let source = resolve(artifact);
  if (!source.endsWith(".tgz")) {
    const pack = Bun.spawn(
      ["npm", "pack", "--ignore-scripts", "--json", "--pack-destination", work],
      {
        cwd: source,
        stdout: "pipe",
        stderr: "inherit",
      },
    );
    const output = await new Response(pack.stdout).text();
    if ((await pack.exited) !== 0)
      throw new Error("Could not pack artifact directory");
    const packed = JSON.parse(output) as { filename: string }[];
    if (packed.length !== 1) throw new Error("Expected one artifact tarball");
    source = join(work, packed[0].filename);
  }
  const phoenixPackage = resolve(phoenix);
  const phoenixManifest = JSON.parse(
    await readFile(join(phoenixPackage, "package.json"), "utf8"),
  );
  if (
    phoenixManifest.name !== "phoenix_duskmoon" ||
    phoenixManifest.exports?.["./react-chat"] !==
      "./assets/js/react_chat/index.js"
  )
    throw new Error("Unsupported Phoenix public React Chat entry");
  const template = join(repo, "test/fixtures/composer-consumer");
  for (const mode of ["plain", "rich"]) {
    const directory = join(work, mode);
    await cp(template, directory, { recursive: true });
    const packagePath = join(directory, "package.json");
    const manifest = JSON.parse(await readFile(packagePath, "utf8"));
    manifest.dependencies["@duskmoon-dev/components"] = `file:${source}`;
    if (mode === "rich")
      Object.assign(manifest.dependencies, {
        lexical: "0.53.0",
        "@lexical/history": "0.53.0",
        "@lexical/plain-text": "0.53.0",
      });
    await writeFile(packagePath, JSON.stringify(manifest, null, 2) + "\n");
    await run(
      [
        "npm",
        "install",
        "--ignore-scripts",
        "--omit=optional",
        "--no-audit",
        "--no-fund",
      ],
      directory,
    );
    // Copy the real distributed public entry with its ORIGINAL manifest. No hook or factory code is recreated.
    const installedPhoenix = join(directory, "node_modules/phoenix_duskmoon");
    await mkdir(join(installedPhoenix, "assets/js"), { recursive: true });
    await cp(
      join(phoenixPackage, "package.json"),
      join(installedPhoenix, "package.json"),
    );
    await cp(
      join(phoenixPackage, "assets/js/react_chat"),
      join(installedPhoenix, "assets/js/react_chat"),
      { recursive: true },
    );
    await run(
      ["bun", "x", "--no-install", "tsc", "--project", "tsconfig.json"],
      directory,
    );
    await run(["bun", "run", "graph.ts", mode], directory);
    await run(["bun", "run", "ssr.tsx"], directory);
    if (mode === "rich") await run(["bun", "run", "rich-ssr.tsx"], directory);
    await run(
      ["bun", "test", "--preload", "./setup.ts", "./phoenix.test.tsx"],
      directory,
    );
  }
  console.log(
    `PASS packaged Composer consumer (${basename(source)}), Phoenix ${phoenixManifest.version}`,
  );
} finally {
  if (args.includes("--keep")) console.log(`KEPT ${work}`);
  else await rm(work, { recursive: true, force: true });
}
