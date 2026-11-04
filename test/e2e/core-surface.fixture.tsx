import { createRoot } from "react-dom/client";
import { Alert, Badge, Button, Tag, Tabs } from "@duskmoon-dev/components";
import type { ButtonColor } from "@duskmoon-dev/components";

const roles: readonly ButtonColor[] = [
  "primary",
  "secondary",
  "tertiary",
  "info",
  "success",
  "warning",
  "error",
  "accent",
  "base",
];

function SurfaceFixture() {
  return (
    <section
      aria-label="Surface contract fixture"
      style={{
        background: "var(--color-surface)",
        color: "var(--color-on-surface)",
        padding: 24,
      }}
    >
      {roles.map((color) => (
        <div
          key={color}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Button
            data-contrast={`${color}/button-outline`}
            color={color}
            appearance="outline"
          >
            Outlined action
          </Button>
          <Button
            data-contrast={`${color}/button-ghost`}
            color={color}
            appearance="ghost"
          >
            Ghost action
          </Button>
          <Button
            data-contrast={`${color}/button-tonal`}
            color={color}
            appearance="tonal"
          >
            Tonal action
          </Button>
          <Badge
            data-contrast={`${color}/badge-outline`}
            color={color}
            appearance="outline"
          >
            Outlined label
          </Badge>
          <Badge
            data-contrast={`${color}/badge-ghost`}
            color={color}
            appearance="ghost"
          >
            Ghost label
          </Badge>
          <Badge
            data-contrast={`${color}/badge-tonal`}
            color={color}
            appearance="tonal"
          >
            Tonal label
          </Badge>
          <Tag data-contrast={`${color}/tag-outline`} color={color}>
            Outlined tag
          </Tag>
          <Alert
            data-contrast={`${color}/alert-outline`}
            color={color}
            appearance="outline"
          >
            Outlined notice
          </Alert>
        </div>
      ))}
      <Tabs
        items={[
          { key: "active", label: "Selected tab", children: "Tab content" },
        ]}
      />
      <div style={{ width: 64 }}>
        <Badge data-nowrap="badge" color="primary">
          A label with several words
        </Badge>
        <Tag data-nowrap="tag" color="primary">
          A tag with several words
        </Tag>
      </div>
    </section>
  );
}

export function mountSurfaceFixture() {
  const container = document.createElement("div");
  document.body.replaceChildren(container);
  createRoot(container).render(<SurfaceFixture />);
}
