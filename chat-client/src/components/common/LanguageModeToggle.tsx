"use client";

import { Button, Box, HStack } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { useEffect, useState, useRef } from "react";
import { parseCookies, setCookie } from "nookies";

declare global {
  namespace globalThis {
    var __GOOGLE_TRANSLATION_CONFIG__: {
      languages: { name: string; title: string }[];
      defaultLanguage: string;
    };
  }
}

const COOKIE_NAME = "googtrans";

export function LanguageModeToggle() {
  const colors = useColors();
  const [currentLanguage, setCurrentLanguage] = useState("ko");
  const [isTranslating, setIsTranslating] = useState(false);
  const targetLangRef = useRef<string | null>(null);

  useEffect(() => {
    const cookies = parseCookies();
    const langCookie = cookies[COOKIE_NAME];
    if (langCookie) {
      const lang = langCookie.split("/")[2];
      setCurrentLanguage(lang);
    } else {
      setCurrentLanguage(
        global.__GOOGLE_TRANSLATION_CONFIG__?.defaultLanguage || "ko"
      );
    }
  }, []);

  useEffect(() => {
    if (!isTranslating) return;

    const newLang = targetLangRef.current;
    if (!newLang) {
      setIsTranslating(false);
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.body.classList.contains(`translated-${newLang}`)) {
        setCurrentLanguage(newLang);
        setIsTranslating(false);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const fallback = setTimeout(() => {
      setIsTranslating(false);
    }, 3000);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, [isTranslating]);

  const toggleLanguage = () => {
    if (isTranslating) return;

    const newLang = currentLanguage === "ko" ? "en" : "ko";
    targetLangRef.current = newLang;
    setIsTranslating(true);

    setCookie(null, COOKIE_NAME, `/auto/${newLang}`);

    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = newLang;
      select.dispatchEvent(new Event("change"));
    } else {
      // Fallback if the select element is not found
      window.location.reload();
    }
  };

  const buttonText = currentLanguage === "ko" ? "EN" : "KO";

  return (
    <Button
      variant="ghost"
      bg={colors.cardBg}
      borderWidth={1}
      borderColor={colors.border}
      borderRadius="full"
      aria-label="Language Toggle"
      color={colors.text.primary}
      boxShadow={colors.shadow.lg}
      transition="all 0.3s ease-in-out"
      onClick={toggleLanguage}
      p={0}
      loading={isTranslating}
    >
      <HStack>
        <Box as="span">{buttonText}</Box>
      </HStack>
    </Button>
  );
}
