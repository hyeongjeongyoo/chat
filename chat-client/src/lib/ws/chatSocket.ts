import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "../auth-utils";

export type OnMessage = (msg: any) => void;

export class ChatStompClient {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private connectSeq: number = 0;

  connect(threadId: number, onMessage: OnMessage, onConnected?: () => void) {
    // 증가하는 연결 시퀀스를 사용해 StrictMode 등으로 인한 레이스로부터 보호
    this.connectSeq += 1;
    const seq = this.connectSeq;
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
      // 오래된 연결 콜백은 무시하고 즉시 종료
      if (seq !== this.connectSeq) {
        try { client.deactivate(); } catch {}
        return;
      }
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
    // 시퀀스를 증가시켜 이후 도착할 과거 onConnect 콜백을 무시
    this.connectSeq += 1;
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



