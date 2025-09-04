import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  Badge,
  JsxStyleProps,
} from "@chakra-ui/react";
import { useColors, useStyles } from "@/styles/theme";
import { useColorMode } from "@/components/ui/color-mode";

export const TopBanner = (props: JsxStyleProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const colors = useColors();
  const styles = useStyles(colors);

  return (
    <Box
      bgGradient={colors.gradient.primary}
      color={colors.text.inverse}
      py={0}
      width="100%"
      zIndex={10}
      boxShadow={colors.shadow.sm}
      transition="all 0.3s ease-in-out"
      height="40px"
      margin={0}
      padding={0}
      {...props}
    >
      <Container
        {...styles.container}
        maxW="100%"
        px={{ base: 2, md: 6, lg: 8 }}
        height="100%"
      >
        <Flex justify="center" align="center" height="100%">
          <HStack gap={{ base: 2, md: 6 }}>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="bold"
              display={{ base: "none", sm: "block" }}
            >
              현재 진행중: 2025년 1차 모집 (03.01 - 03.31)
            </Text>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="bold"
              display={{ base: "block", sm: "none" }}
            >
              2025년 1차 모집 중
            </Text>
            <Badge
              bg={
                isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)"
              }
              color={isDark ? "#34d399" : "#10b981"}
              px={{ base: 2, md: 3 }}
              py={0.5}
              borderRadius="full"
              fontWeight="bold"
              backdropFilter="blur(12px)"
              fontSize={{ base: "2xs", md: "xs" }}
              borderWidth="1px"
              borderColor={
                isDark ? "rgba(52, 211, 153, 0.3)" : "rgba(16, 185, 129, 0.3)"
              }
              boxShadow={isDark ? "0 0 8px rgba(52, 211, 153, 0.2)" : "none"}
            >
              신청가능
            </Badge>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};
