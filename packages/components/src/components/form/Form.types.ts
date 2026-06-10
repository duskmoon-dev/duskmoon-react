import type {
  ComponentProps,
  Context,
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type FormNamePath = string | number | Array<string | number>;
export type FormLayout = "horizontal" | "vertical" | "inline";

export interface FormRule {
  required?: boolean;
  message?: ReactNode;
  validator?: (rule: FormRule, value: unknown) => Promise<void> | void;
}

export interface FieldError {
  name: FormNamePath;
  errors: ReactNode[];
}

export interface FormInstance<T extends Record<string, unknown> = Record<string, unknown>> {
  getFieldValue: (name: FormNamePath) => unknown;
  getFieldsValue: () => Partial<T>;
  setFieldValue: (name: FormNamePath, value: unknown) => void;
  setFieldsValue: (values: Partial<T>) => void;
  resetFields: (names?: FormNamePath[]) => void;
  validateFields: (names?: FormNamePath[]) => Promise<Partial<T>>;
  submit: () => void;
}

export interface FormContextValue {
  form: FormInstance;
  disabled?: boolean;
  layout: FormLayout;
  labelCol?: unknown;
  wrapperCol?: unknown;
  colon?: boolean;
  requiredMark?: boolean;
  registerField: (name: FormNamePath, rules?: FormRule[]) => () => void;
  getFieldError: (name: FormNamePath) => ReactNode[];
  setFieldError: (name: FormNamePath, errors: ReactNode[]) => void;
}

export interface FormProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<ComponentProps<"form">, "children" | "onSubmit" | "onFinish" | "onChange"> {
  children?: ReactNode;
  form?: FormInstance<T>;
  initialValues?: Partial<T>;
  layout?: FormLayout;
  disabled?: boolean;
  labelCol?: unknown;
  wrapperCol?: unknown;
  colon?: boolean;
  requiredMark?: boolean;
  onFinish?: (values: Partial<T>) => void;
  onFinishFailed?: (errorInfo: { errorFields: FieldError[]; values: Partial<T> }) => void;
  onValuesChange?: (changedValues: Partial<T>, values: Partial<T>) => void;
}

export interface FormItemProps
  extends Omit<ComponentProps<"div">, "children" | "onChange" | "title"> {
  children?: ReactNode;
  name?: FormNamePath;
  label?: ReactNode;
  rules?: FormRule[];
  required?: boolean;
  valuePropName?: string;
  trigger?: string;
  extra?: ReactNode;
  help?: ReactNode;
  noStyle?: boolean;
}

export interface FormListFieldData {
  key: number;
  name: number;
  fieldKey: number;
}

export interface FormListOperation {
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export interface FormListProps {
  name: FormNamePath;
  initialValue?: unknown[];
  children: (
    fields: FormListFieldData[],
    operation: FormListOperation,
    meta: { errors: ReactNode[] },
  ) => ReactNode;
}

export interface ErrorListProps extends ComponentProps<"div"> {
  errors?: ReactNode[];
}

export interface FormProviderProps {
  children?: ReactNode;
  onFormChange?: (name: string, info: { changedFields: unknown[]; forms: Record<string, FormInstance> }) => void;
  onFormFinish?: (name: string, info: { values: unknown; forms: Record<string, FormInstance> }) => void;
}

export type FormItemComponent = ForwardRefExoticComponent<
  FormItemProps & RefAttributes<HTMLDivElement>
>;

export type FormListComponent = (props: FormListProps) => ReactElement | null;

export interface FormComponent {
  <T extends Record<string, unknown> = Record<string, unknown>>(
    props: FormProps<T> & RefAttributes<FormInstance<T>>,
  ): ReactElement | null;
  useForm: <T extends Record<string, unknown> = Record<string, unknown>>(
    form?: FormInstance<T>,
  ) => [FormInstance<T>];
  useFormInstance: () => FormInstance;
  useWatch: (name: FormNamePath, form?: FormInstance) => unknown;
  Item: FormItemComponent;
  List: FormListComponent;
  ErrorList: ForwardRefExoticComponent<
    ErrorListProps & RefAttributes<HTMLDivElement>
  >;
  Provider: (props: FormProviderProps) => ReactElement | null;
  Context: Context<FormContextValue | null>;
  create: () => void;
}
