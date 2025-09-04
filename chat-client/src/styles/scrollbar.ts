import { css } from "@emotion/react";

export const getScrollbarStyle = (isDark: boolean) => css`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${isDark ? "#17191d" : "#ffffff"};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${isDark ? "#4A5568" : "#CBD5E0"};
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${isDark ? "#718096" : "#A0AEC0"};
    }
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${isDark ? "#4A5568 transparent" : "#CBD5E0 transparent"};
`;

// 기존 스타일 유지 (하위 호환성)
export const scrollbarStyle = css`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #a0aec0;
    }
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
`;
