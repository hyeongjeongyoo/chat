"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { toaster, Toaster } from "@/components/ui/toaster";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { templateApi } from "@/lib/api/template";
import { TemplateEditor } from "./components/TemplateEditor";
import { TemplateList } from "./components/TemplateList";
import { TemplateLayoutEditor } from "./components/TemplateLayoutEditor";
import { Template, TemplateListResponse } from "@/types/api";
import { TemplateSkeleton } from "./components/TemplateSkeleton";

export default function TemplateManagementPage() {
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [tempTemplate, setTempTemplate] = useState<Template | null>(null);
  const [loadingTemplateId, setLoadingTemplateId] = useState<number | null>(
    null
  );
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [templateToSelect, setTemplateToSelect] = useState<Template | null>(
    null
  );
  const colors = useColors();

  const { data: templates, isLoading } = useQuery<TemplateListResponse>({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await templateApi.getTemplates();
      return response.data;
    },
  });

  // 페이지 로드 시 메인 템플릿 선택
  useEffect(() => {
    if (templates?.data?.content) {
      const mainTemplate = templates.data.content.find(
        (template: Template) => template.type === "MAIN"
      );
      if (mainTemplate) {
        setSelectedTemplateId(mainTemplate.id);
      }
    }
  }, [templates]);

  // 템플릿 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: templateApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setSelectedTemplateId(null);
      toaster.create({
        title: "템플릿이 삭제되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      toaster.create({
        title: "템플릿 삭제에 실패했습니다.",
        type: "error",
      });
    },
  });

  // 템플릿 저장/업데이트 뮤테이션
  const saveTemplateMutation = useMutation({
    mutationFn: (data: {
      id?: string;
      templateData: Omit<Template, "id" | "createdAt" | "updatedAt">;
    }) => {
      const mappedData = {
        templateName: data.templateData.templateName,
        templateType: data.templateData.type,
        description: data.templateData.description,
        published: data.templateData.published,
        layout: [
          {
            id: "1",
            name: "Header Block",
            type: "HEADER",
            x: 0,
            y: 0,
            width: 12,
            height: 1,
            widget: {
              type: data.templateData.displayPosition,
            },
          },
        ],
      };
      return data.id
        ? templateApi.updateTemplate(data.id, mappedData)
        : templateApi.createTemplate(mappedData);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setSelectedTemplateId(response.data.id);
      setTempTemplate(null);
      toaster.create({
        title: tempTemplate
          ? "템플릿이 생성되었습니다."
          : "템플릿이 수정되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error saving template:", error);
      toaster.create({
        title: tempTemplate
          ? "템플릿 생성에 실패했습니다."
          : "템플릿 수정에 실패했습니다.",
        type: "error",
      });
    },
  });

  const handleDeleteTemplate = useCallback(
    async (templateId: number) => {
      try {
        setLoadingTemplateId(templateId);
        if (tempTemplate && tempTemplate.id === templateId) {
          setTempTemplate(null);
        } else {
          await deleteMutation.mutateAsync(templateId.toString());
        }
      } finally {
        setLoadingTemplateId(null);
      }
    },
    [deleteMutation, tempTemplate]
  );

  const handleSubmit = useCallback(
    async (templateData: Omit<Template, "id" | "createdAt" | "updatedAt">) => {
      try {
        const templateId = tempTemplate ? undefined : selectedTemplateId;
        if (templateId !== undefined) {
          setLoadingTemplateId(templateId);
        }
        await saveTemplateMutation.mutateAsync({
          id: templateId?.toString(),
          templateData,
        });
      } catch (error) {
        console.error("Error saving template:", error);
      } finally {
        setLoadingTemplateId(null);
      }
    },
    [saveTemplateMutation, selectedTemplateId, tempTemplate]
  );

  // 임시 템플릿 생성 함수
  const handleAddTemplate = useCallback(() => {
    const newTempTemplate: Template = {
      id: Date.now(),
      templateName: "새 템플릿",
      type: "MAIN",
      displayPosition: "HEADER",
      visible: true,
      sortOrder: 0,
      published: true,
      description: "",
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTempTemplate(newTempTemplate);
    setSelectedTemplateId(newTempTemplate.id);
  }, []);

  const handleEditTemplate = useCallback(
    (template: Template) => {
      if (tempTemplate) {
        setTemplateToSelect(template);
        setIsCancelDialogOpen(true);
      } else {
        setSelectedTemplateId(template.id);
      }
    },
    [tempTemplate]
  );

  const handleCancelConfirm = useCallback(() => {
    setTempTemplate(null);
    setSelectedTemplateId(templateToSelect?.id ?? null);
    setIsCancelDialogOpen(false);
  }, [templateToSelect]);

  const handleCancelClose = useCallback(() => {
    setIsCancelDialogOpen(false);
  }, []);

  // 템플릿 관리 페이지 레이아웃 정의
  const templateLayout = [
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
      id: "templateList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "템플릿 목록",
      subtitle: "템플릿 목록입니다.",
    },
    {
      id: "templateEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "템플릿 편집",
      subtitle: "템플릿의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "layoutEditor",
      x: 3,
      y: 1,
      w: 9,
      h: 11,
      title: "레이아웃 수정",
      subtitle: "템플릿 구조의 레이아웃 수정을 할 수 있습니다.",
    },
  ];

  const bgColor = colors.bg;
  const borderColor = colors.border;

  const selectedTemplate = templates?.data?.content.find(
    (template: Template) => template.id === selectedTemplateId
  );

  if (isLoading) {
    return <TemplateSkeleton />;
  }

  return (
    <Box bg={colors.bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={templateLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading
                size="lg"
                color={colors.text.primary}
                letterSpacing="tight"
              >
                템플릿 관리
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

          <Box>
            <TemplateList
              templates={templates}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              isLoading={isLoading}
              selectedTemplateId={selectedTemplate?.id ?? null}
              loadingTemplateId={loadingTemplateId}
            />
          </Box>

          <Box>
            {selectedTemplate && (
              <TemplateEditor
                template={selectedTemplate}
                onUpdate={async (templateId, data) => {
                  await saveTemplateMutation.mutateAsync({
                    id: templateId.toString(),
                    templateData: data,
                  });
                }}
                onCreate={async (data) => {
                  await saveTemplateMutation.mutateAsync({
                    templateData: data,
                  });
                }}
                isLoading={loadingTemplateId === selectedTemplateId}
              />
            )}
          </Box>

          <Box>
            {selectedTemplate && (
              <TemplateLayoutEditor
                template={selectedTemplate}
                isLoading={isLoading}
                onLayoutChange={(layout) => {
                  setTempTemplate({ ...selectedTemplate, layout });
                }}
              />
            )}
          </Box>
        </GridSection>
      </Box>
      <Toaster />
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        title="템플릿 추가 취소"
        description="새 템플릿 추가가 취소됩니다. 취소하시겠습니까?"
        confirmText="취소"
        cancelText="계속"
      />
    </Box>
  );
}
