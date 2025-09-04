"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Field,
  Textarea,
  Spinner,
  Stack,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  Flex,
  Badge,
  Portal,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  type ICellRendererParams,
  type ValueFormatterParams,
} from "ag-grid-community";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { toaster } from "@/components/ui/toaster";
import { adminApi } from "@/lib/api/adminApi";
import { CommonPayStatusBadge } from "@/components/common/CommonPayStatusBadge";
import type { EnrollmentPayStatus } from "@/types/statusTypes";
import type { EnrollAdminResponseDto, UserMemoDto } from "@/types/api";

export interface EnrollmentData extends EnrollAdminResponseDto {
  memo?: string;
  isRenewal?: boolean;
}

const enrollmentQueryKeys = {
  all: ["adminEnrollments"] as const,
  userHistory: (userId?: string) =>
    [...enrollmentQueryKeys.all, "userHistory", userId] as const,
};

const UsesLockerCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, boolean>
> = (params) => {
  return (
    <Badge
      colorPalette={params.value ? "blue" : "gray"}
      variant="outline"
      size="sm"
    >
      {params.value ? "사용" : "미사용"}
    </Badge>
  );
};

interface UserMemoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnrollmentData | null;
  agGridTheme: string;
  bg: string;
  textColor: string;
  borderColor: string;
  colors: any;
}

export const UserMemoDialog: React.FC<UserMemoDialogProps> = ({
  isOpen,
  onClose,
  selectedUser,
  agGridTheme,
  bg,
  textColor,
  borderColor,
  colors,
}) => {
  const [userMemoText, setUserMemoText] = useState("");
  const queryClient = useQueryClient();

  const { data: userMemoData } = useQuery<UserMemoDto, Error>({
    queryKey: ["userMemo", selectedUser?.userId],
    queryFn: () => {
      if (!selectedUser?.userId)
        throw new Error("User ID (UUID) is not provided.");
      return adminApi.getUserMemo(selectedUser.userId);
    },
    enabled: !!selectedUser?.userId,
    retry: false,
  });

  const {
    data: userEnrollmentsHistoryData,
    isLoading: isLoadingUserEnrollmentsHistory,
  } = useQuery<EnrollAdminResponseDto[], Error>({
    queryKey: enrollmentQueryKeys.userHistory(selectedUser?.userId),
    queryFn: async () => {
      if (!selectedUser?.userId) return [];
      const response = await adminApi.getAdminEnrollments({
        userId: selectedUser.userId,
        page: 0,
        size: 1000,
        sort: "createdAt,desc",
      });
      return response.data.content;
    },
    enabled: !!selectedUser?.userId,
  });

  useEffect(() => {
    const memo = userMemoData?.memo ?? selectedUser?.memo ?? "";
    setUserMemoText(memo);
  }, [userMemoData, selectedUser]);

  const { mutate: saveMemo, isPending: isSavingMemo } = useMutation({
    mutationFn: (memo: string) => {
      if (!selectedUser?.userId)
        throw new Error("User ID (UUID) is not provided.");
      return adminApi.createUserMemo(selectedUser.userId, { memo });
    },
    onSuccess: () => {
      toaster.success({
        title: "메모 저장 성공",
        description: `${selectedUser?.userName} 회원님의 메모가 성공적으로 저장되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
      if (selectedUser?.userId) {
        queryClient.invalidateQueries({
          queryKey: ["userMemo", selectedUser.userId],
        });
      }
      onClose();
    },
    onError: (error) => {
      console.error("Failed to save memo:", error);
      alert("메모 저장 중 오류가 발생했습니다.");
    },
  });

  const handleUserMemoSave = () => {
    if (!selectedUser) return;
    saveMemo(userMemoText);
  };

  const userEnrollmentHistoryColDefs = useMemo<ColDef<EnrollmentData>[]>(
    () => [
      { headerName: "강습명", field: "lessonTitle", flex: 1, minWidth: 100 },
      { headerName: "강습 시간", field: "lessonTime", width: 200 },
      {
        headerName: "신청일",
        field: "createdAt",
        width: 120,
        valueFormatter: (
          params: ValueFormatterParams<EnrollmentData, string | undefined>
        ) => (params.value ? new Date(params.value).toLocaleDateString() : ""),
      },
      {
        headerName: "신청/결제 상태",
        field: "payStatus",
        cellRenderer: (
          params: ICellRendererParams<
            EnrollmentData,
            EnrollmentData["payStatus"]
          >
        ) => (
          <Flex h="100%" w="100%" alignItems="center" justifyContent="center">
            <CommonPayStatusBadge
              status={params.value as EnrollmentPayStatus}
            />
          </Flex>
        ),
        width: 100,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "사물함",
        field: "usesLocker",
        cellRenderer: UsesLockerCellRenderer,
        width: 70,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    ],
    []
  );

  if (!selectedUser) return null;

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxWidth="820px">
            <DialogHeader>
              <DialogTitle>
                회원 정보 - {selectedUser.userName} ({selectedUser.userLoginId})
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>메모 내용</Field.Label>
                  <Textarea
                    value={userMemoText}
                    onChange={(e) => setUserMemoText(e.target.value)}
                    placeholder="회원에 대한 메모를 입력하세요"
                    rows={3}
                  />
                  {userMemoData?.memoUpdatedAt && (
                    <Field.HelperText
                      color={colors.text.secondary}
                      fontSize="xs"
                    >
                      최종 수정:{" "}
                      {new Date(userMemoData.memoUpdatedAt).toLocaleString()}
                      {userMemoData.memoUpdatedBy
                        ? ` by ${userMemoData.memoUpdatedBy}`
                        : ""}
                    </Field.HelperText>
                  )}
                </Field.Root>

                <Box mt={2}>
                  <Text fontWeight="semibold" mb={2} fontSize="md">
                    신청 내역
                  </Text>
                  {isLoadingUserEnrollmentsHistory ? (
                    <Flex justify="center" align="center" h="150px">
                      <Spinner />
                    </Flex>
                  ) : userEnrollmentsHistoryData &&
                    userEnrollmentsHistoryData.length > 0 ? (
                    <Box className={agGridTheme} h="250px" w="full">
                      <AgGridReact<EnrollmentData>
                        rowData={userEnrollmentsHistoryData}
                        columnDefs={userEnrollmentHistoryColDefs}
                        enableCellTextSelection={true}
                        defaultColDef={{
                          sortable: true,
                          resizable: true,
                          filter: false,
                          cellStyle: { fontSize: "12px" },
                        }}
                        headerHeight={30}
                        rowHeight={36}
                        domLayout="normal"
                        getRowStyle={() => ({
                          color: textColor,
                          background: bg,
                          borderBottom: `1px solid ${borderColor}`,
                        })}
                        suppressCellFocus={true}
                        suppressMenuHide={true}
                      />
                    </Box>
                  ) : (
                    <Text
                      fontSize="sm"
                      color={colors.text.secondary}
                      textAlign="center"
                      p={4}
                    >
                      이 회원의 다른 신청 내역이 없습니다.
                    </Text>
                  )}
                </Box>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleUserMemoSave}
                disabled={isSavingMemo}
              >
                {isSavingMemo ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};
