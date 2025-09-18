package cms.chat.repository;

import cms.chat.domain.ChatMessage;
import cms.chat.domain.ChatThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByThreadAndDeletedYnOrderByCreatedAtAsc(ChatThread thread, String deletedYn, Pageable pageable);
    long countByThreadAndIsReadIsFalseAndDeletedYn(ChatThread thread, String deletedYn);
}


