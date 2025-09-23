"use client";

import { RecoilRoot } from "recoil";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useState } from "react";
import dynamic from "next/dynamic";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then(mod => ({ default: mod.ReactQueryDevtools })),
  { ssr: false }
);
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { ChatNotificationProvider } from "@/contexts/ChatNotificationContext";
import { GlobalChatServiceProvider } from "@/services/GlobalChatService";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: 1,
          },
        },
      })
  );

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ChatNotificationProvider>
          <GlobalChatServiceProvider>
            <AuthInitializer />
            <ChakraProvider value={defaultSystem}>
              <ColorModeProvider>{children}</ColorModeProvider>
            </ChakraProvider>
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </GlobalChatServiceProvider>
        </ChatNotificationProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
