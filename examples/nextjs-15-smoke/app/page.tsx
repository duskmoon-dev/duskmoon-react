"use client";

import { Button } from "@duskmoon-dev/components/button";
import { cn } from "@duskmoon-dev/components/utils";
import { useTheme } from "@duskmoon-dev/components/theme";

export default function Home() {
  const containerClass = cn("test-class", { "active": true });
  const { theme, setTheme } = useTheme();

  return (
    <main style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }} className={containerClass}>
      <h1>Duskmoon React Smoke Test</h1>
      
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>Current Theme: {theme}</span>
        <Button onClick={() => setTheme("sunshine")}>Sunshine</Button>
        <Button onClick={() => setTheme("moonlight")}>Moonlight</Button>
        <Button onClick={() => setTheme("ocean")}>Ocean</Button>
        <Button onClick={() => setTheme("forest")}>Forest</Button>
      </div>

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
