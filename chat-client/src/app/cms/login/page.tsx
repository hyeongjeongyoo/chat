"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  Checkbox,
  Center,
} from "@chakra-ui/react";
import { LuEye, LuEyeOff, LuCheck } from "react-icons/lu";
import { useRecoilValue } from "recoil";
import { authState, useAuthActions } from "@/stores/auth";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { useColors } from "@/styles/theme";
import { Button } from "@/components/ui/button";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { Logo } from "@/components/ui/logo";

function LoginForm() {
  const { isAuthenticated, isLoading, user } = useRecoilValue(authState);
  const { login, logout } = useAuthActions();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const colors = useColors();
  const inputBg = useColorModeValue("white", "whiteAlpha.50");
  const inputBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputText = useColorModeValue("gray.800", "whiteAlpha.900");
  const inputPlaceholder = useColorModeValue("gray.400", "whiteAlpha.400");
  const inputHover = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("gray.900", "white");

  // Check if user has admin role
  const hasAdminRole =
    user && (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN");

  useEffect(() => {
    // Only redirect if authenticated and has admin role
    if (isAuthenticated && hasAdminRole) {
      router.push("/cms/menu");
    }
  }, [isAuthenticated, hasAdminRole, router]);

  useEffect(() => {
    const rememberedId = localStorage.getItem("rememberedId");
    if (rememberedId) {
      setUsername(rememberedId);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username) {
      newErrors.username = "Please enter your username";
    }

    if (!password) {
      newErrors.password = "Please enter your password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: any = {};
    if (!username) validationErrors.username = "아이디를 입력해주세요";
    if (!password) validationErrors.password = "비밀번호를 입력해주세요";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Attempt login
    login({ username, password }, true).catch(() => {
      // 에러는 useAuthActions 내에서 토스터로 처리되므로 여기서는 추가 작업이 필요 없습니다.
      // 필요하다면 추가적인 클라이언트 사이드 로직을 여기에 구현할 수 있습니다.
    });
  };

  if (isLoading) {
    return (
      <Center h="100vh" bg={pageBg}>
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Center>
    );
  }

  return (
    <Flex
      minH="100vh"
      direction="column"
      align="center"
      justify="center"
      bg={pageBg}
      p={4}
    >
      <Container maxW="lg" px={{ base: "4", sm: "8" }}>
        <Flex direction="column" gap={3} align="center">
          <Logo size="xl" isLogin />
          <Flex
            direction="column"
            gap={1}
            textAlign="center"
            transition="all 0.5s ease-in-out"
          >
            <Heading
              size="lg"
              fontWeight="bold"
              letterSpacing="tight"
              color={headingColor}
            >
              Welcome Back
            </Heading>
            <Text
              fontSize="md"
              color={colors.text.secondary}
              fontWeight="medium"
              letterSpacing="wide"
            >
              Sign in to your admin account
            </Text>
          </Flex>
          <Box
            w="full"
            maxW="md"
            py={{ base: "8", sm: "10" }}
            px={{ base: "6", sm: "10" }}
            bg={colors.cardBg}
            boxShadow={colors.shadow.md}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={colors.border}
          >
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap={6}>
                <Flex direction="column" gap={5}>
                  <Field
                    label={
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        letterSpacing="wide"
                      >
                        Username
                      </Text>
                    }
                    errorText={errors.username}
                  >
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      bg={inputBg}
                      borderColor={inputBorder}
                      color={inputText}
                      fontSize="md"
                      h="12"
                      _placeholder={{ color: inputPlaceholder }}
                      _hover={{ borderColor: inputBorder, bg: inputHover }}
                      _focus={{
                        borderColor: colors.primary.alpha,
                        boxShadow: `0 0 0 1px ${colors.primary.alpha}`,
                      }}
                    />
                  </Field>
                  <Field
                    label={
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        letterSpacing="wide"
                      >
                        Password
                      </Text>
                    }
                    errorText={errors.password}
                  >
                    <InputGroup
                      w="full"
                      endElementProps={{
                        paddingInline: 0,
                      }}
                      endElement={
                        <Button
                          variant="ghost"
                          color={inputText}
                          borderLeftRadius="0"
                          h="12"
                          _hover={{ bgColor: inputHover }}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword(!showPassword)}
                          size="sm"
                        >
                          {showPassword ? <LuEyeOff /> : <LuEye />}
                        </Button>
                      }
                    >
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg={inputBg}
                        borderColor={inputBorder}
                        color={inputText}
                        fontSize="md"
                        h="12"
                        _placeholder={{ color: inputPlaceholder }}
                        _hover={{ borderColor: inputBorder, bg: inputHover }}
                        _focus={{
                          borderColor: colors.primary.alpha,
                          boxShadow: `0 0 0 1px ${colors.primary.alpha}`,
                        }}
                      />
                    </InputGroup>
                  </Field>
                </Flex>
                <Checkbox.Root
                  checked={rememberMe}
                  onCheckedChange={(e) => setRememberMe(!!e.checked)}
                  colorPalette="blue"
                  size="md"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    borderColor={inputBorder}
                    bg={inputBg}
                    // _hover={{
                    //   bg: inputHover,
                    // }}
                    _checked={{
                      borderColor: "transparent",
                      bgGradient: colors.gradient.primary,
                      color: "white",
                      _hover: {
                        opacity: 0.8,
                      },
                    }}
                  >
                    <Checkbox.Indicator>
                      <LuCheck />
                    </Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>
                    <Text
                      fontSize="sm"
                      color={colors.text.secondary}
                      fontWeight="medium"
                      letterSpacing="wide"
                    >
                      Remember me
                    </Text>
                  </Checkbox.Label>
                </Checkbox.Root>
                <Button
                  type="submit"
                  colorPalette="blue"
                  size="lg"
                  fontSize="md"
                  fontWeight="semibold"
                  h="12"
                  bgGradient={colors.gradient.primary}
                  color="white"
                  letterSpacing="wide"
                  _hover={{
                    bgGradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    boxShadow: colors.shadow.md,
                  }}
                >
                  Sign In
                </Button>
                <Button
                  type="submit"
                  colorPalette="blue"
                  variant="outline"
                  size="lg"
                  fontSize="md"
                  fontWeight="semibold"
                  h="12"
                  bgGradient={colors.gradient.primary}
                  color="white"
                  letterSpacing="wide"
                  onClick={() => router.push("/")}
                >
                  Home
                </Button>
              </Flex>
            </form>
          </Box>
        </Flex>
      </Container>
    </Flex>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
