import React, { forwardRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import {
  getMarkdownClasses,
  markdownColorChipClass,
  markdownColorChipSwatchClass,
  markdownColorCodeClass,
  markdownFrontMatterClass,
} from "../../classes/markdown";
import type { MarkdownFrontMatterMode, MarkdownProps } from "./Markdown.types";

type FrontMatter = { source: string; body: string };

function splitFrontMatter(markdown: string): FrontMatter | undefined {
  const source = markdown.startsWith("\uFEFF") ? markdown.slice(1) : markdown;
  const lines = source.split(/\r?\n/);

  if (lines.length < 2 || lines[0] !== "---") return undefined;

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === "---" || lines[index] === "...") {
      return {
        source: lines.slice(1, index).join("\n"),
        body: lines.slice(index + 1).join("\n"),
      };
    }
  }

  return undefined;
}

function numberInRange(value: string, minimum: number, maximum: number) {
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum;
}

function percentage(value: string) {
  return value.endsWith("%") && numberInRange(value.slice(0, -1), 0, 100);
}

function alpha(value: string) {
  return percentage(value) || numberInRange(value, 0, 1);
}

function isCssColor(value: string) {
  if (
    !value ||
    Array.from(value).some((character) => character.charCodeAt(0) > 127) ||
    value.trim() !== value
  ) {
    return false;
  }

  if (/^#[\da-f]{3,4}(?:[\da-f]{2}){0,2}$/i.test(value)) return true;

  const match = /^(rgba?|hsla?)\((.*)\)$/i.exec(value);
  if (!match || match[2].includes("(") || match[2].includes(")")) return false;

  const name = match[1].toLowerCase();
  const parts = match[2].split(",").map((part) => part.trim());
  const hasAlpha = name.endsWith("a");
  if (parts.length !== (hasAlpha ? 4 : 3)) return false;

  if (name.startsWith("rgb")) {
    const channels = parts.slice(0, 3);
    const allPercentages = channels.every(percentage);
    const allNumbers = channels.every((part) => numberInRange(part, 0, 255));
    return (allPercentages || allNumbers) && (!hasAlpha || alpha(parts[3]));
  }

  const hue = parts[0].replace(/deg$/i, "");
  return (
    numberInRange(hue, 0, 360) &&
    percentage(parts[1]) &&
    percentage(parts[2]) &&
    (!hasAlpha || alpha(parts[3]))
  );
}

function markdownSource(markdown: string, mode: MarkdownFrontMatterMode) {
  if (mode === "disabled") return { body: markdown, source: undefined };
  const frontMatter = splitFrontMatter(markdown);
  return frontMatter ?? { body: markdown, source: undefined };
}

export const Markdown = forwardRef<HTMLDivElement, MarkdownProps>(
  function Markdown(
    {
      markdown = "",
      breaks = true,
      colorChips = true,
      frontMatter = "render",
      variant,
      className,
      ...props
    },
    ref,
  ) {
    const source = markdownSource(markdown, frontMatter);
    const components: Components | undefined = colorChips
      ? {
          code({ children, className: codeClassName, node, ...codeProps }) {
            const value = String(children).replace(/\n$/, "");
            const isInline =
              node?.position?.start.line === node?.position?.end.line;

            if (!isInline || !isCssColor(value)) {
              return (
                <code className={codeClassName} {...codeProps}>
                  {children}
                </code>
              );
            }

            return (
              <code className={markdownColorCodeClass} {...codeProps}>
                {children}
                <span
                  className={markdownColorChipClass}
                  role="img"
                  aria-label={`Color ${value}`}
                >
                  <span
                    className={markdownColorChipSwatchClass}
                    style={{ backgroundColor: value }}
                    aria-hidden="true"
                  />
                </span>
              </code>
            );
          },
        }
      : undefined;

    return (
      <div
        ref={ref}
        className={getMarkdownClasses({ variant, className })}
        {...props}
      >
        {frontMatter === "render" && source.source !== undefined ? (
          <div className={markdownFrontMatterClass}>
            <pre>
              <code className="language-yaml">{source.source}</code>
            </pre>
          </div>
        ) : null}
        <ReactMarkdown
          remarkPlugins={breaks ? [remarkGfm, remarkBreaks] : [remarkGfm]}
          components={components}
        >
          {source.body}
        </ReactMarkdown>
      </div>
    );
  },
);
