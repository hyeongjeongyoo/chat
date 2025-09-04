"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Table,
} from "@chakra-ui/react";
import { rooms, Seminars } from "@/data/estimateData";
import { CartItem } from "@/types/estimate";
import { DateInfo } from "@/types/calendar";
import Image from "next/image";
import { PrinterIcon } from "lucide-react";

interface QuoteData {
  cart: CartItem[];
  checkInDate: DateInfo;
  checkOutDate: DateInfo;
  totalAmount: number;
}

const getWeekdayWeekendNights = (checkIn: Date, checkOut: Date) => {
  let weekday = 0;
  let weekend = 0;
  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) weekend++;
    else weekday++;
  }
  return { weekday, weekend };
};

const SheetContents = () => {
  const searchParams = useSearchParams();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const decodedData = decodeURIComponent(data);
        const parsedData = JSON.parse(decodedData);

        parsedData.cart.forEach((item: CartItem) => {
          item.checkInDate = new Date(item.checkInDate);
          item.checkOutDate = new Date(item.checkOutDate);
        });
        setQuoteData(parsedData);
      } catch (error) {
        console.error("견적 데이터를 파싱하는데 실패했습니다:", error);
      }
    }
  }, [searchParams]);

  if (!quoteData) {
    return (
      <Box textAlign="center" p={10}>
        <Text>견적 정보를 불러오는 중입니다...</Text>
      </Box>
    );
  }

  const { cart, totalAmount } = quoteData;
  const seminarItems = cart.filter((item) => item.type === "seminar");
  const roomItems = cart.filter((item) => item.type === "room");

  const calculateSeminarPrice = (item: CartItem) => {
    const seminar = Seminars.find((s) => s.name === item.name);
    if (!seminar) return 0;
    const nights =
      (item.checkOutDate.getTime() - item.checkInDate.getTime()) /
      (1000 * 3600 * 24);
    const days = nights + 1;
    return seminar.price * days * item.quantity;
  };

  const calculateRoomPrice = (item: CartItem) => {
    const room = rooms.find((r) => r.name === item.name);
    if (!room) return 0;
    const { weekday, weekend } = getWeekdayWeekendNights(
      item.checkInDate,
      item.checkOutDate
    );
    return (
      (room.weekdayPrice * weekday + room.weekendPrice * weekend) *
      item.quantity
    );
  };

  const seminarSubtotal = seminarItems.reduce(
    (acc, item) => acc + calculateSeminarPrice(item),
    0
  );
  const roomSubtotal = roomItems.reduce(
    (acc, item) => acc + calculateRoomPrice(item),
    0
  );

  return (
    <Box p={{ base: 4, md: 8 }}>
      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
            html, body {
              background: #fff !important;
            }
          }
        `}
      </style>
      <VStack align="stretch" gap={6} maxW="1600px" mx="auto" bg="white">
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" gap={4} position="relative">
            <Box mb={8}>
              <Image
                src="/images/logo/logo.png"
                alt="logo"
                width={240}
                height={120}
                objectFit="cover"
              />
            </Box>
            <Heading as="h1" size="lg" color="#2E3192">
              아르피나 단체예약 견적서
            </Heading>
            <Text fontSize="sm">
              부산광역시 해운대구 해운대해변로
              <br />
              대 표 자: 신 창 호 (인)
              <br />
              사업자등록번호: 383-82-00288
              <br />
              대표전화: 051-731-9800
            </Text>{" "}
            <Box position="absolute" left={90} top={120} zIndex={10}>
              <Image
                src="/images/signature.png"
                alt="직인"
                width={100}
                height={100}
                style={{
                  opacity: 0.8,
                  transform: "rotate(-10deg)",
                }}
              />
            </Box>
          </VStack>
        </HStack>

        <HStack
          bg="#FFFBEB"
          p={4}
          justify="space-between"
          borderRadius="md"
          border="1px solid #F6E05E"
        >
          <Text fontWeight="bold" fontSize="xl">
            견적가
          </Text>
          <Text fontWeight="bold" fontSize="2xl" color="#2E3192">
            ₩{totalAmount.toLocaleString()}
          </Text>
        </HStack>

        {seminarItems.length > 0 && (
          <VStack align="stretch" gap={2}>
            <Heading as="h3" size="md" p={2} mb={2}>
              연회장 (세미나실)
            </Heading>
            <Table.Root variant="line">
              <Table.Header bg="gray.100">
                <Table.Row>
                  <Table.ColumnHeader>층</Table.ColumnHeader>
                  <Table.ColumnHeader>구분</Table.ColumnHeader>
                  <Table.ColumnHeader>종류</Table.ColumnHeader>
                  <Table.ColumnHeader>정원</Table.ColumnHeader>
                  <Table.ColumnHeader>이용기간</Table.ColumnHeader>
                  <Table.ColumnHeader>수량</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">
                    단가
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">
                    합계금액
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {seminarItems.map((item) => {
                  const seminar = Seminars.find((s) => s.name === item.name);
                  const nights =
                    (item.checkOutDate.getTime() - item.checkInDate.getTime()) /
                    (1000 * 3600 * 24);
                  const locationParts = seminar?.location.split("/") || [];
                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell>{locationParts[0]?.trim()}</Table.Cell>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{locationParts[1]?.trim()}</Table.Cell>
                      <Table.Cell>{seminar?.maxPeople}명</Table.Cell>
                      <Table.Cell>{nights + 1}일</Table.Cell>
                      <Table.Cell>{item.quantity}</Table.Cell>
                      <Table.Cell textAlign="right">
                        {seminar?.price.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        {calculateSeminarPrice(item).toLocaleString()}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
            <HStack
              justify="flex-end"
              fontWeight="bold"
              fontSize="lg"
              pr={4}
              py={2}
              bg="gray.100"
            >
              <Text>소계</Text>
              <Text>₩{seminarSubtotal.toLocaleString()}</Text>
            </HStack>
          </VStack>
        )}

        {roomItems.length > 0 && (
          <VStack align="stretch" gap={2}>
            <Heading as="h3" size="md" p={2} mb={2}>
              객실
            </Heading>
            <Table.Root variant="line">
              <Table.Header bg="gray.100">
                <Table.Row>
                  <Table.ColumnHeader>정원</Table.ColumnHeader>
                  <Table.ColumnHeader>타입</Table.ColumnHeader>
                  <Table.ColumnHeader>침실</Table.ColumnHeader>
                  <Table.ColumnHeader>이용기간</Table.ColumnHeader>
                  <Table.ColumnHeader>수량</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">
                    단가(평균)
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">
                    합계금액
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {roomItems.map((item) => {
                  const room = rooms.find((r) => r.name === item.name);
                  const nights =
                    (item.checkOutDate.getTime() - item.checkInDate.getTime()) /
                    (1000 * 3600 * 24);
                  const avgPrice =
                    nights > 0
                      ? calculateRoomPrice(item) / item.quantity / nights
                      : 0;
                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell>{room?.roomType}</Table.Cell>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{room?.bedType}</Table.Cell>
                      <Table.Cell>{nights}박</Table.Cell>
                      <Table.Cell>{item.quantity}실</Table.Cell>
                      <Table.Cell textAlign="right">
                        {Math.round(avgPrice).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        {calculateRoomPrice(item).toLocaleString()}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
            <HStack
              justify="flex-end"
              fontWeight="bold"
              fontSize="lg"
              pr={4}
              py={2}
              bg="gray.100"
            >
              <Text>소계</Text>
              <Text>₩{roomSubtotal.toLocaleString()}</Text>
            </HStack>
          </VStack>
        )}

        <VStack align="stretch" gap={2} fontSize="sm" color="gray.600" pt={4}>
          <Text>
            ※ 해당 견적은 선택된 정보에 의해 산출된 가견적으로 실제 금액과 다를
            수 있습니다.
          </Text>
          <Text>※ 정확한 견적은, 문의를 통해 확인 부탁드리겠습니다.</Text>
        </VStack>

        <HStack
          bg="#2E3192"
          color="white"
          p={4}
          justify="space-between"
          borderRadius="md"
        >
          <Text fontWeight="bold" fontSize="2xl">
            TOTAL
          </Text>
          <Text fontWeight="bold" fontSize="2xl">
            ₩{totalAmount.toLocaleString()}
          </Text>
        </HStack>

        <HStack className="no-print" justify="right" pt={8}>
          <Button
            onClick={() => window.print()}
            variant="surface"
            colorPalette="yellow"
            size="lg"
          >
            <PrinterIcon />
            견적서 인쇄 또는 PDF로 저장
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default function SheetPage() {
  return (
    <Suspense
      fallback={
        <Box textAlign="center" p={10}>
          <Text>견적 정보를 불러오는 중입니다...</Text>
        </Box>
      }
    >
      <SheetContents />
    </Suspense>
  );
}
