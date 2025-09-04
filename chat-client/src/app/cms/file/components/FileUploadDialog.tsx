import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Image,
  Progress,
  Text,
  VStack,
  Portal,
  Icon,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiX } from "react-icons/fi";
import { fileApi } from "@/lib/api/file";
import { toaster } from "@/components/ui/toaster";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  module: string;
  moduleId: number;
}

interface FilePreview {
  file: File;
  preview: string;
  progress: number;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isOpen,
  onClose,
  module,
  moduleId,
}) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Extract files from the FilePreview objects
      const fileObjects = files.map((filePreview) => filePreview.file);

      await fileApi.upload(fileObjects, module, moduleId);

      toaster.success({
        title: "파일 업로드 성공",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toaster.error({
        title: "파일 업로드 실패",
        description: "파일 업로드 중 오류가 발생했습니다.",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>파일 업로드</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4}>
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
                      : "파일을 드래그하거나 클릭하여 업로드하세요"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    지원 형식: 이미지, PDF, DOC, XLS (최대 10MB)
                  </Text>
                </Box>

                {files.length > 0 && (
                  <VStack w="full" gap={2}>
                    {files.map((file, index) => (
                      <Flex
                        key={index}
                        w="full"
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        align="center"
                      >
                        {file.file.type.startsWith("image/") ? (
                          <Image
                            src={file.preview}
                            alt={file.file.name}
                            boxSize="50px"
                            objectFit="cover"
                            mr={2}
                          />
                        ) : (
                          <Box
                            boxSize="50px"
                            bg="gray.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mr={2}
                          >
                            <Text fontSize="xs">
                              {file.file.name.split(".").pop()}
                            </Text>
                          </Box>
                        )}
                        <Box flex={1}>
                          <Text fontSize="sm" truncate>
                            {file.file.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                          <Progress.Root
                            defaultValue={0}
                            size="xs"
                            colorPalette="blue"
                          >
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </Box>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                        >
                          <Icon as={FiX} />
                        </Button>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" mr={3} onClick={onClose}>
                  취소
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="blue"
                onClick={handleUpload}
                loading={isUploading}
                disabled={files.length === 0}
              >
                업로드
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
