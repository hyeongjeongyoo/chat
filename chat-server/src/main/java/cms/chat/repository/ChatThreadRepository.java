package cms.chat.repository;

import cms.chat.domain.ChatChannel;
import cms.chat.domain.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, Long> {
    Optional<ChatThread> findByChannelAndUserIdentifier(ChatChannel channel, String userIdentifier);
    List<ChatThread> findByChannelOrderByUpdatedAtDesc(ChatChannel channel);
}

