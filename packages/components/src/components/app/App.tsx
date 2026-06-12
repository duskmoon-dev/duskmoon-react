import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  appHolderClass,
  getAppClasses,
  getAppRootClasses,
} from "../../classes/app";
import { message as staticMessage } from "../message";
import { Modal } from "../modal";
import { useNotification } from "../notification";
import type { AppComponent, AppContextValue, AppProps } from "./App.types";

const fallbackContext: AppContextValue = {
  message: staticMessage,
  notification: {
    open: () => undefined,
    success: () => undefined,
    info: () => undefined,
    warning: () => undefined,
    error: () => undefined,
    close: () => undefined,
    destroy: () => undefined,
  },
  modal: Modal,
};

export const AppContext = createContext<AppContextValue>(fallbackContext);

const AppBase = forwardRef<HTMLElement, AppProps>(
  (
    {
      children,
      className,
      component: Component = "div",
      message: messageConfig,
      notification: notificationConfig,
      ...props
    },
    ref,
  ) => {
    const [messageApi, messageHolder] = staticMessage.useMessage();
    const [notificationApi, notificationHolder] =
      useNotification(notificationConfig);
    const contextValue = useMemo<AppContextValue>(
      () => ({
        message: messageApi,
        notification: notificationApi,
        modal: Modal,
      }),
      [messageApi, notificationApi],
    );

    useEffect(() => {
      if (messageConfig) {
        messageApi.config(messageConfig);
      }
    }, [messageApi, messageConfig]);

    const content = (
      <AppContext.Provider value={contextValue}>
        {children}
        <div className={appHolderClass}>
          {messageHolder}
          {notificationHolder}
        </div>
      </AppContext.Provider>
    );

    if (Component === false) {
      return content;
    }

    const Root = Component;

    return (
      <Root {...props} ref={ref} className={getAppClasses({ className })}>
        {content}
      </Root>
    );
  },
);

AppBase.displayName = "App";

export const App = AppBase as AppComponent;
App.Context = AppContext;
App.useApp = () => useContext(AppContext);

export function AppRoot({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} className={getAppRootClasses({ className })} />;
}
