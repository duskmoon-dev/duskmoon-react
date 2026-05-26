import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useId,
  useRef,
  useState,
} from "react";
import type {
  ForwardRefExoticComponent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  RefAttributes,
} from "react";
import {
  getTabClasses,
  getTabPanelClasses,
  getTabsListClasses,
  getTabsRootClasses,
  tabIconClass,
  tabsAddClass,
  tabsBarClass,
  tabsCloseClass,
} from "../../classes/tabs";
import type { TabPaneProps, TabsItem, TabsKey, TabsProps } from "./Tabs.types";

function stringifyKey(key: string | number | null, index: number) {
  return key == null ? String(index) : String(key);
}

function normalizeItems(items?: TabsItem[], children?: TabsProps["children"]) {
  if (items) return items;

  const paneItems: TabsItem[] = [];

  Children.forEach(children, (child, index) => {
    if (!isValidElement<TabPaneProps>(child)) return;

    paneItems.push({
      key: stringifyKey(child.key, index),
      label: child.props.tab ?? child.props.label,
      icon: child.props.icon,
      disabled: child.props.disabled,
      closable: child.props.closable,
      closeIcon: child.props.closeIcon,
      forceRender: child.props.forceRender,
      className: child.props.className,
      style: child.props.style,
      children: child.props.children,
    });
  });

  return paneItems;
}

function getInitialActiveKey(items: TabsItem[], defaultActiveKey?: TabsKey) {
  if (defaultActiveKey !== undefined) return defaultActiveKey;

  return items.find((item) => !item.disabled)?.key ?? items[0]?.key;
}

function getCurrentActiveKey(items: TabsItem[], activeKey?: TabsKey) {
  if (activeKey !== undefined && items.some((item) => item.key === activeKey)) {
    return activeKey;
  }

  return items.find((item) => !item.disabled)?.key ?? items[0]?.key;
}

function isEditable(type: TabsProps["type"]) {
  return type === "editable-card";
}

function getTabLabel(item: TabsItem) {
  const label = item.label ?? item.key;

  return (
    <>
      {item.icon ? <span className={tabIconClass}>{item.icon}</span> : null}
      {label}
    </>
  );
}

function shouldRenderPanel({
  item,
  active,
  destroyInactiveTabPane,
}: {
  item: TabsItem;
  active: boolean;
  destroyInactiveTabPane?: boolean;
}) {
  if (active || item.forceRender) return true;

  return !(item.destroyInactiveTabPane ?? destroyInactiveTabPane);
}

export const TabPane = (props: TabPaneProps) => <>{props.children}</>;

TabPane.displayName = "Tabs.TabPane";

