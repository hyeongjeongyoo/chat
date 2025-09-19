"use client";

import { Box, Flex, Text, Icon, Link, Button, Image } from "@chakra-ui/react";
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
  // 최신이 상단: createdDate/updatedDate 기준 내림차순 정렬
  arr.sort((a: any, b: any) => {
    const at = new Date(a.createdDate || a.updatedDate || 0).getTime();
    const bt = new Date(b.createdDate || b.updatedDate || 0).getTime();
    return bt - at;
  });
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
          {attachments?.map((file) => {
            const isImage = file.fileType.startsWith("image/");
            const ext = String(file.fileName || "").split('.').pop()?.toLowerCase();
            const iconStyle = (() => {
              if (!ext) return { bg: "gray.100", color: "gray.700", label: "FILE" } as const;
              if (ext === "pdf") return { bg: "red.50", color: "red.600", label: "PDF" } as const;
              if (["xls", "xlsx", "csv"].includes(ext)) return { bg: "green.50", color: "green.700", label: "XLS" } as const;
              if (["doc", "docx"].includes(ext)) return { bg: "blue.50", color: "blue.700", label: "DOC" } as const;
              if (["ppt", "pptx"].includes(ext)) return { bg: "orange.50", color: "orange.700", label: "PPT" } as const;
              if (["hwp"].includes(ext)) return { bg: "teal.50", color: "teal.700", label: "HWP" } as const;
              if (["html", "htm"].includes(ext)) return { bg: "cyan.50", color: "cyan.700", label: "HTML" } as const;
              if (["url"].includes(ext)) return { bg: "cyan.50", color: "cyan.700", label: "URL" } as const;
              if (["zip", "rar", "7z"].includes(ext)) return { bg: "purple.50", color: "purple.700", label: "ZIP" } as const;
              return { bg: "gray.100", color: "gray.700", label: (ext || "FILE").toUpperCase().slice(0,4) } as const;
            })();
            return (
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
                {isImage ? (
                  <Box w="32px" h="32px" borderRadius="md" overflow="hidden" flexShrink={0} bg="gray.100" mr={3}>
                    <Image
                      src={file.fileUrl}
                      alt={file.fileName}
                      width="32px"
                      height="32px"
                      style={{ display: 'block', objectFit: 'cover', width: '32px', height: '32px' }}
                    />
                  </Box>
                ) : (
                  <Box w="32px" h="32px" borderRadius="md" flexShrink={0} bg={iconStyle.bg} display="flex" alignItems="center" justifyContent="center" mr={3}>
                    <Text fontSize="10px" fontWeight="bold" color={iconStyle.color as any}>
                      {iconStyle.label}
                    </Text>
                  </Box>
                )}
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
          );})}
        </Flex>
      )}
    </Box>
  );
};
