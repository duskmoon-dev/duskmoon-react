import { Button } from "@duskmoon-dev/components/button";
import { cn } from "@duskmoon-dev/components/utils";

export default function Home() {
  const containerClass = cn("test-class", { "active": true });
  return (
    <main style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }} className={containerClass}>
      <h1>Duskmoon React Smoke Test</h1>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Button>Default</Button>
        <Button color="secondary" appearance="outline">Secondary Outline</Button>
        <Button color="success" shape="square">Square</Button>
        <Button color="error" appearance="ghost">Ghost</Button>
        <Button size="lg" block>Large Block</Button>
      </div>
    </main>
  );
}
