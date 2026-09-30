import type { RefAttributes } from "react";
import type { DmSearchItem, DmSearchProps, DmSearchRef } from "../dm-search";

export type DmQueryItem = {
  key: string;
  type: DmSearchItem["search"]["type"];
  label: string;
  name: string;
  extraProps?: Record<string, unknown>;
  customProps?: Record<string, unknown>;
};

export interface DmQueryRef extends DmSearchRef {
  retractChange: (value: string, data?: DmQueryItem[]) => void;
}

export interface DmQueryProps
  extends
    Omit<DmSearchProps, "items" | "fastFilterItem" | "ref">,
    RefAttributes<DmQueryRef> {
  queryItem: DmQueryItem[];
  fastFilterItem?: DmQueryItem;
  collapsed?: boolean;
  form?: unknown;
  onReset?: () => void;
}
