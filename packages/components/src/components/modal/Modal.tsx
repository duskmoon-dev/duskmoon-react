import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import {
  getModalBackdropClasses,
  getModalClasses,
  modalBodyClass,
  modalCloseClass,
  modalFooterClass,
  modalHeaderClass,
  modalTitleClass,
} from "../../classes/modal";
import type {
  ModalComponent,
  ModalFuncHandle,
  ModalFuncProps,
  ModalProps,
} from "./Modal.types";

const defaultCloseIcon = "x";
const serviceHandles = new Set<ModalFuncHandle>();

function createServiceHandle(config: ModalFuncProps): ModalFuncHandle {
  let currentConfig = config;
  const handle: ModalFuncHandle = {
    destroy: () => {
      serviceHandles.delete(handle);
    },
    update: (nextConfig: ModalFuncProps) => {
      currentConfig = { ...currentConfig, ...nextConfig };
    },
  };

  serviceHandles.add(handle);
  return handle;
}

function getModalStyle({
  width,
  style,
}: {
  width?: CSSProperties["width"];
  style?: CSSProperties;
}) {
  return {
    ...style,
    ...(width !== undefined ? { width } : undefined),
  };
}

const ModalBase = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      defaultOpen = false,
      title,
      children,
      content,
      footer,
      onOk,
      onCancel,
      okText = "OK",
      cancelText = "Cancel",
      confirmLoading,
      closable = true,
      maskClosable = true,
      width,
      centered,
      destroyOnClose,
      afterOpenChange,
      className,
      maskClassName,
      closeIcon = defaultCloseIcon,
      style,
      role = "dialog",
      ...props
    },
    ref,
  ) => {
    const controlled = open !== undefined;
    const [innerOpen, setInnerOpen] = useState(defaultOpen);
    const mergedOpen = controlled ? Boolean(open) : innerOpen;
    const previousOpen = useRef(mergedOpen);
    const showClose = closable && closeIcon !== null && closeIcon !== false;
    const body = children ?? content;

    useEffect(() => {
      if (previousOpen.current === mergedOpen) {
        return;
      }

      previousOpen.current = mergedOpen;
      afterOpenChange?.(mergedOpen);
    }, [afterOpenChange, mergedOpen]);

    const close = useCallback(
      (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
        if (!controlled) {
          setInnerOpen(false);
        }

        onCancel?.(event);
      },
      [controlled, onCancel],
    );

    const handleOk = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onOk?.(event);
      },
      [onOk],
    );

    const handleMaskClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || !maskClosable) {
          return;
        }

        close(event);
      },
      [close, maskClosable],
    );

    if (!mergedOpen && destroyOnClose) {
      return null;
    }

    return (
      <div
        aria-hidden={mergedOpen ? undefined : true}
        role="presentation"
        className={getModalBackdropClasses({
          open: mergedOpen,
          centered,
          className: maskClassName,
        })}
        onMouseDown={handleMaskClick}
      >
        <div
          {...props}
          ref={ref}
          role={role}
          aria-modal={mergedOpen ? true : undefined}
          className={getModalClasses({ className })}
          style={getModalStyle({ width, style })}
        >
          {title !== undefined || showClose ? (
            <div className={modalHeaderClass}>
              {title !== undefined ? (
                <h2 className={modalTitleClass}>{title}</h2>
              ) : null}
              {showClose ? (
                <button
                  type="button"
                  className={modalCloseClass}
                  aria-label="Close"
                  onClick={close}
                >
                  {closeIcon}
                </button>
              ) : null}
            </div>
          ) : null}
          <div className={modalBodyClass}>{body}</div>
          {footer === null ? null : (
            <div className={modalFooterClass}>
              {footer !== undefined ? (
                footer
              ) : (
                <>
                  <button type="button" onClick={close}>
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    aria-busy={confirmLoading}
                    disabled={confirmLoading}
                    onClick={handleOk}
                  >
                    {okText}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

ModalBase.displayName = "Modal";

export const Modal = ModalBase as ModalComponent;
Modal.confirm = createServiceHandle;
Modal.info = createServiceHandle;
Modal.success = createServiceHandle;
Modal.error = createServiceHandle;
Modal.warning = createServiceHandle;
Modal.destroyAll = () => {
  for (const handle of Array.from(serviceHandles)) {
    handle.destroy();
  }
};
