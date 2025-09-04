"use client";

import React from "react";
import {
  Table,
  Button,
  Flex,
  Badge,
  Box,
  Text as ChakraText,
  Icon,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CopyIcon } from "@chakra-ui/icons";
import type { AdminLessonDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster"; // For clone button placeholder

interface AdminLessonListTableProps {
  lessons: AdminLessonDto[];
  onEdit: (lesson: AdminLessonDto) => void;
  onDelete: (lessonId: number) => void;
  onClone: (lessonId: number) => void; // Added for future clone functionality
  isLoading?: boolean; // To potentially show a loading state within the table itself
}

export const AdminLessonListTable: React.FC<AdminLessonListTableProps> = ({
  lessons,
  onEdit,
  onDelete,
  onClone,
  isLoading,
}) => {
  if (isLoading) {
    // This loading state is more for when the table data itself is being refetched by parent
    // The parent component already has a main isLoading check
    return (
      <Box p={5} textAlign="center">
        <ChakraText>테이블 데이터 로딩 중...</ChakraText>
      </Box>
    );
  }

  if (lessons.length === 0) {
    return <ChakraText p={5}>표시할 강습 정보가 없습니다.</ChakraText>;
  }

  return (
    <Box overflowX="auto">
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>강습명</Table.ColumnHeader>
            <Table.ColumnHeader>강사</Table.ColumnHeader>
            <Table.ColumnHeader>기간</Table.ColumnHeader>
            <Table.ColumnHeader>시간</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">정원</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">가격</Table.ColumnHeader>
            <Table.ColumnHeader>상태</Table.ColumnHeader>
            <Table.ColumnHeader>작업</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {lessons.map((lesson) => (
            <Table.Row key={lesson.lessonId}>
              <Table.Cell>{lesson.lessonId}</Table.Cell>
              <Table.Cell>{lesson.title}</Table.Cell>
              <Table.Cell>{lesson.instructorName || "-"}</Table.Cell>
              <Table.Cell>{`${lesson.startDate} ~ ${lesson.endDate}`}</Table.Cell>
              <Table.Cell>{lesson.lessonTime || "-"}</Table.Cell>
              <Table.Cell textAlign="right">{lesson.capacity}</Table.Cell>
              <Table.Cell textAlign="right">
                {lesson.price.toLocaleString()}원
              </Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={
                    lesson.status === "OPEN"
                      ? "green"
                      : lesson.status === "CLOSED"
                      ? "red"
                      : lesson.status === "ONGOING"
                      ? "blue"
                      : lesson.status === "COMPLETED"
                      ? "purple"
                      : "gray"
                  }
                >
                  {lesson.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Flex direction="row" gap={2}>
                  <Button
                    aria-label="강습 수정"
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(lesson)}
                  >
                    <Flex align="center" gap={1}>
                      <Icon as={EditIcon} boxSize={3.5} />
                      <ChakraText>수정</ChakraText>
                    </Flex>
                  </Button>
                  <Button
                    aria-label="강습 복제"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toaster.create({
                        title: "준비중",
                        description: "강습 복제 기능은 준비 중입니다.",
                        type: "info",
                      });
                    }}
                  >
                    <Flex align="center" gap={1}>
                      <Icon as={CopyIcon} boxSize={3.5} />
                      <ChakraText>복제</ChakraText>
                    </Flex>
                  </Button>
                  <Button
                    aria-label="강습 삭제"
                    size="sm"
                    colorPalette="red"
                    variant="outline"
                    onClick={() => onDelete(lesson.lessonId!)}
                  >
                    <Flex align="center" gap={1}>
                      <Icon as={DeleteIcon} boxSize={3.5} />
                      <ChakraText>삭제</ChakraText>
                    </Flex>
                  </Button>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
