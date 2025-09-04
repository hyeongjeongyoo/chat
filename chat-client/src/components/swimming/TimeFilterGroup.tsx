import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { timeTypeOptions, timeSlots } from "./filterConstants";

interface TimeFilterGroupProps {
  selectedTimeTypes: string[];
  selectedTimeSlots: string[];
  onTimeTypeChange: (value: string | "ALL_CLICKED") => void;
  onTimeSlotChange: (value: string | "ALL_CLICKED") => void; // Added for consistency, if a "Select All" for slots is needed
}

const ALL_TIMETYPE_VALUES = timeTypeOptions
  .filter((opt) => opt.value !== "all")
  .map((opt) => opt.value as string);

const ALL_TIMESLOT_VALUES = timeSlots.map((slot) => slot.value);

export const TimeFilterGroup: React.FC<TimeFilterGroupProps> = ({
  selectedTimeTypes,
  selectedTimeSlots,
  onTimeTypeChange,
  onTimeSlotChange,
}) => {
  const isAllTimeTypesSelected =
    ALL_TIMETYPE_VALUES.length > 0 &&
    selectedTimeTypes.length === ALL_TIMETYPE_VALUES.length &&
    ALL_TIMETYPE_VALUES.every((val) => selectedTimeTypes.includes(val));

  // Determine which time slots to display/enable based on selectedTimeTypes
  // If "all" time type is selected, or no specific type, show all slots.
  // Otherwise, show slots matching selected types.
  let displayableTimeSlots = timeSlots;
  if (
    selectedTimeTypes.length > 0 &&
    !selectedTimeTypes.some(
      (tt) => timeTypeOptions.find((o) => o.value === tt)?.value === "all"
    )
  ) {
    // If specific types (morning/afternoon) are selected, filter slots
    // This logic might need refinement based on how "all" in timeTypeOptions is structured/used.
    // Current assumption: if 'morning' is in selectedTimeTypes, only morning slots are relevant.
    const activeTypes = selectedTimeTypes.filter((tt) => tt !== "all"); // filter out 'all' if it's a value not a meta-selector
    if (activeTypes.length > 0) {
      displayableTimeSlots = timeSlots.filter((slot) =>
        activeTypes.includes(slot.type)
      );
    }
  }

  return (
    <Box
      width="100%"
      padding="20px"
      display="flex"
      flexDirection="column"
      gap="20px"
      bg="#EFEFEF"
      borderRadius="10px"
    >
      {/* Time Type Section */}
      <Flex direction="column" gap="10px">
        <Flex align="center" gap="10px" width="auto" height="28px">
          <Box width="28px" height="28px" position="relative">
            <Box
              position="absolute"
              left="2.33px"
              top="2.33px"
              width="23.33px"
              height="23.33px"
            >
              <Image
                src="/images/swimming/icon4.png"
                alt="시간 아이콘"
                width={23.33}
                height={23.33}
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
            시간
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
          {/* "Select All" Button for Time Type */}
          {timeTypeOptions.find((opt) => opt.value === "all") && (
            <Flex
              key="timetype-all"
              justify="center"
              alignItems="center"
              padding="5px 12px"
              minWidth="118px"
              height="31px"
              bg={isAllTimeTypesSelected ? "#2E3192" : "white"}
              borderRadius="20px"
              onClick={() => onTimeTypeChange("ALL_CLICKED")}
              cursor="pointer"
              border={isAllTimeTypesSelected ? "none" : "1px solid #ddd"}
            >
              <Text
                fontFamily="'Paperlogy', sans-serif"
                fontWeight="600"
                fontSize="15px"
                color={isAllTimeTypesSelected ? "white" : "#838383"}
                textAlign="center"
              >
                {timeTypeOptions.find((opt) => opt.value === "all")?.label}
              </Text>
            </Flex>
          )}
          {/* Individual Time Type Options */}
          {timeTypeOptions
            .filter((opt) => opt.value !== "all")
            .map((option) => {
              const isSelected = selectedTimeTypes.includes(
                option.value as string
              );
              return (
                <Flex
                  key={option.value}
                  justify="center"
                  alignItems="center"
                  padding="5px 12px"
                  minWidth={option.label.length > 10 ? "148px" : "118px"}
                  height="31px"
                  bg={isSelected ? "#2E3192" : "white"}
                  borderRadius="20px"
                  onClick={() => onTimeTypeChange(option.value as string)}
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
      </Flex>

      {/* Time Slot Section */}
      {/* Conditional rendering of morning slots */}
      {(selectedTimeTypes.includes("morning") ||
        isAllTimeTypesSelected ||
        selectedTimeTypes.length === 0) &&
        timeSlots.filter((slot) => slot.type === "morning").length > 0 && (
          <Flex align="center" flexWrap="wrap" gap="10px" width="auto">
            {timeSlots
              .filter((slot) => slot.type === "morning")
              .map((slot) => {
                const isSelected = selectedTimeSlots.includes(slot.value);
                return (
                  <Flex
                    key={slot.value}
                    justify="center"
                    alignItems="center"
                    padding="5px 12px"
                    width="139px"
                    height="31px"
                    gap={isSelected ? "5px" : "0px"}
                    bg={isSelected ? "#2E3192" : "white"}
                    borderRadius="20px"
                    onClick={() => onTimeSlotChange(slot.value)}
                    cursor="pointer"
                    border={isSelected ? "none" : "1px solid #ddd"}
                  >
                    {isSelected && (
                      <Box width="21px" height="21px" position="relative">
                        <Image
                          src="/images/swimming/checkicon.png"
                          alt="체크 아이콘"
                          width={15.75}
                          height={15.75}
                          position="absolute"
                          top="2.63px"
                          left="2.63px"
                        />
                      </Box>
                    )}
                    <Text
                      fontFamily="'Paperlogy', sans-serif"
                      fontWeight="600"
                      fontSize="15px"
                      lineHeight="21px"
                      color={isSelected ? "white" : "#838383"}
                      textAlign="center"
                      width={isSelected ? "auto" : "100%"}
                    >
                      {slot.label}
                    </Text>
                  </Flex>
                );
              })}
          </Flex>
        )}
      {/* Conditional rendering of afternoon slots */}
      {(selectedTimeTypes.includes("afternoon") ||
        isAllTimeTypesSelected ||
        selectedTimeTypes.length === 0) &&
        timeSlots.filter((slot) => slot.type === "afternoon").length > 0 && (
          <Flex align="center" flexWrap="wrap" gap="10px" width="auto">
            {timeSlots
              .filter((slot) => slot.type === "afternoon")
              .map((slot) => {
                const isSelected = selectedTimeSlots.includes(slot.value);
                return (
                  <Flex
                    key={slot.value}
                    justify="center"
                    alignItems="center"
                    padding="5px 12px"
                    width="139px"
                    height="31px"
                    gap={isSelected ? "5px" : "0px"}
                    bg={isSelected ? "#2E3192" : "white"}
                    borderRadius="20px"
                    onClick={() => onTimeSlotChange(slot.value)}
                    cursor="pointer"
                    border={isSelected ? "none" : "1px solid #ddd"}
                  >
                    {isSelected && (
                      <Box width="21px" height="21px" position="relative">
                        <Image
                          src="/images/swimming/checkicon.png"
                          alt="체크 아이콘"
                          width={15.75}
                          height={15.75}
                          position="absolute"
                          top="2.63px"
                          left="2.63px"
                        />
                      </Box>
                    )}
                    <Text
                      fontFamily="'Paperlogy', sans-serif"
                      fontWeight="600"
                      fontSize="15px"
                      lineHeight="21px"
                      color={isSelected ? "white" : "#838383"}
                      textAlign="center"
                      width={isSelected ? "auto" : "100%"}
                    >
                      {slot.label}
                    </Text>
                  </Flex>
                );
              })}
          </Flex>
        )}
    </Box>
  );
};
