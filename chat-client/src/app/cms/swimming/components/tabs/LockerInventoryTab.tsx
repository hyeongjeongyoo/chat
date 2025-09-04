"use client";

import { useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  LockerInventoryDto,
  ApiResponse,
  LockerInventoryUpdateRequestDto,
} from "@/types/api";
import { LockerCard, type LockerData } from "./lockerInventory/LockerCard";
import { toaster } from "@/components/ui/toaster";

const lockerInventoryQueryKey = ["lockerInventory"];

const transformDtoToCardData = (dto: LockerInventoryDto): LockerData => ({
  gender: dto.gender,
  totalQuantity: dto.totalQuantity,
  usedQuantity: dto.usedQuantity,
  availableQuantity: dto.availableQuantity,
});

export const LockerInventoryTab = () => {
  const queryClient = useQueryClient();

  const {
    data: inventoryDtoArray,
    isLoading,
    isError,
    error,
  } = useQuery<ApiResponse<LockerInventoryDto[]>, Error, LockerInventoryDto[]>({
    queryKey: lockerInventoryQueryKey,
    queryFn: () => adminApi.getLockerInventory(),
    select: (response) => {
      if (!response.success || !response.data) {
        console.error("Failed to fetch locker inventory:", response.message);
        throw new Error(response.message || "Failed to fetch locker inventory");
      }
      return response.data;
    },
  });

  const updateMutation = useMutation<
    ApiResponse<LockerInventoryDto>,
    Error,
    { gender: "MALE" | "FEMALE"; newTotalQuantity: number }
  >({
    mutationFn: ({ gender, newTotalQuantity }) => {
      const updateDto: LockerInventoryUpdateRequestDto = {
        totalQuantity: newTotalQuantity,
      };
      return adminApi.updateLockerInventory(gender, updateDto);
    },
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        toaster.create({
          title: "수량 업데이트 성공",
          description: `${variables.gender} 사물함 총 수량이 ${response.data.totalQuantity}(으)로 업데이트되었습니다.`,
          type: "success",
          duration: 3000,
        });
        queryClient.invalidateQueries({ queryKey: lockerInventoryQueryKey });
      } else {
        toaster.create({
          title: "업데이트 실패",
          description:
            response.message || "사물함 수량 업데이트 중 오류가 발생했습니다.",
          type: "error",
          duration: 5000,
        });
      }
    },
    onError: (error, variables) => {
      toaster.create({
        title: "업데이트 오류",
        description:
          error.message ||
          `${variables.gender} 사물함 수량 업데이트 중 심각한 오류가 발생했습니다.`,
        type: "error",
        duration: 5000,
      });
    },
  });

  const handleUpdateQuantity = useCallback(
    (gender: "MALE" | "FEMALE", newTotalQuantity: number) => {
      if (newTotalQuantity < 0) {
        toaster.create({
          title: "유효하지 않은 수량",
          description: "총 수량은 0 이상이어야 합니다.",
          type: "warning",
          duration: 3000,
        });
        return;
      }

      const currentInventoryItem = inventoryDtoArray?.find(
        (item) => item.gender === gender
      );
      if (
        currentInventoryItem &&
        newTotalQuantity < currentInventoryItem.usedQuantity
      ) {
        toaster.create({
          title: "수량 설정 오류",
          description: `총 수량(${newTotalQuantity})은 사용 중인 수량(${currentInventoryItem.usedQuantity})보다 적을 수 없습니다.`,
          type: "error",
          duration: 5000,
        });
        return;
      }

      updateMutation.mutate({ gender, newTotalQuantity });
    },
    [updateMutation, inventoryDtoArray]
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isError || !inventoryDtoArray) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
        <Heading size="md" color="red.500">
          오류 발생
        </Heading>
        <Text mt={2}>
          사물함 재고 정보를 가져오는 중 오류가 발생했습니다:{" "}
          {error?.message || "데이터를 불러오지 못했습니다."}
        </Text>
      </Box>
    );
  }

  const lockerDataForCards: LockerData[] = inventoryDtoArray
    ? inventoryDtoArray.map(transformDtoToCardData)
    : [];

  const genders: ("MALE" | "FEMALE")[] = ["MALE", "FEMALE"];
  const finalLockerCardsData = genders.map((gender) => {
    const existingData = lockerDataForCards.find((d) => d.gender === gender);
    if (existingData) return existingData;
    return {
      gender,
      totalQuantity: 0,
      usedQuantity: 0,
      availableQuantity: 0,
    } as LockerData;
  });

  return (
    <Box>
      <SimpleGrid columns={{ base: 1 }} gap={2}>
        {finalLockerCardsData.map((locker) => (
          <LockerCard
            key={locker.gender}
            data={locker}
            onSave={handleUpdateQuantity}
            isLoading={
              updateMutation.isPending &&
              updateMutation.variables?.gender === locker.gender
            }
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};
