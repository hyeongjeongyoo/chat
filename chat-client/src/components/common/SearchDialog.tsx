"use client";

import {
  Dialog,
  Input,
  Link,
  Text,
  VStack,
  Box,
  CloseButton,
  Portal,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Menu as MenuType } from "@/types/api";
import Fuse, { type FuseResult } from "fuse.js";
import NextLink from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// 헬퍼 함수: 메뉴 트리를 평탄화하고 부모 경로를 추가
const flattenMenusWithParentPath = (
  menus: MenuType[],
  parentPath = ""
): (MenuType & { parent_path?: string })[] => {
  let flattened: (MenuType & { parent_path?: string })[] = [];
  for (const menu of menus) {
    const currentPath = parentPath ? `${parentPath} > ${menu.name}` : menu.name;
    flattened.push({ ...menu, parent_path: parentPath });
    if (menu.children && menu.children.length > 0) {
      flattened = [
        ...flattened,
        ...flattenMenusWithParentPath(menu.children as MenuType[], currentPath),
      ];
    }
  }
  return flattened;
};

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menus?: MenuType[];
}

export const SearchDialog = ({
  isOpen,
  onClose,
  menus: menuTree = [],
}: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const menus = useMemo(() => flattenMenusWithParentPath(menuTree), [menuTree]);
  const [results, setResults] = useState<
    FuseResult<MenuType & { parent_path?: string }>[]
  >([]);
  const router = useRouter();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(menus, {
        keys: ["name", "parent_path"],
        includeScore: true,
        threshold: 0.4,
      }),
    [menus]
  );

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    const searchResults = fuse.search(query);
    setResults(searchResults);
  }, [query, fuse]);

  const handleItemClick = (url: string | null) => {
    if (url) {
      if (url.startsWith("http")) {
        setTargetUrl(url);
        setConfirmOpen(true);
      } else {
        router.push(url);
        onClose();
      }
    }
  };

  const handleConfirmOpen = () => {
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    }
    setConfirmOpen(false);
    setTargetUrl(null);
    onClose(); // Also close the search dialog
  };

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(detail) => !detail.open && onClose()}
      placement="top"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mt="10vh" mx={2} maxW="xl" borderRadius="4xl">
            <Dialog.Header pb={0} pt={3}>
              <Dialog.Title>Search</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <Input
                placeholder="메뉴명을 검색하세요..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                borderRadius="3xl"
              />
              <Box mt={1} maxH="60vh" overflowY="auto">
                <VStack gap={1} align="stretch">
                  {results.length > 0
                    ? results.map(({ item }) => (
                        <Box
                          key={item.id}
                          p={2}
                          borderRadius="md"
                          _hover={{ bg: "gray.100" }}
                          onClick={() => handleItemClick(item.url ?? null)}
                          cursor="pointer"
                        >
                          <Link
                            as={NextLink}
                            href={item.url || "#"}
                            onClick={(e) => e.preventDefault()}
                            display="block"
                          >
                            <Text fontWeight="semibold">{item.name}</Text>
                            {item.parent_path && (
                              <Text fontSize="xs" color="gray.500">
                                {item.parent_path}
                              </Text>
                            )}
                          </Link>
                        </Box>
                      ))
                    : query && (
                        <Text textAlign="center" color="gray.500" p={4}>
                          검색 결과가 없습니다.
                        </Text>
                      )}
                </VStack>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmOpen}
        title="외부 링크 열기"
        description="새 탭에서 외부 링크를 여시겠습니까?"
      />
    </Dialog.Root>
  );
};
