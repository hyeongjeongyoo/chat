"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  Flex,
  HStack,
  Image,
  IconButton,
  Accordion,
  chakra,
} from "@chakra-ui/react";
import { LuRefreshCw } from "react-icons/lu";
import { LexicalEditor } from "@/components/common/LexicalEditor";
import { FileUploader } from "@/components/common/FileUploader";
import {
  UseArticleFormProps,
  useArticleForm,
} from "@/lib/hooks/useArticleForm";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";
import { toaster } from "@/components/ui/toaster";
import { boardApi } from "@/lib/api/board";
import { BoardCategory } from "@/types/api";

// Define the expected result type from handleSubmit
interface SubmitResult {
  success: boolean;
  message?: string;
}

export interface ArticleEditorProps extends UseArticleFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  showCaptcha?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  maxFileAttachments?: number;
  maxFileSizeMB?: number;
  disableAttachments?: boolean;
  showCategory?: boolean;
}

export function ArticleEditor({
  bbsId,
  menuId,
  initialData,
  onSubmit,
  onCancel,
  showCaptcha = true,
  submitLabel = "등록",
  cancelLabel = "취소",
  maxFileAttachments,
  maxFileSizeMB,
  disableAttachments,
  showCategory = false,
}: ArticleEditorProps) {
  const {
    formData,
    updateFormField,
    setContent,
    files,
    setFiles,
    boardInfo,
    isLoading,
    error,
    handleSubmit,
    effectiveMaxFiles,
    effectiveMaxSize,
    isAttachmentEnabled,
    validateFile,
    isAdminPageContext,
    handleMediaAdded,
    clearPendingMedia,
    existingAttachments,
    attachmentsToDelete,
    setAttachmentsToDelete,
  } = useArticleForm({
    bbsId,
    menuId,
    initialData,
    maxFileAttachments,
    maxFileSizeMB,
    disableAttachments,
  });
  const { isAuthenticated } = useRecoilValue(authState);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [categories, setCategories] = useState<BoardCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (bbsId) {
        try {
          const response = await boardApi.getBoardCategories(bbsId);
          if (response.success && response.data) {
            setCategories(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch categories", error);
        }
      }
    };
    if (bbsId) {
      fetchCategories();
    }
  }, [bbsId]);

  const handleDeleteExistingFile = (fileId: number) => {
    setAttachmentsToDelete((prev) => {
      if (prev.includes(fileId)) {
        // If already marked for deletion, remove it (undo)
        return prev.filter((id) => id !== fileId);
      } else {
        // Otherwise, add it to mark for deletion
        return [...prev, fileId];
      }
    });
  };

  const generateCaptcha = useCallback((length = 5) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 120;
    canvas.height = 40;

    if (ctx) {
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "#555";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.3 + 0.2})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      const charWidth = canvas.width / (length + 1);
      for (let i = 0; i < length; i++) {
        ctx.save();
        const x = charWidth * (i + 0.8);
        const y = canvas.height / 2 + (Math.random() - 0.5) * 6;
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.2);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }
    }
    return { text, imageDataUrl: canvas.toDataURL() };
  }, []);

  const refreshCaptcha = useCallback(() => {
    const { text, imageDataUrl } = generateCaptcha();
    setCaptchaText(text);
    setCaptchaImage(imageDataUrl);
    updateFormField("captcha", "");
  }, [generateCaptcha, updateFormField]);

  useEffect(() => {
    setIsAdminPage(window.location.pathname.includes("/cms/"));
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleFormSubmit = async () => {
    // Explicitly type the result
    const result: SubmitResult = await handleSubmit(captchaText);

    if (!result.success) {
      toaster.error({
        title: "오류",
        description: result.message || "게시글 등록 중 오류가 발생했습니다.",
        duration: 5000,
      });
      return;
    }

    toaster.success({
      title: "성공",
      description: result.message || "게시글이 성공적으로 등록되었습니다.", // Use message if available
      duration: 3000,
    });

    // Call the onSubmit prop AFTER showing the toast
    if (onSubmit) {
      onSubmit();
    }
  };

  // Helper to format date for datetime-local input
  const formatDateTimeForInput = (isoString: string | null | undefined) => {
    if (!isoString) return "";
    // Converts "2024-03-20T09:00:00+09:00" to "2024-03-20T09:00"
    return isoString.slice(0, 16);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        justify="center"
        align="center"
        h="300px"
        direction="column"
        gap={4}
      >
        <Box
          p={4}
          borderRadius="md"
          bg="red.50"
          color="red.600"
          textAlign="center"
        >
          {error}
        </Box>
        <Button onClick={onCancel}>닫기</Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={4}>
      <Box>
        <Text fontWeight="bold" mb={1}>
          작성자(필수)
        </Text>
        <Input
          placeholder="작성자 이름을 입력해주세요"
          size="md"
          value={formData.author}
          onChange={(e) => updateFormField("author", e.target.value)}
          disabled={isAdminPage && isAuthenticated}
        />
      </Box>

      {isAdminPage && (
        <Accordion.Root collapsible>
          <Accordion.Item value="advanced-settings">
            <Accordion.ItemTrigger>
              <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                고급 설정
              </Box>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                <Flex direction="column" gap={4} pt={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>
                      표시 작성자
                    </Text>
                    <Input
                      placeholder="사용자에게 표시될 작성자 이름"
                      size="md"
                      value={formData.displayWriter || ""}
                      onChange={(e) =>
                        updateFormField("displayWriter", e.target.value)
                      }
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>
                      표시 게시일
                    </Text>
                    <Input
                      type="datetime-local"
                      size="md"
                      value={formatDateTimeForInput(formData.postedAt)}
                      onChange={(e) =>
                        updateFormField("postedAt", e.target.value)
                      }
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>
                      조회수
                    </Text>
                    <Input
                      type="number"
                      placeholder="조회수"
                      size="md"
                      value={formData.hits || 0}
                      onChange={(e) => updateFormField("hits", e.target.value)}
                    />
                  </Box>
                </Flex>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      )}

      {boardInfo?.bbsName === "공지사항" && (
        <Box>
          <Text fontWeight="bold" mb={1}>
            카테고리(필수)
          </Text>
          <chakra.select
            value={formData.categoryId || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              updateFormField("categoryId", Number(e.target.value))
            }
            width="100%"
            p={2}
            border="1px solid"
            borderColor="inherit"
            borderRadius="md"
          >
            <option value="">카테고리 선택</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </chakra.select>
        </Box>
      )}

      <Box>
        <Text fontWeight="bold" mb={1}>
          제목(필수)
        </Text>
        <Input
          placeholder="등록할 질문 제목을 입력해주세요"
          size="md"
          value={formData.title}
          onChange={(e) => updateFormField("title", e.target.value)}
        />
      </Box>

      {/* Add External Link input only if the board skin is PRESS */}
      {boardInfo?.skinType === "PRESS" && (
        <Box>
          <Text fontWeight="bold" mb={1}>
            외부 링크
          </Text>
          <Input
            placeholder="https://example.com (보도자료 링크)"
            size="md"
            value={formData.externalLink || ""} // Ensure value is not undefined
            onChange={(e) => updateFormField("externalLink", e.target.value)}
          />
        </Box>
      )}

      <Box>
        <Text fontWeight="bold" mb={1}>
          내용(필수)
        </Text>
        <LexicalEditor
          onChange={setContent}
          placeholder="내용을 입력해주세요"
          initialContent={formData.content}
          contextMenu="BBS"
          onMediaAdded={handleMediaAdded}
        />
      </Box>

      {isAttachmentEnabled && (
        <Box>
          <Text fontWeight="bold" mb={1}>
            첨부파일
          </Text>
          <FileUploader
            onChange={setFiles}
            maxFiles={effectiveMaxFiles}
            maxSizeInMB={effectiveMaxSize}
            validateFile={validateFile}
            existingFiles={existingAttachments}
            onDeleteExistingFile={handleDeleteExistingFile}
            attachmentsToDelete={attachmentsToDelete}
          />
        </Box>
      )}

      {showCaptcha && !isAdminPage && (
        <Box>
          <Text fontWeight="bold" mb={1}>
            자동입력 방지(필수)
          </Text>
          <HStack align="center" gap={2}>
            {captchaImage && (
              <Image
                src={captchaImage}
                alt="CAPTCHA Image"
                boxSize="200px 30px"
                objectFit="contain"
                border="1px solid #ccc"
                borderRadius="md"
              />
            )}
            <IconButton
              aria-label="Refresh CAPTCHA"
              size="sm"
              variant="outline"
              onClick={refreshCaptcha}
            >
              <LuRefreshCw />
            </IconButton>
            <Input
              placeholder="왼쪽 문자를 입력해주세요"
              size="md"
              value={formData.captcha || ""}
              onChange={(e) => updateFormField("captcha", e.target.value)}
              ml={2}
            />
          </HStack>
        </Box>
      )}

      <Flex justify="flex-end" gap={2} mt={4}>
        <Button
          onClick={() => {
            clearPendingMedia();
            if (onCancel) onCancel();
          }}
          variant="outline"
        >
          {cancelLabel}
        </Button>
        <Button onClick={handleFormSubmit} colorPalette="blue">
          {submitLabel}
        </Button>
      </Flex>
    </Flex>
  );
}
