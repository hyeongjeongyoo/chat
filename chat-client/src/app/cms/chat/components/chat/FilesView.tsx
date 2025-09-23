"use client";

import React from "react";
import { Box, VStack, HStack, Text, IconButton, Image } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import { fileApi } from "@/lib/api/file";
import { type Colors, type ThreadFile } from "../../types";

type FilesViewProps = {
  colors: Colors;
  threadFiles: ThreadFile[];
  backendThreadId: number | null;
  onFilesUpdate: (files: ThreadFile[]) => void;
};

export function FilesView({ colors, threadFiles, backendThreadId, onFilesUpdate }: FilesViewProps) {
  const [selectedImage, setSelectedImage] = React.useState<{ src: string; alt: string } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [isDrawerMounted, setIsDrawerMounted] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const savedScrollPositionRef = React.useRef<number>(0);

  // Files 탭 활성화 시 현재 스레드의 첨부 목록 로딩
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (backendThreadId == null) return;
      try {
        const list = await fileApi.getList({ module: "CHAT", moduleId: backendThreadId });
        if (!mounted) return;
        const arr: any[] = Array.isArray(list) ? list : (list && Array.isArray((list as any).data) ? (list as any).data : []);
        const sorted = arr.sort((a: any, b: any) => {
          const at = new Date(a.createdDate || a.updatedDate || 0).getTime();
          const bt = new Date(b.createdDate || b.updatedDate || 0).getTime();
          return bt - at; // 최신 먼저
        });
        onFilesUpdate(sorted.map((f: any) => ({ 
          fileId: String(f.fileId), 
          originName: f.originName, 
          mimeType: f.mimeType, 
          createdDate: f.createdDate 
        })));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [backendThreadId, onFilesUpdate]);

  // ESC 키로 drawer 닫기
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  // 외부 클릭으로 drawer 닫기
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDrawerOpen) {
        const target = e.target as Element;
        if (!target.closest('[data-drawer-container]')) {
          closeDrawer();
        }
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDrawerOpen]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsImageModalOpen(false);
    document.body.style.overflow = 'auto';
    window.scrollTo(0, savedScrollPositionRef.current);
  };

  const openImageModal = (src: string, alt: string) => {
    setSelectedImage({ src, alt });
    savedScrollPositionRef.current = window.scrollY;
    setIsDrawerMounted(true);
    requestAnimationFrame(() => setIsDrawerOpen(true));
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const getFileIconStyle = (originName: string) => {
    const ext = String(originName || "").split('.').pop()?.toLowerCase();
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
  };

  return (
    <Box position="relative" flex={1} style={{ overflowX: 'hidden', ...(isImageModalOpen ? { overflowY: 'hidden' } : {}) }}>
      <VStack align="stretch" gap={0} flex={1} overflowY={isImageModalOpen ? "hidden" : "auto"} py={2} style={{ overflowX: 'hidden' }}>
        {threadFiles.length === 0 && (
          <Box px={2} py={6}>
            <Text color={colors.text.muted}>표시할 파일이 없습니다.</Text>
          </Box>
        )}
        
        {threadFiles.map(f => {
          const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
          const downloadUrl = `${api}/cms/file/public/download/${f.fileId}`;
          const viewUrl = `${api}/cms/file/public/view/${f.fileId}`;
          const isImage = (f.mimeType || "").startsWith("image/");
          const iconStyle = getFileIconStyle(f.originName);
          
          return (
            <HStack key={f.fileId} px={2} py={3} borderBottomWidth="1px" align="center">
              <HStack 
                flex={1} 
                cursor={isImage ? "pointer" : "default"}
                onClick={isImage ? () => openImageModal(downloadUrl, f.originName) : undefined}
                _hover={isImage ? { bg: "gray.50" } : {}}
                borderRadius="md"
                px={2}
                py={1}
              >
                {isImage ? (
                  <Box w="32px" h="32px" borderRadius="md" overflow="hidden" flexShrink={0} bg="gray.100">
                    <Image
                      src={viewUrl}
                      alt={f.originName}
                      width="32px"
                      height="32px"
                      style={{ display: 'block', objectFit: 'cover', width: '32px', height: '32px' }}
                    />
                  </Box>
                ) : (
                  <Box w="32px" h="32px" borderRadius="md" flexShrink={0} bg={iconStyle.bg} display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="10px" fontWeight="bold" color={iconStyle.color as any}>
                      {iconStyle.label}
                    </Text>
                  </Box>
                )}
                <Box>
                  <Text fontWeight="medium">{f.originName}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {f.createdDate ? new Date(f.createdDate).toLocaleString() : ""}
                  </Text>
                </Box>
              </HStack>
              
              <Box w="40px" display="flex" justifyContent="center">
                <a href={downloadUrl} target="_blank" rel="noreferrer">
                  <IconButton aria-label="다운로드" size="xs" variant="ghost">
                    <LuDownload size={16} />
                  </IconButton>
                </a>
              </Box>
            </HStack>
          );
        })}
      </VStack>
      
      {/* 이미지 미리보기 Drawer */}
      {isDrawerMounted && (
        <Box
          position="fixed"
          top={0}
          right={0}
          bottom={0}
          left={0}
          bg="gray.50"
          zIndex={1000}
          display="flex"
          flexDirection="column"
          transform={isDrawerOpen ? "translateX(0)" : "translateX(100%)"}
          transition="transform 0.3s ease-in-out"
          onTransitionEnd={() => { 
            if (!isDrawerOpen) { 
              setIsDrawerMounted(false); 
              setSelectedImage(null);
              window.scrollTo(0, savedScrollPositionRef.current);
            } 
          }}
          overflow="hidden"
          data-drawer-container
          onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onScroll={(e) => { e.preventDefault(); e.stopPropagation(); }}
          style={{ 
            overscrollBehavior: 'none',
            overflowX: 'hidden',
            overflowY: 'hidden'
          } as React.CSSProperties}
        >
          {/* 배경 클릭으로 닫기 */}
          <Box
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            onClick={closeDrawer}
            zIndex={-1}
          />
          
          {/* 헤더 */}
          <Box
            p={4}
            borderBottomWidth="1px"
            borderColor="gray.200"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            flexShrink={0}
            boxShadow="sm"
            zIndex={1}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              position="absolute"
              left={4}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={closeDrawer}
              borderRadius="full"
              w="32px"
              h="32px"
              p={0}
              _hover={{ bg: "gray.200" }}
            >
              <Image
                src="/images/icons/arrow.png"
                alt="닫기"
                width="8"
                height="8"
                style={{
                  filter: "brightness(0) saturate(100%) invert(27%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(100%) contrast(100%)",
                  transform: "rotate(180deg)"
                }}
              />
            </IconButton>
            
            <Text
              fontWeight="semibold"
              fontSize="md"
              color="gray.800"
              textAlign="center"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxW="calc(100% - 80px)"
            >
              {selectedImage?.alt}
            </Text>
          </Box>
          
          {/* 이미지 영역 */}
          <Box 
            flex={1} 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            overflow="hidden"
            bg="transparent"
            p={0}
            position="relative"
            w="100%"
            h="100%"
            maxW="100%"
            maxH="100%"
            zIndex={1}
            onClick={closeDrawer}
            cursor="pointer"
            onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onScroll={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{ 
              overflowX: 'hidden',
              overflowY: 'hidden',
              maxWidth: '100%',
              maxHeight: '100%'
            } as React.CSSProperties}
          >
            {selectedImage && (
              <Box
                w="100%"
                h="100%"
                maxW="100%"
                maxH="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
                p={4}
                style={{ 
                  overflowX: 'hidden',
                  overflowY: 'hidden',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  maxW="100%"
                  maxH="100%"
                  w="auto"
                  h="auto"
                  objectFit="contain"
                  draggable={false}
                  borderRadius="md"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
