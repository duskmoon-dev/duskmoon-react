import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

import react from "@astrojs/react";

const componentsSourcePlugin = {
  name: "duskmoon-components-source",
  apply: "serve",
  config() {
    return {
      resolve: {
        alias: [
          {
            find: /^@duskmoon-dev\/components$/,
            replacement: fileURLToPath(
              new URL("../components/src/index.ts", import.meta.url),
            ),
          },
          {
            find: /^@duskmoon-dev\/components\/styles\.css$/,
            replacement: fileURLToPath(
              new URL("./src/styles/components-dev.css", import.meta.url),
            ),
          },
        ],
      },
    };
  },
};

const githubRepository = process.env.GITHUB_REPOSITORY ?? "";
const [githubOwner, githubRepo] = githubRepository.split("/");
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const githubPagesBase =
  isGitHubActions && githubRepo ? `/${githubRepo}` : undefined;
const githubPagesSite =
  isGitHubActions && githubOwner
    ? `https://${githubOwner}.github.io`
    : undefined;

// https://astro.build/config
export default defineConfig({
  site: process.env.DOCS_SITE ?? githubPagesSite,
  base: process.env.DOCS_BASE ?? githubPagesBase,
  outDir: "dist",
  integrations: [react()],
  vite: {
    plugins: [componentsSourcePlugin],
  },
});
