"use client";

import React, { useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Separator,
  IconButton,
  useBreakpointValue,
  Drawer,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import { useEstimateContext } from "@/contexts/EstimateContext";
import { Minus, Plus } from "lucide-react";
import { rooms, Seminars } from "@/data/estimateData";

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

const calculateRoomPrice = (
  itemName: string,
  quantity: number,
  checkIn: Date,
  checkOut: Date
) => {
  const room = rooms.find((r) => r.name === itemName);
  if (!room) return 0;

  const { weekday, weekend } = getWeekdayWeekendNights(checkIn, checkOut);
  return (room.weekdayPrice * weekday + room.weekendPrice * weekend) * quantity;
};

const calculateSeminarPrice = (
  itemName: string,
  quantity: number,
  checkIn: Date,
  checkOut: Date
) => {
  const seminar = Seminars.find((s) => s.name === itemName);
  if (!seminar) return 0;

  const nights = (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
  const days = nights + 1;
  return seminar.price * days * quantity;
};

const CartContent = ({ isMobile }: { isMobile: boolean }) => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    updateSeminarDays,
    totalAmount,
    lastAddedItemId,
    clearLastAddedItemId,
  } = useEstimateContext();

  const roomsInCart = cart.filter((item) => item.type === "room");
  const seminarsInCart = cart.filter((item) => item.type === "seminar");
  const lastAddedItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastAddedItemId && lastAddedItemRef.current) {
      lastAddedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      if (!isMobile) {
        const timer = setTimeout(() => {
          clearLastAddedItemId();
        }, 1200);

        return () => clearTimeout(timer);
      }
    }
  }, [lastAddedItemId, isMobile, clearLastAddedItemId]);

  const renderItem = (item: any, isRoom: boolean) => {
    const nights =
      (item.checkOutDate.getTime() - item.checkInDate.getTime()) /
      (1000 * 3600 * 24);
    const days = nights + 1;

    return (
      <Box
        key={item.id}
        p={2}
        ref={item.id === lastAddedItemId ? lastAddedItemRef : null}
        bg={item.id === lastAddedItemId ? "blue.100" : "transparent"}
        borderColor={item.id === lastAddedItemId ? "blue.500" : "transparent"}
        borderWidth="2px"
        borderStyle="solid"
        borderRadius="lg"
        boxShadow={item.id === lastAddedItemId ? "lg" : "none"}
        transition="all 0.5s ease-in-out"
      >
        <HStack justify="space-between">
          <Text fontWeight="bold">{item.name}</Text>
          <CloseButton
            size="sm"
            onClick={() => removeFromCart(item.productId)}
          />
        </HStack>
        {isRoom ? (
          <Box p={2}>
            <HStack justify="space-between" mt={2}>
              <Text fontSize="sm" color="gray.500">
                객실 수
              </Text>
              <HStack>
                <IconButton
                  aria-label="decrease quantity"
                  size="xs"
                  variant="subtle"
                  colorPalette="blue"
                  borderRadius="full"
                  onClick={() =>
                    updateCartItemQuantity(item.id, item.quantity - 1)
                  }
                >
                  <Minus />
                </IconButton>
                <Text>{item.quantity}</Text>
                <IconButton
                  aria-label="increase quantity"
                  size="xs"
                  variant="subtle"
                  colorPalette="blue"
                  borderRadius="full"
                  onClick={() =>
                    updateCartItemQuantity(item.id, item.quantity + 1)
                  }
                >
                  <Plus />
                </IconButton>
              </HStack>
            </HStack>
            <HStack justify="space-between" mt={2}>
              <Text fontSize="sm" color="gray.500">
                {`${nights}박 ${days}일`}
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                ₩
                {calculateRoomPrice(
                  item.name,
                  item.quantity,
                  item.checkInDate,
                  item.checkOutDate
                ).toLocaleString()}
              </Text>
            </HStack>
          </Box>
        ) : (
          <Box p={2}>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                {`사용일수`}
              </Text>
              <HStack>
                <IconButton
                  aria-label="decrease days"
                  size="xs"
                  variant="subtle"
                  colorPalette="blue"
                  borderRadius="full"
                  onClick={() => updateSeminarDays(item.id, days - 1)}
                >
                  <Minus />
                </IconButton>
                <Text>{days}일</Text>
                <IconButton
                  aria-label="increase days"
                  size="xs"
                  variant="subtle"
                  colorPalette="blue"
                  borderRadius="full"
                  onClick={() => updateSeminarDays(item.id, days + 1)}
                >
                  <Plus />
                </IconButton>
              </HStack>
            </HStack>

            <HStack justify="space-between" mt={2}>
              <Text fontSize="sm" color="gray.500">
                합계
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                ₩
                {calculateSeminarPrice(
                  item.name,
                  item.quantity,
                  item.checkInDate,
                  item.checkOutDate
                ).toLocaleString()}
              </Text>
            </HStack>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <VStack w="full" gap={4} align="stretch">
      <Heading size="2xl" fontWeight="800">
        선택 목록
      </Heading>
      {cart.length === 0 ? (
        <Text>선택 목록가 비어 있습니다.</Text>
      ) : (
        <VStack
          gap={4}
          align="stretch"
          separator={<Separator />}
          overflowY="auto"
          maxH="60vh"
          p={2}
        >
          {roomsInCart.length > 0 && (
            <VStack align="stretch" gap={4}>
              <Heading size="2xl" fontWeight="700">
                객실
              </Heading>
              {roomsInCart.map((item) => renderItem(item, true))}
            </VStack>
          )}
          {seminarsInCart.length > 0 && (
            <VStack align="stretch" gap={2}>
              <Heading size="2xl" fontWeight="700">
                세미나실
              </Heading>
              {seminarsInCart.map((item) => renderItem(item, false))}
            </VStack>
          )}
        </VStack>
      )}
      <Separator my={4} />
      <HStack justify="space-between">
        <Text fontWeight="bold" fontSize="lg">
          총 금액
        </Text>
        <Text fontWeight="bold" fontSize="lg" color="blue.500">
          ₩{totalAmount.toLocaleString()}
        </Text>
      </HStack>
    </VStack>
  );
};

export const EstimateCart = ({ handlePrev }: { handlePrev: () => void }) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { cart, generateQuote, clearLastAddedItemId } = useEstimateContext();

  if (isMobile) {
    return (
      <Drawer.Root
        placement="bottom"
        onOpenChange={(details) => {
          if (!details.open) {
            clearLastAddedItemId();
          }
        }}
      >
        <Drawer.Trigger asChild>
          <Button
            position="fixed"
            bottom={0}
            left="50%"
            transform="translateX(-50%)"
            style={{
              backgroundColor: "#2E3192",
              color: "white",
            }}
            w="100%"
            p={0}
            boxShadow="lg"
            zIndex={10}
            borderRadius="none"
          >
            선택 목록 ({cart.length})
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content roundedTop="l3">
              <Drawer.Header>
                <Drawer.Title>선택 목록</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <CartContent isMobile={true} />
              </Drawer.Body>
              <Drawer.Footer>
                <HStack justify="space-between" w="full">
                  <Button onClick={handlePrev} variant="outline">
                    이전
                  </Button>
                  <Button
                    colorPalette="blue"
                    onClick={generateQuote}
                    disabled={cart.length === 0}
                  >
                    가견적서 발행
                  </Button>
                </HStack>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    );
  }

  return (
    <Box
      w="32.5%"
      position="sticky"
      top="80px"
      zIndex={2}
      p={6}
      bg="gray.50"
      borderRadius="lg"
    >
      <CartContent isMobile={false} />
      <HStack justify="space-between" mt={6}>
        <Button size="lg" onClick={handlePrev} variant="outline">
          이전
        </Button>
        <Button
          colorPalette="blue"
          size="lg"
          onClick={generateQuote}
          disabled={cart.length === 0}
        >
          가견적서 발행
        </Button>
      </HStack>
    </Box>
  );
};
