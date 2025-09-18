import { privateApiMethods as privateApi } from "./client";

export type SenderType = "USER" | "ADMIN";

export interface ChatMessageDto {
	id: number;
	threadId: number;
	senderType: SenderType;
	content: string;
	createdAt: string;
	// Allow extra fields from backend without strict typing
	[key: string]: unknown;
}

export interface SpringPage<T> {
	content: T[];
	first: boolean;
	last: boolean;
	number: number;
	totalPages: number;
	size?: number;
	totalElements?: number;
}

export const chatApi = {
    getChannels: async (): Promise<Array<{ id: number; cmsCode: string; cmsName?: string }>> => {
        return await privateApi.get<Array<{ id: number; cmsCode: string; cmsName?: string }>>(
            `/cms/chat/channels`
        );
    },
    businessHoursStatus: async (): Promise<{ open: boolean; message: string }> => {
        return await privateApi.get<{ open: boolean; message: string }>(
            `/cms/chat/business-hours/status`
        );
    },

    getThreadsByChannel: async (channelId: number): Promise<Array<{ id: number; channelId: number; userIdentifier: string; userName?: string }>> => {
        return await privateApi.get<Array<{ id: number; channelId: number; userIdentifier: string; userName?: string }>>(
            `/cms/chat/channels/${channelId}/threads`
        );
    },
    createOrGetChannel: async (params: { cmsCode: string; cmsName?: string; actor?: string }): Promise<{ id: number; cmsCode: string; cmsName?: string }> => {
        return await privateApi.post<{ id: number; cmsCode: string; cmsName?: string }>(
            `/cms/chat/channels`,
            undefined as any,
            { headers: {}, params: { cmsCode: params.cmsCode, cmsName: params.cmsName, actor: params.actor ?? "system" } } as any
        );
    },

    createOrGetThread: async (params: { channelId: number; userIdentifier: string; userName?: string; userIp?: string; actor?: string }): Promise<{ id: number; channelId: number; userIdentifier: string; userName?: string }> => {
        return await privateApi.post<{ id: number; channelId: number; userIdentifier: string; userName?: string }>(
            `/cms/chat/threads`,
            undefined as any,
            { headers: {}, params: { channelId: params.channelId, userIdentifier: params.userIdentifier, userName: params.userName, userIp: params.userIp, actor: params.actor ?? "system" } } as any
        );
    },
	sendMessage: async (
		threadId: number,
		params: { senderType: SenderType; content: string; actor?: string }
	): Promise<ChatMessageDto> => {
		const body = new URLSearchParams();
		body.append("senderType", params.senderType);
		body.append("content", params.content);
		body.append("actor", params.actor ?? "system");
		return await privateApi.post<ChatMessageDto>(
			`/cms/chat/threads/${threadId}/messages`,
			body as any,
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } } as any
		);
	},

	getMessages: async (
		threadId: number,
		page: number,
		size = 30
	): Promise<SpringPage<ChatMessageDto>> => {
		return await privateApi.get<SpringPage<ChatMessageDto>>(
			`/cms/chat/threads/${threadId}/messages`,
			{ headers: {}, params: { page, size } } as any
		);
	},

	postFileMessage: async (
		threadId: number,
		params: { fileName: string; fileUrl: string; messageType?: string; actor?: string; senderType?: SenderType }
	): Promise<ChatMessageDto> => {
		const body = new URLSearchParams();
		body.append("fileName", params.fileName);
		body.append("fileUrl", params.fileUrl);
		if (params.messageType) body.append("messageType", params.messageType);
		body.append("actor", params.actor ?? "system");
		body.append("senderType", params.senderType ?? "ADMIN");
		return await privateApi.post<ChatMessageDto>(
			`/cms/chat/threads/${threadId}/messages/file`,
			body as any,
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } } as any
		);
	},

	updateMessage: async (
		messageId: number,
		params: { content: string; actor?: string }
	): Promise<ChatMessageDto> => {
		const body = new URLSearchParams();
		body.append("content", params.content);
		body.append("actor", params.actor ?? "system");
		return await privateApi.put<ChatMessageDto>(
			`/cms/chat/messages/${messageId}`,
			body as any,
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } } as any
		);
	},

	deleteMessage: async (
		messageId: number,
		params?: { actor?: string }
	): Promise<void> => {
		return await privateApi.delete<void>(
			`/cms/chat/messages/${messageId}`,
			{ params: { actor: params?.actor ?? "admin" } } as any
		);
	},

	// 파일 업로드(관리자 API) → 성공 시 파일 메타와 다운로드/보기 링크 반환
	uploadFile: async (
		threadId: number,
		file: File
	): Promise<any> => {
		// 서버의 파일 업로드 엔드포인트를 사용
		const form = new FormData();
		form.append("file", file);
		form.append("menu", "CHAT");
		form.append("menuId", String(threadId));
		// autoMessage=false로 두면 파일만 업로드하고, true면 서버가 자동 메시지를 생성하며 WS 브로드캐스트함
		form.append("autoMessage", "true");
		return await privateApi.post<any>(`/cms/file/public/upload`, form as any, {
			headers: { "Content-Type": "multipart/form-data" } as any,
		} as any);
	},
};

// NOTE: 아래 중복 정의와 사용되지 않는 설정 함수는 제거되었습니다.