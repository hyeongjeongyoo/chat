"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { BoardList } from "./components/BoardList";
import { BoardEditor } from "./components/BoardEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { toaster, Toaster } from "@/components/ui/toaster";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { boardApi, boardKeys } from "@/lib/api/board";
import { Menu, BoardMasterApiResponse, BoardMaster } from "@/types/api";
import { menuApi } from "@/lib/api/menu";
import { ArticleWriteDrawer } from "./components/ArticleWriteDrawer";
import { BoardPreview } from "./components/BoardPreview";

export default function BoardManagementPage() {
  const colors = useColors();
  const [selectedBoardMenu, setSelectedBoardMenu] = useState<Menu | null>(null);
  const [tempBoard, setTempBoard] = useState<BoardMaster | null>(null);
  const [loadingBoardId, setLoadingBoardId] = useState<number | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<BoardMaster | null>(null);
  const [drawerMenuId, setDrawerMenuId] = useState<number | null>(null);

  const bg = useColorModeValue(colors.bg, colors.darkBg);
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );

  const queryClient = useQueryClient();

  const { data: boardMastersResponse, isLoading: isBoardMastersLoading } =
    useQuery<BoardMasterApiResponse>({
      queryKey: boardKeys.all,
      queryFn: async () => {
        const response = await boardApi.getBoardMasters();
        return response.data;
      },
    });

  const boards: BoardMaster[] = useMemo(() => {
    return boardMastersResponse?.data?.content
      ? boardMastersResponse.data.content.map((master: BoardMaster) => {
          return {
            menuId: master.menuId,
            bbsId: master.bbsId,
            bbsName: master.bbsName,
            skinType: master.skinType,
            readAuth: master.readAuth,
            writeAuth: master.writeAuth,
            adminAuth: master.adminAuth,
            displayYn: master.displayYn,
            sortOrder: master.sortOrder,
            noticeYn: master.noticeYn,
            publishYn: master.publishYn,
            attachmentYn: master.attachmentYn,
            attachmentLimit: master.attachmentLimit,
            attachmentSize: master.attachmentSize,
            createdAt: master.createdAt,
            updatedAt: master.updatedAt,
          };
        })
      : [];
  }, [boardMastersResponse?.data?.content]);

  const saveBoardMutation = useMutation({
    mutationFn: boardApi.saveBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toaster.success({
        title: "게시판이 저장되었습니다.",
      });
      setTempBoard(null);
    },
    onError: () => {
      toaster.error({
        title: "게시판 저장에 실패했습니다.",
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: boardApi.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toaster.success({
        title: "게시판이 삭제되었습니다.",
      });
      setSelectedBoardMenu(null);
    },
    onError: () => {
      toaster.error({
        title: "게시판 삭제에 실패했습니다.",
      });
    },
  });

  // 게시판 메뉴 조회
  const { data: boardMenusResponse, isLoading: isBoardMenusLoading } = useQuery<
    Menu[]
  >({
    queryKey: ["boardMenus"],
    queryFn: async () => {
      const response = await menuApi.getMenusByType("BOARD");
      return response.data.content;
    },
  });

  // 최초 진입 시 첫 번째 게시판 자동 선택 (주석 처리)
  useEffect(() => {
    if (
      boardMenusResponse &&
      boardMenusResponse.length > 0 &&
      !selectedBoardMenu
    ) {
      setSelectedBoardMenu(boardMenusResponse[0]);
      // 필요하다면 setSelectedBoard도 같이 설정
      const board = boards.find(
        (b) => b.bbsId === boardMenusResponse[0].targetId
      );
      setSelectedBoard(board || null);
    }
  }, [boardMenusResponse, selectedBoardMenu, boards]);

  const handleAddBoard = useCallback(() => {
    setSelectedBoardMenu(null);
  }, []);

  const handleEditBoard = useCallback(
    (boardMenu: Menu, board: BoardMaster | null) => {
      setSelectedBoardMenu(boardMenu);
      setSelectedBoard(board);
    },
    []
  );

  const handleDeleteBoard = useCallback(
    async (boardId: number) => {
      try {
        setLoadingBoardId(boardId);
        if (tempBoard && tempBoard.bbsId === boardId) {
          setTempBoard(null);
          setSelectedBoardMenu(null);
        } else {
          await deleteBoardMutation.mutateAsync(boardId);
        }
      } finally {
        setLoadingBoardId(null);
      }
    },
    [tempBoard, deleteBoardMutation]
  );

  const handleSubmit = useCallback(
    async (boardData: BoardMaster) => {
      try {
        const boardId = tempBoard ? undefined : boardData.bbsId;
        if (boardId !== undefined) {
          setLoadingBoardId(boardId);
        }
        await saveBoardMutation.mutateAsync({
          id: boardId,
          boardData,
        });
      } finally {
        setLoadingBoardId(null);
      }
    },
    [tempBoard, saveBoardMutation]
  );

  // Calculate selectedBoardPreview FIRST (ensure it's recalculated when needed)
  const selectedBoardPreview = useMemo(() => {
    const foundBoard =
      selectedBoardMenu && selectedBoardMenu.targetId
        ? boards.find((b) => b.bbsId === selectedBoardMenu.targetId)
        : null;
    return foundBoard;
  }, [selectedBoardMenu, boards]);

  // Function to invalidate article list query for the selected board
  const refetchArticles = useCallback(() => {
    if (selectedBoardPreview?.bbsId && selectedBoardMenu?.id) {
      const keyToInvalidate: (string | number | undefined)[] = [
        "articles",
        selectedBoardPreview.bbsId,
        selectedBoardMenu.id,
      ];
      queryClient.invalidateQueries({ queryKey: keyToInvalidate });
    } else {
      // No warning needed if just closing drawer
    }
  }, [queryClient, selectedBoardPreview, selectedBoardMenu]);

  // Handler to open the drawer by setting the drawerMenuId
  const handleOpenDrawer = useCallback(() => {
    // Log the state right before checking the id
    if (selectedBoardMenu?.id) {
      setDrawerMenuId(selectedBoardMenu.id);
    } else {
      console.error(
        "[handleOpenDrawer] FAILED. selectedBoardMenu or id is missing:",
        selectedBoardMenu
      );
      toaster.error({
        title: "오류",
        description: "드로워를 열기 위한 메뉴 정보가 없습니다.",
      });
    }
  }, [selectedBoardMenu]);

  // Handler to close the drawer by resetting the drawerMenuId
  const handleCloseDrawer = useCallback(
    (isOpen?: boolean) => {
      const isClosing = isOpen === false || isOpen === undefined;
      if (isClosing) {
        setDrawerMenuId(null);
        refetchArticles();
      }
    },
    [refetchArticles]
  );

  const boardLayout = [
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
      id: "boardList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "게시판 목록",
      subtitle: "등록된 게시판 목록입니다.",
    },
    {
      id: "boardEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "게시판 편집",
      subtitle: "게시판의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "boardPreview",
      x: 3,
      y: 1,
      w: 9,
      h: 11,
      title: "게시판 미리보기",
      subtitle: "게시판의 미리보기를 확인할 수 있습니다.",
    },
  ];

  // 모든 데이터 로딩이 완료되었는지 확인
  const isLoading = isBoardMastersLoading || isBoardMenusLoading;

  if (isLoading) {
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Box>
    );
  }

  // Log state values right before the conditional rendering check

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={boardLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={headingColor} letterSpacing="tight">
                게시판 관리
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
            <BoardList
              boardMenus={boardMenusResponse || []}
              boards={boards}
              onAddBoard={handleAddBoard}
              onEditBoard={handleEditBoard}
              onDeleteBoard={handleDeleteBoard}
              isLoading={isBoardMastersLoading}
              selectedBoardMenuId={selectedBoardMenu?.id}
              loadingBoardId={loadingBoardId}
            />
          </Box>
          <Box>
            <BoardEditor
              boardMenu={selectedBoardMenu}
              board={selectedBoard}
              onSubmit={handleSubmit}
              isLoading={loadingBoardId !== null}
            />
          </Box>
          <Box id="boardPreview" position="relative">
            <BoardPreview
              board={selectedBoardPreview ?? null}
              menu={selectedBoardMenu}
              onAddArticleClick={handleOpenDrawer}
            />
          </Box>
        </GridSection>
      </Box>

      {/* Use ternary operator for cleaner conditional rendering */}
      {drawerMenuId !== null && selectedBoardPreview ? (
        <ArticleWriteDrawer
          bbsId={selectedBoardPreview.bbsId}
          menuId={drawerMenuId}
          onOpenChange={handleCloseDrawer}
        />
      ) : null}

      <Toaster />
    </Box>
  );
}
