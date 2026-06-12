import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  getNotificationHolderClasses,
  getNotificationNoticeClasses,
  notificationActionsClass,
  notificationCloseClass,
  notificationContentClass,
  notificationDescriptionClass,
  notificationIconClass,
  notificationMessageClass,
  notificationRootClass,
} from "../../classes/notification";
import type {
  NotificationApi,
  NotificationArgsProps,
  NotificationConfig,
  NotificationKey,
  NotificationPlacement,
  NotificationStaticApi,
  NotificationType,
} from "./Notification.types";

interface Notice extends NotificationArgsProps {
  key: NotificationKey;
  placement: NotificationPlacement;
  type: NotificationType;
}

type Listener = (notices: Notice[], config: NotificationConfig) => void;

const defaultConfig: Required<
  Pick<NotificationConfig, "placement" | "duration">
> &
  NotificationConfig = {
  placement: "topRight",
  duration: 4.5,
};

const defaultIcons: Record<NotificationType, ReactNode> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "!",
};

let globalConfig: NotificationConfig = { ...defaultConfig };
let globalNotices: Notice[] = [];
let globalCounter = 0;
let globalContainer: HTMLElement | null = null;
let globalRoot: Root | null = null;
const globalTimers = new Map<NotificationKey, ReturnType<typeof setTimeout>>();
const listeners = new Set<Listener>();

function getKey(key?: NotificationKey): NotificationKey {
  if (key !== undefined) {
    return key;
  }

  globalCounter += 1;
  return `notification-${globalCounter}`;
}

function getDuration(
  config: NotificationArgsProps,
  holderConfig: NotificationConfig,
) {
  return config.duration ?? holderConfig.duration ?? defaultConfig.duration;
}

function getPlacement(
  config: NotificationArgsProps,
  holderConfig: NotificationConfig,
) {
  return config.placement ?? holderConfig.placement ?? defaultConfig.placement;
}

function applyMaxCount(notices: Notice[], maxCount?: number) {
  if (!maxCount || notices.length <= maxCount) {
    return notices;
  }

  return notices.slice(notices.length - maxCount);
}

function groupByPlacement(notices: Notice[]) {
  return notices.reduce<Record<NotificationPlacement, Notice[]>>(
    (groups, notice) => {
      groups[notice.placement].push(notice);
      return groups;
    },
    {
      top: [],
      topLeft: [],
      topRight: [],
      bottom: [],
      bottomLeft: [],
      bottomRight: [],
    },
  );
}

function clearTimer(key: NotificationKey) {
  const timer = globalTimers.get(key);

  if (timer) {
    clearTimeout(timer);
    globalTimers.delete(key);
  }
}

function emitGlobal() {
  for (const listener of listeners) {
    listener(globalNotices, globalConfig);
  }

  renderGlobalHolder();
}

function ensureGlobalRoot() {
  if (typeof document === "undefined") {
    return;
  }

  if (globalRoot && globalContainer?.isConnected) {
    return;
  }

  const container = globalConfig.getContainer?.() ?? document.body;
  globalContainer = document.createElement("div");
  globalContainer.className = notificationRootClass;
  container.appendChild(globalContainer);
  globalRoot = createRoot(globalContainer);
}

function renderGlobalHolder() {
  if (globalNotices.length === 0 && globalRoot && globalContainer) {
    globalRoot.render(null);
    return;
  }

  ensureGlobalRoot();
  globalRoot?.render(
    <NotificationHolder
      notices={globalNotices}
      config={globalConfig}
      onClose={(key) => globalApi.close(key)}
    />,
  );
}

function closeGlobal(key: NotificationKey) {
  const notice = globalNotices.find((item) => item.key === key);
  clearTimer(key);
  globalNotices = globalNotices.filter((item) => item.key !== key);
  notice?.onClose?.();
  emitGlobal();
}

function destroyGlobal(key?: NotificationKey) {
  if (key !== undefined) {
    closeGlobal(key);
    return;
  }

  for (const notice of globalNotices) {
    clearTimer(notice.key);
    notice.onClose?.();
  }

  globalNotices = [];
  emitGlobal();
}

function openGlobal(config: NotificationArgsProps) {
  const key = getKey(config.key);
  const notice: Notice = {
    ...config,
    key,
    placement: getPlacement(config, globalConfig),
    type: config.type ?? "info",
  };

  clearTimer(key);
  globalNotices = applyMaxCount(
    [...globalNotices.filter((item) => item.key !== key), notice],
    globalConfig.maxCount,
  );

  const duration = getDuration(config, globalConfig);
  if (duration && duration > 0) {
    globalTimers.set(
      key,
      setTimeout(() => closeGlobal(key), duration * 1000),
    );
  }

  emitGlobal();
}

function withType(type: NotificationType, config: NotificationArgsProps) {
  openGlobal({ ...config, type });
}

const globalApi: NotificationStaticApi = {
  open: openGlobal,
  success: (config) => withType("success", config),
  info: (config) => withType("info", config),
  warning: (config) => withType("warning", config),
  error: (config) => withType("error", config),
  close: closeGlobal,
  destroy: destroyGlobal,
  config: (config) => {
    globalConfig = { ...globalConfig, ...config };
    emitGlobal();
  },
  useNotification,
};

