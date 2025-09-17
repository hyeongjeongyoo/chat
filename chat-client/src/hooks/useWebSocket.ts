"use client";

import { useEffect, useRef, useState } from "react";
import { ChatStompClient } from "@/lib/ws/chatSocket";

interface UseWebSocketParams {
  threadId?: number;
  onMessageReceived?: (payload: unknown) => void;
}

interface UseWebSocketResult {
  connected: boolean;
  sendMessage: (payload: unknown) => boolean;
}

export const useWebSocket = ({ threadId, onMessageReceived }: UseWebSocketParams): UseWebSocketResult => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<ChatStompClient | null>(null);

  useEffect(() => {
    // 연결 재설정
    try { clientRef.current?.disconnect(); } catch {}
    clientRef.current = null;
    setConnected(false);

    if (!threadId) return;
    try {
      const c = new ChatStompClient();
      c.connect(threadId, (payload) => {
        try { onMessageReceived?.(payload); } catch {}
      }, () => {
        setConnected(true);
      });
      clientRef.current = c;
      // STOMP는 onConnect 콜백 시점에만 확정되지만, UX를 위해 일단 연결중으로 표시
    } catch {
      setConnected(false);
    }
    return () => {
      try { clientRef.current?.disconnect(); } catch {}
      clientRef.current = null;
      setConnected(false);
    };
  }, [threadId]);

  const sendMessage = (payload: unknown) => {
    try {
      if (!threadId || !clientRef.current) return false;
      const p: any = payload as any;
      const content: string | undefined = p?.content;
      const senderType: "USER" | "ADMIN" = (p?.senderType === "USER" ? "USER" : "ADMIN");
      if (!content || typeof content !== "string") return false;
      clientRef.current.sendText(threadId, senderType, content, "admin");
      return true;
    } catch {
      return false;
    }
  };

  return { connected, sendMessage };
};

export default useWebSocket;