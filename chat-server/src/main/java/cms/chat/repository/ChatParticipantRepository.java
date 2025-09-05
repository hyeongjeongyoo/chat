package cms.chat.repository;

import cms.chat.domain.ChatParticipant;
import cms.chat.domain.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    Optional<ChatParticipant> findByThreadAndUserIdentifier(ChatThread thread, String userIdentifier);
}
