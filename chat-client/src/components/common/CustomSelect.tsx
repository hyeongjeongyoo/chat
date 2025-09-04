"use client";

import React from "react";
import { Box, Text } from "@chakra-ui/react";
import {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  FieldErrors,
} from "react-hook-form";

interface CustomSelectProps<T, TFieldValues extends FieldValues = FieldValues> {
  field: ControllerRenderProps<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  options: T[];
  selectStyle: React.CSSProperties;
  placeholder: string;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string;
}

export function CustomSelect<
  T,
  TFieldValues extends FieldValues = FieldValues
>({
  field,
  errors,
  options,
  selectStyle,
  placeholder,
  getOptionLabel = (option: any) => option.name,
  getOptionValue = (option: any) => option.id.toString(),
}: CustomSelectProps<T, TFieldValues>) {
  const error = errors[field.name] as FieldError | undefined;

  return (
    <Box>
      <select
        {...field}
        style={{
          ...selectStyle,
          borderColor: error ? "var(--chakra-colors-red-500)" : "inherit",
        }}
        value={field.value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const selectedOption = options.find(
            (option) => getOptionValue(option) === e.target.value
          );
          field.onChange(selectedOption ? getOptionValue(selectedOption) : "");
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option
            key={`${getOptionValue(option)}-${index}`}
            value={getOptionValue(option)}
          >
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
      {error?.message && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error.message}
        </Text>
      )}
    </Box>
  );
}
