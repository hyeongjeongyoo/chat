package cms.chat.web;

import cms.chat.domain.*;
import cms.chat.repository.ChatChannelRepository;
import cms.chat.repository.ChatThreadRepository;
import cms.chat.service.ChatService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.constraints.NotBlank;

@RestController
@RequestMapping({"/chat", "/cms/chat"})
@Validated
public class ChatController {
    public static class ChatMessageDto {
        private Long id;
        private Long threadId;
        private String senderType;
        private String content;
        private java.time.LocalDateTime createdAt;
        private String messageType;
        private String fileName;
        private String fileUrl;
        private java.util.List<cms.file.dto.FileDto> attachments;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getThreadId() { return threadId; }
        public void setThreadId(Long threadId) { this.threadId = threadId; }
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
        public java.util.List<cms.file.dto.FileDto> getAttachments() { return attachments; }
        public void setAttachments(java.util.List<cms.file.dto.FileDto> attachments) { this.attachments = attachments; }
    }

    // 안전 매핑: ChatMessage 인스턴스는 직접 접근, 그렇지 않으면 리플렉션
    private ChatMessageDto toDto(Object message, Long threadId) {
        ChatMessageDto dto = new ChatMessageDto();
        if (message instanceof cms.chat.domain.ChatMessage) {
            cms.chat.domain.ChatMessage m = (cms.chat.domain.ChatMessage) message;
            dto.setId(m.getId());
            dto.setThreadId(threadId);
            dto.setSenderType(m.getSenderType());
            dto.setContent(m.getContent());
            dto.setCreatedAt(m.getCreatedAt());
            dto.setMessageType(m.getMessageType());
            dto.setFileName(m.getFileName());
            dto.setFileUrl(m.getFileUrl());
            return dto;
        }
        try {
            java.lang.reflect.Method getId = message.getClass().getMethod("getId");
            java.lang.reflect.Method getSenderType = message.getClass().getMethod("getSenderType");
            java.lang.reflect.Method getContent = message.getClass().getMethod("getContent");
            java.lang.reflect.Method getCreatedAt = message.getClass().getMethod("getCreatedAt");
            java.lang.reflect.Method getMessageType = null;
            java.lang.reflect.Method getFileName = null;
            java.lang.reflect.Method getFileUrl = null;
            try { getMessageType = message.getClass().getMethod("getMessageType"); } catch (Exception ignore) {}
            try { getFileName = message.getClass().getMethod("getFileName"); } catch (Exception ignore) {}
            try { getFileUrl = message.getClass().getMethod("getFileUrl"); } catch (Exception ignore) {}

            dto.setId((Long) getId.invoke(message));
            dto.setThreadId(threadId);
            dto.setSenderType((String) getSenderType.invoke(message));
            dto.setContent((String) getContent.invoke(message));
            dto.setCreatedAt((java.time.LocalDateTime) getCreatedAt.invoke(message));
            if (getMessageType != null) dto.setMessageType((String) getMessageType.invoke(message));
            if (getFileName != null) dto.setFileName((String) getFileName.invoke(message));
            if (getFileUrl != null) dto.setFileUrl((String) getFileUrl.invoke(message));
        } catch (Exception ignore) {
        }
        return dto;
    }


