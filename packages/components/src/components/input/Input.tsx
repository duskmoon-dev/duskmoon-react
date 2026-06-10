import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  getInputClasses,
  getInputWrapperClasses,
  getPasswordWrapperClasses,
  getSearchWrapperClasses,
  getTextAreaClasses,
  getTextAreaCountClasses,
  inputClearClass,
  inputGroupClass,
  inputPasswordToggleClass,
  inputPrefixClass,
  inputSearchButtonClass,
  inputSuffixClass,
  textAreaWrapperClass,
} from "../../classes/input";
import { cn } from "../../utils";
import type {
  InputChangeEvent,
  InputComponent,
  InputGroupProps,
  InputProps,
  PasswordProps,
  SearchProps,
  TextAreaChangeEvent,
  TextAreaProps,
} from "./Input.types";

function toTextValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(",");
  }

  return value == null ? "" : String(value);
}

const InputRoot = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      allowClear,
      className,
      defaultValue,
      disabled,
      onChange,
      prefix,
      size = "md",
      status,
      suffix,
      type = "text",
      value,
      variant = "outlined",
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState(() =>
      toTextValue(defaultValue),
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? toTextValue(value) : internalValue;
    const hasAffix = prefix != null || suffix != null || allowClear;

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    function handleChange(event: InputChangeEvent) {
      if (!isControlled) {
        setInternalValue(event.currentTarget.value);
      }

      onChange?.(event);
    }

    function handleClear() {
      const input = inputRef.current;

      if (!input || disabled) {
        return;
      }

      input.value = "";

      if (!isControlled) {
        setInternalValue("");
      }

      onChange?.({
        currentTarget: input,
        target: input,
        type: "change",
      } as InputChangeEvent);
      input.focus();
    }

    const control = (
      <input
        {...props}
        ref={inputRef}
        type={type}
        className={getInputClasses({ size, status, variant, className })}
        disabled={disabled}
        value={currentValue}
        onChange={handleChange}
      />
    );

    if (!hasAffix) {
      return control;
    }

    const showClear = allowClear && !disabled && currentValue.length > 0;

    return (
      <span className={getInputWrapperClasses({ affixed: hasAffix })}>
        {prefix != null ? (
          <span className={inputPrefixClass}>{prefix}</span>
        ) : null}
        {control}
        {showClear ? (
          <button
            type="button"
            className={inputClearClass}
            aria-label="Clear input"
            onClick={handleClear}
          >
            x
          </button>
        ) : null}
        {suffix != null ? (
          <span className={inputSuffixClass}>{suffix}</span>
        ) : null}
      </span>
    );
  },
);

InputRoot.displayName = "Input";

const Search = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className,
      disabled,
      enterButton,
      loading,
      onKeyDown,
      onSearch,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    function emitSearch(
      event?:
        | React.KeyboardEvent<HTMLInputElement>
        | React.MouseEvent<HTMLElement>,
    ) {
      onSearch?.(inputRef.current?.value ?? "", event);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      onKeyDown?.(event);

      if (!event.defaultPrevented && event.key === "Enter") {
        emitSearch(event);
      }
    }

    const buttonContent =
      enterButton === true ? "Search" : (enterButton ?? "Search");

    return (
      <span className={getSearchWrapperClasses({ className })}>
        <InputRoot
          {...props}
          ref={inputRef}
          disabled={disabled}
          onKeyDown={handleKeyDown}
        />
        {enterButton || loading ? (
          <button
            type="button"
            className={inputSearchButtonClass}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            onClick={emitSearch}
          >
            {loading ? "Loading" : buttonContent}
          </button>
        ) : null}
      </span>
    );
  },
);

Search.displayName = "Input.Search";

const Password = forwardRef<HTMLInputElement, PasswordProps>(
  ({ className, disabled, visibilityToggle = true, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const type = visible ? "text" : "password";
    const toggle = visibilityToggle ? (
      <button
        type="button"
        className={inputPasswordToggleClass}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => {
          setVisible((current) => !current);
        }}
      >
        {visible ? "Hide" : "Show"}
      </button>
    ) : undefined;

    return (
      <span className={getPasswordWrapperClasses({ className })}>
        <InputRoot
          {...props}
          ref={ref}
          disabled={disabled}
          type={type}
          suffix={toggle}
        />
      </span>
    );
  },
);

Password.displayName = "Input.Password";

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      autoSize,
      className,
      defaultValue,
      maxLength,
      onChange,
      resize = "vertical",
      showCount,
      size = "md",
      status,
      value,
      variant = "outlined",
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(() =>
      toTextValue(defaultValue),
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? toTextValue(value) : internalValue;
    const count = currentValue.length;
    const exceeded = maxLength !== undefined && count > maxLength;

    function handleChange(event: TextAreaChangeEvent) {
      if (!isControlled) {
        setInternalValue(event.currentTarget.value);
      }

      onChange?.(event);
    }

    const control = (
      <textarea
        {...props}
        ref={ref}
        className={getTextAreaClasses({
          size,
          status,
          variant,
          resize,
          autoSize: Boolean(autoSize),
          className,
        })}
        maxLength={maxLength}
        value={currentValue}
        onChange={handleChange}
      />
    );

    if (!showCount) {
      return control;
    }

    return (
      <span className={textAreaWrapperClass}>
        {control}
        <span className={getTextAreaCountClasses({ exceeded })}>
          {count}
          {maxLength !== undefined ? ` / ${maxLength}` : null}
        </span>
      </span>
    );
  },
);

TextArea.displayName = "Input.TextArea";

const Group = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(inputGroupClass, className)}>
      {children}
    </div>
  ),
);

Group.displayName = "Input.Group";

export const Input = Object.assign(InputRoot, {
  Search,
  Password,
  TextArea,
  Group,
}) as InputComponent;

export { Group, Password, Search, TextArea };
