import React, { forwardRef } from "react";
import {
  getListClasses,
  getListItemClasses,
  listItemContentClass,
  listItemLeadingClass,
  listItemSecondaryClass,
  listItemTextClass,
  listItemTrailingClass,
} from "../../classes/list";
import { cn } from "../../utils";
import type {
  ListComponent,
  ListItemComponent,
  ListItemMetaProps,
  ListItemProps,
  ListProps,
} from "./List.types";

function hasNode(node: React.ReactNode) {
  return node !== undefined && node !== null && node !== false;
}

function ListRoot<T>(
  {
    dataSource,
    renderItem,
    children,
    bordered,
    size = "md",
    className,
    ...props
  }: ListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const renderedItems =
    dataSource && renderItem
      ? dataSource.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
        ))
      : children;

  return (
    <div
      {...props}
      ref={ref}
      className={getListClasses({ bordered, size, className })}
    >
      {renderedItems}
    </div>
  );
}

const ListRootWithRef = forwardRef(ListRoot) as unknown as <T = unknown>(
  props: ListProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;

const ListItemMeta = forwardRef<HTMLDivElement, ListItemMetaProps>(
  ({ avatar, title, description, className, children, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(listItemContentClass, className)}>
      {avatar ? <div className={listItemLeadingClass}>{avatar}</div> : null}
      {hasNode(title) ? <div className={listItemTextClass}>{title}</div> : null}
      {hasNode(description) ? (
        <div className={listItemSecondaryClass}>{description}</div>
      ) : null}
      {children}
    </div>
  ),
);

ListItemMeta.displayName = "List.Item.Meta";

function renderTrailing(extra?: React.ReactNode, actions?: React.ReactNode) {
  const actionNodes = React.Children.toArray(actions);

  if (!hasNode(extra) && actionNodes.length === 0) {
    return null;
  }

  return (
    <div className={listItemTrailingClass}>
      {extra}
      {actionNodes}
    </div>
  );
}

const ListItemRoot = forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      children,
      actions,
      extra,
      className,
      disabled,
      onClick,
      tabIndex,
      role,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const interactive = Boolean(onClick);

    function handleClick(event: React.MouseEvent<HTMLDivElement>) {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);

      if (
        disabled ||
        event.defaultPrevented ||
        !onClick ||
        (event.key !== "Enter" && event.key !== " ")
      ) {
        return;
      }

      event.preventDefault();
      onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
    }

    return (
      <div
        {...props}
        ref={ref}
        role={role ?? (interactive ? "button" : undefined)}
        aria-disabled={disabled || undefined}
        tabIndex={tabIndex ?? (interactive && !disabled ? 0 : undefined)}
        className={getListItemClasses({ interactive, disabled, className })}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className={listItemContentClass}>{children}</div>
        {renderTrailing(extra, actions)}
      </div>
    );
  },
) as ListItemComponent;

ListItemRoot.displayName = "List.Item";
ListItemRoot.Meta = ListItemMeta;

export const List = Object.assign(ListRootWithRef, {
  Item: ListItemRoot,
}) as ListComponent;

List.displayName = "List";
