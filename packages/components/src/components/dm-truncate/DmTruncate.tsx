import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  dmTruncateContentClass,
  dmTruncateCopyClass,
  dmTruncateMeasureClass,
  dmTruncateOverflowTagClass,
  getDmTruncateClasses,
  getDmTruncateTextClasses,
} from "../../classes/dm-truncate";
import { cn } from "../../utils";
import { Tooltip } from "../tooltip";
import type { DmTruncateProps } from "./DmTruncate.types";

function toPlainText(value: React.ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(toPlainText).join("");
  }

  return "";
}

function getOverflowContent(
  overflowContent: DmTruncateProps["overflowContent"],
  value: string,
) {
  if (typeof overflowContent === "function") {
    return overflowContent(value);
  }

  return overflowContent ?? value;
}

function getLineHeight(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") {
    return 22;
  }

  const lineHeight = window.getComputedStyle(element).lineHeight;
  const parsed = Number.parseFloat(lineHeight);

  return Number.isFinite(parsed) ? parsed : 22;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export const DmTruncate = forwardRef<HTMLDivElement, DmTruncateProps>(
  (
    {
      children,
      showOverflowTag = true,
      overflowContent,
      emptyValue = "-",
      overflowPercent = 0.8,
      tooltipProps,
      className,
      style,
      isShowPopover = true,
      copyable = false,
      maxLines = 1,
      tooltipPreserveLineBreak = false,
      textClassName,
      textStyle,
      onCopy,
      ...props
    },
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLSpanElement | null>(null);
    const measureRef = useRef<HTMLSpanElement | null>(null);
    const copyTimerRef = useRef<number | null>(null);
    const [overflow, setOverflow] = useState(false);
    const [copied, setCopied] = useState(false);
    const textValue = toPlainText(children);
    const hasText = textValue.length > 0;
    const displayValue = hasText ? textValue : emptyValue;
    const multiline = maxLines > 1;
    const popoverContent = getOverflowContent(overflowContent, textValue);
    const shouldShowPopover = isShowPopover && overflow && hasText;
    const textMaxWidth =
      overflow && (showOverflowTag || copyable)
        ? `${Math.max(0.1, Math.min(1, overflowPercent)) * 100}%`
        : undefined;

    const textClampStyle = useMemo<React.CSSProperties>(() => {
      if (!multiline) {
        return {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: textMaxWidth,
          ...textStyle,
        };
      }

      return {
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: Math.max(1, maxLines),
        overflow: "hidden",
        whiteSpace: tooltipPreserveLineBreak ? "pre-line" : undefined,
        maxWidth: textMaxWidth,
        ...textStyle,
      };
    }, [
      maxLines,
      multiline,
      textMaxWidth,
      textStyle,
      tooltipPreserveLineBreak,
    ]);

    const measure = useCallback(() => {
      const wrapper = wrapperRef.current;
      const text = textRef.current;
      const measureNode = measureRef.current;

      if (!wrapper || !text || !measureNode || !hasText) {
        setOverflow(false);
        return;
      }

      if (multiline) {
        const maxHeight = getLineHeight(text) * Math.max(1, maxLines);
        setOverflow(measureNode.scrollHeight > maxHeight);
        return;
      }

      const availableWidth = wrapper.clientWidth || text.clientWidth;
      const renderedWidth = measureNode.scrollWidth || text.scrollWidth;
      setOverflow(Boolean(availableWidth && renderedWidth > availableWidth));
    }, [hasText, maxLines, multiline]);

    useLayoutEffect(() => {
      measure();
    }, [measure, textValue]);

    useEffect(() => {
      if (typeof window === "undefined") {
        return;
      }

      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, [measure]);

    useEffect(() => {
      return () => {
        if (copyTimerRef.current) {
          window.clearTimeout(copyTimerRef.current);
        }
      };
    }, []);

    async function handleCopy() {
      if (!hasText) {
        return;
      }

      await copyText(textValue);
      onCopy?.(textValue);
      setCopied(true);

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = window.setTimeout(() => setCopied(false), 3000);
    }

    function setRefs(node: HTMLDivElement | null) {
      wrapperRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    const textNode = (
      <span
        ref={textRef}
        className={getDmTruncateTextClasses({
          multiline,
          overflow,
          className: textClassName,
        })}
        style={textClampStyle}
      >
        {displayValue}
      </span>
    );

    return (
      <div
        {...props}
        ref={setRefs}
        className={getDmTruncateClasses(className)}
        style={style}
      >
        <span className={dmTruncateContentClass}>
          {!showOverflowTag && shouldShowPopover ? (
            <Tooltip
              title={popoverContent}
              placement="bottom"
              {...tooltipProps}
            >
              {textNode}
            </Tooltip>
          ) : (
            textNode
          )}
          <span
            ref={measureRef}
            aria-hidden="true"
            className={dmTruncateMeasureClass}
            style={{
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              whiteSpace: tooltipPreserveLineBreak ? "pre-line" : "nowrap",
              width: multiline ? wrapperRef.current?.clientWidth : undefined,
            }}
          >
            {textValue}
          </span>
          {showOverflowTag && shouldShowPopover ? (
            <Tooltip
              title={popoverContent}
              placement="bottom"
              {...tooltipProps}
            >
              <span
                aria-label="Text overflow"
                role="img"
                className={dmTruncateOverflowTagClass}
              >
                !
              </span>
            </Tooltip>
          ) : null}
          {copyable && hasText ? (
            <button
              type="button"
              className={cn(dmTruncateCopyClass, "btn btn-text btn-xs")}
              aria-label={copied ? "Copied" : "Copy"}
              onClick={handleCopy}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </span>
      </div>
    );
  },
);

DmTruncate.displayName = "DmTruncate";

