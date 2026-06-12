import { cn } from "../utils";

export const transferBaseClass = "transfer";
export const transferDisabledClass = "transfer-disabled";
export const transferListClass = "transfer-list";
export const transferListHeaderClass = "transfer-list-header";
export const transferListBodyClass = "transfer-list-body";
export const transferListItemClass = "transfer-list-item";
export const transferListItemSelectedClass = "transfer-list-item-selected";
export const transferListItemDisabledClass = "transfer-list-item-disabled";
export const transferListItemContentClass = "transfer-list-item-content";
export const transferListItemDescriptionClass =
  "transfer-list-item-description";
export const transferListEmptyClass = "transfer-list-empty";
export const transferSearchClass = "transfer-search";
export const transferOperationClass = "transfer-operation";
export const transferOperationButtonClass = "transfer-operation-button";
export const transferPaginationClass = "transfer-pagination";
export const transferPaginationButtonClass = "transfer-pagination-button";

export function getTransferClasses({
  disabled,
  oneWay,
  className,
}: {
  disabled?: boolean;
  oneWay?: boolean;
  className?: string;
}) {
  return cn(
    transferBaseClass,
    disabled && transferDisabledClass,
    oneWay && "transfer-one-way",
    className,
  );
}

export function getTransferListClasses({
  direction,
  className,
}: {
  direction: "left" | "right";
  className?: string;
}) {
  return cn(transferListClass, `transfer-list-${direction}`, className);
}

export function getTransferListItemClasses({
  selected,
  disabled,
  className,
}: {
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    transferListItemClass,
    selected && transferListItemSelectedClass,
    disabled && transferListItemDisabledClass,
    className,
  );
}
