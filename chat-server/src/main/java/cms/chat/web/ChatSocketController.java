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
        chatService.sendTextMessage(thread, payload.getSenderType(), payload.getContent(), payload.getActor());
        OutboundMessage outbound = OutboundMessage.fromPayload(payload);
        messagingTemplate.convertAndSend("/sub/chat/" + threadId, outbound);
    }

    public static class ChatTextMessage {
        private String senderType;
        private String content;
        private String actor;

        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getActor() { return actor; }
        public void setActor(String actor) { this.actor = actor; }
    }

    public static class OutboundMessage {
        private Long id;
        private String senderType;
        private String messageType;
        private String content;
        private String fileName;
        private String fileUrl;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public static OutboundMessage fromPayload(ChatTextMessage p) {
            OutboundMessage dto = new OutboundMessage();
            dto.setSenderType(p.getSenderType());
            dto.setMessageType("TEXT");
            dto.setContent(p.getContent());
            return dto;
        }
    }
}


