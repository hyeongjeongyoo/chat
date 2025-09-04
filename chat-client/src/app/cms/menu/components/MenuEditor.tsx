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
  Spinner,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { LuCheck } from "react-icons/lu";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Menu } from "@/types/api";
import { getToken } from "@/lib/auth-utils";
import { toaster } from "@/components/ui/toaster";
import { CheckIcon, DeleteIcon, PlusIcon } from "lucide-react";
import { SubmitHandler } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomSelect } from "@/components/common/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import { boardApi, boardKeys } from "@/lib/api/board";
import { AuthType } from "@/types/common";
import { SkinType } from "@/types/common";

interface MenuEditorProps {
  menu: Menu | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onSubmit: (data: Omit<Menu, "id" | "createdAt" | "updatedAt">) => void;
  parentId?: number | null;
  onAddMenu?: () => void;
  existingMenus: Menu[];
  isTempMenu?: boolean;
  tempMenu?: Menu | null;
  isDeleting?: boolean;
}

// 메뉴 스키마 정의
const createMenuSchema = (currentMenu: Menu | null, existingMenus: Menu[]) =>
  z
    .object({
      name: z.string().min(1, "메뉴 이름을 입력해주세요."),
      type: z.enum(["LINK", "FOLDER", "BOARD", "CONTENT", "POPUP", "PROGRAM"]),
      url: z.string().optional(),
      targetId: z.string().optional(),
      displayPosition: z.enum(["HEADER", "FOOTER"]),
      visible: z.boolean(),
      sortOrder: z.number(),
      parentId: z.number().nullable(),
    })
    .refine(
      (data) => {
        if (data.type === "LINK") {
          return data.url && data.url.trim().length > 0;
        }
        return true;
      },
      {
        message: "링크 타입의 메뉴는 URL을 입력해야 합니다.",
        path: ["url"],
      }
    )
    .refine(
      (data) => {
        if (["BOARD"].includes(data.type)) {
          return data.targetId !== undefined;
        }
        return true;
      },
      {
        message: "게시판 타입의 메뉴는 대상을 선택해야 합니다.",
        path: ["targetId"],
      }
    );

type MenuFormData = z.infer<ReturnType<typeof createMenuSchema>>;

interface BoardResponse {
  id: number;
  bbsName: string;
  skinType: SkinType;
  readAuth: AuthType;
  writeAuth: AuthType;
}

