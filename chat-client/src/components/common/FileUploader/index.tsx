"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Box, Text, Flex, Icon, HStack, IconButton } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { UploadCloud, X, File, GripVertical, Info } from "lucide-react";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// NEW: Unified interface for both existing and new files in the list
interface UnifiedFileListItem {
  uiId: string; // Unique ID for the UI list (e.g., `existing-${fileId}` or `new-${timestamp}`)
  originalId?: number; // Actual fileId from backend for existing attachments
  name: string;
  size: number;
  url?: string; // Download URL for existing files
  file?: File; // The File object for new files being uploaded
  progress: number; // For new uploads, 0-100. For existing, can be 100.
  error?: string; // For validation errors on new files
  isExisting: boolean;
  isMarkedForDeletion?: boolean; // True if an existing file is marked for deletion
}

// Interface for the existingFiles prop, similar to what useArticleForm provides
interface ExistingAttachmentForProps {
  id: number;
  name: string;
  url: string;
  size: number;
  mimeType?: string;
}

interface FileUploaderProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  allowedFileTypes?: string[];
  onChange?: (newFiles: File[]) => void; // Will now only report NEW files
  validateFile?: (file: File) => { valid: boolean; error?: string };
  existingFiles?: ExistingAttachmentForProps[]; // Changed to use local interface for prop type
  onDeleteExistingFile?: (fileId: number) => void;
  attachmentsToDelete?: number[];
}

// 드래그 아이템 인터페이스
interface DragItem {
  index: number;
  id: string;
  type: string;
}

