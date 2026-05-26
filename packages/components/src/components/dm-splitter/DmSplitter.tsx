import React, {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  dmSplitterInnerClass,
  dmSplitterResetClass,
  getDmSplitterClasses,
} from "../../classes/dm-splitter";
import { Splitter } from "../splitter";
import type {
  SplitterPanelProps,
  SplitterSize,
} from "../splitter/Splitter.types";
import type {
  DmSplitterComponent,
  DmSplitterPersistence,
  DmSplitterProps,
} from "./DmSplitter.types";

function storageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readLocalSizes(key: string): SplitterSize[] | undefined {
  if (!storageAvailable()) return undefined;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null");
    if (Array.isArray(parsed)) return parsed as SplitterSize[];
    if (Array.isArray(parsed?.sizes)) return parsed.sizes as SplitterSize[];
  } catch {
    return undefined;
  }

  return undefined;
}

function writeLocalSizes(key: string, sizes: SplitterSize[]) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(key, JSON.stringify({ sizes }));
}

function removeLocalSizes(key: string) {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(key);
}

function sizesFromAdapterPayload(
  payload: SplitterSize[] | { sizes?: SplitterSize[] } | null,
) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.sizes)) return payload.sizes;
  return undefined;
}

function panelDefaults(children: React.ReactNode, fallback?: SplitterSize[]) {
  return Children.toArray(children)
    .filter(isValidElement<SplitterPanelProps>)
    .map((child, index) =>
      fallback?.[index] ??
      child.props.size ??
      child.props.defaultSize ??
      "1fr",
    );
}

function withIndexedBounds(
  children: React.ReactNode,
  min?: SplitterSize[],
  max?: SplitterSize[],
) {
  if (!min && !max) return children;

  return Children.map(children, (child, index) => {
    if (!isValidElement<SplitterPanelProps>(child)) return child;

    return React.cloneElement(child, {
      min: child.props.min ?? min?.[index],
      max: child.props.max ?? max?.[index],
    });
  });
}

function persistenceKey(persistence?: DmSplitterPersistence) {
  return persistence?.persistenceKey;
}

const DmSplitterRoot = forwardRef<HTMLDivElement, DmSplitterProps>(
  (
    {
      children,
      className,
      style,
      layout = "horizontal",
      sizes,
      defaultSizes,
      persistence,
      gap = 0,
      collapseBarOffsetTop,
      min,
      max,
      resettable,
      resetLabel = "Reset",
      onResize,
      ...props
    },
    ref,
  ) => {
    const key = persistenceKey(persistence);
    const [persistedSizes, setPersistedSizes] = useState<SplitterSize[] | undefined>(
      () => (key ? readLocalSizes(key) : undefined),
    );
    const initialSizes = useMemo(
      () => panelDefaults(children, defaultSizes),
      [children, defaultSizes],
    );
    const mergedSizes = sizes ?? persistedSizes;
    const hasPersistence = Boolean(key);
    const shouldRenderReset = resettable ?? hasPersistence;
    const gapValue = typeof gap === "number" ? `${gap}px` : gap;

    useEffect(() => {
      if (!key || persistence?.persistenceType === "localStorage") return;
      if (!persistence?.persistenceType) return;

      let active = true;

      void persistence.persistenceType.fetch(key).then((payload) => {
        if (!active) return;
        const nextSizes = sizesFromAdapterPayload(payload);
        if (nextSizes) setPersistedSizes(nextSizes);
      });

      return () => {
        active = false;
      };
    }, [key, persistence?.persistenceType]);

    function persist(nextSizes: SplitterSize[]) {
      if (!key || sizes !== undefined) return;

      setPersistedSizes(nextSizes);

      if (!persistence?.persistenceType || persistence.persistenceType === "localStorage") {
        writeLocalSizes(key, nextSizes);
        return;
      }

      void persistence.persistenceType.update(key, { sizes: nextSizes });
    }

    function handleResize(nextSizes: SplitterSize[]) {
      persist(nextSizes);
      onResize?.(nextSizes);
    }

    function handleReset() {
      if (key && (!persistence?.persistenceType || persistence.persistenceType === "localStorage")) {
        removeLocalSizes(key);
      }

      setPersistedSizes(initialSizes);
      onResize?.(initialSizes);
    }

    const wrapperStyle: CSSProperties = {
      "--dm-splitter-gap": gapValue,
      "--dm-splitter-collapse-offset-top": collapseBarOffsetTop,
      gap: gapValue,
      ...style,
    } as CSSProperties;

    return (
      <div
        className={getDmSplitterClasses({
          layout,
          persisted: hasPersistence,
          className,
        })}
        style={wrapperStyle}
      >
        {shouldRenderReset ? (
          <button
            type="button"
            className={dmSplitterResetClass}
            onClick={handleReset}
          >
            {resetLabel}
          </button>
        ) : null}
        <Splitter
          {...props}
          ref={ref}
          layout={layout}
          sizes={mergedSizes}
          defaultSizes={defaultSizes}
          onResize={handleResize}
          className={dmSplitterInnerClass}
        >
          {withIndexedBounds(children, min, max)}
        </Splitter>
      </div>
    );
  },
) as DmSplitterComponent;

DmSplitterRoot.displayName = "DmSplitter";
DmSplitterRoot.Panel = Splitter.Panel;

export const DmSplitter = DmSplitterRoot;
export default DmSplitter;

