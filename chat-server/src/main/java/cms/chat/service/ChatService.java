package cms.chat.service;

import cms.chat.domain.*;
import cms.chat.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    public ChatService(ChatChannelRepository chatChannelRepository,
                       ChatThreadRepository chatThreadRepository,
                       ChatMessageRepository chatMessageRepository,
                       ChatParticipantRepository chatParticipantRepository,
                       ChatSessionLogRepository chatSessionLogRepository,
                       ChatSettingRepository chatSettingRepository) {
        this.chatChannelRepository = chatChannelRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.chatSessionLogRepository = chatSessionLogRepository;
        this.chatSettingRepository = chatSettingRepository;
    }

    @Transactional
    public ChatChannel getOrCreateChannel(String cmsCode, String cmsName, String actor) {
        return chatChannelRepository.findByCmsCodeIgnoreCase(cmsCode)
                .orElseGet(() -> {
                    try {
                        return chatChannelRepository.save(ChatChannel.create(cmsCode, cmsName, actor));
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        // Unique constraint race condition safeguard
                        return chatChannelRepository.findByCmsCodeIgnoreCase(cmsCode)
                                .orElseThrow(() -> e);
                    }
                });
    }

    @Transactional
    public ChatThread getOrCreateThread(ChatChannel channel, String userIdentifier, String userName, String userIp, String actor) {
        return chatThreadRepository.findByChannelAndUserIdentifier(channel, userIdentifier)
                .orElseGet(() -> chatThreadRepository.save(ChatThread.create(channel, userIdentifier, userName, userIp, actor)));
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
        return chatMessageRepository.countByThreadAndIsReadIsFalseAndDeletedYn(thread, "N");
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
