"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Badge,
  Button,
  Dialog,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import { PopupGrid } from "./components/PopupGrid";
import { PopupEditor } from "./components/PopupEditor";
import { PopupPreview } from "./components/PopupPreview";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { toaster, Toaster } from "@/components/ui/toaster";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { popupApi, popupKeys, PopupListResponse } from "@/lib/api/popup";
import type { Popup } from "@/types/api";
import React from "react";

export default function PopupManagementPage() {
  const colors = useColors();
  const [selectedPopupId, setSelectedPopupId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Partial<Popup> | null>(null);

  const bg = useColorModeValue(colors.bg, colors.darkBg);
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );

  const queryClient = useQueryClient();

  const { data: popups, isLoading: isPopupsLoading } = useQuery({
    queryKey: popupKeys.lists(),
    queryFn: () => popupApi.getPopups(),
    select: (response) => response.data,
  });

  useEffect(() => {
    if (popups && popups.length > 0 && !selectedPopupId) {
      setSelectedPopupId(popups[0].id);
    }
  }, [popups, selectedPopupId]);

  const { data: selectedPopup } = useQuery({
    queryKey: popupKeys.detail(selectedPopupId!),
    queryFn: () => popupApi.getPopup(selectedPopupId!),
    enabled: !!selectedPopupId,
    select: (response) => response.data,
  });

  const deletePopupMutation = useMutation({
    mutationFn: popupApi.deletePopup,
    onSuccess: (data, popupId) => {
      toaster.success({ title: data.message || "팝업이 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: popupKeys.lists() });
      if (selectedPopupId === popupId) {
        setSelectedPopupId(null);
      }
    },
    onError: (error: any) => {
      toaster.error({
        title: "팝업 삭제 실패",
        description: error.message || "오류가 발생했습니다.",
      });
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      popupApi.updatePopupVisibility(id, visible),
    onSuccess: (data) => {
      toaster.success({
        title: data.message || "노출 상태가 변경되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: popupKeys.lists() });
    },
    onError: (error: any) => {
      toaster.error({
        title: "상태 변경 실패",
        description: error.message || "오류가 발생했습니다.",
      });
      queryClient.invalidateQueries({ queryKey: popupKeys.lists() });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: popupApi.updatePopupsOrder,
    onSuccess: (data) => {
      toaster.success({ title: data.message || "순서가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: popupKeys.lists() });
    },
    onError: (error: any) => {
      toaster.error({
        title: "순서 변경 실패",
        description: error.message || "오류가 발생했습니다.",
      });
      queryClient.invalidateQueries({ queryKey: popupKeys.lists() });
    },
  });

  const handleAddNewPopup = useCallback(() => {
    setEditingPopup(null);
    setIsEditorOpen(true);
  }, []);

  const handleEditPopup = useCallback(
    async (popup: Popup) => {
      try {
        const response = await queryClient.fetchQuery({
          queryKey: popupKeys.detail(popup.id),
          queryFn: () => popupApi.getPopup(popup.id),
        });

        if (response.data) {
          setEditingPopup(response.data);
          setIsEditorOpen(true);
        } else {
          toaster.error({
            title: "데이터 조회 실패",
            description: "팝업 정보를 찾을 수 없습니다.",
          });
        }
      } catch (error) {
        toaster.error({
          title: "오류 발생",
          description: "팝업 정보를 불러오는 중 오류가 발생했습니다.",
        });
      }
    },
    [queryClient]
  );

  const handleDeletePopup = useCallback(
    async (popupId: number) => {
      await deletePopupMutation.mutateAsync(popupId);
    },
    [deletePopupMutation]
  );

  const handleRowSelected = useCallback((popup: Popup) => {
    setSelectedPopupId(popup.id);
  }, []);

  const handleEditorSubmitSuccess = async () => {
    setIsEditorOpen(false);
    if (editingPopup?.id) {
      await queryClient.invalidateQueries({
        queryKey: popupKeys.detail(editingPopup.id),
        refetchType: "all",
      });

      if (selectedPopupId === editingPopup.id) {
        await queryClient.removeQueries({
          queryKey: popupKeys.detail(selectedPopupId),
        });
        const newData = await popupApi.getPopup(selectedPopupId);
        queryClient.setQueryData(popupKeys.detail(selectedPopupId), newData);
      }
    }
    setEditingPopup(null);

    await queryClient.invalidateQueries({
      queryKey: popupKeys.lists(),
      refetchType: "all",
    });
  };

  const handleCloseDialog = () => {
    setIsEditorOpen(false);
    setEditingPopup(null);
  };

  const mainLayout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    {
      id: "popupList",
      x: 0,
      y: 1,
      w: 8,
      h: 11,
      title: "팝업 목록",
      subtitle: "드래그하여 순서를 변경하고, 스위치로 노출 여부를 제어하세요.",
    },
    {
      id: "popupPreview",
      x: 8,
      y: 1,
      w: 4,
      h: 11,
      title: "팝업 미리보기",
      subtitle: "선택된 팝업의 미리보기입니다.",
    },
  ];

  if (isPopupsLoading) {
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
        />
      </Box>
    );
  }

  const editorFormId = "popup-editor-form";
  const isActionLoading =
    deletePopupMutation.isPending ||
    updateVisibilityMutation.isPending ||
    updateOrderMutation.isPending;

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={mainLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={headingColor} letterSpacing="tight">
                팝업 관리
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
            <Button onClick={handleAddNewPopup} colorPalette="blue">
              새 팝업 추가
            </Button>
          </Flex>

          <Box>
            <PopupGrid
              popups={popups || []}
              onEditPopup={handleEditPopup}
              onDeletePopup={handleDeletePopup}
              onRowSelected={handleRowSelected}
              onVisibilityChange={updateVisibilityMutation.mutate}
              onOrderChange={updateOrderMutation.mutate}
              isLoading={isPopupsLoading || isActionLoading}
            />
          </Box>
          <Box>
            <PopupPreview popup={selectedPopup || null} />
          </Box>
        </GridSection>
      </Box>

      <Dialog.Root open={isEditorOpen} onOpenChange={handleCloseDialog}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="4xl" w="90%">
              <Dialog.Header>
                <Dialog.Title>
                  {editingPopup ? "팝업 수정" : "새 팝업 추가"}
                </Dialog.Title>
                <CloseButton onClick={handleCloseDialog} />
              </Dialog.Header>
              <Dialog.Body>
                <PopupEditor
                  key={editingPopup?.id || "new"}
                  initialData={editingPopup}
                  onSubmitSuccess={handleEditorSubmitSuccess}
                  formId={editorFormId}
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={handleCloseDialog}>
                  취소
                </Button>
                <Button type="submit" form={editorFormId} colorPalette="blue">
                  {editingPopup ? "수정하기" : "추가하기"}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Toaster />
    </Box>
  );
}
