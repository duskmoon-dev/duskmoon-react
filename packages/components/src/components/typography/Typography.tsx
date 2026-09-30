import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  getTypographyClasses,
  getTypographyLinkClasses,
  getTypographyParagraphClasses,
  getTypographyTextClasses,
  getTypographyTitleClasses,
  typographyActionClass,
  typographyEditInputClass,
  typographyEditingClass,
  typographyExpandClass,
} from "../../classes/typography";
import { cn } from "../../utils";
import type {
  LinkProps,
  ParagraphProps,
  TextProps,
  TitleProps,
  TypographyBehaviorProps,
  TypographyComponent,
  TypographyCopyable,
  TypographyCopyableConfig,
  TypographyEditable,
  TypographyEditableConfig,
  TypographyEllipsis,
  TypographyEllipsisConfig,
  TypographyProps,
  TypographySemanticProps,
} from "./Typography.types";

function toText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(toText).join("");
  }

  return "";
}

function normalizeEditable(
  editable: TypographyEditable | undefined,
): TypographyEditableConfig | undefined {
  if (!editable) {
    return undefined;
  }

  return editable === true ? {} : editable;
}

function normalizeCopyable(
  copyable: TypographyCopyable | undefined,
): TypographyCopyableConfig | undefined {
  if (!copyable) {
    return undefined;
  }

  return copyable === true ? {} : copyable;
}

function normalizeEllipsis(
  ellipsis: TypographyEllipsis | undefined,
): TypographyEllipsisConfig | undefined {
  if (!ellipsis) {
    return undefined;
  }

  return ellipsis === true ? {} : ellipsis;
}

function shouldShowEditText(
  triggerType: TypographyEditableConfig["triggerType"],
) {
  if (!triggerType) {
    return false;
  }

  return Array.isArray(triggerType)
    ? triggerType.includes("text")
    : triggerType === "text";
}

function getCopyIcon(copyable: TypographyCopyableConfig, copied: boolean) {
  if (Array.isArray(copyable.icon)) {
    return copyable.icon[copied ? 1 : 0];
  }

  return copyable.icon ?? (copied ? "Copied" : "Copy");
}

function getExpandSymbol(
  ellipsis: TypographyEllipsisConfig,
  expanded: boolean,
) {
  if (typeof ellipsis.symbol === "function") {
    return ellipsis.symbol(expanded);
  }

  if (ellipsis.symbol != null) {
    return ellipsis.symbol;
  }

  return expanded ? "Collapse" : "Expand";
}

function getEllipsisStyle(
  ellipsis: TypographyEllipsisConfig | undefined,
  expanded: boolean,
): CSSProperties | undefined {
  if (!ellipsis || expanded) {
    return undefined;
  }

  const rows = Math.max(1, ellipsis.rows ?? 1);

  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: rows,
    overflow: "hidden",
  };
}

function wrapSemanticContent(
  content: ReactNode,
  {
    mark,
    code,
    keyboard,
    underline,
    delete: deleted,
    strong,
    italic,
  }: TypographySemanticProps,
) {
  let current = content;

  if (code) {
    current = <code>{current}</code>;
  }

  if (keyboard) {
    current = <kbd>{current}</kbd>;
  }

  if (mark) {
    current = <mark>{current}</mark>;
  }

  if (strong) {
    current = <strong>{current}</strong>;
  }

  if (italic) {
    current = <em>{current}</em>;
  }

  if (underline) {
    current = <u>{current}</u>;
  }

  if (deleted) {
    current = <del>{current}</del>;
  }

  return current;
}

function EditableContent({
  editable,
  disabled,
  sourceText,
  children,
}: {
  editable?: TypographyEditableConfig;
  disabled?: boolean;
  sourceText: string;
  children: ReactNode;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isControlled = editable?.editing !== undefined;
  const [internalEditing, setInternalEditing] = useState(false);
  const [draft, setDraft] = useState(editable?.text ?? sourceText);
  const editing = editable ? (editable.editing ?? internalEditing) : false;

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
    }
  }, [editing]);

  if (!editable || disabled) {
    return <>{children}</>;
  }

  const editableConfig = editable;

  function setEditing(next: boolean) {
    if (!isControlled) {
      setInternalEditing(next);
    }
  }

  function startEdit() {
    setDraft(editableConfig.text ?? sourceText);
    editableConfig.onStart?.();
    setEditing(true);
  }

  function endEdit() {
    editableConfig.onChange?.(draft);
    editableConfig.onEnd?.();
    setEditing(false);
  }

  function cancelEdit() {
    editableConfig.onCancel?.();
    setEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      endEdit();
    }
  }

  if (editing) {
    return (
      <span className={typographyEditingClass}>
        <textarea
          ref={textareaRef}
          className={typographyEditInputClass}
          aria-label="Edit text"
          maxLength={editableConfig.maxLength}
          rows={
            typeof editableConfig.autoSize === "object"
              ? editableConfig.autoSize.minRows
              : undefined
          }
          value={draft}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={typographyActionClass}
          aria-label="Save edit"
          onClick={endEdit}
        >
          {editableConfig.enterIcon ?? "Save"}
        </button>
        <button
          type="button"
          className={typographyActionClass}
          aria-label="Cancel edit"
          onClick={cancelEdit}
        >
          Cancel
        </button>
      </span>
    );
  }

  const showTextTrigger = shouldShowEditText(editableConfig.triggerType);

  return (
    <>
      {children}
      <button
        type="button"
        className={typographyActionClass}
        title={
          typeof editableConfig.tooltip === "string"
            ? editableConfig.tooltip
            : undefined
        }
        aria-label="Edit text"
        onClick={startEdit}
      >
        {editableConfig.icon ?? (showTextTrigger ? "Edit" : "Edit")}
      </button>
    </>
  );
}

