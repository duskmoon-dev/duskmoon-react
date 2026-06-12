import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  anchorLinkTitleClass,
  anchorListClass,
  getAnchorClasses,
  getAnchorInkClasses,
  getAnchorLinkClasses,
} from "../../classes/anchor";
import type {
  AnchorComponent,
  AnchorItem,
  AnchorLinkProps,
  AnchorProps,
} from "./Anchor.types";

interface AnchorContextValue {
  activeHref: string;
  registerHref: (href: string) => void;
  unregisterHref: (href: string) => void;
  setActiveHref: (href: string) => void;
  onClick?: AnchorProps["onClick"];
}

const AnchorContext = createContext<AnchorContextValue | null>(null);

function getDefaultContainer() {
  return typeof window === "undefined" ? undefined : window;
}

function getCurrentHash() {
  return typeof window === "undefined" ? "" : window.location.hash;
}

function getElementFromHref(href: string) {
  if (typeof document === "undefined" || !href.startsWith("#")) {
    return null;
  }

  const id = decodeURIComponent(href.slice(1));
  return id ? document.getElementById(id) : null;
}

function getTargetTop(container: Window | HTMLElement | undefined) {
  if (!container) {
    return 0;
  }

  if (typeof window !== "undefined" && container === window) {
    return 0;
  }

  return (container as HTMLElement).getBoundingClientRect().top;
}

function normalizeActiveHref(
  href: string,
  getCurrentAnchor: AnchorProps["getCurrentAnchor"],
) {
  return getCurrentAnchor ? getCurrentAnchor(href) : href;
}

function renderItems(items: AnchorItem[]) {
  return items.map((item) => (
    <AnchorLink
      key={item.key ?? item.href}
      href={item.href}
      title={item.title}
      target={item.target}
    >
      {item.children?.length ? renderItems(item.children) : null}
    </AnchorLink>
  ));
}

export const AnchorLink = forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  ({ href, title, target, children, className, onAuxClick, ...props }, ref) => {
    const context = useContext(AnchorContext);
    const active = context?.activeHref === href;

    useEffect(() => {
      context?.registerHref(href);
      return () => context?.unregisterHref(href);
    }, [context, href]);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
      context?.setActiveHref(href);
      context?.onClick?.(event, { href, title });
      props.onClick?.(event);
    }

    return (
      <div className={getAnchorLinkClasses({ active, className })}>
        <a
          {...props}
          ref={ref}
          className={anchorLinkTitleClass}
          href={href}
          target={target}
          aria-current={active ? "location" : undefined}
          onClick={handleClick}
          onAuxClick={onAuxClick}
        >
          {title}
        </a>
        {children ? <div className={anchorListClass}>{children}</div> : null}
      </div>
    );
  },
);

AnchorLink.displayName = "Anchor.Link";

export const Anchor = forwardRef<HTMLElement, AnchorProps>(
  (
    {
      items,
      children,
      targetOffset,
      bounds = 5,
      offsetTop,
      getContainer,
      getCurrentAnchor,
      affix,
      showInkInFixed,
      onClick,
      onChange,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const hrefsRef = useRef<string[]>([]);
    const [activeHref, setActiveHrefState] = useState(() =>
      normalizeActiveHref(getCurrentHash(), getCurrentAnchor),
    );

    const setActiveHref = useCallback(
      (nextHref: string) => {
        const normalized = normalizeActiveHref(nextHref, getCurrentAnchor);

        setActiveHrefState((previous) => {
          if (previous !== normalized) {
            onChange?.(normalized);
          }

          return normalized;
        });
      },
      [getCurrentAnchor, onChange],
    );

    const context = useMemo<AnchorContextValue>(
      () => ({
        activeHref,
        onClick,
        registerHref: (href) => {
          if (!hrefsRef.current.includes(href)) {
            hrefsRef.current = [...hrefsRef.current, href];
          }
        },
        unregisterHref: (href) => {
          hrefsRef.current = hrefsRef.current.filter((item) => item !== href);
        },
        setActiveHref,
      }),
      [activeHref, onClick, setActiveHref],
    );

    useEffect(() => {
      function handleHashChange() {
        setActiveHref(getCurrentHash());
      }

      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }, [setActiveHref]);

    useEffect(() => {
      const container = getContainer?.() ?? getDefaultContainer();
      if (!container) {
        return undefined;
      }

      function handleScroll() {
        const threshold = targetOffset ?? offsetTop ?? 0;
        const containerTop = getTargetTop(container);
        const nextHref = hrefsRef.current.reduce((current, href) => {
          const element = getElementFromHref(href);
          if (!element) {
            return current;
          }

          const top = element.getBoundingClientRect().top - containerTop;
          return top <= threshold + bounds ? href : current;
        }, "");

        if (nextHref) {
          setActiveHref(nextHref);
        }
      }

      handleScroll();
      container.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);

      return () => {
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, [bounds, getContainer, offsetTop, setActiveHref, targetOffset]);

    const fixed = affix !== false;

    return (
      <nav
        {...props}
        ref={ref}
        className={getAnchorClasses({ fixed, className })}
        style={{
          position: fixed ? "fixed" : undefined,
          top: fixed ? offsetTop : undefined,
          ...style,
        }}
      >
        {showInkInFixed || !fixed ? (
          <span
            className={getAnchorInkClasses({ visible: Boolean(activeHref) })}
            aria-hidden="true"
          />
        ) : null}
        <div className={anchorListClass}>
          <AnchorContext.Provider value={context}>
            {items ? renderItems(items) : children}
          </AnchorContext.Provider>
        </div>
      </nav>
    );
  },
) as AnchorComponent;

Anchor.displayName = "Anchor";
Anchor.Link = AnchorLink;
