"use client";

import { Box } from "@chakra-ui/react";
import ProtectedMypageClient from "./ProtectedMypageClient";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box>
      <ProtectedMypageClient>{children}</ProtectedMypageClient>
    </Box>
  );
};

export default Layout;
