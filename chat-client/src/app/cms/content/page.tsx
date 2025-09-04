"use client";

import { useState } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { ContentList } from "./components/ContentList";
import { ContentEditor } from "./components/ContentEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";
import { TreeItem } from "@/components/ui/tree-list";
import { ContentPreview } from "./components/ContentPreview";
import { convertTreeItemToContent } from "./types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { menuApi, menuKeys } from "@/lib/api/menu";
import { Menu } from "@/types/api";

const mainPageDefault: TreeItem = {
  id: 0,
  name: "메인 페이지",
  type: "FOLDER",
  children: [],
  url: "/",
  visible: true,
  sortOrder: 0,
  displayPosition: "",
  createdAt: "",
  updatedAt: "",
};

// Menu를 TreeItem으로 변환하는 헬퍼 함수
const convertMenuToTreeItem = (menu: Menu): TreeItem => ({
  ...menu,
  parentId: menu.parentId === null ? undefined : menu.parentId,
  children: menu.children?.map(convertMenuToTreeItem),
});

export default function ContentManagementPage() {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<TreeItem | null>(
    mainPageDefault
  );
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [reloadSignal, setReloadSignal] = useState(Date.now());

  const colors = useColors();
  const bg = useColorModeValue(colors.bg, colors.darkBg);

  // ContentPreview를 위해 모든 메뉴를 가져오는 쿼리
  const { data: allMenus = [], isLoading } = useQuery<Menu[]>({
    queryKey: menuKeys.lists(),
    queryFn: async () => {
      const response = await menuApi.getMenus();
      return response.data.data || [];
    },
  });

  // 테마 색상 적용
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );

  const handleEditContent = (content: TreeItem) => {
    setSelectedContent(content);
    setPreviewKey(Date.now()); // 미리보기 리프레시 (key 변경으로 전체 리렌더링)
  };

  const handleSaveSuccess = () => {
    setReloadSignal(Date.now()); // 저장 성공 시 리프레시 신호 발생 (내부 리로드)
  };

  const handleDeleteContent = async (contentId: number) => {
    try {
      await menuApi.deleteMenu(contentId);

      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      setSelectedContent(null);
      toaster.create({
        title: "컨텐츠가 삭제되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toaster.create({
        title: "컨텐츠 삭제에 실패했습니다.",
        type: "error",
      });
    }
  };

  // 컨텐츠 관리 페이지 레이아웃 정의
  const contentLayout = [
    {
      id: "header",
      x: 0,
      y: 0,
      w: 12,
      h: 1,
      isStatic: true,
      isHeader: true,
    },
    {
      id: "contentList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "컨텐츠 목록",
      subtitle: "등록된 컨텐츠 목록입니다.",
    },
    {
      id: "contentEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "컨텐츠 편집",
      subtitle: "컨텐츠의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "contentPreview",
      x: 3,
      y: 1,
      w: 9,
      h: 11,
      title: "컨텐츠 미리보기",
      subtitle: "컨텐츠의 미리보기를 확인할 수 있습니다.",
    },
  ];

  const allTreeItems = allMenus.map(convertMenuToTreeItem);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box bg={bg} minH="100vh" w="full" position="relative">
        <Box w="full">
          <GridSection initialLayout={contentLayout}>
            <Flex justify="space-between" align="center" h="36px">
              <Flex align="center" gap={2} px={2}>
                <Heading size="lg" color={headingColor} letterSpacing="tight">
                  컨텐츠 관리
                </Heading>
                <Badge
                  bg={colors.secondary.light}
                  color={colors.secondary.default}
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  관리자
                </Badge>
              </Flex>
            </Flex>

            <Box>
              <ContentList
                menus={allTreeItems}
                onEditContent={handleEditContent}
                onDeleteContent={handleDeleteContent}
                isLoading={isLoading}
                selectedContentId={selectedContent?.id}
              />
            </Box>

            <Box>
              <ContentEditor
                selectedMenu={selectedContent}
                onSaveSuccess={handleSaveSuccess}
              />
            </Box>
            <Box h="full" w="full">
              <ContentPreview
                key={previewKey}
                reloadSignal={reloadSignal}
                content={
                  selectedContent
                    ? convertTreeItemToContent(selectedContent)
                    : null
                }
                menus={allMenus}
              />
            </Box>
          </GridSection>
        </Box>
      </Box>
    </DndProvider>
  );
}
