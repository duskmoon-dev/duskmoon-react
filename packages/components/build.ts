import { build } from "bun";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

async function runBuild() {
  const commonOptions = {
    outdir: "dist",
    root: "./src",
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
    entrypoints: ["src/utils/index.ts", "src/classes/index.ts"],
  });

  if (!serverResult.success) {
    console.error("Server-safe build failed");
    for (const message of serverResult.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  // Build main index files (index.ts, theme/index.ts, infrastructure.ts)
  const mainResult = await build({
    ...commonOptions,
    splitting: false,
    entrypoints: [
      "src/index.ts",
      "src/theme/index.ts",
      "src/infrastructure.ts",
    ],
    banner: '"use client";\n',
  });

  if (!mainResult.success) {
    console.error("Main entrypoints build failed");
    for (const message of mainResult.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  // Client-only entrypoints
  const clientResult = await build({
    ...commonOptions,
    splitting: false,
    entrypoints: [
      "src/components/button/index.ts",
      "src/components/calendar/index.ts",
      "src/components/card/index.ts",
      "src/components/carousel/index.ts",
      "src/components/cascader/index.ts",
      "src/components/badge/index.ts",
      "src/components/breadcrumb/index.ts",
      "src/components/alert/index.ts",
      "src/components/affix/index.ts",
      "src/components/anchor/index.ts",
      "src/components/app/index.ts",
      "src/components/auto-complete/index.ts",
      "src/components/avatar/index.ts",
      "src/components/back-top/index.ts",
      "src/components/checkbox/index.ts",
      "src/components/col/index.ts",
      "src/components/collapse/index.ts",
      "src/components/config-provider/index.ts",
      "src/components/color-picker/index.ts",
      "src/components/date-picker/index.ts",
      "src/components/descriptions/index.ts",
      "src/components/divider/index.ts",
      "src/components/drawer/index.ts",
      "src/components/dm-auxiliary/index.ts",
      "src/components/dm-breadcrumb/index.ts",
      "src/components/dm-drawer/index.ts",
      "src/components/dm-layout/index.ts",
      "src/components/dm-menu/index.ts",
      "src/components/dm-message/index.ts",
      "src/components/dm-date-picker/index.ts",
      "src/components/dm-infinite-scroll/index.ts",
      "src/components/dm-page-header/index.ts",
      "src/components/dm-pagination/index.ts",
      "src/components/dm-pro-table/index.ts",
      "src/components/dm-provider/index.ts",
      "src/components/dm-query/index.ts",
      "src/components/dm-search/index.ts",
      "src/components/dm-splitter/index.ts",
      "src/components/dm-status/index.ts",
      "src/components/dm-tabs/index.ts",
      "src/components/dm-table/index.ts",
      "src/components/dm-toolbar/index.ts",
      "src/components/dm-tree/index.ts",
      "src/components/dm-truncate/index.ts",
      "src/components/dropdown/index.ts",
      "src/components/empty/index.ts",
      "src/components/flex/index.ts",
      "src/components/float-button/index.ts",
      "src/components/form/index.ts",
      "src/components/grid/index.ts",
      "src/components/image/index.ts",
      "src/components/input/index.ts",
      "src/components/input-number/index.ts",
      "src/components/layout/index.ts",
      "src/components/list/index.ts",
      "src/components/mentions/index.ts",
      "src/components/menu/index.ts",
      "src/components/message/index.ts",
      "src/components/modal/index.ts",
      "src/components/notification/index.ts",
      "src/components/pagination/index.ts",
      "src/components/popover/index.ts",
      "src/components/popconfirm/index.ts",
      "src/components/progress/index.ts",
      "src/components/qr-code/index.ts",
      "src/components/radio/index.ts",
      "src/components/rate/index.ts",
      "src/components/result/index.ts",
      "src/components/row/index.ts",
      "src/components/segmented/index.ts",
      "src/components/select/index.ts",
      "src/components/skeleton/index.ts",
      "src/components/slider/index.ts",
      "src/components/space/index.ts",
      "src/components/spin/index.ts",
      "src/components/splitter/index.ts",
      "src/components/statistic/index.ts",
      "src/components/steps/index.ts",
      "src/components/switch/index.ts",
      "src/components/tabs/index.ts",
      "src/components/tag/index.ts",
      "src/components/table/index.ts",
      "src/components/time-picker/index.ts",
      "src/components/timeline/index.ts",
      "src/components/tooltip/index.ts",
      "src/components/tour/index.ts",
      "src/components/transfer/index.ts",
      "src/components/tree/index.ts",
      "src/components/tree-select/index.ts",
      "src/components/typography/index.ts",
      "src/components/upload/index.ts",
      "src/components/watermark/index.ts",
    ],
    banner: '"use client";\n',
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
