import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { FocusEvent, ForwardedRef } from "react";

export function usePickerDropdown({
  open,
  defaultOpen,
  disabled,
  onOpenChange,
  ref,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  ref: ForwardedRef<HTMLDivElement>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipFocus = useRef(false);
  const panelId = useId();
  const [innerOpen, setInnerOpen] = useState(Boolean(defaultOpen));
  const visible = !disabled && (open ?? innerOpen);
  useImperativeHandle(ref, () => rootRef.current!, []);

  function setVisible(next: boolean) {
    if (disabled || next === visible) return;
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  }

  function closeAndFocus() {
    skipFocus.current = true;
    inputRef.current?.focus();
    skipFocus.current = false;
    setVisible(false);
  }

  useEffect(() => {
    function handleOutside(event: PointerEvent) {
      if (visible && !rootRef.current?.contains(event.target as Node))
        setVisible(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        !rootRef.current?.contains(event.target as Node)
      )
        return;
      if (event.key === "Escape" && visible) {
        event.preventDefault();
        closeAndFocus();
      } else if (
        event.key === "ArrowDown" &&
        event.target === inputRef.current
      ) {
        event.preventDefault();
        setVisible(true);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  return {
    rootRef,
    inputRef,
    panelId,
    visible,
    setVisible,
    closeAndFocus,
    onInputFocus: () => {
      if (!skipFocus.current) setVisible(true);
    },
    onRootBlur: (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node))
        setVisible(false);
    },
  };
}
