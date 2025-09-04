import React, { ReactNode } from "react";
import { Container, Box } from "@chakra-ui/react";

interface PageContainerProps {
  children: ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <Container maxW="1600px">
      <Box mt={{ base: "50px", sm: "80px", md: "100px", lg: "120px" }} mb={10}>
        {children}
      </Box>
    </Container>
  );
};
