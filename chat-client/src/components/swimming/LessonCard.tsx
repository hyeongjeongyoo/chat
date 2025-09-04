"use client";

import { LessonDTO } from "@/types/swimming";
import { MypageEnrollDto } from "@/types/api";
import { Box, Text, Flex, Image } from "@chakra-ui/react";
import React from "react";
import { useRouter } from "next/navigation";
import { toaster } from "../ui/toaster";
import LessonCardActions from "./LessonCardActions";
import { getMembershipLabel } from "@/lib/utils/displayUtils";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";
import dayjs from "dayjs";
import { getEnrollmentEligibility } from "@/lib/api/swimming";

interface LessonCardProps {
  lesson: LessonDTO & { applicationStartDate?: string };
  context?: "listing" | "mypage";
  enrollment?: MypageEnrollDto;
  onRequestCancel?: (enrollId: number) => void;
  onGoToPayment?: (enrollId: number) => void;
  onRenewLesson?: (enrollment: MypageEnrollDto) => void;
}

// Simplified KST Date Parser (should ideally be in a shared utils file)
const parseDisplayKSTDate = (
  dateStringWithSuffix: string | undefined
): Date | null => {
  if (!dateStringWithSuffix) return null;
  try {
    let parsableStr = dateStringWithSuffix.replace(/부터|까지/g, "").trim(); // "YYYY.MM.DD HH:MM"
    parsableStr = parsableStr.replace(/\./g, "-"); // "YYYY-MM-DD HH:MM"

    const date = dayjs(parsableStr);
    if (!date.isValid()) {
      console.warn(
        "[LessonCard] Unrecognized date format for display status calc:",
        dateStringWithSuffix,
        "(intermediate: ",
        parsableStr,
        ")"
      );
      return null;
    }

    return date.toDate();
  } catch (error) {
    console.error(
      "[LessonCard] Error parsing date for display status:",
      dateStringWithSuffix,
      error
    );
    return null;
  }
};

