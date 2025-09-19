package cms.chat.repository;

import cms.chat.domain.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ChatChannelRepository extends JpaRepository<ChatChannel, Long> {
    Optional<ChatChannel> findByCmsCode(String cmsCode);
    Optional<ChatChannel> findByCmsCodeIgnoreCase(String cmsCode);
    List<ChatChannel> findByOwnerUserUuid(String ownerUserUuid);
}