    private final ChatService chatService;
    private final ChatChannelRepository chatChannelRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final cms.file.repository.FileRepository fileRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService,
                          ChatChannelRepository chatChannelRepository,
                          ChatThreadRepository chatThreadRepository,
                          cms.file.repository.FileRepository fileRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.chatChannelRepository = chatChannelRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.fileRepository = fileRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // 목록 조회: 채널 전체
    @GetMapping("/channels")
    public ResponseEntity<?> listChannels() {
        return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(chatChannelRepository.findAll(), "ok"));
    }

    // 목록 조회: 채널별 스레드
    @GetMapping("/channels/{channelId}/threads")
    public ResponseEntity<?> listThreads(@PathVariable Long channelId) {
        ChatChannel channel = chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(chatThreadRepository.findByChannelOrderByUpdatedAtDesc(channel), "ok"));
    }

    @PostMapping("/threads/{threadId}/messages/file")
    public ResponseEntity<?> sendFile(@PathVariable Long threadId,
                                      @RequestParam String fileName,
                                      @RequestParam String fileUrl,
                                      @RequestParam(defaultValue = "FILE") String messageType,
                                      @RequestParam(defaultValue = "system") String actor,
                                      @RequestParam(defaultValue = "ADMIN") String senderType) {
        try {
            ChatThread thread = chatThreadRepository.findById(threadId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
            Object message = chatService.sendFileMessage(thread, senderType, fileName, fileUrl, actor, messageType);
            ChatMessageDto dto = toDto(message, threadId);
            try {
                // 파일 메시지도 실시간으로 브로드캐스트
                messagingTemplate.convertAndSend("/sub/chat/" + threadId, dto);
            } catch (Exception ignore) {}
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to send file message: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }
    @PostMapping("/channels")
    public ResponseEntity<?> createOrGetChannel(@RequestParam @NotBlank String cmsCode,
                                                @RequestParam(required = false) String cmsName,
                                                @RequestParam(defaultValue = "system") String actor) {
        try {
            ChatChannel channel = chatService.getOrCreateChannel(cmsCode, cmsName, actor);
            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(channel, "ok"));
        } catch (DataIntegrityViolationException ex) {
            ChatChannel existing = chatChannelRepository.findByCmsCode(cmsCode)
                    .orElseThrow(() -> ex);
            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(existing, "ok"));
        } catch (Exception e) {
            // 최종 보루: 어떤 예외가 나더라도 기존 채널이 있으면 그것을 반환
            ChatChannel fallback = chatChannelRepository.findByCmsCode(cmsCode)
                    .orElse(null);
            if (fallback != null) {
                return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(fallback, "ok"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to create channel: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @PostMapping("/threads")
    public ResponseEntity<?> createOrGetThread(@RequestParam Long channelId,
                                               @RequestParam @NotBlank String userIdentifier,
                                               @RequestParam(required = false) String userName,
                                               @RequestParam(required = false) String userIp,
                                               @RequestParam(defaultValue = "system") String actor) {
        try {
            ChatChannel channel = chatChannelRepository.findById(channelId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
            ChatThread thread = chatService.getOrCreateThread(channel, userIdentifier, userName, userIp, actor);
            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(thread, "ok"));
        } catch (DataIntegrityViolationException ex) {
            ChatChannel channel = chatChannelRepository.findById(channelId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
            ChatThread existing = chatThreadRepository.findByChannelAndUserIdentifier(channel, userIdentifier)
                    .orElseThrow(() -> ex);
            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(existing, "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to create thread: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<Page<ChatMessageDto>> getMessages(@PathVariable Long threadId,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "20") int size) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
        Page<?> messages = (Page<?>) (Page) chatService.getMessages(thread, page, size);
        Page<ChatMessageDto> dtoPage = messages.map(m -> {
            ChatMessageDto dto = toDto(m, threadId);
            try {
                java.lang.reflect.Method getId = m.getClass().getMethod("getId");
                Long messageId = (Long) getId.invoke(m);
                java.util.List<cms.file.entity.CmsFile> files = fileRepository.findByMessageId(messageId);
                java.util.List<cms.file.dto.FileDto> fileDtos = new java.util.ArrayList<>();
                for (cms.file.entity.CmsFile f : files) {
                    cms.file.dto.FileDto fd = new cms.file.dto.FileDto();
                    Long fid = f.getFileId();
                    String origin = f.getOriginName();
                    String mime = f.getMimeType();
                    fd.setFileId(fid);
                    fd.setOriginName(origin);
                    fd.setMimeType(mime);
                    String base = "/api/v1/cms/file";
                    if (fid != null) {
                        fd.setDownloadUrl(base + "/public/download/" + fid);
                        if (mime != null && mime.startsWith("image/")) {
                            fd.setViewUrl(base + "/public/view/" + fid);
                        }
                    }
                    fileDtos.add(fd);
                }
                dto.setAttachments(fileDtos);
            } catch (Exception e) {
                // 안전하게 무시하고 첨부 없이 응답
            }
            return dto;
        });
        return ResponseEntity.ok(dtoPage);
    }

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<?> sendText(@PathVariable Long threadId,
                                      @RequestParam @NotBlank String senderType,
                                      @RequestParam @NotBlank String content,
                                      @RequestParam(defaultValue = "system") String actor) {
        try {
            ChatThread thread = chatThreadRepository.findById(threadId)
                    .orElseGet(() -> {
                        // Fallback: auto-create default channel/thread when missing
                        ChatChannel channel = chatChannelRepository.findByCmsCode("DEFAULT")
                                .orElseGet(() -> chatService.getOrCreateChannel("DEFAULT", "Default", actor));
                        return chatService.getOrCreateThread(channel,
                                "popup-" + threadId,
                                "POPUP",
                                "127.0.0.1",
                                actor);
                    });
            Object message = chatService.sendTextMessage(thread, senderType, content, actor);
            ChatMessageDto dto = toDto(message, threadId);
            try {
                messagingTemplate.convertAndSend("/sub/chat/" + threadId, dto);
            } catch (Exception ignore) {}
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to send message: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @PostMapping("/threads/{threadId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long threadId,
                                         @RequestParam(defaultValue = "system") String actor) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
        chatService.markMessagesAsRead(thread, java.time.LocalDateTime.now(), actor);
        return ResponseEntity.ok().build();
    }
}


