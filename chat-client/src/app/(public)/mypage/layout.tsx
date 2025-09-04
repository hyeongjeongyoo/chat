"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { Box } from "@chakra-ui/react";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import ProtectedMypageClient from "./ProtectedMypageClient";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const heroData = useHeroSectionData();
  return (
    <Box>
      <HeroSection slideContents={[heroData]} />
      <ProtectedMypageClient>{children}</ProtectedMypageClient>
    </Box>
  );
};

export default Layout;
