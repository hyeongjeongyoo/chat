"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, Spinner, VStack } from "@chakra-ui/react";
import { Menu } from "@/types/api";
import { ListItem } from "@/components/ui/list-item";
import {
  LuFolder,
  LuFolderOpen,
  LuLink,
  LuLayoutList,
  LuFileText,
  LuEyeOff,
} from "react-icons/lu";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DropZone } from "@/components/ui/drop-zone";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MenuSkeleton } from "./FileSkeleton";

interface FileListProps {
  menus: Menu[];
  onAddMenu: (menu: Menu) => void;
  onEditMenu: (menu: Menu) => void;
  onDeleteMenu: (menuId: number) => void;
  onMoveMenu: (
    draggedId: number,
    targetId: number,
    position: "before" | "after" | "inside"
  ) => void;
  isLoading: boolean;
  selectedMenuId?: number;
  loadingMenuId?: number | null;
  forceExpandMenuId?: number | null;
}

export function FileList({
  menus,
  onAddMenu,
  onEditMenu,
  onDeleteMenu,
  onMoveMenu,
  isLoading,
  selectedMenuId,
  loadingMenuId,
  forceExpandMenuId,
}: FileListProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(
    new Set([-1])
  );
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const FileListRef = useRef<HTMLDivElement>(null);
  const colors = useColors();
  const iconColor = useColorModeValue(
    colors.text.secondary,
    colors.text.secondary
  );
  const folderColor = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  const toggleMenu = (menuId: number) => {
    if (menuId === -1) return;

    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const getMenuIcon = (menu: Menu) => {
    const isExpanded = expandedMenus.has(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const color = menu.type === "FOLDER" ? folderColor : iconColor;

    switch (menu.type) {
      case "FOLDER":
        return hasChildren && isExpanded ? (
          <Box color={color}>
            <LuFolderOpen />
          </Box>
        ) : (
          <Box color={color}>
            <LuFolder />
          </Box>
        );
      case "LINK":
        return (
          <Box color={color}>
            <LuLink />
          </Box>
        );
      case "BOARD":
        return (
          <Box color={color}>
            <LuLayoutList />
          </Box>
        );
      case "CONTENT":
        return (
          <Box color={color}>
            <LuFileText />
          </Box>
        );
      default:
        return (
          <Box color={color}>
            <LuLink />
          </Box>
        );
    }
  };

  const handleAddMenu = (parentMenu: Menu) => {
    // 전체 메뉴인 경우 (id가 -1)
    if (parentMenu.id === -1) {
      // 전체 메뉴를 부모로 사용하고 parentId를 undefined로 설정
      onAddMenu({
        ...parentMenu,
        parentId: null,
      });
      return;
    }

    // 부모 메뉴가 접혀있으면 펼치기
    if (!expandedMenus.has(parentMenu.id)) {
      toggleMenu(parentMenu.id);
    }

    // 부모 컴포넌트의 handleAddMenu 함수 호출
    onAddMenu(parentMenu);
  };

  const handleMoveMenu = (
    draggedId: number,
    targetId: number,
    position: "before" | "after" | "inside"
  ) => {
    // 전체 메뉴로의 이동은 최상위로 이동하는 것으로 처리
    if (targetId === -1) {
      onMoveMenu(draggedId, 0, position); // 0은 최상위 메뉴를 나타냄
      return;
    }
    onMoveMenu(draggedId, targetId, position);
  };

  const handleDeleteClick = (menu: Menu) => {
    setMenuToDelete(menu);
  };

  const handleDeleteConfirm = () => {
    if (menuToDelete) {
      onDeleteMenu(menuToDelete.id);
      setMenuToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setMenuToDelete(null);
  };

  // 선택된 메뉴로 스크롤 이동
  useEffect(() => {
    if (selectedMenuId && FileListRef.current) {
      const selectedElement = FileListRef.current.querySelector(
        `[data-menu-id="${selectedMenuId}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedMenuId]);

  // forceExpandMenuId가 변경될 때 해당 메뉴를 강제로 펼치고 포커스
  useEffect(() => {
    if (forceExpandMenuId) {
      setExpandedMenus((prev) => {
        const next = new Set(prev);
        next.add(forceExpandMenuId);
        return next;
      });

      // 약간의 지연을 두어 DOM이 업데이트된 후에 포커스
      setTimeout(() => {
        const element = FileListRef.current?.querySelector(
          `[data-menu-id="${forceExpandMenuId}"]`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [forceExpandMenuId]);

  const renderMenuItem = (menu: Menu, level: number, index: number) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isFolder = menu.type === "FOLDER";
    const isExpanded = expandedMenus.has(menu.id);
    const isLoading = loadingMenuId === menu.id;

    return (
      <div key={menu.id} data-menu-id={menu.id}>
        <DropZone
          onDrop={handleMoveMenu}
          targetId={menu.id}
          level={level}
          isFolder={isFolder}
        />
        <Box cursor={menu.id === -1 ? "not-allowed" : "pointer"}>
          <ListItem
            id={menu.id}
            name={menu.name}
            icon={isLoading ? <Spinner size="sm" /> : getMenuIcon(menu)}
            isSelected={menu.id === selectedMenuId}
            onAdd={
              menu.type === "FOLDER" ? () => handleAddMenu(menu) : undefined
            }
            onDelete={
              menu.id === -1 ? undefined : () => handleDeleteClick(menu)
            }
            renderBadges={() =>
              !menu.visible && (
                <Flex align="center" justify="center" width={10} height={10}>
                  <LuEyeOff size={12} color={colors.text.secondary} />
                </Flex>
              )
            }
            onClick={() => {
              onEditMenu(menu);
              if (hasChildren) {
                toggleMenu(menu.id);
              }
            }}
            index={index}
            level={level}
            isDragging={false}
            type={
              menu.type as
                | "LINK"
                | "FOLDER"
                | "BOARD"
                | "CONTENT"
                | "MAIN"
                | "SUB"
                | undefined
            }
          />
        </Box>
        {hasChildren && (
          <Box
            pl={6}
            style={{
              maxHeight: isExpanded ? "1000vh" : "0",
              overflow: "hidden",
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? "translateY(0)" : "translateY(-10px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {menu.children?.map((child: Menu, childIndex: number) =>
              renderMenuItem(child, level + 1, childIndex)
            )}
          </Box>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <MenuSkeleton />;
  }

  // 전체 메뉴를 최상위 루트로 추가
  const rootMenu: Menu = {
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

  if (menus.length === 0) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Text color="gray.500">메뉴가 없습니다.</Text>
      </Flex>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box ref={FileListRef}>
        <VStack gap={0} align="stretch">
          <DropZone
            targetId={rootMenu.id}
            level={0}
            onDrop={(draggedId, targetId) => {
              onMoveMenu(draggedId, targetId, "before");
            }}
          />
          {renderMenuItem(rootMenu, 0, 0)}
          <DropZone
            targetId={rootMenu.id}
            level={0}
            onDrop={(draggedId, targetId) => {
              onMoveMenu(draggedId, targetId, "after");
            }}
          />
        </VStack>
      </Box>
      <ConfirmDialog
        isOpen={!!menuToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="메뉴 삭제"
        description={`"${menuToDelete?.name}" 메뉴를 삭제하시겠습니까?`}
        confirmText="삭제"
        cancelText="취소"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
    </DndProvider>
  );
}
