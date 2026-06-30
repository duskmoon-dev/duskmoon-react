import React from "react";
import * as ArtComponents from "@duskmoon-dev/art-components";
import * as DmComponents from "@duskmoon-dev/components";

interface DemoRendererProps {
  componentId: string;
  componentName: string;
  demoTitle: string;
  demoCode: string;
}

type ParsedProps = Record<string, unknown>;

const typeOnlyInfrastructureExports = new Set(["breakpoint"]);
const alertColors = ["info", "success", "warning", "error"] as const;
const alertAppearances = ["filled", "outline", "tonal"] as const;

function AlertPreview() {
  return (
    <div
      style={{
        display: "grid",
        gap: "14px",
        width: "100%",
      }}
    >
      {alertAppearances.map((appearance) => (
        <section
          key={appearance}
          aria-label={`${appearance} alerts`}
          style={{
            display: "grid",
            gap: "8px",
          }}
        >
          <h4
            style={{
              margin: 0,
              color: "var(--dm-muted)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {appearance}
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "8px",
            }}
          >
            {alertColors.map((color) => (
              <DmComponents.Alert
                key={`${appearance}-${color}`}
                color={color}
                appearance={appearance}
              >
                {color} alert
              </DmComponents.Alert>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function GridPreview() {
  const screens = DmComponents.Grid.useBreakpoint();
  const active = Object.entries(screens)
    .filter(([, matches]) => matches)
    .map(([breakpoint]) => breakpoint);

  return (
    <div
      style={{
        display: "grid",
        gap: "10px",
        width: "min(420px, 100%)",
        padding: "12px",
        background: "var(--dm-surface)",
        border: "1px solid var(--dm-border)",
        borderRadius: "8px",
      }}
    >
      <strong style={{ fontSize: "14px" }}>Current breakpoints</strong>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {Object.entries(screens).map(([breakpoint, matches]) => (
          <span
            key={breakpoint}
            style={{
              padding: "4px 8px",
              borderRadius: "999px",
              background: matches
                ? "var(--dm-primary-soft)"
                : "var(--dm-surface-soft)",
              color: matches ? "var(--dm-primary)" : "var(--dm-muted)",
              border: "1px solid var(--dm-border)",
              fontSize: "12px",
              fontWeight: matches ? 700 : 500,
            }}
          >
            {breakpoint}
          </span>
        ))}
      </div>
      <span style={{ color: "var(--dm-muted)", fontSize: "13px" }}>
        {active.length ? `Active: ${active.join(", ")}` : "No active matches"}
      </span>
    </div>
  );
}

function SplitterPreview({ variant }: { variant: "standard" | "dm" }) {
  const Root =
    variant === "dm" ? DmComponents.DmSplitter : DmComponents.Splitter;
  const Panel = Root.Panel;
  const panelStyle: React.CSSProperties = {
    display: "grid",
    minHeight: "92px",
    placeItems: "center",
    padding: "12px",
    background: "var(--dm-surface)",
    border: "1px solid var(--dm-border)",
    borderRadius: "6px",
    color: "var(--dm-text)",
    fontWeight: 600,
  };

  return (
    <div style={{ width: "min(560px, 100%)" }}>
      <Root
        defaultSizes={["34%", "66%"]}
        gap={variant === "dm" ? 8 : undefined}
        style={{ width: "100%" }}
      >
        <Panel style={panelStyle}>Navigation</Panel>
        <Panel style={panelStyle}>Workspace</Panel>
      </Root>
    </div>
  );
}

function FlexPreview() {
  const itemStyle: React.CSSProperties = {
    padding: "10px 14px",
    background: "var(--color-primary-container)",
    color: "var(--color-primary)",
    borderRadius: "6px",
    fontWeight: 700,
  };

  return (
    <DmComponents.Flex gap="middle" wrap align="center" style={{ width: "100%" }}>
      <span style={itemStyle}>Alpha</span>
      <span style={itemStyle}>Beta</span>
      <span style={itemStyle}>Gamma</span>
    </DmComponents.Flex>
  );
}

function FormPreview() {
  return (
    <DmComponents.Form
      layout="vertical"
      initialValues={{ project: "DuskMoon" }}
      style={{ width: "min(420px, 100%)" }}
      onFinish={(values) => console.log(values)}
    >
      <DmComponents.Form.Item
        name="project"
        label="Project"
        rules={[{ required: true, message: "Project is required" }]}
        extra="The name shown in dashboards."
      >
        <DmComponents.Input placeholder="Project name" />
      </DmComponents.Form.Item>
      <DmComponents.Form.Item>
        <DmComponents.Button color="primary">Save</DmComponents.Button>
      </DmComponents.Form.Item>
    </DmComponents.Form>
  );
}

function LayoutPreview() {
  return (
    <DmComponents.Layout style={{ width: "min(640px, 100%)" }}>
      <DmComponents.Layout.Header>Header</DmComponents.Layout.Header>
      <DmComponents.Layout hasSider>
        <DmComponents.Layout.Sider width={160}>Sider</DmComponents.Layout.Sider>
        <DmComponents.Layout.Content>Content</DmComponents.Layout.Content>
      </DmComponents.Layout>
      <DmComponents.Layout.Footer>Footer</DmComponents.Layout.Footer>
    </DmComponents.Layout>
  );
}

function RowPreview() {
  const cellStyle: React.CSSProperties = {
    display: "grid",
    minHeight: "56px",
    placeItems: "center",
    color: "var(--color-primary)",
    fontSize: "13px",
    fontWeight: 800,
    background: "var(--color-primary-container)",
    border: "1px solid var(--color-outline-variant)",
    borderRadius: "6px",
  };

  return (
    <DmComponents.Row
      gutter={[12, 12]}
      align="middle"
      justify="space-between"
      style={{ width: "100%" }}
    >
      <DmComponents.Col span={7}>
        <div style={cellStyle}>span 7</div>
      </DmComponents.Col>
      <DmComponents.Col span={7}>
        <div style={cellStyle}>span 7</div>
      </DmComponents.Col>
      <DmComponents.Col span={7}>
        <div style={cellStyle}>span 7</div>
      </DmComponents.Col>
    </DmComponents.Row>
  );
}

function SpacePreview() {
  const itemStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    color: "var(--color-primary)",
    fontSize: "13px",
    fontWeight: 800,
    background: "var(--color-primary-container)",
    border: "1px solid var(--color-outline-variant)",
    borderRadius: "6px",
  };

  return (
    <DmComponents.Space size="middle" wrap split="|">
      <span style={itemStyle}>Design</span>
      <span style={itemStyle}>Build</span>
      <span style={itemStyle}>Ship</span>
    </DmComponents.Space>
  );
}

function ListPreview() {
  const items = [
    { title: "Design tokens", description: "Updated color and spacing scale" },
    { title: "Components", description: "Reviewed visual states" },
    { title: "Release", description: "Ready for package validation" },
  ];

  return (
    <DmComponents.List bordered style={{ width: "min(520px, 100%)" }}>
      {items.map((item) => (
        <DmComponents.List.Item key={item.title} extra="Open">
          <DmComponents.List.Item.Meta
            title={item.title}
            description={item.description}
          />
        </DmComponents.List.Item>
      ))}
    </DmComponents.List>
  );
}

function ModalPreview() {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <DmComponents.Button color="primary" onClick={() => setOpen(true)}>
        Open modal
      </DmComponents.Button>
      <DmComponents.Modal
        open={open}
        title="Release checklist"
        width={420}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        Review component styles before publishing the package.
      </DmComponents.Modal>
    </div>
  );
}

function parsePropsText(propsText: string): ParsedProps {
  const props: ParsedProps = {};
  let i = 0;
  const len = propsText.length;

  function skipWhitespaceAndComments() {
    while (i < len) {
      const char = propsText[i];
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      // Check for single-line comment
      if (char === "/" && i + 1 < len && propsText[i + 1] === "/") {
        i += 2;
        while (i < len && propsText[i] !== "\n") {
          i++;
        }
        continue;
      }
      // Check for multi-line comment
      if (char === "/" && i + 1 < len && propsText[i + 1] === "*") {
        i += 2;
        while (
          i < len &&
          !(propsText[i] === "*" && i + 1 < len && propsText[i + 1] === "/")
        ) {
          i++;
        }
        if (i < len) i += 2; // skip '*/'
        continue;
      }
      // Check for JSX style comment {/* ... */}
      if (
        char === "{" &&
        i + 2 < len &&
        propsText[i + 1] === "/" &&
        propsText[i + 2] === "*"
      ) {
        i += 3;
        while (
          i < len &&
          !(
            propsText[i] === "*" &&
            i + 1 < len &&
            propsText[i + 1] === "/" &&
            i + 2 < len &&
            propsText[i + 2] === "}"
          )
        ) {
          i++;
        }
        if (i < len) i += 3; // skip '*/}'
        continue;
      }
      break;
    }
  }

  while (i < len) {
    skipWhitespaceAndComments();
    if (i >= len) break;

    // Read prop name (alphanumeric, -, etc.)
    const nameStart = i;
    while (i < len && /[a-zA-Z0-9_-]/.test(propsText[i])) {
      i++;
    }
    const propName = propsText.slice(nameStart, i);
    if (!propName) {
      // If we couldn't read a prop name, skip a character to avoid infinite loop
      i++;
      continue;
    }

    skipWhitespaceAndComments();

    if (i < len && propsText[i] === "=") {
      i++; // skip '='
      skipWhitespaceAndComments();
      if (i >= len) {
        props[propName] = true;
        break;
      }

      const char = propsText[i];
      if (char === '"' || char === "'") {
        // String literal
        const quote = char;
        i++; // skip quote
        const valStart = i;
        while (i < len && propsText[i] !== quote) {
          if (propsText[i] === "\\" && i + 1 < len) {
            i += 2;
          } else {
            i++;
          }
        }
        const val = propsText.slice(valStart, i);
        if (i < len) i++; // skip ending quote
        props[propName] = val;
      } else if (char === "{") {
        // Braced expression
        i++; // skip '{'
        let braceCount = 1;
        const valStart = i;
        let inDoubleQuote = false;
        let inSingleQuote = false;
        let inBacktick = false;

        while (i < len && braceCount > 0) {
          const c = propsText[i];
          if (inDoubleQuote) {
            if (c === "\\" && i + 1 < len) i += 2;
            else {
              if (c === '"') inDoubleQuote = false;
              i++;
            }
          } else if (inSingleQuote) {
            if (c === "\\" && i + 1 < len) i += 2;
            else {
              if (c === "'") inSingleQuote = false;
              i++;
            }
          } else if (inBacktick) {
            if (c === "\\" && i + 1 < len) i += 2;
            else {
              if (c === "`") inBacktick = false;
              i++;
            }
          } else {
            if (c === '"') inDoubleQuote = true;
            else if (c === "'") inSingleQuote = true;
            else if (c === "`") inBacktick = true;
            else if (c === "{") braceCount++;
            else if (c === "}") braceCount--;
            i++;
          }
        }

        // braceCount should be 0 here, unless malformed
        const bracesVal = propsText.slice(valStart, i - 1);

        // Evaluate the bracesVal
        const trimmed = bracesVal.trim();
        if (trimmed === "true") props[propName] = true;
        else if (trimmed === "false") props[propName] = false;
        else if (!isNaN(Number(trimmed))) props[propName] = Number(trimmed);
        else if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          try {
            props[propName] = new Function(`return (${trimmed})`)();
          } catch (error) {
            console.error("Failed to parse prop value:", trimmed, error);
          }
        } else if (
          trimmed.startsWith("(") ||
          trimmed.includes("=>") ||
          trimmed.startsWith("function")
        ) {
          try {
            props[propName] = new Function(`return (${trimmed})`)();
          } catch {
            // Fallback for callback/function
            props[propName] = (...args: unknown[]) => {
              console.log(`Triggered function for ${propName}`, args);
            };
          }
        } else {
          try {
            props[propName] = new Function(`return (${trimmed})`)();
          } catch {
            props[propName] = trimmed;
          }
        }
      } else {
        // Unquoted value or something else, read until next whitespace
        const valStart = i;
        while (i < len && !/\s/.test(propsText[i])) {
          i++;
        }
        const val = propsText.slice(valStart, i);
        props[propName] = val === "true" ? true : val === "false" ? false : val;
      }
    } else {
      // Boolean shorthand
      props[propName] = true;
    }
  }

  return props;
}

function parseJsx(code: string, componentName: string) {
  const normalizedComponentName = componentName.trim();
  const openTag = `<${normalizedComponentName}`;
  const openStart = code.indexOf(openTag);

  if (openStart === -1) return null;

  let i = openStart + openTag.length;
  let braceDepth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let openingEnd = -1;

  while (i < code.length) {
    const char = code[i];

    if (quote) {
      if (char === "\\" && i + 1 < code.length) {
        i += 2;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      i += 1;
      continue;
    }

    if (char === "{") {
      braceDepth += 1;
      i += 1;
      continue;
    }

    if (char === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      i += 1;
      continue;
    }

    if (char === ">" && braceDepth === 0) {
      openingEnd = i;
      break;
    }

    i += 1;
  }

  if (openingEnd === -1) return null;

  const rawPropsText = code.slice(openStart + openTag.length, openingEnd);
  const selfClosing = rawPropsText.trimEnd().endsWith("/");
  const propsText = selfClosing
    ? rawPropsText.replace(/\/\s*$/, "")
    : rawPropsText;
  const closeTag = `</${normalizedComponentName}>`;
  const closeStart = selfClosing ? -1 : code.indexOf(closeTag, openingEnd + 1);
  const childrenText =
    selfClosing || closeStart === -1
      ? ""
      : code.slice(openingEnd + 1, closeStart);

  const props = parsePropsText(propsText);

  return { props, children: childrenText.trim() };
}

export default function DemoRenderer({
  componentId,
  componentName,
  demoCode,
}: DemoRendererProps) {
  // Handle special case utility/hook/types
  const isArtComponent = componentId.startsWith("art-");
  const isTypeOnlyInfrastructure =
    typeOnlyInfrastructureExports.has(componentId);
  const isHook =
    componentId.startsWith("use-") || componentName.startsWith("use");
  const isUtility =
    isTypeOnlyInfrastructure ||
    componentId.startsWith("get-") ||
    componentId.startsWith("set-") ||
    componentId.startsWith("on-") ||
    componentId.startsWith("unstable-") ||
    componentId === "version" ||
    componentId === "theme";

  if (isHook) {
    return (
      <div
        style={{
          padding: "8px 12px",
          background: "var(--dm-surface)",
          borderRadius: "6px",
          fontSize: "14px",
          color: "var(--dm-muted)",
          border: "1px dashed var(--dm-border)",
        }}
      >
        React Hook (no visual preview)
      </div>
    );
  }

  if (isUtility) {
    if (isTypeOnlyInfrastructure) {
      return (
        <div
          style={{
            padding: "8px 12px",
            background: "var(--dm-surface)",
            borderRadius: "6px",
            fontSize: "14px",
            color: "var(--dm-muted)",
            border: "1px dashed var(--dm-border)",
          }}
        >
          Type-only export (no visual preview)
        </div>
      );
    }

    if (componentId === "version") {
      return (
        <div
          style={{
            padding: "8px 12px",
            background: "var(--dm-surface)",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            border: "1px solid var(--dm-border)",
          }}
        >
          DuskMoon SDK Version: {DmComponents.version}
        </div>
      );
    }
    return (
      <div
        style={{
          padding: "8px 12px",
          background: "var(--dm-surface)",
          borderRadius: "6px",
          fontSize: "14px",
          color: "var(--dm-muted)",
          border: "1px dashed var(--dm-border)",
        }}
      >
        Utility Function / Configuration Helper (no visual preview)
      </div>
    );
  }

  // Handle messaging APIs (message, DmMessage, notification)
  if (componentId === "dm-message") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <DmComponents.DmMessageHolder />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <DmComponents.Button
            onClick={() =>
              DmComponents.DmMessage.info("Info message triggered!")
            }
          >
            Info Message
          </DmComponents.Button>
          <DmComponents.Button
            color="success"
            onClick={() =>
              DmComponents.DmMessage.success("Action completed successfully!")
            }
          >
            Success Message
          </DmComponents.Button>
          <DmComponents.Button
            color="error"
            onClick={() =>
              DmComponents.DmMessage.error("An error has occurred!")
            }
          >
            Error Message
          </DmComponents.Button>
        </div>
      </div>
    );
  }

  if (componentId === "message") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <DmComponents.MessageHolder />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <DmComponents.Button
            onClick={() => DmComponents.message.info("Info notification!")}
          >
            Info
          </DmComponents.Button>
          <DmComponents.Button
            color="success"
            onClick={() => DmComponents.message.success("Success!")}
          >
            Success
          </DmComponents.Button>
          <DmComponents.Button
            color="warning"
            onClick={() => DmComponents.message.warning("Warning alert!")}
          >
            Warning
          </DmComponents.Button>
        </div>
      </div>
    );
  }

  if (componentId === "notification") {
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <DmComponents.Button
          onClick={() =>
            DmComponents.notification.open({
              message: "Notification",
              description:
                "This is a global notification triggered dynamically.",
            })
          }
        >
          Trigger Notification
        </DmComponents.Button>
      </div>
    );
  }

  if (componentId === "alert") {
    return <AlertPreview />;
  }

  if (componentId === "grid") {
    return <GridPreview />;
  }

  if (componentId === "flex") {
    return <FlexPreview />;
  }

  if (componentId === "form") {
    return <FormPreview />;
  }

  if (componentId === "layout") {
    return <LayoutPreview />;
  }

  if (componentId === "row") {
    return <RowPreview />;
  }

  if (componentId === "space") {
    return <SpacePreview />;
  }

  if (componentId === "list") {
    return <ListPreview />;
  }

  if (componentId === "modal") {
    return <ModalPreview />;
  }

  if (componentId === "carousel") {
    return (
      <DmComponents.Carousel arrows>
        <div>Research</div>
        <div>Design</div>
        <div>Ship</div>
      </DmComponents.Carousel>
    );
  }

  if (componentId === "splitter") {
    return <SplitterPreview variant="standard" />;
  }

  if (componentId === "dm-splitter") {
    return <SplitterPreview variant="dm" />;
  }

  // Handle standard React component rendering
  const componentPackage = isArtComponent ? ArtComponents : DmComponents;
  const Component = (
    componentPackage as Record<
      string,
      | React.ComponentType<ParsedProps & { children?: React.ReactNode }>
      | undefined
    >
  )[componentName];
  if (!Component) {
    return (
      <div style={{ color: "red", fontSize: "14px" }}>
        Component {componentName} not found in package exports.
      </div>
    );
  }

  // Check if it's a theme-aware comparison demo
  if (
    demoCode.includes('data-theme="sunshine"') ||
    demoCode.includes('data-theme="moonlight"')
  ) {
    // Extract JSX code from within data-theme block to parse
    const match = demoCode.match(
      new RegExp('<div data-theme="sunshine">([\\s\\S]*?)</div>'),
    );
    const innerCode = match ? match[1] : demoCode;
    const parsed = parseJsx(innerCode, componentName);

    if (!parsed) {
      return (
        <div style={{ color: "red", fontSize: "14px" }}>
          Failed to parse demo preview code.
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            border: "1px solid var(--dm-border)",
            borderRadius: "8px",
            padding: "16px",
            background: "#fff",
          }}
          data-theme="sunshine"
        >
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            Sunshine Theme
          </div>
          <div>
            <Component {...parsed.props}>
              {parsed.children || undefined}
            </Component>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            border: "1px dashed #30384d",
            borderRadius: "8px",
            padding: "16px",
            background: "#171b25",
          }}
          data-theme="moonlight"
        >
          <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "4px" }}>
            Moonlight Theme
          </div>
          <div>
            <Component {...parsed.props}>
              {parsed.children || undefined}
            </Component>
          </div>
        </div>
      </div>
    );
  }

  // Parse standard demo JSX
  const parsed = parseJsx(demoCode, componentName);
  if (!parsed) {
    return (
      <div style={{ color: "red", fontSize: "14px" }}>
        Failed to parse JSX structure.
      </div>
    );
  }

  return (
    <div
      style={
        isArtComponent
          ? {
              display: "grid",
              placeItems: "center",
              width: "100%",
              padding: "12px 0",
            }
          : { width: "100%", padding: "8px 0" }
      }
    >
      <Component {...parsed.props}>{parsed.children || undefined}</Component>
    </div>
  );
}
