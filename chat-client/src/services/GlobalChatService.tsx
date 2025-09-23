"use client";

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { ChatStompClient } from '@/lib/ws/chatSocket';
import { useChatNotification } from '@/contexts/ChatNotificationContext';
import { toaster } from '@/components/ui/toaster';
import { getToken } from '@/lib/auth-utils';

// 🔥 NEW: 현재 선택된 채널 ID를 가져오는 함수
function getCurrentSelectedChannelId(): number | null {
  try {
    // URL에서 channelId 파라미터 확인
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const channelId = urlParams.get('channelId');
      if (channelId) {
        return parseInt(channelId, 10);
      }
      
      // sessionStorage에서 selectedChannelId 확인
      const storedChannelId = sessionStorage.getItem('selectedChannelId');
      if (storedChannelId) {
        return parseInt(storedChannelId, 10);
      }
    }
  } catch (error) {
    console.error("🌐 [전역서비스] 현재 채널 ID 가져오기 실패:", error);
  }
  return null;
}

interface GlobalChatServiceContextType {
  isConnected: boolean;
}

const GlobalChatServiceContext = createContext<GlobalChatServiceContextType>({
  isConnected: false
});

export function GlobalChatServiceProvider({ children }: { children: React.ReactNode }) {
  const globalStompRef = useRef<ChatStompClient | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const { incrementTotalUnreadCount, updateTotalUnreadCount } = useChatNotification();
  const subscribedChannelsRef = useRef<Set<number>>(new Set());

  // 전역 WebSocket 연결 초기화 (토큰 확인 후)
  useEffect(() => {
    const initializeGlobalService = async () => {
      // 토큰이 있을 때만 연결 시작
      const token = getToken();
      if (!token) {
        setTimeout(initializeGlobalService, 1000); // 1초 후 재시도
        return;
      }

      
      if (!globalStompRef.current) {
        const client = new ChatStompClient();
        // 임시 스레드 ID로 연결 (전역 구독용)
        client.connect(1, () => {}, () => {
          setIsConnected(true);
          
          // 모든 채널 구독 시작
          subscribeToAllChannels();
        });
        globalStompRef.current = client;
      }
    };

    initializeGlobalService();

    return () => {
      if (globalStompRef.current) {
        globalStompRef.current.disconnect();
        globalStompRef.current = null;
        setIsConnected(false);
      }
    };
  }, []);

  // 정기적으로 전역 뱃지 업데이트 (5초마다)
  useEffect(() => {
    const updateGlobalBadge = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/api/v1/cms/chat/channels`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const channels = await response.json();
          const channelArray = Array.isArray(channels) 
            ? channels 
            : (channels?.data || channels?.content || []);
          
          const totalUnread = channelArray.reduce((sum: number, channel: any) => {
            return sum + (channel.unreadCount || 0);
          }, 0);
          
          updateTotalUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error("🌐 [전역서비스] 뱃지 업데이트 실패:", error);
      }
    };

    // 즉시 한 번 실행
    updateGlobalBadge();
    
    // 5초마다 실행
    const interval = setInterval(updateGlobalBadge, 5000);
    
    return () => clearInterval(interval);
  }, [updateTotalUnreadCount]);

  // 모든 채널 구독
  const subscribeToAllChannels = async () => {
    try {
      // 채널 목록 조회
      const token = getToken();
      if (!token) {
        return;
      }

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/v1/cms/chat/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const channels = await response.json();
        // 배열인지 확인 후 처리 (API 응답이 {success: true, data: [...]} 형태일 수 있음)
        const channelArray = Array.isArray(channels) 
          ? channels 
          : (channels?.data || channels?.content || []);
        
        // 각 채널을 개별적으로 구독
        if (Array.isArray(channelArray) && channelArray.length > 0) {
          channelArray.forEach((channel: any) => {
            if (channel?.id && channel?.cmsName) {
              subscribeToChannel(channel.id, channel.cmsName);
            }
          });
        }
      }
    } catch (error) {
      console.error("🌐 [전역서비스] 채널 목록 조회 실패:", error);
    }
  };

  // 개별 채널 구독
  const subscribeToChannel = (channelId: number, channelName: string) => {
    if (!globalStompRef.current?.client?.connected) {
      return;
    }

    if (subscribedChannelsRef.current.has(channelId)) {
      return;
    }
    
    try {
      globalStompRef.current.subscribeToChannel(channelId, (channelMsg) => {
        
        if (!channelMsg) return;
        
        const messageSender = (channelMsg as any).senderType;
        const messageUserName = (channelMsg as any).userName || (channelMsg as any).userIdentifier || "알 수 없는 사용자";
        
        const messageChannelId = (channelMsg as any).channelId || channelId;
        const cmsName = (channelMsg as any).cmsName || channelName;
        
        // ADMIN 메시지는 알림 없음
        if (messageSender === "ADMIN") {
          return;
        }
        
        // 현재 페이지 확인
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isInChatPage = currentPath === "/cms/chat";
        
        // 🔥 NEW: 전역 알림 처리 로직 개선
        // 채팅 페이지인 경우 현재 선택된 채널과 비교
        if (isInChatPage) {
          // 채팅 페이지에서는 다른 채널 메시지만 토스트
          const selectedChannelId = getCurrentSelectedChannelId(); // 현재 선택된 채널 ID 가져오기
          const isDifferentChannel = messageChannelId !== selectedChannelId;
          
          if (isDifferentChannel) {
            incrementTotalUnreadCount();
            
            try {
              toaster.create({
                title: `${cmsName} - ${messageUserName}님의 새 메시지`,
                type: "info",
                description: "다른 채널에서 새 메시지가 도착했습니다."
              });
            } catch (toastError) {
              console.error("🌐 [전역서비스] 토스트 표시 실패:", toastError);
            }
          }
        } else {
          // 다른 페이지에서는 모든 메시지에 대해 토스트
          incrementTotalUnreadCount();
          
          try {
            toaster.create({
              title: `${cmsName} - ${messageUserName}님의 새 메시지`,
              type: "info",
              description: "새 메시지가 도착했습니다."
            });
          } catch (toastError) {
            console.error("🌐 [전역서비스] 토스트 표시 실패:", toastError);
          }
        }
      });
      
      subscribedChannelsRef.current.add(channelId);
    } catch (error) {
      console.error("🌐 [전역서비스] 채널 구독 실패:", channelId, error);
    }
  };

  return (
    <GlobalChatServiceContext.Provider value={{ isConnected }}>
      {children}
    </GlobalChatServiceContext.Provider>
  );
}

export function useGlobalChatService() {
  const context = useContext(GlobalChatServiceContext);
  if (!context) {
    throw new Error('useGlobalChatService must be used within GlobalChatServiceProvider');
  }
  return context;
}
