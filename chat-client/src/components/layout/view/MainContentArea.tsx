"use client";
import { Box } from "@chakra-ui/react";
import { useUserStyles } from "@/styles/theme";
import { STYLES } from "@/styles/theme-tokens";
import { Styles } from "@/styles/theme";
import { ReactNode, memo } from "react";

interface MainContentAreaProps {
  children: ReactNode;
}

export const MainContentArea = memo(({ children }: MainContentAreaProps) => {
  const styles = useUserStyles(STYLES as Styles);
  return (
    <Box as="main" id="mainContent" fontFamily={styles.fonts.body}>
      {children}
    </Box>
  );
});

MainContentArea.displayName = "MainContentArea";
export default MainContentArea;
