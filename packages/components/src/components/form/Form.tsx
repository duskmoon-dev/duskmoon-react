import React, {
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  formErrorListClass,
  formItemControlClass,
  formItemExtraClass,
  formItemHelpClass,
  formItemLabelClass,
  formListClass,
  getFormClasses,
  getFormItemClasses,
} from "../../classes/form";
import type {
  ErrorListProps,
  FieldError,
  FormComponent,
  FormContextValue,
  FormInstance,
  FormItemProps,
  FormListFieldData,
  FormListProps,
  FormNamePath,
  FormProps,
  FormProviderProps,
  FormRule,
} from "./Form.types";

function nameKey(name: FormNamePath) {
  return Array.isArray(name) ? name.join(".") : String(name);
}

function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function createFormStore<T extends Record<string, unknown>>(
  initialValues: Partial<T> = {},
): FormInstance<T> & {
  __subscribe: (listener: () => void) => () => void;
  __getVersion: () => number;
  __setSubmit: (submit: () => void) => void;
  __setInitialValues: (values: Partial<T>) => void;
  __getRules: () => Map<string, { name: FormNamePath; rules: FormRule[] }>;
} {
  let initial: Record<string, unknown> = { ...initialValues };
  let values: Record<string, unknown> = { ...initialValues };
  let submitHandler = () => undefined as void;
  let version = 0;
  const listeners = new Set<() => void>();
  const rules = new Map<string, { name: FormNamePath; rules: FormRule[] }>();

  function emit() {
    version += 1;
    for (const listener of listeners) {
      listener();
    }
  }

  const form = {
    getFieldValue: (name) => values[nameKey(name)],
    getFieldsValue: () => ({ ...values }) as Partial<T>,
    setFieldValue: (name, value) => {
      values = { ...values, [nameKey(name)]: value };
      emit();
    },
    setFieldsValue: (nextValues) => {
      values = { ...values, ...nextValues };
      emit();
    },
    resetFields: (names) => {
      if (!names) {
        values = { ...initial };
      } else {
        values = { ...values };
        for (const name of names) {
          values[nameKey(name)] = initial[nameKey(name)];
        }
      }

      emit();
    },
    validateFields: async (names) => {
      const keys = names?.map(nameKey);
      const errorFields: FieldError[] = [];

      for (const entry of rules.values()) {
        const key = nameKey(entry.name);
        if (keys && !keys.includes(key)) {
          continue;
        }

        const value = values[key];
        const errors: React.ReactNode[] = [];

        for (const rule of entry.rules) {
          if (rule.required && isEmpty(value)) {
            errors.push(rule.message ?? "Required");
          }

          if (rule.validator) {
            try {
              await rule.validator(rule, value);
            } catch (error) {
              errors.push(
                error instanceof Error ? error.message : String(error),
              );
            }
          }
        }

        if (errors.length > 0) {
          errorFields.push({ name: entry.name, errors });
        }
      }

      if (errorFields.length > 0) {
        throw errorFields;
      }

      return { ...values } as Partial<T>;
    },
    submit: () => submitHandler(),
    __subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    __getVersion: () => version,
    __setSubmit: (submit) => {
      submitHandler = submit;
    },
    __setInitialValues: (nextInitialValues) => {
      initial = { ...nextInitialValues };
    },
    __getRules: () => rules,
  } satisfies FormInstance<T> & {
    __subscribe: (listener: () => void) => () => void;
    __getVersion: () => number;
    __setSubmit: (submit: () => void) => void;
    __setInitialValues: (values: Partial<T>) => void;
    __getRules: () => Map<string, { name: FormNamePath; rules: FormRule[] }>;
  };

  return form;
}

export const FormContext = createContext<FormContextValue | null>(null);
const ProviderContext = createContext<Record<string, FormInstance>>({});

function useInternalForm<T extends Record<string, unknown>>(
  form?: FormInstance<T>,
  initialValues?: Partial<T>,
) {
  const [internalForm] = useState(() => form ?? createFormStore(initialValues));

  return internalForm;
}

function useForm<T extends Record<string, unknown> = Record<string, unknown>>(
  form?: FormInstance<T>,
): [FormInstance<T>] {
  return [useInternalForm(form)];
}