export const LessonCard: React.FC<LessonCardProps> = React.memo(
  ({
    lesson,
    context = "listing",
    enrollment,
    onRequestCancel,
    onGoToPayment,
    onRenewLesson,
  }) => {
    const router = useRouter();
    const {
      user,
      isAuthenticated,
      isLoading: authIsLoading,
    } = useRecoilValue(authState);

    const occupiedSpots = Math.max(
      0,
      lesson.capacity - (lesson.remaining ?? 0)
    );

    // --- Calculate Display Status based on time and remaining capacity ---
    let displayStatus: string;
    let displayStatusBgColor: string;
    let remainingSpotsColor: string;
    let canApply: boolean = false;

    const now = new Date();
    const applicationStartTime = parseDisplayKSTDate(lesson.reservationId);
    const applicationEndTime = parseDisplayKSTDate(lesson.receiptId);

    if (applicationStartTime && applicationEndTime) {
      if (now < applicationStartTime) {
        displayStatus = "접수대기";
        displayStatusBgColor = "orange.500";
        remainingSpotsColor = "#888888"; // Gray
      } else if (now >= applicationStartTime && now <= applicationEndTime) {
        if (lesson.remaining != null && lesson.remaining > 0) {
          displayStatus = "접수중";
          displayStatusBgColor = "#2D3092"; // Blue
          remainingSpotsColor = "#76B947"; // Green
          canApply = true;
        } else {
          displayStatus = "정원마감";
          displayStatusBgColor = "#CC0000"; // Red
          remainingSpotsColor = "#FF5A5A"; // Red
        }
      } else {
        // now > applicationEndTime
        displayStatus = "접수마감";
        displayStatusBgColor = "#888888"; // Dark gray
        remainingSpotsColor = "#888888"; // Dark gray
      }
    } else {
      displayStatus = "정보확인필요";
      displayStatusBgColor = "gray.400"; // Default gray
      remainingSpotsColor = "#888888"; // Default gray
    }
    // --- End Display Status Calculation ---

    const handleApplyClick = async () => {
      // 1. 로그인 여부 확인 (useAuth 사용)
      if (authIsLoading) {
        toaster.create({
          title: "확인 중",
          description: "사용자 인증 정보를 확인하고 있습니다.",
          type: "info",
          duration: 1500,
        });
        return; // 인증 정보 로딩 중이면 아무것도 하지 않음
      }

      if (!isAuthenticated) {
        toaster.create({
          title: "로그인이 필요합니다",
          description: "수영 강습 신청은 로그인 후 이용 가능합니다.",
          type: "warning",
          duration: 3000,
        });
        router.push("/login");
        return;
      }

      // 2. 역할 확인 - 관리자는 신청 불가 (useAuth 사용)
      if (user) {
        const adminRoles = ["ADMIN", "SYSTEM_ADMIN"];
        if (adminRoles.includes(user.role)) {
          toaster.create({
            title: "신청 권한 없음",
            description: "관리자 계정은 수영 강습을 신청할 수 없습니다.",
            type: "error",
            duration: 3000,
          });
          return;
        }
      }

      // 3. 수강 신청 자격 확인
      try {
        const eligibility = await getEnrollmentEligibility(lesson.id);
        if (!eligibility.eligible) {
          toaster.create({
            title: "신청 불가",
            description: eligibility.message,
            type: "warning",
            duration: 5000,
          });
          return;
        }
      } catch (error) {
        console.error("수강 신청 자격 확인 실패:", error);
        toaster.create({
          title: "오류 발생",
          description:
            "신청 자격 확인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          type: "error",
          duration: 3000,
        });
        return;
      }

      // 4. 신청 가능 여부 확인 (lesson.id 사용)
      if (!canApply || !lesson.id) {
        toaster.create({
          title: "신청 불가",
          description: "현재 이 강습은 신청할 수 없거나 기간이 아닙니다.",
          type: "warning",
          duration: 3000,
        });
        return;
      }

      toaster.create({
        title: "신청 페이지 이동",
        description: "신청 정보 확인 페이지로 이동합니다.",
        type: "info",
        duration: 1500,
      });

      // 4. 쿼리 파라미터 생성 (lesson.id 사용 및 toString 명시)
      const queryParams = new URLSearchParams({
        lessonId: lesson.id.toString(),
        lessonTitle: lesson.title,
        lessonPrice: lesson.price.toString(),
        lessonStartDate: lesson.startDate,
        lessonEndDate: lesson.endDate,
        lessonTime: lesson.timeSlot || "",
        lessonDays: lesson.days || "",
        lessonTimePrefix: lesson.timePrefix || "",
      });

      router.push(`/application/confirm?${queryParams.toString()}`);
    };

    return (
      <Box className="swimming-card">
        {/* 접수 상태 배지 */}
        <Box className="status-badge">
          <Box
            display="inline-block"
            py="4px"
            px="12px"
            borderRadius="md"
            border={displayStatus === "접수중" ? "1px solid #2D3092" : "none"}
            fontSize="14px"
            fontWeight="600"
            color="white"
            bg={displayStatusBgColor}
          >
            {displayStatus}
          </Box>
        </Box>

        {/* 잔여석 표시 */}
        <Box className="remaining-badge">
          <Text fontSize="12px" color="#666" fontWeight="400" mt="2px">
            잔여:
            {lesson.remaining ?? 0}
          </Text>
          {/* <Text
            fontSize="32px"
            fontWeight="700"
            color={remainingSpotsColor}
            lineHeight="1"
          >
            {occupiedSpots}
            <Text as="span" fontSize="18px" color="#666" fontWeight="400">
              /{lesson.capacity}
            </Text>
          </Text> */}
        </Box>

        {/* 카드 내용 */}
        <Box className="card-body">
          <Flex direction="column" gap="41px">
            <Box>
              <Text fontSize="14px" color="#666" fontWeight="400" mb={2}>
                {lesson.startDate} ~ {lesson.endDate}
              </Text>
              <Text fontWeight="700" color="#333" fontSize="18px">
                {lesson.title}
              </Text>
            </Box>
            <Box className="swimmer-image">
              <Image
                src="/images/swimming/swimmer.png"
                alt="수영하는 사람"
                width={175}
                height={85}
                style={{
                  objectFit: "contain",
                  opacity: 0.7,
                }}
              />
            </Box>
            <Box position="relative" zIndex="1">
              <Text color="#0C8EA4" fontWeight="700" fontSize="14px">
                강습시간
              </Text>
              <Text color="#FAB20B" fontWeight="600" fontSize="16px">
                {lesson.days} {lesson.timePrefix}
                {lesson.timeSlot}
              </Text>
            </Box>
          </Flex>
          <Box className="info-box" mt="18px">
            <Flex mb={2}>
              <Text fontWeight="600" color="#333" w="70px">
                접수기간
              </Text>
              <Text fontWeight="400" color="#666">
                {lesson.reservationId || "확인 중"}
                {lesson.receiptId && (
                  <>
                    <br />
                    {lesson.receiptId}
                  </>
                )}
              </Text>
            </Flex>
            <Flex mb={2}>
              <Text fontWeight="600" color="#333" w="70px">
                강습대상
              </Text>
              <Text fontWeight="400" color="#666">
                성인(온라인)
              </Text>
            </Flex>
            <Flex>
              <Text fontWeight="600" color="#333" w="70px">
                교육장소
              </Text>
              <Text fontWeight="400" color="#666">
                {lesson.location}
              </Text>
            </Flex>

            {context === "mypage" && enrollment && (
              <Flex mt={1}>
                <Text fontWeight="600" color="#333" w="70px">
                  사물함
                </Text>
                <Text fontWeight="400" color="#666">
                  {enrollment.usesLocker ? "사용" : "미사용"}
                </Text>
              </Flex>
            )}
            {context === "mypage" &&
              enrollment &&
              enrollment.membershipType && (
                <Flex mt={1}>
                  <Text fontWeight="600" color="#333" w="70px">
                    할인유형
                  </Text>
                  <Text fontWeight="400" color="#666">
                    {getMembershipLabel(enrollment.membershipType)}
                  </Text>
                </Flex>
              )}
          </Box>

          <LessonCardActions
            lesson={lesson}
            enrollment={context === "mypage" ? enrollment : undefined}
            onRequestCancel={context === "mypage" ? onRequestCancel : undefined}
            onApplyClick={context !== "mypage" ? handleApplyClick : undefined}
            onGoToPayment={onGoToPayment}
            onRenewLesson={onRenewLesson}
          />
        </Box>
      </Box>
    );
  }
);

LessonCard.displayName = "LessonCard";
