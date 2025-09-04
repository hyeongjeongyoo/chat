"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  Flex,
  Select,
  createListCollection,
  SimpleGrid,
  Switch,
  Separator,
} from "@chakra-ui/react";
import { AuthType } from "@/types/common";
import { BoardMaster, Menu } from "@/types/api";
import { useColors } from "@/styles/theme";
import { CheckIcon } from "lucide-react";

interface BoardEditorProps {
  boardMenu: Menu | null;
  board: BoardMaster | null;
  onSubmit: (boardData: BoardMaster) => void;
  isLoading: boolean;
}

export const BoardEditor = React.memo(function BoardEditor({
  boardMenu,
  board,
  onSubmit,
  isLoading,
}: BoardEditorProps) {
  const colors = useColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BoardMaster>({
    bbsName: "",
    menuId: 0,
    bbsId: 0,
    skinType: "BASIC",
    readAuth: "USER",
    writeAuth: "USER",
    adminAuth: "ADMIN",
    displayYn: "Y",
    noticeYn: "Y",
    publishYn: "Y",
    attachmentYn: "Y",
    attachmentLimit: "5",
    attachmentSize: "10",
    sortOrder: "D",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    if (boardMenu && board) {
      setFormData(() => {
        const newFormData: BoardMaster = {
          bbsName: boardMenu.name,
          menuId: boardMenu.id,
          bbsId:
            typeof (board as any).bbsId === "number"
              ? (board as any).bbsId
              : typeof (board as any).id === "number"
              ? (board as any).id
              : 0,
          skinType: board.skinType,
          readAuth: board.readAuth,
          writeAuth: board.writeAuth,
          adminAuth: board.adminAuth,
          displayYn: board.displayYn,
          sortOrder: board.sortOrder,
          noticeYn: board.noticeYn,
          publishYn: board.publishYn,
          attachmentYn: board.attachmentYn,
          attachmentLimit: board.attachmentLimit,
          attachmentSize: board.attachmentSize,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
        };
        return newFormData;
      });
    } else {
      setFormData({
        bbsName: "",
        menuId: 0,
        bbsId: 0,
        skinType: "BASIC",
        readAuth: "USER",
        writeAuth: "USER",
        adminAuth: "ADMIN",
        displayYn: "Y",
        sortOrder: "D",
        noticeYn: "Y",
        publishYn: "Y",
        attachmentYn: "Y",
        attachmentLimit: "5",
        attachmentSize: "10",
        createdAt: "",
        updatedAt: "",
      });
    }
  }, [boardMenu, board]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? "Y" : "N",
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toString(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const apiData: BoardMaster = {
        bbsName: formData.bbsName,
        menuId: formData.menuId,
        bbsId: formData.bbsId,
        skinType: formData.skinType,
        readAuth: formData.readAuth,
        writeAuth: formData.writeAuth,
        adminAuth: formData.adminAuth,
        displayYn: formData.displayYn,
        sortOrder: formData.sortOrder,
        noticeYn: formData.noticeYn,
        publishYn: formData.publishYn,
        attachmentYn: formData.attachmentYn,
        attachmentLimit: formData.attachmentLimit,
        attachmentSize: formData.attachmentSize,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt,
      };
      await onSubmit(apiData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        <Flex direction={{ base: "column", md: "row" }} gap={2}>
          <Box width={{ base: "100%", md: "50%" }}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              게시판 유형
            </Text>
            <Input
              size="xs"
              value={formData.skinType}
              readOnly
              placeholder="게시판명"
            />
          </Box>
        </Flex>
        <Separator />
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            권한 설정
          </Text>
          <Flex direction={{ base: "column", md: "row" }} gap={2}>
            <Box width={{ base: "100%", md: "50%" }}>
              <Text fontSize="sm" mb={1}>
                읽기 권한
              </Text>
              <Select.Root
                key={`read-auth-${formData.readAuth}`}
                collection={createListCollection({
                  items: [
                    { value: "USER", label: "전체 공개" },
                    { value: "ADMIN", label: "관리자" },
                    { value: "SYSTEM_ADMIN", label: "시스템 관리자" },
                  ],
                })}
                size="xs"
                value={[formData.readAuth]}
                onValueChange={({ value }) => {
                  if (value && value.length > 0) {
                    setFormData((prev) => ({
                      ...prev,
                      readAuth: value[0] as AuthType,
                    }));
                  }
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="읽기 권한을 선택하세요" />
                  </Select.Trigger>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    <Select.Item item={{ value: "USER", label: "전체 공개" }}>
                      전체 공개
                    </Select.Item>
                    <Select.Item item={{ value: "USER", label: "회원" }}>
                      회원
                    </Select.Item>
                    <Select.Item item={{ value: "ADMIN", label: "관리자" }}>
                      관리자
                    </Select.Item>
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
            <Box width={{ base: "100%", md: "50%" }}>
              <Text fontSize="sm" mb={1}>
                쓰기 권한
              </Text>
              <Select.Root
                key={`write-auth-${formData.writeAuth}`}
                collection={createListCollection({
                  items: [
                    { value: "USER", label: "전체 공개" },
                    { value: "USER", label: "회원" },
                    { value: "ADMIN", label: "관리자" },
                  ],
                })}
                size="xs"
                value={[formData.writeAuth]}
                onValueChange={({ value }) => {
                  if (value && value.length > 0) {
                    setFormData((prev) => ({
                      ...prev,
                      writeAuth: value[0] as AuthType,
                    }));
                  }
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="쓰기 권한을 선택하세요" />
                  </Select.Trigger>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    <Select.Item item={{ value: "USER", label: "전체 공개" }}>
                      전체 공개
                    </Select.Item>
                    <Select.Item item={{ value: "USER", label: "회원" }}>
                      회원
                    </Select.Item>
                    <Select.Item item={{ value: "ADMIN", label: "관리자" }}>
                      관리자
                    </Select.Item>
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
          </Flex>
        </Box>

        <Separator />

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            게시판 설정
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} mb={2}>
            <Flex align="center" justify="space-between" pr={5}>
              <Text fontSize="sm">표시 여부</Text>
              <Switch.Root
                key={`display-${formData.displayYn}`}
                colorPalette="blue"
                checked={formData.displayYn === "Y"}
                onCheckedChange={({ checked }) => {
                  setFormData((prev) => ({
                    ...prev,
                    displayYn: checked ? "Y" : "N",
                  }));
                }}
                size="sm"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </Flex>
            <Flex align="center" justify="space-between" pr={5}>
              <Text fontSize="sm">공지 여부</Text>
              <Switch.Root
                key={`notice-${formData.noticeYn}`}
                colorPalette="blue"
                checked={formData.noticeYn === "Y"}
                onCheckedChange={({ checked }) => {
                  setFormData((prev) => ({
                    ...prev,
                    noticeYn: checked ? "Y" : "N",
                  }));
                }}
                size="sm"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </Flex>
            <Flex align="center" justify="space-between" pr={5}>
              <Text fontSize="sm">게시 여부</Text>
              <Switch.Root
                key={`publish-${formData.publishYn}`}
                colorPalette="blue"
                checked={formData.publishYn === "Y"}
                onCheckedChange={({ checked }) => {
                  setFormData((prev) => ({
                    ...prev,
                    publishYn: checked ? "Y" : "N",
                  }));
                }}
                size="sm"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </Flex>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
            <Box>
              <Select.Root
                key={`sort-${formData.sortOrder}`}
                size="xs"
                collection={createListCollection({
                  items: [
                    { value: "A", label: "오름차순" },
                    { value: "D", label: "내림차순" },
                  ],
                })}
                value={[formData.sortOrder]}
                onValueChange={({ value }) => {
                  if (value && value.length > 0) {
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: value[0] as "A" | "D",
                    }));
                  }
                }}
              >
                <Select.HiddenSelect />
                <Select.Label>정렬 순서</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="정렬 순서 선택" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    <Select.Item item={{ value: "A", label: "오름차순" }}>
                      오름차순
                      <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item item={{ value: "D", label: "내림차순" }}>
                      내림차순
                      <Select.ItemIndicator />
                    </Select.Item>
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
          </SimpleGrid>

          <Separator my={4} />

          <Box mt={4}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              첨부파일 설정
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} mb={2}>
              <Flex align="center" justify="space-between" pr={5}>
                <Text fontSize="sm">첨부파일 허용 여부</Text>
                <Switch.Root
                  key={`attachment-${formData.attachmentYn}`}
                  colorPalette="blue"
                  checked={formData.attachmentYn === "Y"}
                  onCheckedChange={({ checked }) => {
                    setFormData((prev) => ({
                      ...prev,
                      attachmentYn: checked ? "Y" : "N",
                    }));
                  }}
                  size="sm"
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </Flex>
            </SimpleGrid>

            {formData.attachmentYn === "Y" && (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box>
                  <Text fontSize="sm" mb={1}>
                    첨부파일 최대 개수
                  </Text>
                  <Flex>
                    <Input
                      size="xs"
                      type="number"
                      value={formData.attachmentLimit}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          attachmentLimit: value,
                        }));
                      }}
                      min="1"
                      max="20"
                    />
                    <Box ml={2} mt={1} fontSize="xs" color="gray.500">
                      개
                    </Box>
                  </Flex>
                </Box>
                <Box>
                  <Text fontSize="sm" mb={1}>
                    첨부파일 최대 용량
                  </Text>
                  <Flex>
                    <Input
                      size="xs"
                      type="number"
                      value={formData.attachmentSize}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          attachmentSize: value,
                        }));
                      }}
                      min="1"
                      max="100"
                    />
                    <Box ml={2} mt={1} fontSize="xs" color="gray.500">
                      MB
                    </Box>
                  </Flex>
                </Box>
              </SimpleGrid>
            )}
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            bg={colors.primary.default}
            color="white"
            _hover={{ bg: colors.primary.hover }}
            disabled={isSubmitting}
            transition="all 0.2s ease"
            loading={isLoading || isSubmitting}
            loadingText="저장 중..."
          >
            <Box display="flex" alignItems="center" gap={2}>
              <CheckIcon size={16} />
              <Text>저장</Text>
            </Box>
          </Button>
        </Box>
      </VStack>
    </form>
  );
});
