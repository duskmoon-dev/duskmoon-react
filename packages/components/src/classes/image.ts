import { cn } from "../utils";

export const imageBaseClass = "image";
export const imageImgClass = "image-img";
export const imagePlaceholderClass = "image-placeholder";
export const imageErrorClass = "image-error";
export const imagePreviewClass = "image-preview";
export const imagePreviewDisabledClass = "image-preview-disabled";
export const imagePreviewMaskClass = "image-preview-mask";
export const imagePreviewGroupClass = "image-preview-group";

export function getImageClasses({
  preview,
  error,
  className,
}: {
  preview?: boolean;
  error?: boolean;
  className?: string;
}) {
  return cn(
    imageBaseClass,
    preview ? imagePreviewClass : imagePreviewDisabledClass,
    error && imageErrorClass,
    className,
  );
}

export function getImagePreviewGroupClasses({
  className,
}: {
  className?: string;
}) {
  return cn(imagePreviewGroupClass, className);
}
