import React, { forwardRef } from "react";
import {
  breadcrumbIconClass,
  breadcrumbMenuClass,
  breadcrumbMenuItemClass,
  breadcrumbMenuListClass,
  breadcrumbSeparatorClass,
  getBreadcrumbClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
} from "../../classes/breadcrumb";
import { cn } from "../../utils";
import type {
  BreadcrumbComponent,
  BreadcrumbItemType,
  BreadcrumbMenuItemType,
  BreadcrumbMenuProps,
  BreadcrumbProps,
  BreadcrumbRoute,
  BreadcrumbSeparatorType,
} from "./Breadcrumb.types";

const defaultSeparator = "/";

function isSeparatorItem(
  item: BreadcrumbItemType,
): item is BreadcrumbSeparatorType {
  return "type" in item && item.type === "separator";
}

function hasNode(node: React.ReactNode) {
  return node !== undefined && node !== null && node !== false;
}

function getItemTitle(item: BreadcrumbRoute | BreadcrumbMenuItemType) {
  if ("breadcrumbName" in item && hasNode(item.breadcrumbName)) {
    return item.breadcrumbName;
  }

  return item.title ?? item.label;
}

function replacePathParams(path: string, params: BreadcrumbProps["params"]) {
  return path.replace(/:([^/]+)/g, (token, key: string) => {
    const value = params?.[key];
    return value === undefined ? token : encodeURIComponent(String(value));
  });
}

function normalizePathSegment(path: string) {
  return path.replace(/^\/+|\/+$/g, "");
}

function buildPaths(
  routes: BreadcrumbRoute[],
  routeIndex: number,
  params: BreadcrumbProps["params"],
) {
  return routes.slice(0, routeIndex + 1).reduce<string[]>((paths, route) => {
    if (!route.path) {
      return paths;
    }

    const path = normalizePathSegment(replacePathParams(route.path, params));

    if (path) {
      paths.push(path);
    }

    return paths;
  }, []);
}

function getHref(item: BreadcrumbRoute, paths: string[]) {
  if (item.href) {
    return item.href;
  }

  if (!item.path || paths.length === 0) {
    return undefined;
  }

  return `/${paths.join("/")}`;
}

function activateOnKeyboard(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  event.currentTarget.click();
}

