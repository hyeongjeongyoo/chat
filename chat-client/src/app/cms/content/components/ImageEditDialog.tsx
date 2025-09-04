"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  Portal,
  CloseButton,
  Button,
  Input,
  Box,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import { ContentBlock, ContentBlockHistory } from "@/types/api/content";
import dayjs from "dayjs";
import { HStack, IconButton, Image as ChakraImage } from "@chakra-ui/react";
import { LuGripVertical, LuUndo2, LuX } from "react-icons/lu";
import { useDrag, useDrop } from "react-dnd";

// 수정된 파일 상태 인터페이스
interface ManagedFile {
  // 기존 파일의 경우 fileId가 존재
  fileId?: number;
  // 새로 업로드된 파일의 경우 file 객체가 존재
  fileObject?: File;
  // 미리보기 URL
  preview: string;
  // 순서
  sortOrder: number;
}

interface ImageEditDialogProps {
  open: boolean;
  onClose: () => void;
  // 수정: 저장 시 파일 배열과 캡션을 전달
  onSave: (files: (File | number)[], caption: string) => void;
  block: ContentBlock | null;
  history: ContentBlockHistory[];
  onRestore: (historyId: number) => void;
}

// Draggable 아이템을 위한 타입
const ItemTypes = {
  FILE: "file",
};

interface DraggableFileItemProps {
  file: ManagedFile;
  index: number;
  moveFile: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (index: number) => void;
}

