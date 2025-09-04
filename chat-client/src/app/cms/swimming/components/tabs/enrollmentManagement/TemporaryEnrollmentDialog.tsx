"use client";

import React, { useState } from "react";
import {
  Button,
  Field,
  Input,
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
  Checkbox,
  Textarea,
  Portal,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  TemporaryEnrollmentRequestDto,
  EnrollAdminResponseDto,
} from "@/types/api";

const enrollmentQueryKeys = {
  all: ["adminEnrollments"] as const,
  list: (lessonId?: number | null, params?: any) =>
    [...enrollmentQueryKeys.all, lessonId, params] as const,
  temporaryCreate: () => [...enrollmentQueryKeys.all, "temporaryCreate"],
};

interface TemporaryEnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lessonIdFilter: number | null;
}

export const TemporaryEnrollmentDialog: React.FC<
  TemporaryEnrollmentDialogProps
> = ({ isOpen, onClose, lessonIdFilter }) => {
  const queryClient = useQueryClient();
  const [tempEnrollForm, setTempEnrollForm] = useState<
    Omit<TemporaryEnrollmentRequestDto, "lessonId">
  >({
    userName: "",
    userPhone: "",
    usesLocker: false,
    memo: "",
  });

  const temporaryEnrollmentMutation = useMutation<
    EnrollAdminResponseDto,
    Error,
    TemporaryEnrollmentRequestDto
  >({
    mutationFn: (data: TemporaryEnrollmentRequestDto) =>
      adminApi.createTemporaryEnrollment(data),
    onSuccess: (_response) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.list(lessonIdFilter),
      });
      setTempEnrollForm({
        userName: "",
        userPhone: "",
        usesLocker: false,
        memo: "",
      });
      onClose();
    },
    onError: (error) => {
      console.error(
        "임시 등록 실패 (TemporaryEnrollmentDialog):",
        error.message
      );
    },
  });

  const handleTempEnrollFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTempEnrollForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTempEnrollLockerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTempEnrollForm((prev) => ({ ...prev, usesLocker: e.target.checked }));
  };

  const handleTempEnrollSubmit = () => {
    if (!lessonIdFilter) {
      console.error("Lesson ID is required for temporary enrollment.");
      return;
    }
    if (!tempEnrollForm.userName.trim()) {
      console.error("이름 입력 필요 (TemporaryEnrollmentDialog)");
      return;
    }

    temporaryEnrollmentMutation.mutate({
      lessonId: lessonIdFilter,
      ...tempEnrollForm,
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      setTempEnrollForm({
        userName: "",
        userPhone: "",
        usesLocker: false,
        memo: "",
      });
    } else {
      if (
        temporaryEnrollmentMutation.isError ||
        temporaryEnrollmentMutation.isSuccess
      ) {
        temporaryEnrollmentMutation.reset();
      }
    }
  }, [isOpen, temporaryEnrollmentMutation]);

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신규 임시 등록</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={4}>
                <Field.Root required>
                  <Field.Label>이름</Field.Label>
                  <Input
                    name="userName"
                    value={tempEnrollForm.userName}
                    onChange={handleTempEnrollFormChange}
                    placeholder="홍길동"
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>핸드폰 번호</Field.Label>
                  <Input
                    name="userPhone"
                    value={tempEnrollForm.userPhone || ""}
                    onChange={handleTempEnrollFormChange}
                    placeholder="010-1234-5678"
                  />
                </Field.Root>
                <Field.Root>
                  <Checkbox.Root
                    name="usesLocker"
                    checked={tempEnrollForm.usesLocker}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control onChange={handleTempEnrollLockerChange} />
                    <Checkbox.Label>사물함 사용</Checkbox.Label>
                  </Checkbox.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>메모</Field.Label>
                  <Textarea
                    name="memo"
                    value={tempEnrollForm.memo || ""}
                    onChange={handleTempEnrollFormChange}
                    placeholder="오프라인 접수 등 특이사항 입력"
                    rows={3}
                  />
                </Field.Root>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button
                colorPalette="teal"
                onClick={handleTempEnrollSubmit}
                loading={temporaryEnrollmentMutation.isPending}
              >
                등록하기
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};
