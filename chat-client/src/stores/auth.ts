import { atom, useSetRecoilState } from "recoil";
import { type LoginCredentials, User as ApiUser } from "@/types/api";
import {
  setToken,
  removeToken,
  getToken,
  getUser,
  USER_KEY,
} from "@/lib/auth-utils";
import { authApi } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";

export interface AppUser extends ApiUser {
  requiresPasswordChange: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AppUser | null;
  isLoading: boolean;
}

export const authState = atom<AuthState>({
  key: "authState",
  default: {
    isAuthenticated: false,
    user: null,
    isLoading: true, // 앱 시작 시 인증 상태를 확인해야 하므로 true로 시작
  },
});

export const useAuthActions = () => {
  const setAuth = useSetRecoilState(authState);
  const queryClient = useQueryClient();
  const router = useRouter();

  const login = async (credentials: LoginCredentials, fromCMS: boolean) => {
    try {
      const response = await authApi.login(credentials);
      if (response.data.success && response.data.data?.accessToken) {
        const { accessToken, refreshToken, user: apiUser } = response.data.data;

        // 백엔드에서 password_change_required와 같은 필드를 제공하지 않으므로,
        // 로그인 시에는 false로 간주하고, 사용자가 비밀번호를 변경하면 이 상태를 업데이트해야 합니다.
        const appUser: AppUser = { ...apiUser, requiresPasswordChange: false };

        setToken(accessToken, refreshToken, 3600, appUser);
        setAuth({ isAuthenticated: true, user: appUser, isLoading: false });

        if (appUser.requiresPasswordChange) {
          router.push("/mypage/change-password");
          toaster.create({
            title: "비밀번호 변경 필요",
            description: "계속하려면 비밀번호를 변경해야 합니다.",
            type: "warning",
          });
        } else if (fromCMS) {
          if (
            appUser.role === "ADMIN" ||
            appUser.role === "SYSTEM_ADMIN"
          ) {
            router.push("/cms/menu");
            toaster.create({
              title: "로그인 성공",
              description: "CMS에 오신 것을 환영합니다.",
              type: "success",
            });
          } else {
            // CMS 로그인 페이지에서 일반 사용자가 로그인 시도 시
            await logout(); // 즉시 로그아웃 처리
            toaster.create({
              title: "접근 불가",
              description: "관리자 계정으로 로그인해주세요.",
              type: "error",
            });
          }
        } else {
          // 일반 로그인
          router.push("/");
        }
      } else {
        throw new Error(
          response.data.message || "로그인 정보가 올바르지 않습니다."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "로그인 중 오류가 발생했습니다.";
      removeToken();
      setAuth({ isAuthenticated: false, user: null, isLoading: false });
      toaster.create({
        title: "로그인 실패",
        description: errorMessage,
        type: "error",
      });
      // 에러를 다시 던져서 컴포넌트 레벨에서 처리할 수 있도록 함
      throw error;
    }
  };

  const logout = async (redirectPath?: string) => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed, proceeding with local logout", error);
    } finally {
      const currentPath = window.location.pathname;
      const fromCMS = currentPath.startsWith("/cms");

      removeToken();
      setAuth({ isAuthenticated: false, user: null, isLoading: false });
      queryClient.clear(); // React Query 캐시 클리어

      // 리디렉션 경로가 제공되면 그곳으로, 아니면 기본 로직 따름
      router.push(redirectPath || (fromCMS ? "/cms/login" : "/login"));
      toaster.create({
        title: "로그아웃",
        description: "성공적으로 로그아웃되었습니다.",
        type: "success",
      });
    }
  };

  const syncAuthState = async () => {
    setAuth((prev) => ({ ...prev, isLoading: true }));
    const token = getToken();
    if (token) {
      try {
        const userFromApi = await authApi.verifyToken();
        // 로컬 스토리지에 저장된 사용자 정보에서 `requiresPasswordChange` 값을 가져옴
        const storedUser = getUser();
        const appUser: AppUser = {
          ...userFromApi,
          requiresPasswordChange: storedUser?.requiresPasswordChange ?? false,
        };
        // API에서 받은 최신 정보와 클라이언트 상태를 합쳐 다시 저장
        localStorage.setItem(USER_KEY, JSON.stringify(appUser));
        setAuth({ isAuthenticated: true, user: appUser, isLoading: false });
      } catch (error) {
        // 토큰이 유효하지 않은 경우 (재발급 실패 포함)
        removeToken();
        setAuth({ isAuthenticated: false, user: null, isLoading: false });
      }
    } else {
      setAuth({ isAuthenticated: false, user: null, isLoading:false });
    }
  };

  return {
    login,
    logout,
    syncAuthState,
  };
}; 