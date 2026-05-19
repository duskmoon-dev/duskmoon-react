import { build } from "bun";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

async function runBuild() {
  const commonOptions = {
    outdir: "dist",
    target: "browser",
    format: "esm",
    external: ["react", "react-dom"],
    minify: false,
    naming: "[dir]/[name].[ext]",
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  } as const;

  // Server-safe entrypoints
  const serverResult = await build({
    ...commonOptions,
    splitting: true,
    entrypoints: [
      "src/utils/index.ts",
      "src/classes/index.ts",
    ],
  });

  if (!serverResult.success) {
    console.error("Server-safe build failed");
    for (const message of serverResult.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  // Client-only entrypoints
  const clientResult = await build({
    ...commonOptions,
    splitting: false,
    entrypoints: [
      "src/index.ts",
      "src/theme/index.ts",
      "src/components/button/index.ts",
    ],
    banner: "\"use client\";\n",
  });

  if (!clientResult.success) {
    console.error("Client-only build failed");
    for (const message of clientResult.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  console.log("Build successful");
}

runBuild().catch(console.error);
