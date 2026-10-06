import React, { useState } from "react";
import { Button } from "@duskmoon-dev/components/button";
import { JsonSchemaForm } from "./JsonSchemaForm";
import {
  compileForm,
  type CompiledForm,
  type FormValue,
} from "../lib/json-schema-form";
import {
  JSON_FORM_PRESETS,
  type JsonFormPresetId,
} from "../lib/json-form-presets";

const formatted = (id: JsonFormPresetId) =>
  JSON.stringify(
    JSON_FORM_PRESETS.find((preset) => preset.id === id)!.schema,
    null,
    2,
  );

export function JsonSchemaFormDemo({
  initialPreset = "profile",
}: {
  initialPreset?: JsonFormPresetId;
}) {
  const [example, setExample] = useState<JsonFormPresetId>(initialPreset);
  const [source, setSource] = useState(() => formatted(initialPreset));
  const [compiled, setCompiled] = useState<CompiledForm>(() =>
    compileForm(
      JSON_FORM_PRESETS.find((preset) => preset.id === initialPreset)!.schema,
    ),
  );
  const [generation, setGeneration] = useState(0);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<FormValue | null>(null);

  function generate(text: string) {
    try {
      const next = compileForm(JSON.parse(text) as unknown);
      setCompiled(next);
      setGeneration((current) => current + 1);
      setSubmitted(null);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return (
    <div className="json-schema-tool">
      <section className="schema-editor" aria-label="Schema editor">
        <label htmlFor="schema-example">Example schema</label>
        <select
          id="schema-example"
          className="select schema-example-select"
          value={
            JSON_FORM_PRESETS.find((preset) => preset.id === example)!.title
          }
          onChange={(event) => {
            const next = JSON_FORM_PRESETS.find(
              (preset) => preset.title === event.currentTarget.value,
            )!.id;
            setExample(next);
            const text = formatted(next);
            setSource(text);
            generate(text);
          }}
        >
          {JSON_FORM_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.title}>
              {preset.title}
            </option>
          ))}
        </select>
        <label htmlFor="json-schema-source">JSON Schema</label>
        <textarea
          id="json-schema-source"
          className="textarea"
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.currentTarget.value)}
        />
        <Button color="primary" type="button" onClick={() => generate(source)}>
          Generate form
        </Button>
        {error ? <p role="alert">{error}</p> : null}
      </section>
      <section className="schema-preview" aria-label="Generated form preview">
        <h2>{compiled.schema.title ?? "Generated form"}</h2>
        <JsonSchemaForm
          key={generation}
          compiled={compiled}
          onSubmit={setSubmitted}
          onReset={() => setSubmitted(null)}
        />
      </section>
      <section className="schema-output" aria-label="Submitted output">
        <h2>Submitted JSON</h2>
        <pre aria-label="Submitted JSON">
          {submitted === null
            ? "Submit the form to see its JSON."
            : JSON.stringify(submitted, null, 2)}
        </pre>
      </section>
    </div>
  );
}
