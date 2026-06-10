import { cn } from "../utils";

export const configProviderClass = "config-provider";
export const configProviderRtlClass = "config-provider-rtl";
export const configProviderLtrClass = "config-provider-ltr";

export function getConfigProviderClasses({
  direction = "ltr",
  className,
}: {
  direction?: "ltr" | "rtl";
  className?: string;
}) {
  return cn(
    configProviderClass,
    direction === "rtl" ? configProviderRtlClass : configProviderLtrClass,
    className,
  );
}
