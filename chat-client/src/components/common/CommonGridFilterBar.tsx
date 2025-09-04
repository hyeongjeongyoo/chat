"use client";

import React from "react";
import {
  Box,
  Button,
  Field,
  Input,
  NativeSelect,
  Flex,
  IconButton,
  For,
} from "@chakra-ui/react";
import { DownloadIcon, SearchIcon } from "lucide-react";

interface SelectFilterOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectFilterOption[];
  maxWidth?: string;
  placeholder?: string;
}

interface DateFiltersProps {
  show: boolean;
  startDate: string;
  onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  endDate: string;
  onEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDateLabel?: string;
  endDateLabel?: string;
}

interface CommonGridFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchTermPlaceholder?: string;

  onExport: () => void;
  exportButtonLabel?: string;

  selectFilters?: SelectFilterProps[];
  dateFilters?: DateFiltersProps;

  onSearchButtonClick?: () => void;
  showSearchButton?: boolean;

  children?: React.ReactNode; // For custom filter elements like year/month
}

export const CommonGridFilterBar: React.FC<CommonGridFilterBarProps> = ({
  searchTerm,
  onSearchTermChange,
  searchTermPlaceholder = "검색어 입력",
  onExport,
  exportButtonLabel = "엑셀 다운로드",
  selectFilters = [],
  dateFilters,
  onSearchButtonClick,
  showSearchButton = true,
  children,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearchButtonClick?.();
    }
  };

  return (
    <Box>
      <Flex gap={1.5} wrap="nowrap" align="center">
        {children}
        {selectFilters.map((filter) => (
          <NativeSelect.Root
            key={filter.id}
            size="sm"
            maxW={filter.maxWidth || "120px"}
          >
            <NativeSelect.Field
              id={filter.id}
              name={filter.id}
              value={filter.value}
              onChange={filter.onChange}
              fontSize="xs"
              aria-label={filter.label}
            >
              {filter.placeholder && (
                <option value="">{filter.placeholder}</option>
              )}
              <For each={filter.options}>
                {(option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )}
              </For>
            </NativeSelect.Field>
          </NativeSelect.Root>
        ))}
        <Input
          id="commonSearchTerm"
          size="xs"
          placeholder={searchTermPlaceholder}
          value={searchTerm}
          onChange={onSearchTermChange}
          onKeyDown={handleKeyDown}
          fontSize="xs"
          flexGrow={1}
          minW="150px"
          aria-label="Search term"
        />
        {dateFilters?.show && (
          <>
            <Input
              id="commonStartDate"
              size="xs"
              type="date"
              value={dateFilters.startDate}
              onChange={dateFilters.onStartDateChange}
              fontSize="xs"
              maxW="130px"
              aria-label={dateFilters.startDateLabel || "Start date"}
            />
            <Input
              id="commonEndDate"
              size="xs"
              type="date"
              value={dateFilters.endDate}
              onChange={dateFilters.onEndDateChange}
              fontSize="xs"
              maxW="130px"
              aria-label={dateFilters.endDateLabel || "End date"}
            />
          </>
        )}
        {showSearchButton && (
          <IconButton
            size="xs"
            variant="outline"
            aria-label="Search"
            onClick={onSearchButtonClick}
            type="button"
          >
            <SearchIcon size={14} />
          </IconButton>
        )}
        <Button size="xs" variant="outline" onClick={onExport}>
          <DownloadIcon size={14} style={{ marginRight: "4px" }} />
          {exportButtonLabel}
        </Button>
      </Flex>
    </Box>
  );
};
