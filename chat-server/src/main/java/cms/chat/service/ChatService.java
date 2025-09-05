package cms.chat.service;

import cms.chat.domain.*;
import cms.chat.repository.*;
import egov.com.cmm.service.EgovFileMngService;
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
    private final EgovFileMngService egovFileMngService;

    public ChatService(ChatChannelRepository chatChannelRepository,
                       ChatThreadRepository chatThreadRepository,
                       ChatMessageRepository chatMessageRepository,
                       ChatParticipantRepository chatParticipantRepository,
                       ChatSessionLogRepository chatSessionLogRepository,
                       ChatSettingRepository chatSettingRepository,
                       EgovFileMngService egovFileMngService) {
        this.chatChannelRepository = chatChannelRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.chatSessionLogRepository = chatSessionLogRepository;
        this.chatSettingRepository = chatSettingRepository;
        this.egovFileMngService = egovFileMngService;
    }

    @Transactional(readOnly = true)
    public ChatChannel getOrCreateChannel(String cmsCode, String cmsName, String actor) {
        return chatChannelRepository.findByCmsCode(cmsCode)
                .orElseGet(() -> chatChannelRepository.save(ChatChannel.create(cmsCode, cmsName, actor)));
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
    public void markMessagesAsRead(ChatThread thread, LocalDateTime readTime, String actor) {
        Pageable pageable = PageRequest.of(0, 200);
        Page<ChatMessage> page;
        do {
            page = chatMessageRepository.findByThreadOrderByCreatedAtAsc(thread, pageable);
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
        return chatMessageRepository.countByThreadAndIsReadIsFalse(thread);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessage> getMessages(ChatThread thread, int page, int size) {
        return chatMessageRepository.findByThreadOrderByCreatedAtAsc(thread, PageRequest.of(page, size));
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
}
