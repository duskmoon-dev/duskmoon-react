import { defineConfig } from "astro/config";

import react from "@astrojs/react";

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
});
