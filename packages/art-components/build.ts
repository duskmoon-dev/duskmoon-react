import { build } from "bun";

const result = await build({
  entrypoints: ["src/index.tsx"],
  outdir: "dist",
  root: "./src",
  target: "browser",
  format: "esm",
  external: ["react", "react-dom", "@duskmoon-dev/css-art"],
  minify: false,
  naming: "[dir]/[name].[ext]",
  banner: '"use client";\n',
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

if (!result.success) {
  console.error("Art components build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log("Art components build successful");
