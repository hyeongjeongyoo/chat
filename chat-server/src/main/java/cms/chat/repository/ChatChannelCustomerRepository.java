package cms.chat.repository;

import cms.chat.domain.ChatChannelCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatChannelCustomerRepository extends JpaRepository<ChatChannelCustomer, Long> {
    
    List<ChatChannelCustomer> findByChannelId(Long channelId);
    
    Optional<ChatChannelCustomer> findByChannelIdAndUserUuid(Long channelId, String userUuid);
    
    void deleteByChannelId(Long channelId);
    
    void deleteByChannelIdAndUserUuid(Long channelId, String userUuid);
}

