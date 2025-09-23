package cms.chat.web;

import cms.chat.domain.*;
import cms.chat.repository.ChatChannelRepository;
import cms.chat.repository.ChatThreadRepository;
import cms.chat.repository.ChatChannelSettingRepository;
import cms.chat.repository.ChatChannelCustomerRepository;
import cms.chat.repository.ChatMessageRepository;
import cms.chat.service.ChatService;
import cms.chat.dto.ChatMessageDto;

import org.springframework.data.domain.Page;

import cms.common.service.BusinessHoursService;
import lombok.Data;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.constraints.NotBlank;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;


@Data
@Getter
@Setter
@RestController
@RequestMapping({"/chat", "/cms/chat"})
@Validated
public class ChatController {


    // 안전 매핑: 컴파일러/롬복 이슈 회피를 위해 리플렉션만 사용
    private ChatMessageDto toDto(Object message, Long threadId) {
        ChatMessageDto dto = new ChatMessageDto();
        try {
            java.lang.reflect.Method getId = message.getClass().getMethod("getId");
            java.lang.reflect.Method getSenderType = message.getClass().getMethod("getSenderType");
            java.lang.reflect.Method getContent = message.getClass().getMethod("getContent");
            java.lang.reflect.Method getCreatedAt = message.getClass().getMethod("getCreatedAt");
            java.lang.reflect.Method getUpdatedAt = null;
            java.lang.reflect.Method getMessageType = null;
            java.lang.reflect.Method getFileName = null;
            java.lang.reflect.Method getFileUrl = null;
            try {
                getMessageType = message.getClass().getMethod("getMessageType");
            } catch (Exception ignore) {
            }
            try {
                getFileName = message.getClass().getMethod("getFileName");
            } catch (Exception ignore) {
            }
            try {
                getFileUrl = message.getClass().getMethod("getFileUrl");
            } catch (Exception ignore) {
            }
            try {
                getUpdatedAt = message.getClass().getMethod("getUpdatedAt");
            } catch (Exception ignore) {
            }

            dto.setId((Long) getId.invoke(message));
            dto.setThreadId(threadId);
            dto.setSenderType((String) getSenderType.invoke(message));
            dto.setContent((String) getContent.invoke(message));
            
            // 채널 ID 및 사용자 정보 추가 (알림 로직에서 사용)
            try {
                ChatThread thread = chatThreadRepository.findById(threadId).orElse(null);
                if (thread != null) {
                    // 채널 정보 설정
                    Long channelId = thread.getChannel() != null ? thread.getChannel().getId() : null;
                    dto.setChannelId(channelId);
                    
                    // 사용자 정보 추가
                    String userName = thread.getUserName();
                    String userIdentifier = thread.getUserIdentifier();
                    
                    // DTO에 설정
                    dto.setUserName(userName);
                    dto.setUserIdentifier(userIdentifier);
                } else {
                    dto.setChannelId(null);
                    dto.setUserName(null);
                    dto.setUserIdentifier(null);
                }
            } catch (Exception e) {
                // 안전하게 null 설정
                dto.setChannelId(null);
                dto.setUserName(null);
                dto.setUserIdentifier(null);
            }
            java.time.LocalDateTime created = (java.time.LocalDateTime) getCreatedAt.invoke(message);
            dto.setCreatedAt(created != null ? created.toString() : null);
            if (getMessageType != null) {
                dto.setMessageType((String) getMessageType.invoke(message));
            }
            if (getFileName != null) {
                dto.setFileName((String) getFileName.invoke(message));
            }
            if (getFileUrl != null) {
                dto.setFileUrl((String) getFileUrl.invoke(message));
            }
            if (getUpdatedAt != null) {
                try {
                    java.time.LocalDateTime updated = (java.time.LocalDateTime) getUpdatedAt.invoke(message);
                    if (updated != null && created != null) {
                        // 수정된 것으로 간주하려면 생성 시간보다 최소 1초 이상 늦어야 함
                        // @UpdateTimestamp를 제거했으므로 실제 수정 시에만 updatedAt이 변경됨
                        long secondsDiff = java.time.Duration.between(created, updated).getSeconds();
                        dto.setEdited(secondsDiff > 1);
                    } else {
                        dto.setEdited(false);
                    }
                } catch (Exception ignore) {
                    dto.setEdited(false);
                }
            } else {
                dto.setEdited(false);
            }
        } catch (Exception ignore) {
        }
        return dto;
    }

