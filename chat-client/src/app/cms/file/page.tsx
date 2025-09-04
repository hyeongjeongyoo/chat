"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Badge,
  VStack,
  Text,
  Button,
  Icon,
} from "@chakra-ui/react";
import { FileList } from "./components/FileList";
import { FileEditor } from "./components/FileEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toaster, Toaster } from "@/components/ui/toaster";
import { Main } from "@/components/layout/view/Main";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { menuApi, menuKeys, UpdateMenuOrderRequest } from "@/lib/api/menu";
import { fileApi } from "@/lib/api/file";

import { sortMenus } from "@/lib/api/menu";
import { Menu } from "@/types/api";
import { File as CustomFile } from "./types";
import { FileUploadDialog } from "./components/FileUploadDialog";
import { FiUpload } from "react-icons/fi";

type MenuType = Menu["type"]; // "LINK" | "FOLDER" | "BOARD" | "CONTENT" | "POPUP" | "PROGRAM"
type ModuleType = "CONTENT" | "POPUP" | "BBS" | "PROGRAM";

const MODULE_MAP: Record<MenuType, ModuleType> = {
  FOLDER: "CONTENT", // 폴더는 페이지 리소스로 처리
  LINK: "CONTENT", // 링크도 페이지 리소스로 처리
  BOARD: "BBS", // 게시판은 게시판 첨부파일로 처리
  CONTENT: "CONTENT", // 콘텐츠는 페이지 리소스로 처리
  POPUP: "POPUP", // 팝업은 팝업 이미지로 처리
  PROGRAM: "PROGRAM", // 프로그램은 프로그램 자료로 처리
};

