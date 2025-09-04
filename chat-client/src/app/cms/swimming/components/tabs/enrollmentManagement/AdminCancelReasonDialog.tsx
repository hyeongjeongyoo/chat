"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  Portal,
  Textarea,
  Stack,
  Text,
} from "@chakra-ui/react";

interface AdminCancelReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  enrollId: number | null;
}

export const AdminCancelReasonDialog: React.FC<
  AdminCancelReasonDialogProps
> = ({ isOpen, onClose, onSubmit, enrollId }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(reason.trim() || "관리자 직접 취소");
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} size="md">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>신청 취소 사유 입력</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={3}>
                {enrollId && (
                  <Text fontSize="sm" color="gray.500">
                    신청 ID: {enrollId}
                  </Text>
                )}
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="취소 사유를 입력해주세요. (미입력 시 '관리자 직접 취소'로 기록됩니다.)"
                  rows={4}
                  autoFocus
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button variant="outline" onClick={handleClose}>
                닫기
              </Button>
              <Button colorPalette="red" onClick={handleSubmit}>
                취소 처리
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
