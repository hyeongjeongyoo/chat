"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ChatNotificationContextType {
  totalUnreadCount: number;
  updateTotalUnreadCount: (count: number) => void;
  incrementTotalUnreadCount: () => void;
  resetTotalUnreadCount: () => void;
}

const ChatNotificationContext = createContext<ChatNotificationContextType | undefined>(undefined);

export function ChatNotificationProvider({ children }: { children: React.ReactNode }) {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const updateTotalUnreadCount = useCallback((count: number) => {
    setTotalUnreadCount(count);
  }, []);

  const incrementTotalUnreadCount = useCallback(() => {
    setTotalUnreadCount(prev => prev + 1);
  }, []);

  const resetTotalUnreadCount = useCallback(() => {
    setTotalUnreadCount(0);
  }, []);

  return (
    <ChatNotificationContext.Provider
      value={{
        totalUnreadCount,
        updateTotalUnreadCount,
        incrementTotalUnreadCount,
        resetTotalUnreadCount,
      }}
    >
      {children}
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotification() {
  const context = useContext(ChatNotificationContext);
  if (context === undefined) {
    throw new Error("useChatNotification must be used within a ChatNotificationProvider");
  }
  return context;
}

