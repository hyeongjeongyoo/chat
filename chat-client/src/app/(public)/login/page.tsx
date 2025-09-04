"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  VStack,
  HStack,
  Fieldset,
  Text,
} from "@chakra-ui/react";
import { Field as CustomField } from "@/components/ui/field";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import { useRecoilValue } from "recoil";
import { authState, useAuthActions } from "@/stores/auth";
import { LoginCredentials } from "@/types/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, isAuthenticated } = useRecoilValue(authState);
  const { login } = useAuthActions();

  const [username, setUsername] = useState(""); // email -> username
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: "", // email -> username
    password: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {
      username: username ? "" : "아이디를 입력해주세요", // email -> username, 메시지 수정
      password: password ? "" : "비밀번호를 입력해주세요",
      general: "",
    };

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password; // email -> username
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({ ...errors, general: "" });

    login({ username, password }, false)
      .then(() => {
        toaster.create({
          title: "로그인 성공",
          description: "기존 페이지로 이동합니다.",
          type: "success",
          duration: 3000,
        });
        // Redirect logic is handled in useAuthActions, but we can have a fallback here
        const returnUrl = searchParams.get("returnUrl") || "/";
        router.push(returnUrl);
      })
      .catch((error) => {
        // Error is already displayed by the hook, but we can set local state if needed
        const errorMessage =
          error?.response?.data?.message ||
          "로그인에 실패했습니다. 아이디나 비밀번호를 확인해주세요.";
        setErrors({ username: "", password: "", general: errorMessage });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Handle notification from URL parameters
  useEffect(() => {
    const reason = searchParams.get("reason");
    const niceUsername = searchParams.get("nice_username");

    if (reason === "duplicate_di") {
      const message = niceUsername
        ? `이미 가입된 계정입니다 (ID: ${decodeURIComponent(
            niceUsername
          )}). 로그인해 주세요.`
        : "이미 가입된 계정입니다. 로그인해 주세요.";

      queueMicrotask(() => {
        toaster.create({
          title: "계정 중복 안내",
          description: message,
          type: "info",
          duration: 7000,
        });
      });
    }
  }, [searchParams]);

  // Check if the form is in loading state
  const isLoading = isSubmitting || authLoading;

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      py={{ base: "12", md: "0" }}
      px={{ base: "4", sm: "8" }}
    >
      <VStack gap={{ base: "6", md: "8" }} align="center" w="full" maxW="md">
        <VStack gap="6">
          <Image
            src="/images/logo/login_logo.png"
            alt="logo"
            width={52}
            height={74}
          />
          <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
            로그인이 필요한 서비스입니다
          </Heading>
        </VStack>
        <Box w="full">
          <form onSubmit={handleSubmit}>
            <Fieldset.Root>
              <VStack gap="5">
                <CustomField
                  id="username-field"
                  w="full"
                  errorText={errors.username}
                >
                  <Input
                    id="username"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    size="lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </CustomField>

                <CustomField
                  id="password-field"
                  w="full"
                  errorText={errors.password}
                >
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    size="lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </CustomField>
              </VStack>

              {errors.general && (
                <Text color="red.500" mt="3" fontSize="sm">
                  {errors.general}
                </Text>
              )}

              <VStack gap="6" mt="8">
                <Button
                  type="submit"
                  bg="#2E3192"
                  color="white"
                  _hover={{ bg: "#1A365D" }}
                  size="lg"
                  fontSize="md"
                  w="full"
                  disabled={isLoading}
                  loadingText="로그인 중..."
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
                <HStack gap="3" justify="center" fontSize="sm" w="full">
                  <Button
                    variant="outline"
                    size="md"
                    flex={1}
                    borderColor="#2E3192"
                    color="#2E3192"
                    fontWeight="normal"
                    onClick={() => {
                      router.push("/signup");
                    }}
                    disabled={isLoading}
                  >
                    회원가입
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    flex={1}
                    borderColor="#2E3192"
                    color="#2E3192"
                    fontWeight="normal"
                    onClick={() => {
                      router.push("/find-credentials/id");
                    }}
                    disabled={isLoading}
                  >
                    아이디 찾기
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    flex={1}
                    borderColor="#2E3192"
                    color="#2E3192"
                    fontWeight="normal"
                    onClick={() => {
                      router.push("/find-credentials/password");
                    }}
                    disabled={isLoading}
                  >
                    비밀번호 찾기
                  </Button>
                </HStack>
              </VStack>
            </Fieldset.Root>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
}
