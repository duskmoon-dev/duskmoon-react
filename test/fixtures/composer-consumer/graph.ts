import { realpath, readFile } from "node:fs/promises";
import { dirname, extname } from "node:path";

const lexical = (name: string) =>
  name === "lexical" || name.startsWith("@lexical/");
const scanner = new Bun.Transpiler({ loader: "js" });
async function graph(entry: string, includeDynamic: boolean) {
  const seen = new Set<string>();
  const runtime = new Set<string>();
  const lazy: string[] = [];
  async function visit(file: string) {
    const path = await realpath(file);
    if (seen.has(path)) return;
    seen.add(path);
    if (![".js", ".mjs", ".cjs"].includes(extname(path))) return;
    const imports = scanner.scanImports(await readFile(path, "utf8"));
    for (const item of imports) {
      if (item.kind === "dynamic-import") {
        lazy.push(`${path} -> ${item.path}`);
        if (!includeDynamic) continue;
      }
      if (item.path.startsWith("node:")) continue;
      if (lexical(item.path))
        runtime.add(await realpath(Bun.resolveSync("lexical", dirname(path))));
      const child = Bun.resolveSync(item.path, dirname(path));
      if (child.startsWith("/")) await visit(child);
    }
  }
  await visit(entry);
  return { seen, runtime, lazy };
}
const root = Bun.resolveSync("@duskmoon-dev/components", import.meta.dir);
const chat = Bun.resolveSync("@duskmoon-dev/components/chat", import.meta.dir);
const mode = process.argv[2] ?? "plain";
for (const [name, entry] of [
  ["root", root],
  ["chat", chat],
]) {
  const result = await graph(entry, true);
  if (result.runtime.size)
    throw new Error(`${name} transitively reaches Lexical`);
  console.log(`PASS ${name} graph (${result.seen.size} modules), no Lexical`);
}
if (mode === "plain") {
  for (const name of ["lexical", "@lexical/history", "@lexical/plain-text"]) {
    let found = false;
    try {
      Bun.resolveSync(name, import.meta.dir);
      found = true;
    } catch {
      // Resolution failure is expected for omitted optional peers.
    }
    if (found) throw new Error(`Optional peer unexpectedly installed: ${name}`);
  }
  console.log("PASS optional peers absent");
} else {
  const entry = Bun.resolveSync(
    "@duskmoon-dev/components/chat/rich",
    import.meta.dir,
  );
  const eager = await graph(entry, false);
  const full = await graph(entry, true);
  if (eager.runtime.size)
    throw new Error("Rich entry eagerly reaches editor runtime");
  if (!full.lazy.length || full.runtime.size !== 1)
    throw new Error(
      `Expected separate lazy editor and one Lexical runtime, got ${full.runtime.size}`,
    );
  console.log(
    `PASS separate rich dynamic chunk; one runtime ${[...full.runtime][0]}`,
  );
  for (const edge of full.lazy) console.log(`LAZY ${edge}`);
}