function NotificationHolder({
  notices,
  config,
  onClose,
}: {
  notices: Notice[];
  config: NotificationConfig;
  onClose: (key: NotificationKey) => void;
}) {
  const groups = groupByPlacement(notices);

  return (
    <>
      {Object.entries(groups).map(([placement, group]) => {
        if (group.length === 0) {
          return null;
        }

        const offsetStyle =
          placement.startsWith("bottom") && config.bottom !== undefined
            ? { bottom: config.bottom }
            : config.top !== undefined
              ? { top: config.top }
              : undefined;

        return (
          <div
            key={placement}
            className={getNotificationHolderClasses({
              placement: placement as NotificationPlacement,
            })}
            style={offsetStyle}
          >
            {group.map((notice) => (
              <NotificationNotice
                key={notice.key}
                notice={notice}
                fallbackCloseIcon={config.closeIcon}
                onClose={onClose}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

function NotificationNotice({
  notice,
  fallbackCloseIcon,
  onClose,
}: {
  notice: Notice;
  fallbackCloseIcon?: ReactNode;
  onClose: (key: NotificationKey) => void;
}) {
  const closeIcon = notice.closeIcon ?? fallbackCloseIcon ?? "x";
  const icon = notice.icon ?? defaultIcons[notice.type];
  const clickableProps = notice.onClick
    ? {
        tabIndex: 0,
        onClick: notice.onClick,
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            notice.onClick?.();
          }
        },
      }
    : undefined;

  return (
    <div
      role={notice.role ?? "alert"}
      className={getNotificationNoticeClasses({
        type: notice.type,
        className: notice.className,
      })}
      style={notice.style}
      {...clickableProps}
    >
      {icon ? <span className={notificationIconClass}>{icon}</span> : null}
      <span className={notificationContentClass}>
        <span className={notificationMessageClass}>{notice.message}</span>
        {notice.description ? (
          <span className={notificationDescriptionClass}>
            {notice.description}
          </span>
        ) : null}
        {notice.btn ? (
          <span className={notificationActionsClass}>{notice.btn}</span>
        ) : null}
      </span>
      {closeIcon === null ? null : (
        <button
          type="button"
          className={notificationCloseClass}
          aria-label="Close notification"
          onClick={(event) => {
            event.stopPropagation();
            onClose(notice.key);
          }}
        >
          {closeIcon}
        </button>
      )}
    </div>
  );
}

function createScopedApi({
  holderConfig,
  setNotices,
  timerMap,
}: {
  holderConfig: NotificationConfig;
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  timerMap: Map<NotificationKey, ReturnType<typeof setTimeout>>;
}): NotificationApi {
  function clearScopedTimer(key: NotificationKey) {
    const timer = timerMap.get(key);

    if (timer) {
      clearTimeout(timer);
      timerMap.delete(key);
    }
  }

  function close(key: NotificationKey) {
    clearScopedTimer(key);
    setNotices((current) => {
      const notice = current.find((item) => item.key === key);
      notice?.onClose?.();
      return current.filter((item) => item.key !== key);
    });
  }

  function open(config: NotificationArgsProps) {
    const key = getKey(config.key);
    const notice: Notice = {
      ...config,
      key,
      placement: getPlacement(config, holderConfig),
      type: config.type ?? "info",
    };

    clearScopedTimer(key);
    setNotices((current) =>
      applyMaxCount(
        [...current.filter((item) => item.key !== key), notice],
        holderConfig.maxCount,
      ),
    );

    const duration = getDuration(config, holderConfig);
    if (duration && duration > 0) {
      timerMap.set(
        key,
        setTimeout(() => close(key), duration * 1000),
      );
    }
  }

  function typed(type: NotificationType, config: NotificationArgsProps) {
    open({ ...config, type });
  }

  return {
    open,
    success: (config) => typed("success", config),
    info: (config) => typed("info", config),
    warning: (config) => typed("warning", config),
    error: (config) => typed("error", config),
    close,
    destroy: (key) => {
      if (key !== undefined) {
        close(key);
        return;
      }

      for (const timerKey of timerMap.keys()) {
        clearScopedTimer(timerKey);
      }

      setNotices((current) => {
        for (const notice of current) {
          notice.onClose?.();
        }

        return [];
      });
    },
  };
}

export function useNotification(
  config: NotificationConfig = {},
): [NotificationApi, ReactNode] {
  const holderConfig = useMemo(
    () => ({
      ...defaultConfig,
      bottom: config.bottom,
      closeIcon: config.closeIcon,
      duration: config.duration ?? defaultConfig.duration,
      getContainer: config.getContainer,
      maxCount: config.maxCount,
      placement: config.placement ?? defaultConfig.placement,
      top: config.top,
    }),
    [
      config.bottom,
      config.closeIcon,
      config.duration,
      config.getContainer,
      config.maxCount,
      config.placement,
      config.top,
    ],
  );
  const [notices, setNotices] = useState<Notice[]>([]);
  const [timerMap] = useState(
    () => new Map<NotificationKey, ReturnType<typeof setTimeout>>(),
  );
  const close = useCallback(
    (key: NotificationKey) => {
      const timer = timerMap.get(key);

      if (timer) {
        clearTimeout(timer);
        timerMap.delete(key);
      }

      setNotices((current) => {
        const notice = current.find((item) => item.key === key);
        notice?.onClose?.();
        return current.filter((item) => item.key !== key);
      });
    },
    [timerMap],
  );
  const api = useMemo(
    () => createScopedApi({ holderConfig, setNotices, timerMap }),
    [holderConfig, timerMap],
  );

  useEffect(() => {
    return () => {
      for (const timer of timerMap.values()) {
        clearTimeout(timer);
      }

      timerMap.clear();
    };
  }, [timerMap]);

  return [
    api,
    <NotificationHolder
      key="notification-holder"
      notices={notices}
      config={holderConfig}
      onClose={close}
    />,
  ];
}

export const notification = globalApi;
