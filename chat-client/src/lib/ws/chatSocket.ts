import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "../auth-utils";

export type OnMessage = (msg: any) => void;

export class ChatStompClient {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  connect(threadId: number, onMessage: OnMessage, onConnected?: () => void) {
    let base = (process.env.NEXT_PUBLIC_API_URL as string) || (typeof window !== "undefined" ? window.location.origin : "");
    // 로컬 개발 기본값: Next(3000)에서 직접 WS 호출 시 백엔드 8080으로 보정
    if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== "undefined") {
      try {
        const url = new URL(base);
        if (url.hostname === "localhost" && url.port === "3000") {
          url.port = "8080";
          base = url.toString();
        }
      } catch {}
    }
    base = base.replace(/\/$/, "");
    const token = getToken();
    const wsUrl = `${base}/ws/chat${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    client.onConnect = () => {
      this.subscription = client.subscribe(`/sub/chat/${threadId}`, (msg: IMessage) => {
        try {
          const body = JSON.parse(msg.body);
          onMessage(body);
        } catch {
          onMessage(msg.body);
        }
      });
      try { onConnected?.(); } catch {}
    };

    client.activate();
    this.client = client;
  }

  disconnect() {
    try { this.subscription?.unsubscribe(); } catch {}
    try { this.client?.deactivate(); } catch {}
    this.subscription = null;
    this.client = null;
  }

  sendText(threadId: number, senderType: "USER" | "ADMIN", content: string, actor = "client"): boolean {
    if (!this.client || !this.client.connected) return false;
    const payload = { senderType, content, actor };
    this.client.publish({ destination: `/pub/chat/${threadId}/send`, body: JSON.stringify(payload) });
    return true;
  }
}



