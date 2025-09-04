"use client";

import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { useColors } from "@/styles/theme";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  backdrop?: string;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  isLoading = false,
  backdrop = "rgba(0, 0, 0, 0.5)",
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const colors = useColors();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop bg={backdrop} backdropFilter={colors.bg} />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colors.cardBg}
            borderColor={colors.border}
            boxShadow={colors.shadow.lg}
            borderRadius="2xl"
            overflow="hidden"
            backdropFilter="blur(12px)"
            maxW="400px"
            w="90%"
          >
            <Dialog.Header
              borderBottom="1px"
              borderColor={colors.border}
              py={4}
              px={6}
              position="relative"
            >
              <Dialog.Title
                fontSize="lg"
                fontWeight="bold"
                color={colors.text.primary}
                pr={8}
              >
                {title}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  right={4}
                  top="50%"
                  transform="translateY(-50%)"
                  color={colors.text.secondary}
                  _hover={{
                    color: colors.text.primary,
                    bg: colors.cardBg,
                  }}
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body py={5} px={6}>
              <Text
                color={colors.text.secondary}
                fontSize="sm"
                lineHeight="tall"
              >
                {description}
              </Text>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px"
              borderColor={colors.border}
              py={4}
              px={6}
              gap={3}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  color={colors.text.secondary}
                  _hover={{
                    bg: colors.cardBg,
                    color: colors.text.primary,
                  }}
                >
                  {cancelText}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                bg={colors.accent.delete.default}
                color="white"
                onClick={onConfirm}
                size="sm"
                loading={isLoading}
                _hover={{
                  bg: colors.accent.delete.hover,
                  transform: "translateY(-1px)",
                  boxShadow: colors.shadow.md,
                }}
                _active={{
                  transform: "translateY(0)",
                }}
              >
                {confirmText}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