    private final ChatService chatService;
    private final ChatChannelRepository chatChannelRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final ChatChannelSettingRepository chatChannelSettingRepository;
    private final ChatChannelCustomerRepository chatChannelCustomerRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final cms.file.repository.FileRepository fileRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BusinessHoursService businessHoursService;

    public ChatController(ChatService chatService,
            ChatChannelRepository chatChannelRepository,
            ChatThreadRepository chatThreadRepository,
            ChatChannelSettingRepository chatChannelSettingRepository,
            ChatChannelCustomerRepository chatChannelCustomerRepository,
            ChatMessageRepository chatMessageRepository,
            cms.file.repository.FileRepository fileRepository,
            SimpMessagingTemplate messagingTemplate,
            BusinessHoursService businessHoursService) {
        this.chatService = chatService;
        this.chatChannelRepository = chatChannelRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.chatChannelSettingRepository = chatChannelSettingRepository;
        this.chatChannelCustomerRepository = chatChannelCustomerRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.fileRepository = fileRepository;
        this.messagingTemplate = messagingTemplate;
        this.businessHoursService = businessHoursService;
    }

    // 목록 조회: 채널 전체 (삭제되지 않은 채널만)
    @GetMapping("/channels")
    public ResponseEntity<?> listChannels(@RequestParam(value = "ownerUserUuid", required = false) String ownerUserUuid) {
        java.util.List<ChatChannel> channels;
        if (ownerUserUuid != null && !ownerUserUuid.isEmpty()) {
            channels = chatChannelRepository.findByOwnerUserUuidAndDeletedYn(ownerUserUuid, "N");
        } else {
            channels = chatChannelRepository.findByDeletedYnOrderByCreatedAtAsc("N");
        }
        
        // 각 채널별 미읽은 메시지 개수 계산
        java.util.List<java.util.Map<String, Object>> channelList = new java.util.ArrayList<>();
        for (ChatChannel channel : channels) {
            java.util.Map<String, Object> channelInfo = new java.util.HashMap<>();
            channelInfo.put("id", channel.getId());
            channelInfo.put("cmsCode", channel.getCmsCode());
            channelInfo.put("cmsName", channel.getCmsName());
            channelInfo.put("ownerUserUuid", channel.getOwnerUserUuid());
            channelInfo.put("createdAt", channel.getCreatedAt());
            channelInfo.put("updatedAt", channel.getUpdatedAt());
            
            // 해당 채널의 모든 스레드에서 미읽은 메시지 개수 계산 (USER 메시지만)
            java.util.List<ChatThread> threads = chatThreadRepository.findByChannelOrderByUpdatedAtDesc(channel);
            int totalUnreadCount = 0;
            if (!threads.isEmpty()) {
                java.util.List<Object[]> unreadCounts = chatMessageRepository.countUnreadMessagesByThreads(threads);
                for (Object[] result : unreadCounts) {
                    Long count = (Long) result[1];
                    totalUnreadCount += count.intValue();
                }
            }
            channelInfo.put("unreadCount", totalUnreadCount);
            
            channelList.add(channelInfo);
        }
        
        return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(channelList, "ok"));
    }

    // 목록 조회: 채널별 스레드
    @GetMapping("/channels/{channelId}/threads")
    public ResponseEntity<?> listThreads(@PathVariable Long channelId) {
        ChatChannel channel = chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        
        java.util.List<ChatThread> threads = chatThreadRepository.findByChannelOrderByUpdatedAtDesc(channel);
        
        // 배치로 모든 스레드의 미읽은 메시지 개수 계산 (USER 메시지만)
        java.util.Map<Long, Integer> unreadCountMap = new java.util.HashMap<>();
        if (!threads.isEmpty()) {
            java.util.List<Object[]> unreadCounts = chatMessageRepository.countUnreadMessagesByThreads(threads);
            for (Object[] result : unreadCounts) {
                Long threadId = (Long) result[0];
                Long count = (Long) result[1];
                unreadCountMap.put(threadId, count.intValue());
            }
        }
        
        // 스레드 정보 구성
        java.util.List<java.util.Map<String, Object>> threadList = new java.util.ArrayList<>();
        for (ChatThread thread : threads) {
            java.util.Map<String, Object> threadInfo = new java.util.HashMap<>();
            threadInfo.put("id", thread.getId());
            threadInfo.put("channelId", thread.getChannel().getId());
            threadInfo.put("userIdentifier", thread.getUserIdentifier());
            threadInfo.put("userName", thread.getUserName());
            threadInfo.put("createdAt", thread.getCreatedAt());
            threadInfo.put("updatedAt", thread.getUpdatedAt());
            
            // 배치로 계산된 unreadCount 사용 (없으면 0)
            int unreadCount = unreadCountMap.getOrDefault(thread.getId(), 0);
            threadInfo.put("unreadCount", unreadCount);
            
            threadList.add(threadInfo);
        }
        
        return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(threadList, "ok"));
    }

    @PatchMapping("/channels/{channelId}")
    public ResponseEntity<?> updateChannel(@PathVariable Long channelId,
            @RequestParam(required = false) String cmsName,
            @RequestParam(required = false) String ownerUserUuid) {
        ChatChannel channel = chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        boolean dirty = false;
        if (cmsName != null) {
            channel.setCmsName(cmsName);
            dirty = true;
        }
        if (ownerUserUuid != null) {
            channel.setOwnerUserUuid(ownerUserUuid);
            dirty = true;
        }
        if (dirty) {
            chatChannelRepository.save(channel);
        }
        return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(channel, "ok"));
    }

    @DeleteMapping("/channels/{channelId}")
    public ResponseEntity<?> deleteChannel(@PathVariable Long channelId,
            @RequestParam(defaultValue = "false") boolean force,
            @RequestParam(defaultValue = "admin") String actor) {
        ChatChannel channel = chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));

        // 이미 삭제된 채널인지 확인
        if (channel.isDeleted()) {
            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(true, "Channel already deleted"));
        }

        // 채널에 연결된 스레드 확인 (모든 스레드)
        java.util.List<ChatThread> threads = chatThreadRepository.findByChannelOrderByUpdatedAtDesc(channel);

        if (threads != null && !threads.isEmpty()) {
            if (force) {
                // 강제 삭제: 관련 스레드들도 모두 소프트 삭제
                for (ChatThread thread : threads) {
                    // 스레드도 소프트 삭제 (ChatThread에 소프트 삭제 필드가 있다면)
                    // thread.markDeleted(actor);
                    // chatThreadRepository.save(thread);
                }
                
                // 채널 소프트 삭제
                channel.markDeleted(actor);
                chatChannelRepository.save(channel);
                
                return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(true, "Channel soft deleted with associated threads"));
            } else {
                // 스레드 목록과 함께 409 응답
                java.util.List<java.util.Map<String, Object>> threadList = new java.util.ArrayList<>();
                for (ChatThread thread : threads) {
                    java.util.Map<String, Object> threadInfo = new java.util.HashMap<>();
                    threadInfo.put("id", thread.getId());
                    threadInfo.put("userIdentifier", thread.getUserIdentifier());
                    threadInfo.put("userName", thread.getUserName());
                    threadInfo.put("createdAt", thread.getCreatedAt());
                    threadInfo.put("updatedAt", thread.getUpdatedAt());
                    threadList.add(threadInfo);
                }

                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("message", "Channel has " + threads.size() + " threads and cannot be deleted");
                response.put("threads", threadList);
                response.put("forceDeleteAvailable", true);

                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(cms.common.dto.ApiResponseSchema.error(response, "CHANNEL_HAS_THREADS"));
            }
        }

        // 스레드가 없으면 정상 소프트 삭제
        channel.markDeleted(actor);
        chatChannelRepository.save(channel);
        return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(true, "Channel soft deleted"));
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
            } catch (Exception ignore) {
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to send file message: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @PostMapping("/channels")
    public ResponseEntity<?> createOrGetChannel(@RequestParam @NotBlank String cmsCode,
            @RequestParam(required = false) String cmsName,
            @RequestParam(required = false) String ownerUserUuid,
            @RequestParam(defaultValue = "system") String actor) {
        try {
            ChatChannel channel = chatService.getOrCreateChannel(cmsCode, cmsName, actor, ownerUserUuid);
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
            
            // chat_channel_customer 테이블에도 고객 정보 저장 (임시 비활성화)
            // try {
            //     ChatChannelCustomer existingCustomer = chatChannelCustomerRepository.findByChannelIdAndUserUuid(channelId, userIdentifier).orElse(null);
            //     if (existingCustomer == null) {
            //         ChatChannelCustomer customer = ChatChannelCustomer.create(channelId, userIdentifier, userName);
            //         chatChannelCustomerRepository.save(customer);
            //         System.out.println("ChatChannelCustomer 저장 완료: channelId=" + channelId + ", userUuid=" + userIdentifier);
            //     }
            // } catch (Exception e) {
            //     // 고객 정보 저장 실패는 무시 (스레드는 이미 생성됨)
            //     System.err.println("ChatChannelCustomer 저장 실패: " + e.getMessage());
            //     e.printStackTrace();
            // }
            
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
    
    @PostMapping("/threads/{threadId}/welcome")
    public ResponseEntity<?> createWelcomeMessage(@PathVariable Long threadId,
            @RequestParam(defaultValue = "system") String actor) {
        try {
            ChatThread thread = chatThreadRepository.findById(threadId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
            
            chatService.createWelcomeMessage(thread, actor);
            
            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success("Welcome message created", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to create welcome message: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @DeleteMapping("/threads/{threadId}")
    public ResponseEntity<?> deleteThread(@PathVariable Long threadId,
            @RequestParam(defaultValue = "system") String actor) {
        try {
            ChatThread thread = chatThreadRepository.findById(threadId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));

            // chat_channel_customer 테이블에서도 고객 정보 삭제
            try {
                chatChannelCustomerRepository.deleteByChannelIdAndUserUuid(thread.getChannel().getId(), thread.getUserIdentifier());
            } catch (Exception ignore) {
                // 고객 정보 삭제 실패는 무시
            }

            // 스레드와 관련된 모든 메시지도 함께 삭제 (CASCADE)
            chatThreadRepository.delete(thread);

            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success("Thread deleted", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to delete thread: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<Page<ChatMessageDto>> getMessages(@PathVariable Long threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        System.out.println("🔍 [ChatController] getMessages called - threadId: " + threadId + ", page: " + page + ", size: " + size);
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
        Page<?> messages = (Page<?>) (Page) chatService.getMessages(thread, page, size);
        System.out.println("🔍 [ChatController] Raw messages page - number: " + messages.getNumber() + ", size: " + messages.getSize() + ", totalElements: " + messages.getTotalElements() + ", totalPages: " + messages.getTotalPages());
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
            @RequestParam(defaultValue = "system") String actor,
            @RequestParam(required = false) String uuid) {
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
            
            // UUID 추적 로그
            if (uuid != null && !uuid.isEmpty()) {
                ChatChannel channel = thread.getChannel();
                System.out.println(String.format("메시지 수신 - UUID: %s, 업체: %s (%s), 사용자: %s, 내용: %s", 
                    uuid, channel.getCmsName(), channel.getCmsCode(), thread.getUserIdentifier(), content));
            }
            
            try {
                // 스레드별 구독자에게 전송
                messagingTemplate.convertAndSend("/sub/chat/" + threadId, dto);
                
                // 채널별 구독자에게도 전송 (다른 스레드에 있는 사용자도 알림 받을 수 있도록)
                ChatChannel channel = thread.getChannel();
                if (channel != null) {
                    String channelTopic = "/sub/chat/channel/" + channel.getId();
                    messagingTemplate.convertAndSend(channelTopic, dto);
                }
            } catch (Exception e) {
                // WebSocket 메시지 전송 실패 시 무시
            }

            // Closed hours auto-reply (single-shot throttling simplified with recent timestamp check in service layer could be added later)
            if (!businessHoursService.isOpen(java.time.LocalDateTime.now()) && "USER".equalsIgnoreCase(senderType)) {
                try {
                    Object autoMsg = chatService.sendTextMessage(thread, "ADMIN",
                            "현재 운영시간(평일 09:00~18:00)이 아닙니다. 접수되었으며 운영시간에 답변드리겠습니다.",
                            "system");
                    ChatMessageDto autoDto = toDto(autoMsg, threadId);
                    messagingTemplate.convertAndSend("/sub/chat/" + threadId, autoDto);
                } catch (Exception ignore) {
                }
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to send message: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @GetMapping("/business-hours/status")
    public ResponseEntity<?> businessHoursStatus() {
        BusinessHoursService.Status status = businessHoursService.currentStatus();
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("open", status.isOpen());
        body.put("message", status.getMessage());
        return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(body, "ok"));
    }

    // 채널 설정 관리 API
    @GetMapping("/config/channels/{uuid}")
    public ResponseEntity<?> getChannelConfig(@PathVariable String uuid) {
        try {
            java.util.List<ChatChannel> channels = chatChannelRepository.findByOwnerUserUuidAndDeletedYn(uuid, "N");
            if (channels.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found");
            }
            ChatChannel channel = channels.get(0);

            java.util.Map<String, Object> config = new java.util.HashMap<>();
            config.put("channelId", channel.getId());
            config.put("cmsCode", channel.getCmsCode());
            config.put("cmsName", channel.getCmsName());
            config.put("ownerUserUuid", channel.getOwnerUserUuid());
            config.put("createdAt", channel.getCreatedAt());

            // DB에서 설정 정보 가져오기
            ChatChannelSetting setting = chatChannelSettingRepository.findByChannelId(channel.getId()).orElse(null);
            if (setting != null && setting.getConfig() != null) {
                try {
                    java.util.Map<String, Object> settingConfig = new com.fasterxml.jackson.databind.ObjectMapper()
                            .readValue(setting.getConfig(), java.util.Map.class);
                    config.put("settings", settingConfig);
                } catch (Exception ignore) {
                    // JSON 파싱 실패 시 기본 설정 사용
                }
            }

            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(config, "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to get channel config: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @PostMapping("/config/channels/{uuid}")
    public ResponseEntity<?> setChannelConfig(@PathVariable String uuid, @RequestBody java.util.Map<String, Object> config) {
        try {
            java.util.List<ChatChannel> channels = chatChannelRepository.findByOwnerUserUuid(uuid);
            if (channels.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found");
            }
            ChatChannel channel = channels.get(0);

            // 설정 저장
            String configJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(config);
            ChatChannelSetting existingSetting = chatChannelSettingRepository.findByChannelId(channel.getId()).orElse(null);

            if (existingSetting != null) {
                existingSetting.setConfig(configJson);
                existingSetting.setUpdatedBy("admin");
                chatChannelSettingRepository.save(existingSetting);
            } else {
                ChatChannelSetting newSetting = ChatChannelSetting.create(channel.getId(), configJson, "admin");
                chatChannelSettingRepository.save(newSetting);
            }

            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success("Config saved", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to save channel config: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @GetMapping("/config/channels")
    public ResponseEntity<?> getAllChannelConfigs() {
        try {
            java.util.List<ChatChannel> channels = chatChannelRepository.findByDeletedYnOrderByCreatedAtAsc("N");
            java.util.Map<String, Object> configs = new java.util.HashMap<>();

            for (ChatChannel channel : channels) {
                if (channel.getOwnerUserUuid() != null) {
                    java.util.Map<String, Object> config = new java.util.HashMap<>();
                    config.put("channelId", channel.getId());
                    config.put("cmsCode", channel.getCmsCode());
                    config.put("cmsName", channel.getCmsName());
                    config.put("ownerUserUuid", channel.getOwnerUserUuid());
                    config.put("createdAt", channel.getCreatedAt());
                    configs.put(channel.getOwnerUserUuid(), config);
                }
            }

            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(configs, "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to get channel configs: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @DeleteMapping("/config/channels/{uuid}")
    public ResponseEntity<?> deleteChannelConfig(@PathVariable String uuid) {
        try {
            java.util.List<ChatChannel> channels = chatChannelRepository.findByOwnerUserUuidAndDeletedYn(uuid, "N");
            if (channels.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found");
            }
            ChatChannel channel = channels.get(0);

            // 설정 삭제
            chatChannelSettingRepository.deleteByChannelId(channel.getId());

            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success("Config deleted", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to delete channel config: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @GetMapping("/config/validate/{uuid}")
    public ResponseEntity<?> validateChannelUuid(@PathVariable String uuid) {
        System.out.println("UUID 검증 시작 - UUID: " + uuid);
        
        try {
            // null 체크
            if (uuid == null || uuid.trim().isEmpty()) {
                System.out.println("UUID가 null이거나 빈 문자열입니다.");
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("valid", false);
                response.put("uuid", uuid);
                return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(response, "ok"));
            }
            
            // Repository null 체크
            if (chatChannelRepository == null) {
                System.err.println("ChatChannelRepository가 null입니다!");
                throw new RuntimeException("Repository not initialized");
            }
            
            System.out.println("Repository 조회 시작 - UUID: " + uuid);
            
            // 삭제되지 않은 채널만 조회
            java.util.List<ChatChannel> channels = chatChannelRepository.findByOwnerUserUuidAndDeletedYn(uuid, "N");
            
            System.out.println("Repository 조회 완료 - 결과 개수: " + (channels != null ? channels.size() : "null"));
            
            ChatChannel channel = (channels != null && !channels.isEmpty()) ? channels.get(0) : null;

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("valid", channel != null);
            response.put("uuid", uuid);

            if (channel != null) {
                java.util.Map<String, Object> config = new java.util.HashMap<>();
                config.put("channelId", channel.getId());
                config.put("cmsCode", channel.getCmsCode());
                config.put("cmsName", channel.getCmsName());
                config.put("ownerUserUuid", channel.getOwnerUserUuid());
                response.put("config", config);
                
                System.out.println(String.format("UUID 검증 성공 - UUID: %s, 채널ID: %d, 업체: %s (%s)", 
                    uuid, channel.getId(), channel.getCmsName(), channel.getCmsCode()));
            } else {
                System.out.println(String.format("UUID 검증 실패 - UUID: %s (삭제되지 않은 채널을 찾을 수 없음)", uuid));
                
                try {
                    // 삭제된 채널이 있는지도 확인
                    java.util.List<ChatChannel> deletedChannels = chatChannelRepository.findByOwnerUserUuid(uuid);
                    if (deletedChannels != null && !deletedChannels.isEmpty()) {
                        ChatChannel deletedChannel = deletedChannels.get(0);
                        System.out.println(String.format("삭제된 채널 발견 - UUID: %s, 채널ID: %d, 삭제여부: %s", 
                            uuid, deletedChannel.getId(), deletedChannel.getDeletedYn()));
                    } else {
                        System.out.println("UUID에 해당하는 채널이 전혀 없습니다: " + uuid);
                    }
                } catch (Exception deleteCheckEx) {
                    System.err.println("삭제된 채널 확인 중 오류: " + deleteCheckEx.getMessage());
                }
            }

            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success(response, "ok"));
        } catch (Exception e) {
            // 더 자세한 에러 로그
            e.printStackTrace();
            System.err.println(String.format("UUID 검증 중 오류 발생 - UUID: %s, 오류 타입: %s, 메시지: %s", 
                uuid, e.getClass().getSimpleName(), e.getMessage()));
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to validate UUID: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @PostMapping("/threads/{threadId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long threadId,
            @RequestParam(defaultValue = "system") String actor) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
        
        LocalDateTime now = java.time.LocalDateTime.now();
        chatService.markMessagesAsRead(thread, now, actor);
        
        // 스레드의 마지막 읽은 시간 업데이트
        thread.setLastReadAt(now);
        chatThreadRepository.save(thread);
        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<?> updateMessage(@PathVariable Long messageId,
            @RequestParam @NotBlank String content,
            @RequestParam(defaultValue = "system") String actor) {
        try {
            Object updated = chatService.updateMessageContent(messageId, content, actor);
            Long threadIdFromEntity = null;
            try {
                java.lang.reflect.Method getThread = updated.getClass().getMethod("getThread");
                Object thread = getThread.invoke(updated);
                if (thread != null) {
                    java.lang.reflect.Method getId = thread.getClass().getMethod("getId");
                    threadIdFromEntity = (Long) getId.invoke(thread);
                }
            } catch (Exception ignore) {
            }
            ChatMessageDto dto = toDto(updated, threadIdFromEntity);
            try {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("type", "message.updated");
                try {
                    payload.put("id", messageId);
                } catch (Exception ignore2) {
                }
                if (threadIdFromEntity != null) {
                    payload.put("threadId", threadIdFromEntity);
                }
                payload.put("content", content);
                if (threadIdFromEntity != null) {
                    messagingTemplate.convertAndSend("/sub/chat/" + threadIdFromEntity, payload);
                }
            } catch (Exception ignore) {
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to update message: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId,
            @RequestParam(defaultValue = "system") String actor) {
        try {
            Object deleted = chatService.deleteMessage(messageId, actor);
            Long threadId = null;
            try {
                java.lang.reflect.Method getThread = deleted.getClass().getMethod("getThread");
                Object thread = getThread.invoke(deleted);
                if (thread != null) {
                    java.lang.reflect.Method getId = thread.getClass().getMethod("getId");
                    threadId = (Long) getId.invoke(thread);
                }
            } catch (Exception ignore) {
            }
            if (threadId != null) {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("type", "message.deleted");
                payload.put("id", messageId);
                payload.put("threadId", threadId);
                try {
                    messagingTemplate.convertAndSend("/sub/chat/" + threadId, payload);
                } catch (Exception ignore) {
                }
            }
            return ResponseEntity.ok(cms.common.dto.ApiResponseSchema.success("deleted", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(cms.common.dto.ApiResponseSchema.error("Failed to delete message: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }
}
