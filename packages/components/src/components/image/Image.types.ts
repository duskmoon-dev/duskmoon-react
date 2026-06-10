import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export interface ImagePreviewConfig {
  visible?: boolean;
  mask?: ReactNode;
  src?: string;
  onVisibleChange?: (visible: boolean, prevVisible: boolean) => void;
}

export type ImagePreview = boolean | ImagePreviewConfig;

export interface ImageProps extends Omit<
  ComponentProps<"img">,
  "alt" | "children" | "fallback" | "placeholder" | "preview" | "src"
> {
  src?: string;
  alt?: string;
  fallback?: string;
  placeholder?: ReactNode | boolean;
  preview?: ImagePreview;
  imgClassName?: string;
  wrapperClassName?: string;
}

export interface ImagePreviewGroupProps extends ComponentProps<"div"> {
  preview?: ImagePreview;
  children?: ReactNode;
}

export type ImagePreviewGroupComponent = ForwardRefExoticComponent<
  ImagePreviewGroupProps & RefAttributes<HTMLDivElement>
>;

export type ImageComponent = ForwardRefExoticComponent<
  ImageProps & RefAttributes<HTMLDivElement>
> & {
  PreviewGroup: ImagePreviewGroupComponent;
};
