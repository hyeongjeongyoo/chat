package cms.chat.service;

import cms.chat.domain.*;
import cms.chat.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {
    private final ChatChannelRepository chatChannelRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatSessionLogRepository chatSessionLogRepository;
    private final ChatSettingRepository chatSettingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatChannelRepository chatChannelRepository,
                       ChatThreadRepository chatThreadRepository,
                       ChatMessageRepository chatMessageRepository,
                       ChatParticipantRepository chatParticipantRepository,
                       ChatSessionLogRepository chatSessionLogRepository,
                       ChatSettingRepository chatSettingRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.chatChannelRepository = chatChannelRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.chatSessionLogRepository = chatSessionLogRepository;
        this.chatSettingRepository = chatSettingRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ChatChannel getOrCreateChannel(String cmsCode, String cmsName, String actor) {
        return getOrCreateChannel(cmsCode, cmsName, actor, null);
    }

    @Transactional
    public ChatChannel getOrCreateChannel(String cmsCode, String cmsName, String actor, String ownerUserUuid) {
        return chatChannelRepository.findByCmsCodeIgnoreCase(cmsCode)
                .orElseGet(() -> {
                    try {
                        return chatChannelRepository.save(ChatChannel.create(cmsCode, cmsName, actor, ownerUserUuid));
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        // Unique constraint race condition safeguard
                        return chatChannelRepository.findByCmsCodeIgnoreCase(cmsCode)
                                .orElseThrow(() -> e);
                    }
                });
    }

    @Transactional
    public ChatThread getOrCreateThread(ChatChannel channel, String userIdentifier, String userName, String userIp, String actor) {
        System.out.println("getOrCreateThread 호출됨 - channelId: " + channel.getId() + ", userIdentifier: " + userIdentifier);
        
        return chatThreadRepository.findByChannelAndUserIdentifier(channel, userIdentifier)
                .map(existingThread -> {
                    System.out.println("기존 스레드 발견: " + existingThread.getId() + " - 환영 메시지 생성하지 않음");
                    return existingThread;
                })
                .orElseGet(() -> {
                    System.out.println("기존 스레드 없음, 새로운 스레드 생성 시작");
                    ChatThread newThread = chatThreadRepository.save(ChatThread.create(channel, userIdentifier, userName, userIp, actor));
                    System.out.println("새로운 스레드 생성 완료: " + newThread.getId());
                    
                    // 새로운 스레드 생성 시 자동 환영 메시지 전송
                    createWelcomeMessage(newThread, actor);
                    
                    return newThread;
                });
    }
    
    @Transactional
    public void createWelcomeMessage(ChatThread thread, String actor) {
        try {
            System.out.println("환영 메시지 생성 시작 - threadId: " + thread.getId());
            ChatMessage welcomeMessage = ChatMessage.createText(thread, "ADMIN", "안녕하세요, 핸디입니다! 무엇을 도와드릴까요?", actor);
            ChatMessage savedWelcomeMessage = chatMessageRepository.saveAndFlush(welcomeMessage);
            System.out.println("환영 메시지 저장 완료: " + savedWelcomeMessage.getId());
            
            // WebSocket으로 환영 메시지 브로드캐스트
            try {
                // 간단한 DTO 생성 (ChatController의 toDto 메서드와 유사)
                java.util.Map<String, Object> dto = new java.util.HashMap<>();
                dto.put("id", savedWelcomeMessage.getId());
                dto.put("threadId", thread.getId());
                dto.put("senderType", savedWelcomeMessage.getSenderType());
                dto.put("senderName", savedWelcomeMessage.getSenderName());
                dto.put("messageType", savedWelcomeMessage.getMessageType());
                dto.put("content", savedWelcomeMessage.getContent());
                dto.put("isRead", savedWelcomeMessage.isRead());
                dto.put("createdAt", savedWelcomeMessage.getCreatedAt());
                dto.put("edited", false);
                
                messagingTemplate.convertAndSend("/sub/chat/" + thread.getId(), dto);
                System.out.println("환영 메시지 WebSocket 전송 완료: /sub/chat/" + thread.getId());
            } catch (Exception wsException) {
                // WebSocket 전송 실패는 무시
                System.err.println("환영 메시지 WebSocket 전송 실패: " + wsException.getMessage());
            }
        } catch (Exception e) {
            // 환영 메시지 전송 실패는 무시 (스레드는 이미 생성됨)
            System.err.println("환영 메시지 생성 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public ChatMessage sendTextMessage(ChatThread thread, String senderType, String content, String actor) {
        ChatMessage message = ChatMessage.createText(thread, senderType, content, actor);
        return chatMessageRepository.save(message);
    }

    @Transactional
    public ChatMessage sendFileMessage(ChatThread thread, String senderType, String fileName, String fileUrl, String actor, String messageType) {
        ChatMessage message = new ChatMessage();
        message.setThread(thread);
        message.setSenderType(senderType);
        message.setSenderName("ADMIN".equalsIgnoreCase(senderType) ? (actor != null && !actor.isEmpty() ? actor : "admin") :
                (thread.getUserName() != null && !thread.getUserName().isEmpty() ? thread.getUserName() : thread.getUserIdentifier()));
        message.setMessageType(messageType != null && !messageType.isEmpty() ? messageType : "FILE");
        message.setFileName(fileName);
        message.setFileUrl(fileUrl);
        message.setContent(fileName);
        message.setRead(false);
        message.setCreatedBy(actor);
        message.setUpdatedBy(actor);
        message.setUpdatedAt(java.time.LocalDateTime.now());
        String ip = thread.getUserIp() != null && !thread.getUserIp().isEmpty() ? thread.getUserIp() : "127.0.0.1";
        message.setCreatedIp(ip);
        message.setUpdatedIp(ip);
        ChatMessage saved = chatMessageRepository.saveAndFlush(message);
        return saved;
    }

    @Transactional
    public ChatMessage updateMessageContent(Long messageId, String newContent, String actor) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setContent(newContent);
        message.setUpdatedBy(actor);
        message.setUpdatedAt(java.time.LocalDateTime.now());
        return chatMessageRepository.saveAndFlush(message);
    }

    @Transactional
    public void markMessagesAsRead(ChatThread thread, LocalDateTime readTime, String actor) {
        Pageable pageable = PageRequest.of(0, 200);
        Page<ChatMessage> page;
        do {
            page = chatMessageRepository.findByThreadAndDeletedYnOrderByCreatedAtAsc(thread, "N", pageable);
            page.getContent().forEach(m -> {
                if (m.isUnread()) {
                    m.markRead(readTime, actor);
                }
            });
            chatMessageRepository.saveAll(page.getContent());
            pageable = page.nextPageable();
        } while (page.hasNext());
    }

    @Transactional(readOnly = true)
    public long countUnread(ChatThread thread) {
        // USER 메시지만 카운트 (ADMIN 메시지는 뱃지에 포함하지 않음)
        return chatMessageRepository.countByThreadAndSenderTypeAndIsReadIsFalseAndDeletedYn(thread, "USER", "N");
    }

    @Transactional(readOnly = true)
    public Page<ChatMessage> getMessages(ChatThread thread, int page, int size) {
        return chatMessageRepository.findByThreadAndDeletedYnOrderByCreatedAtAsc(thread, "N", PageRequest.of(page, size));
    }

    @Transactional
    public ChatParticipant joinParticipant(ChatThread thread, String userIdentifier, String role, String actor) {
        ChatParticipant participant = chatParticipantRepository.findByThreadAndUserIdentifier(thread, userIdentifier)
                .orElseGet(() -> ChatParticipant.join(thread, userIdentifier, role, actor, LocalDateTime.now()));
        return chatParticipantRepository.save(participant);
    }

    @Transactional
    public ChatSessionLog startSession(ChatThread thread, String sessionId) {
        ChatSessionLog log = ChatSessionLog.start(thread, sessionId);
        return chatSessionLogRepository.save(log);
    }

    @Transactional
    public void endSession(ChatSessionLog log, String reason) {
        log.finish(LocalDateTime.now(), reason);
        chatSessionLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<ChatSetting> findSettings(ChatChannel channel) {
        return chatSettingRepository.findByChannel(channel);
    }

    @Transactional(readOnly = true)
    public ChatChannel getChannelById(Long channelId) {
        return chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found with id: " + channelId));
    }

    @Transactional
    public ChatMessage deleteMessage(Long messageId, String actor) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        // Soft delete
        try {
            java.lang.reflect.Method setDeletedYn = message.getClass().getMethod("setDeletedYn", String.class);
            java.lang.reflect.Method setDeletedAt = message.getClass().getMethod("setDeletedAt", java.time.LocalDateTime.class);
            java.lang.reflect.Method setDeletedBy = message.getClass().getMethod("setDeletedBy", String.class);
            setDeletedYn.invoke(message, "Y");
            setDeletedAt.invoke(message, java.time.LocalDateTime.now());
            setDeletedBy.invoke(message, actor);
        } catch (Exception ignore) {}
        return chatMessageRepository.saveAndFlush(message);
    }
}
