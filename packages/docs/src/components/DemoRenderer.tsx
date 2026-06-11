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

function DmSplitterPreview() {
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
      <DmComponents.DmSplitter
        defaultSizes={[180, "1fr"]}
        gap={8}
        style={{ width: "100%" }}
      >
        <DmComponents.DmSplitter.Panel style={panelStyle}>
          Navigation
        </DmComponents.DmSplitter.Panel>
        <DmComponents.DmSplitter.Panel style={panelStyle}>
          Workspace
        </DmComponents.DmSplitter.Panel>
      </DmComponents.DmSplitter>
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

  // Match <ComponentName ...>...</ComponentName> or <ComponentName ... />
  const jsxRegex = new RegExp(
    `<${normalizedComponentName}\\b([\\s\\S]*?)(?:>([\\s\\S]*?)</${normalizedComponentName}>|/>)`,
  );
  const match = code.match(jsxRegex);
  if (!match) return null;

  const propsText = match[1];
  const childrenText = match[2] || "";

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
  const isHook =
    componentId.startsWith("use-") || componentName.startsWith("use");
  const isUtility =
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

  if (componentId === "grid") {
    return <GridPreview />;
  }

  if (componentId === "dm-splitter") {
    return <DmSplitterPreview />;
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
          : { padding: "8px 0" }
      }
    >
      <Component {...parsed.props}>{parsed.children || undefined}</Component>
    </div>
  );
}