function renderItemBody(item: BreadcrumbRoute | BreadcrumbMenuItemType) {
  const title = getItemTitle(item);

  return (
    <>
      {item.icon ? (
        <span className={breadcrumbIconClass} aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      {hasNode(title) ? title : null}
    </>
  );
}

function routeChildrenToMenu(
  children: BreadcrumbRoute[] | undefined,
): BreadcrumbMenuProps | undefined {
  if (!children?.length) {
    return undefined;
  }

  return {
    items: children.map((child, index) => ({
      key: child.key ?? child.path ?? index,
      label: getItemTitle(child),
      href: child.href,
      path: child.path,
      icon: child.icon,
      disabled: child.disabled,
      onClick: child.onClick,
      children: child.children?.map((nested, nestedIndex) => ({
        key: nested.key ?? nested.path ?? nestedIndex,
        label: getItemTitle(nested),
        href: nested.href,
        path: nested.path,
        icon: nested.icon,
        disabled: nested.disabled,
        onClick: nested.onClick,
      })),
    })),
  };
}

function renderMenuItems(
  menu: BreadcrumbMenuProps,
  items: BreadcrumbMenuItemType[] = [],
) {
  return items.map((item, index) => {
    const key = item.key ?? item.path ?? index;
    const href = item.href ?? item.path;
    const label = renderItemBody(item);

    function handleClick(event: React.MouseEvent<HTMLElement>) {
      if (item.disabled) {
        event.preventDefault();
        return;
      }

      item.onClick?.(event);
      menu.onClick?.({ key, item, domEvent: event });
    }

    const content = item.disabled ? (
      <span
        role="menuitem"
        aria-disabled="true"
        className={getBreadcrumbLinkClasses({
          disabled: true,
          className: breadcrumbMenuItemClass,
        })}
      >
        {label}
      </span>
    ) : href ? (
      <a
        role="menuitem"
        className={cn(breadcrumbMenuItemClass, getBreadcrumbLinkClasses({}))}
        href={href}
        onClick={handleClick}
      >
        {label}
      </a>
    ) : (
      <button
        type="button"
        role="menuitem"
        className={cn(breadcrumbMenuItemClass, getBreadcrumbLinkClasses({}))}
        onClick={handleClick}
      >
        {label}
      </button>
    );

    return (
      <li key={key}>
        {content}
        {item.children?.length ? (
          <ul className={breadcrumbMenuListClass} role="menu">
            {renderMenuItems(menu, item.children)}
          </ul>
        ) : null}
      </li>
    );
  });
}

function renderDefaultItemContent(
  item: BreadcrumbRoute,
  paths: string[],
  active: boolean,
) {
  const body = renderItemBody(item);

  if (item.disabled) {
    return body;
  }

  const href = item.href ?? (!active ? getHref(item, paths) : undefined);

  if (href) {
    return (
      <a
        className={getBreadcrumbLinkClasses({})}
        href={href}
        onClick={item.onClick}
      >
        {body}
      </a>
    );
  }

  if (item.onClick) {
    return (
      <span
        role="button"
        tabIndex={0}
        className={getBreadcrumbLinkClasses({})}
        onClick={item.onClick}
        onKeyDown={activateOnKeyboard}
      >
        {body}
      </span>
    );
  }

  return body;
}

function renderMenuItem(
  item: BreadcrumbRoute,
  menu: BreadcrumbMenuProps,
  children: React.ReactNode,
  disabled?: boolean,
) {
  return (
    <details
      className={getBreadcrumbItemClasses({
        disabled,
        className: cn(breadcrumbMenuClass, item.className),
      })}
      aria-disabled={disabled || undefined}
    >
      <summary className={getBreadcrumbLinkClasses({ disabled })}>
        {children}
      </summary>
      <ul className={breadcrumbMenuListClass} role="menu">
        {renderMenuItems(menu, menu.items)}
      </ul>
    </details>
  );
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      routes,
      params = {},
      separator = defaultSeparator,
      itemRender,
      className,
      children,
      "aria-label": ariaLabel = "Breadcrumb",
      ...props
    },
    ref,
  ) => {
    const entries = items ?? routes;

    if (!entries?.length) {
      return (
        <nav
          {...props}
          ref={ref}
          aria-label={ariaLabel}
          className={getBreadcrumbClasses({ className })}
        >
          {children}
        </nav>
      );
    }

    const routeEntries = entries.filter(
      (item): item is BreadcrumbRoute => !isSeparatorItem(item),
    );
    let routeIndex = -1;
    let previousRenderedItemWasSeparator = true;

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={getBreadcrumbClasses({ className })}
      >
        {entries.map((entry, index) => {
          if (isSeparatorItem(entry)) {
            previousRenderedItemWasSeparator = true;

            return (
              <span
                key={entry.key ?? `separator-${index}`}
                className={cn(breadcrumbSeparatorClass, entry.className)}
                aria-hidden="true"
              >
                {entry.separator ?? separator}
              </span>
            );
          }

          routeIndex += 1;

          const currentRouteIndex = routeIndex;
          const paths = buildPaths(routeEntries, currentRouteIndex, params);
          const active = currentRouteIndex === routeEntries.length - 1;
          const menu = entry.menu ?? routeChildrenToMenu(entry.children);
          const content =
            itemRender?.(entry, params, routeEntries, paths) ??
            renderDefaultItemContent(entry, paths, active);
          const applyActiveClass =
            active && !itemRender && !entry.href && !entry.onClick;
          const insertSeparator = !previousRenderedItemWasSeparator;

          previousRenderedItemWasSeparator = false;

          return (
            <React.Fragment
              key={entry.key ?? entry.href ?? entry.path ?? currentRouteIndex}
            >
              {insertSeparator ? (
                <span className={breadcrumbSeparatorClass} aria-hidden="true">
                  {separator}
                </span>
              ) : null}
              {menu?.items?.length ? (
                renderMenuItem(entry, menu, content, entry.disabled)
              ) : (
                <span
                  className={getBreadcrumbItemClasses({
                    active: applyActiveClass,
                    disabled: entry.disabled,
                    className: entry.className,
                  })}
                  aria-current={active ? "page" : undefined}
                  aria-disabled={entry.disabled || undefined}
                >
                  {content}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  },
) as BreadcrumbComponent;

Breadcrumb.displayName = "Breadcrumb";
