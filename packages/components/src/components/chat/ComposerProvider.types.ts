import type {
  ComposerDocument,
  ComposerError,
  ComposerProvider,
  ComposerProviderAction,
  ComposerProviderCandidate,
  ComposerProviderRequest,
  ComposerProviderResult,
  ComposerScope,
} from "./Composer.types";

export interface ComposerProviderBreadcrumb {
  readonly refId: string;
  readonly label: string;
}

/** Runtime navigation context; it does not change the portable request schema. */
export interface ComposerProviderNavigation {
  readonly breadcrumbs: readonly ComposerProviderBreadcrumb[];
  readonly refId?: string;
}

export interface ComposerCompletionProvider extends ComposerProvider {
  readonly label?: string;
  /** Commands and editable skills can share a marker with distinct providers. */
  readonly trigger: {
    readonly text: string;
    readonly position: "leading" | "word";
  };
  readonly query: (
    request: ComposerProviderRequest,
    signal: AbortSignal,
    navigation?: ComposerProviderNavigation,
  ) => Promise<ComposerProviderResult>;
}

/** UTF-16 offsets in one semantic text node. A range selection closes suggestions. */
export interface ComposerProviderSelection {
  readonly nodeIndex: number;
  readonly start: number;
  readonly end: number;
}

export interface ComposerProviderContext {
  readonly document: ComposerDocument;
  readonly documentRevision: number;
  readonly scope: ComposerScope;
  readonly instanceGeneration: number;
  readonly selection: ComposerProviderSelection | null;
  readonly providers: readonly ComposerCompletionProvider[];
  /** Adapter/host availability, independent of a provider's own disabled reason. */
  readonly candidateDisabledReason?: (
    candidate: ComposerProviderCandidate,
  ) => string | undefined;
}

export interface ComposerProviderItem {
  /** Stable, DOM-safe identity derived from providerId and candidate.id. */
  readonly id: string;
  readonly providerId: string;
  readonly candidate: ComposerProviderCandidate;
  readonly request: ComposerProviderRequest;
}

export type ComposerProviderStatus =
  "idle" | "loading" | "ready" | "empty" | "error";

export interface ComposerProviderGroup {
  readonly providerId: string;
  readonly label: string;
  readonly status: Exclude<ComposerProviderStatus, "idle">;
  readonly items: readonly ComposerProviderItem[];
  readonly request: ComposerProviderRequest;
  readonly error?: ComposerError;
}

export interface ComposerProviderSnapshot {
  readonly status: ComposerProviderStatus;
  readonly groups: readonly ComposerProviderGroup[];
  readonly items: readonly ComposerProviderItem[];
  readonly activeId?: string;
  readonly breadcrumbs: readonly ComposerProviderBreadcrumb[];
  readonly error?: ComposerError;
}

/** Apply this action once, in the adapter transaction for the captured request. */
export interface ComposerProviderSelectionEffect {
  readonly itemId: string;
  readonly request: ComposerProviderRequest;
  readonly candidate: ComposerProviderCandidate;
  readonly action: ComposerProviderAction;
}
