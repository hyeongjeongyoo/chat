"use client";

import { RecoilRoot } from "recoil";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

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
        <AuthInitializer />
        <ChakraProvider value={defaultSystem}>
          <ColorModeProvider>{children}</ColorModeProvider>
        </ChakraProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </RecoilRoot>
  );
}
