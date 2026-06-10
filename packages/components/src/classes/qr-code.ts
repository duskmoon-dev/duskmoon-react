import { cn } from "../utils";
import type {
  QRCodeErrorLevel,
  QRCodeStatus,
  QRCodeType,
} from "../components/qr-code/QRCode.types";

export const qrCodeBaseClass = "qr-code";
export const qrCodeCanvasClass = "qr-code-canvas";
export const qrCodeSvgClass = "qr-code-svg";
export const qrCodeModulesClass = "qr-code-modules";
export const qrCodeModuleClass = "qr-code-module";
export const qrCodeIconClass = "qr-code-icon";
export const qrCodeMaskClass = "qr-code-mask";
export const qrCodeMaskTitleClass = "qr-code-mask-title";
export const qrCodeRefreshClass = "qr-code-refresh";

export const qrCodeTypeClasses: Record<QRCodeType, string> = {
  canvas: "qr-code-type-canvas",
  svg: "qr-code-type-svg",
};

export const qrCodeStatusClasses: Record<QRCodeStatus, string> = {
  active: "qr-code-active",
  expired: "qr-code-expired",
  loading: "qr-code-loading",
  scanned: "qr-code-scanned",
};

export const qrCodeErrorLevelClasses: Record<QRCodeErrorLevel, string> = {
  L: "qr-code-error-l",
  M: "qr-code-error-m",
  Q: "qr-code-error-q",
  H: "qr-code-error-h",
};

export function getQRCodeClasses({
  type,
  status,
  errorLevel,
  className,
}: {
  type: QRCodeType;
  status: QRCodeStatus;
  errorLevel: QRCodeErrorLevel;
  className?: string;
}) {
  return cn(
    qrCodeBaseClass,
    qrCodeTypeClasses[type],
    qrCodeStatusClasses[status],
    qrCodeErrorLevelClasses[errorLevel],
    className,
  );
}
