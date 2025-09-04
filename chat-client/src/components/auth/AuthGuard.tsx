"use client";

import React, { useEffect, ReactNode } from "react";
import { useRecoilValue } from "recoil";
import { authState, AppUser } from "@/stores/auth";
import { usePathname, useRouter } from "next/navigation";
import { Spinner, Flex, Text, Box } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: Array<AppUser["role"]>;
  checkPasswordChange?: boolean;
  redirectTo?: string;
  authenticationNeededMessage?: {
    title: string;
    description: string;
  };
  authorizationFailedMessage?: {
    title: string;
    description: string;
  };
}

export const AuthGuard = ({
  children,
  allowedRoles,
  checkPasswordChange = true,
  redirectTo = "/login",
  authenticationNeededMessage = {
    title: "로그인 필요",
    description: "이 페이지에 접근하려면 로그인이 필요합니다.",
  },
  authorizationFailedMessage = {
    title: "접근 권한 없음",
    description: "이 페이지에 접근할 권한이 없습니다.",
  },
}: AuthGuardProps) => {
  const { user, isAuthenticated, isLoading } = useRecoilValue(authState);
  const router = useRouter();
  const pathname = usePathname();

  const changePasswordPath = "/mypage/change-password";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const publicPaths = [
        "/login",
        "/cms/login",
        "/signup",
        "/find-credentials/id",
        "/find-credentials/password",
      ];
      if (!publicPaths.includes(pathname) && pathname !== redirectTo) {
        toaster.create({
          title: authenticationNeededMessage.title,
          description: authenticationNeededMessage.description,
          type: "error",
        });
        router.push(redirectTo);
      }
      return;
    }

    if (!user) {
      // This case should ideally not happen if isAuthenticated is true, but as a safeguard:
      if (pathname !== redirectTo) router.push(redirectTo);
      return;
    }

    if (
      checkPasswordChange &&
      user.requiresPasswordChange &&
      pathname !== changePasswordPath
    ) {
      toaster.create({
        title: "비밀번호 변경 필요",
        description:
          "계속하려면 비밀번호를 변경해야 합니다. 안전한 서비스 이용을 위해 비밀번호를 변경해주세요.",
        type: "warning",
        duration: 5000,
      });
      router.push(changePasswordPath);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role;
      if (!allowedRoles.includes(userRole)) {
        let title = authorizationFailedMessage.title;
        let description = authorizationFailedMessage.description;

        // 관리자 권한이 필요한 페이지에 접근 시 더 구체적인 메시지 표시
        const requiresAdmin = allowedRoles.some(
          (role) => role === "ADMIN" || role === "SYSTEM_ADMIN"
        );
        if (requiresAdmin) {
          title = "관리자 전용 페이지";
          description = "이 페이지에 접근하려면 관리자 권한이 필요합니다.";
        }

        toaster.create({
          title,
          description,
          type: "error",
        });

        let redirectPath = "/";
        if (userRole === "ADMIN" || userRole === "SYSTEM_ADMIN") {
          redirectPath = "/cms/menu";
        }
        router.push(redirectPath);
        return;
      }
    }

    if (
      (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN") &&
      pathname.startsWith("/application/confirm")
    ) {
      toaster.create({
        title: "접근 불가 (관리자)",
        description: "관리자 계정은 해당 페이지에 직접 접근할 수 없습니다.",
        type: "error",
      });
      router.push("/");
      return;
    }
  }, [
    user,
    isAuthenticated,
    isLoading,
    router,
    pathname,
    allowedRoles,
    checkPasswordChange,
    redirectTo,
    authenticationNeededMessage,
    authorizationFailedMessage,
    changePasswordPath,
  ]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH={"100vh"}>
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
        </Box>
      </Flex>
    );
  }

  // 로딩이 끝났고, 인증되지 않았지만, 아직 리디렉션이 실행되기 전이라면
  // children을 렌더링하지 않기 위해 null을 반환하여 깜빡임을 방지합니다.
  // if (!isLoading && !isAuthenticated) {
  //   return null;
  // }

  return <>{children}</>;
};
