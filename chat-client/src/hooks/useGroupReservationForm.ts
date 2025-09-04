import { useState, useCallback } from "react";
import {
  GroupReservationInquiryData,
  RoomReservationRequest,
} from "@/lib/api/reservation";
import { toaster } from "@/components/ui/toaster";
import { reservationApi } from "@/lib/api/reservation";
import { validateEmail } from "@/lib/utils/validationUtils";
import {
  formatPhoneNumberWithHyphen,
  isValidKoreanPhoneNumber,
} from "@/lib/utils/phoneUtils";

export type RoomValidationErrors = {
  [K in keyof RoomReservationRequest]?: string;
};

type ValidationErrors = {
  [K in keyof Omit<GroupReservationInquiryData, "roomReservations">]?: string;
} & {
  roomReservations?: string | RoomValidationErrors[];
};

type TouchedFields = {
  [K in keyof Omit<GroupReservationInquiryData, "roomReservations">]?: boolean;
} & {
  roomReservations?: {
    [index: number]: { [K in keyof RoomReservationRequest]?: boolean };
  };
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = new Date();
const sevenDaysLater = new Date();
sevenDaysLater.setDate(today.getDate() + 7);

const initialRoomRequest: RoomReservationRequest = {
  roomSizeDesc: "",
  roomTypeDesc: "",
  startDate: formatDate(today),
  endDate: formatDate(sevenDaysLater),
  usageTimeDesc: "",
};

const fieldLabels: { [key: string]: string } = {
  privacyAgreed: "개인정보 수집 및 이용 동의",
  eventType: "행사구분",
  eventName: "행사명",
  roomReservations: "세미나실",
  seatingArrangement: "좌석배치방식",
  adultAttendees: "성인 인원수",
  customerGroupName: "단체명",
  contactPersonName: "담당자명",
  contactPersonPhone: "담당자 휴대전화",
  contactPersonTel: "담당자 연락처",
  contactPersonEmail: "담당자 이메일",
  roomSizeDesc: "세미나실 크기",
  roomTypeDesc: "세미나실 종류",
  startDate: "시작일",
  endDate: "종료일",
  usageTimeDesc: "사용시간",
};

const initialFormData: GroupReservationInquiryData = {
  eventType: "",
  eventName: "",
  seatingArrangement: "강의식",
  adultAttendees: 0,
  childAttendees: 0,
  diningServiceUsage: false,
  otherRequests: "",
  customerGroupName: "",
  customerRegion: "",
  contactPersonName: "",
  contactPersonDpt: "",
  contactPersonPhone: "",
  contactPersonTel: "",
  contactPersonEmail: "",
  privacyAgreed: false,
  marketingAgreed: false,
  roomReservations: [initialRoomRequest],
};

const validateRoom = (room: RoomReservationRequest): RoomValidationErrors => {
  const newRoomErrors: RoomValidationErrors = {};
  if (!room.roomSizeDesc) newRoomErrors.roomSizeDesc = "필수";
  if (!room.roomTypeDesc) newRoomErrors.roomTypeDesc = "필수";
  if (!room.usageTimeDesc) newRoomErrors.usageTimeDesc = "필수";
  return newRoomErrors;
};

export function useGroupReservationForm() {
  const [formData, setFormData] =
    useState<GroupReservationInquiryData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [fieldToFocus, setFieldToFocus] = useState<string | null>(null);

  const clearFieldToFocus = useCallback(() => {
    setFieldToFocus(null);
  }, []);

  const updateField = useCallback(
    <K extends keyof GroupReservationInquiryData>(
      field: K,
      value: GroupReservationInquiryData[K]
    ) => {
      if (
        (field === "contactPersonPhone" || field === "contactPersonTel") &&
        typeof value === "string"
      ) {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length > 11) {
          return;
        }
        const formattedPhone = formatPhoneNumberWithHyphen(cleaned);
        setFormData((prev) => ({ ...prev, [field]: formattedPhone }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
      if (errors[field as keyof ValidationErrors]) {
        setErrors((prev) => ({
          ...prev,
          [field as keyof ValidationErrors]: undefined,
        }));
      }
    },
    [errors]
  );

  const updateRoomField = useCallback(
    (index: number, field: keyof RoomReservationRequest, value: any) => {
      setFormData((prevFormData) => {
        const newFormData = { ...prevFormData };
        const newRooms = [...newFormData.roomReservations];
        const originalRoom = newRooms[index];
        const updatedRoom = { ...originalRoom, [field]: value };

        if (field === "roomSizeDesc" && value !== originalRoom.roomSizeDesc) {
          updatedRoom.roomTypeDesc = "";
        }

        newRooms[index] = updatedRoom;
        newFormData.roomReservations = newRooms;

        const newRoomErrors = validateRoom(updatedRoom);
        setErrors((prevErrors) => {
          const newErrorsState = { ...prevErrors };
          const currentRoomErrors = Array.isArray(prevErrors.roomReservations)
            ? [...prevErrors.roomReservations]
            : [];
          currentRoomErrors[index] = newRoomErrors;
          newErrorsState.roomReservations = currentRoomErrors;
          return newErrorsState;
        });

        return newFormData;
      });

      setTouched((prev) => ({
        ...prev,
        roomReservations: {
          ...prev.roomReservations,
          [index]: {
            ...prev.roomReservations?.[index],
            [field]: true,
          },
        },
      }));
    },
    []
  );

  const updateAndValidate = useCallback(
    (field: keyof GroupReservationInquiryData, value: any) => {
      setFormData((prevData) => {
        const newData = { ...prevData, [field]: value };

        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          switch (field) {
            case "eventType":
              if (!value) newErrors.eventType = "행사구분을 선택해주세요.";
              else delete newErrors.eventType;
              break;
            case "seatingArrangement":
              if (!value)
                newErrors.seatingArrangement = "좌석배치방식을 선택해주세요.";
              else delete newErrors.seatingArrangement;
              break;
          }
          return newErrors;
        });

        return newData;
      });

      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  const addRoomRequest = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      roomReservations: [...prev.roomReservations, initialRoomRequest],
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (typeof newErrors.roomReservations === "string") {
        delete newErrors.roomReservations;
      }
      if (Array.isArray(newErrors.roomReservations)) {
        newErrors.roomReservations = [...newErrors.roomReservations, {}];
      }
      return newErrors;
    });
  }, []);

  const removeRoomRequest = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      roomReservations: prev.roomReservations.filter((_, i) => i !== index),
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (Array.isArray(newErrors.roomReservations)) {
        const filteredErrors = newErrors.roomReservations.filter(
          (_, i) => i !== index
        );
        if (filteredErrors.length > 0) {
          newErrors.roomReservations = filteredErrors;
        } else {
          delete newErrors.roomReservations;
        }
      }
      return newErrors;
    });

    setTouched((prev) => {
      if (!prev.roomReservations) return prev;
      const newRoomTouched = { ...prev.roomReservations };
      delete newRoomTouched[index];

      const reindexedTouched: TouchedFields["roomReservations"] = {};
      for (const key in newRoomTouched) {
        const numericKey = parseInt(key, 10);
        if (numericKey > index) {
          reindexedTouched[numericKey - 1] = newRoomTouched[key];
        } else {
          reindexedTouched[numericKey] = newRoomTouched[key];
        }
      }
      return { ...prev, roomReservations: reindexedTouched };
    });
  }, []);

  const validateForm = (
    data: GroupReservationInquiryData
  ): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Validate main form fields
    if (!data.eventType) newErrors.eventType = "행사구분을 선택해주세요.";
    if (!data.eventName?.trim()) newErrors.eventName = "행사명을 입력해주세요.";
    if (!data.seatingArrangement)
      newErrors.seatingArrangement = "좌석배치방식을 선택해주세요.";
    if (data.adultAttendees === undefined || data.adultAttendees <= 0)
      newErrors.adultAttendees = "성인 참석자는 1명 이상이어야 합니다.";
    if (!data.customerGroupName?.trim())
      newErrors.customerGroupName = "단체명을 입력해주세요.";
    if (!data.contactPersonName?.trim())
      newErrors.contactPersonName = "담당자명을 입력해주세요.";
    if (!data.contactPersonPhone?.trim())
      newErrors.contactPersonPhone = "담당자 휴대전화를 입력해주세요.";
    else if (!isValidKoreanPhoneNumber(data.contactPersonPhone))
      newErrors.contactPersonPhone =
        "올바른 형식의 휴대전화를 입력해주세요. (예: 010-1234-5678)";
    if (!data.contactPersonTel?.trim())
      newErrors.contactPersonTel = "담당자 연락처를 입력해주세요.";
    else if (!isValidKoreanPhoneNumber(data.contactPersonTel))
      newErrors.contactPersonTel =
        "올바른 형식의 연락처를 입력해주세요. (예: 010-1234-5678)";
    const emailError = validateEmail(data.contactPersonEmail);
    if (emailError) newErrors.contactPersonEmail = emailError;
    if (!data.privacyAgreed)
      newErrors.privacyAgreed = "개인정보 수집 및 이용에 동의해주세요.";

    // Validate room reservations
    if (data.roomReservations.length === 0) {
      newErrors.roomReservations = "세미나실을 하나 이상 추가해주세요.";
    } else {
      const roomErrors: RoomValidationErrors[] = [];
      data.roomReservations.forEach((room, index) => {
        const currentRoomErrors = validateRoom(room);
        if (Object.keys(currentRoomErrors).length > 0) {
          roomErrors[index] = currentRoomErrors;
        }
      });
      if (roomErrors.some((error) => Object.keys(error || {}).length > 0)) {
        newErrors.roomReservations = roomErrors;
      }
    }

    return newErrors;
  };

  const handleBlur = (fieldName: keyof GroupReservationInquiryData) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const validationErrors = validateForm(formData);
    const fieldError = validationErrors[fieldName as keyof ValidationErrors];
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError,
    }));
  };

  const fieldOrder: (keyof GroupReservationInquiryData | "roomReservations")[] =
    [
      "privacyAgreed",
      "eventType",
      "eventName",
      "roomReservations",
      "seatingArrangement",
      "adultAttendees",
      "customerGroupName",
      "contactPersonName",
      "contactPersonPhone",
      "contactPersonTel",
      "contactPersonEmail",
    ];

  const roomFieldOrder: (keyof RoomReservationRequest)[] = [
    "roomSizeDesc",
    "roomTypeDesc",
    "startDate",
    "endDate",
    "usageTimeDesc",
  ];

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    onSuccess?: () => void
  ) => {
    event.preventDefault();
    setFieldToFocus(null);

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      let firstErrorField: string | null = null;
      const errorFieldNames: string[] = [];

      for (const fieldName of fieldOrder) {
        const error = validationErrors[fieldName as keyof ValidationErrors];
        if (error) {
          if (fieldName === "roomReservations") {
            if (typeof error === "string") {
              if (!firstErrorField) firstErrorField = "add-room-button";
              if (!errorFieldNames.includes(fieldLabels.roomReservations))
                errorFieldNames.push(fieldLabels.roomReservations);
            } else if (Array.isArray(error)) {
              for (let i = 0; i < formData.roomReservations.length; i++) {
                const roomError = error[i];
                if (roomError && Object.keys(roomError).length > 0) {
                  for (const roomFieldName of roomFieldOrder) {
                    if (
                      roomError[roomFieldName as keyof RoomValidationErrors]
                    ) {
                      if (!firstErrorField)
                        firstErrorField = `roomReservations.${i}.${roomFieldName}`;
                      const label = fieldLabels[roomFieldName];
                      if (!errorFieldNames.includes(label))
                        errorFieldNames.push(label);
                    }
                  }
                }
              }
            }
          } else {
            if (!firstErrorField) firstErrorField = fieldName as string;
            const label = fieldLabels[fieldName as string];
            if (label && !errorFieldNames.includes(label))
              errorFieldNames.push(label);
          }
        }
      }

      if (firstErrorField) {
        setFieldToFocus(firstErrorField);
      }

      const description = `다음 필수 항목을 확인해주세요: ${errorFieldNames.join(
        ", "
      )}`;

      toaster.error({
        title: "입력 오류",
        description:
          errorFieldNames.length > 0
            ? description
            : "필수 항목을 모두 입력해주세요.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await reservationApi.createGroupReservationInquiry(formData);
      toaster.success({
        title: "문의 접수 완료",
        description: "문의가 성공적으로 접수되었습니다.",
        duration: 5000,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toaster.error({
        title: "오류",
        description: "문의 접수 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    errors,
    touched,
    fieldToFocus,
    updateField,
    updateRoomField,
    addRoomRequest,
    removeRoomRequest,
    handleSubmit,
    handleBlur,
    updateAndValidate,
    clearFieldToFocus,
  };
}
