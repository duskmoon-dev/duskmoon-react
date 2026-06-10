import { cn } from "../utils";
import type { UploadListType } from "../components/upload/Upload.types";

export const uploadBaseClass = "file-upload";
export const uploadTriggerClass = "file-upload-trigger";
export const uploadInputClass = "file-upload-input";
export const uploadDropzoneClass = "file-upload-dropzone";
export const uploadDropzoneDragoverClass = "file-upload-dropzone-dragover";
export const uploadListClass = "file-upload-list";
export const uploadItemClass = "file-upload-item";
export const uploadItemInfoClass = "file-upload-item-info";
export const uploadItemNameClass = "file-upload-item-name";
export const uploadItemSizeClass = "file-upload-item-size";
export const uploadItemActionsClass = "file-upload-item-actions";
export const uploadPreviewClass = "file-upload-item-preview";
export const uploadRemoveClass = "file-upload-item-remove";
export const uploadProgressClass = "file-upload-progress";
export const uploadProgressBarClass = "file-upload-progress-bar";

export const uploadListTypeClasses: Record<UploadListType, string> = {
  text: "file-upload-list-text",
  picture: "file-upload-list-picture",
  "picture-card": "file-upload-list-picture-card",
};

export function getUploadClasses({
  disabled,
  dragger,
  dragover,
  className,
}: {
  disabled?: boolean;
  dragger?: boolean;
  dragover?: boolean;
  className?: string;
}) {
  return cn(
    uploadBaseClass,
    dragger && "file-upload-dragger",
    disabled && "file-upload-disabled",
    dragover && uploadDropzoneDragoverClass,
    className,
  );
}

export function getUploadListClasses({
  listType = "text",
  className,
}: {
  listType?: UploadListType;
  className?: string;
}) {
  return cn(uploadListClass, uploadListTypeClasses[listType], className);
}

export function getUploadItemClasses({
  status,
  className,
}: {
  status?: string;
  className?: string;
}) {
  return cn(
    uploadItemClass,
    status === "error" && "file-upload-item-error",
    status === "done" && "file-upload-item-success",
    className,
  );
}
