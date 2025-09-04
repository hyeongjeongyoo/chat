"use client";

import React from "react";
import {
  Accordion,
  Box,
  Text,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import { PageDetailsDto } from "@/types/menu";
import { Post } from "@/types/api"; // Post 타입에 FAQ 질문(title)과 답변(content)이 있다고 가정
import { PaginationData } from "@/types/common"; // PaginationData import
import { useRouter, useSearchParams } from "next/navigation"; // for onPageChange
import { ArticleDisplay } from "@/components/articles/ArticleDisplay"; // Import ArticleDisplay
import PostTitleDisplay from "@/components/common/PostTitleDisplay"; // PostTitleDisplay 임포트
import { CustomPagination } from "@/components/common/CustomPagination";

interface FaqBoardSkinProps {
  pageDetails: PageDetailsDto;
  posts: Post[]; // 각 Post 객체가 하나의 FAQ 항목
  pagination: PaginationData; // 공통 타입 사용
  currentPathId: string; // currentPathId prop 타입 추가
}

const FaqBoardSkin: React.FC<FaqBoardSkinProps> = ({
  pageDetails,
  posts,
  pagination,
  currentPathId, // prop 받기
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 반응형 폰트 크기 설정
  const fontSize = useBreakpointValue({
    base: "sm",
    md: "lg",
    lg: "2xl",
  });

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", String(page + 1));
    router.push(`/bbs/${currentPathId}?${query.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", "1");
    query.set("size", String(newSize));
    router.push(`/bbs/${currentPathId}?${query.toString()}`);
  };

  return (
    <Box borderTop="2px solid #000" mt={5}>
      {posts.length > 0 ? (
        <>
          <Accordion.Root multiple collapsible>
            {posts.map((faqItem) => (
              <Accordion.Item key={faqItem.nttId} value={String(faqItem.nttId)}>
                <Accordion.ItemTrigger
                  position="relative"
                  w="100%"
                  maxW="1200px"
                  margin="0 auto"
                  py={{ base: "15px ", md: "20px", lg: "30px" }}
                >
                  <Box
                    display="flex"
                    gap={{ base: "15px ", md: "30px", lg: "85px" }}
                  >
                    <Text
                      color="#000"
                      fontSize={{ base: "md ", md: "2xl", lg: "4xl" }}
                      fontWeight="semibold"
                    >
                      Q
                    </Text>
                    <PostTitleDisplay
                      title={faqItem.title}
                      postData={faqItem}
                    />
                  </Box>
                  <Accordion.ItemIndicator
                    position="absolute"
                    right="0"
                    top={{ base: "15px", md: "25px", lg: "40px" }}
                    transition="transform 0.2s"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="37 !important"
                      height="36 !important"
                      viewBox="0 0 37 36"
                      fill="none"
                    >
                      <path
                        d="M4.18221 11.909C4.60414 11.4872 5.17634 11.2502 5.77296 11.2502C6.36958 11.2502 6.94177 11.4872 7.36371 11.909L18.5012 23.0465L29.6387 11.909C30.0631 11.4992 30.6314 11.2724 31.2214 11.2775C31.8113 11.2826 32.3756 11.5193 32.7928 11.9364C33.21 12.3536 33.4466 12.9179 33.4517 13.5079C33.4569 14.0978 33.2301 14.6662 32.8202 15.0905L20.092 27.8188C19.67 28.2406 19.0978 28.4775 18.5012 28.4775C17.9046 28.4775 17.3324 28.2406 16.9105 27.8188L4.18221 15.0905C3.7604 14.6686 3.52344 14.0964 3.52344 13.4998C3.52344 12.9032 3.7604 12.331 4.18221 11.909Z"
                        fill="black"
                      />
                    </svg>
                  </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody
                    w="100%"
                    maxW="1200px"
                    margin="0 auto"
                    py={{ base: "15px ", md: "20px", lg: "30px" }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={{ base: "15px ", md: "30px", lg: "85px" }}
                    >
                      <Text
                        alignSelf="flex-start"
                        color="#2C65FD"
                        fontSize={{ base: "md ", md: "2xl", lg: "4xl" }}
                        fontWeight="semibold"
                      >
                        A
                      </Text>
                      <ArticleDisplay
                        contentString={faqItem.content}
                        isFaq={true}
                        contentStyle={{
                          fontSize: fontSize,
                          color: "#5E5E5E",
                          fontWeight: "medium",
                        }}
                      />
                    </Box>
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
          <Flex justifyContent="center" mt={8}>
            <CustomPagination
              currentPage={pagination.currentPage - 1}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={pagination.pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </Flex>
        </>
      ) : (
        <Text textAlign="center" p={5}>
          등록된 FAQ 항목이 없습니다.
        </Text>
      )}
    </Box>
  );
};

export default FaqBoardSkin;
