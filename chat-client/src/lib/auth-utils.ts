export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const TOKEN_EXPIRY_KEY = "token_expiry";
export const USER_KEY = "auth_user";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getUser = (): any => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setToken = (
  token: string,
  refreshToken?: string,
  expiresIn?: number,
  user?: any
): void => {
  if (typeof window === "undefined") return;
  if (!token) {
    console.warn("빈 토큰을 저장하려고 시도했습니다");
    return;
  }

  const trimmedToken = token.trim();

  // Store in localStorage
  localStorage.setItem(TOKEN_KEY, trimmedToken);

  // Set token expiry
  const expiry = new Date();
  const maxAge = expiresIn || 3600;
  expiry.setSeconds(expiry.getSeconds() + maxAge);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toISOString());

  // Store in cookie for SSR/middleware compatibility
  document.cookie = `${TOKEN_KEY}=${trimmedToken}; path=/; max-age=${maxAge}; SameSite=Strict`;

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  // Remove from localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_KEY);

  // Remove from cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0;`;
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const getAuthHeaderOrThrow = (): { Authorization: string } => {
  const token = getToken();
  if (!token || !isAuthenticated()) {
    throw new Error("No valid authentication token found");
  }
  return { Authorization: `Bearer ${token}` };
};

export const authKeys = {
  current: () => ["auth", "current"] as const,
  refresh: () => ["auth", "refresh"] as const,
};

export const getUserRole = (): string | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
};
