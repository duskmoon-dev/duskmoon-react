import { build } from "bun";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

async function runBuild() {
  const result = await build({
    entrypoints: [
      "src/index.ts",
      "src/theme/index.ts",
      "src/utils/index.ts",
      "src/components/button/index.ts",
    ],
    outdir: "dist",
    target: "browser",
    format: "esm",
    external: ["react", "react-dom"],
    splitting: true,
    minify: false,
    naming: "[dir]/[name].[ext]",
    // Ensure production mode
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  });

  if (!result.success) {
    console.error("Build failed");
    for (const message of result.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  console.log("Build successful");
}

runBuild().catch(console.error);
