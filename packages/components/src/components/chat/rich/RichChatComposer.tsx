import React, { Component, Suspense, forwardRef, lazy } from "react";
import type {
  RichChatComposerHandle,
  RichChatComposerProps,
} from "../ChatSessionComposer.types";
import type {
  ComposerEditorAdapterProps,
  ComposerEditorHandle,
} from "../composer/EditorAdapter.types";
import { SemanticComposer } from "../composer/SemanticComposer";
import { PreservedDraft } from "../composer/PreservedDraft";

const LazyLexicalEditor = lazy(() => import("./LexicalEditor"));

class EditorBoundary extends Component<
  {
    children: React.ReactNode;
    input: unknown;
    onError?: (error: Error) => void;
  },
  { error?: Error }
> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.error ? (
      <PreservedDraft
        input={this.props.input}
        reason={this.state.error.message}
      />
    ) : (
      this.props.children
    );
  }
}

const OptionalEditor = forwardRef<
  ComposerEditorHandle,
  ComposerEditorAdapterProps
>((props, ref) => (
  <EditorBoundary input={props.value.document} onError={props.onError}>
    <Suspense
      fallback={
        <PreservedDraft
          input={props.value.document}
          reason="Loading rich editor."
          state="pending"
        />
      }
    >
      <LazyLexicalEditor {...props} ref={ref} />
    </Suspense>
  </EditorBoundary>
));
OptionalEditor.displayName = "OptionalComposerEditor";

/** Optional subpath only; legacy/root imports never initialize the editor runtime. */
export const RichChatComposer = forwardRef<
  RichChatComposerHandle,
  RichChatComposerProps
>((props, ref) => (
  <SemanticComposer {...props} ref={ref} Editor={OptionalEditor} structured />
));
RichChatComposer.displayName = "RichChatComposer";
