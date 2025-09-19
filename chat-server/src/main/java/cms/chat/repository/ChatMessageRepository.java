package cms.chat.repository;

import cms.chat.domain.ChatMessage;
import cms.chat.domain.ChatThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByThreadAndDeletedYnOrderByCreatedAtAsc(ChatThread thread, String deletedYn, Pageable pageable);
    long countByThreadAndIsReadIsFalseAndDeletedYn(ChatThread thread, String deletedYn);
    long countByThreadAndCreatedAtAfterAndDeletedYn(ChatThread thread, LocalDateTime createdAt, String deletedYn);
    
    // USER 메시지만 카운트하는 메서드들 (ADMIN 메시지는 뱃지에 포함하지 않음)
    long countByThreadAndSenderTypeAndIsReadIsFalseAndDeletedYn(ChatThread thread, String senderType, String deletedYn);
    long countByThreadAndSenderTypeAndCreatedAtAfterAndDeletedYn(ChatThread thread, String senderType, LocalDateTime createdAt, String deletedYn);
    
    // 배치로 여러 스레드의 unreadCount를 한 번에 계산하는 메서드
    @Query("SELECT t.id, COUNT(m.id) FROM ChatThread t LEFT JOIN ChatMessage m ON t.id = m.thread.id " +
           "WHERE t IN :threads AND m.senderType = 'USER' AND m.deletedYn = 'N' " +
           "AND (t.lastReadAt IS NULL OR m.createdAt > t.lastReadAt) " +
           "GROUP BY t.id")
    List<Object[]> countUnreadMessagesByThreads(@Param("threads") List<ChatThread> threads);
}


