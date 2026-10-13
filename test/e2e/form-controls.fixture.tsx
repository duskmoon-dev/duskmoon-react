import { useState } from "react";
import { createRoot } from "react-dom/client";
import { InputNumber, Select } from "@duskmoon-dev/components";
import type { SelectProps } from "@duskmoon-dev/components/select";
import { JsonSchemaForm } from "../../packages/components/src/components/json-schema-form";

const options = [
  { value: "stdio", label: "Standard input and output transport" },
  { value: "http", label: "HTTP" },
];

function SelectFixture({
  size,
  multiple,
}: {
  size: SelectProps["size"];
  multiple: boolean;
}) {
  const [value, setValue] = useState<SelectProps["value"]>(
    multiple ? ["stdio"] : "stdio",
  );
  const name = `${size} ${multiple ? "multiple" : "single"} transport`;
  return (
    <div style={{ width: 200, maxWidth: "100%" }}>
      <Select
        aria-label={name}
        aria-required="true"
        size={size}
        mode={multiple ? "multiple" : undefined}
        value={value}
        onChange={setValue}
        allowClear
        showSearch
        placeholder="Transport"
        options={options}
      />
      <output aria-label={`${name} value`}>
        {JSON.stringify(value) ?? "empty"}
      </output>
    </div>
  );
}

function FormControlsFixture() {
  const [numberChanges, setNumberChanges] = useState(0);
  const [numberSteps, setNumberSteps] = useState(0);
  const [submitted, setSubmitted] = useState("");
  return (
    <section
      aria-label="Form controls browser fixture"
      style={{
        width: "min(640px, 100%)",
        margin: "1rem auto",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <InputNumber
        aria-label="Read-only number"
        value={2}
        readOnly
        onChange={() => setNumberChanges((count) => count + 1)}
        onStep={() => setNumberSteps((count) => count + 1)}
      />
      <output aria-label="Read-only events">{`${numberChanges}/${numberSteps}`}</output>
      <InputNumber
        aria-label="Editable number"
        defaultValue={2}
        min={0}
        max={3}
        step={0.5}
      />
      <div style={{ display: "grid", gap: "1rem" }}>
        {(["sm", "md", "lg"] as const).flatMap((size) =>
          [false, true].map((multiple) => (
            <SelectFixture
              key={`${size}-${multiple}`}
              size={size}
              multiple={multiple}
            />
          )),
        )}
      </div>
      <JsonSchemaForm
        className="custom-native-form"
        schema={{
          type: "object",
          properties: {
            name: {
              type: "string",
              title: "Name",
              minLength: 2,
              default: "Ada",
            },
          },
          required: ["name"],
        }}
        onSubmit={(value) => setSubmitted(JSON.stringify(value))}
        onReset={() => setSubmitted("")}
      />
      <output aria-label="Submitted form">{submitted || "empty"}</output>
    </section>
  );
}

export function mountFormControlsFixture() {
  const container = document.createElement("div");
  document.body.replaceChildren(container);
  createRoot(container).render(<FormControlsFixture />);
}
