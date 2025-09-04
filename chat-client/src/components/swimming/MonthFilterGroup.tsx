import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { monthOptions } from "./filterConstants";

interface MonthFilterGroupProps {
  selectedValues: number[];
  onFilterChange: (value: number | "ALL_CLICKED") => void;
}

const ALL_MONTH_VALUES = monthOptions
  .filter((opt) => opt.value !== "all")
  .map((opt) => opt.value as number);

export const MonthFilterGroup: React.FC<MonthFilterGroupProps> = ({
  selectedValues,
  onFilterChange,
}) => {
  const isAllSelected =
    ALL_MONTH_VALUES.length > 0 &&
    selectedValues.length === ALL_MONTH_VALUES.length &&
    ALL_MONTH_VALUES.every((val) => selectedValues.includes(val));

  return (
    <Box
      width="100%"
      padding="20px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
      gap="10px"
      bg="#EFEFEF"
      borderRadius="10px"
    >
      <Flex align="center" gap="10px" width="auto" height="28px">
        <Box width="28px" height="28px" position="relative">
          <Box
            position="absolute"
            left="2.33px"
            top="1.17px"
            width="24.5px"
            height="24.5px"
          >
            <Image
              src="/images/swimming/icon3.png"
              alt="월별 아이콘"
              width={24.5}
              height={24.5}
            />
          </Box>
        </Box>
        <Text
          fontFamily="'Paperlogy', sans-serif"
          fontWeight="600"
          fontSize="21px"
          lineHeight="25px"
          letterSpacing="-0.05em"
          color="#373636"
        >
          월별
        </Text>
        <Text
          fontFamily="'Paperlogy', sans-serif"
          fontWeight="500"
          fontSize="13px"
          lineHeight="16px"
          letterSpacing="-0.05em"
          color="#838383"
        >
          (조회 가능 기간은 현재 기준 전후 1개월까지입니다)
        </Text>
      </Flex>

      <Flex
        align="center"
        width="auto"
        height="auto"
        gap="10px"
        justifyContent="flex-start"
        flexWrap="wrap"
      >
        {/* "Select All" Button for Month */}
        {monthOptions.find((opt) => opt.value === "all") && (
          <Flex
            key="month-all"
            justify="center"
            align="center"
            padding="5px 12px"
            minWidth="118px" // Ensure consistent width for "Select All"
            height="31px"
            bg={isAllSelected ? "#2E3192" : "white"}
            borderRadius="20px"
            onClick={() => onFilterChange("ALL_CLICKED")}
            cursor="pointer"
            border={isAllSelected ? "none" : "1px solid #ddd"}
          >
            <Text
              fontFamily="'Paperlogy', sans-serif"
              fontWeight="600"
              fontSize="15px"
              color={isAllSelected ? "white" : "#838383"}
              textAlign="center"
            >
              {monthOptions.find((opt) => opt.value === "all")?.label}
            </Text>
          </Flex>
        )}

        {/* Individual Month Options */}
        {monthOptions
          .filter((option) => option.value !== "all")
          .map((option) => {
            const isSelected = selectedValues.includes(option.value as number);
            return (
              <Flex
                key={option.value}
                justify="center"
                align="center"
                padding="5px 12px"
                minWidth={option.label.length > 10 ? "125px" : "114px"} // Dynamic width
                height="31px"
                bg={isSelected ? "#2E3192" : "white"}
                borderRadius="20px"
                onClick={() => onFilterChange(option.value as number)}
                cursor="pointer"
                border={isSelected ? "none" : "1px solid #ddd"}
              >
                <Text
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  color={isSelected ? "white" : "#838383"}
                  textAlign="center"
                >
                  {option.label}
                </Text>
              </Flex>
            );
          })}
      </Flex>
    </Box>
  );
};
