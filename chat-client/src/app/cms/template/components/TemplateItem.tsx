"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiCircle,
  FiX,
  FiLink,
  FiFolder,
  FiFolderPlus,
  FiFileText,
  FiFile,
  FiEdit2,
} from "react-icons/fi";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Input,
  Spinner,
  Kbd,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { TemplateItemProps } from "../types";
import { toaster } from "@/components/ui/toaster";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { templateApi } from "@/lib/api/template";
import { Template } from "@/types/api";

export const TemplateItem = ({
  template,
  level,
  onEditTemplate,
  expanded,
  onToggle,
  onDeleteTemplate,
  index,
  selectedTemplateId,
  refreshTemplates,
}: TemplateItemProps) => {
  const colors = useColors();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(template.templateName);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 컬러 모드에 맞는 호버 색상 설정
  const hoverBg = useColorModeValue(
    "rgb(255, 255, 255)",
    "rgba(255, 255, 255, 0.01)"
  );
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);
  const templateBgColor = useColorModeValue("gray.100", "gray.700");
  const disabledTextColor = useColorModeValue("gray.400", "gray.500");
  const indicatorColor = useColorModeValue(
    colors.primary.default,
    colors.primary.light
  );
  const leafColor = useColorModeValue(
    "rgba(160, 174, 192, 0.6)",
    "rgba(160, 174, 192, 0.4)"
  );

  const selectedBg = useColorModeValue(
    "rgba(66, 153, 225, 0.08)",
    "rgba(99, 179, 237, 0.15)"
  );
  const selectedBorderColor = useColorModeValue(
    colors.primary.default,
    colors.primary.light
  );

  const handleTemplateClick = (e: React.MouseEvent) => {
    // 메뉴 아이콘 클릭 시 이벤트 전파 중단
    if ((e.target as HTMLElement).closest(".template-icon")) {
      return;
    }

    // 액션 버튼 클릭 시 이벤트 전파 중단
    if ((e.target as HTMLElement).closest(".action-buttons")) {
      return;
    }

    // 메뉴 편집 모드일 때는 이벤트 전파 중단
    if (isEditing) {
      return;
    }

    // 메뉴 선택 및 편집기 표시
    e.preventDefault();
    e.stopPropagation();
    onEditTemplate(template);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const queryClient = useQueryClient();

  const updateTemplateMutation = useMutation({
    mutationFn: (data: {
      id: number;
      name: string;
      description: string;
      type: "MAIN" | "SUB";
      displayPosition: "HEADER" | "FOOTER";
      published: boolean;
    }) =>
      templateApi.updateTemplate(data.id.toString(), {
        templateName: data.name,
        templateType: data.type,
        description: data.description,
        published: data.published,
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
              type: data.displayPosition,
            },
          },
        ],
      }),
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      onEditTemplate(updatedTemplate.data);
      toaster.create({
        title: "템플릿 이름이 수정되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Failed to update template name:", error);
      setEditedName(template.templateName);
      toaster.create({
        title: "템플릿 이름 수정에 실패했습니다.",
        type: "error",
      });
    },
  });

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newName = editedName.trim();
    if (newName && newName !== template.templateName) {
      setIsSaving(true);
      try {
        await updateTemplateMutation.mutateAsync({
          id: template.id,
          name: newName,
          description: template.description || "",
          type: template.type,
          displayPosition: template.displayPosition,
          published: template.published,
        });
        setEditedName(newName);
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setEditedName(template.templateName);
      setIsEditing(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleNameSubmit(e);
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDeleteTemplate(template.id);
    toaster.create({
      title: "템플릿이 삭제되었습니다.",
      type: "success",
    });
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const getTemplateIcon = () => {
    const iconStyle = {
      color: leafColor,
      opacity: 0.7,
      transition: "all 0.2s ease",
    };

    switch (template.type) {
      case "MAIN":
        return <FiFileText size={14} style={iconStyle} />;
      case "SUB":
        return <FiFile size={14} style={iconStyle} />;
      default:
        return <FiCircle size={6} style={iconStyle} />;
    }
  };

  return (
    <>
      <Box
        style={{
          cursor: template.id === -1 ? "default" : "pointer",
          pointerEvents: template.id === -1 ? "none" : "auto",
          userSelect: template.id === -1 ? "none" : "auto",
        }}
      >
        <Flex
          pl={`${level * 0.5}rem`}
          py={1.5}
          px={2}
          alignItems="center"
          cursor="pointer"
          bg={selectedTemplateId === template.id ? selectedBg : "transparent"}
          borderLeft={selectedTemplateId === template.id ? "3px solid" : "none"}
          borderColor={
            selectedTemplateId === template.id
              ? selectedBorderColor
              : "transparent"
          }
          _hover={{
            bg: hoverBg,
            transform: "translateX(2px)",
            boxShadow: "sm",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "& .template-icon": {
              opacity: 1,
              transform: "scale(1.1)",
            },
            "& .action-buttons": {
              opacity: 1,
              transform: "translateX(0)",
            },
          }}
          transition="all 0.2s ease-out"
          borderRadius="md"
          position="relative"
          role="group"
          mb={1}
          mr={1}
        >
          <Box
            position="absolute"
            left="0"
            top="0"
            bottom="0"
            width="0"
            bg={indicatorColor}
            opacity={0}
            transition="all 0.3s ease"
            className="template-indicator"
            _groupHover={{
              opacity: 0.5,
              width: "3px",
            }}
          />
          <Flex width="100%" alignItems="center">
            <Box
              width="24px"
              mr={2}
              textAlign="center"
              onClick={handleIconClick}
              className="template-icon"
              style={{ cursor: "pointer" }}
            >
              <Flex
                width="24px"
                height="24px"
                alignItems="center"
                justifyContent="center"
              >
                {getTemplateIcon()}
              </Flex>
            </Box>
            <Box
              flex="1"
              onClick={handleTemplateClick}
              style={{ cursor: "pointer" }}
            >
              {isEditing ? (
                <form onSubmit={handleNameSubmit} style={{ width: "100%" }}>
                  <Flex gap={1} alignItems="center">
                    <Input
                      value={editedName}
                      onChange={handleNameChange}
                      onKeyDown={handleNameKeyDown}
                      size="sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onBlur={handleNameSubmit}
                      borderColor={colors.primary.default}
                      _focus={{
                        borderColor: colors.primary.default,
                        boxShadow: `0 0 0 1px ${colors.primary.default}`,
                      }}
                      placeholder="Enter to save"
                    />
                    {isSaving ? (
                      <Spinner size="xs" color="blue.500" />
                    ) : (
                      <Kbd size="sm" color={colors.primary.default}>
                        Enter
                      </Kbd>
                    )}
                  </Flex>
                </form>
              ) : (
                <Text
                  color={!template.visible ? disabledTextColor : textColor}
                  transition="all 0.2s ease"
                  _groupHover={{ fontWeight: "medium" }}
                  fontSize={level === 0 ? "sm" : "xs"}
                  fontWeight={level === 0 ? "medium" : "normal"}
                  lineHeight="short"
                >
                  {template.templateName}
                </Text>
              )}
              {!template.visible && (
                <Box
                  px={1.5}
                  py={0.5}
                  borderRadius="full"
                  bg={templateBgColor}
                  fontSize="xs"
                  ml={2}
                >
                  <Text fontSize="2xs" color={disabledTextColor}>
                    숨김
                  </Text>
                </Box>
              )}
            </Box>
            {template.templateName !== "홈" && !isEditing && (
              <Flex
                className="action-buttons"
                opacity={0}
                transform="translateX(10px)"
                transition="all 0.2s ease"
                gap={1}
                ml={2}
              >
                <IconButton
                  aria-label="Edit template"
                  size="xs"
                  variant="ghost"
                  onClick={handleEditClick}
                  color="gray.500"
                  _hover={{ color: "blue.500", bg: "blue.50" }}
                  p={1}
                  minW="auto"
                  h="auto"
                  borderRadius="full"
                  className="action-button"
                >
                  <FiEdit2 size={14} />
                </IconButton>
                <IconButton
                  aria-label="Delete template"
                  size="xs"
                  variant="ghost"
                  onClick={handleDelete}
                  color="gray.500"
                  _hover={{ color: "red.500", bg: "red.50" }}
                  p={1}
                  minW="auto"
                  h="auto"
                  borderRadius="full"
                >
                  <FiX size={14} />
                </IconButton>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Box>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="템플릿 삭제"
        description="정말로 이 템플릿을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
    </>
  );
};
