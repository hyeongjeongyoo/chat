"use client";

import {
  Box,
  Flex,
  Text,
  Grid,
  GridItem,
  useBreakpointValue,
  Icon,
} from "@chakra-ui/react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useLessons } from "@/lib/hooks/useSwimming";
import { LessonDTO } from "@/types/swimming";
import { LessonFilterControls } from "./LessonFilterControls";
import { LessonCard } from "./LessonCard";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { FiClock } from "react-icons/fi";

// dayjs 커스텀 파싱 플러그인 추가
dayjs.extend(customParseFormat);

const parseKSTDateString = (
  kstDateStringWithSuffix: string | undefined
): Date | null => {
  if (!kstDateStringWithSuffix) {
    return null;
  }

  // "YYYY.MM.DD HH:MM:SS 까지"와 같은 포맷을 파싱
  let parsableDateStr = kstDateStringWithSuffix
    .replace(/부터|까지/g, "")
    .trim();
  parsableDateStr = parsableDateStr.replace(/\./g, "-"); // "YYYY-MM-DD HH:MM:SS" 형태로 변환

  const date = dayjs(parsableDateStr);

  if (!date.isValid()) {
    return null;
  }
  return date.toDate();
};

// Updated FilterState to support multi-select (array-based)
interface FilterState {
  status: string[];
  month: number[];
  timeType: string[];
  timeSlot: string[];
}

