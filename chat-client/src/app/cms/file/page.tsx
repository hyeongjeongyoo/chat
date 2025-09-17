"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Badge,
  VStack,
  Text,
  HStack,
  IconButton,
  Image,
} from "@chakra-ui/react";
// 기존 컴포넌트는 유지하되, 본 페이지에서는 좌측을 채널/스레드 패널로 활용
// import { FileList } from "./components/FileList";
// import { FileEditor } from "./components/FileEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
//
import { toaster, Toaster } from "@/components/ui/toaster";
//

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { menuApi, menuKeys, UpdateMenuOrderRequest } from "@/lib/api/menu";
import { fileApi } from "@/lib/api/file";
import { useSearchParams, useRouter } from "next/navigation";

import { sortMenus } from "@/lib/api/menu";
import { Menu } from "@/types/api";
import { File as CustomFile } from "./types";
import { FileUploadDialog } from "./components/FileUploadDialog";
import { LuDownload, LuFile, LuImage } from "react-icons/lu";
import { privateApiMethods } from "@/lib/api/client";
import { SidePanels } from "@/components/chat/SidePanels";
import { chatApi } from "@/lib/api/chat";

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

// 채팅관리 좌측 목록과 동일한 형태의 임시 채널/스레드
type Channel = { id: number; code: string; name: string };
type Thread = { id: number; channelId: number; userIdentifier: string; userName: string; lastAt?: string };

const mockChannels: Channel[] = [
  { id: 1, code: "TEST", name: "CMS01" },
];

