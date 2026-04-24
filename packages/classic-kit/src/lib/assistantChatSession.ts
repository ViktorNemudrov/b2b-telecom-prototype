import type { ChatMessage } from "@shared/lib/mockData";

const SESSION_KEY = "b2b_classic.assistantChat.v1";

function isChatMessageArray(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (m) =>
      m &&
      typeof m === "object" &&
      (m as ChatMessage).role !== undefined &&
      typeof (m as ChatMessage).text === "string" &&
      typeof (m as ChatMessage).id === "string"
  );
}

/** Восстановление переписки после возврата (например с /appeals/) в рамках вкладки. */
export function loadAssistantChatSession(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isChatMessageArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function persistAssistantChatSession(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
  } catch {
    /* quota / приватный режим */
  }
}

export function clearAssistantChatSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
