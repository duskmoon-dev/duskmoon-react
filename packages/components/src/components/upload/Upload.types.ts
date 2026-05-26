import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type UploadListType = "text" | "picture" | "picture-card";
export type UploadFileStatus = "uploading" | "done" | "error" | "removed";

export interface UploadFile<T = unknown> {
  uid?: string;
  name: string;
  status?: UploadFileStatus;
  percent?: number;
  size?: number;
  type?: string;
  url?: string;
  thumbUrl?: string;
  response?: T;
  error?: Error;
  originFileObj?: File;
}

export interface UploadChangeParam<T = unknown> {
  file: UploadFile<T>;
  fileList: UploadFile<T>[];
  event?: ProgressEvent | { percent?: number };
}

export interface UploadRequestOption<T = unknown> {
  action?: string;
  file: File;
  filename: string;
  onError?: (error: Error) => void;
  onProgress?: (event: { percent?: number }) => void;
  onSuccess?: (response?: T) => void;
}

export type UploadBeforeUploadResult =
  | boolean
  | File
  | Blob
  | UploadListIgnore
  | Promise<boolean | File | Blob | UploadListIgnore>;

export type UploadListIgnore = symbol;

export interface UploadProps
  extends Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange"> {
  accept?: string;
  action?: string;
  beforeUpload?: (file: File, fileList: File[]) => UploadBeforeUploadResult;
  children?: ReactNode;
  customRequest?: (options: UploadRequestOption) => void;
  defaultFileList?: UploadFile[];
  disabled?: boolean;
  fileList?: UploadFile[];
  listType?: UploadListType;
  multiple?: boolean;
  onChange?: (info: UploadChangeParam) => void;
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => boolean | Promise<boolean> | void;
}

export interface UploadDraggerProps extends UploadProps {}

export type UploadComponent = ForwardRefExoticComponent<
  UploadProps & RefAttributes<HTMLDivElement>
> & {
  Dragger: ForwardRefExoticComponent<
    UploadDraggerProps & RefAttributes<HTMLDivElement>
  >;
  LIST_IGNORE: UploadListIgnore;
};
