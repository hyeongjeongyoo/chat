"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Flex,
  Heading,
  Box,
  Input,
  NativeSelect,
  Stack,
  Field,
  Fieldset,
  Text,
} from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mainMediaApi,
  mainMediaKeys,
  MainMediaResponse,
} from "@/lib/api/main-media";
import { MainMediaDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { FileUploader } from "@/components/common/FileUploader";
import { MainMediaItem } from "./MainMediaItem";
import { fileApi } from "@/lib/api/file";

interface MainMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MainMediaDialog: React.FC<MainMediaDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<MainMediaDto | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaItems, setMediaItems] = useState<MainMediaDto[]>([]);

  // 미디어 목록 조회 - 임시로 비활성화
  const { data: mediaResponse, isLoading } = useQuery<MainMediaResponse>({
    queryKey: mainMediaKeys.list({}),
    queryFn: async () => {
      // 임시로 더미 데이터 반환
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
      };
    },
    enabled: false, // API 호출 비활성화
  });

  // 미디어 목록이 변경될 때마다 상태 업데이트
  React.useEffect(() => {
    if (mediaResponse) {
      setMediaItems(mediaResponse.content);
    }
  }, [mediaResponse]);

  // 미디어 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await mainMediaApi.createMainMedia(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mainMediaKeys.lists() });
      toaster.success({
        title: "미디어가 추가되었습니다.",
        duration: 3000,
      });
      setSelectedMedia(null);
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error("Error creating media:", error);
      toaster.error({
        title: "미디어 추가에 실패했습니다.",
        duration: 3000,
      });
    },
  });

  // 미디어 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: async ({
      mediaId,
      formData,
    }: {
      mediaId: number;
      formData: FormData;
    }) => {
      const response = await mainMediaApi.updateMainMedia(mediaId, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mainMediaKeys.lists() });
      toaster.success({
        title: "미디어가 수정되었습니다.",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error("Error updating media:", error);
      toaster.error({
        title: "미디어 수정에 실패했습니다.",
        duration: 3000,
      });
    },
  });

  // 미디어 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      await mainMediaApi.deleteMainMedia(mediaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mainMediaKeys.lists() });
      toaster.success({
        title: "미디어가 삭제되었습니다.",
        duration: 3000,
      });
      setSelectedMedia(null);
    },
    onError: (error) => {
      console.error("Error deleting media:", error);
      toaster.error({
        title: "미디어 삭제에 실패했습니다.",
        duration: 3000,
      });
    },
  });

  // 순서 변경 뮤테이션
  const updateOrderMutation = useMutation({
    mutationFn: mainMediaApi.updateMainMediaOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mainMediaKeys.lists() });
      toaster.success({
        title: "미디어 순서가 변경되었습니다.",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toaster.error({
        title: "미디어 순서 변경에 실패했습니다.",
        duration: 3000,
      });
    },
  });

  const handleSave = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formElement = event.currentTarget;

      // Get form field values
      const typeField =
        formElement.querySelector<HTMLSelectElement>('[name="type"]');
      const titleField =
        formElement.querySelector<HTMLInputElement>('[name="title"]');

      if (!typeField || !titleField) {
        toaster.error({
          title: "필수 입력 필드를 찾을 수 없습니다.",
          duration: 3000,
        });
        return;
      }

      // Validate required fields
      if (!titleField.value.trim()) {
        toaster.error({
          title: "제목을 입력해주세요.",
          duration: 3000,
        });
        return;
      }

      if (!selectedFile && !selectedMedia) {
        toaster.error({
          title: "파일을 선택해주세요.",
          duration: 3000,
        });
        return;
      }

      try {
        let fileId: number | undefined;

        // Step 1: Upload file first if a new file is selected
        if (selectedFile) {
          // Debug: Create FormData manually to see what's being sent
          const debugFormData = new FormData();
          debugFormData.append("files", selectedFile, selectedFile.name);
          debugFormData.append("menu", "MAIN_MEDIA");
          debugFormData.append("menuId", "0");

          const fileUploadResponse = await fileApi.upload(
            selectedFile,
            "EDITOR", // Try using "EDITOR" instead of "MAIN_MEDIA"
            0 // temporary menuId, will be updated with actual media ID later
          );

          if (
            fileUploadResponse.success &&
            fileUploadResponse.data.length > 0
          ) {
            fileId = fileUploadResponse.data[0].fileId;
          } else {
            throw new Error("파일 업로드에 실패했습니다.");
          }
        }

        // Step 2: Create/Update main media with fileId
        const formData = new FormData();

        const mainMediaDtoPart = {
          mediaType: typeField.value as "IMAGE" | "VIDEO",
          title: titleField.value.trim(),
          displayOrder: mediaItems.length + 1,
          ...(fileId && { fileId }), // Include fileId only if we have one
        };

        const mainMediaDtoBlob = new Blob([JSON.stringify(mainMediaDtoPart)], {
          type: "application/json",
        });
        formData.append("mainMediaData", mainMediaDtoBlob);

        // For updates, we might not need to send the file again if no new file is selected
        if (selectedFile && fileId) {
          // Note: We already uploaded the file, but some APIs might expect the file in the main request too
          // Check if this is needed based on your API specification
        }

        if (selectedMedia) {
          await updateMutation.mutateAsync({
            mediaId: selectedMedia.id,
            formData,
          });
        } else {
          await createMutation.mutateAsync(formData);
        }

        // Clear form after successful save
        formElement.reset();
        setSelectedFile(null);
      } catch (error) {
        console.error("Error saving media:", error);
        toaster.error({
          title: "미디어 저장에 실패했습니다.",
          description:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
          duration: 3000,
        });
      }
    },
    [
      selectedMedia,
      selectedFile,
      createMutation,
      updateMutation,
      mediaItems.length,
    ]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedMedia) return;

    if (window.confirm("미디어를 삭제하시겠습니까?")) {
      try {
        await deleteMutation.mutateAsync(selectedMedia.id);
      } catch (error) {
        console.error("Error deleting media:", error);
      }
    }
  }, [selectedMedia, deleteMutation]);

  const handleFileChange = useCallback((files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(null);
    }
  }, []);

  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setMediaItems((prevItems) => {
        const newItems = [...prevItems];
        const [removed] = newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, removed);

        // 순서 업데이트를 서버에 반영
        const orderUpdates = newItems.map(
          (item: MainMediaDto, index: number) => ({
            mediaId: item.id,
            displayOrder: index + 1,
          })
        );

        updateOrderMutation.mutate(orderUpdates);
        return newItems;
      });
    },
    [updateOrderMutation]
  );

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="4xl">
            <Dialog.Header>
              <Dialog.Title>메인 미디어 관리</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex gap={6}>
                <Box flex="1">
                  <Heading as="h4" size="md" mb={4}>
                    미디어 목록
                  </Heading>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    드래그 앤 드롭으로 순서를 변경할 수 있습니다.
                  </Text>
                  <DndProvider backend={HTML5Backend}>
                    <Stack gap={2}>
                      {mediaItems.map((media, index) => (
                        <MainMediaItem
                          key={media.id}
                          media={media}
                          index={index}
                          onDelete={deleteMutation.mutate}
                          moveMedia={moveItem}
                        />
                      ))}
                    </Stack>
                  </DndProvider>
                </Box>
                <Box flex="1">
                  <form onSubmit={handleSave}>
                    <Fieldset.Root>
                      <Stack>
                        <Fieldset.Legend>
                          {selectedMedia ? "미디어 수정" : "새 미디어 추가"}
                        </Fieldset.Legend>
                        <Fieldset.HelperText>
                          미디어 정보를 입력하고 파일을 업로드하세요.
                        </Fieldset.HelperText>
                      </Stack>
                      <Fieldset.Content mt={4}>
                        <Field.Root>
                          <Field.Label>미디어 타입</Field.Label>
                          <NativeSelect.Root>
                            <NativeSelect.Field
                              name="type"
                              defaultValue={selectedMedia?.type || "IMAGE"}
                            >
                              <option value="IMAGE">이미지</option>
                              <option value="VIDEO">동영상</option>
                            </NativeSelect.Field>
                          </NativeSelect.Root>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>제목</Field.Label>
                          <Input
                            name="title"
                            defaultValue={selectedMedia?.title || ""}
                            required
                          />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>파일 업로드</Field.Label>
                          <FileUploader
                            onChange={handleFileChange}
                            maxFiles={1}
                            allowedFileTypes={[
                              "jpg",
                              "jpeg",
                              "png",
                              "gif",
                              "mp4",
                              "webm",
                            ]}
                            maxSizeInMB={50}
                            existingFiles={[]}
                            attachmentsToDelete={[]}
                          />
                        </Field.Root>

                        {(selectedMedia || selectedFile) && (
                          <Box mt={4}>
                            <Heading as="h5" size="sm" mb={2}>
                              미리보기
                            </Heading>
                            {selectedFile ? (
                              <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="미리보기"
                                style={{ maxWidth: "100%", borderRadius: "md" }}
                              />
                            ) : selectedMedia?.type === "IMAGE" ? (
                              <img
                                src={selectedMedia.fileUrl}
                                alt={selectedMedia.title}
                                style={{ maxWidth: "100%", borderRadius: "md" }}
                              />
                            ) : selectedMedia ? (
                              <video
                                src={selectedMedia.fileUrl}
                                controls
                                style={{ maxWidth: "100%", borderRadius: "md" }}
                              />
                            ) : null}
                          </Box>
                        )}
                      </Fieldset.Content>
                    </Fieldset.Root>
                    <Dialog.Footer gap={3}>
                      <Button type="submit" colorScheme="blue">
                        {selectedMedia ? "수정" : "추가"}
                      </Button>
                      {selectedMedia && (
                        <Button onClick={handleDelete} colorScheme="red">
                          삭제
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedMedia(null);
                          setSelectedFile(null);
                        }}
                        variant="outline"
                      >
                        새로 만들기
                      </Button>
                      <Dialog.CloseTrigger asChild>
                        <Button variant="outline">닫기</Button>
                      </Dialog.CloseTrigger>
                    </Dialog.Footer>
                  </form>
                </Box>
              </Flex>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
