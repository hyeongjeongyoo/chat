package cms.chat.repository;

import cms.chat.domain.ChatChannel;
import cms.chat.domain.ChatSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSettingRepository extends JpaRepository<ChatSetting, Long> {
    List<ChatSetting> findByChannel(ChatChannel channel);
}
