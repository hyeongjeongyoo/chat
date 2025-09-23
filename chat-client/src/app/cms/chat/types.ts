import { useColors } from "@/styles/theme";

export type Colors = ReturnType<typeof useColors>;

export type Message = {
  id: number;
  threadId: number;
  sender: "USER" | "ADMIN";
  content: string;
  createdAt: string;
  attachment?: { 
    name: string; 
    type?: string; 
    size?: number; 
    downloadUrl?: string; 
    previewUrl?: string 
  };
  // 낙관적 로컬 메시지 식별용(WS 수신 시 중복 제거)
  localDraft?: boolean;
  // 수정 여부 배지
  edited?: boolean;
};

export type PanelProps = { 
  colors: Colors 
};

export type Channel = {
  id: number;
  cmsCode: string;
  cmsName?: string;
  unreadCount?: number;
};

export type Thread = {
  id: number;
  channelId: number;
  userIdentifier: string;
  userName?: string;
  unreadCount?: number;
};

export type ThreadFile = {
  fileId: string;
  originName: string;
  mimeType: string;
  createdDate?: string;
};
