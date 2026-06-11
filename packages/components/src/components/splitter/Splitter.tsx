import React, {
  forwardRef,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  getSplitterClasses,
  getSplitterHandleClasses,
  getSplitterPanelClasses,
} from "../../classes/splitter";
import type {
  SplitterComponent,
  SplitterPanelProps,
  SplitterProps,
  SplitterSize,
} from "./Splitter.types";

function toCssSize(size: SplitterSize | undefined) {
  if (typeof size === "number") return `${size}px`;
  return size;
}

function isPanelElement(
  child: React.ReactNode,
): child is React.ReactElement<SplitterPanelProps> {
  return React.isValidElement(child);
}

function getInitialSizes(
  panels: Array<React.ReactElement<SplitterPanelProps>>,
  sizes: SplitterSize[] | undefined,
  defaultSizes: SplitterSize[] | undefined,
) {
  return panels.map((panel, index) => {
    const propSize = panel.props.size;
    const defaultSize = panel.props.defaultSize;

    return (
      sizes?.[index] ??
      propSize ??
      defaultSizes?.[index] ??
      defaultSize ??
      "1fr"
    );
  });
}

function clampNumericSize(
  value: SplitterSize,
  min: SplitterSize | undefined,
  max: SplitterSize | undefined,
) {
  if (typeof value !== "number") return value;

  const withMin = typeof min === "number" ? Math.max(min, value) : value;
  return typeof max === "number" ? Math.min(max, withMin) : withMin;
}

function nextSize(size: SplitterSize, delta: number) {
  if (typeof size === "number") return Math.max(0, size + delta);
  return 120 + delta;
}

const SplitterPanel = forwardRef<HTMLDivElement, SplitterPanelProps>(
  (props, ref) => {
    const { children, className, collapsed, defaultCollapsed, style } = props;
    const domProps = { ...props };
    delete domProps.children;
    delete domProps.className;
    delete domProps.collapsed;
    delete domProps.collapsible;
    delete domProps.defaultCollapsed;
    delete domProps.defaultSize;
    delete domProps.max;
    delete domProps.min;
    delete domProps.onCollapse;
    delete domProps.resizable;
    delete domProps.size;
    delete domProps.style;

    return (
      <div
        {...domProps}
        ref={ref}
        className={getSplitterPanelClasses({
          collapsed: collapsed ?? defaultCollapsed,
          className,
        })}
        style={style}
      >
        {children}
      </div>
    );
  },
);

SplitterPanel.displayName = "Splitter.Panel";

const SplitterRoot = forwardRef<HTMLDivElement, SplitterProps>(
  (
    {
      children,
      className,
      defaultSizes,
      layout = "horizontal",
      onResize,
      sizes,
      style,
      ...props
    },
    ref,
  ) => {
    const panels = useMemo(
      () => React.Children.toArray(children).filter(isPanelElement),
      [children],
    );
    const controlled = sizes !== undefined;
    const [internalSizes, setInternalSizes] = useState(() =>
      getInitialSizes(panels, sizes, defaultSizes),
    );
    const [collapsedIndexes, setCollapsedIndexes] = useState(() =>
      panels.map((panel) => panel.props.defaultCollapsed ?? false),
    );
    const mergedSizes = controlled ? sizes : internalSizes;
    const isHorizontal = layout === "horizontal";

    function commitSizes(nextSizes: SplitterSize[]) {
      if (!controlled) {
        setInternalSizes(nextSizes);
      }

      onResize?.(nextSizes, { sizes: nextSizes });
    }

    function resizeAt(index: number, direction: 1 | -1) {
      const panel = panels[index];
      const nextPanel = panels[index + 1];

      if (
        panel.props.resizable === false ||
        nextPanel?.props.resizable === false
      ) {
        return;
      }

      const delta = direction * 16;
      const nextSizes = [...mergedSizes];
      nextSizes[index] = clampNumericSize(
        nextSize(nextSizes[index], delta),
        panel.props.min,
        panel.props.max,
      );

      if (nextSizes[index + 1] !== undefined) {
        nextSizes[index + 1] = clampNumericSize(
          nextSize(nextSizes[index + 1], -delta),
          nextPanel.props.min,
          nextPanel.props.max,
        );
      }

      commitSizes(nextSizes);
    }

    function toggleCollapse(index: number) {
      const panel = panels[index];
      const nextCollapsed = !(panel.props.collapsed ?? collapsedIndexes[index]);
      const nextCollapsedIndexes = [...collapsedIndexes];
      nextCollapsedIndexes[index] = nextCollapsed;
      setCollapsedIndexes(nextCollapsedIndexes);
      panel.props.onCollapse?.(nextCollapsed);
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getSplitterClasses({ layout, className })}
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          ...style,
        }}
      >
        {panels.map((panel, index) => {
          const collapsed = panel.props.collapsed ?? collapsedIndexes[index];
          const size = collapsed ? 0 : mergedSizes[index];
          const panelStyle: CSSProperties = {
            [isHorizontal ? "width" : "height"]: toCssSize(size),
            [isHorizontal ? "minWidth" : "minHeight"]: collapsed
              ? 0
              : toCssSize(panel.props.min),
            [isHorizontal ? "maxWidth" : "maxHeight"]: toCssSize(
              panel.props.max,
            ),
            flex:
              typeof size === "number" || collapsed
                ? `0 0 ${toCssSize(size)}`
                : size,
            ...panel.props.style,
          };
          const handleDisabled =
            panel.props.resizable === false ||
            panels[index + 1]?.props.resizable === false;

          return (
            <React.Fragment key={panel.key ?? index}>
              {React.cloneElement(panel, {
                className: panel.props.className,
                collapsed,
                style: panelStyle,
              })}
              {index < panels.length - 1 ? (
                <span
                  className={getSplitterHandleClasses({
                    disabled: handleDisabled,
                  })}
                >
                  <button
                    type="button"
                    aria-label="Resize previous panel smaller"
                    disabled={handleDisabled}
                    onClick={() => resizeAt(index, -1)}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    aria-label="Resize previous panel larger"
                    disabled={handleDisabled}
                    onClick={() => resizeAt(index, 1)}
                  >
                    +
                  </button>
                  {panel.props.collapsible ? (
                    <button
                      type="button"
                      aria-label={collapsed ? "Expand panel" : "Collapse panel"}
                      onClick={() => toggleCollapse(index)}
                    >
                      {collapsed ? ">" : "<"}
                    </button>
                  ) : null}
                </span>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    );
  },
) as SplitterComponent;

SplitterRoot.displayName = "Splitter";
SplitterRoot.Panel = SplitterPanel;

export const Splitter = SplitterRoot;
