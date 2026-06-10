import React, { forwardRef } from "react";
import {
  getQRCodeClasses,
  qrCodeCanvasClass,
  qrCodeIconClass,
  qrCodeMaskClass,
  qrCodeMaskTitleClass,
  qrCodeModuleClass,
  qrCodeModulesClass,
  qrCodeRefreshClass,
  qrCodeSvgClass,
} from "../../classes/qr-code";
import { cn } from "../../utils";
import type {
  QRCodeErrorLevel,
  QRCodeProps,
  QRCodeStatus,
  QRCodeType,
} from "./QRCode.types";

const moduleCountByErrorLevel: Record<QRCodeErrorLevel, number> = {
  L: 21,
  M: 25,
  Q: 29,
  H: 33,
};

function hashValue(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function isFinder(row: number, col: number, count: number) {
  const top = row < 7;
  const left = col < 7;
  const right = col >= count - 7;

  return (top && left) || (top && right) || (row >= count - 7 && left);
}

function isFinderDark(row: number, col: number, count: number) {
  const localRow = row >= count - 7 ? row - (count - 7) : row;
  const localCol = col >= count - 7 ? col - (count - 7) : col;
  const edge = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
  const center =
    localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;

  return edge || center;
}

function createModules(value: string, errorLevel: QRCodeErrorLevel) {
  const count = moduleCountByErrorLevel[errorLevel];
  const seed = hashValue(value || " ");

  return Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_unused, col) => {
      if (isFinder(row, col, count)) return isFinderDark(row, col, count);
      const mixed = seed + row * 1103515245 + col * 12345 + row * col * 97;
      return ((mixed >>> ((row + col) % 16)) & 1) === 1;
    }),
  );
}

function renderIcon(icon: QRCodeProps["icon"], iconSize: number) {
  if (!icon) return null;

  return (
    <span
      className={qrCodeIconClass}
      style={{ width: iconSize, height: iconSize }}
    >
      {typeof icon === "string" ? <img src={icon} alt="" /> : icon}
    </span>
  );
}

function QRCodeModules({
  modules,
  color,
}: {
  modules: boolean[][];
  color: string;
}) {
  const count = modules.length;

  return (
    <svg
      className={qrCodeSvgClass}
      viewBox={`0 0 ${count} ${count}`}
      role="img"
      aria-label="QR code"
      shapeRendering="crispEdges"
    >
      {modules.map((row, rowIndex) =>
        row.map((dark, colIndex) =>
          dark ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex}
              y={rowIndex}
              width={1}
              height={1}
              fill={color}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function CSSModules({
  modules,
  color,
}: {
  modules: boolean[][];
  color: string;
}) {
  return (
    <span
      className={qrCodeModulesClass}
      style={{ gridTemplateColumns: `repeat(${modules.length}, 1fr)` }}
      role="img"
      aria-label="QR code"
    >
      {modules.flatMap((row, rowIndex) =>
        row.map((dark, colIndex) => (
          <span
            key={`${rowIndex}-${colIndex}`}
            className={cn(qrCodeModuleClass, dark && "qr-code-module-dark")}
            style={dark ? { backgroundColor: color } : undefined}
          />
        )),
      )}
    </span>
  );
}

function statusLabel(status: QRCodeStatus) {
  if (status === "expired") return "QR code expired";
  if (status === "loading") return "QR code loading";
  if (status === "scanned") return "QR code scanned";
  return null;
}

export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(
  (
    {
      value = "",
      type = "canvas",
      size = 160,
      icon,
      iconSize = 40,
      status = "active",
      errorLevel = "M",
      color = "#000",
      bgColor = "#fff",
      bordered = true,
      className,
      style,
      onRefresh,
      ...props
    },
    ref,
  ) => {
    const modules = createModules(value, errorLevel);
    const label = statusLabel(status);

    return (
      <div
        {...props}
        ref={ref}
        className={getQRCodeClasses({ type, status, errorLevel, className })}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          border: bordered ? undefined : "0",
          ...style,
        }}
        data-value={value}
      >
        {type === "svg" ? (
          <QRCodeModules modules={modules} color={color} />
        ) : (
          <span className={qrCodeCanvasClass}>
            <CSSModules modules={modules} color={color} />
          </span>
        )}
        {renderIcon(icon, iconSize)}
        {label ? (
          <span className={qrCodeMaskClass}>
            <span className={qrCodeMaskTitleClass}>{label}</span>
            {status === "expired" && onRefresh ? (
              <button
                type="button"
                className={qrCodeRefreshClass}
                onClick={onRefresh}
              >
                Refresh
              </button>
            ) : null}
          </span>
        ) : null}
      </div>
    );
  },
);

QRCode.displayName = "QRCode";
