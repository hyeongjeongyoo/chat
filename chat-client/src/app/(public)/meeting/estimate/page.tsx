"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  VStack,
  HStack,
  IconButton,
  Text,
  Textarea,
  Input,
  Separator,
  Checkbox,
  Field,
  Fieldset,
  RadioGroup,
  For,
  Select,
  createListCollection,
  Portal,
  Grid,
} from "@chakra-ui/react";
import { useGroupReservationForm } from "@/hooks/useGroupReservationForm";
import { AgreementItem } from "@/app/(public)/signup/components/AgreementItem";
import { CheckCircle2, MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { SIGNUP_AGREEMENT_TEMPLATES } from "@/data/agreements";

const seminarRoomsData = {
  대회의실: ["그랜드볼룸"],
  중회의실: ["시걸", "클로버", "자스민", "마리나"],
  소회의실: ["가람", "누리", "오션"],
};

const seatingArrangements = createListCollection({
  items: ["강의식", "극장식", "ㄷ자", "I자", "T자"].map((item) => ({
    label: item,
    value: item,
  })),
});
const eventTypes = createListCollection({
  items: ["세미나", "워크숍", "컨퍼런스", "기타"].map((item) => ({
    label: item,
    value: item,
  })),
});
const usageTimes = createListCollection({
  items: ["오전 (09:00-12:00)", "오후 (13:00-18:00)", "종일 (09:00-18:00)"].map(
    (item) => ({ label: item, value: item })
  ),
});

const seminarRoomSizes = createListCollection({
  items: Object.keys(seminarRoomsData).map((item) => ({
    label: item,
    value: item,
  })),
});

const getSeminarRoomTypes = (size: string) => {
  const types = seminarRoomsData[size as keyof typeof seminarRoomsData] || [];
  return createListCollection({
    items: types.map((item) => ({ label: item, value: item })),
  });
};

const renderDetails = (details: string) => {
  // First handle red tags, then bold tags
  const processText = (text: string) => {
    const redParts = text.split(/<red>(.*?)<\/red>/g);
    return redParts.map((redPart, redIndex) => {
      if (redIndex % 2 === 1) {
        // This is content inside red tags
        return (
          <Text as="span" color="red.500" key={`red-${redIndex}`}>
            {redPart}
          </Text>
        );
      } else {
        // This is regular text, check for bold tags
        const boldParts = redPart.split(/<bold>(.*?)<\/bold>/g);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldIndex % 2 === 1) {
            // This is content inside bold tags
            return (
              <Text
                as="span"
                fontWeight="bold"
                key={`bold-${redIndex}-${boldIndex}`}
              >
                {boldPart}
              </Text>
            );
          } else {
            // Regular text - handle line breaks
            return boldPart.split("\n").map((line, lineIndex) => (
              <React.Fragment
                key={`line-${redIndex}-${boldIndex}-${lineIndex}`}
              >
                {line}
                {lineIndex < boldPart.split("\n").length - 1 && <br />}
              </React.Fragment>
            ));
          }
        });
      }
    });
  };

  return processText(details);
};

