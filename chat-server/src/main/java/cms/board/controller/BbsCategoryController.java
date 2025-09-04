package cms.board.controller;

import cms.board.dto.BbsCategoryDto;
import cms.board.service.BbsCategoryService;
import cms.common.dto.ApiResponseSchema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cms/bbs/category")
@RequiredArgsConstructor
@Tag(name = "cms_05_BbsCategory", description = "게시판 카테고리 관리 API")
public class BbsCategoryController {

    private final BbsCategoryService bbsCategoryService;

    @Operation(summary = "게시판별 카테고리 목록 조회", description = "특정 게시판의 카테고리 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponseSchema<List<BbsCategoryDto>>> getCategories(
            @Parameter(description = "게시판 ID") @RequestParam Long bbsId) {
        List<BbsCategoryDto> categories = bbsCategoryService.getCategoriesByBbsId(bbsId);
        return ResponseEntity.ok(ApiResponseSchema.success(categories));
    }

    @Operation(summary = "카테고리 상세 조회", description = "특정 카테고리의 상세 정보를 조회합니다.")
    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponseSchema<BbsCategoryDto>> getCategory(
            @Parameter(description = "카테고리 ID") @PathVariable Long categoryId) {
        BbsCategoryDto category = bbsCategoryService.getCategory(categoryId);
        return ResponseEntity.ok(ApiResponseSchema.success(category));
    }

    @Operation(summary = "카테고리 생성", description = "새로운 카테고리를 생성합니다.")
    @PostMapping
    public ResponseEntity<ApiResponseSchema<BbsCategoryDto>> createCategory(
            @RequestBody BbsCategoryDto categoryDto) {
        BbsCategoryDto createdCategory = bbsCategoryService.createCategory(categoryDto);
        return ResponseEntity.ok(ApiResponseSchema.success(createdCategory, "카테고리가 성공적으로 생성되었습니다."));
    }

    @Operation(summary = "카테고리 수정", description = "기존 카테고리를 수정합니다.")
    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponseSchema<BbsCategoryDto>> updateCategory(
            @Parameter(description = "카테고리 ID") @PathVariable Long categoryId,
            @RequestBody BbsCategoryDto categoryDto) {
        BbsCategoryDto updatedCategory = bbsCategoryService.updateCategory(categoryId, categoryDto);
        return ResponseEntity.ok(ApiResponseSchema.success(updatedCategory, "카테고리가 성공적으로 수정되었습니다."));
    }

    @Operation(summary = "카테고리 삭제", description = "카테고리를 삭제합니다.")
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponseSchema<Void>> deleteCategory(
            @Parameter(description = "카테고리 ID") @PathVariable Long categoryId) {
        bbsCategoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponseSchema.success("카테고리가 성공적으로 삭제되었습니다."));
    }
}