// 드래그 가능한 파일 아이템 컴포넌트
const DraggableFileItem = ({
  fileInfo,
  index,
  handleRemoveFile,
  moveFile,
}: {
  fileInfo: UnifiedFileListItem;
  index: number;
  handleRemoveFile: (uiId: string, originalId?: number) => void;
  moveFile: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "FILE_ITEM",
    item: { type: "FILE_ITEM", id: fileInfo.uiId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: "FILE_ITEM",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // 자기 자신 위에 드롭하는 경우 무시
      if (dragIndex === hoverIndex) {
        return;
      }

      // 마우스 포인터의 위치를 계산
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset
        ? clientOffset.y - hoverBoundingRect.top
        : 0;

      // 드래그가 절반 이상 넘어가야 이동
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // 파일 순서 변경
      moveFile(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.4 : fileInfo.isMarkedForDeletion ? 0.6 : 1;

  return (
    <Box
      ref={ref}
      data-handler-id={handlerId}
      borderWidth="1px"
      borderRadius="md"
      p={2}
      mb={2}
      bg={
        fileInfo.error
          ? "red.50"
          : fileInfo.isMarkedForDeletion
          ? "red.100"
          : fileInfo.isExisting
          ? "blue.50"
          : "gray.50"
      }
      opacity={opacity}
      _hover={{ boxShadow: "sm" }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="center">
        <HStack>
          <Icon as={GripVertical} w={4} h={4} color="gray.400" cursor="grab" />
          <Icon as={File} w={4} h={4} color="gray.500" />
          <Text
            fontSize="sm"
            maxW="200px"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            textDecoration={
              fileInfo.isMarkedForDeletion ? "line-through" : "none"
            }
          >
            {fileInfo.name}
          </Text>
        </HStack>
        <IconButton
          aria-label={
            fileInfo.isMarkedForDeletion
              ? "Undo delete"
              : fileInfo.isExisting
              ? "Delete existing file"
              : "Remove new file"
          }
          size="xs"
          variant="ghost"
          onClick={() => handleRemoveFile(fileInfo.uiId, fileInfo.originalId)}
        >
          <Icon
            as={fileInfo.isMarkedForDeletion ? UploadCloud : X}
            w={4}
            h={4}
          />
        </IconButton>
      </Flex>

      {fileInfo.error ? (
        <Text fontSize="xs" color="red.500" mt={1}>
          {fileInfo.error}
        </Text>
      ) : (
        <Box
          w="100%"
          h="2px"
          mt={2}
          bg="gray.200"
          borderRadius="full"
          overflow="hidden"
        >
          <Box
            w={`${fileInfo.progress}%`}
            h="100%"
            bg="blue.500"
            transition="width 0.3s"
          />
        </Box>
      )}

      <Text fontSize="xs" color="gray.500" mt={1}>
        {(fileInfo.size / (1024 * 1024)).toFixed(2)} MB
      </Text>
    </Box>
  );
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  maxFiles = 3,
  maxSizeInMB = 5,
  allowedFileTypes = [
    "jpg",
    "gif",
    "png",
    "bmp",
    "doc",
    "docx",
    "ppt",
    "pdf",
    "xls",
    "zip",
    "alz",
    "swf",
    "flv",
    "hwp",
    "hwpx",
    "xlsx",
    "pptx",
    "pps",
    "ppsx",
    "tif",
    "wmv",
  ],
  onChange,
  validateFile,
  existingFiles = [], // Default to empty array
  onDeleteExistingFile,
  attachmentsToDelete = [], // Default to empty array
}) => {
  const [displayedFiles, setDisplayedFiles] = useState<UnifiedFileListItem[]>(
    []
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayedFiles((prevDisplayedFiles) => {
      const newFilesFromState = prevDisplayedFiles.filter((f) => !f.isExisting); // Preserve user-added new files

      const processedExistingFiles: UnifiedFileListItem[] = (
        existingFiles || []
      ).map((ef) => ({
        uiId: `existing-${ef.id}`, // Use ef.id from ExistingAttachmentForProps
        originalId: ef.id,
        name: ef.name,
        size: ef.size,
        url: ef.url,
        isExisting: true,
        progress: 100,
        isMarkedForDeletion: attachmentsToDelete?.includes(ef.id),
        file: undefined,
        error: undefined,
      }));

      return [...processedExistingFiles, ...newFilesFromState];
    });
  }, [existingFiles, attachmentsToDelete]);

  const showToast = (
    message: string,
    status: "error" | "warning" = "error"
  ) => {
    alert(message); // 간단한 알림으로 대체 (실제 사용 시 Chakra Toast 구현 필요)
  };

  // 파일 순서 변경 함수
  const moveFile = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedFile = displayedFiles[dragIndex];
      const newFiles = [...displayedFiles];
      newFiles.splice(dragIndex, 1);
      newFiles.splice(hoverIndex, 0, draggedFile);

      setDisplayedFiles(newFiles);

      // 변경된 순서의 파일 목록을 부모 컴포넌트에 전달
      if (onChange) {
        onChange(
          newFiles
            .filter((f) => !f.isExisting && !f.error && f.file)
            .map((f) => f.file!)
        );
      }
    },
    [displayedFiles, onChange]
  );

  const validateFileInternal = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (validateFile) {
        return validateFile(file);
      }
      if (file.size > maxSizeInMB * 1024 * 1024) {
        return {
          valid: false,
          error: `파일 크기는 ${maxSizeInMB}MB 이하여야 합니다.`,
        };
      }
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedFileTypes.includes(fileExtension)) {
        return {
          valid: false,
          error: `지원되지 않는 파일 형식입니다.`,
        };
      }
      return { valid: true };
    },
    [validateFile, maxSizeInMB, allowedFileTypes]
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const currentValidFileCount = displayedFiles.filter(
        (f) => !f.isMarkedForDeletion && !f.error
      ).length;

      if (currentValidFileCount >= maxFiles) {
        showToast(
          `최대 ${maxFiles}개의 파일만 업로드 가능합니다. (현재 ${currentValidFileCount}개)`,
          "warning"
        );
        return;
      }

      const newFilesToAdd: UnifiedFileListItem[] = []; // Changed from newFiles to newFilesToAdd to avoid confusion in loop

      Array.from(fileList).forEach((file) => {
        // Check against maxFiles, considering files already added in this batch
        if (currentValidFileCount + newFilesToAdd.length >= maxFiles) {
          if (
            currentValidFileCount + newFilesToAdd.length > maxFiles &&
            fileList.length > newFilesToAdd.length
          ) {
            showToast(
              `최대 ${maxFiles}개 선택 가능. ${
                fileList.length - newFilesToAdd.length
              }개 파일은 제외됩니다.`,
              "warning"
            );
          }
          return;
        }

        const { valid, error } = validateFileInternal(file);

        newFilesToAdd.push({
          uiId: `${file.name}-${Date.now()}`,
          originalId: undefined,
          name: file.name,
          size: file.size,
          url: undefined,
          file,
          progress: valid ? 100 : 0,
          error: error,
          isExisting: false,
          isMarkedForDeletion: false,
        });
      });

      const updatedDisplayedFiles = [...displayedFiles, ...newFilesToAdd]; // Use newFilesToAdd
      setDisplayedFiles(updatedDisplayedFiles);

      if (onChange) {
        onChange(
          updatedDisplayedFiles
            .filter((f) => !f.isExisting && !f.error && f.file)
            .map((f) => f.file!)
        );
      }

      // Simulate progress for demonstration purposes
      newFilesToAdd.forEach((fileInfo) => {
        // Use newFilesToAdd
        if (!fileInfo.error) {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
              setDisplayedFiles((prev) =>
                prev.map((f) =>
                  f.uiId === fileInfo.uiId ? { ...f, progress } : f
                )
              );
            } else {
              clearInterval(interval);
              setDisplayedFiles((prev) =>
                prev.map((f) =>
                  f.uiId === fileInfo.uiId ? { ...f, progress: 100 } : f
                )
              );
            }
          }, 100);
        }
      });
    },
    [displayedFiles, maxFiles, onChange, validateFileInternal]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const handleRemoveItem = useCallback(
    (uiId: string, originalId?: number) => {
      if (originalId !== undefined && onDeleteExistingFile) {
        // This is an existing file, delegate to parent to mark for deletion (or undo)
        onDeleteExistingFile(originalId);
      } else {
        // This is a new file, remove it from the local list
        const updatedFiles = displayedFiles.filter(
          (file) => file.uiId !== uiId
        );
        setDisplayedFiles(updatedFiles);
        if (onChange) {
          onChange(
            updatedFiles
              .filter((f) => !f.isExisting && !f.error && f.file)
              .map((f) => f.file!)
          );
        }
      }
    },
    [displayedFiles, onChange, onDeleteExistingFile]
  );

  // 기존 파일을 모두 제거하는 함수 추가
  const clearAllFiles = useCallback(() => {
    setDisplayedFiles([]);
    if (onChange) {
      onChange([]); // For clearing, it's okay to send an empty array of File[]
    }
  }, [onChange]);

  return (
    <Box w="100%">
      <DndProvider backend={HTML5Backend}>
        <Box>
          <Box
            border="1px dashed"
            borderColor={isDragging ? "blue.400" : "gray.300"}
            borderRadius="md"
            p={4}
            mb={2}
            minH="80px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bg={isDragging ? "blue.50" : "transparent"}
            transition="all 0.2s"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            cursor="pointer"
          >
            <Icon as={UploadCloud} w={6} h={6} color="blue.500" mb={2} />
            <Text color="blue.500" mb={1}>
              첨부할 파일을 끌어놓으세요
            </Text>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              onChange={handleFileInputChange}
            />
          </Box>

          <Flex justify="space-between" align="center" mb={3}>
            <Text fontSize="sm" color="gray.500">
              첨부 가능 개수 : {displayedFiles.length}/{maxFiles}개 (최대{" "}
              {maxSizeInMB}
              MB)
            </Text>
            {displayedFiles.length > 0 && (
              <Tooltip content="파일을 드래그하여 순서를 변경할 수 있습니다">
                <Box display="inline-flex" alignItems="center">
                  <Icon as={Info} w={4} h={4} color="blue.500" />
                </Box>
              </Tooltip>
            )}
          </Flex>

          {displayedFiles.length > 0 && (
            <Box mt={2}>
              {displayedFiles.map((fileInfo, index) => (
                <DraggableFileItem
                  key={fileInfo.uiId}
                  fileInfo={fileInfo}
                  index={index}
                  handleRemoveFile={handleRemoveItem}
                  moveFile={moveFile}
                />
              ))}
            </Box>
          )}
        </Box>
      </DndProvider>
    </Box>
  );
};
