import type { ComponentProps } from "react";

export type MarkdownFrontMatterMode = "render" | "hidden" | "disabled";

export interface MarkdownProps extends Omit<ComponentProps<"div">, "children"> {
  /** Markdown source to render. */
  markdown?: string;
  /** Convert soft line endings to `<br>` elements. @default true */
  breaks?: boolean;
  /** Add a visual swatch to inline code containing a valid CSS color. @default true */
  colorChips?: boolean;
  /** Control handling of YAML front matter at the beginning of the source. @default "render" */
  frontMatter?: MarkdownFrontMatterMode;
  /** Optional color variant used to build the `markdown-body-{variant}` class. */
  variant?: string;
}
