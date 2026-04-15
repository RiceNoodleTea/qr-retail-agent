"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { id: string; role: ChatRole; content: string };
export type AgentMode = "deals" | "compare" | "reviews" | "find";

type ChatState = {
  sessionId: string;
  productId: string;
  mode: AgentMode;
  setMode: (mode: AgentMode) => void;
  messages: ChatMessage[];
  status: "idle" | "streaming" | "error";
  error: string | null;
  send: (text: string) => Promise<void>;
  stop: () => void;
};

const ChatContext = createContext<ChatState | null>(null);

function getModeFromLocation(): AgentMode | null {
  if (typeof window === "undefined") return null;
  const mode = new URLSearchParams(window.location.search).get("mode");
  if (mode === "deals") return "deals";
  if (mode === "compare") return "compare";
  if (mode === "reviews") return "reviews";
  if (mode === "find") return "find";
  return null;
}

function getOrCreateSessionId(storageKey: string) {
  if (typeof window === "undefined") return `${Date.now()}`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const created =
    globalThis.crypto?.randomUUID?.() ?? `sess_${Date.now()}_${Math.random()}`;
  window.localStorage.setItem(storageKey, created);
  return created;
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `m_${Date.now()}_${Math.random()}`;
}

export function ChatProvider({
  productId,
  children,
}: {
  productId: string;
  children: React.ReactNode;
}) {
  const storageKey = useMemo(() => `qrra_sessionId:${productId}`, [productId]);
  const [sessionId, setSessionId] = useState(() =>
    getOrCreateSessionId(storageKey)
  );
  const [mode, setMode] = useState<AgentMode>(() => getModeFromLocation() ?? "reviews");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatState["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Keep session id stable even if storage key changes (shouldn’t, but safe).
    setSessionId(getOrCreateSessionId(storageKey));
  }, [storageKey]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setStatus("streaming");

      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
      };
      const assistantMessageId = newId();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      try {
        const history = [
          ...messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: trimmed },
        ];

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            sessionId,
            productId,
            mode,
            messages: history,
          }),
        });

        if (!res.ok) {
          const bodyText = await res.text().catch(() => "");
          throw new Error(
            `Chat request failed (${res.status}). ${bodyText}`.trim()
          );
        }

        if (!res.body) {
          throw new Error("No response body from /api/chat.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId ? { ...m, content: acc } : m
            )
          );
        }

        setStatus("idle");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setStatus("error");
        setError((e as Error).message ?? "Chat error");
      } finally {
        abortRef.current = null;
      }
    },
    [mode, productId, sessionId]
  );

  const value = useMemo<ChatState>(
    () => ({
      sessionId,
      productId,
      mode,
      setMode,
      messages,
      status,
      error,
      send,
      stop,
    }),
    [error, messages, mode, productId, send, sessionId, status, stop]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatClient() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatClient must be used within ChatProvider");
  }
  return ctx;
}

