package cms.chat.repository;

import cms.chat.domain.ChatChannelSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatChannelSettingRepository extends JpaRepository<ChatChannelSetting, Long> {

    Optional<ChatChannelSetting> findByChannelId(Long channelId);

    void deleteByChannelId(Long channelId);
}
