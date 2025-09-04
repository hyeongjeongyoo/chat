import { Box, Skeleton, VStack } from "@chakra-ui/react";

export function ScheduleSkeleton() {
  return (
    <VStack gap={2} align="stretch" w="100%">
      <Box display="flex" alignItems="center" borderRadius="xl">
        <Skeleton height="44px" flex={1} mx={2} />
      </Box>
      {[...Array(4)].map((_, index) => (
        <Box key={index} display="flex" alignItems="center" borderRadius="xl">
          <Skeleton height="44px" flex={1} ml={6} mr={2} />
        </Box>
      ))}
    </VStack>
  );
}
