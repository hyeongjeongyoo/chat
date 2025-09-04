import { useColorModeValue } from "@/components/ui/color-mode";
import { COLORS } from "./theme-tokens";
import { STYLES } from "./theme-tokens";
export interface Colors {
  bg: string;
  cardBg: string;
  darkBg: string;
  border: string;
  primary: {
    default: string;
    hover: string;
    light: string;
    dark: string;
    alpha: string;
  };
  secondary: {
    default: string;
    hover: string;
    light: string;
    dark: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    muted: string;
    accent: string;
  };
  header: {
    bg: string;
    border: string;
    text: string;
    hoverBg: string;
    activeBg: string;
  };
  nav: {
    bg: string;
    border: string;
    text: string;
    hoverText: string;
    hoverBg: string;
  };
  accent: {
    success: {
      default: string;
      bg: string;
      hover: string;
    };
    warning: {
      default: string;
      bg: string;
      hover: string;
    };
    info: {
      default: string;
      bg: string;
      hover: string;
    };
    delete: {
      default: string;
      bg: string;
      hover: string;
    };
    leafIcon: string;
    timerYellow: string;
    outlineButtonHoverBg: string;
    errorNoticeBg: string;
    errorNoticeBorder: string;
    radioUnselectedBg: string;
    radioUnselectedHoverBorder: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
  gradient: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface Styles {
  fonts: {
    body: string;
    heading: string;
  };
  container: {
    maxW: {
      base: string;
      xl: string;
    };
    px: {
      base: number;
      md: number;
      lg: number;
    };
  };
  section: {
    py: {
      base: number;
      md: number;
      lg: number;
    };
  };
  card: {
    bg: string;
    borderColor: string;
    borderWidth: string;
    borderRadius: string;
    boxShadow: string;
    p: number;
    transition: string;
    backdropFilter?: string;
    _hover?: {
      transform?: string;
      boxShadow?: string;
      borderColor?: string;
    };
  };
  header: {
    wrapper: {
      width: string;
      transition: string;
      backdropFilter: string;
      position: "sticky";
      top: number;
      zIndex: number;
      py: number;
    };
    container: {
      maxW: string;
      px: {
        base: number;
        md: number;
        lg: number;
      };
    };
    content: {
      gap: number;
      justify: string;
      align: string;
      width: string;
      height: string;
    };
    logo: {
      minWidth: string;
      height: string;
    };
    nav: {
      display: {
        base: string;
        md: string;
      };
      alignItems: string;
      mt: number;
    };
  };
  nav: {
    item: {
      color: string;
      _hover: {
        color: string;
        bg: string;
      };
    };
  };
  button: {
    primary: {
      bg: string;
      color: string;
      borderRadius: string;
      fontWeight: string;
      px: number;
      py: number;
      transition: string;
      _hover: {
        bg: string;
        transform?: string;
      };
    };
    secondary: {
      bg: string;
      color: string;
      borderRadius: string;
      fontWeight: string;
      px: number;
      py: number;
      transition: string;
      _hover: {
        bg: string;
        transform?: string;
      };
    };
  };
  text: {
    heading: {
      fontWeight: string;
      letterSpacing: string;
      lineHeight: string;
    };
    subheading: {
      fontWeight: string;
      letterSpacing: string;
      lineHeight: string;
    };
    body: {
      letterSpacing: string;
      lineHeight: string;
    };
    gradient?: {
      bgGradient: string;
      bgClip: string;
    };
  };
  badge: {
    fontWeight: string;
    transition: string;
    _hover: {
      transform: string;
    };
  };
  icon: {
    transition: string;
  };
  link: {
    color: string;
    transition: string;
    _hover: {
      color: string;
      textDecoration: string;
    };
  };
  scrollTopButton: {
    position: "fixed";
    bottom: string;
    right: string;
    zIndex: number;
  };
  breakpoints?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
}

export function useColors(): Colors {
  return {
    bg: useColorModeValue(COLORS.light.bg, COLORS.dark.bg),
    cardBg: useColorModeValue(COLORS.light.cardBg, COLORS.dark.cardBg),
    darkBg: COLORS.dark.bg,
    border: useColorModeValue(COLORS.light.border, COLORS.dark.border),
    primary: {
      default: useColorModeValue(
        COLORS.light.primary.default,
        COLORS.dark.primary.default
      ),
      hover: useColorModeValue(
        COLORS.light.primary.hover,
        COLORS.dark.primary.hover
      ),
      light: useColorModeValue(
        COLORS.dark.primary.light,
        COLORS.light.primary.light
      ),
      dark: useColorModeValue(
        COLORS.light.primary.dark,
        COLORS.dark.primary.dark
      ),
      alpha: useColorModeValue(
        COLORS.light.primary.alpha,
        COLORS.dark.primary.alpha
      ),
    },
    secondary: {
      default: useColorModeValue(
        COLORS.light.secondary.default,
        COLORS.dark.secondary.default
      ),
      hover: useColorModeValue(
        COLORS.light.secondary.hover,
        COLORS.dark.secondary.hover
      ),
      light: useColorModeValue(
        COLORS.light.secondary.light,
        COLORS.dark.secondary.light
      ),
      dark: useColorModeValue(
        COLORS.light.secondary.dark,
        COLORS.dark.secondary.dark
      ),
    },
    text: {
      primary: useColorModeValue(
        COLORS.light.text.primary,
        COLORS.dark.text.primary
      ),
      secondary: useColorModeValue(
        COLORS.light.text.secondary,
        COLORS.dark.text.secondary
      ),
      tertiary: useColorModeValue(
        COLORS.light.text.tertiary,
        COLORS.dark.text.tertiary
      ),
      muted: useColorModeValue(COLORS.light.text.muted, COLORS.dark.text.muted),
      inverse: useColorModeValue("white", COLORS.light.text.primary),
      accent: useColorModeValue(
        COLORS.light.primary.hover,
        COLORS.dark.primary.hover
      ),
    },
    header: {
      bg: useColorModeValue(
        "rgba(255, 255, 255, 0.8)",
        "rgba(26, 32, 44, 0.8)"
      ),
      border: useColorModeValue(COLORS.light.border, COLORS.dark.border),
      text: useColorModeValue(
        COLORS.light.text.primary,
        COLORS.dark.text.primary
      ),
      hoverBg: useColorModeValue(
        "rgba(237, 242, 247, 0.8)",
        "rgba(45, 55, 72, 0.8)"
      ),
      activeBg: useColorModeValue(
        "rgba(226, 232, 240, 0.8)",
        "rgba(45, 55, 72, 0.8)"
      ),
    },
    nav: {
      bg: useColorModeValue(COLORS.light.bg, COLORS.dark.bg),
      border: useColorModeValue(COLORS.light.border, COLORS.dark.border),
      text: useColorModeValue(
        COLORS.light.text.primary,
        COLORS.dark.text.primary
      ),
      hoverText: useColorModeValue(
        COLORS.light.primary.hover,
        COLORS.dark.primary.hover
      ),
      hoverBg: useColorModeValue(
        "rgba(237, 242, 247, 0.8)",
        "rgba(45, 55, 72, 0.8)"
      ),
    },
    accent: {
      success: {
        default: useColorModeValue(
          COLORS.light.accent.success.default,
          COLORS.dark.accent.success.default
        ),
        bg: useColorModeValue(
          COLORS.light.accent.success.bg,
          COLORS.dark.accent.success.bg
        ),
        hover: useColorModeValue(
          COLORS.light.accent.success.hover,
          COLORS.dark.accent.success.hover
        ),
      },
      warning: {
        default: useColorModeValue(
          COLORS.light.accent.warning.default,
          COLORS.dark.accent.warning.default
        ),
        bg: useColorModeValue(
          COLORS.light.accent.warning.bg,
          COLORS.dark.accent.warning.bg
        ),
        hover: useColorModeValue(
          COLORS.light.accent.warning.hover,
          COLORS.dark.accent.warning.hover
        ),
      },
      info: {
        default: useColorModeValue(
          COLORS.light.accent.info.default,
          COLORS.dark.accent.info.default
        ),
        bg: useColorModeValue(
          COLORS.light.accent.info.bg,
          COLORS.dark.accent.info.bg
        ),
        hover: useColorModeValue(
          COLORS.light.accent.info.hover,
          COLORS.dark.accent.info.hover
        ),
      },
      delete: {
        default: useColorModeValue(
          COLORS.light.accent.delete.default,
          COLORS.dark.accent.delete.default
        ),
        bg: useColorModeValue(
          COLORS.light.accent.delete.bg,
          COLORS.dark.accent.delete.bg
        ),
        hover: useColorModeValue(
          COLORS.light.accent.delete.hover,
          COLORS.dark.accent.delete.hover
        ),
      },
      leafIcon: useColorModeValue(
        COLORS.light.accent.leafIcon,
        COLORS.dark.accent.leafIcon
      ),
      timerYellow: useColorModeValue(
        COLORS.light.accent.timerYellow,
        COLORS.dark.accent.timerYellow
      ),
      outlineButtonHoverBg: useColorModeValue(
        COLORS.light.accent.outlineButtonHoverBg,
        COLORS.dark.accent.outlineButtonHoverBg
      ),
      errorNoticeBg: useColorModeValue(
        COLORS.light.accent.errorNoticeBg,
        COLORS.dark.accent.errorNoticeBg
      ),
      errorNoticeBorder: useColorModeValue(
        COLORS.light.accent.errorNoticeBorder,
        COLORS.dark.accent.errorNoticeBorder
      ),
      radioUnselectedBg: useColorModeValue(
        COLORS.light.accent.radioUnselectedBg,
        COLORS.dark.accent.radioUnselectedBg
      ),
      radioUnselectedHoverBorder: useColorModeValue(
        COLORS.light.accent.radioUnselectedHoverBorder,
        COLORS.dark.accent.radioUnselectedHoverBorder
      ),
    },
    shadow: {
      sm: useColorModeValue(COLORS.light.shadow.sm, COLORS.dark.shadow.sm),
      md: useColorModeValue(COLORS.light.shadow.md, COLORS.dark.shadow.md),
      lg: useColorModeValue(COLORS.light.shadow.lg, COLORS.dark.shadow.lg),
    },
    gradient: {
      primary: "linear-gradient(135deg,rgb(33, 127, 214),rgb(83, 144, 236))",
      secondary: "linear-gradient(135deg, #0ea5e9, #6366f1)",
      accent: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    },
  } as Colors;
}

export function useStyles(colors: Colors): Styles {
  return {
    fonts: {
      body: '"SCoreDream", sans-serif',
      heading: '"SCoreDream", sans-serif',
    },
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
    section: {
      py: {
        base: 8,
        md: 12,
        lg: 16,
      },
    },
    card: {
      bg: colors.cardBg,
      borderColor: colors.border,
      borderWidth: "1px",
      borderRadius: "xl",
      boxShadow: colors.shadow.sm,
      p: 6,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(8px)",
      _hover: {
        transform: "translateY(-2px)",
        boxShadow: colors.shadow.md,
        borderColor: colors.primary.default,
      },
    },
    header: {
      wrapper: {
        width: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        py: 2,
      },
      container: {
        maxW: "1280px",
        px: {
          base: 4,
          md: 6,
          lg: 8,
        },
      },
      content: {
        gap: 4,
        justify: "space-between",
        align: "center",
        width: "100%",
        height: "64px",
      },
      logo: {
        minWidth: "120px",
        height: "40px",
      },
      nav: {
        display: {
          base: "none",
          md: "flex",
        },
        alignItems: "center",
        mt: 0,
      },
    },
    nav: {
      item: {
        color: colors.nav.text,
        _hover: {
          color: colors.nav.hoverText,
          bg: colors.nav.hoverBg,
        },
      },
    },
    button: {
      primary: {
        bg: colors.primary.default,
        color: colors.text.inverse,
        borderRadius: "md",
        fontWeight: "semibold",
        px: 4,
        py: 2,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        _hover: {
          bg: colors.primary.hover,
          transform: "translateY(-1px)",
        },
      },
      secondary: {
        bg: colors.secondary.default,
        color: colors.text.inverse,
        borderRadius: "md",
        fontWeight: "semibold",
        px: 4,
        py: 2,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        _hover: {
          bg: colors.secondary.hover,
          transform: "translateY(-1px)",
        },
      },
    },
    text: {
      heading: {
        fontWeight: "bold",
        letterSpacing: "-0.025em",
        lineHeight: "1.2",
      },
      subheading: {
        fontWeight: "semibold",
        letterSpacing: "-0.025em",
        lineHeight: "1.3",
      },
      body: {
        letterSpacing: "0.025em",
        lineHeight: "1.6",
      },
      gradient: {
        bgGradient: colors.gradient.primary,
        bgClip: "text",
      },
    },
    badge: {
      fontWeight: "medium",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        transform: "translateY(-1px)",
      },
    },
    icon: {
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    link: {
      color: colors.primary.default,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        color: colors.primary.hover,
        textDecoration: "underline",
      },
    },
    scrollTopButton: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 1000,
    },
  };
}

export function useUserStyles(styles: Styles): Styles {
  return {
    ...styles,
    fonts: {
      body: '"SCoreDream", sans-serif',
      heading: '"SCoreDream", sans-serif',
    },
  };
}
