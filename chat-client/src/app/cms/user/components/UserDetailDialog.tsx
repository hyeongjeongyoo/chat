"use client";

import React from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { UserEnrollmentHistoryDto } from "@/types/api";
import { CommonPayStatusBadge } from "@/components/common/CommonPayStatusBadge";

interface UserDetailDialogProps {
  user: UserEnrollmentHistoryDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box flex="1" minW="150px">
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
    <Text fontWeight="medium">{value || "-"}</Text>
  </Box>
);

export const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!user) return null;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>사용자 상세 정보</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="6">
                <Box p={4} borderWidth={1} borderRadius="md">
                  <Stack direction="row" gap="4" wrap="wrap">
                    <InfoRow label="이름" value={user.name} />
                    <InfoRow label="ID" value={user.username} />
                    <InfoRow label="연락처" value={user.phone} />
                    <InfoRow
                      label="상태"
                      value={
                        <Box
                          as="span"
                          px="2"
                          py="0.5"
                          borderRadius="md"
                          bg={
                            user.status === "ACTIVE" ? "green.100" : "red.100"
                          }
                          color={
                            user.status === "ACTIVE" ? "green.800" : "red.800"
                          }
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          {user.status}
                        </Box>
                      }
                    />
                  </Stack>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    수강 이력 (총 {user.enrollmentHistory.length}건)
                  </Text>
                  <Box
                    borderWidth={1}
                    borderRadius="md"
                    maxH="400px"
                    overflowY="auto"
                  >
                    <Table.Root size="sm">
                      <Table.Header
                        position="sticky"
                        top={0}
                        zIndex={1}
                        bg="gray.50"
                      >
                        <Table.Row>
                          <Table.ColumnHeader>강습명</Table.ColumnHeader>
                          <Table.ColumnHeader>강습월</Table.ColumnHeader>
                          <Table.ColumnHeader>강습 시간</Table.ColumnHeader>
                          <Table.ColumnHeader>결제 상태</Table.ColumnHeader>
                          <Table.ColumnHeader>처리 일시</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {user.enrollmentHistory.length > 0 ? (
                          user.enrollmentHistory.map((enroll, index) => (
                            <Table.Row key={index}>
                              <Table.Cell>{enroll.lessonTitle}</Table.Cell>
                              <Table.Cell>{enroll.lessonMonth}</Table.Cell>
                              <Table.Cell>{enroll.lessonTime}</Table.Cell>
                              <Table.Cell>
                                <CommonPayStatusBadge
                                  status={enroll.payStatus}
                                />
                              </Table.Cell>
                              <Table.Cell>
                                {new Date(enroll.paymentDate).toLocaleString(
                                  "ko-KR"
                                )}
                              </Table.Cell>
                            </Table.Row>
                          ))
                        ) : (
                          <Table.Row>
                            <Table.Cell colSpan={5} textAlign="center">
                              수강 이력이 없습니다.
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Box>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onClose}>닫기</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
