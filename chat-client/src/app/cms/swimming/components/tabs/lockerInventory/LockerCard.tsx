"use client";

import React, { useState } from "react";
import {
  Box,
  Text,
  Input,
  Stack,
  Card,
  Badge,
  Flex,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { EditIcon, SaveIcon, XIcon } from "lucide-react";
import { useColors } from "@/styles/theme";

export interface LockerData {
  gender: "MALE" | "FEMALE";
  totalQuantity: number; // 총 수량
  usedQuantity: number;
  availableQuantity: number;
}

interface LockerCardProps {
  data: LockerData;
  onSave: (gender: "MALE" | "FEMALE", newTotalQuantity: number) => void;
  isLoading: boolean;
}

export const LockerCard: React.FC<LockerCardProps> = ({
  data,
  onSave,
  isLoading,
}) => {
  const colors = useColors();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<number>(data.totalQuantity ?? 0);

  const handleEdit = () => {
    setEditValue(data.totalQuantity);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue < data.usedQuantity) {
      console.error("Total quantity cannot be less than used quantity.");
      setEditValue(data.totalQuantity);
      return;
    }
    onSave(data.gender, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(data.totalQuantity);
  };

  const usagePercentage =
    data.totalQuantity > 0 ? (data.usedQuantity / data.totalQuantity) * 100 : 0;
  return (
    <Card.Root p={2} size="sm">
      <Card.Body p={0}>
        <Stack gap={1}>
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" fontWeight="bold" color={colors.text.primary}>
              {data.gender === "MALE" ? "남성" : "여성"}
            </Text>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <Badge
                colorPalette={data.availableQuantity > 10 ? "green" : "red"}
                variant="solid"
                size="sm"
              >
                {data.availableQuantity > 10 ? "여유" : "부족"}
              </Badge>
            )}
          </Flex>

          <Flex align="center" justify="space-between">
            <Flex gap={2} fontSize="xs">
              <Flex gap={1}>
                <Text color={colors.text.secondary}>사용:</Text>
                <Text fontWeight="medium">{data.usedQuantity}</Text>
              </Flex>
              <Flex gap={1}>
                <Text color={colors.text.secondary}>가능:</Text>
                <Text fontWeight="medium">{data.availableQuantity}</Text>
              </Flex>
            </Flex>
            <Flex gap={2} align="center" h="36px">
              <Text fontSize="xs" color={colors.text.secondary} minW="40px">
                총수량
              </Text>
              {isEditing ? (
                <Flex gap={1} align="center">
                  <Input
                    size="2xs"
                    w="60px"
                    type="number"
                    value={editValue.toString()}
                    onChange={(e) =>
                      setEditValue(Math.max(0, Number(e.target.value)))
                    }
                    min={data.usedQuantity}
                  />
                  <IconButton
                    size="2xs"
                    variant="solid"
                    colorPalette="blue"
                    onClick={handleSave}
                  >
                    <SaveIcon size={12} />
                  </IconButton>
                  <IconButton size="2xs" variant="ghost" onClick={handleCancel}>
                    <XIcon size={12} />
                  </IconButton>
                </Flex>
              ) : (
                <Flex gap={1} align="center" flex="1">
                  <Text fontSize="xs" fontWeight="medium" flex="1">
                    {data.totalQuantity}
                  </Text>
                  <IconButton size="xs" variant="ghost" onClick={handleEdit}>
                    <EditIcon size={12} />
                  </IconButton>
                </Flex>
              )}
            </Flex>
          </Flex>

          <Box>
            <Flex justify="space-between" align="center" mb={1}>
              <Text fontSize="xs" color={colors.text.secondary}>
                사용률
              </Text>
              <Text fontSize="xs" fontWeight="medium">
                {usagePercentage.toFixed(1)}%
              </Text>
            </Flex>
            <Box
              w="full"
              h="4px"
              bg="gray.200"
              _dark={{ bg: "gray.600" }}
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                w={`${usagePercentage}%`}
                h="full"
                bg={usagePercentage > 80 ? "red.500" : "blue.500"}
                transition="width 0.3s"
              />
            </Box>
          </Box>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};
