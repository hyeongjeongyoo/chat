"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Field,
  Fieldset,
  Input,
  Stack,
  Flex,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  Textarea,
  Spinner,
  Portal,
  Grid,
  Checkbox,
} from "@chakra-ui/react";
import { CheckIcon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  ApproveCancelRequestDto,
  DenyCancelRequestDto,
  EnrollAdminResponseDto,
  RefundCalculationPreviewDto,
  RefundCalculationPreviewRequestDto,
  ApiResponse,
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import type { EnrollmentPayStatus } from "@/types/statusTypes";
import { AxiosError } from "axios";

interface UICalculatedRefundDetails {
  usedDays: number;
  manualUsedDays?: number | null;
  lessonUsageAmount: number;
  finalRefundAmount: number;
  originalLessonPrice: number;
  paidLessonAmount: number;
  paidLockerAmount: number;
}

interface UIPaymentInfo {
  tid: string | null;
  paidAmt?: number;
  lessonPaidAmt: number;
  lockerPaidAmt: number;
}

export interface CancelRequestData {
  enrollId: number;
  userName: string;
  userLoginId: string;
  userPhone: string;
  lessonTitle: string;
  lessonId: number;
  requestedAt: string;
  userReason: string | null;
  paymentInfo: UIPaymentInfo;
  calculatedRefundDetails: {
    systemCalculatedUsedDays: number;
    manualUsedDays: number | null;
    effectiveUsedDays: number;
    originalLessonPrice: number;
    paidLessonAmount: number;
    paidLockerAmount: number;
    lessonUsageDeduction: number;
    finalRefundAmount: number;
  };
  calculatedRefundAmtByNewPolicy: number;
  cancellationProcessingStatus: string;
  paymentStatus: string;
  adminComment?: string;

  id?: string;
  paymentDisplayStatus?: EnrollmentPayStatus;
}

interface ReviewCancelRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: CancelRequestData | null;
}

const formatCurrency = (
  amount: number | undefined | null,
  showWon: boolean = true
) => {
  if (amount === undefined || amount === null) return "-";
  const formatted = new Intl.NumberFormat("ko-KR").format(Math.round(amount));
  return showWon ? formatted + "원" : formatted;
};

export const ReviewCancelRequestDialog: React.FC<
  ReviewCancelRequestDialogProps
