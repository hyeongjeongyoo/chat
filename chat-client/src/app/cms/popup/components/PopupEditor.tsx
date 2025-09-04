"use client";

import React from "react";
import {
  Box,
  Input,
  VStack,
  Text,
  Select,
  SimpleGrid,
  Switch,
  createListCollection,
} from "@chakra-ui/react";
import type { Popup } from "@/types/api";
import { LexicalEditor } from "@/components/common/LexicalEditor";
import { usePopupForm } from "@/lib/hooks/usePopupForm";
import { toaster } from "@/components/ui/toaster";

interface PopupEditorProps {
  initialData: Partial<Popup> | null;
  onSubmitSuccess: () => void;
  formId: string;
}

export function PopupEditor({
  initialData,
  onSubmitSuccess,
  formId,
}: PopupEditorProps) {
  const {
    formData,
    updateFormField,
    updateContent,
    handleSubmit,
    handleMediaAdded,
  } = usePopupForm(initialData);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSubmit();
    if (result.success) {
      toaster.success({
        title: "성공",
        description: result.message || "팝업이 성공적으로 저장되었습니다.",
      });
      onSubmitSuccess();
    } else {
      toaster.error({
        title: "저장 실패",
        description: result.message || "오류가 발생했습니다.",
      });
    }
  };

  const contentTypeOptions = [
    { value: "html", label: "HTML" },
    { value: "image", label: "Image" },
  ];

  const deviceTargetOptions = [
    { value: "all", label: "모든 기기" },
    { value: "pc", label: "PC만" },
    { value: "mobile", label: "모바일만" },
  ];

  return (
    <form id={formId} onSubmit={handleFormSubmit}>
      <VStack gap={2} align="stretch">
        <Box>
          <Text
            as="label"
            fontSize="sm"
            fontWeight="medium"
            mb={1}
            display="block"
          >
            팝업 제목
          </Text>
          <Input
            size="sm"
            name="title"
            value={formData.title || ""}
            onChange={(e) => updateFormField("title", e.target.value)}
            placeholder="팝업 제목을 입력하세요."
            required
          />
        </Box>

        <SimpleGrid columns={2} gap={2}>
          <Box>
            <Text
              as="label"
              fontSize="sm"
              fontWeight="medium"
              mb={1}
              display="block"
            >
              노출 시작일
            </Text>
            <Input
              size="sm"
              name="startDate"
              type="datetime-local"
              value={formData.startDate || ""}
              onChange={(e) => updateFormField("startDate", e.target.value)}
              required
            />
          </Box>
          <Box>
            <Text
              as="label"
              fontSize="sm"
              fontWeight="medium"
              mb={1}
              display="block"
            >
              노출 종료일
            </Text>
            <Input
              size="sm"
              name="endDate"
              type="datetime-local"
              value={formData.endDate || ""}
              onChange={(e) => updateFormField("endDate", e.target.value)}
              required
            />
          </Box>
          <Box>
            <Text
              as="label"
              fontSize="sm"
              fontWeight="medium"
              mb={1}
              display="block"
            >
              노출 여부
            </Text>
            <Switch.Root
              name="visible"
              checked={formData.visible}
              onCheckedChange={({ checked }) =>
                updateFormField("visible", !!checked)
              }
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          </Box>
        </SimpleGrid>

        <Box>
          <Text
            as="label"
            fontSize="sm"
            fontWeight="medium"
            mb={1}
            display="block"
          >
            HTML 콘텐츠
          </Text>
          <LexicalEditor
            onChange={updateContent}
            initialContent={formData.content}
            placeholder="팝업 내용을 입력해주세요."
            contextMenu="BBS"
            onMediaAdded={handleMediaAdded}
          />
        </Box>
      </VStack>
    </form>
  );
}
