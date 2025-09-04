// 공통 색상 상수 정의
export const COLORS = {
  // 기본 색상
  light: {
    bg: "#ffffff",
    cardBg: "#ffffff",
    border: "#e2e8f0",
    header: {
      bg: "rgba(255, 255, 255, 0.95)",
      border: "#e2e8f0",
      text: "#2d3748",
      hover: "#1a202c",
      active: "rgba(237, 242, 247, 0.8)",
    },
    primary: {
      default: "#3182ce",
      hover: "#2b6cb0",
      light: "#ebf8ff",
      dark: "#2c5282",
      alpha: "rgba(49, 130, 206, 0.1)",
    },
    secondary: {
      default: "#718096",
      hover: "#4a5568",
      light: "#e2e8f0",
      dark: "#2d3748",
    },
    text: {
      primary: "#2d3748",
      secondary: "#4a5568",
      tertiary: "#718096",
      muted: "#a0aec0",
    },
    accent: {
      success: {
        default: "#48bb78",
        bg: "rgba(72, 187, 120, 0.1)",
        hover: "#38a169",
      },
      warning: {
        default: "#ed8936",
        bg: "rgba(237, 137, 54, 0.1)",
        hover: "#dd6b20",
      },
      info: {
        default: "#4299e1",
        bg: "rgba(66, 153, 225, 0.1)",
        hover: "#3182ce",
      },
      delete: {
        default: "#e53e3e",
        bg: "rgba(229, 62, 62, 0.1)",
        hover: "#c53030",
      },
      leafIcon: "#A9B730",
      timerYellow: "#FFD900",
      outlineButtonHoverBg: "#EDF2F7",
      errorNoticeBg: "#FFF5F5",
      errorNoticeBorder: "#FED7D7",
      radioUnselectedBg: "#F9FAFB",
      radioUnselectedHoverBorder: "#A0AEC0",
    },
    shadow: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
  },
  dark: {
    bg: "#1a202c",
    cardBg: "#2d3748",
    border: "#2d3748",
    header: {
      bg: "rgba(15, 23, 42, 0.95)",
      border: "#2d3748",
      text: "#f7fafc",
      hover: "#ffffff",
      active: "rgba(45, 55, 72, 0.8)",
    },
    primary: {
      default: "#63b3ed",
      hover: "#4299e1",
      light: "#0D344E",
      dark: "#2b6cb0",
      alpha: "rgba(99, 179, 237, 0.1)",
    },
    secondary: {
      default: "#a0aec0",
      hover: "#cbd5e0",
      light: "#4a5568",
      dark: "#718096",
    },
    text: {
      primary: "#f7fafc",
      secondary: "#e2e8f0",
      tertiary: "#a0aec0",
      muted: "#718096",
    },
    accent: {
      success: {
        default: "#9ae6b4",
        bg: "rgba(154, 230, 180, 0.1)",
        hover: "#68d391",
      },
      warning: {
        default: "#fbd38d",
        bg: "rgba(251, 211, 141, 0.1)",
        hover: "#f6ad55",
      },
      info: {
        default: "#90cdf4",
        bg: "rgba(144, 205, 244, 0.1)",
        hover: "#63b3ed",
      },
      delete: {
        default: "#fc8181",
        bg: "rgba(252, 129, 129, 0.1)",
        hover: "#f56565",
      },
      leafIcon: "#BACC40",
      timerYellow: "#FFD900",
      outlineButtonHoverBg: "rgba(255, 255, 255, 0.08)",
      errorNoticeBg: "rgba(229, 62, 62, 0.05)",
      errorNoticeBorder: "rgba(252, 129, 129, 0.3)",
      radioUnselectedBg: "#272D3B",
      radioUnselectedHoverBorder: "#4A5568",
    },
    shadow: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
    },
  },
};

// 공통 스타일 상수
export const STYLES = {
  container: {
    maxW: {
      base: "100%",
      xl: "1280px",
    },
    px: {
      base: 4,
      md: 6,
      lg: 8,
    },
  },
  header: {
    container: {
      maxW: "100%",
      px: { base: 2, md: 8, lg: 12 },
    },
    wrapper: {
      width: "100%",
      transition: "all 0.3s ease",
      backdropFilter: "blur(8px)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      py: 4,
    },
    content: {
      gap: 6,
      justify: "space-between",
      align: "flex-start",
      width: "100%",
      height: "100%",
    },
    logo: {
      minWidth: "180px",
      height: "40px",
    },
    nav: {
      display: { base: "none", md: "flex" },
      alignItems: "flex-start",
      mt: 1,
    },
  },
  fonts: {
    body: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
    heading:
      '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
  },
  section: {
    py: {
      base: 8,
      md: 12,
      lg: 16,
    },
  },
  card: {
    borderRadius: "2xl",
    p: 6,
    transition: "all 0.3s ease-in-out",
    _hover: {
      transform: "translateY(-4px)",
    },
  },
  button: {
    primary: {
      borderRadius: "xl",
      fontWeight: "semibold",
      px: 6,
      py: 3,
      transition: "all 0.3s ease-in-out",
      _hover: {
        transform: "translateY(-2px)",
      },
    },
    secondary: {
      borderRadius: "xl",
      fontWeight: "semibold",
      px: 6,
      py: 3,
      transition: "all 0.3s ease-in-out",
      _hover: {
        transform: "translateY(-2px)",
      },
    },
  },
  text: {
    heading: {
      fontWeight: "bold",
      letterSpacing: "tight",
      lineHeight: "shorter",
    },
    subheading: {
      fontWeight: "medium",
      letterSpacing: "wide",
      lineHeight: "tall",
    },
    body: {
      letterSpacing: "wide",
      lineHeight: "tall",
    },
  },
  badge: {
    fontWeight: "medium",
    transition: "all 0.3s ease-in-out",
    _hover: {
      transform: "translateY(-1px)",
    },
  },
  icon: {
    transition: "all 0.3s ease-in-out",
  },
  link: {
    transition: "all 0.3s ease-in-out",
    _hover: {
      textDecoration: "none",
    },
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1600px",
  },
};
