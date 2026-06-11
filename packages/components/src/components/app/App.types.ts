import type {
  ComponentProps,
  Context,
  ElementType,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";
import type { MessageApi } from "../message";
import type { ModalComponent } from "../modal";
import type { NotificationApi } from "../notification";

export interface AppInstance {
  message: MessageApi;
  notification: NotificationApi;
  modal: ModalComponent;
}

export type AppContextValue = AppInstance;

export interface AppProps extends Omit<
  ComponentProps<"div">,
  "children" | "className"
> {
  children?: ReactNode;
  className?: string;
  component?: false | ElementType;
  message?: {
    maxCount?: number;
    duration?: number;
  };
  notification?: {
    maxCount?: number;
    duration?: number | null;
  };
}

export interface AppComponent extends ForwardRefExoticComponent<
  AppProps & RefAttributes<HTMLElement>
> {
  useApp: () => AppInstance;
  Context: Context<AppContextValue>;
}
