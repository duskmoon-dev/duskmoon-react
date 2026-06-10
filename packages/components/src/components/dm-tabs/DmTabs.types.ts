import type { TabsItem, TabsProps } from "../tabs/Tabs.types";

export interface DmTabsItem extends TabsItem {
  path?: string;
}

export interface DmTabsProps extends Omit<TabsProps, "items"> {
  items: DmTabsItem[];
  transparentCard?: boolean;
  optionTree?: boolean;
  destroyOnHidden?: boolean;
}
