"use client";

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  VStack,
  Text,
  Button,
  HStack,
  Stack,
  Fieldset,
  Field,
  Input,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { StepHeader } from "./StepHeader";
import Script from "next/script";
import { toaster } from "@/components/ui/toaster";
import { useMutation } from "@tanstack/react-query";
import {
  UserSignupPayload,
  userApi,
  CheckUsernameResponse,
} from "@/lib/api/userApi";
import { CheckCircle2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { formatPhoneNumberWithHyphen } from "@/lib/utils/phoneUtils";
import {
  validateCarNumber,
  validateEmail,
  validateUsername,
} from "@/lib/utils/validationUtils";

declare global {
  interface Window {
    daum: any;
  }
}

interface Step3UserInfoProps {
  mainFlowSteps: number;
  currentProgressValue: number;
  initialAuthData: any | null;
  authKey: string | null;
  onSignupSuccess: (username: string) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  onEmailVerificationChange?: (isVerified: boolean) => void;
}

export interface Step3UserInfoRef {
  submitForm: () => void;
}

const initialPasswordCriteria = {
  minLength: false,
  lowercase: false,
  number: false,
  allowedSpecialChar: false,
  noOtherSpecialChars: false,
};

// Helper function to format gender from API (0 or 1) to internal format (FEMALE or MALE)
const formatGender = (gender: string): string => {
  if (gender === "0") return "FEMALE";
  if (gender === "1") return "MALE";
  return "";
};

// Helper component for individual checklist item in tooltip
const PasswordTooltipChecklistItem = ({
  label,
  isMet,
}: {
  label: string;
  isMet: boolean;
}) => (
  <HStack gap={2}>
    <Box color={isMet ? "green.400" : "red.400"}>
      {isMet ? <CheckCircle2Icon size={14} /> : <XCircleIcon size={14} />}
    </Box>
    <Text fontSize="xs" color={isMet ? "green.400" : "red.400"}>
      {label}
    </Text>
  </HStack>
);

export const Step3UserInfo = forwardRef<Step3UserInfoRef, Step3UserInfoProps>(
  (
    {
      mainFlowSteps,
      currentProgressValue,
      initialAuthData,
      authKey,
      onSignupSuccess,
      onSubmittingChange,
      onEmailVerificationChange,
    },
    ref
  ) => {
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const carNumberInputRef = useRef<HTMLInputElement>(null);
    const addressDetailInputRef = useRef<HTMLInputElement>(null);

    const [postcode, setPostcode] = useState("");
    const [address, setAddress] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    const [formattedMobileNo, setFormattedMobileNo] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailInputDisabled, setEmailInputDisabled] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [verificationTimer, setVerificationTimer] = useState(180); // 3분
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const [carNumber, setCarNumber] = useState("");
    const [carNumberError, setCarNumberError] = useState("");

    const [usernameInput, setUsernameInput] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
      null
    );
    const [usernameCheckMessage, setUsernameCheckMessage] = useState("");
    const [usernameSuccessMessage, setUsernameSuccessMessage] = useState("");

    const [passwordInput, setPasswordInput] = useState("");
    const [passwordConfirmInput, setPasswordConfirmInput] = useState("");
    const [passwordCriteriaMet, setPasswordCriteriaMet] = useState(
      initialPasswordCriteria
    );
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isPasswordTooltipVisible, setIsPasswordTooltipVisible] =
      useState(false);

    const sendVerificationCodeMutation = useMutation({
      mutationFn: userApi.sendEmailVerificationCode,
      onSuccess: (data) => {
        if (data.success) {
          toaster.create({
            title: "성공",
            description: data.message,
            type: "success",
          });
          setIsVerificationCodeSent(true);
          setEmailInputDisabled(true);
          setIsTimerRunning(true);
          setVerificationTimer(180);
          setVerificationError("");
        } else {
          toaster.create({
            title: "오류",
            description: data.message || "알 수 없는 오류가 발생했습니다.",
            type: "error",
          });
          setEmailError(data.message || "알 수 없는 오류가 발생했습니다.");
        }
      },
      onError: (error: Error) => {
        toaster.create({
          title: "오류",
          description: error.message || "알 수 없는 오류가 발생했습니다.",
          type: "error",
        });
      },
    });

    const verifyCodeMutation = useMutation({
      mutationFn: (vars: { email: string; code: string }) =>
        userApi.verifyEmailCode(vars.email, vars.code),
      onSuccess: (data) => {
        if (data.success) {
          toaster.create({
            title: "성공",
            description: data.message,
            type: "success",
          });
          setIsEmailVerified(true);
          setIsTimerRunning(false);
          setVerificationError("");
          setIsVerificationCodeSent(false); // 인증 UI 숨기기
        } else {
          setVerificationError(
            data.message || "인증 코드가 올바르지 않습니다."
          );
        }
      },
      onError: (error: Error) => {
        setVerificationError(
          error.message || "알 수 없는 오류가 발생했습니다."
        );
      },
    });

    const checkUsernameMutation = useMutation<
      CheckUsernameResponse,
      Error,
      string
    >({
      mutationFn: userApi.checkUsername,
      onMutate: () => {
        setIsCheckingUsername(true);
        setUsernameAvailable(null);
        setUsernameError("");
        setUsernameSuccessMessage("");
        setUsernameCheckMessage("");
      },
      onSuccess: (response) => {
        setIsCheckingUsername(false);

        // API 응답 구조에 맞게 수정
        const isAvailable = response.data?.available ?? false;
        const responseMessage =
          response.data?.message || response.message || "";

        setUsernameAvailable(isAvailable);
        if (isAvailable) {
          setUsernameSuccessMessage(
            responseMessage || "사용 가능한 사용자 ID입니다."
          );
          setUsernameError("");
        } else {
          setUsernameError(
            responseMessage || "이미 사용 중인 사용자 ID입니다."
          );
          setUsernameSuccessMessage("");
        }
      },
      onError: (error) => {
        setIsCheckingUsername(false);
        setUsernameAvailable(false);
        setUsernameError(
          "사용자 ID 확인 중 오류가 발생했습니다. 다시 시도해주세요."
        );
        setUsernameSuccessMessage("");
      },
    });

    const validatePassword = (password: string) => {
      if (!password) return "비밀번호를 입력해주세요.";

      const criteria = {
        minLength: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        allowedSpecialChar: /[!@#$%^&*()]/.test(password),
        noOtherSpecialChars: /^[a-zA-Z0-9!@#$%^&*()]*$/.test(password),
      };
      setPasswordCriteriaMet(criteria);
      const strengthScore = [
        criteria.minLength,
        criteria.lowercase,
        criteria.number,
        criteria.allowedSpecialChar,
      ].filter(Boolean).length;
      setPasswordStrength(strengthScore);
      return Object.values(criteria).every(Boolean);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPasswordInput(newPassword);
      validatePassword(newPassword);
      if (passwordConfirmInput) {
        setPasswordsMatch(newPassword === passwordConfirmInput);
      }
    };

    const handlePasswordConfirmChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const newConfirmPassword = e.target.value;
      setPasswordConfirmInput(newConfirmPassword);
      setPasswordsMatch(passwordInput === newConfirmPassword);
    };

    const handleUsernameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUsername = e.target.value;
        setUsernameInput(newUsername);
        setUsernameError(validateUsername(newUsername)); // Perform sync validation immediately
        setUsernameAvailable(null); // Reset async validation state
        setUsernameCheckMessage(""); // Clear previous check message
        setUsernameSuccessMessage(""); // Clear success message on change
      },
      []
    );

    const handleUsernameBlur = useCallback(() => {
      const syncError = validateUsername(usernameInput);
      setUsernameError(syncError);
      setUsernameSuccessMessage(""); // Clear success message on blur before new check

      if (!syncError && usernameInput) {
        // Only call API if sync validation passes and input is not empty
        checkUsernameMutation.mutate(usernameInput);
      } else {
        // If there's a sync error or input is empty, reset async state
        setUsernameAvailable(null);
        setUsernameCheckMessage("");
      }
    }, [usernameInput, checkUsernameMutation]);

    const handleEmailChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setEmailError(validateEmail(newEmail));
        setIsEmailVerified(false); // 이메일 변경 시 인증 상태 초기화
      },
      []
    );

    const handleCarNumberChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCarNumber = e.target.value;
        setCarNumber(newCarNumber);
        // Validate as user types, error message will guide them.
        // Blur event will attempt to auto-format.
        setCarNumberError(validateCarNumber(newCarNumber));
      },
      []
    );

    const handleCarNumberBlur = useCallback(() => {
      const trimmedCarNumber = carNumber.trim();
      const carPatternParts = /^(\d{2,3})([가-힣]{1})(\d{4})$/;
      // Attempt to match after removing all spaces for robust formatting
      const carNumberWithoutSpaces = trimmedCarNumber.replace(/\s/g, "");
      const match = carNumberWithoutSpaces.match(carPatternParts);

      if (match) {
        const formattedCarNumber = `${match[1]}${match[2]} ${match[3]}`;
        if (trimmedCarNumber !== formattedCarNumber) {
          // Only update if formatting changes the value
          setCarNumber(formattedCarNumber);
          // Re-validate with the formatted number (should pass if logic is correct)
          setCarNumberError(validateCarNumber(formattedCarNumber));
        }
      } else {
        // If it doesn't match the parts for formatting, ensure current validation state is accurate
        setCarNumberError(validateCarNumber(trimmedCarNumber));
      }
    }, [carNumber, setCarNumber, setCarNumberError]);

    const signupMutation = useMutation({
      mutationFn: (signupData: UserSignupPayload) => userApi.signup(signupData),
      onSuccess: () => {
        toaster.create({
          title: "회원가입 성공",
          description: "회원가입이 성공적으로 완료되었습니다.",
          type: "success",
        });
        onSignupSuccess(usernameInput);
      },
      onError: (error: any) => {
        // 에러 메시지에서 사용자 ID 중복 관련 오류인지 확인
        const errorMessage =
          error.message || "회원가입 중 오류가 발생했습니다.";
        const isDuplicateUsernameError =
          errorMessage.includes("중복된 사용자") ||
          errorMessage.includes("duplicate") ||
          errorMessage.includes("already exists") ||
          errorMessage.includes("already taken") ||
          errorMessage.includes("이미 사용 중인") ||
          error.response?.status === 409; // 충돌 상태코드도 확인

        if (isDuplicateUsernameError) {
          setUsernameAvailable(false);
          setUsernameError("이미 사용 중인 사용자 ID입니다.");
          setUsernameSuccessMessage("");

          toaster.create({
            title: "사용자 ID 중복",
            description:
              "이미 사용 중인 사용자 ID입니다. 다른 ID를 입력해주세요.",
            type: "error",
          });

          // 사용자 ID 입력란에 포커스
          usernameInputRef.current?.focus();
        } else {
          toaster.create({
            title: "회원가입 실패",
            description: errorMessage,
            type: "error",
          });
        }
      },
    });

    const { isPending: mutationIsPending } = signupMutation;
    useEffect(() => {
      if (onSubmittingChange) {
        onSubmittingChange(mutationIsPending);
      }
    }, [mutationIsPending, onSubmittingChange]);

    useEffect(() => {
      if (onEmailVerificationChange) {
        onEmailVerificationChange(isEmailVerified);
      }
    }, [isEmailVerified, onEmailVerificationChange]);

    const performSubmitActions = () => {
      // Validate all fields before submission
      let hasError = false;

      // Username validation (sync + async)
      const currentUsernameError = validateUsername(usernameInput);

      if (currentUsernameError) {
        toaster.create({
          title: "입력 오류",
          description: currentUsernameError,
          type: "error",
        });
        setUsernameError(currentUsernameError);
        setUsernameSuccessMessage("");
        usernameInputRef.current?.focus();
        return;
      } else if (isCheckingUsername) {
        toaster.create({
          title: "확인 중",
          description: "사용자 ID를 확인 중입니다. 잠시 후 다시 시도해주세요.",
          type: "warning",
        });
        return;
      } else if (usernameAvailable === false) {
        const message =
          usernameCheckMessage ||
          usernameError ||
          "사용할 수 없는 사용자 ID입니다.";
        toaster.create({
          title: "사용자 ID 오류",
          description: message,
          type: "error",
        });
        if (!usernameError) setUsernameError(message);
        usernameInputRef.current?.focus();
        return;
      } else if (usernameInput && usernameAvailable === null) {
        const message = "사용자 ID 중복 확인을 진행해주세요.";
        toaster.create({
          title: "확인 필요",
          description: message,
          type: "warning",
        });
        setUsernameError(message);
        usernameInputRef.current?.focus();
        return;
      }

      const currentEmailError = validateEmail(email);
      setEmailError(currentEmailError);
      if (currentEmailError) {
        toaster.create({
          title: "입력 오류",
          description: currentEmailError,
          type: "error",
        });
        emailInputRef.current?.focus();
        hasError = true;
      } else if (!isEmailVerified) {
        toaster.create({
          title: "인증 필요",
          description: "이메일 인증을 완료해주세요.",
          type: "warning",
        });
        emailInputRef.current?.focus();
        hasError = true;
      }

      const currentCarNumberError = validateCarNumber(carNumber);
      setCarNumberError(currentCarNumberError);

      const isPasswordValid = validatePassword(passwordInput);
      const doPasswordsMatch = passwordInput === passwordConfirmInput;
      if (!doPasswordsMatch) {
        setPasswordsMatch(false); // Ensure UI updates if not already
      }

      if (!authKey) {
        toaster.create({
          title: "인증 키 누락",
          description: "본인인증 키가 없어 회원가입을 진행할 수 없습니다.",
          type: "error",
        });
        return;
      }

      if (currentEmailError) {
        toaster.create({
          title: "입력 오류",
          description: currentEmailError,
          type: "error",
        });
        emailInputRef.current?.focus();
        return;
      }

      if (!isEmailVerified) {
        toaster.create({
          title: "이메일 인증 필요",
          description: "이메일 인증을 완료해주세요.",
          type: "error",
        });
        emailInputRef.current?.focus();
        return;
      }

      if (!isPasswordValid || !doPasswordsMatch) {
        toaster.create({
          title: "입력 오류",
          description:
            "비밀번호를 확인해주세요. 모든 복잡도 조건을 만족하고, 비밀번호 확인이 일치해야 합니다.",
          type: "error",
        });
        passwordInputRef.current?.focus();
        return;
      }

      if (currentCarNumberError) {
        toaster.create({
          title: "입력 오류",
          description: currentCarNumberError,
          type: "error",
        });
        carNumberInputRef.current?.focus();
        return;
      }

      const formElement = document.getElementById(
        "signupStep3Form"
      ) as HTMLFormElement;
      if (!formElement) {
        toaster.create({
          title: "오류",
          description: "폼을 찾을 수 없습니다.",
          type: "error",
        });
        return;
      }
      const formData = new FormData(formElement);
      const rawFormData = Object.fromEntries(formData.entries()) as any;

      // Combine address parts
      const combinedAddress = `${postcode || ""} ${address || ""} ${
        addressDetail || ""
      }`.trim();

      const signupPayload: UserSignupPayload = {
        username: usernameInput,
        password: passwordInput,
        name:
          initialAuthData?.utf8Name ||
          initialAuthData?.name ||
          rawFormData.name,
        birthDate: initialAuthData?.birthDate || rawFormData.birthDate, // Will be overridden by NICE data on backend
        gender: formatGender(
          initialAuthData?.gender || rawFormData.genderFromAuth
        ), // Will be overridden by NICE data on backend
        phone: initialAuthData?.mobileNo
          ? formatPhoneNumberWithHyphen(initialAuthData.mobileNo)
          : "", // Format phone number before sending
        email: email,
        carNo: carNumber,
        address: combinedAddress,
        niceResultKey: authKey,
      };
      signupMutation.mutate(signupPayload);
    };

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        performSubmitActions();
      },
    }));

    useEffect(() => {
      if (initialAuthData) {
        if (initialAuthData.mobileNo) {
          setFormattedMobileNo(
            formatPhoneNumberWithHyphen(initialAuthData.mobileNo)
          );
        }
      }
      if (!authKey && currentProgressValue === 3) {
        toaster.create({
          title: "인증 오류",
          description:
            "본인인증 정보가 올바르지 않습니다. 이전 단계로 돌아가 다시 시도해주세요.",
          type: "error",
        });
      }
    }, [initialAuthData, authKey, currentProgressValue]);

    useEffect(() => {
      let intervalId: NodeJS.Timeout;
      if (isTimerRunning && verificationTimer > 0) {
        intervalId = setInterval(() => {
          setVerificationTimer((prev) => prev - 1);
        }, 1000);
      } else if (isTimerRunning && verificationTimer === 0) {
        setIsTimerRunning(false);
        setVerificationError("인증 시간이 만료되었습니다. 다시 시도해주세요.");
        toaster.create({
          title: "시간 만료",
          description:
            "인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.",
          type: "warning",
        });
      }
      return () => clearInterval(intervalId);
    }, [isTimerRunning, verificationTimer]);

    const handleComplete = (data: any) => {
      let fullAddress = data.address;
      let extraAddress = "";
      if (data.addressType === "R") {
        if (data.bname !== "") extraAddress += data.bname;
        if (data.buildingName !== "")
          extraAddress += (extraAddress ? ", " : "") + data.buildingName;
        fullAddress += extraAddress ? ` (${extraAddress})` : "";
      }
      setPostcode(data.zonecode);
      setAddress(fullAddress);
      addressDetailInputRef.current?.focus();
    };

    const handleSearchAddress = () => {
      if (!isScriptLoaded || !window.daum || !window.daum.Postcode) {
        toaster.create({
          title: "오류",
          description: "주소 검색 서비스 로딩 실패. 잠시 후 다시 시도해주세요.",
          type: "error",
        });
        return;
      }
      new window.daum.Postcode({
        oncomplete: handleComplete,
        width: "100%",
        height: "100%",
        maxSuggestItems: 5,
      }).open({});
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      performSubmitActions();
    };

    const handleSendVerificationCode = () => {
      const error = validateEmail(email);
      if (error) {
        setEmailError(error);
        return;
      }
      sendVerificationCodeMutation.mutate(email);
    };

    const handleChangeEmail = () => {
      setEmailInputDisabled(false);
      setIsVerificationCodeSent(false);
      setIsEmailVerified(false);
      setIsTimerRunning(false);
      setVerificationCode("");
      setVerificationError("");
    };

    const handleVerifyCode = () => {
      if (verificationCode.length !== 6) {
        setVerificationError("인증번호 6자리를 입력해주세요.");
        return;
      }
      setVerificationError("");
      verifyCodeMutation.mutate({ email, code: verificationCode });
    };

    const passwordTooltipContent = useMemo(
      () => (
        <VStack align="start" gap={0.5}>
          <PasswordTooltipChecklistItem
            label="8자 이상"
            isMet={passwordCriteriaMet.minLength}
          />
          <PasswordTooltipChecklistItem
            label="영문 소문자 포함"
            isMet={passwordCriteriaMet.lowercase}
          />
          <PasswordTooltipChecklistItem
            label="숫자 포함"
            isMet={passwordCriteriaMet.number}
          />
          <PasswordTooltipChecklistItem
            label="특수문자 (!@#$%^&*()) 포함"
            isMet={passwordCriteriaMet.allowedSpecialChar}
          />
          <PasswordTooltipChecklistItem
            label="다른 종류의 특수문자 사용 불가"
            isMet={passwordCriteriaMet.noOtherSpecialChars}
          />
        </VStack>
      ),
      [passwordCriteriaMet]
    );

    return (
      <>
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="lazyOnload"
          onLoad={() => setIsScriptLoaded(true)}
          onError={(e) => {
            console.error("Daum Postcode script failed to load", e);
            toaster.create({
              title: "주소 검색 로딩 실패",
              description: "페이지를 새로고침하거나 다시 시도해주세요.",
              type: "error",
            });
          }}
        />
        <VStack gap={6} align="stretch" w="full">
          <StepHeader
            title="정보입력"
            currentStep={3}
            totalSteps={mainFlowSteps}
            currentProgressValue={currentProgressValue}
          />
          <Fieldset.Root w="full" maxW="lg" mx="auto">
            <form id="signupStep3Form" onSubmit={handleFormSubmit}>
              <Stack gap={5}>
                <Field.Root id="name">
                  <Field.Label fontWeight="semibold">이름</Field.Label>
                  <Input
                    placeholder="홍길동"
                    name="name"
                    defaultValue={
                      initialAuthData?.utf8Name || initialAuthData?.name || ""
                    }
                    readOnly={
                      !!(initialAuthData?.utf8Name || initialAuthData?.name)
                    }
                  />
                </Field.Root>

                <Field.Root id="birthDate">
                  <Field.Label fontWeight="semibold">생년월일</Field.Label>
                  <Input
                    placeholder="YYYYMMDD"
                    name="birthDate"
                    defaultValue={initialAuthData?.birthDate || ""}
                    readOnly={!!initialAuthData?.birthDate}
                  />
                </Field.Root>

                <Field.Root id="username">
                  <Field.Label fontWeight="semibold">사용자 ID</Field.Label>
                  <Input
                    ref={usernameInputRef}
                    type="text"
                    placeholder="4~16자 영문, 숫자"
                    name="username"
                    value={usernameInput}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    borderColor={
                      usernameAvailable === true
                        ? "green.500"
                        : usernameAvailable === false
                        ? "red.500"
                        : undefined
                    }
                  />
                  {isCheckingUsername && (
                    <HStack fontSize="sm" color="gray.500" mt={1}>
                      <Spinner size="xs" />
                      <Text>중복 확인 중...</Text>
                    </HStack>
                  )}
                  {usernameSuccessMessage && !usernameError && (
                    <HStack fontSize="sm" color="green.500" mt={1}>
                      <CheckCircleIcon size={16} />
                      <Text>{usernameSuccessMessage}</Text>
                    </HStack>
                  )}
                  {usernameError && (
                    <HStack fontSize="sm" color="red.500" mt={1}>
                      <XCircleIcon size={16} />
                      <Text>{usernameError}</Text>
                    </HStack>
                  )}
                </Field.Root>

                <Field.Root id="passwordField">
                  <Field.Label fontWeight="semibold">비밀번호</Field.Label>
                  <Stack flex={1} w="full">
                    <Tooltip
                      content={passwordTooltipContent}
                      open={isPasswordTooltipVisible}
                      positioning={{ placement: "bottom-start" }}
                      contentProps={{
                        bg: "white",
                        color: "gray.800",
                        _dark: {
                          bg: "gray.700",
                          color: "whiteAlpha.900",
                        },
                        mt: 3,
                        p: 6,
                        fontSize: "lg",
                        borderRadius: "md",
                        boxShadow: "md",
                      }}
                    >
                      <PasswordInput
                        ref={passwordInputRef}
                        name="password"
                        value={passwordInput}
                        onChange={handlePasswordChange}
                        onFocus={() => setIsPasswordTooltipVisible(true)}
                        onBlur={() => setIsPasswordTooltipVisible(false)}
                        placeholder="사용하실 비밀번호를 입력해주세요."
                      />
                    </Tooltip>
                    {passwordInput.length > 0 && (
                      <PasswordStrengthMeter
                        value={passwordStrength}
                        flex={1}
                        max={4}
                      />
                    )}
                  </Stack>
                </Field.Root>

                <Field.Root
                  id="passwordConfirmField"
                  invalid={!passwordsMatch && passwordConfirmInput.length > 0}
                >
                  <Field.Label fontWeight="semibold">비밀번호 확인</Field.Label>
                  <Input
                    type="password"
                    name="passwordConfirm"
                    value={passwordConfirmInput}
                    onChange={handlePasswordConfirmChange}
                    placeholder="비밀번호를 한번 더 입력해주세요."
                  />
                  {!passwordsMatch && passwordConfirmInput.length > 0 && (
                    <Field.ErrorText>
                      비밀번호가 일치하지 않습니다.
                    </Field.ErrorText>
                  )}
                </Field.Root>
                <Field.Root
                  id="mobileNoDisplayField"
                  invalid={!initialAuthData?.mobileNo}
                >
                  <Field.Label fontWeight="semibold">휴대폰 번호</Field.Label>

                  <Input
                    type="tel"
                    name="mobileNoDisplay"
                    value={formattedMobileNo}
                    readOnly
                    placeholder="010-xxxx-xxxx"
                    _readOnly={{ bg: "gray.100", cursor: "not-allowed" }}
                  />
                  {initialAuthData?.mobileNo && (
                    <input
                      type="hidden"
                      name="mobileNo"
                      value={initialAuthData.mobileNo}
                    />
                  )}
                </Field.Root>

                <Field.Root id="postcodeField">
                  <Field.Label fontWeight="semibold">우편번호</Field.Label>
                  <HStack gap={2}>
                    <Input
                      placeholder="우편번호"
                      name="postcode"
                      value={postcode}
                      readOnly
                      flex={1}
                    />
                    <Button
                      onClick={handleSearchAddress}
                      bg="#2E3192"
                      color="white"
                      _hover={{ bg: "#1A365D" }}
                      whiteSpace="nowrap"
                      type="button"
                    >
                      주소 검색
                    </Button>
                  </HStack>
                </Field.Root>

                <Field.Root id="addressField">
                  <Field.Label fontWeight="semibold">주소</Field.Label>
                  <Input
                    placeholder="주소검색 버튼을 클릭 후 주소를 입력해주세요."
                    readOnly
                    name="address_main"
                    value={address}
                  />
                </Field.Root>

                <Field.Root id="addressDetailField">
                  <Field.Label fontWeight="semibold">상세주소</Field.Label>
                  <Input
                    ref={addressDetailInputRef}
                    id="addressDetailInput"
                    placeholder="상세 주소를 입력해주세요."
                    name="address_detail"
                    value={addressDetail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddressDetail(e.target.value)
                    }
                  />
                </Field.Root>

                <Field.Root
                  id="email"
                  invalid={!!emailError && !isEmailVerified}
                >
                  <Field.Label fontWeight="semibold">이메일</Field.Label>
                  <HStack>
                    <Input
                      ref={emailInputRef}
                      type="email"
                      placeholder="이메일을 입력해주세요."
                      name="email"
                      value={email}
                      onChange={handleEmailChange}
                      readOnly={emailInputDisabled || isEmailVerified}
                    />
                    {isEmailVerified ? (
                      <HStack>
                        <CheckCircleIcon color="green.500" />
                        <Text
                          fontSize="sm"
                          color="green.500"
                          whiteSpace="nowrap"
                        >
                          인증완료
                        </Text>
                      </HStack>
                    ) : emailInputDisabled ? (
                      <Button
                        onClick={handleChangeEmail}
                        variant="outline"
                        whiteSpace="nowrap"
                      >
                        수정
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSendVerificationCode}
                        loading={sendVerificationCodeMutation.isPending}
                        disabled={!!emailError || email.trim() === ""}
                        whiteSpace="nowrap"
                      >
                        인증번호 발송
                      </Button>
                    )}
                  </HStack>
                  {emailError && !isEmailVerified && (
                    <Field.ErrorText>{emailError}</Field.ErrorText>
                  )}
                </Field.Root>

                {isVerificationCodeSent && !isEmailVerified && (
                  <Field.Root
                    id="emailVerification"
                    invalid={!!verificationError}
                  >
                    <Field.Label hidden>인증번호</Field.Label>
                    <HStack>
                      <Input
                        placeholder="인증번호 6자리"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      {isTimerRunning && (
                        <Text
                          color="blue.500"
                          fontSize="sm"
                          whiteSpace="nowrap"
                        >
                          {String(Math.floor(verificationTimer / 60)).padStart(
                            2,
                            "0"
                          )}
                          :{String(verificationTimer % 60).padStart(2, "0")}
                        </Text>
                      )}
                      <Button
                        onClick={handleVerifyCode}
                        loading={verifyCodeMutation.isPending}
                        disabled={
                          verificationCode.length !== 6 || !isTimerRunning
                        }
                        whiteSpace="nowrap"
                      >
                        확인
                      </Button>
                    </HStack>
                    {verificationError && (
                      <Field.ErrorText>{verificationError}</Field.ErrorText>
                    )}
                  </Field.Root>
                )}

                <Field.Root id="carNumber" invalid={!!carNumberError}>
                  <Field.Label fontWeight="semibold">차량번호</Field.Label>
                  <Input
                    ref={carNumberInputRef}
                    placeholder="차량번호를 입력해주세요 (예: 12가 1234)"
                    name="carNumber"
                    value={carNumber}
                    onChange={handleCarNumberChange}
                    onBlur={handleCarNumberBlur}
                  />
                  {carNumberError && (
                    <Field.ErrorText>{carNumberError}</Field.ErrorText>
                  )}
                </Field.Root>
              </Stack>
            </form>
          </Fieldset.Root>
        </VStack>
      </>
    );
  }
);

Step3UserInfo.displayName = "Step3UserInfo";
