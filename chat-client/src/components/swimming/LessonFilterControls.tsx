"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Accordion,
  Separator,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  monthOptions,
  timeTypeOptions,
  timeSlots,
  ACCORDION_ITEM_VALUE,
} from "./filterConstants"; // Import constants
import { MonthFilterGroup } from "./MonthFilterGroup"; // Import MonthFilterGroup
import { TimeFilterGroup } from "./TimeFilterGroup"; // Import TimeFilterGroup
import { SelectedFilterTags } from "./SelectedFilterTags"; // Import the new component

interface FilterState {
  status: string[];
  month: number[];
  timeType: string[];
  timeSlot: string[];
}

interface LessonFilterControlsProps {
  onFilterChange: (newFilter: FilterState) => void;
  selectedFilters: string[];
  onSelectedFiltersChange: (newSelectedFilters: string[]) => void;
  categoryOpen: boolean;
  onCategoryToggle: (isOpen: boolean) => void;
}

// Helper to get all selectable values for a category (excluding 'all' meta-options)
const getAllValues = (
  options: Array<{ value: string | number }>
): (string | number)[] => {
  return options.filter((opt) => opt.value !== "all").map((opt) => opt.value);
};
const getAllSlotValues = (): string[] => timeSlots.map((slot) => slot.value);

