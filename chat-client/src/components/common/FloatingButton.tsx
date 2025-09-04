"use client";

import { IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useColors } from "@/styles/theme";
import { FaArrowUp } from "react-icons/fa";

export function FloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const colors = useColors();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <IconButton
      aria-label="Scroll to top"
      onClick={scrollToTop}
      position="fixed"
      bottom={8}
      right={8}
      size="lg"
      colorPalette="blue"
      bg={colors.bg}
      color={colors.text.primary}
      borderRadius="full"
      boxShadow="lg"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "xl",
        transition: "all 0.2s",
      }}
    >
      <FaArrowUp />
    </IconButton>
  );
}