const TabsBase = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      activeKey,
      defaultActiveKey,
      onChange,
      onTabClick,
      tabPosition = "top",
      type = "line",
      size = "middle",
      hideAdd,
      addIcon,
      removeIcon,
      onEdit,
      destroyInactiveTabPane,
      centered,
      className,
      children,
      id,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const tabsId = id ?? `tabs-${reactId}`;
    const finalItems = normalizeItems(items, children);
    const [internalActiveKey, setInternalActiveKey] = useState<
      TabsKey | undefined
    >(() => getInitialActiveKey(finalItems, defaultActiveKey));
    const isControlled = activeKey !== undefined;
    const selectedKey = getCurrentActiveKey(
      finalItems,
      isControlled ? activeKey : internalActiveKey,
    );
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const editable = isEditable(type);

    function changeActive(nextKey: TabsKey) {
      if (nextKey === selectedKey) return;

      if (!isControlled) {
        setInternalActiveKey(nextKey);
      }

      onChange?.(nextKey);
    }

    function selectItem(item: TabsItem, event?: MouseEvent<HTMLButtonElement>) {
      if (item.disabled) return;

      if (event) {
        onTabClick?.(item.key, event);
      }

      changeActive(item.key);
    }

    function closeItem(item: TabsItem) {
      if (item.disabled) return;

      onEdit?.(item.key, "remove");
    }

    function addItem(event: MouseEvent<HTMLButtonElement>) {
      onEdit?.(event, "add");
    }

    function focusByOffset(index: number, offset: number) {
      if (finalItems.length === 0) return;

      for (let step = 1; step <= finalItems.length; step += 1) {
        const nextIndex =
          (index + offset * step + finalItems.length) % finalItems.length;
        const nextItem = finalItems[nextIndex];

        if (!nextItem.disabled) {
          tabRefs.current[nextIndex]?.focus();
          changeActive(nextItem.key);
          return;
        }
      }
    }

    function focusEdge(edge: "first" | "last") {
      const candidates =
        edge === "first" ? finalItems : [...finalItems].reverse();
      const item = candidates.find((candidate) => !candidate.disabled);

      if (!item) return;

      const index = finalItems.findIndex(
        (candidate) => candidate.key === item.key,
      );

      tabRefs.current[index]?.focus();
      changeActive(item.key);
    }

    function handleKeyDown(
      item: TabsItem,
      index: number,
      event: KeyboardEvent<HTMLButtonElement>,
    ) {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        focusByOffset(index, 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        focusByOffset(index, -1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusEdge("first");
      } else if (event.key === "End") {
        event.preventDefault();
        focusEdge("last");
      } else if (
        event.key === "Delete" &&
        editable &&
        item.closable !== false
      ) {
        event.preventDefault();
        onEdit?.(item.key, "remove");
      }
    }

    const tabList = (
      <div className={tabsBarClass}>
        <div
          role="tablist"
          aria-orientation={
            tabPosition === "left" || tabPosition === "right"
              ? "vertical"
              : "horizontal"
          }
          className={getTabsListClasses({
            tabPosition,
            type,
            size,
            centered,
          })}
        >
          {finalItems.map((item, index) => {
            const active = item.key === selectedKey;
            const panelId = `${tabsId}-panel-${item.key}`;
            const tabId = `${tabsId}-tab-${item.key}`;
            const showClose =
              editable && item.closable !== false && !item.disabled;

            return (
              <Fragment key={item.key}>
                <button
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={panelId}
                  tabIndex={active ? 0 : -1}
                  disabled={item.disabled}
                  className={getTabClasses({
                    active,
                    disabled: item.disabled,
                    iconOnly: item.icon != null && item.label == null,
                  })}
                  onClick={(event) => selectItem(item, event)}
                  onKeyDown={(event) => handleKeyDown(item, index, event)}
                >
                  {getTabLabel(item)}
                </button>
                {showClose ? (
                  <button
                    type="button"
                    className={tabsCloseClass}
                    aria-label={`Close tab ${item.key}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      closeItem(item);
                    }}
                  >
                    {item.closeIcon ?? removeIcon ?? "x"}
                  </button>
                ) : null}
              </Fragment>
            );
          })}
          {editable && !hideAdd ? (
            <button
              type="button"
              className={tabsAddClass}
              aria-label="Add tab"
              onClick={addItem}
            >
              {addIcon ?? "+"}
            </button>
          ) : null}
        </div>
      </div>
    );

    const panels = finalItems.map((item) => {
      const active = item.key === selectedKey;

      if (!shouldRenderPanel({ item, active, destroyInactiveTabPane })) {
        return null;
      }

      return (
        <div
          key={item.key}
          id={`${tabsId}-panel-${item.key}`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${item.key}`}
          hidden={!active}
          data-active={active ? "true" : undefined}
          className={getTabPanelClasses({
            active,
            className: item.className,
          })}
          style={item.style}
        >
          {item.children}
        </div>
      );
    });

    return (
      <div
        {...props}
        ref={ref}
        id={id}
        className={getTabsRootClasses({ tabPosition, className })}
      >
        {tabPosition === "bottom" || tabPosition === "right" ? panels : null}
        {tabList}
        {tabPosition === "bottom" || tabPosition === "right" ? null : panels}
      </div>
    );
  },
);

TabsBase.displayName = "Tabs";

export const Tabs = Object.assign(TabsBase, {
  TabPane,
}) as ForwardRefExoticComponent<TabsProps & RefAttributes<HTMLDivElement>> & {
  TabPane: typeof TabPane;
};

export type TabsTabPaneElement = ReactElement<TabPaneProps, typeof TabPane>;
