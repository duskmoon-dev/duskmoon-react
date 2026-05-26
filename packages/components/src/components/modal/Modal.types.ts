import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from "react";

export interface ModalProps extends Omit<
  ComponentProps<"div">,
  "children" | "className" | "content" | "title"
> {
  open?: boolean;
  defaultOpen?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode | null;
  onOk?: (event: MouseEvent<HTMLButtonElement>) => void;
  onCancel?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  width?: CSSProperties["width"];
  centered?: boolean;
  destroyOnClose?: boolean;
  afterOpenChange?: (open: boolean) => void;
  className?: string;
  maskClassName?: string;
  closeIcon?: ReactNode;
}

export interface ModalFuncProps {
  title?: ReactNode;
  content?: ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
}

export interface ModalFuncHandle {
  destroy: () => void;
  update: (config: ModalFuncProps) => void;
}

export interface ModalComponent extends ForwardRefExoticComponent<
  ModalProps & RefAttributes<HTMLDivElement>
> {
  confirm: (config: ModalFuncProps) => ModalFuncHandle;
  info: (config: ModalFuncProps) => ModalFuncHandle;
  success: (config: ModalFuncProps) => ModalFuncHandle;
  error: (config: ModalFuncProps) => ModalFuncHandle;
  warning: (config: ModalFuncProps) => ModalFuncHandle;
  destroyAll: () => void;
}
