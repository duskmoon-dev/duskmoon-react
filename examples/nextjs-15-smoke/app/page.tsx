"use client";

import { Button } from "@duskmoon-dev/components/button";
import { Card } from "@duskmoon-dev/components/card";
import { Badge } from "@duskmoon-dev/components/badge";
import { Alert } from "@duskmoon-dev/components/alert";
import { Avatar } from "@duskmoon-dev/components/avatar";
import { cn } from "@duskmoon-dev/components/utils";
import { useTheme } from "@duskmoon-dev/components/theme";

export default function Home() {
  const containerClass = cn("test-class", { active: true });
  const { theme, setTheme } = useTheme();

  return (
    <main
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
      className={containerClass}
    >
      <h1>Duskmoon React Smoke Test</h1>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>Current Theme: {theme}</span>
        <Button onClick={() => setTheme("sunshine")}>Sunshine</Button>
        <Button onClick={() => setTheme("moonlight")}>Moonlight</Button>
        <Button onClick={() => setTheme("ocean")}>Ocean</Button>
        <Button onClick={() => setTheme("forest")}>Forest</Button>
      </div>

      <section>
        <h2>Buttons</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Button>Default</Button>
          <Button color="secondary" appearance="outline">
            Secondary Outline
          </Button>
          <Button color="success" shape="square">
            Square
          </Button>
          <Button color="error" appearance="ghost">
            Ghost
          </Button>
          <Button size="lg" block>
            Large Block
          </Button>
        </div>
      </section>

      <section>
        <h2>Badges</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Badge>Default</Badge>
          <Badge color="secondary" appearance="outline">
            Secondary Outline
          </Badge>
          <Badge color="success">Success</Badge>
          <Badge color="error" appearance="ghost">
            Ghost Error
          </Badge>
          <Badge size="lg">Large Badge</Badge>
        </div>
      </section>

      <section>
        <h2>Alerts</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Alert>This is a default alert message.</Alert>
          <Alert color="success" appearance="outline">
            Your action was completed successfully.
          </Alert>
          <Alert color="error" appearance="filled">
            Something went wrong!
          </Alert>
        </div>
      </section>

      <section>
        <h2>Avatars</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Avatar
            src="https://github.com/shadcn.png"
            alt="@shadcn"
            fallback="CN"
          />
          <Avatar size="sm" fallback="SM" />
          <Avatar size="lg" shape="square" fallback="LG" />
        </div>
      </section>

      <section>
        <h2>Cards</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Card>Default Card</Card>
          <Card appearance="outline" padding="lg">
            Outline Large Padding Card
          </Card>
          <Card appearance="filled" padding="none">
            Filled No Padding Card
          </Card>
        </div>
      </section>
    </main>
  );
}
