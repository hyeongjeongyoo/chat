"use client";

import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  ListItem,
  Heading,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { BedIcon, AreaIcon, CheckIcon } from "@/components/icons";
import { DateRangePicker } from "@/components/calendar/DateRangePicker";

interface DateInfo {
  year: number;
  month: number;
  day: number;
}

interface RoomImage {
  src: string;
}

interface RoomInfoProps {
  name: string;
  roomType: string;
  bedType: string;
  area: string;
  weekdayPrice: number;
  weekendPrice: number;
  images: RoomImage[];
  amenities: string[];
  onQuantityChange: (delta: number) => void;
  quantity: number;
}

export const RoomInfoSection = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<DateInfo | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<DateInfo | null>(null);
  const [selectionMode, setSelectionMode] = useState<"checkIn" | "checkOut">(
    "checkIn"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nextMonthDate, setNextMonthDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );

  const handleDateClick = (day: number, monthDate: Date) => {
    const dateInfo: DateInfo = {
      year: monthDate.getFullYear(),
      month: monthDate.getMonth(),
      day: day,
    };

    if (selectionMode === "checkIn") {
      setCheckInDate(dateInfo);
      setSelectionMode("checkOut");
    } else {
      const checkIn = new Date(
        checkInDate!.year,
        checkInDate!.month,
        checkInDate!.day
      );
      const checkOut = new Date(dateInfo.year, dateInfo.month, dateInfo.day);

      if (checkOut > checkIn) {
        setCheckOutDate(dateInfo);
      } else {
        setCheckInDate(dateInfo);
        setCheckOutDate(null);
      }
      setSelectionMode("checkIn");
    }
  };

  const handlePrevMonth = () => {
    const newCurrentDate = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );
    const newNextMonthDate = new Date(newCurrentDate);
    newNextMonthDate.setMonth(newCurrentDate.getMonth() + 1);

    setCurrentDate(new Date(newCurrentDate));
    setNextMonthDate(new Date(newNextMonthDate));
  };

  const handleNextMonth = () => {
    const newCurrentDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 1)
    );
    const newNextMonthDate = new Date(newCurrentDate);
    newNextMonthDate.setMonth(newCurrentDate.getMonth() + 1);

    setCurrentDate(new Date(newCurrentDate));
    setNextMonthDate(new Date(newNextMonthDate));
  };

  const handleApplyDates = () => {
    setIsCalendarOpen(false);
  };

  const handleResetDates = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectionMode("checkIn");
  };

  const formatDate = (date: DateInfo | null) => {
    if (!date) return "";
    return `${date.year}.${String(date.month + 1).padStart(2, "0")}.${String(
      date.day
    ).padStart(2, "0")}`;
  };

  const rooms: RoomInfoProps[] = [
    {
      name: "디럭스 더블",
      roomType: "디럭스",
      bedType: "더블",
      area: "26",
      weekdayPrice: 99000,
      weekendPrice: 99000,
      images: [
        { src: "/images/rooms/deluxe_double_1.jpg" },
        { src: "/images/rooms/deluxe_double_2.jpg" },
        { src: "/images/rooms/deluxe_double_3.jpg" },
      ],
      amenities: [
        "TV",
        "냉장고",
        "에어컨",
        "드라이기",
        "전기포트",
        "커피/티",
        "생수 2병",
        "샴푸",
        "바디워시",
        "치약",
        "칫솔",
      ],
      onQuantityChange: () => {},
      quantity: 0,
    },
    {
      name: "디럭스 트윈",
      roomType: "디럭스",
      bedType: "트윈",
      area: "26",
      weekdayPrice: 99000,
      weekendPrice: 99000,
      images: [
        { src: "/images/rooms/deluxe_twin_1.jpg" },
        { src: "/images/rooms/deluxe_twin_2.jpg" },
        { src: "/images/rooms/deluxe_twin_3.jpg" },
      ],
      amenities: [
        "TV",
        "냉장고",
        "에어컨",
        "드라이기",
        "전기포트",
        "커피/티",
        "생수 2병",
        "샴푸",
        "바디워시",
        "치약",
        "칫솔",
      ],
      onQuantityChange: () => {},
      quantity: 0,
    },
  ];

  return (
    <Box className="msec02" mb={{ base: "15px", md: "20px", lg: "45px" }}>
      <Box
        w={"100%"}
        maxW={"1600px"}
        mx="auto"
        my={0}
        px={{ base: 2, md: 5, lg: 7, "2xl": 0 }}
      >
        <Heading
          as="h3"
          mb={{ base: 4, md: 5, lg: 6 }}
          fontSize={{ base: "24px", md: "32px", lg: "40px" }}
          fontWeight="bold"
          color={"#444445"}
          lineHeight={"1"}
          fontFamily="'Paperlogy', sans-serif"
        >
          객실 안내
        </Heading>

        <Flex
          className="msec02-box"
          gap={{ base: 4, md: 5, lg: 6 }}
          direction={{ base: "column", md: "column", lg: "row" }}
        >
          <Box flex="1">
            <Flex
              direction="column"
              gap={{ base: 4, md: 5, lg: 6 }}
              className="room-list"
            >
              {rooms.map((room, index) => (
                <Box
                  key={index}
                  className="room-item"
                  borderRadius={{ base: "10px", md: "15px", lg: "20px" }}
                  overflow="hidden"
                  bg="white"
                  boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
                >
                  <Box position="relative">
                    <Box
                      position="relative"
                      className="swiper-container"
                      _before={{
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        width: "100px",
                        height: { base: "40px", md: "60px", lg: "80px" },
                        background: "white",
                        borderTopRightRadius: {
                          base: "10px",
                          md: "15px",
                          lg: "20px",
                        },
                        zIndex: 1,
                      }}
                      _after={{
                        content: '""',
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: "100px",
                        height: { base: "40px", md: "60px", lg: "80px" },
                        background: "white",
                        borderBottomLeftRadius: {
                          base: "10px",
                          md: "15px",
                          lg: "20px",
                        },
                        zIndex: 1,
                      }}
                    >
                      <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={0}
                        slidesPerView={1}
                        navigation={{
                          prevEl: `.msec02-swiper-button-prev-${index}`,
                          nextEl: `.msec02-swiper-button-next-${index}`,
                        }}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        loop={true}
                      >
                        {room.images.map((image, imageIndex) => (
                          <SwiperSlide key={imageIndex}>
                            <Box
                              position="relative"
                              w="100%"
                              className="msec02-image-wrapper"
                              pb="56.25%"
                            >
                              <Image
                                src={image.src}
                                alt={`${room.name} 이미지 ${imageIndex + 1}`}
                                position="absolute"
                                top="0"
                                left="0"
                                w="100%"
                                h="100%"
                                objectFit="cover"
                              />
                            </Box>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </Box>
                  </Box>

                  <Box p={{ base: 4, md: 5, lg: 6 }}>
                    <Flex direction="column" gap={{ base: 3, md: 4, lg: 5 }}>
                      <Flex
                        justify="space-between"
                        align="flex-start"
                        gap={{ base: 3, md: 4, lg: 5 }}
                      >
                        <Box flex="1">
                          <Text
                            fontSize={{
                              base: "20px",
                              md: "24px",
                              lg: "28px",
                            }}
                            fontWeight="700"
                            color="#2E3192"
                            mb={{ base: 2, md: 3, lg: 4 }}
                          >
                            {room.name}
                          </Text>
                          <Flex
                            gap={{ base: 3, md: 4, lg: 5 }}
                            color="#6B6B6B"
                            fontSize={{
                              base: "14px",
                              md: "16px",
                              lg: "18px",
                            }}
                          >
                            <Flex align="center" gap={1}>
                              <BedIcon />
                              <Text>{room.bedType}</Text>
                            </Flex>
                            <Flex align="center" gap={1}>
                              <AreaIcon />
                              <Text>{room.area}㎡</Text>
                            </Flex>
                          </Flex>
                        </Box>
                        <Box>
                          <Text
                            fontSize={{
                              base: "24px",
                              md: "28px",
                              lg: "32px",
                            }}
                            fontWeight="700"
                            color="#2E3192"
                            textAlign="right"
                          >
                            {room.weekdayPrice.toLocaleString()}원
                          </Text>
                          <Text
                            fontSize={{
                              base: "12px",
                              md: "14px",
                              lg: "16px",
                            }}
                            color="#6B6B6B"
                            textAlign="right"
                          >
                            {room.weekendPrice === room.weekdayPrice
                              ? "주중/주말"
                              : "주중"}
                          </Text>
                        </Box>
                      </Flex>

                      <Box>
                        <Text
                          fontSize={{
                            base: "14px",
                            md: "16px",
                            lg: "18px",
                          }}
                          fontWeight="600"
                          color="#2E3192"
                          mb={2}
                        >
                          객실 편의시설
                        </Text>
                        <Flex
                          display="flex"
                          flexWrap="wrap"
                          gap={{ base: 1, md: 1.5, lg: 2 }}
                          m={0}
                        >
                          {room.amenities.map((amenity, amenityIndex) => (
                            <ListItem
                              key={amenityIndex}
                              display="flex"
                              alignItems="center"
                              gap={1}
                              color="#6B6B6B"
                              fontSize={{
                                base: "12px",
                                md: "14px",
                                lg: "16px",
                              }}
                            >
                              <CheckIcon />
                              {amenity}
                            </ListItem>
                          ))}
                        </Flex>
                      </Box>

                      <Flex
                        mt={{ base: 2, md: 3, lg: 4 }}
                        justify="space-between"
                        align="center"
                        gap={3}
                      >
                        <Popover.Root
                          open={isCalendarOpen}
                          onOpenChange={(state) =>
                            setIsCalendarOpen(state.open)
                          }
                          positioning={{ placement: "bottom" }}
                          modal={false}
                        >
                          <Popover.Trigger asChild>
                            <Button
                              variant="outline"
                              borderColor="#E2E8F0"
                              borderRadius={{
                                base: "6px",
                                md: "7px",
                                lg: "8px",
                              }}
                              px={{ base: 3, md: 4, lg: 5 }}
                              py={{ base: 1.5, md: 2, lg: 2.5 }}
                              flex="1"
                            >
                              <Text
                                fontSize={{
                                  base: "14px",
                                  md: "16px",
                                  lg: "18px",
                                }}
                                color={
                                  checkInDate && checkOutDate
                                    ? "#2E3192"
                                    : "#A0AEC0"
                                }
                                fontWeight={
                                  checkInDate && checkOutDate ? "600" : "400"
                                }
                              >
                                {checkInDate && checkOutDate
                                  ? `${formatDate(checkInDate)} - ${formatDate(
                                      checkOutDate
                                    )}`
                                  : "체크인 - 체크아웃"}
                              </Text>
                            </Button>
                          </Popover.Trigger>
                          <Portal>
                            <Popover.Positioner>
                              <Popover.Content
                                w={{
                                  base: "calc(100vw - 32px)",
                                  md: "600px",
                                  lg: "800px",
                                }}
                                maxW="800px"
                                border="none"
                                borderRadius={{
                                  base: "10px",
                                  md: "15px",
                                  lg: "20px",
                                }}
                                boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
                                _focus={{ boxShadow: "none" }}
                              >
                                <Popover.Body p={0}>
                                  <DateRangePicker
                                    currentDate={currentDate}
                                    nextMonthDate={nextMonthDate}
                                    checkInDate={checkInDate}
                                    checkOutDate={checkOutDate}
                                    selectionMode={selectionMode}
                                    onDateClick={handleDateClick}
                                    onPrevMonth={handlePrevMonth}
                                    onNextMonth={handleNextMonth}
                                    onApplyDates={handleApplyDates}
                                    onResetDates={handleResetDates}
                                  />
                                </Popover.Body>
                              </Popover.Content>
                            </Popover.Positioner>
                          </Portal>
                        </Popover.Root>

                        <Flex
                          align="center"
                          gap={2}
                          borderRadius={{
                            base: "6px",
                            md: "7px",
                            lg: "8px",
                          }}
                          border="1px solid"
                          borderColor="#E2E8F0"
                          p={{ base: 1, md: 1.5, lg: 2 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => room.onQuantityChange(-1)}
                            disabled={room.quantity === 0}
                            color="#2E3192"
                            _hover={{ bg: "#ECECF6" }}
                            h="auto"
                            minW="auto"
                            p={1}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 12H19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Button>
                          <Text
                            w="40px"
                            textAlign="center"
                            fontSize={{
                              base: "14px",
                              md: "16px",
                              lg: "18px",
                            }}
                            fontWeight="600"
                            color="#2E3192"
                          >
                            {room.quantity}
                          </Text>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => room.onQuantityChange(1)}
                            color="#2E3192"
                            _hover={{ bg: "#ECECF6" }}
                            h="auto"
                            minW="auto"
                            p={1}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 5V19M5 12H19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};
