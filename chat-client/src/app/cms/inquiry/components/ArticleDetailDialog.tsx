"use client";

import {
  Badge,
  Button,
  CloseButton,
  Dialog,
  Input,
  Portal,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  Box,
  Field,
  Fieldset,
  NativeSelect,
  Separator,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { GroupReservationInquiry } from "@/types/api";
import { reservationApi, reservationKeys } from "@/lib/api/reservation";
import { toaster } from "@/components/ui/toaster";
import { STATUS_MAP } from "../lib/constants";

interface ArticleDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: GroupReservationInquiry | null;
}

export const ArticleDetailDialog = ({
  isOpen,
  onClose,
  inquiry,
}: ArticleDetailDialogProps) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status || "");
      setMemo(inquiry.adminMemo || inquiry.memo || "");
    }
  }, [inquiry]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: {
      id: number;
      payload: { status: string; memo?: string };
    }) =>
      reservationApi.updateGroupReservationInquiryStatus(data.id, data.payload),
    onSuccess: () => {
      toaster.success({ title: "저장되었습니다." });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      onClose();
    },
    onError: (error: any) => {
      toaster.error({
        title: "오류가 발생했습니다.",
        description: error.message || "상태 업데이트에 실패했습니다.",
      });
    },
  });

  const handleSave = () => {
    if (inquiry) {
      mutate({ id: inquiry.id, payload: { status, memo } });
    }
  };

  if (!inquiry) return null;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>문의 상세 정보</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={6} align="stretch">
                <Fieldset.Root>
                  <Fieldset.Legend>고객 정보</Fieldset.Legend>
                  <Fieldset.Content>
                    <SimpleGrid columns={2} gap={4} mt={2}>
                      <Field.Root>
                        <Field.Label>단체명</Field.Label>
                        <Text>{inquiry.customerGroupName}</Text>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>담당자명</Field.Label>
                        <Text>{inquiry.contactPersonName}</Text>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>연락처</Field.Label>
                        <Text>{inquiry.contactPersonTel}</Text>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>휴대전화</Field.Label>
                        <Text>{inquiry.contactPersonPhone}</Text>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>이메일</Field.Label>
                        <Text>{inquiry.contactPersonEmail}</Text>
                      </Field.Root>
                    </SimpleGrid>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Separator />

                <Fieldset.Root>
                  <Fieldset.Legend>행사 정보</Fieldset.Legend>
                  <Fieldset.Content>
                    <SimpleGrid columns={2} gap={4} mt={2}>
                      <Field.Root>
                        <Field.Label>행사명</Field.Label>
                        <Text>{inquiry.eventName}</Text>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>행사 구분</Field.Label>
                        <Badge>{inquiry.eventType}</Badge>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>참석 인원</Field.Label>
                        <Text>
                          성인 {inquiry.adultAttendees}명 / 소인{" "}
                          {inquiry.childAttendees}명
                        </Text>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>식당 사용</Field.Label>
                        <Text>{inquiry.diningServiceUsage ? "Y" : "N"}</Text>
                      </Field.Root>
                    </SimpleGrid>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Separator />

                <Fieldset.Root>
                  <Fieldset.Legend>세미나실 예약 정보</Fieldset.Legend>
                  <Fieldset.Content>
                    <VStack align="stretch" gap={4} mt={2}>
                      {inquiry.roomReservations.map((room, index) => (
                        <Box
                          key={index}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                          bg="gray.50"
                        >
                          <Text fontWeight="bold" mb={2}>
                            세미나실 {index + 1}
                          </Text>
                          <SimpleGrid columns={2} gap={2}>
                            <Text>
                              <b>종류:</b> {room.roomTypeDesc}
                            </Text>
                            <Text>
                              <b>크기:</b> {room.roomSizeDesc}
                            </Text>
                            <Text>
                              <b>시간:</b> {room.usageTimeDesc}
                            </Text>
                            <Text>
                              <b>일정:</b> {room.startDate} ~ {room.endDate}
                            </Text>
                          </SimpleGrid>
                        </Box>
                      ))}
                    </VStack>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Separator />

                <Fieldset.Root>
                  <Fieldset.Legend>관리</Fieldset.Legend>
                  <Fieldset.Content>
                    <VStack gap={4} align="stretch" mt={2}>
                      <Field.Root>
                        <Field.Label>상태 변경</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={status}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              setStatus(e.target.value)
                            }
                          >
                            {Object.entries(STATUS_MAP).map(([key, value]) => (
                              <option key={key} value={key}>
                                {value?.label}
                              </option>
                            ))}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>관리자 메모</Field.Label>
                        <Textarea
                          value={memo}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            setMemo(e.target.value)
                          }
                          placeholder="관리자용 메모를 남겨주세요."
                          rows={8}
                        />
                      </Field.Root>
                    </VStack>
                  </Fieldset.Content>
                </Fieldset.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorScheme="blue"
                onClick={handleSave}
                loading={isPending}
              >
                저장
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