function useFormInstance() {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error("Form.useFormInstance must be used inside Form");
  }

  return context.form;
}

function useFormVersion(form?: FormInstance) {
  const internal = form as
    | (FormInstance & {
        __subscribe?: (listener: () => void) => () => void;
        __getVersion?: () => number;
      })
    | undefined;

  return useSyncExternalStore(
    internal?.__subscribe ?? (() => () => undefined),
    internal?.__getVersion ?? (() => 0),
    internal?.__getVersion ?? (() => 0),
  );
}

function useWatch(name: FormNamePath, form?: FormInstance) {
  const context = useContext(FormContext);
  const targetForm = form ?? context?.form;
  useFormVersion(targetForm);

  return targetForm?.getFieldValue(name);
}

const FormBase = forwardRef<FormInstance, FormProps>(
  (
    {
      children,
      className,
      disabled,
      form,
      initialValues,
      layout = "horizontal",
      labelCol,
      wrapperCol,
      colon = true,
      requiredMark = true,
      onFinish,
      onFinishFailed,
      onValuesChange,
      name,
      ...props
    },
    ref,
  ) => {
    const formInstance = useInternalForm(form, initialValues);
    const initialValuesRef = useRef(initialValues);
    const [errors, setErrors] = useState<Record<string, React.ReactNode[]>>({});
    const [, rerender] = useState(0);
    const providerForms = useContext(ProviderContext);
    const formName = String(name ?? "default");

    useImperativeHandle(ref, () => formInstance);

    useLayoutEffect(() => {
      const internal = formInstance as FormInstance & {
        __setInitialValues?: (values: Partial<Record<string, unknown>>) => void;
      };

      internal.__setInitialValues?.(initialValuesRef.current ?? {});
      if (initialValuesRef.current) {
        formInstance.setFieldsValue(initialValuesRef.current);
      }
    }, [formInstance]);

    useLayoutEffect(() => {
      const internal = formInstance as FormInstance & {
        __subscribe?: (listener: () => void) => () => void;
      };

      return internal.__subscribe?.(() => rerender((value) => value + 1));
    }, [formInstance]);

    useEffect(() => {
      (
        formInstance as FormInstance & {
          __setSubmit?: (submit: () => void) => void;
        }
      ).__setSubmit?.(() => {
        void submit();
      });
    });

    const setFieldError = useCallback(
      (fieldName: FormNamePath, fieldErrors: React.ReactNode[]) => {
        setErrors((current) => ({
          ...current,
          [nameKey(fieldName)]: fieldErrors,
        }));
      },
      [],
    );

    const getFieldError = useCallback(
      (fieldName: FormNamePath) => {
        return errors[nameKey(fieldName)] ?? [];
      },
      [errors],
    );

    const registerField = useCallback(
      (fieldName: FormNamePath, rules: FormRule[] = []) => {
        const store = (
          formInstance as FormInstance & {
            __getRules?: () => Map<
              string,
              { name: FormNamePath; rules: FormRule[] }
            >;
          }
        ).__getRules?.();
        store?.set(nameKey(fieldName), { name: fieldName, rules });

        return () => {
          store?.delete(nameKey(fieldName));
        };
      },
      [formInstance],
    );

    async function submit() {
      try {
        const values = await formInstance.validateFields();
        setErrors({});
        onFinish?.(values);
        void providerForms[formName]?.submit;
      } catch (error) {
        const errorFields = Array.isArray(error) ? (error as FieldError[]) : [];
        const nextErrors: Record<string, React.ReactNode[]> = {};

        for (const field of errorFields) {
          nextErrors[nameKey(field.name)] = field.errors;
        }

        setErrors(nextErrors);
        onFinishFailed?.({
          errorFields,
          values: formInstance.getFieldsValue(),
        });
      }
    }

    const contextValue = useMemo<FormContextValue>(
      () => ({
        form: formInstance,
        disabled,
        layout,
        labelCol,
        wrapperCol,
        colon,
        requiredMark,
        registerField,
        getFieldError,
        setFieldError,
      }),
      [
        colon,
        disabled,
        formInstance,
        getFieldError,
        labelCol,
        layout,
        registerField,
        requiredMark,
        setFieldError,
        wrapperCol,
      ],
    );

    return (
      <FormContext.Provider value={contextValue}>
        <form
          {...props}
          name={name}
          className={getFormClasses({ layout, disabled, className })}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          onChange={() => {
            onValuesChange?.({}, formInstance.getFieldsValue());
          }}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  },
);

FormBase.displayName = "Form";

const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  (
    {
      children,
      className,
      extra,
      help,
      label,
      name,
      noStyle,
      required,
      rules = [],
      trigger = "onChange",
      valuePropName = "value",
      ...props
    },
    ref,
  ) => {
    const context = useContext(FormContext);
    useFormVersion(context?.form);
    const fieldErrors = name && context ? context.getFieldError(name) : [];
    const ruleRequired = required ?? rules.some((rule) => rule.required);

    useEffect(() => {
      if (!name || !context) {
        return undefined;
      }

      return context.registerField(name, rules);
    }, [context, name, rules]);

    function renderControl() {
      if (!name || !context || !isValidElement(children)) {
        return children;
      }

      const key = nameKey(name);
      const value = context.form.getFieldValue(name);
      const childProps = children.props as Record<string, unknown>;
      const originalTrigger = childProps[trigger] as
        | ((...args: unknown[]) => void)
        | undefined;

      return React.cloneElement(children, {
        [valuePropName]:
          valuePropName === "checked" ? Boolean(value) : (value ?? ""),
        disabled: childProps.disabled ?? context.disabled,
        [trigger]: (...args: unknown[]) => {
          const event = args[0] as {
            target?: { value?: unknown; checked?: boolean };
          };
          const nextValue =
            valuePropName === "checked"
              ? event?.target?.checked
              : (event?.target?.value ?? args[0]);

          context.form.setFieldValue(key, nextValue);
          context.setFieldError(name, []);
          originalTrigger?.(...args);
        },
      } as Record<string, unknown>);
    }

    if (noStyle) {
      return <>{renderControl()}</>;
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getFormItemClasses({
          required: ruleRequired,
          error: fieldErrors.length > 0,
          className,
        })}
      >
        {label ? <label className={formItemLabelClass}>{label}</label> : null}
        <div className={formItemControlClass}>{renderControl()}</div>
        {extra ? <div className={formItemExtraClass}>{extra}</div> : null}
        {help || fieldErrors.length > 0 ? (
          <div className={formItemHelpClass}>
            {help ??
              fieldErrors.map((error, index) => <div key={index}>{error}</div>)}
          </div>
        ) : null}
      </div>
    );
  },
);

