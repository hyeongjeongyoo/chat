"use client";

import React from "react";
import { Box, Flex, Text, Image, Button } from "@chakra-ui/react";

interface EstimateCalculatorProps {
  hallList: string[];
  roomList: string[];
  hallDays: number[];
  handleHallDay: (idx: number, delta: number) => void;
  roomNights: number[];
  roomCounts: number[];
  handleRoomCount: (idx: number, delta: number) => void;
  totalAmount: number;
}

export const EstimateCalculator: React.FC<EstimateCalculatorProps> = ({
  hallList,
  roomList,
  hallDays,
  handleHallDay,
  roomNights,
  roomCounts,
  handleRoomCount,
  totalAmount,
}) => {
  return (
    <Box
      w="32.5%"
      className="esimate-prg-box"
      position="sticky"
      top="80px"
      zIndex={2}
    >
      {/* 세미나실/객실 가격적 산출 프로그램 UI */}
      <Box bg="#F7F8FB" borderRadius="2xl" px={10} py={5} mx="auto">
        {/* 상단 타이틀 */}
        <Flex align="center" gap={2} mb={2}>
          <Box as="span">
            <Image
              src="/images/contents/estimate_ico01.png"
              alt="estimate_icon01"
              w="34px"
              h="40px"
            />
          </Box>
          <Text
            fontWeight="800"
            fontSize="2xl"
            background="linear-gradient(90deg, #0C8EA4 0%, rgba(46, 49, 146, 0.80) 100%)"
            backgroundClip="text"
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            세미나실/객실 가견적 산출 프로그램
          </Text>
        </Flex>
        <Text
          backgroundColor="#ffffff"
          fontSize="md"
          fontWeight="700"
          color="#0C8EA4"
          mb={3}
          borderRadius="lg"
          p={1}
          textAlign="center"
        >
          선택하신 세미나실 정보가 표시됩니다
        </Text>
        {/* 세미나실 테이블 */}
        <Box bg="white" borderRadius="lg" p={3} mb={4}>
          <Flex fontWeight="600" color="#0C8EA4" fontSize="sm" mb={2}>
            <Box flex="1">세미나실명</Box>
            <Box w="120px" textAlign="center">
              이용기간(일)
            </Box>
          </Flex>
          {hallList.map((name, idx) => (
            <Flex key={name} align="center" mb={1}>
              <Box flex="1" fontSize="xl">
                {name}
              </Box>
              <Flex
                border="1px solid #0C8EA4"
                borderRadius="md"
                w="120px"
                align="center"
                justify="center"
                gap={2}
              >
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="#373636"
                  onClick={() => handleHallDay(idx, -1)}
                >
                  -
                </Button>
                <Text color="#0C8EA4" fontWeight="600" fontSize="sm">
                  {hallDays[idx]}
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="#373636"
                  onClick={() => handleHallDay(idx, 1)}
                >
                  +
                </Button>
              </Flex>
            </Flex>
          ))}
        </Box>
        <Text
          backgroundColor="#ffffff"
          fontSize="md"
          fontWeight="700"
          color="#2E3192"
          mb={3}
          borderRadius="lg"
          p={1}
          textAlign="center"
        >
          선택하신 객실 정보가 표시됩니다
        </Text>
        {/* 객실 테이블 */}
        <Box bg="white" borderRadius="lg" p={3} mb={4}>
          <Flex fontWeight="600" color="#2E3192" fontSize="sm" mb={2}>
            <Box flex="1">객실명</Box>
            <Box w="80px" textAlign="center">
              이용기간(박)
            </Box>
            <Box w="120px" textAlign="center">
              수량
            </Box>
          </Flex>
          {roomList.map((name, idx) => (
            <Flex key={name} align="center" mb={1}>
              <Box flex="1" fontSize="xl">
                {name}
              </Box>
              {/* 이용기간(박): 값만 표시, 버튼 없음 */}
              <Box
                w="80px"
                color="#838383"
                fontWeight="600"
                fontSize="sm"
                textAlign="center"
              >
                {roomNights[idx]}
              </Box>
              {/* 수량: ± 버튼 */}
              <Flex
                border="1px solid #2E3192"
                borderRadius="md"
                w="120px"
                align="center"
                justify="center"
                gap={2}
              >
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="#373636"
                  onClick={() => handleRoomCount(idx, -1)}
                >
                  -
                </Button>
                <Text color="#2E3192" fontWeight="600" fontSize="sm">
                  {roomCounts[idx]}
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="#373636"
                  onClick={() => handleRoomCount(idx, 1)}
                >
                  +
                </Button>
              </Flex>
            </Flex>
          ))}
        </Box>
        {/* 총금액 영역 */}
        <Box
          bg="#FAB20B"
          borderRadius="md"
          p={4}
          mb={3}
          fontWeight="700"
          fontSize="xl"
          color="#2E3192"
        >
          총금액
          <br />
          <Text
            fontSize="4xl"
            color="#000000"
            fontWeight="700"
            textAlign="right"
          >
            {totalAmount > 0
              ? `₩ ${totalAmount.toLocaleString()}`
              : "정보 선택 후 확인 가능"}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
