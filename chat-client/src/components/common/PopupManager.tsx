"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { popupApi, popupKeys } from "@/lib/api/popup";
import { Popup } from "@/types/api";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { baseInitialConfig } from "@/lib/lexicalConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Icon } from "@chakra-ui/react";
import { XIcon } from "lucide-react";

const MotionBox = motion(Box);

interface PopupItemProps {
  popup: Popup;
}

function PopupItem({ popup }: PopupItemProps) {
  const initialConfig = {
    ...baseInitialConfig,
    namespace: `Popup-${popup.id}`,
    editable: false,
    editorState: popup.content || null,
  };

  return (
    <Box
      style={{
        width: "100%",
        maxWidth: "500px",
        height: "auto",
        minHeight: "520px",
        maxHeight: "60vh",
        margin: "0 auto",
        backgroundColor: "white",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
      }}
    >
      <Box position="relative" p={2} h="100%">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  outline: "none",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "white",
                }}
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <LinkPlugin />
        </LexicalComposer>
      </Box>
    </Box>
  );
}

function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const HIDE_STORAGE_KEY = "popup_hide_until";

export function PopupManager() {
  const [visiblePopups, setVisiblePopups] = useState<Popup[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: popups, isLoading } = useQuery({
    queryKey: popupKeys.lists(),
    queryFn: () => popupApi.getActivePopups(),
    select: (response) => response.data,
  });

  useEffect(() => {
    if (popups) {
      setVisiblePopups(popups);
    } else {
      setVisiblePopups([]);
    }
  }, [popups]);

  useEffect(() => {
    if (visiblePopups.length > 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visiblePopups.length]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCloseAll = () => {
    setVisiblePopups([]);
  };

  const [isHidden, setIsHidden] = useState(false);
  const handleHideForToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem(HIDE_STORAGE_KEY, tomorrow.getTime().toString());
    setIsHidden(true); // Force UI to hide immediately
  };

  const shouldShowPopups = () => {
    if (!isClient || isHidden) return false;
    const hideUntil = localStorage.getItem(HIDE_STORAGE_KEY);
    if (hideUntil && new Date().getTime() < parseInt(hideUntil, 10)) {
      return false;
    }
    return visiblePopups.length > 0;
  };

  if (isLoading || !shouldShowPopups()) {
    return null;
  }

  const popupsCount = visiblePopups.length;
  const useSwiper = popupsCount >= 3;
  const useLoop = popupsCount > 3;

  const getMaxWidth = () => {
    if (useSwiper) return "1200px";
    switch (popupsCount) {
      case 2:
        return "1600px";
      case 1:
        return "600px";
      default:
        return "0px";
    }
  };

  return (
    <AnimatePresence>
      <MotionBox
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.6)"
        zIndex={9999}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="100%"
          maxW={getMaxWidth()}
          align="center"
          justify="center"
        >
          {useSwiper ? (
            <Swiper
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={"auto"}
              loop={useLoop}
              loopAdditionalSlides={1}
              coverflowEffect={{
                rotate: 5,
                stretch: 0,
                depth: 100,
                modifier: 2,
                slideShadows: true,
              }}
              navigation={true}
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Pagination, Navigation]}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              className="popup-swiper"
              style={{ width: "100%", padding: "10px 0" }}
            >
              {visiblePopups.map((popup) => (
                <SwiperSlide key={popup.id} style={{ width: "500px" }}>
                  {({ isActive }) => (
                    <motion.div
                      animate={{
                        opacity: isActive ? 1 : 0.95,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <PopupItem popup={popup} />
                    </motion.div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Flex gap={4} justify="center" align="center">
              {visiblePopups.map((popup) => (
                <PopupItem key={popup.id} popup={popup} />
              ))}
            </Flex>
          )}
        </Flex>

        <Flex
          position="absolute"
          bottom="50px"
          left="50%"
          transform="translateX(-50%)"
          align="center"
          gap={2}
          zIndex={10000}
        >
          <Button
            onClick={handleHideForToday}
            variant="outline"
            colorPalette="gray"
            color="white"
            size="lg"
            opacity={0.7}
            _hover={{ opacity: 1, bg: "transparent" }}
          >
            오늘 하루 보지 않기
          </Button>
          <Button onClick={handleCloseAll} colorPalette="blue" size="lg">
            닫기
          </Button>
        </Flex>
      </MotionBox>
    </AnimatePresence>
  );
}
