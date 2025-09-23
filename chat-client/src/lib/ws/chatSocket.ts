import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "../auth-utils";

export type OnMessage = (msg: any) => void;

export class ChatStompClient {
  private _client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private channelSubscription: StompSubscription | null = null;
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
    this._client = client;
  }

  // 채널별 구독 추가 (이미 연결된 클라이언트에 채널 구독 추가)
  subscribeToChannel(channelId: number, onChannelMessage: OnMessage) {
    console.log("🔔 [ChatStompClient] 채널 구독 시도:", channelId, "연결상태:", !!this._client?.connected);
    
    if (!this._client || !this._client.connected) {
      console.error("🔔 [ChatStompClient] 채널 구독 실패: 클라이언트 미연결");
      return;
    }
    
    try {
      console.log("🔔 [ChatStompClient] 채널 구독 경로:", `/sub/chat/channel/${channelId}`);
      this.channelSubscription = this._client.subscribe(`/sub/chat/channel/${channelId}`, (msg: IMessage) => {
        console.log("🔔 [ChatStompClient] ⭐ 채널 메시지 원본 수신! ⭐", msg);
        console.log("🔔 [ChatStompClient] 메시지 바디:", msg.body);
        try {
          const body = JSON.parse(msg.body);
          console.log("🔔 [ChatStompClient] ⭐ 채널 메시지 파싱 성공! ⭐", body);
          onChannelMessage(body);
        } catch (parseError) {
          console.log("🔔 [ChatStompClient] 채널 메시지 파싱 실패, 원본 전달:", msg.body);
          console.error("🔔 [ChatStompClient] 파싱 에러:", parseError);
          onChannelMessage(msg.body);
        }
      });
      console.log("🔔 [ChatStompClient] 채널 구독 성공!");
    } catch (error) {
      console.error("🔔 [ChatStompClient] 채널 구독 실패:", error);
    }
  }

  // 채널 구독 해제
  unsubscribeFromChannel() {
    try { this.channelSubscription?.unsubscribe(); } catch {}
    this.channelSubscription = null;
  }

  disconnect() {
    // 시퀀스를 증가시켜 이후 도착할 과거 onConnect 콜백을 무지
    this.connectSeq += 1;
    try { this.subscription?.unsubscribe(); } catch {}
    try { this.channelSubscription?.unsubscribe(); } catch {}
    try { this._client?.deactivate(); } catch {}
    this.subscription = null;
    this.channelSubscription = null;
    this._client = null;
  }

  // 연결 상태 확인을 위한 getter
  get client() {
    return this._client;
  }

  sendText(threadId: number, senderType: "USER" | "ADMIN", content: string, actor = "client"): boolean {
    if (!this._client || !this._client.connected) return false;
    const payload = { senderType, content, actor };
    this._client.publish({ destination: `/pub/chat/${threadId}/send`, body: JSON.stringify(payload) });
    return true;
  }
}



