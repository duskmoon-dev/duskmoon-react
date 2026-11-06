/** Local typing for the verified JavaScript public extension. No hook implementation. */
declare module "phoenix_duskmoon/react-chat" {
  import type React from "react";
  export interface PhoenixBridge {
    send(action: string, payload: Record<string, unknown>): Promise<unknown>;
  }
  export interface PhoenixComposerContext {
    state: { conversationId: string };
    bridge: PhoenixBridge;
    connected: boolean;
    synchronizing: boolean;
    active: boolean;
    canSubmit: boolean;
    runtime: { active?: boolean; activeTurnId?: string };
  }
  export interface PhoenixChatHook {
    mounted(): void;
    disconnected(): void;
    reconnected(): void;
    destroyed(): void;
    bridge: PhoenixBridge;
  }
  export function createDuskmoonReactChat(options: {
    Composer: React.ComponentType<PhoenixComposerContext>;
  }): PhoenixChatHook;
}
