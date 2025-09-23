package cms.chat.repository;

import cms.chat.domain.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ChatChannelRepository extends JpaRepository<ChatChannel, Long> {
    // 기존 메서드들 (삭제된 채널도 포함)
    Optional<ChatChannel> findByCmsCode(String cmsCode);
    Optional<ChatChannel> findByCmsCodeIgnoreCase(String cmsCode);
    List<ChatChannel> findByOwnerUserUuid(String ownerUserUuid);
    
    // 소프트 삭제를 고려한 새로운 메서드들 (삭제되지 않은 채널만)
    Optional<ChatChannel> findByCmsCodeAndDeletedYn(String cmsCode, String deletedYn);
    Optional<ChatChannel> findByCmsCodeIgnoreCaseAndDeletedYn(String cmsCode, String deletedYn);
    List<ChatChannel> findByOwnerUserUuidAndDeletedYn(String ownerUserUuid, String deletedYn);
    List<ChatChannel> findByDeletedYnOrderByCreatedAtAsc(String deletedYn);
    
    // 복합 조건 쿼리 - 생성일 기준 오래된 순 (처음 만든 것이 위로)
    @Query("SELECT c FROM ChatChannel c WHERE c.deletedYn = :deletedYn ORDER BY c.createdAt ASC")
    List<ChatChannel> findActiveChannelsOrderByCreatedAtAsc(String deletedYn);
}
