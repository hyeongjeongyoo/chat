"use client";

import { useEffect } from "react";
import { useAuthActions } from "@/stores/auth";

export function AuthInitializer() {
  const { syncAuthState } = useAuthActions();

  useEffect(() => {
    syncAuthState();
  }, [syncAuthState]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
}
