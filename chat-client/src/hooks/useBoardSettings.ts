import { useState, useEffect } from "react";
import { boardApi } from "@/lib/api/board";
import { BoardMaster } from "@/types/api";

interface EditorAttachmentProps {
  maxFileAttachments?: number;
  maxFileSizeMB?: number;
  disableAttachments: boolean;
}

interface UseBoardSettingsReturn {
  boardSettings: BoardMaster | null;
  isLoading: boolean;
  error: string | null;
  editorAttachmentProps: EditorAttachmentProps;
}

const defaultAttachmentProps: EditorAttachmentProps = {
  disableAttachments: true, // Default to disabled if no settings or error
  maxFileAttachments: undefined,
  maxFileSizeMB: undefined,
};

export function useBoardSettings(
  bbsId: number | null,
  isPublicContext: boolean = false
): UseBoardSettingsReturn {
  const [boardSettings, setBoardSettings] = useState<BoardMaster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorAttachmentProps, setEditorAttachmentProps] =
    useState<EditorAttachmentProps>(defaultAttachmentProps);

  useEffect(() => {
    async function fetchSettings() {
      if (typeof bbsId !== "number" || bbsId <= 0) {
        setBoardSettings(null);
        setError(null);
        setIsLoading(false);
        setEditorAttachmentProps(defaultAttachmentProps);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        let settings: BoardMaster | null = null;

        if (isPublicContext) {
          const apiResponse = await boardApi.getPublicBoardInfo(bbsId);
          if (apiResponse.success && apiResponse.data) {
            settings = apiResponse.data;
          } else {
            throw new Error(
              apiResponse.message || "Failed to fetch public board settings"
            );
          }
        } else {
          const response = await boardApi.getBoard(bbsId);
          if (response.data.success && response.data.data) {
            settings = response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to fetch board settings"
            );
          }
        }

        if (settings) {
          setBoardSettings(settings);
          setEditorAttachmentProps({
            maxFileAttachments: Number(settings.attachmentLimit) || undefined,
            maxFileSizeMB: Number(settings.attachmentSize) || undefined,
            disableAttachments: settings.attachmentYn !== "Y",
          });
        } else {
          throw new Error("No settings data received");
        }
      } catch (err: any) {
        console.error(
          `Failed to fetch board settings for bbsId ${bbsId}:`,
          err
        );
        setError(
          err.message || "게시판 설정 정보를 불러오는 중 오류가 발생했습니다."
        );
        setBoardSettings(null); // Clear settings on error
        setEditorAttachmentProps(defaultAttachmentProps); // Reset to default on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [bbsId, isPublicContext]);

  return { boardSettings, isLoading, error, editorAttachmentProps };
}