function findParentMenu(menus: Menu[], targetId: number): Menu | null {
  if (targetId === -1) {
    return {
      id: -1,
      name: "전체",
      type: "FOLDER",
      visible: true,
      sortOrder: 0,
      children: menus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      displayPosition: "HEADER",
      parentId: null,
    };
  }
  for (const menu of menus) {
    if (menu.id === targetId) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findParentMenu(menu.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export default function MenuManagementPage() {
  const renderCount = React.useRef(0);
  renderCount.current += 1;

  const queryClient = useQueryClient();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [parentMenuId, setParentMenuId] = useState<number | null>(null);
  const [tempMenu, setTempMenu] = useState<Menu | null>(null);
  const [loadingMenuId, setLoadingMenuId] = useState<number | null>(null);
  const [forceExpandMenuId, setForceExpandMenuId] = useState<number | null>(
    null
  );
  const colors = useColors();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // 메뉴 목록 가져오기
  const { data: menuResponse, isLoading: isMenusLoading } = useQuery<Menu[]>({
    queryKey: menuKeys.list(""),
    queryFn: async () => {
      const response = await menuApi.getMenus();
      return response.data.data;
    },
  });

  const menus = React.useMemo(() => {
    try {
      const responseData = menuResponse;
      if (!responseData) return [];

      // API 응답이 배열인 경우
      if (Array.isArray(responseData)) {
        return sortMenus(responseData);
      }

      // API 응답이 객체인 경우 data 필드를 확인
      const menuData = responseData;
      if (!menuData) return [];

      // menuData가 배열인지 확인
      return Array.isArray(menuData) ? sortMenus(menuData) : [menuData];
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menuResponse]);

  // 파일 목록 조회
  const { data: fileList } = useQuery<CustomFile[]>({
    queryKey: ["file"],
    queryFn: async () => {
      try {
        const response = await fileApi.getAllFiles();
        return response.data;
      } catch (error) {
        return [];
      }
    },
    enabled: menus.length > 0,
  });

  // 메뉴 순서 업데이트 뮤테이션
  const updateOrderMutation = useMutation({
    mutationFn: menuApi.updateMenuOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      toaster.create({
        title: "메뉴 순서가 변경되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error updating menu order:", error);
      toaster.create({
        title: "메뉴 순서 변경에 실패했습니다.",
        type: "error",
      });
    },
  });

  // 메뉴 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: menuApi.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      setSelectedMenu(null);
      toaster.create({
        title: "메뉴가 삭제되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error deleting menu:", error);
      toaster.create({
        title: "메뉴 삭제에 실패했습니다.",
        type: "error",
      });
    },
  });

  // 메뉴 저장/업데이트 뮤테이션
  const saveMenuMutation = useMutation({
    mutationFn: (data: {
      id?: number;
      menuData: Omit<Menu, "id" | "createdAt" | "updatedAt">;
    }) => {
      return data.id
        ? menuApi.updateMenu(data.id, data.menuData)
        : menuApi.createMenu(data.menuData);
    },
    onSuccess: (savedMenu) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      setSelectedMenu(savedMenu.data);
      setParentMenuId(savedMenu.data.parentId || null);
      setTempMenu(null);
      toaster.create({
        title: tempMenu ? "메뉴가 생성되었습니다." : "메뉴가 수정되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error saving menu:", error);
      toaster.create({
        title: tempMenu
          ? "메뉴 생성에 실패했습니다."
          : "메뉴 수정에 실패했습니다.",
        type: "error",
      });
    },
  });

  const handleMoveMenu = useCallback(
    async (
      draggedId: number,
      targetId: number,
      position: "before" | "after" | "inside"
    ) => {
      try {
        setLoadingMenuId(draggedId);
        const request: UpdateMenuOrderRequest = {
          id: draggedId,
          targetId: targetId === -1 ? null : targetId,
          position: targetId === -1 ? "inside" : position,
        };
        await updateOrderMutation.mutateAsync([request]);
      } finally {
        setLoadingMenuId(null);
      }
    },
    [updateOrderMutation]
  );

  const handleDeleteMenu = useCallback(
    async (menuId: number) => {
      try {
        setLoadingMenuId(menuId);
        if (tempMenu && tempMenu.id === menuId) {
          setTempMenu(null);
        } else {
          await deleteMutation.mutateAsync(menuId);
        }
        const parentMenu = findParentMenu(menus, menuId);
        if (parentMenu) {
          setSelectedMenu(parentMenu);
          setParentMenuId(parentMenu.parentId || null);
          if (parentMenu.type === "FOLDER") {
            setForceExpandMenuId(parentMenu.id);
          }
        }
      } finally {
        setLoadingMenuId(null);
      }
    },
    [deleteMutation, menus, tempMenu]
  );

  const handleSubmit = useCallback(
    async (menuData: Omit<Menu, "id" | "createdAt" | "updatedAt">) => {
      try {
        const menuId = tempMenu ? undefined : selectedMenu?.id;
        if (menuId !== undefined) {
          setLoadingMenuId(menuId);
        }
        await saveMenuMutation.mutateAsync({
          id: menuId,
          menuData,
        });
      } catch (error) {
        console.error("Error saving menu:", error);
      } finally {
        setLoadingMenuId(null);
      }
    },
    [saveMenuMutation, selectedMenu, tempMenu]
  );

  // 메뉴 목록에 새 메뉴 추가하는 함수
  const addMenuToList = useCallback(
    (newMenu: Menu, targetMenu: Menu | null = null) => {
      if (!targetMenu) {
        return [...menus, newMenu];
      }

      const updateMenuTree = (menuList: Menu[]): Menu[] => {
        return menuList.map((menu) => {
          if (menu.id === targetMenu.id) {
            const updatedChildren = [...(menu.children || [])];
            updatedChildren.push(newMenu);
            return {
              ...menu,
              children: updatedChildren,
            };
          }
          if (menu.children && menu.children.length > 0) {
            return {
              ...menu,
              children: updateMenuTree(menu.children),
            };
          }
          return menu;
        });
      };

      return updateMenuTree(menus);
    },
    [menus]
  );

  // 임시 메뉴 생성 함수
  const handleAddMenu = useCallback(
    (parentMenu: Menu) => {
      const newTempMenu: Menu = {
        id: Date.now(), // 임시 ID
        name: "새 메뉴",
        type: "LINK",
        displayPosition: parentMenu.displayPosition,
        visible: true,
        sortOrder: 0,
        parentId: parentMenu.id,
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTempMenu(newTempMenu);
      setSelectedMenu(newTempMenu);
      setParentMenuId(parentMenu.id);

      // 임시 메뉴를 메뉴 목록에 추가
      const updatedMenus = [...(menus || [])];
      if (parentMenu.id === -1) {
        // 최상위 메뉴에 추가
        updatedMenus.push(newTempMenu);
      } else {
        // 부모 메뉴의 children에 추가
        const parentIndex = updatedMenus.findIndex(
          (m) => m.id === parentMenu.id
        );
        if (parentIndex !== -1) {
          const parent = updatedMenus[parentIndex];
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(newTempMenu);
        }
      }

      // React Query 캐시 업데이트
      queryClient.setQueryData(menuKeys.lists(), updatedMenus);
    },
    [menus, queryClient]
  );

  const handleEditMenu = useCallback(
    (menu: Menu) => {
      if (tempMenu) {
        // 임시 메뉴 수정 중인 경우 경고 모달 표시
        if (window.confirm("새 메뉴 추가가 취소됩니다. 취소하시겠습니까?")) {
          // 임시 메뉴를 메뉴 목록에서 제거
          const updatedMenus =
            menus?.filter((m: Menu) => m.id !== tempMenu.id) || [];
          queryClient.setQueryData(menuKeys.lists(), updatedMenus);

          setTempMenu(null);
          setSelectedMenu(menu);
          setParentMenuId(menu.parentId || null);
        }
      } else {
        setSelectedMenu(menu);
        setParentMenuId(menu.parentId || null);
      }
    },
    [menus, queryClient, tempMenu]
  );

  const handleCloseEditor = useCallback(() => {
    if (tempMenu) {
      // 임시 메뉴인 경우 삭제
      const updatedMenus =
        menus?.filter((m: Menu) => m.id !== tempMenu.id) || [];
      queryClient.setQueryData(menuKeys.lists(), updatedMenus);

      setTempMenu(null);
      setSelectedMenu(menus?.[0] || null);
    } else {
      // 기존 메뉴 편집 중 취소
      setSelectedMenu(null);
    }
  }, [menus, queryClient, tempMenu]);

  const handleCancelConfirm = useCallback(() => {
    setTempMenu(null);
    setSelectedMenu(null);
    setParentMenuId(null);
  }, []);

  const handleCancelCancel = useCallback(() => {
    // Implementation of handleCancelCancel
  }, []);

  // 메뉴 관리 페이지 레이아웃 정의
  const menuLayout = [
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
      id: "menuList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "파일 목록",
      subtitle: "메뉴별 파일 목록을 확인할 수 있습니다.",
    },
    {
      id: "menuEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "파일 관리",
      subtitle: "파일을 업로드하고 관리할 수 있습니다.",
    },
    {
      id: "preview",
      x: 3,
      y: 1,
      w: 9,
      h: 11,
      title: "파일 미리보기",
      subtitle: "선택한 파일의 미리보기를 확인할 수 있습니다.",
    },
  ];

  // 메뉴 목록이 업데이트될 때 선택된 메뉴를 동기화
  useEffect(() => {
    if (menus?.length > 0) {
      // 임시 메뉴가 없는 경우에만 초기 메뉴 선택
      if (!tempMenu && !selectedMenu) {
        setSelectedMenu(menus[0]);
      }
      // 임시 메뉴가 있는 경우, 해당 메뉴를 계속 선택 상태로 유지
      else if (tempMenu) {
        setSelectedMenu(tempMenu);
      }
    }
  }, [menus, tempMenu, selectedMenu]);

  return (
    <Box bg={colors.bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={menuLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={colors.text.primary}>
                파일 관리
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
            <DndProvider backend={HTML5Backend}>
              <FileList
                menus={menus}
                onAddMenu={handleAddMenu}
                onEditMenu={handleEditMenu}
                onDeleteMenu={handleDeleteMenu}
                onMoveMenu={handleMoveMenu}
                isLoading={isMenusLoading}
                selectedMenuId={selectedMenu?.id}
                loadingMenuId={loadingMenuId}
                forceExpandMenuId={forceExpandMenuId}
              />
            </DndProvider>
          </Box>

          <Box>
            <FileEditor
              menu={selectedMenu}
              onClose={handleCloseEditor}
              onDelete={handleDeleteMenu}
              onSubmit={handleSubmit}
              parentId={parentMenuId}
              onAddMenu={() => {
                if (selectedMenu?.type === "FOLDER") {
                  handleAddMenu(selectedMenu);
                } else if (selectedMenu?.parentId) {
                  const parentMenu = findParentMenu(
                    menus,
                    selectedMenu.parentId
                  );
                  if (parentMenu) {
                    handleAddMenu(parentMenu);
                  }
                } else {
                  handleAddMenu({
                    id: -1,
                    name: "전체",
                    type: "FOLDER",
                    visible: true,
                    sortOrder: 0,
                    children: menus,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    displayPosition: "HEADER",
                    parentId: null,
                  });
                }
              }}
              existingMenus={menus}
              isTempMenu={!!tempMenu}
            />
          </Box>

          <Box>
            <Main menus={menus} isPreview={true} currentPage="preview">
              <></>
            </Main>
          </Box>

          <Box>
            {selectedMenu && (
              <VStack gap={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text>
                    선택된 메뉴: {selectedMenu.name} (타입: {selectedMenu.type},
                    모듈: {MODULE_MAP[selectedMenu.type]})
                  </Text>
                  <Button
                    colorPalette="blue"
                    onClick={() => setIsUploadDialogOpen(true)}
                  >
                    <Icon as={FiUpload} />
                    파일 업로드
                  </Button>
                </Flex>
                {fileList && <Text>파일 목록이 콘솔에 출력됩니다.</Text>}
              </VStack>
            )}
          </Box>
        </GridSection>
      </Box>
      <ConfirmDialog
        isOpen={false}
        onClose={handleCancelCancel}
        onConfirm={handleCancelConfirm}
        title="메뉴 추가 취소"
        description="새 메뉴 추가가 취소됩니다. 취소하시겠습니까?"
        confirmText="취소"
        cancelText="계속"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
      <Toaster />
      {selectedMenu && (
        <FileUploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          module={MODULE_MAP[selectedMenu.type]}
          moduleId={selectedMenu.id}
        />
      )}
    </Box>
  );
}
