import type {
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";
import type {
  SplitterPanelComponent,
  SplitterPanelProps,
  SplitterProps,
  SplitterSize,
} from "../splitter/Splitter.types";

export interface DmSplitterPersistenceAdapter {
  fetch: (
    key: string,
  ) => Promise<SplitterSize[] | { sizes?: SplitterSize[] } | null>;
  update: (key: string, data: { sizes: SplitterSize[] }) => Promise<unknown>;
}

export interface DmSplitterPersistence {
  persistenceKey: string;
  persistenceType?: "localStorage" | DmSplitterPersistenceAdapter;
}

export interface DmSplitterProps extends Omit<
  SplitterProps,
  "sizes" | "defaultSizes" | "onResize"
> {
  children: ReactNode;
  sizes?: SplitterSize[];
  defaultSizes?: SplitterSize[];
  persistence?: DmSplitterPersistence;
  gap?: number | string;
  collapseBarOffsetTop?: string;
  min?: SplitterSize[];
  max?: SplitterSize[];
  resettable?: boolean;
  resetLabel?: ReactNode;
  onResize?: (sizes: SplitterSize[]) => void;
}

export type DmSplitterPanelProps = SplitterPanelProps;

export type DmSplitterComponent = ForwardRefExoticComponent<
  DmSplitterProps & RefAttributes<HTMLDivElement>
> & {
  Panel: SplitterPanelComponent;
};

export type DmSplitterElement = ReactElement<DmSplitterProps>;