interface ContentResponse {
  id: number;
  name: string;
  title: string;
  slug: string;
  status: string;
  skinType: SkinType;
  authorId: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function MenuEditor({
  menu,
  onClose,
  onDelete,
  onSubmit,
  parentId,
  onAddMenu,
  existingMenus,
  isTempMenu,
  isDeleting,
}: MenuEditorProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localIsDeleting, setLocalIsDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(createMenuSchema(menu, existingMenus)),
    defaultValues: {
      name: menu?.name || "",
      type: menu?.type || "LINK",
      url: menu?.url || "",
      targetId: menu?.targetId ? String(menu.targetId) : undefined,
      displayPosition: menu?.displayPosition === "FOOTER" ? "FOOTER" : "HEADER",
      visible: menu?.visible ?? true,
      sortOrder: menu?.sortOrder || 1,
      parentId: menu?.parentId || null,
    },
  });

  const menuType = watch("type");

  // menu prop이 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    if (menu) {
      reset({
        name: menu.name,
        type: menu.type,
        url: menu.url || "",
        targetId: menu.targetId ? String(menu.targetId) : undefined,
        displayPosition: menu.displayPosition,
        visible: menu.visible,
        sortOrder: menu.sortOrder,
        parentId: menu.parentId || null,
      });
    } else {
      reset({
        name: "",
        type: "LINK",
        url: "",
        targetId: undefined,
        displayPosition: "HEADER",
        visible: true,
        sortOrder: 1,
        parentId: parentId || null,
      });
    }
  }, [menu, reset, parentId]);

  // 새 메뉴가 생성되면 이름 입력 필드에 포커스
  useEffect(() => {
    if (menu && isTempMenu) {
      // 약간의 지연을 두어 DOM이 업데이트된 후에 포커스
      setTimeout(() => {
        const nameInput = document.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement;
        if (nameInput) {
          nameInput.focus();
          // 커서를 입력 필드 끝으로 이동
          nameInput.setSelectionRange(
            nameInput.value.length,
            nameInput.value.length
          );
        }
      }, 100);
    }
  }, [menu, isTempMenu]);

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

  // React Query를 사용하여 데이터 페칭
  const { data: boardsData } = useQuery({
    queryKey: boardKeys.all,
    queryFn: boardApi.getBoardMasters,
    select: (response) => {
      if (!response.data?.data?.content) return [];
      return response.data.data.content.map((board) => ({
        id: board.bbsId,
        name: board.bbsName,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    enabled: menuType === "BOARD", // BOARD 타입일 때만 데이터 가져오기
  });

  const { data: contentsData } = useQuery({
    queryKey: ["contents"],
    queryFn: async () => {
      const response = await fetch("/api/content", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch contents");
      const data = await response.json();
      return data.map((content: ContentResponse) => ({
        id: content.id,
        name: content.name,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    enabled: menuType === "CONTENT", // CONTENT 타입일 때만 데이터 가져오기
  });

  const handleDelete = async () => {
    if (!menu || !onDelete) return;
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!menu || !onDelete) return;
    setIsDeleteDialogOpen(false);
    try {
      setLocalIsDeleting(true);
      await onDelete(menu.id);
      onClose();
    } finally {
      setLocalIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleFormSubmit: SubmitHandler<MenuFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      // 유효성 검사
      if (data.type === "LINK" && !data.url?.trim()) {
        toaster.error({
          title: "URL을 입력해주세요.",
          duration: 3000,
        });
        return;
      }

      if (["BOARD"].includes(data.type)) {
        if (!data.targetId) {
          toaster.error({
            title: "대상을 선택해주세요.",
            duration: 3000,
          });
          return;
        }
      }

      // 폼 데이터를 서버에 전송
      const submitData = {
        ...data,
        parentId: data.parentId || null,
        targetId: data.targetId ? Number(data.targetId) : undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toaster.error({
        title: "메뉴 저장에 실패했습니다.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <VStack gap={3} align="stretch">
            <Box>
              <Flex mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  메뉴명
                </Text>
                <Text fontSize="sm" color={errorColor} ml={1}>
                  *
                </Text>
              </Flex>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    borderColor={errors.name ? errorColor : borderColor}
                    color={textColor}
                    bg="transparent"
                    disabled={menu?.id === -1}
                  />
                )}
              />
              {errors.name && (
                <Text color={errorColor} fontSize="sm" mt={1}>
                  {errors.name.message}
                </Text>
              )}
            </Box>

            <Box>
              <Flex mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  메뉴 유형
                </Text>
                <Text fontSize="sm" color={errorColor} ml={1}>
                  *
                </Text>
              </Flex>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="custom-select"
                    style={{
                      ...selectStyle,
                      borderColor: errors.type
                        ? "var(--chakra-colors-red-500)"
                        : "inherit",
                    }}
                    disabled={menu?.id === -1}
                  >
                    <option value="LINK">링크</option>
                    <option value="FOLDER">폴더</option>
                    <option value="BOARD">게시판</option>
                    <option value="CONTENT">컨텐츠</option>
                    <option value="POPUP">팝업</option>
                    <option value="PROGRAM">프로그램</option>
                  </select>
                )}
              />
            </Box>

            {["BOARD"].includes(menuType) && (
              <Box>
                <Flex mb={1}>
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    {menuType === "BOARD" ? "게시판" : "컨텐츠"} 선택
                  </Text>
                  <Text fontSize="sm" color={errorColor} ml={1}>
                    *
                  </Text>
                </Flex>
                <Controller
                  name="targetId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect<
                      { value: number; label: string },
                      MenuFormData
                    >
                      field={field}
                      errors={errors}
                      options={
                        menuType === "BOARD"
                          ? boardsData?.map((board) => ({
                              value: board.id,
                              label: board.name,
                            })) || []
                          : contentsData?.map((content: ContentResponse) => ({
                              value: content.id,
                              label: content.name,
                            })) || []
                      }
                      selectStyle={selectStyle}
                      placeholder={"게시판 선택"}
                      getOptionLabel={(option: {
                        value: number;
                        label: string;
                      }) => option.label}
                      getOptionValue={(option: {
                        value: number;
                        label: string;
                      }) => String(option.value)}
                    />
                  )}
                />
                {errors.targetId && (
                  <Text color={errorColor} fontSize="sm" mt={1}>
                    {errors.targetId.message}
                  </Text>
                )}
              </Box>
            )}

            <Box>
              <Flex mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  URL
                </Text>
                {menuType === "LINK" && (
                  <Text fontSize="sm" color={errorColor} ml={1}>
                    *
                  </Text>
                )}
              </Flex>
              <Controller
                name="url"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="URL을 입력하세요"
                    borderColor={errors.url ? errorColor : borderColor}
                    color={textColor}
                    bg="transparent"
                    disabled={menu?.id === -1}
                  />
                )}
              />
              {errors.url && (
                <Text color={errorColor} fontSize="sm" mt={1}>
                  {errors.url.message}
                </Text>
              )}
            </Box>

            <Flex alignItems="center">
              <Controller
                name="visible"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) => onChange(!!e.checked)}
                    colorPalette="blue"
                    size="sm"
                    disabled={menu?.id === -1}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control
                      borderColor={borderColor}
                      bg={bgColor}
                      _checked={{
                        borderColor: "transparent",
                        bgGradient: colors.gradient.primary,
                        color: "white",
                        _hover: {
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Checkbox.Indicator>
                        <LuCheck />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>
                      <Text fontWeight="medium" color={textColor}>
                        메뉴 노출
                      </Text>
                    </Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
            </Flex>

            <Flex justify="space-between" gap={2} mt={4}>
              {menu && menu.name !== "홈" ? (
                <Button
                  borderColor={colors.accent.delete.default}
                  color={colors.accent.delete.default}
                  onClick={handleDelete}
                  variant="outline"
                  _hover={{
                    bg: colors.accent.delete.bg,
                    borderColor: colors.accent.delete.hover,
                    color: colors.accent.delete.hover,
                    transform: "translateY(-1px)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s ease"
                  disabled={
                    menu?.id === -1 ||
                    isDeleting ||
                    localIsDeleting ||
                    isSubmitting
                  }
                >
                  <Box display="flex" alignItems="center" gap={2} w={4}>
                    {isDeleting || localIsDeleting ? (
                      <Spinner size="sm" />
                    ) : (
                      <DeleteIcon />
                    )}
                  </Box>
                  <Text>삭제</Text>
                </Button>
              ) : (
                <Box />
              )}
              <Flex gap={2}>
                {!isTempMenu && (
                  <Button
                    onClick={onAddMenu}
                    variant="outline"
                    colorPalette="blue"
                  >
                    <PlusIcon /> 메뉴
                  </Button>
                )}
                <Button
                  type="submit"
                  bg={buttonBg}
                  color="white"
                  _hover={{ bg: colors.primary.hover }}
                  disabled={
                    menu?.id === -1 ||
                    isDeleting ||
                    localIsDeleting ||
                    isSubmitting
                  }
                >
                  <Box display="flex" alignItems="center" gap={2} w={4}>
                    {isSubmitting ? <Spinner size="sm" /> : <CheckIcon />}
                  </Box>
                  <Text>저장</Text>
                </Button>
              </Flex>
            </Flex>
          </VStack>
        </form>
      </Box>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="메뉴 삭제"
        description="정말로 이 메뉴를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
    </>
  );
}
