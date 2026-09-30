import React, { forwardRef } from "react";
import {
  dmDrawerFooterActionClass,
  getDmDrawerClasses,
  getDmDrawerFooterClasses,
} from "../../classes/dm-drawer";
import { Button } from "../button";
import { Drawer } from "../drawer";
import type { DmDrawerProps } from "./DmDrawer.types";

function renderFooter({
  footer,
  footerText,
  submitText,
  submitProps,
  submitLoading,
  submitDisabled,
  footerAlign,
  onSubmit,
}: Pick<
  DmDrawerProps,
  | "footer"
  | "footerText"
  | "submitText"
  | "submitProps"
  | "submitLoading"
  | "submitDisabled"
  | "footerAlign"
  | "onSubmit"
>) {
  if (footer !== undefined) return footer;

  const label = submitText ?? footerText;
  if (label === undefined || label === null || label === false)
    return undefined;

  return (
    <div className={getDmDrawerFooterClasses({ align: footerAlign })}>
      <Button
        {...submitProps}
        className={dmDrawerFooterActionClass}
        color={submitProps?.color ?? "primary"}
        appearance={submitProps?.appearance ?? "filled"}
        isLoading={submitLoading ?? submitProps?.isLoading}
        disabled={submitDisabled ?? submitProps?.disabled}
        onClick={onSubmit}
      >
        {label}
      </Button>
    </div>
  );
}

export const DmDrawer = forwardRef<HTMLElement, DmDrawerProps>(
  (
    {
      placement = "right",
      closeIcon = "x",
      footer,
      footerText,
      submitText,
      submitProps,
      submitLoading,
      submitDisabled,
      footerAlign = "right",
      onSubmit,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Drawer
        {...props}
        ref={ref}
        placement={placement}
        closeIcon={closeIcon}
        className={getDmDrawerClasses({ className })}
        footer={renderFooter({
          footer,
          footerText,
          submitText,
          submitProps,
          submitLoading,
          submitDisabled,
          footerAlign,
          onSubmit,
        })}
      />
    );
  },
);

DmDrawer.displayName = "DmDrawer";
