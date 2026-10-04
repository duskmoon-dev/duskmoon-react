import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import {
  getModalClasses,
  modalBodyClass,
  modalCloseClass,
  modalFooterClass,
  modalHeaderClass,
  modalTitleClass,
} from "../../classes/modal";
import { cn } from "../../utils";
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

function showNativeModal(dialog: HTMLDialogElement) {
  if (!dialog.isConnected || dialog.matches(":modal")) return;
  if (dialog.open) dialog.close();
  dialog.showModal();
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
      role,
      ...props
    },
    ref,
  ) => {
    const controlled = open !== undefined;
    const [innerOpen, setInnerOpen] = useState(defaultOpen);
    const mergedOpen = controlled ? Boolean(open) : innerOpen;
    const previousOpen = useRef(mergedOpen);
    const desiredOpen = useRef(mergedOpen);
    desiredOpen.current = mergedOpen;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const cancelRequestRef = useRef<HTMLButtonElement>(null);
    const programmaticClose = useRef(false);
    const titleId = useId();
    const surfaceWidth = width ?? style?.width;
    const callerNamed = props["aria-label"] != null || props["aria-labelledby"] != null;
    const showClose = closable && closeIcon !== null && closeIcon !== false;
    const body = children ?? content;

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (mergedOpen) {
        programmaticClose.current = false;
        showNativeModal(dialog);
      } else if (dialog.open) {
        programmaticClose.current = true;
        dialog.close();
      }

      return () => {
        if (dialog.open) {
          programmaticClose.current = true;
          dialog.close();
        }
      };
    }, [mergedOpen]);

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

    const requestCancel = useCallback(() => {
      cancelRequestRef.current?.click();
    }, []);

    const handleNativeClose = useCallback(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open || programmaticClose.current) {
        programmaticClose.current = false;
        return;
      }

      if (desiredOpen.current) {
        requestCancel();
        if (controlled) {
          queueMicrotask(() => {
            if (desiredOpen.current) {
              showNativeModal(dialog);
            }
          });
        }
      }
    }, [controlled, requestCancel]);

    if (!mergedOpen && destroyOnClose) {
      return null;
    }

    return (
      <dialog
        ref={dialogRef}
        role={role === "alertdialog" ? role : undefined}
        aria-label={props["aria-label"] ?? (!callerNamed && title == null ? "Modal" : undefined)}
        aria-labelledby={props["aria-labelledby"] ?? (!callerNamed && title != null ? titleId : undefined)}
        aria-describedby={props["aria-describedby"]}
        className={getModalClasses({ className: cn(maskClassName, centered ? "modal-middle" : "modal-top") })}
        style={surfaceWidth !== undefined ? { width: surfaceWidth, maxWidth: surfaceWidth } : undefined}
        onCancel={(event) => {
          event.preventDefault();
          requestCancel();
        }}
        onClose={handleNativeClose}
        onMouseDown={(event) => {
          if (!maskClosable || event.target !== event.currentTarget) return;
          const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < left || event.clientX > right ||
            event.clientY < top || event.clientY > bottom
          ) {
            requestCancel();
          }
        }}
      >
        <button
          ref={cancelRequestRef}
          type="button"
          hidden
          tabIndex={-1}
          aria-hidden="true"
          onClick={close}
        />
        <div
          {...props}
          ref={ref}
          role={role}
          className={cn("modal-box", "react-modal-box", className)}
          style={getModalStyle({ width, style })}
        >
          {title !== undefined || showClose ? (
            <div className={modalHeaderClass}>
              {title !== undefined ? (
                <h2 id={titleId} className={modalTitleClass}>{title}</h2>
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
      </dialog>
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
