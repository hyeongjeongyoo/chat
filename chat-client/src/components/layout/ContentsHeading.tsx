import { Box } from "@chakra-ui/react";

import { Heading } from "@chakra-ui/react";

const ContentsHeading = ({ title }: { title: string }) => {
  return (
    <Box mb={4}>
      <Heading
        as="h3"
        size={{ base: "2xl", md: "3xl", lg: "4xl" }}
        pb={3}
        borderBottom="2px solid #0D344E"
        color="#0D344E"
      >
        {title}
      </Heading>
    </Box>
  );
};

export default ContentsHeading;