export default function GroupReservationPage() {
  const {
    formData,
    isLoading,
    errors,
    touched,
    updateField,
    updateRoomField,
    addRoomRequest,
    removeRoomRequest,
    handleSubmit,
    handleBlur,
    updateAndValidate,
    fieldToFocus,
    clearFieldToFocus,
  } = useGroupReservationForm();

  const router = useRouter();
  const fieldRefs = useRef(new Map<string, HTMLElement>());

  React.useEffect(() => {
    if (fieldToFocus) {
      const element = fieldRefs.current.get(fieldToFocus);

      if (element) {
        if (element.getAttribute("role") === "radiogroup") {
          const firstRadio =
            element.querySelector<HTMLElement>('[role="radio"]');
          if (firstRadio) {
            firstRadio.focus();
            firstRadio.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          element.focus();
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      clearFieldToFocus();
    }
  }, [fieldToFocus, clearFieldToFocus]);

  const isRoomValid = (index: number) => {
    if (!Array.isArray(errors.roomReservations)) return false;
    const roomErrors = errors.roomReservations[index];
    return !!roomErrors && Object.keys(roomErrors).length === 0;
  };

  const hasRoomBeenTouched = (index: number) => {
    return !!touched.roomReservations?.[index];
  };

  const handleAgreementChange = (
    agreementKey: "privacyAgreed" | "marketingAgreed",
    isChecked: boolean
  ) => {
    updateField(agreementKey, isChecked);
    if (agreementKey === "privacyAgreed") {
      handleBlur("privacyAgreed");
    }
  };

  const handleAllAgreementChange = (isChecked: boolean) => {
    updateField("privacyAgreed", isChecked);
    updateField("marketingAgreed", isChecked);
  };

  const areAllAgreed = formData.privacyAgreed && formData.marketingAgreed;

  return (
    <Container maxW="800px" py={12}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e, () => {
            router.push("/");
          });
        }}
      >
        <VStack gap={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            회의실 단체 예약 문의
          </Heading>

          {/* Agreements */}
          <VStack gap={4} align="stretch">
            <Box>
              <Checkbox.Root
                variant="subtle"
                colorPalette="orange"
                size="md"
                checked={areAllAgreed}
                onCheckedChange={(details) =>
                  handleAllAgreementChange(details.checked === true)
                }
                ref={(el) => {
                  if (el) fieldRefs.current.set("privacyAgreed", el);
                }}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label fontWeight="bold" fontSize="md">
                  아래의 모든 사항에 동의합니다.
                </Checkbox.Label>
              </Checkbox.Root>
              <Separator my={4} />
            </Box>
            <AgreementItem
              title="개인정보 수집 및 이용 동의"
              isRequired={true}
              isChecked={formData.privacyAgreed}
              onChange={(isChecked: boolean) =>
                handleAgreementChange("privacyAgreed", isChecked)
              }
            >
              <Box
                border="1px solid"
                borderColor="gray.200"
                p={3}
                borderRadius="md"
                mt={2}
                fontSize="sm"
                h="240px"
                w="full"
                overflowY="auto"
                bg="gray.50"
                whiteSpace="pre-wrap"
              >
                {renderDetails(
                  SIGNUP_AGREEMENT_TEMPLATES.find(
                    (agreement) => agreement.id === "terms"
                  )?.details || ""
                )}
              </Box>
            </AgreementItem>
            <AgreementItem
              title="선택 수집 항목(마케팅 활용)에 대한 동의"
              isRequired={false}
              isChecked={formData.marketingAgreed}
              onChange={(isChecked: boolean) =>
                handleAgreementChange("marketingAgreed", isChecked)
              }
            >
              <Box
                border="1px solid"
                borderColor="gray.200"
                p={3}
                borderRadius="md"
                mt={2}
                fontSize="sm"
                h="240px"
                w="full"
                overflowY="auto"
                bg="gray.50"
                whiteSpace="pre-wrap"
              >
                {renderDetails(
                  SIGNUP_AGREEMENT_TEMPLATES.find(
                    (agreement) => agreement.id === "marketing"
                  )?.details || ""
                )}
              </Box>
            </AgreementItem>
          </VStack>

          {/* Event Info */}
          <Fieldset.Root>
            <Fieldset.Legend>행사정보</Fieldset.Legend>
            <VStack gap={4} align="stretch" mt={4}>
              <Field.Root required invalid={!!errors.eventType}>
                <Field.Label>
                  행사구분{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Field.Label>
                <Select.Root
                  collection={eventTypes}
                  value={formData.eventType ? [formData.eventType] : []}
                  onValueChange={(details) =>
                    updateAndValidate("eventType", details.value[0])
                  }
                >
                  <Select.Control>
                    <Select.Trigger
                      ref={(el) => {
                        if (el) fieldRefs.current.set("eventType", el);
                      }}
                    >
                      <Select.ValueText placeholder="선택해주세요" />
                    </Select.Trigger>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        <For each={eventTypes.items}>
                          {(item) => (
                            <Select.Item item={item} key={item.value}>
                              <Select.ItemText>{item.label}</Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          )}
                        </For>
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                <Field.ErrorText>{errors.eventType}</Field.ErrorText>
              </Field.Root>

              <Field.Root required invalid={!!errors.eventName}>
                <Field.Label>
                  행사명{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Field.Label>
                <Input
                  ref={(el) => {
                    if (el) fieldRefs.current.set("eventName", el);
                  }}
                  placeholder="행사명을 입력해주세요"
                  value={formData.eventName}
                  onChange={(e) => updateField("eventName", e.target.value)}
                  onBlur={() => handleBlur("eventName")}
                />
                <Field.ErrorText>{errors.eventName}</Field.ErrorText>
              </Field.Root>

              <For each={formData.roomReservations}>
                {(room, index) => (
                  <Flex
                    key={index}
                    direction="column"
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    mt={4}
                    gap={3}
                    borderColor={
                      hasRoomBeenTouched(index) && isRoomValid(index)
                        ? "green.500"
                        : "gray.200"
                    }
                  >
                    <Flex align="center" justify="space-between" h="36px">
                      <HStack>
                        <Text fontWeight="bold">세미나실 {index + 1}</Text>
                        {hasRoomBeenTouched(index) && isRoomValid(index) && (
                          <CheckCircle2 color="green" />
                        )}
                      </HStack>
                      {formData.roomReservations.length > 1 && (
                        <IconButton
                          aria-label="Remove room"
                          size="sm"
                          onClick={() => removeRoomRequest(index)}
                          variant="ghost"
                        >
                          <MinusIcon />
                        </IconButton>
                      )}
                    </Flex>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Field.Root
                        w="full"
                        required
                        invalid={
                          Array.isArray(errors.roomReservations) &&
                          !!errors.roomReservations[index]?.roomSizeDesc
                        }
                      >
                        <Field.Label>
                          세미나실 크기{" "}
                          <Text as="span" color="red.500">
                            *
                          </Text>
                        </Field.Label>
                        <HStack w="full">
                          <Select.Root
                            w="full"
                            collection={seminarRoomSizes}
                            value={room.roomSizeDesc ? [room.roomSizeDesc] : []}
                            onValueChange={(details) => {
                              updateRoomField(
                                index,
                                "roomSizeDesc",
                                details.value[0] ?? ""
                              );
                            }}
                          >
                            <Select.Control>
                              <Select.Trigger
                                ref={(el) => {
                                  if (el)
                                    fieldRefs.current.set(
                                      `roomReservations.${index}.roomSizeDesc`,
                                      el
                                    );
                                }}
                              >
                                <Select.ValueText placeholder="크기 선택" />
                              </Select.Trigger>
                            </Select.Control>
                            <Portal>
                              <Select.Positioner w="100%">
                                <Select.Content>
                                  <For each={seminarRoomSizes.items}>
                                    {(item) => (
                                      <Select.Item item={item} key={item.value}>
                                        <Select.ItemText>
                                          {item.label}
                                        </Select.ItemText>
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    )}
                                  </For>
                                </Select.Content>
                              </Select.Positioner>
                            </Portal>
                          </Select.Root>
                        </HStack>
                      </Field.Root>

                      <Field.Root
                        w="full"
                        required
                        invalid={
                          Array.isArray(errors.roomReservations) &&
                          !!errors.roomReservations[index]?.roomTypeDesc
                        }
                      >
                        <Field.Label>
                          세미나실 종류{" "}
                          <Text as="span" color="red.500">
                            *
                          </Text>
                        </Field.Label>
                        <HStack w="full">
                          <Select.Root
                            w="full"
                            collection={getSeminarRoomTypes(room.roomSizeDesc)}
                            value={room.roomTypeDesc ? [room.roomTypeDesc] : []}
                            onValueChange={(details) =>
                              updateRoomField(
                                index,
                                "roomTypeDesc",
                                details.value[0] ?? ""
                              )
                            }
                            disabled={!room.roomSizeDesc}
                          >
                            <Select.Control>
                              <Select.Trigger
                                ref={(el) => {
                                  if (el)
                                    fieldRefs.current.set(
                                      `roomReservations.${index}.roomTypeDesc`,
                                      el
                                    );
                                }}
                              >
                                <Select.ValueText placeholder="종류 선택" />
                              </Select.Trigger>
                            </Select.Control>
                            <Portal>
                              <Select.Positioner>
                                <Select.Content>
                                  <For
                                    each={
                                      getSeminarRoomTypes(room.roomSizeDesc)
                                        .items
                                    }
                                  >
                                    {(item) => (
                                      <Select.Item item={item} key={item.value}>
                                        <Select.ItemText>
                                          {item.label}
                                        </Select.ItemText>
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    )}
                                  </For>
                                </Select.Content>
                              </Select.Positioner>
                            </Portal>
                          </Select.Root>
                        </HStack>
                      </Field.Root>

                      <Field.Root
                        w="full"
                        required
                        invalid={
                          Array.isArray(errors.roomReservations) &&
                          !!errors.roomReservations[index]?.startDate
                        }
                      >
                        <Field.Label>
                          시작일{" "}
                          <Text as="span" color="red.500">
                            *
                          </Text>
                        </Field.Label>
                        <HStack w="full">
                          <Input
                            ref={(el) => {
                              if (el)
                                fieldRefs.current.set(
                                  `roomReservations.${index}.startDate`,
                                  el
                                );
                            }}
                            w="full"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={room.startDate}
                            onChange={(e) =>
                              updateRoomField(
                                index,
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                        </HStack>
                        <Field.ErrorText>
                          {Array.isArray(errors.roomReservations) &&
                            errors.roomReservations[index]?.startDate}
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root
                        w="full"
                        required
                        invalid={
                          Array.isArray(errors.roomReservations) &&
                          !!errors.roomReservations[index]?.endDate
                        }
                      >
                        <Field.Label>
                          종료일{" "}
                          <Text as="span" color="red.500">
                            *
                          </Text>
                        </Field.Label>
                        <HStack w="full">
                          <Input
                            ref={(el) => {
                              if (el)
                                fieldRefs.current.set(
                                  `roomReservations.${index}.endDate`,
                                  el
                                );
                            }}
                            w="full"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={room.endDate}
                            onChange={(e) =>
                              updateRoomField(index, "endDate", e.target.value)
                            }
                          />
                        </HStack>
                        <Field.ErrorText>
                          {Array.isArray(errors.roomReservations) &&
                            errors.roomReservations[index]?.endDate}
                        </Field.ErrorText>
                      </Field.Root>
                    </Grid>
                    <Field.Root
                      w="full"
                      required
                      invalid={
                        Array.isArray(errors.roomReservations) &&
                        !!errors.roomReservations[index]?.usageTimeDesc
                      }
                    >
                      <Field.Label>
                        사용시간{" "}
                        <Text as="span" color="red.500">
                          *
                        </Text>
                      </Field.Label>
                      <HStack w="full">
                        <Select.Root
                          w="full"
                          collection={usageTimes}
                          value={room.usageTimeDesc ? [room.usageTimeDesc] : []}
                          onValueChange={(details) =>
                            updateRoomField(
                              index,
                              "usageTimeDesc",
                              details.value[0] ?? ""
                            )
                          }
                        >
                          <Select.Control>
                            <Select.Trigger
                              ref={(el) => {
                                if (el)
                                  fieldRefs.current.set(
                                    `roomReservations.${index}.usageTimeDesc`,
                                    el
                                  );
                              }}
                            >
                              <Select.ValueText placeholder="시간 선택" />
                            </Select.Trigger>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                <For each={usageTimes.items}>
                                  {(item) => (
                                    <Select.Item item={item} key={item.value}>
                                      <Select.ItemText>
                                        {item.label}
                                      </Select.ItemText>
                                      <Select.ItemIndicator />
                                    </Select.Item>
                                  )}
                                </For>
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      </HStack>
                    </Field.Root>
                  </Flex>
                )}
              </For>
              {typeof errors.roomReservations === "string" && (
                <Text color="red.500" fontSize="sm">
                  {errors.roomReservations}
                </Text>
              )}
              <Button
                ref={(el) => {
                  if (el) fieldRefs.current.set("add-room-button", el);
                }}
                onClick={addRoomRequest}
                variant="outline"
              >
                <HStack>
                  <PlusIcon />
                  <Text>세미나실 추가</Text>
                </HStack>
              </Button>

              <Field.Root required invalid={!!errors.seatingArrangement}>
                <Field.Label>
                  좌석배치방식{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Field.Label>
                <RadioGroup.Root
                  ref={(el) => {
                    if (el) fieldRefs.current.set("seatingArrangement", el);
                  }}
                  colorPalette="teal"
                  value={formData.seatingArrangement}
                  onValueChange={(details) =>
                    updateAndValidate("seatingArrangement", details.value ?? "")
                  }
                >
                  <HStack gap={4} align="flex-start" flexWrap="wrap">
                    <For each={seatingArrangements.items}>
                      {(item) => (
                        <RadioGroup.Item
                          key={item.value}
                          value={item.value}
                          p={2}
                          w="130px"
                          h="130px"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <VStack>
                            <RadioGroup.ItemHiddenInput />
                            <Image
                              src={`/images/meeting/${item.label}.png`}
                              alt={item.label}
                              width={100}
                              height={100}
                              style={{ objectFit: "contain" }}
                            />
                            <Box display="flex" flexDirection="row" gap={1}>
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText>
                                {item.label}
                              </RadioGroup.ItemText>
                            </Box>
                          </VStack>
                        </RadioGroup.Item>
                      )}
                    </For>
                  </HStack>
                </RadioGroup.Root>
                <Field.ErrorText>{errors.seatingArrangement}</Field.ErrorText>
              </Field.Root>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field.Root>
                  <Field.Label>인원수</Field.Label>
                  <Flex gap={4}>
                    <Field.Root required invalid={!!errors.adultAttendees}>
                      <Field.Label>
                        성인{" "}
                        <Text as="span" color="red.500">
                          *
                        </Text>
                      </Field.Label>
                      <Input
                        ref={(el) => {
                          if (el) fieldRefs.current.set("adultAttendees", el);
                        }}
                        type="number"
                        min={1}
                        value={formData.adultAttendees}
                        onChange={(e) =>
                          updateField(
                            "adultAttendees",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        onBlur={() => handleBlur("adultAttendees")}
                      />
                      <Field.ErrorText>{errors.adultAttendees}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>소인</Field.Label>
                      <Input
                        type="number"
                        min={0}
                        value={formData.childAttendees}
                        onChange={(e) =>
                          updateField(
                            "childAttendees",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                      />
                    </Field.Root>
                  </Flex>
                </Field.Root>
              </Grid>
              <Field.Root>
                <Field.Label>식당 사용 여부</Field.Label>
                <RadioGroup.Root
                  colorPalette="teal"
                  value={String(formData.diningServiceUsage)}
                  onValueChange={(details) =>
                    updateField("diningServiceUsage", details.value === "true")
                  }
                >
                  <HStack gap={4}>
                    <RadioGroup.Item value="false">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>사용안함</RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="true">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>사용함</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </HStack>
                </RadioGroup.Root>
              </Field.Root>
              <Field.Root>
                <Field.Label>기타문의</Field.Label>
                <Textarea
                  placeholder="기타 문의사항을 입력해주세요."
                  value={formData.otherRequests}
                  onChange={(e) => updateField("otherRequests", e.target.value)}
                />
              </Field.Root>
            </VStack>
          </Fieldset.Root>

          {/* Customer Info */}
          <Fieldset.Root>
            <Fieldset.Legend>고객정보</Fieldset.Legend>
            <VStack gap={4} align="stretch" mt={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field.Root required invalid={!!errors.customerGroupName}>
                  <Field.Label>
                    단체명{" "}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Field.Label>
                  <Input
                    ref={(el) => {
                      if (el) fieldRefs.current.set("customerGroupName", el);
                    }}
                    placeholder="단체명을 입력해주세요"
                    value={formData.customerGroupName}
                    onChange={(e) =>
                      updateField("customerGroupName", e.target.value)
                    }
                    onBlur={() => handleBlur("customerGroupName")}
                  />
                  <Field.ErrorText>{errors.customerGroupName}</Field.ErrorText>
                </Field.Root>
                <Field.Root>
                  <Field.Label>소속지역</Field.Label>
                  <Input
                    placeholder="소속지역을 입력해주세요"
                    value={formData.customerRegion}
                    onChange={(e) =>
                      updateField("customerRegion", e.target.value)
                    }
                  />
                </Field.Root>
                <Field.Root required invalid={!!errors.contactPersonName}>
                  <Field.Label>
                    담당자명{" "}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Field.Label>
                  <Input
                    ref={(el) => {
                      if (el) fieldRefs.current.set("contactPersonName", el);
                    }}
                    placeholder="담당자명을 입력해주세요"
                    value={formData.contactPersonName}
                    onChange={(e) =>
                      updateField("contactPersonName", e.target.value)
                    }
                    onBlur={() => handleBlur("contactPersonName")}
                  />
                  <Field.ErrorText>{errors.contactPersonName}</Field.ErrorText>
                </Field.Root>
                <Field.Root>
                  <Field.Label>부서 및 직위</Field.Label>
                  <Input
                    placeholder="부서 및 직위를 입력해주세요"
                    value={formData.contactPersonDpt}
                    onChange={(e) =>
                      updateField("contactPersonDpt", e.target.value)
                    }
                  />
                </Field.Root>
                <Field.Root required invalid={!!errors.contactPersonTel}>
                  <Field.Label>
                    담당자 연락처{" "}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Field.Label>
                  <Input
                    ref={(el) => {
                      if (el) fieldRefs.current.set("contactPersonTel", el);
                    }}
                    type="tel"
                    placeholder="연락처를 입력해주세요"
                    value={formData.contactPersonTel}
                    onChange={(e) =>
                      updateField("contactPersonTel", e.target.value)
                    }
                    onBlur={() => handleBlur("contactPersonTel")}
                  />
                  <Field.ErrorText>{errors.contactPersonTel}</Field.ErrorText>
                </Field.Root>
                <Field.Root required invalid={!!errors.contactPersonPhone}>
                  <Field.Label>
                    담당자 휴대전화{" "}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Field.Label>
                  <Input
                    ref={(el) => {
                      if (el) fieldRefs.current.set("contactPersonPhone", el);
                    }}
                    type="tel"
                    placeholder="휴대전화를 입력해주세요 (예: 010-1234-5678)"
                    value={formData.contactPersonPhone}
                    onChange={(e) =>
                      updateField("contactPersonPhone", e.target.value)
                    }
                    onBlur={() => handleBlur("contactPersonPhone")}
                  />
                  <Field.ErrorText>{errors.contactPersonPhone}</Field.ErrorText>
                </Field.Root>
                <Field.Root
                  required
                  invalid={!!errors.contactPersonEmail}
                  gridColumn="span 2"
                >
                  <Field.Label>
                    담당자 이메일{" "}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Field.Label>
                  <Input
                    ref={(el) => {
                      if (el) fieldRefs.current.set("contactPersonEmail", el);
                    }}
                    type="email"
                    placeholder="이메일을 입력해주세요"
                    value={formData.contactPersonEmail}
                    onChange={(e) =>
                      updateField("contactPersonEmail", e.target.value)
                    }
                    onBlur={() => handleBlur("contactPersonEmail")}
                  />
                  <Field.ErrorText>{errors.contactPersonEmail}</Field.ErrorText>
                </Field.Root>
              </Grid>
            </VStack>
          </Fieldset.Root>

          <Button
            colorPalette="teal"
            size="lg"
            loading={isLoading}
            type="submit"
            w="full"
          >
            문의하기
          </Button>
        </VStack>
      </form>
    </Container>
  );
}
