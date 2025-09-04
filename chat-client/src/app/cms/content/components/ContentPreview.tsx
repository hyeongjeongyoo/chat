"use client";

import { useEffect, useRef } from "react";
import { Box, Flex, Text, Spinner, Center } from "@chakra-ui/react";
import { TreeItem } from "@/components/ui/tree-list";
import { Menu } from "@/types/api";

interface ContentPreviewProps {
  content: {
    id: number;
    name: string;
    url: string;
    type: string;
  } | null;
  menus: Menu[];
  reloadSignal?: number; // 새로고침 신호
}

export function ContentPreview({
  content,
  menus,
  reloadSignal,
}: ContentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (reloadSignal && iframeRef.current) {
      iframeRef.current.contentWindow?.location.reload();
    }
  }, [reloadSignal]);

  if (!content) {
    return (
      <Center h="100%">
        <Text color="gray.500">
          왼쪽 목록에서 콘텐츠를 선택하여 미리보기를 시작하세요.
        </Text>
      </Center>
    );
  }

  const findMenuById = (menus: Menu[], id: number): Menu | undefined => {
    for (const menu of menus) {
      if (menu.id === id) return menu;
      if (menu.children) {
        const found = findMenuById(menu.children, id);
        if (found) return found;
      }
    }
  };

  const getFullUrl = (content: { id: number; url?: string }): string => {
    const menu = findMenuById(menus, content.id);
    if (menu && menu.url) {
      // 메뉴의 URL이 '/'로 시작하지 않으면 앞에 '/'를 붙여줍니다.
      const formattedUrl = menu.url.startsWith("/") ? menu.url : `/${menu.url}`;
      return formattedUrl;
    }
    // 메뉴를 찾지 못한 경우, content의 기본 URL을 사용
    const defaultUrl = content.url || "/";
    return defaultUrl.startsWith("/") ? defaultUrl : `/${defaultUrl}`;
  };

  const previewUrl = getFullUrl(content);

  return (
    <Box h="100%" w="100%" bg="white" borderRadius="md" overflow="hidden">
      <iframe
        ref={iframeRef}
        src={previewUrl}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Content Preview"
      />
    </Box>
  );
}
