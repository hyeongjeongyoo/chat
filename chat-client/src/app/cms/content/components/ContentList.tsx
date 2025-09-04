"use client";

import {
  Badge,
  Text,
  Box,
  Center,
  Flex,
  Spinner,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { TreeItem } from "@/components/ui/tree-list";
import {
  LuInbox,
  LuFileText,
  LuFolder,
  LuFolderOpen,
  LuSearch,
  LuEyeOff,
  LuLink,
  LuLayoutList,
  LuAirplay,
} from "react-icons/lu";
import { ListItem } from "@/components/ui/list-item";

export interface ContentListProps {
  menus: TreeItem[];
  onEditContent: (content: TreeItem) => void;
  onDeleteContent: (contentId: number) => void;
  isLoading: boolean;
  selectedContentId?: number;
}

export function ContentList({
  menus,
  onEditContent,
  onDeleteContent,
  isLoading,
  selectedContentId,
}: ContentListProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const colors = useColors();
  const emptyColor = useColorModeValue(
    colors.text.secondary,
    colors.text.secondary
  );
  const iconColor = useColorModeValue(
    colors.text.secondary,
    colors.text.secondary
  );
  const folderColor = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  const buildTreeWithRoot = useCallback((list: TreeItem[]): TreeItem[] => {
    const root: TreeItem = {
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

    const nodeMap = new Map<number, TreeItem>();
    list.forEach((item) => {
      nodeMap.set(item.id, { ...item, children: [] });
    });

    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId);
        parent?.children?.push(node);
      } else {
        root.children?.push(node);
      }
    });

    return [root];
  }, []);

  const menuTree = useMemo(
    () => buildTreeWithRoot(menus),
    [menus, buildTreeWithRoot]
  );

  const filterMenus = useCallback(
    (menusToFilter: TreeItem[], term: string): TreeItem[] => {
      if (!term) {
        return menusToFilter;
      }

      const lowercasedTerm = term.toLowerCase();

      function searchAndFilter(menu: TreeItem): TreeItem | null {
        const isMatch =
          menu.name.toLowerCase().includes(lowercasedTerm) ||
          (menu.url || "").toLowerCase().includes(lowercasedTerm);

        const filteredChildren = menu.children
          ?.map(searchAndFilter)
          .filter((child): child is TreeItem => child !== null);

        if (isMatch || (filteredChildren && filteredChildren.length > 0)) {
          return {
            ...menu,
            children: filteredChildren || [],
          };
        }

        return null;
      }

      return menusToFilter
        .map(searchAndFilter)
        .filter((menu): menu is TreeItem => menu !== null);
    },
    []
  );

  const filteredMenus = useMemo(
    () => filterMenus(menuTree, searchTerm),
    [menuTree, searchTerm, filterMenus]
  );

  const expandAll = useCallback((menusToExpand: TreeItem[]) => {
    const newExpanded = new Set<number>();
    const stack = [...menusToExpand];
    while (stack.length > 0) {
      const menu = stack.pop();
      if (menu && menu.children && menu.children.length > 0) {
        newExpanded.add(menu.id);
        stack.push(...menu.children);
      }
    }
    setExpandedMenus(newExpanded);
  }, []);

  useEffect(() => {
    expandAll(menuTree);
  }, [menuTree, expandAll]);

  useEffect(() => {
    if (searchTerm) {
      expandAll(filteredMenus);
    } else {
      expandAll(menuTree);
    }
  }, [searchTerm, filteredMenus, expandAll, menuTree]);

  const toggleMenu = (menuId: number) => {
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

  const getMenuIcon = (menu: TreeItem) => {
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
      case "PROGRAM":
        return (
          <Box color={color}>
            <LuAirplay />
          </Box>
        );
      default:
        return (
          <Box color={color}>
            <LuFileText />
          </Box>
        );
    }
  };

  const renderMenuItem = (menu: TreeItem, level: number) => {
    const isFolder = menu.type === "FOLDER";
    const isExpanded = expandedMenus.has(menu.id);

    const handleItemClick = () => {
      if (isFolder && menu.id !== 0) {
        toggleMenu(menu.id);
      } else {
        console.log("선택된 컨텐츠 메뉴:", menu);
        onEditContent(menu);
      }
    };

    return (
      <div key={menu.id}>
        <Box pl={level * 4}>
          <ListItem
            id={menu.id}
            name={
              <Flex align="center" overflow="hidden">
                <Text as="span">{menu.name}</Text>
                {!isFolder && (
                  <Text
                    as="span"
                    ml={2}
                    color="gray.500"
                    fontSize="sm"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {menu.url}
                  </Text>
                )}
              </Flex>
            }
            icon={getMenuIcon(menu)}
            isSelected={
              (menu.id === 0 || !isFolder) && menu.id === selectedContentId
            }
            renderBadges={() =>
              !menu.visible && (
                <Box color={iconColor}>
                  <LuEyeOff />
                </Box>
              )
            }
            onClick={handleItemClick}
          />
        </Box>
        {isExpanded &&
          menu.children?.map((child) => renderMenuItem(child, level + 1))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="full">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={2} gap={2}>
        <Input
          size="xs"
          placeholder="이름 또는 경로로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Flex>
      {filteredMenus.length === 0 ? (
        <Center py={8} flexDirection="column" gap={2}>
          <LuInbox size={24} color={emptyColor} />
          <Text color={emptyColor}>
            {searchTerm ? "검색 결과가 없습니다." : "등록된 컨텐츠가 없습니다."}
          </Text>
        </Center>
      ) : (
        filteredMenus?.map((menu) => renderMenuItem(menu, 0))
      )}
    </Box>
  );
}