function TypographyActions({
  copyable,
  ellipsis,
  disabled,
  sourceText,
  expanded,
  copied,
  onCopy,
  onToggleExpand,
}: {
  copyable?: TypographyCopyableConfig;
  ellipsis?: TypographyEllipsisConfig;
  disabled?: boolean;
  sourceText: string;
  expanded: boolean;
  copied: boolean;
  onCopy: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleExpand: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <>
      {ellipsis?.expandable ? (
        <button
          type="button"
          className={cn(typographyActionClass, typographyExpandClass)}
          aria-expanded={expanded}
          onClick={onToggleExpand}
        >
          {getExpandSymbol(ellipsis, expanded)}
        </button>
      ) : null}
      {copyable ? (
        <button
          type="button"
          className={typographyActionClass}
          aria-label="Copy text"
          disabled={disabled}
          data-copy-source={sourceText}
          onClick={onCopy}
        >
          {getCopyIcon(copyable, copied)}
        </button>
      ) : null}
    </>
  );
}

function useTypographyBehavior({
  children,
  copyable,
  ellipsis,
}: Pick<TypographyBehaviorProps, "copyable" | "ellipsis"> & {
  children: ReactNode;
}) {
  const sourceText = useMemo(() => toText(children), [children]);
  const copyConfig = normalizeCopyable(copyable);
  const ellipsisConfig = normalizeEllipsis(ellipsis);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function handleCopy(event: React.MouseEvent<HTMLButtonElement>) {
    const text = copyConfig?.text ?? sourceText;

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
    }

    setCopied(true);
    copyConfig?.onCopy?.(event);
  }

  function handleToggleExpand(event: React.MouseEvent<HTMLButtonElement>) {
    const nextExpanded = !expanded;

    setExpanded(nextExpanded);
    ellipsisConfig?.onExpand?.(event, { expanded: nextExpanded });
    ellipsisConfig?.onEllipsis?.(!nextExpanded);
  }

  return {
    copied,
    copyConfig,
    ellipsisConfig,
    expanded,
    handleCopy,
    handleToggleExpand,
    sourceText,
  };
}

const TypographyRoot = forwardRef<HTMLDivElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={getTypographyClasses(className)} />
  ),
);

TypographyRoot.displayName = "Typography";

const Text = forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      children,
      className,
      copyable,
      disabled,
      editable,
      ellipsis,
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
      size = "md",
      style,
      type,
      ...props
    },
    ref,
  ) => {
    const editableConfig = normalizeEditable(editable);
    const {
      copied,
      copyConfig,
      ellipsisConfig,
      expanded,
      handleCopy,
      handleToggleExpand,
      sourceText,
    } = useTypographyBehavior({ children, copyable, ellipsis });
    const content = wrapSemanticContent(children, {
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
    });

    return (
      <span
        {...props}
        ref={ref}
        aria-disabled={disabled || undefined}
        className={getTypographyTextClasses({
          status: type,
          disabled,
          editable: Boolean(editableConfig),
          copyable: Boolean(copyConfig),
          ellipsis: Boolean(ellipsisConfig),
          size,
          className,
        })}
        style={{ ...style, ...getEllipsisStyle(ellipsisConfig, expanded) }}
      >
        <EditableContent
          editable={editableConfig}
          disabled={disabled}
          sourceText={sourceText}
        >
          {content}
          {ellipsisConfig?.suffix && !expanded ? ellipsisConfig.suffix : null}
        </EditableContent>
        <TypographyActions
          copyable={copyConfig}
          ellipsis={ellipsisConfig}
          disabled={disabled}
          sourceText={sourceText}
          expanded={expanded}
          copied={copied}
          onCopy={handleCopy}
          onToggleExpand={handleToggleExpand}
        />
      </span>
    );
  },
);

