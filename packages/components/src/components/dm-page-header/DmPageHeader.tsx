import React, { useMemo } from "react";
import {
  dmPageHeaderBackClass,
  dmPageHeaderBodyClass,
  dmPageHeaderBreadcrumbClass,
  dmPageHeaderContentClass,
  dmPageHeaderDividerClass,
  dmPageHeaderExtraClass,
  dmPageHeaderMainClass,
  dmPageHeaderTitleClass,
  dmPageHeaderTitleItemClass,
  dmPageHeaderTitleListClass,
  getDmPageHeaderClasses,
} from "../../classes/dm-page-header";
import { Breadcrumb } from "../breadcrumb";
import { DmToolbar } from "../dm-toolbar";
import type { DmToolbarProps } from "../dm-toolbar/DmToolbar.types";
import type {
  DmPageHeaderProps,
  DmPageHeaderTitleItem,
} from "./DmPageHeader.types";

function isTitleList(
  title: DmPageHeaderProps["title"],
): title is DmPageHeaderTitleItem[] {
  return Array.isArray(title);
}

function isToolbarProps(
  extra: DmPageHeaderProps["extra"],
): extra is DmToolbarProps {
  return Boolean(
    extra &&
    typeof extra === "object" &&
    !React.isValidElement(extra) &&
    "items" in extra,
  );
}

export function DmPageHeader({
  backClick,
  onBack,
  title,
  extra,
  breadcrumb,
  className,
  style,
  children,
  titleSeparator = ":",
  backIcon = "<",
}: DmPageHeaderProps) {
  const handleBack = onBack ?? backClick;
  const hasExtra = extra !== undefined && extra !== null;
  const titleNode = useMemo(() => {
    if (isTitleList(title)) {
      return (
        <div className={dmPageHeaderTitleListClass}>
          {title.map((item, index) => (
            <div key={index} className={dmPageHeaderTitleItemClass}>
              <span>{item.title}</span>
              <span>{titleSeparator}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      );
    }

    return title === undefined || title === null ? null : (
      <span title={typeof title === "string" ? title : undefined}>{title}</span>
    );
  }, [title, titleSeparator]);

  return (
    <section
      className={getDmPageHeaderClasses({ hasExtra, className })}
      style={style}
    >
      {breadcrumb ? (
        <div className={dmPageHeaderBreadcrumbClass}>
          <Breadcrumb {...breadcrumb} />
        </div>
      ) : null}
      <div className={dmPageHeaderMainClass}>
        {handleBack ? (
          <>
            <button
              type="button"
              className={dmPageHeaderBackClass}
              aria-label="Back"
              onClick={handleBack}
            >
              {backIcon}
            </button>
            <span className={dmPageHeaderDividerClass} aria-hidden="true" />
          </>
        ) : null}
        <div className={dmPageHeaderContentClass}>
          <div className={dmPageHeaderTitleClass}>{titleNode}</div>
          {hasExtra ? (
            <div className={dmPageHeaderExtraClass}>
              {isToolbarProps(extra) ? <DmToolbar {...extra} /> : extra}
            </div>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className={dmPageHeaderBodyClass}>{children}</div>
      ) : null}
    </section>
  );
}

DmPageHeader.displayName = "DmPageHeader";
