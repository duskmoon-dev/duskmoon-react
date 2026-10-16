import React, { useId, useState } from "react";
import { ArtGeminiInput, ArtPlasmaBall } from "@duskmoon-dev/art-components";

export function PlasmaBallContractPreview() {
  const [checked, setChecked] = useState(false);
  const statusId = useId();

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section aria-label="Plasma ball without base">
        <ArtPlasmaBall
          size="sm"
          hideBase
          checked={checked}
          onCheckedChange={setChecked}
          inputProps={{
            "aria-label": "Power plasma ball",
            "aria-describedby": statusId,
          }}
        />
        <p id={statusId} role="status">
          Plasma power: {checked ? "On" : "Off"}
        </p>
      </section>
      <section aria-label="Disabled plasma ball">
        <ArtPlasmaBall
          size="sm"
          hideBase
          checked={false}
          inputProps={{ "aria-label": "Disabled plasma power", disabled: true }}
        />
        <p>The disabled checkbox cannot change its power state.</p>
      </section>
    </div>
  );
}

export function GeminiInputContractPreview() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [submissions, setSubmissions] = useState(0);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <form
        aria-label="Send a message"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(value);
          setSubmissions((count) => count + 1);
        }}
      >
        <ArtGeminiInput
          size="sm"
          name="message"
          required
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder="Write a message"
          textareaProps={{ "aria-label": "Message to send" }}
          afterButtonProps={{ type: "submit" }}
        />
        <p role="status">
          {submissions
            ? `Submitted ${submissions}: ${submitted}`
            : "No message submitted"}
        </p>
      </form>
      <section aria-label="Read-only Gemini input">
        <ArtGeminiInput
          size="sm"
          readOnly
          after={null}
          beforeButtonProps={{ "aria-label": "Read-only add", disabled: true }}
          defaultValue="Read-only example"
          textareaProps={{ "aria-label": "Read-only message" }}
        />
      </section>
      <section aria-label="Disabled Gemini input">
        <ArtGeminiInput
          size="sm"
          disabled
          defaultValue="Disabled example"
          textareaProps={{ "aria-label": "Disabled message" }}
          beforeButtonProps={{ "aria-label": "Disabled add" }}
          afterButtonProps={{ "aria-label": "Disabled send" }}
        />
      </section>
    </div>
  );
}
