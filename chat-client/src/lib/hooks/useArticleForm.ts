import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { boardApi } from "@/lib/api/board";
import { articleApi } from "@/lib/api/article";
import {
  BoardMaster,
  BoardArticleCommon,
  FileDto,
  ArticleStatusFlag,
} from "@/types/api";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";
import { toaster } from "@/components/ui/toaster";

export interface ArticleFormData {
  title: string;
  author: string;
  content: string;
  category?: string;
  categoryId?: number;
  externalLink?: string;
  captcha?: string;
  noticeState: ArticleStatusFlag;
  noticeStartDt: string | null;
  noticeEndDt: string | null;
  publishState: ArticleStatusFlag;
  publishStartDt: string | null;
  publishEndDt: string | null;
  hits?: number;
  displayWriter?: string;
  postedAt?: string | null;
}

export interface UseArticleFormProps {
  bbsId?: number;
  menuId?: number;
  initialData?: any; // BoardArticleCommon 타입에 category가 없어 임시로 any 사용
  maxFileAttachments?: number;
  maxFileSizeMB?: number;
  disableAttachments?: boolean;
}

export interface ExistingAttachment {
  id: number;
  name: string;
  url: string;
  size: number;
  mimeType?: string;
}

export function useArticleForm({
  bbsId,
  menuId,
  initialData,
  maxFileAttachments,
  maxFileSizeMB,
  disableAttachments,
}: UseArticleFormProps = {}) {
  const [formData, setFormData] = useState<ArticleFormData>(() => ({
    title: initialData?.title || "",
    author: initialData?.writer || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    categoryId: initialData?.categories && initialData.categories.length > 0 
      ? initialData.categories[0].categoryId 
      : initialData?.categoryId,
    externalLink: initialData?.externalLink || "",
    captcha: "",
    noticeState: (initialData?.noticeState || "N") as ArticleStatusFlag,
    noticeStartDt: initialData?.noticeStartDt || null,
    noticeEndDt: initialData?.noticeEndDt || null,
    publishState: (initialData?.publishState || "Y") as ArticleStatusFlag,
    publishStartDt: initialData?.publishStartDt || null,
    publishEndDt: initialData?.publishEndDt || null,
    hits: initialData?.hits || 0,
    displayWriter: initialData?.displayWriter || "",
    postedAt: initialData?.postedAt || null,
  }));

  const [newlyAddedFiles, setNewlyAddedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    ExistingAttachment[]
  >([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<number[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [pendingMedia, setPendingMedia] = useState<Map<string, File>>(
    new Map()
  );
  const [boardInfo, setBoardInfo] = useState<BoardMaster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminPageContext, setIsAdminPageContext] = useState(false);
  const { user } = useRecoilValue(authState);

  // Memoize updateFormField with useCallback
  const updateFormField = useCallback(
    (field: keyof ArticleFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [] // No dependencies, so the function reference is stable
  );

  // 게시판 정보 조회
  useEffect(() => {
    async function fetchBoardInfo() {
      const isAdminPage = window.location.pathname.includes("/cms/");
      setIsAdminPageContext(isAdminPage);

      if (!bbsId) {
        setIsLoading(false);
        return;
      }

      if (!isAdminPage && typeof disableAttachments === "boolean") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = isAdminPage
          ? await boardApi.getBoard(bbsId)
          : await boardApi.getPublicBoardInfo(bbsId);

        // The 'data' from the axios response can be either ApiResponse<BoardMaster> or BoardMaster
        const responseData: any = response.data;
        let boardData: BoardMaster | null = null;

        // Type guard to check if it's an ApiResponse object
        if (responseData && typeof responseData.success === "boolean") {
          if (responseData.success && responseData.data) {
            boardData = responseData.data;
          } else {
            throw new Error(
              responseData.message || "Failed to retrieve data."
            );
          }
        } else if (responseData && typeof responseData.bbsId !== "undefined") {
          // Duck-typing to check if it's a BoardMaster object
          boardData = responseData;
        } else {
          throw new Error("Invalid response structure from board API.");
        }

        if (boardData) {
          setBoardInfo(boardData);

          if (isAdminPage && user?.name) {
            setFormData((prev) =>
              !prev.author || prev.author !== user.name
                ? { ...prev, author: user.name }
                : prev
            );
          }
        } else {
          console.error(
            `Failed to fetch valid board info for bbsId ${bbsId}. Received:`,
            response
          );
          setError("게시판 정보를 불러오는데 실패했습니다.");
          setBoardInfo(null);
        }
      } catch (err: any) {
        setError("게시판 정보를 불러오는 중 오류가 발생했습니다.");
        setBoardInfo(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBoardInfo();
  }, [bbsId, user, disableAttachments]); // Add disableAttachments to dependency array

  // NEW useEffect to process initialData.attachments
  useEffect(() => {
    if (initialData?.attachments && initialData.attachments.length > 0) {
      const mappedAttachments: ExistingAttachment[] =
        initialData.attachments.map((att: FileDto) => ({
          id: att.fileId,
          name: att.originName,
          url: att.downloadUrl,
          size: att.size,
          mimeType: att.mimeType,
        }));
      setExistingAttachments(mappedAttachments);
    } else {
      setExistingAttachments([]);
    }
    setAttachmentsToDelete([]);
  }, [initialData]);

  // 폼 제출 핸들러
  const handleSubmit = async (expectedCaptchaText?: string) => {
    if (!bbsId) {
      return { success: false, message: "게시판 ID가 없습니다." };
    }
    if (!menuId) {
      return { success: false, message: "메뉴 ID가 없습니다." };
    }

    if (!formData.title || !formData.author || !formData.content) {
      return { success: false, message: "필수 항목을 모두 입력해주세요." };
    }

    if (boardInfo?.bbsName === "공지사항" && !formData.categoryId) {
      return { success: false, message: "카테고리를 선택해주세요." };
    }

    // CAPTCHA 검증 (CMS 페이지가 아닐 때만 수행)
    if (!isAdminPageContext && expectedCaptchaText !== undefined) {
      if (!formData.captcha) {
        return {
          success: false,
          message: "자동입력 방지 문자를 입력해주세요.",
        };
      }
      // Case-insensitive comparison
      if (
        formData.captcha.toLowerCase() !== expectedCaptchaText.toLowerCase()
      ) {
        return {
          success: false,
          message: "자동입력 방지 문자가 일치하지 않습니다.",
        };
      }
    }

    // 첨부파일 제한 검증 - considers newly added files against remaining slots
    if (
      boardInfo?.attachmentYn === "Y" ||
      (typeof disableAttachments === "boolean" && !disableAttachments)
    ) {
      const currentAttachmentCount =
        existingAttachments.length -
        attachmentsToDelete.length +
        newlyAddedFiles.length;
      const maxFiles = Number(maxFileAttachments) || 3;

      if (currentAttachmentCount > maxFiles) {
        return {
          success: false,
          message: `첨부파일은 최대 ${maxFiles}개까지 업로드 가능합니다. (현재 ${currentAttachmentCount}개)`,
        };
      }

      // Newly added files size check
      const maxSize = Number(maxFileSizeMB) || 5;
      const maxSizeBytes = maxSize * 1024 * 1024;
      const oversizedFile = newlyAddedFiles.find(
        (file) => file.size > maxSizeBytes
      );
      if (oversizedFile) {
        return {
          success: false,
          message: `새로 추가된 '${oversizedFile.name}' 파일이 제한 용량(${maxSize}MB)을 초과합니다.`,
        };
      }
    } else if (
      newlyAddedFiles.length > 0 &&
      (boardInfo?.attachmentYn === "N" || disableAttachments === true)
    ) {
      return {
        success: false,
        message: "이 게시판은 첨부파일을 지원하지 않습니다.",
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Prepare the object for the 'articleData' part (matching backend BbsArticleDto, excluding content)
      const articleDtoPart: Record<string, any> = {
        bbsId: bbsId,
        menuId: menuId,
        title: formData.title,
        writer: formData.author,
        content: formData.content,
        noticeState: formData.noticeState,
        noticeStartDt: formData.noticeStartDt,
        noticeEndDt: formData.noticeEndDt,
        publishState: formData.publishState,
        publishStartDt: formData.publishStartDt,
        publishEndDt: formData.publishEndDt,
        externalLink: formData.externalLink || null,
        hits: formData.hits,
        displayWriter: formData.displayWriter,
        postedAt: formData.postedAt || dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      };

      // 카테고리 처리 - 게시글 수정 시 명확한 카테고리 상태 전달
      if (initialData?.nttId) {
        // 기존 게시글 수정의 경우 - 카테고리 ID가 있으면 해당 카테고리로, 없으면 빈 배열
        articleDtoPart.categoryIds = formData.categoryId ? [formData.categoryId] : [];
      } else {
        // 새 게시글 작성의 경우 - 카테고리 ID가 있을 때만 포함
        if (formData.categoryId) {
          articleDtoPart.categoryIds = [formData.categoryId];
        }
      }

      // 2. Create FormData
      const dataToSend = new FormData();

      // 3. Append 'articleData' part as a Blob with application/json type
      const articleDtoBlob = new Blob([JSON.stringify(articleDtoPart)], {
        type: "application/json",
      });
      dataToSend.append("articleData", articleDtoBlob);

      // 4. Append 'mediaFiles' parts for pending media
      for (const [, file] of pendingMedia.entries()) {
        dataToSend.append(`mediaFiles`, file, file.name);
      }

      // 5. Append 'mediaLocalIds' for each item
      const allMediaLocalIds = Array.from(pendingMedia.keys());
      if (allMediaLocalIds.length > 0) {
        dataToSend.append("mediaLocalIds", allMediaLocalIds.join(","));
      }

      // 6. Append 'attachments' part for general attachments
      newlyAddedFiles.forEach((file) => {
        dataToSend.append(`attachments`, file, file.name);
      });

      // --- API Call ---
      let nttIdToUpdate: number | undefined = initialData?.nttId;

      // Before updating/creating the article, handle attachment deletions
      if (attachmentsToDelete.length > 0) {
        try {
          for (const fileId of attachmentsToDelete) {
            await articleApi.deleteAttachment(fileId);
          }
          toaster.info({
            title: "정보",
            description: `${attachmentsToDelete.length}개의 기존 첨부파일이 삭제 예약되었습니다.`,
          });
        } catch (deleteError) {
          console.error(
            "Failed to delete one or more attachments:",
            deleteError
          );
          toaster.error({
            title: "첨부파일 삭제 실패",
            description:
              "일부 기존 첨부파일 삭제에 실패했습니다. 내용은 저장될 수 있습니다.",
          });
        }
      }

      if (nttIdToUpdate) {
        // Update existing post
        if (typeof nttIdToUpdate !== "number") {
          console.error("Invalid nttId for update");
          throw new Error(
            "게시글 수정 중 오류가 발생했습니다. (유효하지 않은 ID)"
          );
        }
        await articleApi.updateArticle(nttIdToUpdate, dataToSend);
      } else {
        // Create new post
        const response = await articleApi.createArticle(dataToSend);
        if (
          !response ||
          !response.success ||
          typeof response.data !== "number" ||
          response.data <= 0
        ) {
          console.error(
            "Create article failed or returned invalid nttId:",
            response
          );
          throw new Error(
            response?.message ||
              "게시글 생성에 실패했습니다. (유효한 ID 미수신)"
          );
        }
        nttIdToUpdate = response.data;
      }

      // Clear pending media after successful submission
      pendingMedia.forEach((_file, localUrl) => URL.revokeObjectURL(localUrl));
      setPendingMedia(new Map());
      setNewlyAddedFiles([]);
      setAttachmentsToDelete([]);

      return {
        success: true,
        message: initialData?.nttId
          ? "게시글이 성공적으로 수정되었습니다."
          : "게시글이 성공적으로 등록되었습니다.",
        nttId: nttIdToUpdate,
      };
    } catch (error: any) {
      console.error("Article creation/upload failed:", error);
      setError(error.message || "알 수 없는 오류가 발생했습니다.");

      // --- Revoke URLs on Error ---
      pendingMedia.forEach((_file, localUrl) => URL.revokeObjectURL(localUrl));

      return {
        success: false,
        message: error.message || "게시글 처리 중 오류가 발생했습니다.",
      };
    } finally {
      setIsLoading(false);
      // Clear states AFTER revoking (which happens in try/catch)
      setPendingMedia(new Map());
      setNewlyAddedFiles([]);
      setAttachmentsToDelete([]);
    }
  };

  // Function to clear pending media and revoke URLs (e.g., for cancellation)
  const clearPendingMedia = useCallback(() => {
    if (pendingMedia.size > 0) {
      pendingMedia.forEach((_file, localUrl) => {
        URL.revokeObjectURL(localUrl);
      });
      setPendingMedia(new Map());
    }
  }, [pendingMedia]); // Depend on pendingMedia

  // Function to manually set content (e.g., from LexicalEditor)
  const setContent = useCallback((newContent: string) => {
    setFormData((prev) => ({
      ...prev,
      content: newContent,
    }));
  }, []);

  // Callback for media added in LexicalEditor
  const handleMediaAdded = useCallback((localUrl: string, file: File) => {
    setPendingMedia((prev) => new Map(prev).set(localUrl, file));
    // Consider revoking object URLs later, e.g., on unmount or when form is submitted/cleared
  }, []);

  // Calculate effective limits and enabled status for FileUploader
  const isAttachmentEnabled =
    typeof disableAttachments === "boolean"
      ? !disableAttachments // If prop is explicitly passed, it takes precedence.
      : boardInfo?.attachmentYn === "Y"; // Otherwise, fall back to boardInfo.

  const effectiveMaxFiles =
    typeof maxFileAttachments === "number"
      ? maxFileAttachments // If prop is explicitly passed, use it.
      : Number(boardInfo?.attachmentLimit) || 0; // Otherwise, use boardInfo, defaulting to 0.

  const effectiveMaxSize =
    typeof maxFileSizeMB === "number"
      ? maxFileSizeMB // If prop is explicitly passed, use it.
      : Number(boardInfo?.attachmentSize) || 0; // Otherwise, use boardInfo, defaulting to 0.

  // Validation function for FileUploader
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > effectiveMaxSize * 1024 * 1024) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다 (최대 ${effectiveMaxSize}MB).`,
      };
    }
    // Add other validation rules if needed (e.g., file type)
    return { valid: true };
  };

  // --- Effects ---

  // Set initial author if user is authenticated and it's an admin page context
  useEffect(() => {
    if (isAdminPageContext && user?.name) {
      updateFormField("author", user.name);
    }
  }, [isAdminPageContext, user, updateFormField]);

  // NEW: Cleanup Object URLs on unmount
  useEffect(() => {
    // Cleanup function to revoke Object URLs on unmount
    return () => {
      if (pendingMedia.size > 0) {
        pendingMedia.forEach((_file, localUrl) => {
          URL.revokeObjectURL(localUrl);
        });
      }
    };
  }, [pendingMedia]); // Depend only on pendingMedia

  return {
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
  };
}
