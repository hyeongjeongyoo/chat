package cms.chat.repository;

import cms.chat.domain.ChatSessionLog;
import cms.chat.domain.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionLogRepository extends JpaRepository<ChatSessionLog, Long> {
    List<ChatSessionLog> findByThreadOrderByStartedAtDesc(ChatThread thread);
}


