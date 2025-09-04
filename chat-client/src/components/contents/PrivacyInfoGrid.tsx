"use client";

import {
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Link,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import NextLink from "next/link";

interface PrivacyInfoCardData {
  title: string;
  icon: IconType;
  items: { icon?: IconType; text: string }[];
  note?: string;
}

interface PrivacyInfoGridProps {
  data: PrivacyInfoCardData[];
}

const HexagonIcon = ({ icon }: { icon: IconType }) => (
  <Flex
    w="80px"
    h="92px"
    alignItems="center"
    justifyContent="center"
    bg="#EEF3FF"
    color="#3B82F6"
    style={{
      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    }}
  >
    <Icon as={icon} w={10} h={10} />
  </Flex>
);

const getAnchorIdByTitle = (title: string) => {
  switch (title) {
    case "일반 개인정보 수집":
    case "개인정보 처리목적":
    case "개인정보의 보유 기간":
      return "section-1";
    case "개인정보의 제공":
      return "section-3";
    case "처리위탁":
      return "section-4";
    case "고충처리부서":
      return "section-9";
    default:
      return "";
  }
};

const PrivacyInfoGrid = ({ data }: PrivacyInfoGridProps) => {
  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 6, md: 8 }}>
        {data.map((card, index) => (
          <Flex
            key={index}
            borderWidth="1px"
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
            direction="column"
            alignItems="center"
            cursor="pointer"
            onClick={() => {
              const anchorId = getAnchorIdByTitle(card.title);
              if (anchorId) {
                window.location.href = `#${anchorId}`;
              }
            }}
          >
            <Heading as="h5" size="md" mb={4} textAlign="center">
              {card.title}
            </Heading>
            <HexagonIcon icon={card.icon} />
            <VStack alignItems="start" gap={2} mt={4} w="full" minH="70px">
              {card.items.map((item, itemIndex) => (
                <HStack key={itemIndex} w="100%">
                  {item.icon ? (
                    <Icon
                      as={item.icon}
                      mr={2}
                      color="primary.500"
                      boxSize={{ base: "14px", md: "16px" }}
                    />
                  ) : (
                    <Text
                      as="span"
                      mr={2}
                      pl={1}
                      color="primary.500"
                      fontSize={{ base: "14px", md: "md" }}
                    >
                      •
                    </Text>
                  )}
                  <Text textAlign="left" fontSize={{ base: "14px", md: "md" }}>
                    {item.text}
                  </Text>
                </HStack>
              ))}
            </VStack>
            {card.note && (
              <Text
                mt="auto"
                pt={4}
                fontSize="sm"
                color="gray.500"
                alignSelf="stretch"
                textAlign="center"
              >
                {card.note}
              </Text>
            )}
          </Flex>
        ))}
      </SimpleGrid>
      <Text mt={{ base: 6, md: 10 }} textAlign="justify" fontSize="sm">
        ※ 기호를 클릭하시면 세부 사항을 확인할 수 있으며, 자세한
        내용은 아래의 개인정보 처리방침을 확인하시기 바랍니다.
      </Text>
    </>
  );
};

export default PrivacyInfoGrid;
