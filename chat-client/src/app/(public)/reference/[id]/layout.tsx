"use client";

import { Box } from "@chakra-ui/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box>
      {children}
    </Box>
  );
};

export default Layout;
