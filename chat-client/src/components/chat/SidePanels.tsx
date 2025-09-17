"use client";

import React from "react";
import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import { chatApi } from "@/lib/api/chat";

type Props = {
  selectedChannelId?: number | null;
  onSelectChannel: (id: number) => void;
  selectedThreadId?: number | null;
  onSelectThread: (id: number) => void;
  showThreads?: boolean;
};

export function SidePanels({ selectedChannelId, onSelectChannel, selectedThreadId, onSelectThread, showThreads = true }: Props) {
  const [channels, setChannels] = React.useState<Array<{ id: number; cmsCode: string; cmsName?: string }>>([]);
  const [threads, setThreads] = React.useState<Array<{ id: number; channelId: number; userIdentifier: string; userName?: string }>>([]);
  const [internalChannelId, setInternalChannelId] = React.useState<number | null>(selectedChannelId ?? null);

  // 외부 selectedChannelId 변화에 동기화
  React.useEffect(() => {
    if (selectedChannelId && selectedChannelId !== internalChannelId) {
      setInternalChannelId(selectedChannelId);
    }
  }, [selectedChannelId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await chatApi.getChannels();
        if (mounted) {
          setChannels(list || []);
          // 채널이 아직 선택되지 않았다면 첫 채널 자동 선택
          if ((!internalChannelId || internalChannelId <= 0) && list && list.length > 0) {
            const firstId = list[0].id;
            setInternalChannelId(firstId);
            try { onSelectChannel(firstId); } catch {}
          }
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    const chanId = selectedChannelId ?? internalChannelId;
    if (!chanId) return;
    let mounted = true;
    (async () => {
      try {
        const list = await chatApi.getThreadsByChannel(chanId);
        if (mounted) {
          setThreads(list || []);
          // 스레드 미선택 시 첫 스레드 자동 선택
          if ((!selectedThreadId || selectedThreadId <= 0) && list && list.length > 0) {
            try { onSelectThread(list[0].id); } catch {}
          }
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [selectedChannelId, internalChannelId]);

  return (
    <VStack align="stretch" gap={2} px={2} py={2}>
      <Text fontSize="sm" color="gray.500">업체</Text>
      {channels.map((ch) => (
        <Box
          key={ch.id}
          px={3}
          py={2}
          borderRadius="md"
          bg={(selectedChannelId ?? internalChannelId) === ch.id ? "gray.100" : "transparent"}
          _hover={{ bg: "gray.100" }}
          cursor="pointer"
          onClick={() => { setInternalChannelId(ch.id); onSelectChannel(ch.id); }}
        >
          <Text fontWeight="medium">{ch.cmsName || ch.cmsCode}</Text>
          <Text fontSize="xs" color="gray.500">code: {ch.cmsCode}</Text>
        </Box>
      ))}

      {showThreads && (
        <Box pt={2}>
          <Text fontSize="sm" color="gray.500">대화(스레드)</Text>
          <VStack align="stretch" gap={1} mt={1}>
            {threads.map((th) => (
              <Box
                key={th.id}
                px={3}
                py={2}
                borderRadius="md"
                bg={selectedThreadId === th.id ? "gray.100" : "transparent"}
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                onClick={() => onSelectThread(th.id)}
              >
                <HStack justify="space-between">
                  <Text fontWeight="medium">{th.userName || th.userIdentifier}</Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}