// DraggableFileItem 컴포넌트
function DraggableFileItem({
  file,
  index,
  moveFile,
  onRemove,
}: DraggableFileItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemTypes.FILE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveFile(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.FILE,
    item: () => ({ id: file.preview, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Box ref={preview} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <VStack
        ref={ref}
        key={file.preview}
        position="relative"
        gap={2}
        p={1}
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderRadius="md"
        boxShadow="sm"
      >
        <Box cursor="move" p={1}>
          <LuGripVertical />
        </Box>
        <ChakraImage
          src={file.preview}
          alt={`미리보기 ${index + 1}`}
          boxSize="100px"
          objectFit="cover"
          borderRadius="md"
        />
        <IconButton
          aria-label="파일 삭제"
          size="xs"
          colorScheme="red"
          variant="ghost"
          position="absolute"
          top={0}
          right={0}
          onClick={() => onRemove(index)}
        >
          <LuX />
        </IconButton>
      </VStack>
    </Box>
  );
}

export function ImageEditDialog({
  open,
  onClose,
  onSave,
  block,
  history,
  onRestore,
}: ImageEditDialogProps) {
  const [caption, setCaption] = useState("");
  // 여러 파일을 관리하기 위한 상태
  const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);

  useEffect(() => {
    if (open && block) {
      setCaption(block.content || "");
      // 기존 블록의 파일들로 managedFiles 상태 초기화
      const initialFiles = (block.files || [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((file) => ({
          fileId: file.fileId,
          preview: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/download/${file.fileId}`,
          sortOrder: file.sortOrder,
        }));
      setManagedFiles(initialFiles);
    }
  }, [open, block]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file, index) => ({
        fileObject: file,
        preview: URL.createObjectURL(file),
        sortOrder: managedFiles.length + index,
      }));
      setManagedFiles((prev) => [...prev, ...newFiles]);
    },
    [managedFiles.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".webm"],
    },
    multiple: true, // 여러 파일 선택 허용
  });

  const handleSave = () => {
    // 저장 시 fileId 또는 File 객체를 배열로 만들어 전달
    const filesToSave = managedFiles.map((mf) => mf.fileId ?? mf.fileObject!);
    onSave(filesToSave, caption);
  };

  const handleRemoveFile = (index: number) => {
    // URL.createObjectURL로 생성된 미리보기 URL 해제
    const fileToRemove = managedFiles[index];
    if (fileToRemove.fileObject) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setManagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = useCallback((dragIndex: number, hoverIndex: number) => {
    setManagedFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      const [draggedFile] = newFiles.splice(dragIndex, 1);
      newFiles.splice(hoverIndex, 0, draggedFile);
      // 순서 재정렬
      return newFiles.map((f, i) => ({ ...f, sortOrder: i }));
    });
  }, []);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
      size="xl" // 다이얼로그 크기 수정
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>이미지/비디오 블록 수정</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4}>
                {/* 파일 목록 표시 */}
                <Box
                  w="full"
                  minH="150px"
                  p={2}
                  bg="gray.50"
                  _dark={{ bg: "gray.900" }}
                  borderRadius="md"
                >
                  <HStack gap={4} overflowX="auto" p={2}>
                    {managedFiles.map((mf, index) => (
                      <DraggableFileItem
                        key={mf.preview}
                        index={index}
                        file={mf}
                        moveFile={moveFile}
                        onRemove={handleRemoveFile}
                      />
                    ))}
                  </HStack>
                </Box>

                <Box
                  {...getRootProps()}
                  w="full"
                  p={8}
                  border="2px dashed"
                  borderColor={isDragActive ? "blue.500" : "gray.200"}
                  borderRadius="lg"
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: "blue.500" }}
                >
                  <input {...getInputProps()} />
                  <Icon as={FiUpload} w={8} h={8} color="gray.400" mb={2} />
                  <Text>
                    {isDragActive
                      ? "파일을 여기에 놓으세요"
                      : "새 이미지/비디오를 드래그하거나 클릭하여 업로드하세요"}
                  </Text>
                </Box>
                <Input
                  placeholder="캡션(대체 텍스트) 입력"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </VStack>
              <Box h="1px" bg="gray.200" my={4} />
              <Box>
                <Text fontWeight="bold" mb={2}>
                  변경 이력
                </Text>
                <Box maxH="200px" overflowY="auto" p={1}>
                  <VStack align="stretch" gap={2}>
                    {history.length > 0 ? (
                      history.map((h) => (
                        <HStack
                          key={h.id}
                          justify="space-between"
                          p={2}
                          bg="gray.50"
                          _dark={{ bg: "gray.700" }}
                          borderRadius="md"
                        >
                          <VStack align="start" flex="1" minW="0" gap={2}>
                            <HStack
                              w="full"
                              gap={2}
                              overflowX="auto"
                              py={1}
                              // 스크롤바 스타일링
                              css={{
                                "&::-webkit-scrollbar": { height: "4px" },
                                "&::-webkit-scrollbar-thumb": {
                                  background: "gray.300",
                                  borderRadius: "24px",
                                },
                              }}
                            >
                              {h.fileIds && h.fileIds.length > 0 ? (
                                h.fileIds.map((fileId) => (
                                  <ChakraImage
                                    key={fileId}
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/download/${fileId}`}
                                    alt={h.content || "history image"}
                                    boxSize="40px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    flexShrink={0}
                                  />
                                ))
                              ) : (
                                <Text fontSize="xs" color="gray.400">
                                  (이미지 없음)
                                </Text>
                              )}
                            </HStack>
                            <Box>
                              <Text
                                fontSize="sm"
                                color="gray.600"
                                _dark={{ color: "gray.400" }}
                                whiteSpace="pre-wrap"
                              >
                                {h.content || "(캡션 없음)"}
                              </Text>
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                {dayjs(h.createdDate).format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )}{" "}
                                by {h.createdBy}
                              </Text>
                            </Box>
                          </VStack>
                          <Button
                            size="xs"
                            colorPalette="blue"
                            variant="subtle"
                            onClick={() => onRestore(h.id)}
                          >
                            <LuUndo2 />
                          </Button>
                        </HStack>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        변경 이력이 없습니다.
                      </Text>
                    )}
                  </VStack>
                </Box>
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                취소
              </Button>
              <Button colorPalette="blue" onClick={handleSave}>
                저장
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
