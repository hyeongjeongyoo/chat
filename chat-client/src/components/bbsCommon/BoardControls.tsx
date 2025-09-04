"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import {
  Input,
  HStack,
  Flex,
  Text,
  Button,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { PageDetailsDto } from "@/types/menu";
import { PaginationData } from "@/types/common";
import ContentsHeading from "../layout/ContentsHeading";
import { Edit2 } from "lucide-react";

interface BoardControlsProps {
  pageDetails: PageDetailsDto;
  pagination?: PaginationData | null;
  currentPathId: string;
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  viewMode: "list" | "card";
  onViewModeChange: (mode: "list" | "card") => void;
  currentKeyword?: string; // For showing 'Clear' button
  requestedPageSize: number; // For 'Clear' button to retain page size
  defaultPageSize: number; // Fallback for 'Clear' button
}

const BoardControls: React.FC<BoardControlsProps> = ({
  pageDetails,
  pagination,
  currentPathId,
  keywordInput,
  onKeywordChange,
  onSearch,
  onClearSearch,
  viewMode,
  onViewModeChange,
  currentKeyword,
}) => {
  const [isCmsContext, setIsCmsContext] = useState(false);

  useEffect(() => {
    // Ensure this runs only client-side where window is available
    if (typeof window !== "undefined") {
      setIsCmsContext(window.location.pathname.includes("/cms/"));
    }
  }, []);

  // Calculate shouldShowWriteButton based on context and permissions
  const calculateWriteButtonVisibility = () => {
    if (!currentPathId) return false;

    if (isCmsContext) {
      return true; // Always show in CMS
    }

    // Public context logic
    const boardAuth = pageDetails.boardWriteAuth;
    const skinType = pageDetails.boardSkinType;

    if (skinType === "QNA" || skinType === "FORM") {
      // For QNA/FORM, allow if auth is generally permissive for public users (e.g., USER)
      // Do NOT show if it's ADMIN-only or MEMBER-only for writing on these public Q&A types.
      return boardAuth === "USER"; // Or add other permissive public roles like GUEST
    } else {
      // For other board types (BASIC, PRESS etc.) on public side,
      // only show if write auth is explicitly set to a public/all users role.
      return boardAuth === "USER"; // Or a specific "PUBLIC_WRITE_ALLOWED" role
    }
  };

  const shouldShowWriteButton = calculateWriteButtonVisibility();

  const showViewModeToggleForSkin = ["BASIC", "PRESS"].includes(
    pageDetails.boardSkinType || ""
  );

  return (
    <>
      <ContentsHeading title={pageDetails.menuName} />
      <Flex
        justify="space-between"
        alignItems={{ base: "stretch", md: "center" }}
        mb={2}
        gap={{ base: 3, md: 4 }}
        direction={{ base: "column", md: "row" }}
      >
        {/* Left Group: Title and Total Posts */}

        {pagination &&
          pagination.totalElements > -1 && ( // Show if totalElements is 0 or more
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              color="#05140E"
              fontWeight="medium"
            >
              · 총{" "}
              <Text
                as="span"
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color="#2C65FD"
                fontWeight="semibold"
              >
                {pagination.totalElements}
              </Text>
              개의 게시물이 등록되어 있습니다.
            </Text>
          )}

        {/* Right Group: Search, View Toggle, Write Button */}
        <Flex
          justifyContent={{ base: "center", sm: "flex-start", md: "flex-end" }}
          alignItems="center"
          width={{ base: "100%", md: "auto" }}
          flexWrap={{ base: "wrap", sm: "nowrap" }} // Allow wrapping on very small screens
        >
          <Input
            placeholder="검색어를 입력하세요"
            value={keywordInput}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            size="lg"
            width={{ base: "full", md: "300px", lg: "400px", xl: "520px" }} // Adjusted maxW
            variant="flushed"
            colorPalette="blue"
            borderBottom="1px solid #2C65FD"
            // No mb here, rely on Flex gap
          />
          <Button
            onClick={onSearch}
            variant="plain"
            colorPalette="blue"
            size="lg"
            borderBottom="1px solid #2C65FD"
            borderRadius="0"
          >
            <Icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
              >
                <path
                  d="M15.7771 14.5399L19.5247 18.2866L18.2866 19.5247L14.5399 15.7771C13.1458 16.8947 11.4118 17.5025 9.625 17.5C5.278 17.5 1.75 13.972 1.75 9.625C1.75 5.278 5.278 1.75 9.625 1.75C13.972 1.75 17.5 5.278 17.5 9.625C17.5025 11.4118 16.8947 13.1458 15.7771 14.5399ZM14.0219 13.8906C15.1321 12.7485 15.7522 11.2178 15.75 9.625C15.75 6.24137 13.0086 3.5 9.625 3.5C6.24137 3.5 3.5 6.24137 3.5 9.625C3.5 13.0086 6.24137 15.75 9.625 15.75C11.2178 15.7522 12.7485 15.1321 13.8906 14.0219L14.0219 13.8906Z"
                  fill="#2C65FD"
                />
              </svg>
            </Icon>
          </Button>
          {currentKeyword && (
            <Button onClick={onClearSearch} variant="outline" size="lg">
              초기화
            </Button>
          )}
          {showViewModeToggleForSkin && (
            <HStack gap={0}>
              <IconButton
                aria-label="List view"
                variant={viewMode === "list" ? "solid" : "outline"}
                colorPalette={viewMode === "list" ? "blue" : "gray"}
                size="lg"
                backgroundColor="transparent"
                border="0"
                p={0}
                onClick={() => onViewModeChange("list")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  style={{
                    width: "50px",
                    height: "50px",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseOver={(e) => {
                    const paths = e.currentTarget.querySelectorAll("path");
                    paths.forEach((path) => {
                      path.setAttribute("fill", "#2C65FD");
                    });
                  }}
                  onMouseOut={(e) => {
                    const paths = e.currentTarget.querySelectorAll("path");
                    paths.forEach((path) => {
                      path.setAttribute(
                        "fill",
                        viewMode === "list" ? "#2C65FD" : "#bfbfbf"
                      );
                    });
                  }}
                >
                  <path
                    d="M8.33333 18.7503C7.74306 18.7503 7.24861 18.5503 6.85 18.1503C6.45139 17.7503 6.25139 17.2559 6.25 16.667V12.5003C6.25 11.91 6.45 11.4156 6.85 11.017C7.25 10.6184 7.74444 10.4184 8.33333 10.417H12.5C13.0903 10.417 13.5854 10.617 13.9854 11.017C14.3854 11.417 14.5847 11.9114 14.5833 12.5003V16.667C14.5833 17.2573 14.3833 17.7524 13.9833 18.1524C13.5833 18.5524 13.0889 18.7517 12.5 18.7503H8.33333ZM18.75 18.7503C18.1597 18.7503 17.6653 18.5503 17.2667 18.1503C16.8681 17.7503 16.6681 17.2559 16.6667 16.667V12.5003C16.6667 11.91 16.8667 11.4156 17.2667 11.017C17.6667 10.6184 18.1611 10.4184 18.75 10.417H41.6667C42.2569 10.417 42.7521 10.617 43.1521 11.017C43.5521 11.417 43.7514 11.9114 43.75 12.5003V16.667C43.75 17.2573 43.55 17.7524 43.15 18.1524C42.75 18.5524 42.2556 18.7517 41.6667 18.7503H18.75ZM18.75 29.167C18.1597 29.167 17.6653 28.967 17.2667 28.567C16.8681 28.167 16.6681 27.6725 16.6667 27.0837V22.917C16.6667 22.3267 16.8667 21.8323 17.2667 21.4337C17.6667 21.035 18.1611 20.835 18.75 20.8337H41.6667C42.2569 20.8337 42.7521 21.0337 43.1521 21.4337C43.5521 21.8337 43.7514 22.3281 43.75 22.917V27.0837C43.75 27.6739 43.55 28.1691 43.15 28.5691C42.75 28.9691 42.2556 29.1684 41.6667 29.167H18.75ZM18.75 39.5837C18.1597 39.5837 17.6653 39.3837 17.2667 38.9837C16.8681 38.5837 16.6681 38.0892 16.6667 37.5003V33.3337C16.6667 32.7434 16.8667 32.2489 17.2667 31.8503C17.6667 31.4517 18.1611 31.2517 18.75 31.2503H41.6667C42.2569 31.2503 42.7521 31.4503 43.1521 31.8503C43.5521 32.2503 43.7514 32.7448 43.75 33.3337V37.5003C43.75 38.0906 43.55 38.5857 43.15 38.9857C42.75 39.3857 42.2556 39.5851 41.6667 39.5837H18.75ZM8.33333 39.5837C7.74306 39.5837 7.24861 39.3837 6.85 38.9837C6.45139 38.5837 6.25139 38.0892 6.25 37.5003V33.3337C6.25 32.7434 6.45 32.2489 6.85 31.8503C7.25 31.4517 7.74444 31.2517 8.33333 31.2503H12.5C13.0903 31.2503 13.5854 31.4503 13.9854 31.8503C14.3854 32.2503 14.5847 32.7448 14.5833 33.3337V37.5003C14.5833 38.0906 14.3833 38.5857 13.9833 38.9857C13.5833 39.3857 13.0889 39.5851 12.5 39.5837H8.33333ZM8.33333 29.167C7.74306 29.167 7.24861 28.967 6.85 28.567C6.45139 28.167 6.25139 27.6725 6.25 27.0837V22.917C6.25 22.3267 6.45 21.8323 6.85 21.4337C7.25 21.035 7.74444 20.835 8.33333 20.8337H12.5C13.0903 20.8337 13.5854 21.0337 13.9854 21.4337C14.3854 21.8337 14.5847 22.3281 14.5833 22.917V27.0837C14.5833 27.6739 14.3833 28.1691 13.9833 28.5691C13.5833 28.9691 13.0889 29.1684 12.5 29.167H8.33333Z"
                    fill={viewMode === "list" ? "#2C65FD" : "#bfbfbf"}
                  />
                </svg>
              </IconButton>
              <IconButton
                aria-label="Card view"
                variant={viewMode === "card" ? "solid" : "outline"}
                colorPalette={viewMode === "card" ? "blue" : "gray"}
                size="lg"
                backgroundColor="transparent"
                border="0"
                p={0}
                onClick={() => onViewModeChange("card")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  style={{
                    width: "50px",
                    height: "50px",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseOver={(e) => {
                    const paths = e.currentTarget.querySelectorAll("path");
                    paths.forEach((path) => {
                      path.setAttribute("fill", "#2C65FD");
                    });
                  }}
                  onMouseOut={(e) => {
                    const paths = e.currentTarget.querySelectorAll("path");
                    paths.forEach((path) => {
                      path.setAttribute(
                        "fill",
                        viewMode === "card" ? "#2C65FD" : "#bfbfbf"
                      );
                    });
                  }}
                >
                  <path
                    d="M41.6641 8.33301H8.33073C6.03906 8.33301 4.16406 10.208 4.16406 12.4997V37.4997C4.16406 39.7913 6.03906 41.6663 8.33073 41.6663H41.6641C43.9557 41.6663 45.8307 39.7913 45.8307 37.4997V12.4997C45.8307 10.208 43.9557 8.33301 41.6641 8.33301ZM16.6641 37.4997H8.33073V12.4997H16.6641V37.4997ZM29.1641 37.4997H20.8307V12.4997H29.1641V37.4997ZM41.6641 37.4997H33.3307V12.4997H41.6641V37.4997Z"
                    fill={viewMode === "card" ? "#2C65FD" : "#bfbfbf"}
                  />
                </svg>
              </IconButton>
            </HStack>
          )}
          {shouldShowWriteButton && (
            <HStack gap={1}>
              <NextLink href={`/bbs/${currentPathId}/write`} passHref>
                <Button
                  colorPalette="blue"
                  size="md"
                  width="42px"
                  height="42px"
                >
                  <Edit2 size={30} />
                </Button>
              </NextLink>
            </HStack>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default BoardControls;
