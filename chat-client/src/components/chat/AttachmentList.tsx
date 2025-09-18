"use client";

import { Box, Flex, Text, Icon, Link, Button } from "@chakra-ui/react";
import { LuFile, LuDownload, LuImage } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { fileApi } from "@/lib/api/file";

interface AttachmentListProps {
  selectedThreadId: number | null;
}

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

function formatKoreanDate(dateInput: string): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const dStr = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(d).replace(/\.$/, "");
    const tStr = new Intl.DateTimeFormat("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return `${dStr} ${tStr}`;
  } catch {
    return "";
  }
}

const fetchAttachments = async (threadId: number | null): Promise<Attachment[]> => {
  if (!threadId) return [];
  const list = await fileApi.getList({ module: "CHAT", moduleId: threadId });
  const arr: any[] = Array.isArray(list) ? list : (list && Array.isArray((list as any).data) ? (list as any).data : []);
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const toAbs = (u?: string) => !u ? undefined : (u.startsWith("http") ? u : `${base}${u}`);
  return arr.map((f: any) => ({
    id: f.fileId,
    fileName: f.originName,
    fileUrl: toAbs((f.viewUrl as string) || (f.downloadUrl as string)) || "",
    fileType: f.mimeType || "application/octet-stream",
    createdAt: f.createdDate || f.updatedDate || new Date().toISOString(),
  }));
};

export const AttachmentList = ({ selectedThreadId }: AttachmentListProps) => {
  const {
    data: attachments,
    isLoading,
    error,
  } = useQuery<Attachment[], Error>({
    queryKey: ["attachments", selectedThreadId],
    queryFn: () => fetchAttachments(selectedThreadId),
    enabled: !!selectedThreadId,
  });

  if (!selectedThreadId) {
    return (
      <Flex justify="center" align="center" h="full">
        <Text>채팅방을 선택해주세요.</Text>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="full">
        <Text>파일 목록을 불러오는 중...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text>파일 목록을 불러오는데 실패했습니다.</Text>
      </Box>
    );
  }

  return (
    <Box p={4} h="100%" minH={0} overflowY="auto">
      {attachments?.length === 0 ? (
        <Flex justify="center" align="center" h="200px">
          <Text color="gray.500">첨부된 파일이 없습니다.</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap={2}>
          {attachments?.map((file) => (
            <Flex
              key={file.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              align="center"
              justify="space-between"
              _hover={{ bg: "gray.50" }}
            >
              <Flex align="center" flex={1}>
                <Icon
                  as={file.fileType.startsWith("image/") ? LuImage : LuFile}
                  boxSize={5}
                  mr={3}
                />
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {file.fileName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatKoreanDate(file.createdAt)}
                  </Text>
                </Box>
              </Flex>
              <Link href={file.fileUrl} download>
                <Button size="sm" variant="ghost">
                  <Icon as={LuDownload} mr={2} />
                  다운로드
                </Button>
              </Link>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
};