// Wrap component with React.memo
export const LessonFilterControls: React.FC<LessonFilterControlsProps> = memo(
  ({
    onFilterChange,
    selectedFilters,
    onSelectedFiltersChange,
    categoryOpen,
    onCategoryToggle,
  }) => {
    const [filter, setFilter] = useState<FilterState>(() => ({
        status: [],
        month: [],
        timeType: [],
        timeSlot: [],
    }));

    // Effect to update parent (SwimmingLessonList) when internal filter state changes
    useEffect(() => {
      onFilterChange(filter);
    }, [filter, onFilterChange]);

    // Effect to update selectedFilter LABELS whenever the filter state changes
    useEffect(() => {
      const newSelectedFilterLabels: string[] = [];

      filter.month.forEach((val) => {
        const option = monthOptions.find((opt) => opt.value === val);
        if (option && option.value !== "all")
          newSelectedFilterLabels.push(option.label);
      });
      filter.timeType.forEach((val) => {
        const option = timeTypeOptions.find((opt) => opt.value === val);
        if (option && option.value !== "all")
          newSelectedFilterLabels.push(option.label);
      });
      filter.timeSlot.forEach((val) => {
        const option = timeSlots.find((opt) => opt.value === val);
        if (option) newSelectedFilterLabels.push(option.label);
      });
      onSelectedFiltersChange(newSelectedFilterLabels);
    }, [filter, onSelectedFiltersChange]);

    const handleFilterChangeInternal = useCallback(
      (
        category: keyof FilterState,
        valueClicked: string | number | "ALL_CLICKED"
      ) => {
        setFilter((prevFilter) => {
          const newFilterState = { ...prevFilter };
          let currentCategoryValues = [...prevFilter[category]] as (
            | string
            | number
          )[];
          let allPossiblePrimaryValues: (string | number)[] = [];
          if (category === "month") {
            allPossiblePrimaryValues = getAllValues(monthOptions);
          } else if (category === "timeType") {
            allPossiblePrimaryValues = getAllValues(timeTypeOptions);
          } else if (category === "timeSlot") {
            allPossiblePrimaryValues = getAllSlotValues();
          }

          if (valueClicked === "ALL_CLICKED") {
            const areAllCurrentlySelected =
              allPossiblePrimaryValues.length > 0 &&
              currentCategoryValues.length ===
                allPossiblePrimaryValues.length &&
              allPossiblePrimaryValues.every((val) =>
                currentCategoryValues.includes(val)
              );
            if (areAllCurrentlySelected) {
              newFilterState[category] = [] as any;
            } else {
              newFilterState[category] = [...allPossiblePrimaryValues] as any;
            }
            if (category === "timeType") {
              if (areAllCurrentlySelected) {
                newFilterState.timeSlot = [];
              } else {
                newFilterState.timeSlot = getAllSlotValues();
              }
            }
          } else {
            const itemIndex = currentCategoryValues.indexOf(
              valueClicked as never
            );
            if (itemIndex > -1) {
              currentCategoryValues.splice(itemIndex, 1);
            } else {
              currentCategoryValues.push(valueClicked as never);
            }
            newFilterState[category] = [...currentCategoryValues] as any;
            if (category === "timeType") {
              let updatedTimeSlots: string[] = [];
              (newFilterState.timeType as string[]).forEach((tt) => {
                const timeTypeOpt = timeTypeOptions.find(
                  (o) => o.value === tt && o.value !== "all"
                );
                if (timeTypeOpt) {
                  timeSlots
                    .filter((slot) => slot.type === tt)
                    .forEach((s) => updatedTimeSlots.push(s.value));
                }
              });
              newFilterState.timeSlot = Array.from(new Set(updatedTimeSlots));
            }
          }
          return newFilterState;
        });
      },
      [setFilter]
    );

    const removeFilterInternal = useCallback(
      (filterLabel: string) => {
        let categoryToUpdate: keyof FilterState | null = null;
        let valueToRemove: string | number | null = null;
        {
          const monthOpt = monthOptions.find(
            (opt) => opt.label === filterLabel
          );
          if (monthOpt) {
            categoryToUpdate = "month";
            valueToRemove = monthOpt.value;
          } else {
            const timeTypeOpt = timeTypeOptions.find(
              (opt) => opt.label === filterLabel
            );
            if (timeTypeOpt) {
              categoryToUpdate = "timeType";
              valueToRemove = timeTypeOpt.value;
            } else {
              const timeSlotOpt = timeSlots.find(
                (opt) => opt.label === filterLabel
              );
              if (timeSlotOpt) {
                categoryToUpdate = "timeSlot";
                valueToRemove = timeSlotOpt.value;
              }
            }
          }
        }

        if (categoryToUpdate && valueToRemove !== null) {
          setFilter((prevFilter) => {
            const newFilterState = { ...prevFilter };
            const currentCategoryValues = [
              ...prevFilter[categoryToUpdate!],
            ] as (string | number)[];
            const itemIndex = currentCategoryValues.indexOf(
              valueToRemove as never
            );
            if (itemIndex > -1) {
              currentCategoryValues.splice(itemIndex, 1);
              newFilterState[categoryToUpdate!] = [
                ...currentCategoryValues,
              ] as any;
              if (categoryToUpdate === "timeType") {
                let updatedTimeSlots: string[] = [];
                (newFilterState.timeType as string[]).forEach((tt) => {
                  const timeTypeOptConcrete = timeTypeOptions.find(
                    (o) => o.value === tt && o.value !== "all"
                  );
                  if (timeTypeOptConcrete) {
                    timeSlots
                      .filter((slot) => slot.type === tt)
                      .forEach((s) => updatedTimeSlots.push(s.value));
                  }
                });
                newFilterState.timeSlot = Array.from(new Set(updatedTimeSlots));
              }
              return newFilterState;
            }
            return prevFilter;
          });
        }
      },
      [setFilter]
    );

    const resetFiltersToEmpty = useCallback(() => {
      const emptyState = {
        status: [],
        month: [],
        timeType: [],
        timeSlot: [],
      };
      setFilter(emptyState);
    }, [setFilter]);

    const titleFontSize = useBreakpointValue({
      base: "18px",
      md: "22px",
      lg: "27px",
    });
    const resetTextFontSize = useBreakpointValue({
      base: "14px",
      md: "18px",
      lg: "23px",
    });
    const iconSize = useBreakpointValue({ base: "20px", md: "23px" });

    return (
      <>
        <Accordion.Root
          collapsible
          value={categoryOpen ? [ACCORDION_ITEM_VALUE] : []}
          onValueChange={(details) => {
            onCategoryToggle(details.value.includes(ACCORDION_ITEM_VALUE));
          }}
          maxW="100%"
          mb={4}
        >
          <Accordion.Item value={ACCORDION_ITEM_VALUE}>
            <Accordion.ItemTrigger _hover={{ bg: "transparent" }}>
              <Box width="100%">
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", sm: "center" }}
                  width="100%"
                  minHeight="60px"
                  bg="#F7F8FB"
                  borderRadius="10px"
                  p={{ base: 3, md: 5 }}
                  gap={{ base: 2, sm: 0 }}
                >
                  <Flex
                    align="center"
                    gap={{ base: 2, md: "10px" }}
                    flex={1}
                    minHeight="30px"
                  >
                    <Image
                      src="/images/swimming/icon1.png"
                      alt="카테고리 아이콘"
                      width={iconSize}
                      height={iconSize}
                    />
                    <Text
                      fontFamily="'Paperlogy', sans-serif"
                      fontWeight="700"
                      fontSize={titleFontSize}
                      lineHeight={{ base: "22px", md: "30px" }}
                      letterSpacing="-0.05em"
                      color="#373636"
                    >
                      출력하실 카테고리를 선택해주세요
                    </Text>
                  </Flex>

                  <Flex
                    align="center"
                    gap={2}
                    onClick={(e) => {
                      e.stopPropagation();
                      resetFiltersToEmpty();
                    }}
                    cursor="pointer"
                    mt={{ base: 2, sm: 0 }}
                  >
                    <Text
                      fontFamily="'Paperlogy', sans-serif"
                      fontWeight="500"
                      fontSize={resetTextFontSize}
                      lineHeight={{ base: "20px", md: "28px" }}
                      letterSpacing="-0.05em"
                      color="#373636"
                      display={{ base: "none", md: "flex" }}
                      alignItems="center"
                    >
                      선택 초기화
                    </Text>
                    <Image
                      src="/images/swimming/icon7.png"
                      alt="초기화 아이콘"
                      width={iconSize}
                      height={iconSize}
                    />
                  </Flex>
                  <Accordion.ItemIndicator
                    ml={{ base: "auto", sm: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryToggle(!categoryOpen);
                    }}
                  />
                </Flex>
              </Box>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody p={{ base: 2, md: 0 }}>
                <Flex
                  direction="column"
                  align="flex-start"
                  gap="5px"
                  width="100%"
                  mb={6}
                >
                  <MonthFilterGroup
                    selectedValues={filter.month}
                    onFilterChange={(value) =>
                      handleFilterChangeInternal("month", value)
                    }
                  />
                  <TimeFilterGroup
                    selectedTimeTypes={filter.timeType}
                    selectedTimeSlots={filter.timeSlot}
                    onTimeTypeChange={(value) =>
                      handleFilterChangeInternal("timeType", value)
                    }
                    onTimeSlotChange={(value) =>
                      handleFilterChangeInternal("timeSlot", value)
                    }
                  />
                </Flex>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
        {selectedFilters.length > 0 && (
          <>
            <SelectedFilterTags
              selectedFilterLabels={selectedFilters}
              onRemoveFilter={removeFilterInternal}
            />
            <Separator
              orientation="horizontal"
              borderColor="#E0E0E0"
              borderTopWidth={0}
              borderLeftWidth={0}
              borderRightWidth={0}
              borderBottomWidth="1px"
              borderStyle="solid"
              my={4}
            />
          </>
        )}
      </>
    );
  }
); // Close React.memo

LessonFilterControls.displayName = "LessonFilterControls";

export { ACCORDION_ITEM_VALUE }; // Export the constant
