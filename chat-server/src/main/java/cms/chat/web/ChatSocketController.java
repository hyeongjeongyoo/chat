package cms.chat.web;

import cms.chat.domain.ChatThread;
import cms.chat.repository.ChatThreadRepository;
import cms.chat.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatSocketController {

    private final ChatService chatService;
    private final ChatThreadRepository chatThreadRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatSocketController(ChatService chatService,
            ChatThreadRepository chatThreadRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.chatThreadRepository = chatThreadRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/{threadId}/send")
    public void send(@DestinationVariable Long threadId, @Payload ChatTextMessage payload) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));
        // 저장된 메시지 반환 받아 브로드캐스트에 식별자/스레드/시간 포함
        cms.chat.domain.ChatMessage saved = chatService.sendTextMessage(
                thread,
                payload.getSenderType(),
                payload.getContent(),
                payload.getActor()
        );
        OutboundMessage outbound = OutboundMessage.fromEntity(saved);
        messagingTemplate.convertAndSend("/sub/chat/" + threadId, outbound);
    }

    public static class ChatTextMessage {

        private String senderType;
        private String content;
        private String actor;

        public String getSenderType() {
            return senderType;
        }

        public void setSenderType(String senderType) {
            this.senderType = senderType;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getActor() {
            return actor;
        }

        public void setActor(String actor) {
            this.actor = actor;
        }
    }

    public static class OutboundMessage {

        private Long id;
        private Long threadId;
        private Long channelId;
        private String senderType;
        private String messageType;
        private String content;
        private String fileName;
        private String fileUrl;
        private java.time.LocalDateTime createdAt;
        private String userName;
        private String userIdentifier;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getThreadId() {
            return threadId;
        }

        public void setThreadId(Long threadId) {
            this.threadId = threadId;
        }

        public String getSenderType() {
            return senderType;
        }

        public void setSenderType(String senderType) {
            this.senderType = senderType;
        }

        public String getMessageType() {
            return messageType;
        }

        public void setMessageType(String messageType) {
            this.messageType = messageType;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public java.time.LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(java.time.LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public Long getChannelId() {
            return channelId;
        }

        public void setChannelId(Long channelId) {
            this.channelId = channelId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getUserIdentifier() {
            return userIdentifier;
        }

        public void setUserIdentifier(String userIdentifier) {
            this.userIdentifier = userIdentifier;
        }

        public static OutboundMessage fromEntity(cms.chat.domain.ChatMessage m) {
            OutboundMessage dto = new OutboundMessage();
            dto.setId(m.getId());
            dto.setThreadId(m.getThread().getId());
            dto.setSenderType(m.getSenderType());
            dto.setMessageType(m.getMessageType());
            dto.setContent(m.getContent());
            dto.setFileName(m.getFileName());
            dto.setFileUrl(m.getFileUrl());
            dto.setCreatedAt(m.getCreatedAt());

            // 🔥 NEW: 채널 ID 및 사용자 정보 추가
            try {
                cms.chat.domain.ChatThread thread = m.getThread();
                if (thread != null) {
                    // 채널 ID 설정
                    cms.chat.domain.ChatChannel channel = thread.getChannel();
                    if (channel != null) {
                        dto.setChannelId(channel.getId());
                    }

                    // 사용자 정보 설정
                    dto.setUserName(thread.getUserName());
                    dto.setUserIdentifier(thread.getUserIdentifier());
                }
            } catch (Exception e) {
                // 사용자 정보 설정 실패 시 무시
            }

            return dto;
        }
    }
}
