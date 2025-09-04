"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Button,
  VStack,
  Text,
  Checkbox,
  Input,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { LuCheck } from "react-icons/lu";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toaster } from "@/components/ui/toaster";
import { SubmitHandler } from "react-hook-form";
import { Template, TemplateVersion } from "@/types/api";

interface TemplateEditorProps {
  template: Template;
  onUpdate: (templateId: number, data: any) => void;
  onCreate: (data: any) => void;
  isLoading: boolean;
}

// 템플릿 스키마 정의
const createTemplateSchema = (currentTemplate: Template) =>
  z.object({
    templateName: z.string().min(1, "템플릿 이름을 입력해주세요."),
    type: z.enum(["MAIN", "SUB"]),
    description: z.string().nullable(),
    published: z.boolean(),
    displayPosition: z.enum(["HEADER", "FOOTER"]),
    visible: z.boolean(),
    sortOrder: z.number(),
    versions: z
      .array(
        z.object({
          versionId: z.number(),
          templateId: z.number(),
          versionNo: z.number(),
          layout: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              type: z.string(),
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
              widget: z
                .object({
                  type: z.string(),
                  config: z.record(z.unknown()).optional(),
                })
                .optional(),
            })
          ),
          updater: z.string(),
          updatedAt: z.string(),
        })
      )
      .optional(),
  });

type TemplateFormData = {
  templateName: string;
  type: "MAIN" | "SUB";
  description: string | null;
  published: boolean;
  versions?: TemplateVersion[];
  displayPosition: "HEADER" | "FOOTER";
  visible: boolean;
  sortOrder: number;
};

export function TemplateEditor({
  template,
  onUpdate,
  onCreate,
  isLoading,
}: TemplateEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<ReturnType<typeof createTemplateSchema>>>({
    resolver: zodResolver(createTemplateSchema(template)),
    defaultValues: {
      templateName: template.templateName,
      type: template.type,
      description: template.description,
      published: template.published,
      versions: template.versions || [],
      displayPosition: template.displayPosition,
      visible: template.visible,
      sortOrder: template.sortOrder,
    },
  });

  const templateType = watch("type");

  // template prop이 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    reset({
      templateName: template.templateName,
      type: template.type,
      description: template.description,
      published: template.published,
      versions: template.versions || [],
      displayPosition: template.displayPosition,
      visible: template.visible,
      sortOrder: template.sortOrder,
    });
  }, [template, reset]);

  // 컬러 모드에 맞는 색상 설정
  const colors = useColors();
  const bgColor = useColorModeValue(colors.cardBg, colors.cardBg);
  const borderColor = useColorModeValue(colors.border, colors.border);
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);
  const errorColor = useColorModeValue("red.500", "red.300");
  const buttonBg = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  // 셀렉트 박스 스타일
  const selectStyle = {
    width: "100%",
    padding: "0.5rem",
    paddingRight: "2rem",
    borderWidth: "1px",
    borderRadius: "0.375rem",
    borderColor: "inherit",
    backgroundColor: "transparent",
    fontSize: "14px",
  };

  const handleFormSubmit: SubmitHandler<TemplateFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      if (template.id) {
        await onUpdate(template.id, data);
      } else {
        await onCreate(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toaster.error({
        title: "템플릿 저장에 실패했습니다.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack gap={3} align="stretch">
          <Box>
            <Flex mb={1}>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                템플릿 이름
              </Text>
              <Text fontSize="sm" color={errorColor} ml={1}>
                *
              </Text>
            </Flex>
            <Controller
              name="templateName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="템플릿 이름을 입력하세요"
                  borderColor={errors.templateName ? errorColor : undefined}
                />
              )}
            />
            {errors.templateName && (
              <Text fontSize="xs" color={errorColor} mt={1}>
                {errors.templateName.message}
              </Text>
            )}
          </Box>

          <Box>
            <Flex mb={1}>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                설명
              </Text>
            </Flex>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="템플릿 설명을 입력하세요"
                  value={field.value || ""}
                />
              )}
            />
          </Box>

          <Box>
            <Flex mb={1}>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                공개 여부
              </Text>
            </Flex>
            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <Checkbox.Root
                  checked={field.value}
                  onCheckedChange={({ checked }) => field.onChange(checked)}
                >
                  <Checkbox.HiddenInput onBlur={field.onBlur} />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    <Text fontSize="sm" color={textColor}>
                      공개
                    </Text>
                  </Checkbox.Label>
                </Checkbox.Root>
              )}
            />
          </Box>

          <Box>
            <Flex mb={1}>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                표시 위치
              </Text>
            </Flex>
            <Controller
              name="displayPosition"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  style={selectStyle}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="HEADER">헤더</option>
                  <option value="FOOTER">푸터</option>
                </select>
              )}
            />
          </Box>

          <Button
            type="submit"
            colorPalette="blue"
            loading={isSubmitting || isLoading}
            width="100%"
          >
            <LuCheck style={{ marginRight: 8 }} />
            저장
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
