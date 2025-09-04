"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Button,
  Flex,
  Spinner,
  Heading,
  VStack,
  HStack,
  RadioGroup,
  Checkbox,
  Container,
  SimpleGrid,
  Fieldset,
  Icon,
} from "@chakra-ui/react";
import { MdInfoOutline } from "react-icons/md";
import {
  swimmingPaymentService,
  getEnrollmentEligibility,
} from "@/lib/api/swimming";
import { mypageApi, ProfileDto } from "@/lib/api/mypageApi";
import { EnrollLessonRequestDto, LockerAvailabilityDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { useColors } from "@/styles/theme";
import Image from "next/image";
import KISPGPaymentPopup from "@/components/payment/KISPGPaymentFrame";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { formatPhoneNumberWithHyphen } from "@/lib/utils/phoneUtils";

interface MembershipOption {
  value: string;
  label: string;
  discountPercentage: number;
}

// Keep original for fallback or initial structure, but API will be primary
const DEFAULT_MEMBERSHIP_OPTIONS: MembershipOption[] = [
  { value: "general", label: "해당사항없음", discountPercentage: 0 },
  {
    value: "merit",
    label: "국가 유공자(본인) 10%할인",
    discountPercentage: 10,
  },
  {
    value: "multi-child",
    label: "다자녀 3인이상 10%할인",
    discountPercentage: 10,
  },
  {
    value: "multicultural",
    label: "다문화 가정 10%할인",
    discountPercentage: 10,
  },
];

const DEFAULT_LOCKER_FEE = 5000;
const APPLICATION_TIMEOUT_SECONDS = 300; // 5 minutes

const ApplicationConfirmPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lessonId, setLessonId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonPrice, setLessonPrice] = useState<number>(0);
  const [lessonStartDate, setLessonStartDate] = useState<string>("");
  const [lessonEndDate, setLessonEndDate] = useState<string>("");
  const [lessonTime, setLessonTime] = useState<string>("");
  const [enrollId, setEnrollId] = useState<number | null>(null);

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [userGender, setUserGender] = useState<"MALE" | "FEMALE" | null>(null);

  const [lockerAvailability, setLockerAvailability] =
    useState<LockerAvailabilityDto | null>(null);
  const [isLockerDetailsLoading, setIsLockerDetailsLoading] = useState(false);

  const [selectedLocker, setSelectedLocker] = useState(true);
  const [membershipOptions, setMembershipOptions] = useState<
    MembershipOption[]
  >(DEFAULT_MEMBERSHIP_OPTIONS);
  const [isMembershipOptionsLoading, setIsMembershipOptionsLoading] =
    useState(true);
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>(
    DEFAULT_MEMBERSHIP_OPTIONS[0].value
  );

  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockerError, setLockerError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(APPLICATION_TIMEOUT_SECONDS);

  // Payment data for KISPG
  const [paymentData, setPaymentData] = useState<any>(null);
  const paymentRef = useRef<any>(null);

  const colors = useColors();
  const pageBg = colors.bg;
  const cardBg = colors.cardBg;
  const primaryText = colors.text.primary;
  const secondaryText = colors.text.secondary;
  const inverseText = colors.text.inverse;
  const borderColor = colors.border;
  const primaryDefault = colors.primary.default;
  const primaryHover = colors.primary.hover;
  const primaryDark = colors.primary.dark;
  const accentDelete = colors.accent.delete.default;
  const accentWarning = colors.accent.warning.default;
  const outlineButtonHoverBg = colors.accent.outlineButtonHoverBg;
  const errorNoticeBg = colors.accent.errorNoticeBg;
  const errorNoticeBorder = colors.accent.errorNoticeBorder;
  const timerYellowColor = colors.accent.timerYellow;
  const primaryAlpha = colors.primary.alpha;
  const radioUnselectedBg = colors.accent.radioUnselectedBg;
  const radioUnselectedHoverBorder = colors.accent.radioUnselectedHoverBorder;

  const cardStyleProps = {
    bg: cardBg,
    p: { base: 4, md: 6 },
    borderRadius: "lg",
    borderWidth: "1px",
    borderColor: borderColor,
    boxShadow: "sm",
  };

  const legendStyleProps = {
    fontSize: "md",
    fontWeight: "bold",
    color: primaryText,
    pb: 2,
    mb: 4,
    borderBottomWidth: "1px",
    borderColor: borderColor,
  };

  // Helper function to extract enrollId from payment response
  const extractEnrollIdFromPaymentResponse = (response: any): number | null => {
    try {
      // 1. Extract from mbsReserved1 field (format: "temp_enrollId" or "enroll_enrollId")
      if (response.mbsReserved1) {
        const parts = response.mbsReserved1.split("_");
        if (parts.length >= 2) {
          // temp_123 or enroll_123 format
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const enrollId = parseInt(parts[1]);
            if (!isNaN(enrollId)) {
              return enrollId;
            }
          }
        }
      }

      // 2. Alternative: Extract from moid field (format: "temp_enrollId_timestamp" or "enroll_enrollId_timestamp")
      if (response.moid) {
        const parts = response.moid.split("_");
        if (parts.length >= 2) {
          // temp_123_timestamp or enroll_123_timestamp format
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const enrollId = parseInt(parts[1]);
            if (!isNaN(enrollId)) {
              return enrollId;
            }
          }
        }
      }

      // 3. Additional: Try to extract from other possible fields
      if (response.ordNo) {
        const parts = response.ordNo.split("_");
        if (parts.length >= 2) {
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const enrollId = parseInt(parts[1]);
            if (!isNaN(enrollId)) {
              return enrollId;
            }
          }
        }
      }

      // 4. Direct enrollId field
      if (response.enrollId && !isNaN(parseInt(response.enrollId))) {
        const enrollId = parseInt(response.enrollId);
        return enrollId;
      }

      // If all extraction methods fail, generate a temporary ID based on current lesson
      console.warn(
        "Could not extract enrollId from response, using lessonId as fallback"
      );
      return lessonId; // Use current lessonId as fallback
    } catch (error) {
      console.error("Error extracting enrollId from payment response:", error);
      return lessonId; // Use current lessonId as fallback
    }
  };

  useEffect(() => {
    const processParams = async () => {
      const idStr = searchParams.get("lessonId");
      const title = searchParams.get("lessonTitle");
      const priceStr = searchParams.get("lessonPrice");
      const startDate = searchParams.get("lessonStartDate");
      const endDate = searchParams.get("lessonEndDate");
      const time = searchParams.get("lessonTime");

      if (idStr && !isNaN(parseInt(idStr))) {
        const currentLessonId = parseInt(idStr);

        try {
          const eligibility = await getEnrollmentEligibility(currentLessonId);
          if (!eligibility.eligible) {
            toaster.create({
              title: "신청 불가",
              description: eligibility.message,
              type: "warning",
              duration: 5000,
            });
            router.push("/sports/swimming/lesson");
            return;
          }
        } catch (error) {
          console.error("수강 신청 자격 확인 실패:", error);
          toaster.create({
            title: "오류 발생",
            description:
              "신청 자격 확인 중 문제가 발생했습니다. 페이지를 이동합니다.",
            type: "error",
            duration: 3000,
          });
          router.push("/sports/swimming/lesson");
          return;
        }

        if (
          title &&
          priceStr &&
          !isNaN(parseFloat(priceStr)) &&
          startDate &&
          endDate &&
          time
        ) {
          setLessonId(currentLessonId);
          setLessonTitle(title);
          setLessonPrice(parseFloat(priceStr));
          setLessonStartDate(startDate);
          setLessonEndDate(endDate);
          setLessonTime(time);
        } else {
          setError("잘못된 접근입니다. 강습 정보가 URL에 충분하지 않습니다.");
          setIsLoading(false);
          toaster.create({
            title: "오류",
            description:
              "필수 강습 정보가 URL에 없습니다. 이전 페이지로 돌아갑니다.",
            type: "error",
          });
          router.push("/sports/swimming/lesson");
        }
      } else {
        setError("잘못된 접근입니다. 강습 ID가 유효하지 않습니다.");
        setIsLoading(false);
        toaster.create({
          title: "오류",
          description: "강습 ID가 유효하지 않습니다. 이전 페이지로 돌아갑니다.",
          type: "error",
        });
        router.push("/sports/swimming/lesson");
      }
    };

    processParams();
  }, [searchParams, router]);

  useEffect(() => {
    if (!lessonId) return;
    setIsLoading(true);
    const fetchProfile = async () => {
      try {
        const profileData = await mypageApi.getProfile();
        if (profileData) {
          setProfile(profileData);
          if (profileData.gender) {
            const apiGender = String(profileData.gender).toUpperCase();
            if (apiGender === "MALE" || apiGender === "1") {
              setUserGender("MALE");
            } else if (apiGender === "FEMALE" || apiGender === "0") {
              setUserGender("FEMALE");
            } else {
              console.warn(
                `Unsupported gender value from API: ${profileData.gender}. Gender will be treated as unspecified.`
              );
              setUserGender(null);
            }
          } else {
            console.warn("Gender not found on profile DTO from API");
            setUserGender(null);
          }
        } else {
          console.warn("Profile data is null after fetch.");
        }
      } catch (err: any) {
        if (err.status !== 401) {
          console.error("Failed to fetch profile:", err);
          setError(err.message || "프로필 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [lessonId]);

  useEffect(() => {
    if (lessonId && userGender) {
      setIsLockerDetailsLoading(true);
      setLockerError(null);
      mypageApi
        .getLockerAvailabilityStatus(userGender)
        .then((data) => {
          setLockerAvailability(data);
        })
        .catch((err) => {
          console.error("Failed to fetch locker availability:", err);
          setLockerError("사물함 정보를 불러오는데 실패했습니다.");
          setLockerAvailability(null);
        })
        .finally(() => {
          setIsLockerDetailsLoading(false);
        });
    } else if (lessonId && profile && userGender === null) {
      setLockerError(
        "사용자 성별이 남성 또는 여성이 아니거나 확인되지 않아, 해당 성별의 사물함 정보를 제공할 수 없습니다."
      );
      setLockerAvailability(null);
      setIsLockerDetailsLoading(false);
    }
  }, [lessonId, userGender, profile]);

  useEffect(() => {
    if (!lessonPrice || !membershipOptions.length) return; // Ensure options are loaded
    let currentAmount = lessonPrice;
    const selectedMembership = membershipOptions.find(
      (opt) => opt.value === selectedMembershipType
    );
    if (selectedMembership && selectedMembership.discountPercentage > 0) {
      currentAmount *= 1 - selectedMembership.discountPercentage / 100;
    }
    if (selectedLocker) currentAmount += DEFAULT_LOCKER_FEE;
    setFinalAmount(currentAmount);
  }, [lessonPrice, selectedLocker, selectedMembershipType, membershipOptions]);

  useEffect(() => {
    const fetchMembershipOptions = async () => {
      setIsMembershipOptionsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMembershipOptions(DEFAULT_MEMBERSHIP_OPTIONS);
        if (DEFAULT_MEMBERSHIP_OPTIONS.length > 0) {
          setSelectedMembershipType(DEFAULT_MEMBERSHIP_OPTIONS[0].value);
        }
      } catch (err) {
        console.error("Failed to fetch membership options:", err);
        toaster.create({
          title: "오류",
          description:
            "할인 유형 정보를 불러오는데 실패했습니다. 기본 옵션으로 진행합니다.",
          type: "error",
        });
        setMembershipOptions(DEFAULT_MEMBERSHIP_OPTIONS);
        if (DEFAULT_MEMBERSHIP_OPTIONS.length > 0) {
          setSelectedMembershipType(DEFAULT_MEMBERSHIP_OPTIONS[0].value);
        }
      } finally {
        setIsMembershipOptionsLoading(false);
      }
    };
    fetchMembershipOptions();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rs).padStart(2, "0")}`;
  };

  const handleProceedToPayment = async () => {
    if (!lessonId || !profile || !lessonStartDate || !lessonTime) {
      toaster.create({
        title: "오류",
        description: "필수 정보(강습 상세 또는 사용자)가 로드되지 않았습니다.",
        type: "error",
      });
      return;
    }
    if (isLockerDetailsLoading) {
      toaster.create({
        title: "확인 중",
        description: "사물함 정보를 확인 중입니다. 잠시 후 다시 시도해주세요.",
        type: "info",
      });
      return;
    }
    if (lockerError && selectedLocker) {
      toaster.create({
        title: "사물함 오류",
        description: lockerError,
        type: "error",
      });
      return;
    }

    if (!profile.phone) {
      toaster.create({
        title: "전화번호 필요",
        description:
          "결제를 위해 전화번호가 필요합니다. 마이페이지에서 프로필을 업데이트해주세요.",
        type: "warning",
      });
      setError(
        "결제를 위해 전화번호가 필요합니다. 마이페이지에서 프로필을 업데이트해주세요."
      );
      setIsSubmitting(false); // Ensure button is re-enabled
      // Optionally, redirect to profile page:
      // router.push("/mypage/profile-edit"); // Assuming such a page exists
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create enrollment
      const enrollRequest: EnrollLessonRequestDto = {
        lessonId: lessonId,
        usesLocker: selectedLocker,
        membershipType: selectedMembershipType,
      };

      const enrollResponse = await swimmingPaymentService.enrollLesson(
        enrollRequest
      );

      if (enrollResponse) {
        // Extract enrollId from the payment response
        const extractedEnrollId =
          extractEnrollIdFromPaymentResponse(enrollResponse);

        if (extractedEnrollId) {
          setEnrollId(extractedEnrollId);
          setPaymentData(enrollResponse); // 결제 데이터 설정

          toaster.create({
            title: "신청 등록",
            description: "강습 신청이 등록되었습니다. 결제를 진행합니다.",
            type: "info",
            duration: 2000,
          });

          // Step 2: 결제 팝업 트리거
          setTimeout(() => {
            setIsSubmitting(false);
            if (paymentRef.current) {
              paymentRef.current.triggerPayment();
            }
          }, 500);
        } else {
          // enrollId 추출에 실패해도 결제는 진행 (서버에서 처리됨)
          console.warn(
            "Failed to extract enrollId, but proceeding with payment"
          );
          setEnrollId(lessonId || 0); // fallback to lessonId
          setPaymentData(enrollResponse);

          toaster.create({
            title: "신청 등록",
            description: "강습 신청이 등록되었습니다. 결제를 진행합니다.",
            type: "info",
            duration: 2000,
          });

          setTimeout(() => {
            setIsSubmitting(false);
            if (paymentRef.current) {
              paymentRef.current.triggerPayment();
            }
          }, 500);
        }
      } else {
        throw new Error("강습 신청 응답이 올바르지 않습니다.");
      }
    } catch (err: any) {
      console.error("Enrollment Error:", err);
      console.error("Error Response:", err.response);

      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "강습 신청 중 오류가 발생했습니다.";

      // 401 Unauthorized 체크
      if (err.response?.status === 401) {
        toaster.create({
          title: "인증 필요",
          description: "로그인이 필요합니다. 로그인 페이지로 이동합니다.",
          type: "error",
        });
        router.push("/login?redirect=/application/confirm");
        return;
      }

      setError(errMsg);
      toaster.create({
        title: "강습 신청 실패",
        description: errMsg,
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  // 결제 완료 콜백
  const handlePaymentComplete = async (success: boolean, data: any) => {
    if (success) {
      toaster.create({
        title: "결제 완료",
        description:
          "수영 강습 신청이 완료되었습니다. 마이페이지로 이동합니다.",
        type: "success",
        duration: 3000,
      });

      // 마이페이지로 이동 (수영장 신청정보 탭)
      setTimeout(() => {
        router.push("/mypage?tab=수영장_신청정보");
      }, 1000);
    } else {
      const errorMessage = data?.message || "결제 처리 중 오류가 발생했습니다.";

      toaster.create({
        title: "결제 실패",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });

      setIsSubmitting(false);
    }
  };

  const handlePaymentClose = () => {
    setIsSubmitting(false);
  };

  const spinnerColor = primaryDefault;

  if (isLoading || isMembershipOptionsLoading) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
      >
        <Spinner size="xl" color={spinnerColor} />
        <Text mt={4} ml={3}>
          {isLoading
            ? "신청 정보를 불러오는 중입니다..."
            : "할인 옵션을 불러오는 중입니다..."}
        </Text>
      </Flex>
    );
  }

  if (error && !isSubmitting) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
        direction="column"
        p={5}
      >
        <Icon as={MdInfoOutline} w={12} h={12} color={accentDelete} mb={4} />

        <Heading size="md" mb={2}>
          오류 발생
        </Heading>
        <Text textAlign="center">{error}</Text>
        <Button
          mt={6}
          variant="outline"
          borderColor={borderColor}
          color={primaryText}
          _hover={{ bg: outlineButtonHoverBg }}
          onClick={() => router.push("/sports/swimming/lesson")}
        >
          강습 목록으로 돌아가기
        </Button>
      </Flex>
    );
  }

  if (!profile && !error) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
        direction="column"
        p={5}
      >
        <Spinner size="xl" color={spinnerColor} />
        <Text mt={4} ml={3} color={secondaryText}>
          사용자 정보를 확인 중입니다... (문제가 지속되면 새로고침 해주세요)
        </Text>
      </Flex>
    );
  }

  if (!lessonId && !isLoading && !error) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
        direction="column"
        p={5}
      >
        <Icon as={MdInfoOutline} w={12} h={12} color={accentWarning} mb={4} />
        <Text color={accentWarning} fontWeight="bold">
          강습 정보 누락.
        </Text>
        <Button
          mt={6}
          variant="outline"
          borderColor={borderColor}
          color={primaryText}
          _hover={{ bg: outlineButtonHoverBg }}
          onClick={() => router.push("/sports/swimming/lesson")}
        >
          목록에서 다시 시도해주세요.
        </Button>
      </Flex>
    );
  }

  const getDiscountedPrice = (price: number, discount: number) =>
    price * (1 - discount / 100);

  let currentLockerCount: number | string = "-";
  if (
    lockerAvailability &&
    (userGender === "MALE" || userGender === "FEMALE")
  ) {
    currentLockerCount = lockerAvailability.availableQuantity;
  } else if (userGender === null) {
    currentLockerCount = "정보없음 (성별 미확인)";
  }

  const radioItemSpinnerColor = primaryDefault;

  return (
    <AuthGuard
      allowedRoles={["USER"]}
      authorizationFailedMessage={{
        title: "접근 권한 없음",
        description: "수영 강습 신청은 일반 사용자만 가능합니다.",
      }}
    >
      <Container maxW="700px" py={8}>
        {" "}
        <Box
          mb={6}
          {...cardStyleProps}
          bg={errorNoticeBg}
          borderColor={errorNoticeBorder}
        >
          <HStack mb={3} alignItems="center">
            <Image
              src="/images/apply/pay_asset.png"
              alt="pay_asset"
              width={16}
              height={16}
            />
            <Heading as="h2" size="sm" color={primaryText} fontWeight="bold">
              결제 안내 필독 사항
            </Heading>
          </HStack>
          <VStack align="stretch" gap={1} pl={2}>
            {[
              {
                text: "수영장강습과, 사물함신청은 ",
                boldRed: "결제완료 기준",
                rest: "으로 선착순 확정됩니다.",
              },
              {
                text: "할인회원 신청시 ",
                boldRed: "오프라인으로 증빙서류 제출",
                rest: "이 필요합니다.",
              },
              {
                text: "신청 후 5분 이내 ",
                boldRed: "결제를 완료",
                rest: "하지 않으면 자동 취소됩니다.",
              },
            ].map((item, index) => (
              <Flex
                key={index}
                display="flex"
                alignItems="flex-start"
                fontSize="xs"
                color={accentDelete}
              >
                <Text as="span" color={secondaryText}>
                  {item.text}
                  {item.boldRed && (
                    <Text
                      as="span"
                      fontWeight="bold"
                      color={accentDelete}
                      mx="3px"
                    >
                      {item.boldRed}
                    </Text>
                  )}
                  {item.rest}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
        <HStack mt={10} mb={1} justifyContent="center" alignItems="center">
          <Image
            src="/images/apply/pay_asset.png"
            alt="pay_asset"
            width={16}
            height={16}
          />
          <Heading
            as="h1"
            size="md"
            textAlign="center"
            color={primaryText}
            fontWeight="bold"
          >
            수영 강습 프로그램 신청정보
          </Heading>
        </HStack>
        <Text
          textAlign="center"
          color={accentDelete}
          fontWeight="bold"
          mb={6}
          fontSize="sm"
        >
          신청정보를 다시 한번 확인해주세요
        </Text>
        {profile && (
          <Fieldset.Root mb={6}>
            <Box {...cardStyleProps}>
              <Fieldset.Legend {...legendStyleProps}>
                신청자 정보
              </Fieldset.Legend>
              <Fieldset.Content>
                <SimpleGrid
                  columns={{ base: 1, sm: 2 }}
                  gapX={8}
                  gapY={3}
                  fontSize="sm"
                >
                  <HStack justifyContent="space-between">
                    <Text color={secondaryText}>이름</Text>
                    <Text fontWeight="medium" color={primaryText}>
                      {profile.name}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color={secondaryText}>연락처</Text>
                    <Text fontWeight="medium" color={primaryText}>
                      {formatPhoneNumberWithHyphen(profile.phone || "")}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color={secondaryText}>이메일</Text>
                    <Text fontWeight="medium" color={primaryText}>
                      {profile.email}
                    </Text>
                  </HStack>
                  {userGender && (
                    <HStack justifyContent="space-between">
                      <Text color={secondaryText}>성별</Text>
                      <Text fontWeight="medium" color={primaryText}>
                        {userGender === "MALE"
                          ? "남성"
                          : userGender === "FEMALE"
                          ? "여성"
                          : "기타"}
                      </Text>
                    </HStack>
                  )}
                </SimpleGrid>
              </Fieldset.Content>
            </Box>
          </Fieldset.Root>
        )}
        <Fieldset.Root mb={6}>
          <Box {...cardStyleProps}>
            <Fieldset.Legend {...legendStyleProps}>강습 정보</Fieldset.Legend>
            <Fieldset.Content>
              <SimpleGrid
                columns={{ base: 1, sm: 2 }}
                gapX={8}
                gapY={3}
                fontSize="sm"
              >
                <HStack justifyContent="space-between">
                  <Text color={secondaryText}>강습명</Text>
                  <Text fontWeight="medium" color={primaryText}>
                    {lessonTitle}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color={secondaryText}>강습기간</Text>
                  <Text fontWeight="medium" color={primaryText}>
                    {lessonStartDate} ~ {lessonEndDate}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color={secondaryText}>강습시간</Text>
                  <Text fontWeight="medium" color={primaryText}>
                    {lessonTime}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color={secondaryText}>결제금액 (기본)</Text>
                  <Text fontWeight="bold" color={primaryText}>
                    {lessonPrice.toLocaleString()}원
                  </Text>
                </HStack>
              </SimpleGrid>
            </Fieldset.Content>
          </Box>
        </Fieldset.Root>
        <Fieldset.Root mb={6}>
          <Box {...cardStyleProps}>
            <Fieldset.Legend {...legendStyleProps}>
              사물함 추가 신청
            </Fieldset.Legend>
            <Fieldset.Content>
              <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <Checkbox.Root
                  display="flex"
                  alignItems="center"
                  checked={selectedLocker}
                  onCheckedChange={(d) => {
                    if (typeof d.checked === "boolean")
                      setSelectedLocker(d.checked);
                  }}
                  colorPalette={primaryDefault}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    borderColor={borderColor}
                    mr={2}
                    _checked={{
                      bg: primaryDefault,
                      borderColor: primaryDefault,
                      color: inverseText,
                    }}
                    _focus={{ boxShadow: "outline" }}
                  />
                  <Checkbox.Label
                    fontSize="md"
                    fontWeight="bold"
                    color={primaryText}
                  >
                    사물함을 추가 신청합니다
                  </Checkbox.Label>
                </Checkbox.Root>
                <Text fontSize="xs" color={accentDelete} fontWeight="bold">
                  * 선착순 배정입니다.
                </Text>
              </Flex>

              <Text fontSize="xs" color={accentWarning} mt={0} mb={3} ml={0}>
                * 사물함은 신청 시에만 선택할 수 있으며, 이후 변경/추가는 현장
                문의바랍니다.
              </Text>

              <HStack justifyContent="space-between" mt={2} fontSize="sm">
                <Text color={secondaryText}>추가요금:</Text>
                <Text fontWeight="medium" color={primaryText}>
                  {DEFAULT_LOCKER_FEE.toLocaleString()}원
                </Text>
              </HStack>
              <HStack justifyContent="space-between" mt={1} fontSize="sm">
                <Text color={secondaryText}>잔여 수량 :</Text>
                {isLockerDetailsLoading ? (
                  <Spinner size="xs" color={radioItemSpinnerColor} />
                ) : lockerError ? (
                  <Text color={accentDelete} fontSize="xs">
                    확인불가
                  </Text>
                ) : (
                  <Text fontWeight="medium" color={primaryText}>
                    {currentLockerCount}개
                  </Text>
                )}
              </HStack>
            </Fieldset.Content>
          </Box>
        </Fieldset.Root>
        <Fieldset.Root mb={6}>
          <Box {...cardStyleProps}>
            <HStack {...legendStyleProps} alignItems="baseline">
              <Image
                src="/images/apply/pay_asset.png"
                alt="pay_asset"
                width={16}
                height={16}
              />
              <Text>
                할인 회원유형선택{" "}
                <Text
                  as="span"
                  fontSize="xs"
                  fontWeight="normal"
                  color={secondaryText}
                >
                  (정상요금{" "}
                  {membershipOptions.find((o) => o.discountPercentage > 0)
                    ?.discountPercentage || 10}
                  %할인)
                </Text>
              </Text>
            </HStack>
            <Fieldset.Content>
              <RadioGroup.Root
                value={selectedMembershipType}
                onValueChange={(d) => {
                  if (typeof d.value === "string")
                    setSelectedMembershipType(d.value);
                }}
              >
                <VStack align="stretch" gap={2}>
                  {membershipOptions.map((opt) => {
                    const discountedLessonPrice = getDiscountedPrice(
                      lessonPrice,
                      opt.discountPercentage
                    );
                    const isSelected = selectedMembershipType === opt.value;

                    const radioBg = isSelected
                      ? primaryAlpha
                      : radioUnselectedBg;
                    const radioBorder = isSelected
                      ? primaryDefault
                      : borderColor;
                    const radioHoverBorder = isSelected
                      ? primaryDefault
                      : radioUnselectedHoverBorder;
                    const radioPriceTextColor = isSelected
                      ? primaryDefault
                      : primaryText;
                    const radioControlBorder = borderColor;
                    const radioControlCheckedBg = primaryDefault;
                    const radioControlCheckedBorder = primaryDefault;
                    const radioControlCheckedColor = inverseText;

                    return (
                      <RadioGroup.Item
                        key={opt.value}
                        value={opt.value}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        p={3}
                        borderWidth={1}
                        borderColor={radioBorder}
                        borderRadius="md"
                        bg={radioBg}
                        cursor="pointer"
                        _hover={{
                          borderColor: radioHoverBorder,
                        }}
                      >
                        <HStack gap={3}>
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl
                            borderColor={radioControlBorder}
                            _checked={{
                              bg: radioControlCheckedBg,
                              borderColor: radioControlCheckedBorder,
                              color: radioControlCheckedColor,
                              _before: {
                                content: `""`,
                                display: "inline-block",
                                w: "50%",
                                h: "50%",
                                borderRadius: "50%",
                                bg: radioControlCheckedColor,
                              },
                            }}
                            _focus={{ boxShadow: "outline" }}
                          />
                          <RadioGroup.ItemText
                            fontSize="sm"
                            fontWeight="medium"
                            color={primaryText}
                          >
                            {opt.label}
                          </RadioGroup.ItemText>
                        </HStack>
                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          color={radioPriceTextColor}
                        >
                          {(opt.discountPercentage > 0
                            ? discountedLessonPrice
                            : lessonPrice
                          ).toLocaleString()}
                          원
                        </Text>
                      </RadioGroup.Item>
                    );
                  })}
                </VStack>
              </RadioGroup.Root>
              <Text fontSize="xs" color={secondaryText} mt={3}>
                * 유공자 및 할인 대상 회원은 증빙서류를 지참하여 현장
                안내데스크에 제출해주셔야 할인 적용이 완료됩니다.
              </Text>
            </Fieldset.Content>
          </Box>
        </Fieldset.Root>
        <Box
          p={{ base: 3, md: 4 }}
          borderRadius="md"
          bg={primaryDefault}
          color={inverseText}
          mb={6}
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Heading as="h2" size="sm" fontWeight="bold">
              최종 결제 예정 금액
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              color={timerYellowColor}
            >
              {finalAmount.toLocaleString()}원
            </Text>
          </Flex>
        </Box>
        <Button
          bg={primaryDefault}
          color={inverseText}
          _hover={{ bg: primaryHover }}
          _active={{ bg: primaryDark }}
          size="lg"
          height="50px"
          fontSize="md"
          onClick={handleProceedToPayment}
          w="full"
          disabled={
            isSubmitting ||
            isLoading ||
            isMembershipOptionsLoading ||
            isLockerDetailsLoading ||
            !profile ||
            (!!lockerError && selectedLocker)
          }
          loading={isSubmitting}
          loadingText="신청 처리 중..."
        >
          {isSubmitting ? (
            "신청 처리 중..."
          ) : (
            <Flex align="center">
              <Text>최종 신청 및 결제하기</Text>
            </Flex>
          )}
        </Button>
      </Container>

      {/* KISPG Payment Component */}
      {paymentData && enrollId && (
        <KISPGPaymentPopup
          ref={paymentRef}
          paymentData={paymentData}
          enrollId={enrollId}
          onPaymentComplete={handlePaymentComplete}
          onPaymentClose={handlePaymentClose}
        />
      )}
    </AuthGuard>
  );
};

export default ApplicationConfirmPage;
