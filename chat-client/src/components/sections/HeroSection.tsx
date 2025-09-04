"use client";

import {
  Box,
  Breadcrumb,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useColors } from "@/styles/theme";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";

export interface SlideContent {
  header?: string;
  title: string;
  subtitle?: string;
  image: string;
  breadcrumbBorderColor?: string;
  breadcrumb?: { label: string; url: string }[];
}

interface HeroSectionProps {
  slideContents: SlideContent[];
}

export function HeroSection({ slideContents }: HeroSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = useColors();
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  const routeMap: { [key: string]: string } = {
    about: "소개",
    companies: "입주 기업",
    contact: "문의하기",
    education: "교육 프로그램",
    news: "소식",
    application: "입주 신청",
  };
  const linkStyles = {
    color: colors.primary.dark,
    transition: "all 0.2s",
    fontSize: "xl",
    fontWeight: "bold",
    position: "relative" as const,
    _after: {
      content: '""',
      position: "absolute" as const,
      bottom: "-2px",
      left: 0,
      width: "100%",
      height: "2px",
      bg: colors.primary.default,
      transform: "scaleX(0)",
      transformOrigin: "right",
      transition: "transform 0.2s ease-in-out",
    },
    _hover: {
      color: colors.primary.default,
      _after: {
        transform: "scaleX(1)",
        transformOrigin: "left",
      },
    },
  };

  const paginate = useCallback(
    (newDirection: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + newDirection;
        if (nextPage < 0) return slideContents.length - 1;
        if (nextPage >= slideContents.length) return 0;
        return nextPage;
      });
    },
    [isAnimating, slideContents.length]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage]);

  useEffect(() => {
    const updateIframeHeight = () => {
      if (iframeRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 16:9 비율에 맞춰 높이 계산
        const calculatedHeight = (containerWidth * 9) / 16;
        iframeRef.current.style.height = `${calculatedHeight}px`;
        containerRef.current.style.height = `${calculatedHeight}px`;
      }
    };

    updateIframeHeight();
    window.addEventListener("resize", updateIframeHeight);

    return () => {
      window.removeEventListener("resize", updateIframeHeight);
    };
  }, []);

  useEffect(() => {
    if (slideContents[currentPage]?.image) {
      const imgEl = new window.Image();
      imgEl.src = slideContents[currentPage].image;
      imgEl.onerror = () => {
        console.error(
          "Failed to load image:",
          slideContents[currentPage].image
        );
      };
    }
  }, [currentPage, slideContents]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStart === null) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragOffset(clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (dragStart === null) return;

    const threshold = 100;
    if (Math.abs(dragOffset) > threshold) {
      paginate(dragOffset > 0 ? -1 : 1);
    }

    setDragStart(null);
    setDragOffset(0);
  };

  const isCmsPreview = !!slideContents[currentPage]?.breadcrumb;
  const cmsBreadcrumbArr = isCmsPreview
    ? [
        ...(slideContents[currentPage]?.breadcrumb || []),
        { label: slideContents[currentPage]?.title, url: undefined },
      ]
    : undefined;
  return (
    <>
      {!!slideContents[0] && (
        <Box
          mt={slideContents.length === 0 ? 0 : { base: "80px", lg: "108px" }}
          bg={colors.bg}
          h={slideContents.length === 0 ? "100%" : "30vh"}
          position="relative"
          overflow="hidden"
        >
          <Container p={0} maxW="100%" h="100%">
            <Box ref={containerRef} position="relative" h="100%">
              <AnimatePresence initial={false} custom={currentPage}>
                <Box
                  ref={slideRef}
                  key={currentPage}
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="100%"
                  style={{
                    transform: `translateX(${dragOffset}px)`,
                    transition:
                      dragStart === null ? "transform 0.3s ease-out" : "none",
                  }}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  <Image
                    src={slideContents[currentPage]?.image || ""}
                    alt={slideContents[currentPage]?.title || ""}
                    fill
                    style={{
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 0,
                    }}
                    sizes="100vw"
                    priority={currentPage === 0}
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    zIndex={1}
                  />
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    zIndex={2}
                    textAlign="center"
                    pointerEvents="none"
                    px={4}
                    pb={slideContents[currentPage]?.header ? "72px" : 0}
                  >
                    {slideContents[currentPage]?.header && (
                      <Text
                        fontSize={{ base: "md", sm: "lg", md: "xl" }}
                        fontWeight="bold"
                        color="white"
                        lineHeight="1.6"
                        whiteSpace="pre-line"
                        textShadow="0 2px 4px rgba(0,0,0,0.3)"
                      >
                        {slideContents[currentPage]?.header}
                      </Text>
                    )}
                    <Heading
                      as="h1"
                      fontSize={
                        slideContents[currentPage]?.header
                          ? { base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }
                          : { base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }
                      }
                      fontWeight="extrabold"
                      mb={slideContents[currentPage]?.header ? 6 : 2}
                      color="white"
                      lineHeight="1.2"
                      textShadow="0 2px 4px rgba(0,0,0,0.3)"
                    >
                      {slideContents[currentPage]?.title}
                    </Heading>
                    {slideContents[currentPage]?.subtitle && (
                      <Text
                        fontSize={{ base: "md", sm: "lg", md: "xl" }}
                        mb={{ base: 8, md: 28 }}
                        fontWeight="bold"
                        color="white"
                        lineHeight="1.6"
                        whiteSpace="pre-line"
                        textShadow="0 2px 4px rgba(0,0,0,0.3)"
                      >
                        {slideContents[currentPage]?.subtitle}
                      </Text>
                    )}
                  </Flex>
                  {slideContents[currentPage]?.header && (
                    <Box
                      position="absolute"
                      left={0}
                      bottom={0}
                      w="100%"
                      display="flex"
                      justifyContent="center"
                      zIndex={3}
                      backgroundColor="white"
                      py={4}
                    >
                      <Breadcrumb.Root
                        px={6}
                        py={3}
                        borderRadius={12}
                        border={`1px solid ${slideContents[currentPage]?.breadcrumbBorderColor}`}
                      >
                        <Breadcrumb.List>
                          {isCmsPreview ? (
                            <>
                              {cmsBreadcrumbArr?.map((item, idx, arr) => {
                                return (
                                  <React.Fragment key={item.url || item.label}>
                                    {idx > 0 && (
                                      <Breadcrumb.Separator>
                                        <Box
                                          as="span"
                                          color="gray.400"
                                          mx={2}
                                          fontSize="sm"
                                          fontWeight="light"
                                        >
                                          /
                                        </Box>
                                      </Breadcrumb.Separator>
                                    )}
                                    <Breadcrumb.Item>
                                      {idx === arr.length - 1 ? (
                                        <Breadcrumb.CurrentLink
                                          color={colors.primary.dark}
                                          fontSize="sm"
                                          fontWeight="bold"
                                        >
                                          {item.label}
                                        </Breadcrumb.CurrentLink>
                                      ) : item.url ? (
                                        <Breadcrumb.Link
                                          as={Link}
                                          href={
                                            item.url !== "/"
                                              ? `${item.url}`
                                              : "/"
                                          }
                                          {...linkStyles}
                                        >
                                          <Text fontSize="sm" fontWeight="bold">
                                            {item.label}
                                          </Text>
                                        </Breadcrumb.Link>
                                      ) : (
                                        <Text fontSize="sm" fontWeight="bold">
                                          {item.label}
                                        </Text>
                                      )}
                                    </Breadcrumb.Item>
                                  </React.Fragment>
                                );
                              })}
                            </>
                          ) : (
                            <>
                              <Breadcrumb.Item>
                                <Breadcrumb.Link
                                  as={Link}
                                  href="/"
                                  {...linkStyles}
                                >
                                  <Text fontSize="sm" fontWeight="bold">
                                    Home
                                  </Text>
                                </Breadcrumb.Link>
                              </Breadcrumb.Item>
                              {paths.map((path, index) => {
                                const isLast = index === paths.length - 1;
                                const href = `/${paths
                                  .slice(0, index + 1)
                                  .join("/")}`;
                                const label = routeMap[path] || path;
                                return (
                                  <React.Fragment key={`separator-${path}`}>
                                    <Breadcrumb.Separator>
                                      <Box
                                        as="span"
                                        color="gray.400"
                                        mx={2}
                                        fontSize="sm"
                                        fontWeight="light"
                                      >
                                        /
                                      </Box>
                                    </Breadcrumb.Separator>
                                    <Breadcrumb.Item>
                                      {isLast ? (
                                        <Breadcrumb.CurrentLink
                                          color={colors.primary.dark}
                                          fontSize="sm"
                                          fontWeight="bold"
                                        >
                                          {label}
                                        </Breadcrumb.CurrentLink>
                                      ) : (
                                        <Breadcrumb.Link
                                          as={Link}
                                          href={href}
                                          {...linkStyles}
                                        >
                                          <Text fontSize="sm" fontWeight="bold">
                                            {label}
                                          </Text>
                                        </Breadcrumb.Link>
                                      )}
                                    </Breadcrumb.Item>
                                  </React.Fragment>
                                );
                              })}
                            </>
                          )}
                        </Breadcrumb.List>
                      </Breadcrumb.Root>
                    </Box>
                  )}
                </Box>
              </AnimatePresence>
            </Box>
          </Container>
        </Box>
      )}
    </>
  );
}
