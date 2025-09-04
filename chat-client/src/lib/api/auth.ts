import {
  LoginCredentials,
  AuthResponse,
  VerifyTokenResponse,
  User,
} from "@/types/api";
import { publicApi, privateApi } from "./client";
import { getToken, setToken, removeToken } from "../auth-utils";

// React Query 키 정의
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  token: () => [...authKeys.all, "token"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// 인증 관련 API 타입 정의
export interface AuthApi {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  verifyToken: () => Promise<User>;
  logout: () => Promise<void>;
  getMe: () => Promise<User>;
}

// 인증 API 구현
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await publicApi.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    const authData = response.data.data; // 실제 데이터는 .data 안에 있습니다.

    if (authData?.accessToken) {
      // accessToken, refreshToken을 저장합니다.
      // accessTokenExpiresIn은 AuthResponse 타입에 없으므로 제거합니다.
      setToken(authData.accessToken, authData.refreshToken);
    }

    // 응답 데이터의 role 형식 통일 ("ROLE_ADMIN" -> "ADMIN")
    if (authData?.user?.role) {
      authData.user.role = authData.user.role.replace("ROLE_", "") || "USER";
    }

    return response;
  },

  logout: async () => {
    // 서버에 로그아웃 요청 (선택적)
    // await publicApi.post<void>("/auth/logout");

    // 클라이언트 측 토큰 제거
    removeToken();

    // 페이지를 새로고침하여 상태를 초기화하거나, 로그인 페이지로 리디렉션
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  },

  verifyToken: async (): Promise<User> => {
    const response = await privateApi.get<VerifyTokenResponse>("/auth/verify");

    const apiData = response.data.data;

    // "ROLE_ADMIN" -> "ADMIN"
    const role =
      apiData.authorities?.[0]?.authority.replace("ROLE_", "") || "USER";

    // 프론트엔드 User 모델로 변환
    const user: User = {
      uuid: apiData.uuid,
      username: apiData.username,
      role: role,
      // 백엔드 응답에 없는 필드는 기본값 또는 빈 값으로 채웁니다.
      name: apiData.username, // name이 없으면 username으로 대체
      email: "", // email 정보가 없음
      status: "ACTIVE", // status 정보가 없음
      createdAt: new Date().toISOString(), // 정보가 없으므로 현재 시간으로 설정
      updatedAt: new Date().toISOString(),
    };

    return user;
  },
};