FormItem.displayName = "Form.Item";

function FormList({ name, initialValue = [], children }: FormListProps) {
  const form = useFormInstance();
  useFormVersion(form);
  const list =
    (form.getFieldValue(name) as unknown[] | undefined) ?? initialValue;
  const fields: FormListFieldData[] = list.map((_, index) => ({
    key: index,
    name: index,
    fieldKey: index,
  }));

  function setList(next: unknown[]) {
    form.setFieldValue(name, next);
  }

  return (
    <div className={formListClass}>
      {children(
        fields,
        {
          add: (defaultValue, insertIndex = list.length) => {
            const next = [...list];
            next.splice(insertIndex, 0, defaultValue);
            setList(next);
          },
          remove: (index) => {
            const indexes = Array.isArray(index) ? index : [index];
            setList(
              list.filter((_, itemIndex) => !indexes.includes(itemIndex)),
            );
          },
          move: (from, to) => {
            const next = [...list];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            setList(next);
          },
        },
        { errors: [] },
      )}
    </div>
  );
}

const ErrorList = forwardRef<HTMLDivElement, ErrorListProps>(
  ({ errors = [], className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={[formErrorListClass, className].filter(Boolean).join(" ")}
    >
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  ),
);

ErrorList.displayName = "Form.ErrorList";

function FormProvider({ children }: FormProviderProps) {
  return (
    <ProviderContext.Provider value={{}}>{children}</ProviderContext.Provider>
  );
}

export const Form = FormBase as unknown as FormComponent;
Form.useForm = useForm;
Form.useFormInstance = useFormInstance;
Form.useWatch = useWatch;
Form.Item = FormItem;
Form.List = FormList;
Form.ErrorList = ErrorList;
Form.Provider = FormProvider;
Form.Context = FormContext;
Form.create = () => undefined;
