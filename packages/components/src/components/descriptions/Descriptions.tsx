import React, { forwardRef } from "react";
import {
  descriptionsBodyClass,
  descriptionsExtraClass,
  descriptionsHeaderClass,
  descriptionsItemClass,
  descriptionsItemContentClass,
  descriptionsItemLabelClass,
  descriptionsTitleClass,
  getDescriptionsClasses,
} from "../../classes/descriptions";
import { cn } from "../../utils";
import type {
  DescriptionsColumn,
  DescriptionsComponent,
  DescriptionsItemProps,
  DescriptionsItemType,
  DescriptionsProps,
  DescriptionsResponsiveValue,
  DescriptionsSpan,
} from "./Descriptions.types";

function hasNode(node: React.ReactNode) {
  return node !== undefined && node !== null && node !== false;
}

function firstResponsiveNumber(
  value: DescriptionsResponsiveValue | undefined,
  fallback: number,
) {
  if (!value) return fallback;

  return (
    value.xxl ??
    value.xl ??
    value.lg ??
    value.md ??
    value.sm ??
    value.xs ??
    fallback
  );
}

function resolveColumn(column: DescriptionsColumn | undefined) {
  if (typeof column === "number") return Math.max(1, column);
  return firstResponsiveNumber(column, 3);
}

function resolveSpan(span: DescriptionsSpan | undefined, column: number) {
  if (span === "filled") return column;
  if (typeof span === "number") return Math.min(Math.max(1, span), column);
  return Math.min(firstResponsiveNumber(span, 1), column);
}

function toItems(
  items: DescriptionsItemType[] | undefined,
  children: React.ReactNode,
) {
  if (items) return items;

  return React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child, index) => {
      const props = child.props as DescriptionsItemProps;

      return {
        key: child.key ?? index,
        label: props.label,
        children: props.children,
        span: props.span,
        className: props.className,
        labelStyle: props.labelStyle,
        contentStyle: props.contentStyle,
      };
    });
}

const DescriptionsItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (
    {
      children,
      label,
      span,
      labelStyle,
      contentStyle,
      className,
      style,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={cn(descriptionsItemClass, className)}
      style={{
        ...style,
        gridColumn:
          typeof span === "number" ? `span ${span} / span ${span}` : undefined,
      }}
    >
      {hasNode(label) ? (
        <div className={descriptionsItemLabelClass} style={labelStyle}>
          {label}
        </div>
      ) : null}
      <div className={descriptionsItemContentClass} style={contentStyle}>
        {children}
      </div>
    </div>
  ),
);

DescriptionsItem.displayName = "Descriptions.Item";

const DescriptionsRoot = forwardRef<HTMLDivElement, DescriptionsProps>(
  (
    {
      title,
      extra,
      items,
      children,
      bordered,
      size = "default",
      column,
      layout = "horizontal",
      labelStyle,
      contentStyle,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const resolvedColumn = resolveColumn(column);
    const descriptionItems = toItems(items, children);

    return (
      <div
        {...props}
        ref={ref}
        className={getDescriptionsClasses({
          bordered,
          size,
          layout,
          className,
        })}
        style={style}
      >
        {hasNode(title) || hasNode(extra) ? (
          <div className={descriptionsHeaderClass}>
            {hasNode(title) ? (
              <div className={descriptionsTitleClass}>{title}</div>
            ) : null}
            {hasNode(extra) ? (
              <div className={descriptionsExtraClass}>{extra}</div>
            ) : null}
          </div>
        ) : null}
        <div
          className={descriptionsBodyClass}
          style={{
            gridTemplateColumns: `repeat(${resolvedColumn}, minmax(0, 1fr))`,
          }}
        >
          {descriptionItems.map((item, index) => (
            <div
              key={item.key ?? index}
              className={cn(descriptionsItemClass, item.className)}
              style={{
                gridColumn: `span ${resolveSpan(item.span, resolvedColumn)} / span ${resolveSpan(item.span, resolvedColumn)}`,
              }}
            >
              {hasNode(item.label) ? (
                <div
                  className={descriptionsItemLabelClass}
                  style={{ ...labelStyle, ...item.labelStyle }}
                >
                  {item.label}
                </div>
              ) : null}
              <div
                className={descriptionsItemContentClass}
                style={{ ...contentStyle, ...item.contentStyle }}
              >
                {item.children}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

DescriptionsRoot.displayName = "Descriptions";

export const Descriptions = Object.assign(DescriptionsRoot, {
  Item: DescriptionsItem,
}) as DescriptionsComponent;
