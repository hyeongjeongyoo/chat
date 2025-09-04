"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  VStack,
  HStack,
  Text,
  Container,
  Checkbox,
  Fieldset,
  Field,
  Input,
  RadioGroup,
  Separator,
  Icon,
  Center,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";

import { StepIndicator } from "./components/StepIndicator";
import { AgreementItem } from "./components/AgreementItem";
import { Step1Terms } from "./components/Step1Terms";
import { Step2Identity } from "./components/Step2Identity";
import { Step3UserInfo, Step3UserInfoRef } from "./components/Step3UserInfo";
import { Step4Complete } from "./components/Step4Complete";
import { NicePublicUserDataDto } from "@/lib/api/niceApi";
import { SIGNUP_AGREEMENT_TEMPLATES } from "@/data/agreements";

// Define a type for the data expected from onVerificationSuccess/Fail if not already globally defined
// This should align with the structure passed from Step2Identity
interface NiceVerificationSuccessPayload {
  verificationData: NicePublicUserDataDto;
  verificationKey?: string | null;
  niceServiceType?: string | null;
}

interface NiceVerificationFailPayload {
  error: any;
  verificationKey?: string | null;
}

// For messages from iframe
interface NiceAuthCallbackBaseMessage {
  source: "nice-auth-callback";
  verificationKey: string | null;
}
interface NiceAuthDuplicateUserMessage extends NiceAuthCallbackBaseMessage {
  type: "DUPLICATE_DI";
  username?: string | null;
}
interface NiceAuthSuccessMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_SUCCESS";
  data: NicePublicUserDataDto;
}
interface NiceAuthFailureMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_FAIL";
  error: string;
  errorCode?: string | null;
  errorDetail?: string | null;
}
type NiceAuthCallbackMessage =
  | NiceAuthDuplicateUserMessage
  | NiceAuthSuccessMessage
  | NiceAuthFailureMessage;

