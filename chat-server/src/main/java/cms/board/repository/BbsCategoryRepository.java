package cms.board.repository;

import cms.board.domain.BbsCategoryDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BbsCategoryRepository extends JpaRepository<BbsCategoryDomain, Long> {

    /**
     * 게시판 ID로 카테고리 목록 조회
     */
    @Query("SELECT c FROM BbsCategoryDomain c WHERE c.bbsMaster.bbsId = :bbsId AND c.displayYn = 'Y' ORDER BY c.sortOrder ASC")
    List<BbsCategoryDomain> findByBbsIdAndUseYn(@Param("bbsId") Long bbsId);

    /**
     * 코드로 카테고리 조회
     */
    BbsCategoryDomain findByCode(String code);

    /**
     * 게시판 ID와 코드로 카테고리 조회
     */
    @Query("SELECT c FROM BbsCategoryDomain c WHERE c.bbsMaster.bbsId = :bbsId AND c.code = :code")
    BbsCategoryDomain findByBbsIdAndCode(@Param("bbsId") Long bbsId, @Param("code") String code);

    /**
     * 모든 활성화된 카테고리 조회
     */
    @Query("SELECT c FROM BbsCategoryDomain c WHERE c.displayYn = 'Y' ORDER BY c.sortOrder ASC")
    List<BbsCategoryDomain> findAllActive();
}