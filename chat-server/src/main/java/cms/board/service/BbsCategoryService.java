package cms.board.service;

import cms.board.dto.BbsCategoryDto;
import java.util.List;

public interface BbsCategoryService {

    /**
     * 게시판별 카테고리 목록 조회
     */
    List<BbsCategoryDto> getCategoriesByBbsId(Long bbsId);

    /**
     * 카테고리 상세 조회
     */
    BbsCategoryDto getCategory(Long categoryId);

    /**
     * 카테고리 생성
     */
    BbsCategoryDto createCategory(BbsCategoryDto categoryDto);

    /**
     * 카테고리 수정
     */
    BbsCategoryDto updateCategory(Long categoryId, BbsCategoryDto categoryDto);

    /**
     * 카테고리 삭제
     */
    void deleteCategory(Long categoryId);
}