const MAIN_FLOW_STEPS = 3; // Steps for the primary signup flow (excluding completion)
const COMPLETION_STEP = 4; // The final "complete" step
const HEADER_HEIGHT = "60px"; // Replace with your actual header height

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [niceAuthData, setNiceAuthData] = useState<any | null>(null);
  const [niceAuthKey, setNiceAuthKey] = useState<string | null>(null);
  const step3FormRef = useRef<Step3UserInfoRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(
    null
  );
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();

  // Define handlers before useEffect that depends on them
  const handleVerificationSuccess = useCallback(
    (result: NiceVerificationSuccessPayload) => {
      setNiceAuthData(result.verificationData);
      setNiceAuthKey(result.verificationKey || null);
    },
    []
  );

  const handleVerificationFail = useCallback(
    (result: NiceVerificationFailPayload) => {
      setNiceAuthData(null);
      setNiceAuthKey(null);
    },
    []
  );

  const handleSignupSuccess = useCallback(
    (username: string) => {
      setRegisteredUsername(username);
      setCurrentStep(COMPLETION_STEP);
      setIsSubmitting(false);
    },
    [setCurrentStep, setIsSubmitting]
  );

  const handleEmailVerificationChange = useCallback((isVerified: boolean) => {
    setIsEmailVerified(isVerified);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check the origin of the message
      if (event.origin !== window.location.origin) {
        console.warn("Message received from untrusted origin:", event.origin);
        return;
      }

      const messageData = event.data as NiceAuthCallbackMessage;

      // Check if the message is from our NICE callback
      if (messageData && messageData.source === "nice-auth-callback") {
        switch (messageData.type) {
          case "DUPLICATE_DI":
            setNiceAuthData(null);
            setNiceAuthKey(null);
            const usernameParam = messageData.username
              ? encodeURIComponent(messageData.username)
              : "";
            router.push(
              `/login?reason=duplicate_di&nice_username=${usernameParam}`
            );
            break;

          case "NICE_AUTH_SUCCESS":
            handleVerificationSuccess({
              verificationData: messageData.data,
              verificationKey: messageData.verificationKey,
            });
            break;

          case "NICE_AUTH_FAIL":
            handleVerificationFail({
              error: messageData.error,
              verificationKey: messageData.verificationKey,
            });
            toaster.create({
              title: "본인인증 실패",
              description:
                messageData.error || "본인인증 과정 중 오류가 발생했습니다.",
              type: "error",
            });
            break;

          default:
            // Exhaustive check, or handle unknown types if necessary
            const exhaustiveCheck: never = messageData;
            console.warn(
              "SignupPage: Received unknown NICE message type:",
              exhaustiveCheck
            );
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener("message", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleVerificationSuccess, handleVerificationFail, router]);

  const [agreements, setAgreements] = useState(() =>
    SIGNUP_AGREEMENT_TEMPLATES.map((template) => ({
      ...template,
      isChecked: false,
    }))
  );
  const [allAgreed, setAllAgreed] = useState(false);

  const handleMasterAgreeChange = (isChecked: boolean) => {
    setAgreements(agreements.map((a) => ({ ...a, isChecked })));
    setAllAgreed(isChecked);
  };

  const handleAgreementChange = (id: string, isChecked: boolean) => {
    const updatedAgreements = agreements.map((a) =>
      a.id === id ? { ...a, isChecked } : a
    );
    setAgreements(updatedAgreements);
    const allCurrentlyChecked = updatedAgreements.every((a) => a.isChecked);
    setAllAgreed(allCurrentlyChecked);
  };

  const isNextButtonDisabled = () => {
    if (currentStep === 1) {
      return !agreements.filter((a) => a.isRequired).every((a) => a.isChecked);
    }
    if (currentStep === 2) {
      return !niceAuthData || !niceAuthKey; // Disable if NICE auth not done
    }
    // For step 3 (MAIN_FLOW_STEPS), primary disable is via isSubmitting, handled directly in button
    // No specific condition here, but isSubmitting will cover it.
    return false; // Default to not disabled for other cases not covered by isSubmitting
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const allRequiredAgreed = agreements
        .filter((a) => a.isRequired)
        .every((a) => a.isChecked);
      if (!allRequiredAgreed) {
        // Consider using a toaster for this notification
        alert("필수 약관에 모두 동의해주세요.");
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      if (!niceAuthData || !niceAuthKey) {
        alert("본인인증을 완료해주세요.");
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === MAIN_FLOW_STEPS) {
      // Trigger form submission in Step3UserInfo
      if (step3FormRef.current) {
        // setIsSubmitting(true); // Removed: will be handled by onSubmittingChange via Step3UserInfo
        step3FormRef.current.submitForm();
      }
    }
  };

  let bottomButtonLabel;
  if (currentStep === 1) bottomButtonLabel = "동의하기";
  if (currentStep === MAIN_FLOW_STEPS) bottomButtonLabel = "회원신청";
  if (currentStep === COMPLETION_STEP) bottomButtonLabel = "";

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      mt={HEADER_HEIGHT}
      minH={`calc(100vh - ${HEADER_HEIGHT})`}
    >
      <Box
        w={{ base: "0", md: "50%" }}
        display={{ base: "none", md: "block" }}
        h={{ base: "auto", md: `calc(100vh - ${HEADER_HEIGHT})` }}
        bgImage="url('/images/signup/signup_bg_image.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        position={{ base: "relative", md: "sticky" }}
        top={HEADER_HEIGHT}
      />

      <Flex
        w={{ base: "100%", md: "50%" }}
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        bg="white"
        pt={{ base: 4, md: 8 }}
        pb={{ base: 8, md: 12 }}
        px={{ base: 4, md: 8 }}
        overflowY="auto"
        h={{ base: "auto", md: "100%" }}
      >
        <Container
          maxW="container.md"
          p={{ base: 6, md: 10 }}
          borderRadius="xl"
          boxShadow={{ base: "none", md: "xl" }}
          w="full"
          my={{ base: 0, md: "auto" }}
        >
          <VStack gap={8} w="full">
            <Box w="full">
              {currentStep === 1 && (
                <Step1Terms
                  onMasterAgree={handleMasterAgreeChange}
                  allAgreed={allAgreed}
                  agreements={agreements}
                  onAgreementChange={handleAgreementChange}
                  mainFlowSteps={MAIN_FLOW_STEPS}
                  currentProgressValue={currentStep}
                />
              )}
              {currentStep === 2 && (
                <Step2Identity
                  mainFlowSteps={MAIN_FLOW_STEPS}
                  currentProgressValue={currentStep}
                  onVerificationSuccess={handleVerificationSuccess}
                  onVerificationFail={handleVerificationFail}
                />
              )}
              {currentStep === MAIN_FLOW_STEPS && (
                <Step3UserInfo
                  ref={step3FormRef}
                  initialAuthData={niceAuthData}
                  authKey={niceAuthKey}
                  onSignupSuccess={handleSignupSuccess}
                  onSubmittingChange={setIsSubmitting}
                  mainFlowSteps={MAIN_FLOW_STEPS}
                  currentProgressValue={currentStep}
                  onEmailVerificationChange={handleEmailVerificationChange}
                />
              )}
              {currentStep === COMPLETION_STEP && (
                <Step4Complete username={registeredUsername} />
              )}
            </Box>

            {currentStep < COMPLETION_STEP && (
              <HStack
                w="full"
                justify={currentStep === 1 ? "flex-end" : "space-between"}
                mt={8}
              >
                {currentStep > 1 && <Box />}
                <Button
                  onClick={handleNext}
                  disabled={isNextButtonDisabled() || isSubmitting}
                  loading={isSubmitting}
                  loadingText="처리중..."
                  colorPalette="blue"
                  bg="#2E3192"
                  color="white"
                  _hover={{ bg: "#1A365D" }}
                  size="lg"
                  minW="120px"
                >
                  {currentStep === MAIN_FLOW_STEPS ? "가입 완료" : "다음"}
                </Button>
              </HStack>
            )}
          </VStack>
        </Container>
      </Flex>
    </Flex>
  );
}