const mockThreads: Thread[] = [
  { id: 2, channelId: 1, userIdentifier: "thread-2", userName: "사용자#2", lastAt: new Date().toISOString() },
  { id: 11, channelId: 1, userIdentifier: "visitor-001", userName: "방문자A", lastAt: new Date().toISOString() },
  { id: 12, channelId: 1, userIdentifier: "visitor-002", userName: "방문자B", lastAt: new Date().toISOString() },
];

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const threadIdParam = searchParams.get("threadId");
  const channelIdParam = searchParams.get("channelId");
  const threadId = threadIdParam ? Number(threadIdParam) : null;
  const channelId = channelIdParam ? Number(channelIdParam) : null;
  const [filterChannelCode, setFilterChannelCode] = useState<string>("");
  const [filterThreadId, setFilterThreadId] = useState<string>(threadId ? String(threadId) : "");
  const [selectedChannelCode, setSelectedChannelCode] = useState<string>(filterChannelCode || "TEST");
  const [selectedThreadIdForView, setSelectedThreadIdForView] = useState<number | null>(threadId ?? null);

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
    queryKey: ["file", "CHAT", "all"],
    queryFn: async () => {
      try {
        const list = await privateApiMethods.get<CustomFile[]>(
          "/cms/file/private/all",
          { params: { menu: "CHAT", publicYn: "Y", page: 0, size: 1000 } } as any
        );
        return list as unknown as CustomFile[];
      } catch (error) {
        return [] as any[];
      }
    },
    enabled: menus.length > 0,
  });

  const filesData = React.useMemo(() => {
    if (Array.isArray(fileList)) return fileList as any[];
    const maybe = (fileList as any)?.data;
    return Array.isArray(maybe) ? maybe : [];
  }, [fileList]);

  // 선택한 채널의 스레드 목록을 가져와 채널 단위로 파일을 필터링한다
  const { data: channelThreads } = useQuery<
    Array<{ id: number; channelId: number; userIdentifier: string; userName?: string }> | undefined
  >({
    queryKey: ["chat-threads-by-channel", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      try {
        const threads = await chatApi.getThreadsByChannel(channelId);
        return threads;
      } catch (e) {
        return [];
      }
    },
    enabled: !!channelId,
  });

  const filteredFiles = React.useMemo(() => {
    if (!channelId) return filesData;
    const threadIdSet = new Set<number>((channelThreads || []).map((t) => t.id));
    return filesData.filter((f: any) => threadIdSet.has(Number((f as any).menuId ?? 0)));
  }, [filesData, channelThreads, channelId]);

  // 파일 목록에서 스레드 목록(사람) 추출 및 초기 선택: URL threadId > 첫 항목
  const threadsFromFiles = React.useMemo(() => {
    const map = new Map<number, { id: number; count: number; latest?: string }>();
    for (const f of filesData) {
      const t = Number((f as any).menuId ?? 0);
      if (!t) continue;
      const prev = map.get(t) || { id: t, count: 0, latest: (f as any).createdDate };
      prev.count += 1;
      const cd = (f as any).createdDate as string | undefined;
      if (!prev.latest || (cd && cd > prev.latest)) prev.latest = cd;
      map.set(t, prev);
    }
    return Array.from(map.values()).sort((a, b) => (b.latest || "").localeCompare(a.latest || ""));
  }, [filesData]);

  useEffect(() => {
    if (selectedThreadIdForView != null) return;
    if (threadId) {
      setSelectedThreadIdForView(threadId);
      return;
    }
    if (threadsFromFiles.length > 0) {
      setSelectedThreadIdForView(threadsFromFiles[0].id);
    }
  }, [threadId, threadsFromFiles, selectedThreadIdForView]);

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
      id: "leftNav",
      x: 0,
      y: 1,
      w: 3,
      h: 11,
      title: "업체",
      subtitle: "채널 선택",
    },
    {
      id: "files",
      x: 3,
      y: 1,
      w: 9,
      h: 11,
      title: "파일 목록",
      subtitle: "선택된 업체의 파일",
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
                파일 목록 {selectedChannelCode ? `- ${selectedChannelCode === "TEST" ? "CMS01" : selectedChannelCode}` : ""}
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

          {/* 좌측: 업체 패널 */}
          <Box>
            <SidePanels
              selectedChannelId={channelId ?? undefined}
              onSelectChannel={(id) => {
                const params = new URLSearchParams(Array.from(searchParams.entries()));
                params.set("channelId", String(id));
                // 스레드 선택은 사용하지 않음(업체 하나로 관리)
                params.delete("threadId");
                router.replace(`/cms/file?${params.toString()}`);
              }}
              selectedThreadId={undefined}
              onSelectThread={() => { /* no-op */ }}
              showThreads={false}
            />
          </Box>

          {/* 우측: 파일 목록 패널 */}
          <Box>
            <VStack align="stretch" gap={0} px={2} py={2}>
              <HStack px={2} py={2} borderBottomWidth="1px">
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600">파일명</Text>
                </Box>
                <Box w="200px">
                  <Text fontSize="sm" color="gray.600">업로드일</Text>
                </Box>
                <Box w="40px" />
              </HStack>
              {filteredFiles.length === 0 && (
                <Box px={2} py={6}>
                  <Text color="gray.500">표시할 파일이 없습니다.</Text>
                </Box>
              )}
              {filteredFiles.map((f: any) => {
                const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
                const downloadUrl = `${api}/cms/file/public/download/${f.fileId}`;
                const isImage = (f.mimeType || "").startsWith("image/");
                return (
                  <HStack key={f.fileId} px={2} py={3} borderBottomWidth="1px" align="center">
                    <Box flex="1">
                      <HStack>
                        {isImage ? <LuImage size={18} /> : <LuFile size={18} />}
                        <Text fontWeight="medium">{f.originName}</Text>
                      </HStack>
                    </Box>
                    <Box w="200px">
                      <VStack align="start" gap={0}>
                        {f.createdDate && (
                          <Text fontSize="sm">{new Date(f.createdDate).toLocaleDateString()}</Text>
                        )}
                        {f.createdDate && (
                          <Text fontSize="xs" color="gray.500">{new Date(f.createdDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                        )}
                      </VStack>
                    </Box>
                    <Box w="40px" display="flex" justifyContent="center">
                      <a href={downloadUrl} target="_blank" rel="noreferrer">
                        <IconButton aria-label="다운로드" size="xs" variant="ghost">
                          <LuDownload size={16} />
                        </IconButton>
                      </a>
                    </Box>
                  </HStack>
                );
              })}
            </VStack>
          </Box>

          {/* 파일관리 패널을 파일 목록에 통합하여 별도 관리 패널 제거 */}
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
      {/* 업로드 다이얼로그는 현재 페이지에서는 사용하지 않음 */}
    </Box>
  );
}
