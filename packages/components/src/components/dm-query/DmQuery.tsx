import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { DmSearch } from "../dm-search";
import type { DmSearchItem, DmSearchRef } from "../dm-search";
import type { DmQueryItem, DmQueryProps, DmQueryRef } from "./DmQuery.types";

function toSearchItem(item: DmQueryItem): DmSearchItem {
  return {
    key: item.key,
    title: item.label,
    dataIndex: item.name,
    search: {
      type: item.type,
      extraProps: item.extraProps,
      formProps: item.customProps,
    },
  };
}

export const DmQuery = forwardRef<DmQueryRef, DmQueryProps>(
  (
    {
      queryItem,
      fastFilterItem,
      collapsed = false,
      onReset,
      onSearch,
      ...props
    },
    ref,
  ) => {
    const searchRef = useRef<DmSearchRef>(null);
    const [selectedItem, setSelectedItem] = useState<DmQueryItem | undefined>(
      queryItem[0],
    );
    const items = selectedItem
      ? [toSearchItem(selectedItem)]
      : queryItem.map(toSearchItem);

    useImperativeHandle(ref, () => ({
      onReset: () => searchRef.current?.onReset(),
      retractChange: (value, data = queryItem) => {
        setSelectedItem(
          data.find((item) => item.name === value || item.key === value),
        );
      },
    }));

    return (
      <DmSearch
        {...props}
        ref={searchRef}
        defaultCollapsed={collapsed}
        items={collapsed ? queryItem.map(toSearchItem) : items}
        fastFilterItem={
          fastFilterItem ? toSearchItem(fastFilterItem) : undefined
        }
        onSearch={onSearch}
        extra={
          <>
            {props.extra}
            <button
              type="button"
              hidden
              onClick={() => {
                searchRef.current?.onReset();
                onReset?.();
              }}
            />
          </>
        }
      />
    );
  },
);

DmQuery.displayName = "DmQuery";
