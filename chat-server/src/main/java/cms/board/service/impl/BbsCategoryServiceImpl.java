package cms.board.service.impl;

import cms.board.domain.BbsCategoryDomain;
import cms.board.domain.BbsMasterDomain;
import cms.board.dto.BbsCategoryDto;
import cms.board.repository.BbsCategoryRepository;
import cms.board.repository.BbsMasterRepository;
import cms.board.service.BbsCategoryService;
import cms.common.exception.BbsMasterNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BbsCategoryServiceImpl implements BbsCategoryService {

        private final BbsCategoryRepository bbsCategoryRepository;
        private final BbsMasterRepository bbsMasterRepository;

        @Override
        @Transactional(readOnly = true)
        public List<BbsCategoryDto> getCategoriesByBbsId(Long bbsId) {
                log.debug("[getCategoriesByBbsId] bbsId: {}", bbsId);
                List<BbsCategoryDomain> categories = bbsCategoryRepository.findByBbsIdAndUseYn(bbsId);
                return categories.stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public BbsCategoryDto getCategory(Long categoryId) {
                log.debug("[getCategory] categoryId: {}", categoryId);
                BbsCategoryDomain category = bbsCategoryRepository.findById(categoryId)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                return convertToDto(category);
        }

        @Override
        public BbsCategoryDto createCategory(BbsCategoryDto categoryDto) {
                log.debug("[createCategory] categoryDto: {}", categoryDto);

                BbsMasterDomain bbsMaster = bbsMasterRepository.findById(categoryDto.getBbsId())
                                .orElseThrow(() -> new BbsMasterNotFoundException(categoryDto.getBbsId()));

                BbsCategoryDomain category = BbsCategoryDomain.builder()
                                .bbsMaster(bbsMaster)
                                .code(categoryDto.getCode())
                                .name(categoryDto.getName())
                                .sortOrder(categoryDto.getSortOrder() != null ? categoryDto.getSortOrder() : 0)
                                .displayYn(categoryDto.getDisplayYn() != null ? categoryDto.getDisplayYn() : "Y")
                                .build();

                BbsCategoryDomain savedCategory = bbsCategoryRepository.save(category);
                return convertToDto(savedCategory);
        }

        @Override
        public BbsCategoryDto updateCategory(Long categoryId, BbsCategoryDto categoryDto) {
                log.debug("[updateCategory] categoryId: {}, categoryDto: {}", categoryId, categoryDto);

                BbsCategoryDomain category = bbsCategoryRepository.findById(categoryId)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

                category.update(
                                categoryDto.getCode(),
                                categoryDto.getName(),
                                categoryDto.getSortOrder(),
                                categoryDto.getDisplayYn());

                BbsCategoryDomain savedCategory = bbsCategoryRepository.save(category);
                return convertToDto(savedCategory);
        }

        @Override
        public void deleteCategory(Long categoryId) {
                log.debug("[deleteCategory] categoryId: {}", categoryId);

                BbsCategoryDomain category = bbsCategoryRepository.findById(categoryId)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

                bbsCategoryRepository.delete(category);
        }

        private BbsCategoryDto convertToDto(BbsCategoryDomain domain) {
                return BbsCategoryDto.builder()
                                .categoryId(domain.getCategoryId())
                                .code(domain.getCode())
                                .name(domain.getName())
                                .bbsId(domain.getBbsMaster().getBbsId())
                                .sortOrder(domain.getSortOrder())
                                .displayYn(domain.getDisplayYn())
                                .build();
        }
}