export const SwimmingLessonList = () => {
  const [filter, setFilter] = useState<FilterState>(() => {
    return {
      status: [],
      month: [],
      timeType: [],
      timeSlot: [],
    };
  });

  useEffect(() => {}, [filter]);

  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Determine API query parameters based on filter state and showAvailableOnly toggle
  let statusForApi: string | undefined;
  if (showAvailableOnly) {
    // When "show available only" is checked, fetch lessons that are in 'OPEN' or 'WAITING' state from API.
    // These are assumed to be the API's uppercase equivalents.
    statusForApi = "OPEN";
  } else {
    // If not showing only available, use the user's selected statuses, if any.
    if (filter.status.length > 0) {
      statusForApi = filter.status.map((s) => s.toUpperCase()).join(",");
    }
    // If filter.status is empty, statusForApi remains undefined, and no status query param is sent.
  }

  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useLessons({
    page: 0,
    size: 100,
    // Use the determined statusForApi for the query.
    // Month is removed from API query and will be filtered on the client-side
    // to ensure correctness regardless of backend behavior.
    ...(statusForApi && { status: statusForApi }),
  });

  useEffect(() => {}, [lessonsData]);

  const lessons = lessonsData?.data?.content;

  const filteredLessons = useMemo(() => {
    if (!lessons || lessons.length === 0) {
      return [];
    }

    // --- Start: Client-side date filtering logic ---
    const now = dayjs();
    const currentMonth = now.month() + 1;
    const allowedMonthsByDate = [currentMonth];

    // 25일 오전 10시부터 다음 달 강습이 보이도록 설정합니다.
    const isAfterOpeningTime =
      (now.date() === 25 && now.hour() >= 10) || now.date() > 25;

    if (isAfterOpeningTime) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      allowedMonthsByDate.push(nextMonth);
    }
    // --- End: Client-side date filtering logic ---

    const result = lessons.filter((lesson: LessonDTO) => {
      // Rule 1: Lesson must be in a month allowed by the 25th rule.
      if (!lesson.startDate) {
        return false;
      }

      // 한글 날짜 형식 파싱 (예: "25년06월09일" -> "2025-06-09")
      const koreanDateRegex = /(\d{2})년(\d{2})월(\d{2})일/;
      const match = lesson.startDate.match(koreanDateRegex);

      if (!match) {
        return false;
      }

      const [_, year, month, day] = match;
      const formattedDate = `20${year}-${month}-${day}`;
      const lessonDate = dayjs(formattedDate, "YYYY-MM-DD");

      if (!lessonDate.isValid()) {
        return false;
      }

      const lessonMonth = lessonDate.month() + 1;
      if (!allowedMonthsByDate.includes(lessonMonth)) {
        return false;
      }

      // Rule 2: Show Available and Remaining (user toggle)
      if (showAvailableOnly) {
        // 정원이 마감된 경우 필터링
        if (lesson.remaining === 0) {
          return false;
        }

        // 접수 기간이 마감된 경우 필터링
        const applicationEndTime = parseKSTDateString(lesson.receiptId);
        if (applicationEndTime && now.isAfter(dayjs(applicationEndTime))) {
          return false;
        }
      }

      // Rule 3: Month Match (user filter from UI)
      if (filter.month.length > 0) {
        if (!filter.month.includes(lessonMonth)) {
          return false;
        }
      }

      // Rule 4: Time Type Match (user filter from UI)
      if (filter.timeType.length > 0) {
        if (!lesson.timePrefix) {
          return false;
        }
        const lessonIsMorning = lesson.timePrefix === "오전";
        const lessonIsAfternoon = lesson.timePrefix === "오후";
        const typeMatch = filter.timeType.some(
          (type) =>
            (type === "morning" && lessonIsMorning) ||
            (type === "afternoon" && lessonIsAfternoon)
        );
        if (!typeMatch) {
          return false;
        }
      }

      // Rule 5: Time Slot Match
      if (filter.timeSlot.length > 0) {
        if (!lesson.timeSlot) {
          return false;
        }
        const lessonTimeSlotInternal = lesson.timeSlot?.replace("~", "-");
        if (
          !lessonTimeSlotInternal ||
          !filter.timeSlot.includes(lessonTimeSlotInternal)
        ) {
          return false;
        }
      }

      return true;
    });
    return result;
  }, [lessons, filter, showAvailableOnly]);

  const handleSetFilter = useCallback((newFilter: FilterState) => {
    setFilter(newFilter);
  }, []);

  const handleSetSelectedFilters = useCallback(
    (newSelectedFilters: string[]) => {
      setSelectedFilters(newSelectedFilters);
    },
    []
  );

  const handleSetCategoryOpen = useCallback((isOpen: boolean) => {
    setCategoryOpen(isOpen);
  }, []);

  // Conditional rendering for the lesson grid area only
  let lessonContent;
  if (lessonsLoading) {
    lessonContent = (
      <Box textAlign="center" py={10} width="100%">
        <Text fontSize={{ base: "md", md: "lg" }}>
          강습 정보를 불러오는 중입니다...
        </Text>
      </Box>
    );
  } else if (lessonsError) {
    lessonContent = (
      <Box textAlign="center" py={10} color="red.500" width="100%">
        <Text fontSize={{ base: "md", md: "lg" }}>
          강습 정보를 불러오는데 문제가 발생했습니다.
        </Text>
        <Text mt={2} fontSize={{ base: "sm", md: "md" }}>
          다시 시도해주세요.
        </Text>
      </Box>
    );
  } else {
    lessonContent = (
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={{ base: 4, md: 6 }}
        justifyItems="center"
        width="100%"
      >
        {filteredLessons.map((lesson: LessonDTO) => (
          <GridItem key={lesson.id} w="100%">
            <LessonCard lesson={lesson} />
          </GridItem>
        ))}
      </Grid>
    );
  }

  const infoTextFontSize = useBreakpointValue({
    base: "16px",
    md: "18px",
    lg: "21px",
  });
  const toggleTextFontSize = useBreakpointValue({
    base: "18px",
    md: "22px",
    lg: "27px",
  });

  return (
    <Box px={{ base: 2, md: 0 }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        width="100%"
        maxW="1600px"
        minHeight="35px"
        mb={6}
        gap={{ base: 3, md: 0 }}
      >
        <Flex
          align="center"
          gap={{ base: 2, md: "15px" }}
          width="auto"
          minHeight="35px"
        >
          <Text
            fontFamily="'Paperlogy', sans-serif"
            fontWeight="500"
            fontSize={infoTextFontSize}
            lineHeight={{ base: "20px", md: "25px" }}
            letterSpacing="-0.05em"
            color="#373636"
          >
            신청정보{" "}
            <Text as="span" color="#2E3192" fontWeight="700">
              {lessonsData?.data?.totalElements != null &&
              !filter.status.length &&
              !filter.month.length &&
              !filter.timeType.length &&
              !filter.timeSlot.length
                ? lessonsData.data.totalElements
                : filteredLessons.length}
            </Text>
            건이 있습니다
          </Text>
        </Flex>

        <Flex
          align="center"
          gap={{ base: 2, md: "15px" }}
          width="auto"
          minHeight="35px"
        >
          <Text
            fontFamily="'Paperlogy', sans-serif"
            fontWeight="700"
            fontSize={toggleTextFontSize}
            lineHeight={{ base: "22px", md: "32px" }}
            letterSpacing="-0.05em"
            color="#373636"
          >
            신청 가능한 강습 보기
          </Text>
          <Box
            position="relative"
            width="60px"
            height="30px"
            borderRadius="33.3333px"
            bg={showAvailableOnly ? "#2E3192" : "#ccc"}
            onClick={() => {
              setShowAvailableOnly(!showAvailableOnly);
            }}
            cursor="pointer"
            transition="background-color 0.2s"
            flexShrink={0}
          >
            <Box
              position="absolute"
              width="23.33px"
              height="23.33px"
              left={showAvailableOnly ? "33.34px" : "3.31px"}
              top="3.31px"
              bg="white"
              borderRadius="50%"
              transition="left 0.2s"
            />
          </Box>
        </Flex>
      </Flex>

      <LessonFilterControls
        onFilterChange={handleSetFilter}
        selectedFilters={selectedFilters}
        onSelectedFiltersChange={handleSetSelectedFilters}
        categoryOpen={categoryOpen}
        onCategoryToggle={handleSetCategoryOpen}
      />

      {lessonContent}
    </Box>
  );
};
