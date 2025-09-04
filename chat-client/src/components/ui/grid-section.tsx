"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import { LuGrip, LuMaximize2 } from "react-icons/lu";
import * as React from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useState } from "react";
import { css, Global } from "@emotion/react";
import { useColors } from "@/styles/theme";
import { Tooltip } from "./tooltip";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridSectionProps {
  children: React.ReactNode;
  initialLayout?: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    isStatic?: boolean;
    isHeader?: boolean;
    title?: string;
    subtitle?: string;
  }[];
}

export function GridSection({
  children,
  initialLayout = [
    { id: "a", x: 0, y: 0, w: 6, h: 4 },
    { id: "b", x: 6, y: 0, w: 6, h: 4 },
    { id: "c", x: 0, y: 4, w: 6, h: 4 },
    { id: "d", x: 6, y: 4, w: 6, h: 4 },
  ],
}: GridSectionProps) {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // 테마 색상 적용
  const bgColor = useColorModeValue(
    "rgba(255, 255, 255, 0.5)",
    "rgba(26, 32, 44, 0.4)"
  );
  const borderColor = useColorModeValue(
    "rgba(226, 232, 240, 0.4)",
    "rgba(74, 85, 104, 0.2)"
  );
  const handleColor = useColorModeValue(
    colors.text.secondary,
    colors.text.secondary
  );
  const handleHoverColor = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );
  const placeholderBg = useColorModeValue(
    "rgba(99, 102, 241, 0.1)",
    "rgba(129, 140, 248, 0.1)"
  );
  const hoverBorderColor = useColorModeValue(
    "rgba(99, 102, 241, 0.3)",
    "rgba(129, 140, 248, 0.3)"
  );
  const hoverBg = useColorModeValue(
    "rgba(241, 245, 249, 0.6)",
    "rgba(30, 41, 59, 0.6)"
  );
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);

  const childrenArray = React.Children.toArray(children);

  const [layouts, setLayouts] = useState<Layouts>({
    lg: initialLayout.map(({ id, x, y, w, h, isStatic = false }) => ({
      i: id,
      x,
      y,
      w,
      h,
      static: isStatic || id === "header",
    })),
  });

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
  };

  return (
    <Box width="full">
      <Global
        styles={css`
          .react-resizable-handle {
            opacity: 0.3;
            color: ${isDark ? colors.text.secondary : colors.text.secondary};
            transition: all 0.3s ease;
            &:hover {
              opacity: 1;
              color: ${isDark
                ? colors.primary.default
                : colors.primary.default};
            }
          }
          .react-grid-item.react-grid-placeholder {
            background: ${placeholderBg};
            opacity: 0.3;
            border-radius: 1rem;
            border: 1px dashed ${colors.primary.alpha};
            transition: all 200ms ease;
          }
          .react-grid-item.react-draggable-dragging {
            transition: none;
            z-index: 100;
            cursor: move;
            box-shadow: ${colors.shadow.md};
            border-color: ${colors.primary.alpha};
            background: ${isDark
              ? "rgba(30, 41, 59, 0.7)"
              : "rgba(241, 245, 249, 0.7)"};
            backdrop-filter: blur(12px);
          }
          .react-grid-item.static {
            cursor: default;
          }
        `}
      />
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={
          initialLayout.some((item) => item.id === "header" && item.isHeader)
            ? 60
            : 100
        }
        onLayoutChange={onLayoutChange}
        isDraggable
        isResizable
        margin={[12, 12]}
        draggableHandle=".drag-handle"
      >
        {initialLayout.map((layout, index) => {
          const isHeaderSection = layout.id === "header" || layout.isHeader;
          const isStatic = layout.isStatic || isHeaderSection;

          return (
            <Box
              key={layout.id}
              bg={bgColor}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              minH="10px"
              shadow={colors.shadow.sm}
              transition="all 0.3s ease-in-out"
              _hover={{
                shadow: isStatic ? colors.shadow.sm : colors.shadow.md,
                borderColor: isStatic ? borderColor : hoverBorderColor,
                bg: isStatic ? bgColor : hoverBg,
                transform: isStatic ? "none" : "translateY(-2px)",
              }}
              position="relative"
              backdropFilter="blur(8px)"
              overflow="hidden"
              className={isStatic ? "static-section" : ""}
            >
              {/* Section Header */}
              {(layout.title || !isStatic) && (
                <Flex
                  p={3}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  justify="space-between"
                  align="center"
                >
                  {layout.title && (
                    <Box>
                      <Flex align="center" gap={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color={textColor}
                          letterSpacing="tight"
                        >
                          {layout.title}
                        </Text>
                        {layout.subtitle && !isHeaderSection && (
                          <Tooltip
                            content={layout.subtitle}
                            positioning={{ placement: "bottom-start" }}
                            openDelay={50}
                            closeDelay={200}
                            contentProps={{
                              css: {
                                bg: isDark ? colors.gradient.primary : "white",
                                color: isDark ? "white" : "gray.800",
                                borderColor: isDark ? "gray.700" : "gray.200",
                                boxShadow: colors.shadow.md,
                                p: 2,
                                fontSize: "xs",
                                maxW: "240px",
                              },
                            }}
                          >
                            <Box
                              as="span"
                              color={colors.primary.default}
                              cursor="help"
                              transition="0.3s ease-in-out"
                              _hover={{ color: colors.primary.dark }}
                            >
                              ⓘ
                            </Box>
                          </Tooltip>
                        )}
                      </Flex>
                    </Box>
                  )}
                  <Flex align="center" gap={2}>
                    {!isStatic && (
                      <Button
                        className="drag-handle"
                        aria-label="Move section"
                        size="sm"
                        variant="ghost"
                        opacity="0.4"
                        cursor="move"
                        color={handleColor}
                        bg="transparent"
                        minW="auto"
                        h="auto"
                        p="1"
                        _hover={{
                          opacity: 1,
                          bg: "transparent",
                          color: handleHoverColor,
                          transform: "scale(1.1)",
                        }}
                        _active={{
                          transform: "scale(0.95)",
                        }}
                      >
                        <LuGrip size={16} />
                      </Button>
                    )}
                  </Flex>
                </Flex>
              )}

              {/* Section Content */}
              <Box
                flex="1"
                p="3"
                overflow="auto"
                h={"calc(100% - 80px)"}
                maxH="calc(100% - 80px)"
                minH="60px"
                css={{
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    width: "6px",
                    background: "transparent",
                    paddingRight: "3",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderRadius: "24px",
                  },
                }}
              >
                {childrenArray[index]}
              </Box>

              {/* Section Footer with Resize Handle */}
              {!isStatic && (
                <Flex h="30px" borderTop="1px solid" borderColor={borderColor}>
                  <Button
                    aria-label="Resize section"
                    size="sm"
                    variant="ghost"
                    opacity="0.4"
                    color={handleColor}
                    bg="transparent"
                    minW="auto"
                    h="auto"
                    p="1"
                    cursor="se-resize"
                    className="react-resizable-handle react-resizable-handle-se"
                    _hover={{
                      opacity: 1,
                      bg: "transparent",
                      color: handleHoverColor,
                    }}
                    borderRadius="full"
                    width="24px"
                    height="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box transform="scaleX(-1)">
                      <LuMaximize2 size={16} />
                    </Box>
                  </Button>
                </Flex>
              )}
            </Box>
          );
        })}
      </ResponsiveGridLayout>
    </Box>
  );
}