Text.displayName = "Typography.Text";

const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      children,
      className,
      copyable,
      disabled,
      editable,
      ellipsis,
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
      style,
      type,
      ...props
    },
    ref,
  ) => {
    const editableConfig = normalizeEditable(editable);
    const {
      copied,
      copyConfig,
      ellipsisConfig,
      expanded,
      handleCopy,
      handleToggleExpand,
      sourceText,
    } = useTypographyBehavior({ children, copyable, ellipsis });
    const content = wrapSemanticContent(children, {
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
    });

    return (
      <p
        {...props}
        ref={ref}
        aria-disabled={disabled || undefined}
        className={getTypographyParagraphClasses({
          status: type,
          disabled,
          editable: Boolean(editableConfig),
          copyable: Boolean(copyConfig),
          ellipsis: Boolean(ellipsisConfig),
          className,
        })}
        style={{ ...style, ...getEllipsisStyle(ellipsisConfig, expanded) }}
      >
        <EditableContent
          editable={editableConfig}
          disabled={disabled}
          sourceText={sourceText}
        >
          {content}
          {ellipsisConfig?.suffix && !expanded ? ellipsisConfig.suffix : null}
        </EditableContent>
        <TypographyActions
          copyable={copyConfig}
          ellipsis={ellipsisConfig}
          disabled={disabled}
          sourceText={sourceText}
          expanded={expanded}
          copied={copied}
          onCopy={handleCopy}
          onToggleExpand={handleToggleExpand}
        />
      </p>
    );
  },
);

Paragraph.displayName = "Typography.Paragraph";

const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  (
    {
      children,
      className,
      copyable,
      disabled,
      editable,
      ellipsis,
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
      level = 1,
      style,
      type,
      ...props
    },
    ref,
  ) => {
    const editableConfig = normalizeEditable(editable);
    const {
      copied,
      copyConfig,
      ellipsisConfig,
      expanded,
      handleCopy,
      handleToggleExpand,
      sourceText,
    } = useTypographyBehavior({ children, copyable, ellipsis });
    const content = wrapSemanticContent(children, {
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
    });
    const headingLevel = Math.min(5, Math.max(1, level)) as 1 | 2 | 3 | 4 | 5;
    const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5";

    return React.createElement(
      Heading,
      {
        ...props,
        ref,
        "aria-disabled": disabled || undefined,
        className: getTypographyTitleClasses({
          status: type,
          disabled,
          editable: Boolean(editableConfig),
          copyable: Boolean(copyConfig),
          ellipsis: Boolean(ellipsisConfig),
          className,
        }),
        style: { ...style, ...getEllipsisStyle(ellipsisConfig, expanded) },
      },
      <EditableContent
        editable={editableConfig}
        disabled={disabled}
        sourceText={sourceText}
      >
        {content}
        {ellipsisConfig?.suffix && !expanded ? ellipsisConfig.suffix : null}
      </EditableContent>,
      <TypographyActions
        copyable={copyConfig}
        ellipsis={ellipsisConfig}
        disabled={disabled}
        sourceText={sourceText}
        expanded={expanded}
        copied={copied}
        onCopy={handleCopy}
        onToggleExpand={handleToggleExpand}
      />,
    );
  },
);

Title.displayName = "Typography.Title";

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      className,
      disabled,
      ellipsis,
      href,
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
      onClick,
      style,
      type,
      ...props
    },
    ref,
  ) => {
    const { ellipsisConfig, expanded, handleToggleExpand } =
      useTypographyBehavior({
        children,
        ellipsis,
      });
    const content = wrapSemanticContent(children, {
      mark,
      code,
      keyboard,
      underline,
      delete: deleted,
      strong,
      italic,
    });

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    }

    return (
      <a
        {...props}
        ref={ref}
        href={href}
        aria-disabled={disabled || undefined}
        className={getTypographyLinkClasses({
          status: type,
          disabled,
          ellipsis: Boolean(ellipsisConfig),
          className,
        })}
        style={{ ...style, ...getEllipsisStyle(ellipsisConfig, expanded) }}
        onClick={handleClick}
      >
        {content}
        {ellipsisConfig?.suffix && !expanded ? ellipsisConfig.suffix : null}
        <TypographyActions
          ellipsis={ellipsisConfig}
          disabled={disabled}
          sourceText=""
          expanded={expanded}
          copied={false}
          onCopy={() => undefined}
          onToggleExpand={handleToggleExpand}
        />
      </a>
    );
  },
);

Link.displayName = "Typography.Link";

export const Typography = Object.assign(TypographyRoot, {
  Text,
  Title,
  Paragraph,
  Link,
}) as TypographyComponent;

export { Link, Paragraph, Text, Title };
