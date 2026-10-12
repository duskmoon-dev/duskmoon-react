import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Chat } from "@duskmoon-dev/components";
import type { ChatComposerSubmission } from "@duskmoon-dev/components";

function ComposerFixture() {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [admission, setAdmission] = useState("accept");
  const [error, setError] = useState("");
  const [mount, setMount] = useState(0);
  const [items, setItems] = useState<
    { id: string; label: string; disabled?: boolean }[]
  >([]);
  const [submissions, setSubmissions] = useState<
    { value: string; files: string[] }[]
  >([]);
  const pending = useRef<((accepted: boolean) => void) | null>(null);

  async function submit(submission: ChatComposerSubmission) {
    setSubmissions((current) => [
      ...current,
      {
        value: submission.value,
        files: submission.files.map((file) => file.name),
      },
    ]);
    if (admission === "reject") {
      setError("Server rejected this message. Your draft is preserved.");
      return false;
    }
    if (admission === "pending") {
      return new Promise<boolean>((resolve) => {
        pending.current = resolve;
      });
    }
    return true;
  }

  return (
    <section
      data-chat-composer-fixture
      aria-label="Composer browser fixture"
      style={{
        width: "min(640px, 100%)",
        margin: "1rem auto",
        padding: "1rem",
      }}
    >
      <fieldset>
        <legend>Test application controls</legend>
        <label>
          Admission
          <select
            aria-label="Admission"
            value={admission}
            onChange={(event) => setAdmission(event.target.value)}
          >
            <option value="accept">Accept</option>
            <option value="reject">Reject</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            pending.current?.(true);
            pending.current = null;
          }}
        >
          Accept pending submission
        </button>
        <button
          type="button"
          onClick={() => setMount((current) => current + 1)}
        >
          Remount composer
        </button>
        <button type="button" onClick={() => setGenerating(true)}>
          Start streaming
        </button>
        <button
          type="button"
          onClick={() => {
            setTimeout(() => {
              setItems([
                { id: "unavailable", label: "/unavailable", disabled: true },
                { id: "help", label: "/help" },
                { id: "review", label: "/review" },
              ]);
            }, 100);
          }}
        >
          Load completions asynchronously
        </button>
        <button
          type="button"
          onClick={() => {
            setTimeout(
              () => setItems([{ id: "remote", label: "/remote" }]),
              100,
            );
          }}
        >
          Replace completions asynchronously
        </button>
      </fieldset>
      <Chat.Composer
        key={mount}
        value={value}
        onValueChange={setValue}
        attachments={files}
        onAttachmentsChange={setFiles}
        allowAttachmentOnly
        generating={generating}
        onStop={() => setGenerating(false)}
        onSubmit={submit}
        error={error || undefined}
        minRows={1}
        maxRows={4}
        completion={{
          items: value.startsWith("/") ? items : [],
          label: "Commands and skills",
          onSelect: (item) => setValue(`${item.label} `),
        }}
        textareaProps={{ "aria-label": "Fixture message" }}
      />
      <output aria-label="Streaming state">
        {generating ? "Streaming" : "Stopped"}
      </output>
      <pre aria-label="Submitted snapshots">{JSON.stringify(submissions)}</pre>
    </section>
  );
}

export function mountComposerFixture() {
  const container = document.createElement("div");
  document.body.replaceChildren(container);
  createRoot(container).render(<ComposerFixture />);
}
