import { forwardRef, useState } from "react";
import {
  getSwitchClasses,
  getSwitchTrackClasses,
  switchInputClass,
  switchThumbClass,
} from "../../classes/switch";
import type { SwitchChangeEvent, SwitchProps } from "./Switch.types";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked,
      onChange,
      disabled,
      loading,
      size = "md",
      color = "primary",
      checkedChildren,
      unCheckedChildren,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(
      () => defaultChecked ?? false,
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;
    const isDisabled = disabled || loading;
    const hasChildren = checkedChildren != null || unCheckedChildren != null;

    function handleChange(event: SwitchChangeEvent) {
      const nextChecked = event.currentTarget.checked;

      if (!isControlled) {
        setInternalChecked(nextChecked);
      }

      onChange?.(nextChecked, event);
    }

    return (
      <label className={getSwitchClasses({ size, loading, className })}>
        <input
          {...props}
          ref={ref}
          type="checkbox"
          role="switch"
          className={switchInputClass}
          checked={isChecked}
          disabled={isDisabled}
          aria-checked={isChecked}
          aria-busy={loading || undefined}
          onChange={handleChange}
        />
        <span className={getSwitchTrackClasses({ color })} aria-hidden="true">
          {hasChildren && (
            <span>{isChecked ? checkedChildren : unCheckedChildren}</span>
          )}
          <span className={switchThumbClass} />
        </span>
      </label>
    );
  },
);

Switch.displayName = "Switch";
