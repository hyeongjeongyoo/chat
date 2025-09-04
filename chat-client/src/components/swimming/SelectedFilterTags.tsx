import { Box, Flex, Text, Image } from "@chakra-ui/react";

interface SelectedFilterTagsProps {
  selectedFilterLabels: string[];
  onRemoveFilter: (filterLabel: string) => void;
}

export const SelectedFilterTags: React.FC<SelectedFilterTagsProps> = ({
  selectedFilterLabels,
  onRemoveFilter,
}) => {
  if (selectedFilterLabels.length === 0) {
    return null; // Don't render anything if no filters are selected
  }

  return (
    <Box
      w="100%"
      maxW="1600px"
      padding="20px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
      gap="10px"
      bg="#F7F8FB"
      borderRadius="10px"
      mt="20px"
    >
      <Flex align="center" gap="10px" width="auto" height="28px">
        <Box width="28px" height="28px" position="relative">
          <Box
            position="absolute"
            left="3.76px"
            top="2.5px"
            width="22.5px"
            height="25px"
          >
            <Image
              src="/images/swimming/icon5.png"
              alt="필터 아이콘"
              width={21.5}
              height={23.5}
            />
          </Box>
        </Box>
        <Text
          fontFamily="'Paperlogy', sans-serif"
          fontWeight="600"
          fontSize="21px"
          lineHeight="25px"
          display="flex"
          alignItems="center"
          letterSpacing="-0.05em"
          color="#373636"
        >
          필터
        </Text>
        <Text
          fontFamily="'Paperlogy', sans-serif"
          fontWeight="500"
          fontSize="13px"
          lineHeight="16px"
          display="flex"
          alignItems="center"
          letterSpacing="-0.05em"
          color="#838383"
        >
          (선택하신 카테고리가 표시됩니다)
        </Text>
      </Flex>

      <Box>
        {selectedFilterLabels.map((filterLabel) => (
          <Box
            key={filterLabel}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            margin="0 8px 8px 0"
            width="auto"
            minWidth="100px"
            maxWidth="250px"
            height="31px"
            padding="5px 12px"
            borderRadius="20px"
            bg="#FFFFFF"
            border="1px solid #eee"
            gap="5px"
          >
            <Text
              fontFamily="'Paperlogy', sans-serif"
              fontWeight="600"
              fontSize="15px"
              lineHeight="21px"
              color="#373636"
              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {filterLabel}
            </Text>
            <Box
              onClick={() => onRemoveFilter(filterLabel)}
              cursor="pointer"
              color="#666"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Image
                src="/images/swimming/icon8.png"
                alt="제거 아이콘"
                width={16.3}
                height={16.3}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