> = ({ isOpen, onClose, selectedRequest }) => {
  const queryClient = useQueryClient();
  const [manualUsedDaysInput, setManualUsedDaysInput] = useState<number>(0);
  const [adminComment, setAdminComment] = useState("");
  const [currentRefundDetails, setCurrentRefundDetails] =
    useState<UICalculatedRefundDetails | null>(null);
  const [isFullRefund, setIsFullRefund] = useState(false);
  const [finalRefundAmountInput, setFinalRefundAmountInput] = useState("0");
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  useEffect(() => {
    if (selectedRequest && isOpen) {
      const initialDays =
        selectedRequest.calculatedRefundDetails?.manualUsedDays ??
        selectedRequest.calculatedRefundDetails?.systemCalculatedUsedDays;

      setManualUsedDaysInput(initialDays);
      setCurrentRefundDetails({
        usedDays:
          selectedRequest.calculatedRefundDetails?.systemCalculatedUsedDays,
        manualUsedDays: selectedRequest.calculatedRefundDetails?.manualUsedDays,
        lessonUsageAmount:
          selectedRequest.calculatedRefundDetails?.lessonUsageDeduction,
        finalRefundAmount:
          selectedRequest.calculatedRefundDetails?.finalRefundAmount,
        originalLessonPrice:
          selectedRequest.calculatedRefundDetails?.originalLessonPrice,
        paidLessonAmount:
          selectedRequest.calculatedRefundDetails?.paidLessonAmount,
        paidLockerAmount:
          selectedRequest.calculatedRefundDetails?.paidLockerAmount,
      });
      setAdminComment("");
      setIsFullRefund(false);
      setIsOverrideMode(false);
      setFinalRefundAmountInput(
        formatCurrency(
          selectedRequest.calculatedRefundDetails?.finalRefundAmount || 0,
          false
        )
      );

      previewRefundMutation.mutate({
        enrollId: selectedRequest.enrollId,
        data: { manualUsedDays: initialDays },
      });
    } else {
      setManualUsedDaysInput(0);
      setAdminComment("");
      setCurrentRefundDetails(null);
      setIsFullRefund(false);
      setIsOverrideMode(false);
      setFinalRefundAmountInput("0");
      previewRefundMutation.reset();
      approveMutation.reset();
      denyMutation.reset();
    }
  }, [selectedRequest, isOpen]);

  useEffect(() => {
    if (currentRefundDetails && !isOverrideMode && !isFullRefund) {
      setFinalRefundAmountInput(
        formatCurrency(currentRefundDetails.finalRefundAmount, false)
      );
    }
  }, [currentRefundDetails, isOverrideMode, isFullRefund]);

  const handleFullRefundChange = (checked: boolean) => {
    setIsFullRefund(checked);
    if (checked) {
      setIsOverrideMode(true);
      const totalPaid =
        (selectedRequest?.paymentInfo.lessonPaidAmt ?? 0) +
        (selectedRequest?.paymentInfo.lockerPaidAmt ?? 0);
      setFinalRefundAmountInput(formatCurrency(totalPaid, false));
    } else {
      setIsOverrideMode(false);
      setFinalRefundAmountInput(
        formatCurrency(currentRefundDetails?.finalRefundAmount ?? 0, false)
      );
    }
  };

  const handleFinalRefundAmountChange = (value: string) => {
    setIsOverrideMode(true);
    const numericString = value.replace(/[^0-9]/g, "");
    const numericValue = parseInt(numericString, 10);
    const formattedValue =
      numericString === "" ? "" : formatCurrency(numericValue, false);
    setFinalRefundAmountInput(formattedValue);

    const totalPaid =
      (selectedRequest?.paymentInfo.lessonPaidAmt ?? 0) +
      (selectedRequest?.paymentInfo.lockerPaidAmt ?? 0);
    if (!isNaN(numericValue) && numericValue === totalPaid) {
      setIsFullRefund(true);
    } else {
      setIsFullRefund(false);
    }
  };

  const handleUsedDaysChange = (value: string) => {
    setIsOverrideMode(false);
    const days = value === "" ? 0 : Math.max(0, parseInt(value, 10));
    setManualUsedDaysInput(days);

    if (!selectedRequest) return;

    previewRefundMutation.mutate({
      enrollId: selectedRequest.enrollId,
      data: { manualUsedDays: days },
    });
  };

  const previewRefundMutation = useMutation<
    ApiResponse<RefundCalculationPreviewDto>,
    Error,
    { enrollId: number; data: RefundCalculationPreviewRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.calculateRefundPreview(enrollId, data),
    onSuccess: (responseData) => {
      if (!responseData.success) {
        toaster.create({
          title: "미리보기 실패",
          description:
            responseData.message ||
            "환불 미리보기 계산 중 오류가 발생했습니다.",
          type: "error",
        });
        return;
      }

      const refundDetailsPreview = responseData.data;
      if (refundDetailsPreview) {
        const newRefundDetails: UICalculatedRefundDetails = {
          usedDays: refundDetailsPreview.systemCalculatedUsedDays,
          manualUsedDays: refundDetailsPreview.manualUsedDays,
          lessonUsageAmount: refundDetailsPreview.lessonUsageDeduction,
          finalRefundAmount: refundDetailsPreview.finalRefundAmount,
          originalLessonPrice: refundDetailsPreview.originalLessonPrice,
          paidLessonAmount: refundDetailsPreview.paidLessonAmount,
          paidLockerAmount: refundDetailsPreview.lockerPaidAmt,
        };
        setCurrentRefundDetails(newRefundDetails);

        if (refundDetailsPreview.isFullRefund) {
          const totalPaid =
            (selectedRequest?.paymentInfo.lessonPaidAmt ?? 0) +
            (selectedRequest?.paymentInfo.lockerPaidAmt ?? 0);
          setFinalRefundAmountInput(formatCurrency(totalPaid, false));
        }

        setIsFullRefund(refundDetailsPreview.isFullRefund);
        setIsOverrideMode(false);

        toaster.create({
          title: "환불액 미리보기 업데이트됨",
          description: `환불 예정액: ${formatCurrency(
            newRefundDetails.finalRefundAmount
          )}`,
          type: "info",
          duration: 2000,
        });
      }
    },
    onError: (error: Error) => {
      toaster.create({
        title: "미리보기 실패",
        description:
          error.message || "환불 미리보기 계산 중 오류가 발생했습니다.",
        type: "error",
      });
    },
  });

  const approveMutation = useMutation<
    EnrollAdminResponseDto,
    AxiosError<ApiResponse<null>>,
    { enrollId: number; data: ApproveCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.approveAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      toaster.create({
        title: "성공",
        description: "승인 처리가 완료되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["adminCancelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminEnrollments"] });
      onClose();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "승인 처리 중 오류가 발생했습니다.";
      toaster.create({
        title: "승인 처리 실패",
        description: message,
        type: "error",
      });
    },
  });

  const denyMutation = useMutation<
    EnrollAdminResponseDto,
    AxiosError<ApiResponse<null>>,
    { enrollId: number; data: DenyCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.denyAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      toaster.create({
        title: "성공",
        description: "거부 처리가 완료되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["adminCancelRequests"] });
      // 신청자 관리 리스트도 리프레시
      queryClient.invalidateQueries({ queryKey: ["adminEnrollments"] });
      onClose();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "거부 처리 중 오류가 발생했습니다.";
      toaster.create({
        title: "거부 처리 실패",
        description: message,
        type: "error",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedRequest) return;

    let requestData: Partial<ApproveCancelRequestDto> = {
      adminComment: adminComment || undefined,
    };

    if (isOverrideMode) {
      const finalAmount = parseInt(
        finalRefundAmountInput.replace(/[^0-9]/g, ""),
        10
      );
      if (isNaN(finalAmount) || finalAmount < 0) {
        toaster.create({
          title: "입력 오류",
          description: "유효한 환불 금액을 입력해주세요.",
          type: "error",
        });
        return;
      }
      requestData = {
        ...requestData,
        finalRefundAmount: finalAmount,
        isFullRefund: isFullRefund,
      };
    } else {
      requestData = {
        ...requestData,
        manualUsedDays: manualUsedDaysInput,
      };
    }

    approveMutation.mutate({
      enrollId: selectedRequest.enrollId,
      data: requestData as ApproveCancelRequestDto,
    });
  };

  const handleDeny = () => {
    if (!selectedRequest) return;
    const denialData: DenyCancelRequestDto = {
      adminComment: adminComment || undefined,
    };
    denyMutation.mutate({
      enrollId: selectedRequest.enrollId,
      data: denialData,
    });
  };

  if (!selectedRequest) return null;

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxW="xl">
            <DialogHeader>
              <DialogTitle>
                취소/환불 검토 - {selectedRequest.userName}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={3}>
                <Fieldset.Root>
                  <Fieldset.Content>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      <Field.Root>
                        <Field.Label>강습명</Field.Label>
                        <Input value={selectedRequest?.lessonTitle} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>회원명</Field.Label>
                        <Input value={selectedRequest?.userName} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>회원ID</Field.Label>
                        <Input value={selectedRequest?.userLoginId} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>연락처</Field.Label>
                        <Input value={selectedRequest?.userPhone} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>결제 총액</Field.Label>
                        <Input
                          value={formatCurrency(
                            (selectedRequest?.paymentInfo.lessonPaidAmt ?? 0) +
                              (selectedRequest?.paymentInfo.lockerPaidAmt ?? 0)
                          )}
                          readOnly
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>강습료 결제액</Field.Label>
                        <Input
                          value={formatCurrency(
                            selectedRequest?.paymentInfo?.lessonPaidAmt
                          )}
                          readOnly
                        />
                      </Field.Root>
                      {selectedRequest?.paymentInfo?.lockerPaidAmt > 0 && (
                        <Field.Root>
                          <Field.Label>사물함 결제액</Field.Label>
                          <Input
                            value={formatCurrency(
                              selectedRequest.paymentInfo.lockerPaidAmt
                            )}
                            readOnly
                          />
                        </Field.Root>
                      )}{" "}
                      <Field.Root>
                        <Field.Label>실사용일수</Field.Label>
                        <Input
                          type="number"
                          value={manualUsedDaysInput?.toString()}
                          onChange={(e) => handleUsedDaysChange(e.target.value)}
                          min={0}
                          disabled={
                            previewRefundMutation.isPending || isOverrideMode
                          }
                        />
                        <Field.HelperText>
                          최초 시스템 계산일:{" "}
                          {
                            selectedRequest?.calculatedRefundDetails
                              ?.systemCalculatedUsedDays
                          }
                          일
                          {selectedRequest?.calculatedRefundDetails
                            ?.manualUsedDays !== null &&
                            selectedRequest?.calculatedRefundDetails
                              ?.manualUsedDays !==
                              selectedRequest?.calculatedRefundDetails
                                ?.systemCalculatedUsedDays &&
                            ` (이전 관리자 설정: ${selectedRequest?.calculatedRefundDetails?.manualUsedDays}일)`}
                        </Field.HelperText>
                      </Field.Root>
                    </Grid>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Fieldset.Root>
                  <Fieldset.Content>
                    <Stack gap={4}>
                      <Checkbox.Root
                        checked={isFullRefund}
                        onCheckedChange={(details) =>
                          handleFullRefundChange(!!details.checked)
                        }
                        colorScheme="blue"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>전액 환불 처리</Checkbox.Label>
                      </Checkbox.Root>
                      {currentRefundDetails && (
                        <Box
                          p={4}
                          bg="gray.50"
                          _dark={{ bg: "gray.700" }}
                          borderRadius="md"
                        >
                          {" "}
                          {previewRefundMutation.isPending ? (
                            <Flex
                              justify="center"
                              align="center"
                              height="150px"
                            >
                              <Spinner size="md" />
                            </Flex>
                          ) : (
                            <Box height="150px">
                              {" "}
                              <Text fontWeight="bold" mb={3}>
                                환불 계산 내역 (기준 사용일:{" "}
                                {isFullRefund
                                  ? 0
                                  : isOverrideMode
                                  ? "수동"
                                  : currentRefundDetails?.manualUsedDays ??
                                    currentRefundDetails?.usedDays}
                                일)
                              </Text>
                              <Stack gap={2} fontSize="sm">
                                <Flex justify="space-between">
                                  <Text>강습료 결제액</Text>
                                  <Text>
                                    {formatCurrency(
                                      currentRefundDetails?.paidLessonAmount
                                    )}
                                  </Text>
                                </Flex>
                                <Flex justify="space-between">
                                  <Text>강습료 사용액</Text>
                                  <Text>
                                    -
                                    {formatCurrency(
                                      isFullRefund
                                        ? 0
                                        : isOverrideMode
                                        ? (currentRefundDetails.paidLessonAmount ??
                                            0) -
                                          (parseInt(
                                            finalRefundAmountInput.replace(
                                              /[^0-9]/g,
                                              ""
                                            ),
                                            10
                                          ) || 0)
                                        : currentRefundDetails?.lessonUsageAmount
                                    )}
                                  </Text>
                                </Flex>
                                <Box>
                                  <Flex
                                    justify="space-between"
                                    fontWeight="bold"
                                    fontSize="md"
                                    align="center"
                                  >
                                    <Text>최종 환불액</Text>
                                    <Flex
                                      w="150px"
                                      align="center"
                                      pos="relative"
                                    >
                                      <Input
                                        textAlign="right"
                                        color="red.500"
                                        value={finalRefundAmountInput}
                                        onChange={(e) =>
                                          handleFinalRefundAmountChange(
                                            e.target.value
                                          )
                                        }
                                        disabled={
                                          previewRefundMutation.isPending
                                        }
                                        pr="2.5rem"
                                        inputMode="numeric"
                                      />
                                      <Box
                                        pos="absolute"
                                        right="0.75rem"
                                        zIndex="docked"
                                      >
                                        <Text as="span" color="red.500">
                                          원
                                        </Text>
                                      </Box>
                                    </Flex>
                                  </Flex>
                                </Box>
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Stack direction="row" gap={4} my={2} align="center">
                  <Checkbox.Root
                    id="full-refund-override"
                    checked={isFullRefund}
                    onCheckedChange={(details) =>
                      handleFullRefundChange(details.checked === true)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>전액환불</Checkbox.Label>
                  </Checkbox.Root>
                </Stack>

                <Field.Root>
                  <Field.Label>관리자 메모</Field.Label>
                  <Textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="처리 사유나 특이사항을 입력하세요"
                    rows={3}
                  />
                </Field.Root>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Stack
                direction="row"
                gap={2}
                width="full"
                justifyContent="flex-end"
              >
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
                <Button
                  colorPalette="red"
                  onClick={handleDeny}
                  loading={denyMutation.isPending}
                >
                  <XIcon size={16} style={{ marginRight: "4px" }} /> 거부
                </Button>
                <Button
                  colorPalette="green"
                  onClick={handleApprove}
                  loading={
                    approveMutation.isPending || previewRefundMutation.isPending
                  }
                >
                  <CheckIcon size={16} style={{ marginRight: "4px" }} /> 승인 및
                  환불
                </Button>
              </Stack>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};
