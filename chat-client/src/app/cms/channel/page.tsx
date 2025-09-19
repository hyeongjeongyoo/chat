"use client";

import React from "react";
import { Box, Flex, Heading, Button, HStack, VStack, Input, Text, Badge, IconButton, Tabs, Checkbox } from "@chakra-ui/react";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { chatApi } from "@/lib/api/chat";
import { LuPencil, LuSave, LuTrash2, LuPlus, LuCopy, LuRefreshCw, LuDownload, LuMessageCircle } from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

export default function ChannelManagementPage() {
  const colors = useColors();
  const router = useRouter();
  const [channels, setChannels] = React.useState<Array<{ id: number; cmsCode: string; cmsName?: string; ownerUserUuid?: string }>>([]);
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [ownerUuid, setOwnerUuid] = React.useState("");
  const [generatedUuid, setGeneratedUuid] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [presetInput, setPresetInput] = React.useState("");
  const [presetsByChannel, setPresetsByChannel] = React.useState<Record<number, string[]>>({});
  const [settingsByChannel, setSettingsByChannel] = React.useState<Record<number, { allowAnonymous: boolean; autoCreateThread: boolean; retentionDays: number }>>({});
  const [initUserIdentifier, setInitUserIdentifier] = React.useState("");
  const [initUserName, setInitUserName] = React.useState("");
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ channelId: number; threads: any[] } | null>(null);
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = React.useState<{ channelId: number; threadId: number; customerName: string } | null>(null);
  const [confirmDeleteChannel, setConfirmDeleteChannel] = React.useState<number | null>(null);
  const [channelThreads, setChannelThreads] = React.useState<Record<number, Array<{ id: number; userIdentifier: string; userName?: string }>>>({});
  const [addingCustomer, setAddingCustomer] = React.useState<number | null>(null);
  const [newCustomerIdentifier, setNewCustomerIdentifier] = React.useState("");
  const [newCustomerName, setNewCustomerName] = React.useState("");

  // UUID 생성 함수
  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 채널코드 자동 생성 함수
  const generateChannelCode = () => {
    const prefix = 'CH';
    const timestamp = Date.now().toString().slice(-6); // 마지막 6자리
    const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3자리 랜덤
    return `${prefix}${timestamp}${random}`;
  };

  // 고객 식별자 자동 생성 함수
  const generateCustomerIdentifier = () => {
    const prefix = 'CUST';
    const timestamp = Date.now().toString().slice(-6); // 마지막 6자리
    const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3자리 랜덤
    return `${prefix}${timestamp}${random}`;
  };

  // UUID 복사 함수
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toaster.create({ title: "UUID가 클립보드에 복사되었습니다.", type: "success" });
    } catch {
      toaster.create({ title: "복사에 실패했습니다.", type: "error" });
    }
  };

  // 고객 추가 함수
  const addCustomerToChannel = async (channelId: number) => {
    if (!newCustomerIdentifier.trim()) {
      toaster.create({ title: "고객 식별자를 입력해주세요.", type: "error" });
      return;
    }

    try {
      const newThread = await chatApi.createOrGetThread({
        channelId,
        userIdentifier: newCustomerIdentifier.trim(),
        userName: newCustomerName.trim() || undefined,
        actor: "admin"
      });

      // 스레드 목록 업데이트
      setChannelThreads(prev => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), newThread]
      }));

      setNewCustomerIdentifier("");
      setNewCustomerName("");
      setAddingCustomer(null);
      
      toaster.create({ 
        title: "고객이 추가되었습니다.", 
        description: `${newThread.userName || newThread.userIdentifier}님이 채널에 연결되었습니다.`,
        type: "success" 
      });
    } catch (error: any) {
      toaster.create({ 
        title: "고객 추가에 실패했습니다.", 
        description: error?.message || "알 수 없는 오류가 발생했습니다.",
        type: "error" 
      });
    }
  };

  // 고객 삭제 확인 함수
  const showDeleteCustomerConfirm = (channelId: number, threadId: number, customerName: string) => {
    setConfirmDeleteCustomer({ channelId, threadId, customerName });
  };

  // 고객 삭제 함수
  const removeCustomerFromChannel = async (channelId: number, threadId: number, customerName: string) => {
    try {
      await chatApi.deleteThread(threadId);
      
      // 스레드 목록에서 제거
      setChannelThreads(prev => ({
        ...prev,
        [channelId]: (prev[channelId] || []).filter(thread => thread.id !== threadId)
      }));
      
      toaster.create({ 
        title: "고객이 삭제되었습니다.", 
        description: `${customerName}님이 채널에서 제거되었습니다.`,
        type: "success" 
      });
    } catch (error: any) {
      toaster.create({ 
        title: "고객 삭제에 실패했습니다.", 
        description: error?.message || "알 수 없는 오류가 발생했습니다.",
        type: "error" 
      });
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const list = await chatApi.getChannels();
        setChannels(list || []);
        if ((list || []).length > 0) setSelectedId(list[0].id);
        
        // 각 채널별 스레드 목록도 함께 로드
        if (list && list.length > 0) {
          const threadsData: Record<number, Array<{ id: number; userIdentifier: string; userName?: string }>> = {};
          for (const channel of list) {
            try {
              const threads = await chatApi.getThreadsByChannel(channel.id);
              threadsData[channel.id] = threads || [];
            } catch {
              threadsData[channel.id] = [];
            }
          }
          setChannelThreads(threadsData);
        }
      } catch {}
    })();
  }, []);

  const create = async (): Promise<{ id: number; cmsCode: string; cmsName?: string; ownerUserUuid?: string } | undefined> => {
    // 필수 필드 검증
    if (!code.trim()) {
      toaster.create({ title: "채널 코드를 입력해주세요.", type: "error" });
      return;
    }
    if (!name.trim()) {
      toaster.create({ title: "채널 이름을 입력해주세요.", type: "error" });
      return;
    }
    if (!ownerUuid.trim()) {
      toaster.create({ title: "소유자 USER UUID를 입력해주세요.", type: "error" });
      return;
    }
    
    try {
      const saved = await chatApi.createOrGetChannel({ 
        cmsCode: code.trim(), 
        cmsName: name.trim(), 
        ownerUserUuid: ownerUuid.trim(),
        actor: "admin" 
      });
      
      setChannels(prev => {
        const exists = prev.some(c => c.id === (saved as any).id);
        return exists ? prev : [...prev, { ...saved as any, ownerUserUuid: ownerUuid.trim() }];
      });
      setCode(""); setName("");
      return { ...saved as any, ownerUserUuid: ownerUuid.trim() };
    } catch { return undefined; }
  };

  const layout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    { id: "create", x: 0, y: 1, w: 4, h: 11, title: "채널 생성", subtitle: "새 채널 추가" },
    { id: "list", x: 4, y: 1, w: 8, h: 11, title: "채널 목록", subtitle: "관리 및 설정" },
  ];

  return (
    <Box bg={colors.bg} minH="100vh" w="full" position="relative">
      <GridSection initialLayout={layout}>
        <Flex justify="space-between" align="center" h="36px">
          <Flex align="center" gap={2} px={2}>
            <Heading size="lg" color={colors.text.primary}>채널 관리</Heading>
            <Badge bg={colors.secondary.light} color={colors.secondary.default} px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="bold">관리자</Badge>
          </Flex>
        </Flex>

        {/* 채널 생성 폼 */}
        <VStack align="stretch" gap={4} px={2} py={2}>
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="bold" color={colors.text.primary}>기본 정보</Text>
            <VStack align="stretch" gap={2}>
              <HStack gap={2}>
                <Input 
                  placeholder="채널 코드 (필수)" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  size="sm"
                  flex={1}
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCode(generateChannelCode())}
                >
                  <LuRefreshCw size={14} />
                  자동생성
                </Button>
              </HStack>
              <Input
                placeholder="채널 이름 (필수)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="sm"
                required
              />
              <HStack gap={2}>
                <Input
                  placeholder="소유자 USER UUID (필수)"
                  value={ownerUuid}
                  onChange={(e) => setOwnerUuid(e.target.value)}
                  size="sm"
                  flex={1}
                  required
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newUuid = generateUuid();
                    setOwnerUuid(newUuid);
                  }}
                >
                  <LuRefreshCw size={14} />
                  UUID 생성
                </Button>
                {ownerUuid && (
                  <IconButton 
                    aria-label="UUID 복사" 
                    size="sm" 
                    variant="outline"
                    colorPalette="blue"
                    onClick={() => copyToClipboard(ownerUuid)}
                  >
                    <LuCopy size={14} />
                  </IconButton>
                )}
              </HStack>
            </VStack>
          </VStack>

          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="bold" color={colors.text.primary}>초기 고객 설정</Text>
            <VStack align="stretch" gap={2}>
              <HStack gap={2}>
                <Input 
                  placeholder="고객 식별자" 
                  value={initUserIdentifier} 
                  onChange={(e) => setInitUserIdentifier(e.target.value)}
                  size="sm"
                  flex={1}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInitUserIdentifier(generateCustomerIdentifier())}
                >
                  <LuRefreshCw size={14} />
                  자동생성
                </Button>
              </HStack>
              <Input
                placeholder="고객명"
                value={initUserName}
                onChange={(e) => setInitUserName(e.target.value)}
                size="sm"
              />
            </VStack>
          </VStack>

          <Button
            disabled={!code.trim() || !name.trim() || !ownerUuid.trim()}
            onClick={async () => {
              const created = await create();
              if (!created) return;
              
              try {
                // 초기 고객 스레드 생성
                if (initUserIdentifier.trim()) {
                  try {
                    const newThread = await chatApi.createOrGetThread({
                      channelId: created.id,
                      userIdentifier: initUserIdentifier.trim(),
                      userName: initUserName.trim() || undefined,
                      actor: "admin"
                    });
                    
                    // 스레드 목록 업데이트
                    setChannelThreads(prev => ({
                      ...prev,
                      [created.id]: [newThread]
                    }));
                    
                    // 환영 메시지가 생성되었음을 알리는 토스트
                    // 채널 생성 성공 토스트
                    toaster.create({
                      title: "채널이 생성되었습니다.",
                      description: `채널명: ${created.cmsName || created.cmsCode}`,
                      type: "success"
                    });
                    
                  } catch (threadError: any) {
                    toaster.create({
                      title: "채널은 생성되었지만 초기 고객 생성에 실패했습니다.",
                      description: threadError?.message || "알 수 없는 오류가 발생했습니다.",
                      type: "warning"
                    });
                  }
                } else {
                  toaster.create({
                    title: "채널을 생성했습니다.",
                    description: `UUID: ${created.ownerUserUuid}`,
                    type: "success"
                  });
                }
              } catch (error: any) {
                toaster.create({
                  title: "채널 생성에 실패했습니다.",
                  description: error?.message || "알 수 없는 오류가 발생했습니다.",
                  type: "error"
                });
              }
              
              // 입력값 초기화
              setInitUserIdentifier("");
              setInitUserName("");
              setOwnerUuid("");
            }}
            colorPalette="blue"
            size="sm"
          >
            채널 생성
          </Button>
        </VStack>

        {/* 채널 목록 */}
        <VStack align="stretch" gap={2} px={2} py={2} overflowY="auto">
          {channels.length === 0 ? (
            <Box py={8} textAlign="center">
              <Text color="gray.500" fontSize="sm">등록된 채널이 없습니다.</Text>
              <Text color="gray.400" fontSize="xs" mt={1}>왼쪽 폼에서 새 채널을 생성하세요.</Text>
            </Box>
          ) : (
            channels.map(c => (
              <Box 
                key={c.id} 
                p={3} 
                borderWidth="1px" 
                borderColor={selectedId === c.id ? "blue.200" : "gray.200"}
                borderRadius="md" 
                bg={selectedId === c.id ? "blue.50" : "white"}
                cursor="pointer"
                onClick={() => setSelectedId(c.id)}
                _hover={{ borderColor: "blue.300", bg: selectedId === c.id ? "blue.50" : "gray.50" }}
                position="relative"
              >
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <HStack>
                        <Text fontWeight="bold" fontSize="sm">{c.cmsCode}</Text>
                        {editingId === c.id ? (
                          <Input 
                            size="xs" 
                            value={c.cmsName || ""} 
                            onChange={(e) => setChannels(prev => prev.map(x => x.id === c.id ? { ...x, cmsName: e.target.value } : x))}
                            w="120px"
                          />
                        ) : (
                          <Text color="gray.600" fontSize="sm">{c.cmsName || "이름 없음"}</Text>
                        )}
                      </HStack>
                      {c.ownerUserUuid && (
                        <HStack gap={2} align="center">
                          <Text fontSize="xs" color="gray.500" fontFamily="mono">
                            UUID: {c.ownerUserUuid}
                          </Text>
                          <IconButton
                            aria-label="UUID 복사"
                            size="xs"
                            variant="ghost"
                            colorPalette="gray"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(c.ownerUserUuid!);
                              toaster.create({
                                title: "UUID가 복사되었습니다.",
                                type: "success",
                                duration: 2000
                              });
                            }}
                          >
                            <LuCopy size={10} />
                          </IconButton>
                        </HStack>
                      )}
                      <VStack align="start" gap={1} mt={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="xs" color="blue.600" fontWeight="bold">
                            연결된 고객 ({channelThreads[c.id]?.length || 0}명)
                          </Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorPalette="blue"
                            onClick={() => {
                              if (addingCustomer === c.id) {
                                // 폼 닫기
                                setAddingCustomer(null);
                                setNewCustomerIdentifier("");
                                setNewCustomerName("");
                              } else {
                                // 폼 열기 및 입력값 초기화
                                setAddingCustomer(c.id);
                                setNewCustomerIdentifier("");
                                setNewCustomerName("");
                              }
                            }}
                          >
                            <LuPlus size={10} />
                            고객 추가
                          </Button>
                        </HStack>
                        
                        {addingCustomer === c.id && (
                          <VStack align="stretch" gap={1} p={2} bg="gray.50" borderRadius="md" w="full">
                            <HStack gap={1}>
                              <Input
                                placeholder="고객 식별자"
                                value={newCustomerIdentifier}
                                onChange={(e) => setNewCustomerIdentifier(e.target.value)}
                                size="xs"
                                flex={1}
                              />
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setNewCustomerIdentifier(generateCustomerIdentifier())}
                              >
                                <LuRefreshCw size={10} />
                                자동생성
                              </Button>
                            </HStack>
                            <Input
                              placeholder="고객명 (선택)"
                              value={newCustomerName}
                              onChange={(e) => setNewCustomerName(e.target.value)}
                              size="xs"
                            />
                            <HStack gap={1}>
                              <Button
                                size="xs"
                                colorPalette="blue"
                                onClick={() => addCustomerToChannel(c.id)}
                                disabled={!newCustomerIdentifier.trim()}
                              >
                                추가
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => {
                                  setAddingCustomer(null);
                                  setNewCustomerIdentifier("");
                                  setNewCustomerName("");
                                }}
                              >
                                취소
                              </Button>
                            </HStack>
                          </VStack>
                        )}
                        
                        {channelThreads[c.id] && channelThreads[c.id].length > 0 && (
                          <VStack align="start" gap={1}>
                            {channelThreads[c.id].slice(0, 3).map((thread) => (
                              <HStack key={thread.id} justify="space-between" w="full" ml={2}>
                                <Text fontSize="xs" color="gray.600">
                                  • {thread.userName || thread.userIdentifier}
                                </Text>
                                <IconButton
                                  aria-label="고객 삭제"
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showDeleteCustomerConfirm(c.id, thread.id, thread.userName || thread.userIdentifier);
                                  }}
                                >
                                  <LuTrash2 size={8} />
                                </IconButton>
                              </HStack>
                            ))}
                            {channelThreads[c.id].length > 3 && (
                              <Text fontSize="xs" color="gray.400" ml={2}>
                                ... 외 {channelThreads[c.id].length - 3}명
                              </Text>
                            )}
                          </VStack>
                        )}
                      </VStack>
                    </VStack>
                    
                    <HStack gap={1}>
                      {editingId === c.id ? (
                        <IconButton 
                          aria-label="저장" 
                          size="xs" 
                          colorPalette="green"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try { 
                              await chatApi.updateChannel(c.id, { cmsName: c.cmsName }); 
                              setEditingId(null); 
                              toaster.create({ title: "저장되었습니다.", type: "success" });
                            } catch {
                              toaster.create({ title: "저장에 실패했습니다.", type: "error" });
                            }
                          }}
                        >
                          <LuSave size={12} />
                        </IconButton>
                      ) : (
                        <IconButton 
                          aria-label="수정" 
                          size="xs" 
                          variant="ghost"
                          colorPalette="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(c.id);
                          }}
                        >
                          <LuPencil size={12} />
                        </IconButton>
                      )}
                      
                      <IconButton 
                        aria-label="삭제" 
                        size="xs" 
                        variant="ghost"
                        colorPalette="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          // 연결된 고객이 있는지 확인
                          const hasCustomers = channelThreads[c.id] && channelThreads[c.id].length > 0;
                          
                          if (hasCustomers) {
                            // 고객이 있는 경우: 바로 강제 삭제 모달 표시
                            setDeleteConfirm({
                              channelId: c.id,
                              threads: channelThreads[c.id]
                            });
                          } else {
                            // 고객이 없는 경우: 간단한 확인 모달 표시
                            setConfirmDeleteChannel(c.id);
                          }
                        }}
                      >
                        <LuTrash2 size={12} />
                      </IconButton>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            ))
          )}
        </VStack>
      </GridSection>
      
      {/* 채널 삭제 확인 모달 */}
      {confirmDeleteChannel && (
        <Box position="fixed" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.4)" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg={colors.cardBg} borderColor={colors.border} borderWidth="1px" borderRadius="md" p={4} w="320px">
            <Text fontWeight="bold" mb={2}>채널을 삭제하시겠습니까?</Text>
            <Text fontSize="sm" color={colors.text.muted} mb={4}>
              채널을 삭제합니다. 삭제 후 되돌릴 수 없습니다.
            </Text>
            <HStack justify="flex-end">
              <Button variant="outline" onClick={() => setConfirmDeleteChannel(null)}>취소</Button>
              <Button 
                colorPalette="red" 
                onClick={async () => { 
                  try {
                    await chatApi.deleteChannel(confirmDeleteChannel);
                    setChannels(prev => prev.filter(x => x.id !== confirmDeleteChannel));
                    if (selectedId === confirmDeleteChannel) setSelectedId(null);
                    setConfirmDeleteChannel(null);
                    toaster.create({ title: "삭제되었습니다.", type: "success" });
                  } catch (e: any) {
                    // 삭제 실패 시 에러 토스트 표시
                    toaster.create({ title: e?.message || "삭제할 수 없습니다.", type: "error" });
                  }
                }}
              >
                삭제
              </Button>
            </HStack>
          </Box>
        </Box>
      )}

      {/* 고객 삭제 확인 모달 */}
      {confirmDeleteCustomer && (
        <Box position="fixed" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.4)" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg={colors.cardBg} borderColor={colors.border} borderWidth="1px" borderRadius="md" p={4} w="320px">
            <Text fontWeight="bold" mb={2}>고객을 삭제할까요?</Text>
            <Text fontSize="sm" color={colors.text.muted} mb={4}>
              {confirmDeleteCustomer.customerName}님을 채널에서 삭제합니다. 삭제 후 복구할 수 없습니다.
            </Text>
            <HStack justify="flex-end">
              <Button variant="outline" onClick={() => setConfirmDeleteCustomer(null)}>취소</Button>
              <Button 
                colorPalette="red" 
                onClick={async () => { 
                  await removeCustomerFromChannel(confirmDeleteCustomer.channelId, confirmDeleteCustomer.threadId, confirmDeleteCustomer.customerName); 
                  setConfirmDeleteCustomer(null); 
                }}
              >
                삭제
              </Button>
            </HStack>
          </Box>
        </Box>
      )}

      {/* 채널 삭제 확인 모달 */}
      {deleteConfirm && (
        <Box position="fixed" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.4)" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg={colors.cardBg} borderColor={colors.border} borderWidth="1px" borderRadius="md" p={6} w="600px" maxH="80vh" overflowY="auto">
            <Text fontWeight="bold" mb={4} fontSize="lg">채널 삭제 확인</Text>
            <Text mb={4} color={colors.text.muted}>
              이 채널에는 {deleteConfirm.threads.length}개의 대화 스레드가 연결되어 있습니다.
            </Text>
            
            <Box mb={4} maxH="300px" overflowY="auto" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={3}>
              <Text fontWeight="bold" mb={2}>연결된 스레드 목록:</Text>
              {deleteConfirm.threads.map((thread: any) => (
                <Box key={thread.id} p={2} borderBottomWidth="1px" borderColor="gray.100">
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="medium">{thread.userName || thread.userIdentifier}</Text>
                      <Text fontSize="xs" color="gray.500">
                        생성: {new Date(thread.createdAt).toLocaleString()}
                      </Text>
                    </VStack>
                    <Text fontSize="xs" color="gray.500">ID: {thread.id}</Text>
                  </HStack>
                </Box>
              ))}
            </Box>
            
            <Text mb={4} color="red.600" fontSize="sm">
              ⚠️ 채널을 삭제하면 연결된 모든 스레드와 메시지가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </Text>
            
            <HStack justify="flex-end" gap={3}>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                취소
              </Button>
              <Button 
                colorPalette="red" 
                onClick={async () => {
                  try {
                    await chatApi.deleteChannel(deleteConfirm.channelId, true);
                    setChannels(prev => prev.filter(x => x.id !== deleteConfirm.channelId));
                    if (selectedId === deleteConfirm.channelId) setSelectedId(null);
                    setDeleteConfirm(null);
                    toaster.create({ title: "채널과 연결된 스레드가 모두 삭제되었습니다.", type: "success" });
                  } catch (e: any) {
                    toaster.create({ title: e?.message || "삭제에 실패했습니다.", type: "error" });
                  }
                }}
              >
                강제 삭제
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}