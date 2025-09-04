package cms.board.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "게시판 카테고리 정보")
public class BbsCategoryDto {

    @Schema(description = "카테고리 ID")
    private Long categoryId;

    @Schema(description = "카테고리 코드")
    @NotBlank(message = "카테고리 코드는 필수 입력값입니다.")
    @Size(max = 20, message = "카테고리 코드는 20자 이하여야 합니다.")
    private String code;

    @Schema(description = "카테고리 이름")
    @Size(max = 100, message = "카테고리 이름은 100자 이하여야 합니다.")
    private String name;

    @Schema(description = "게시판 ID")
    private Long bbsId;

    @Schema(description = "정렬 순서")
    private Integer sortOrder;

    @Schema(description = "표시 여부", example = "Y", allowableValues = { "Y", "N" })
    private String displayYn;
}