"use client";

import { useEstimateContext } from "@/contexts/EstimateContext";
import { EstimateService } from "@/types/estimate";
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Check } from "lucide-react";
import React from "react";

export const ServiceSelectionStep = ({
  handleNext,
}: {
  handleNext: () => void;
}) => {
  const { selectedServices, toggleService } = useEstimateContext();

  const services: {
    id: EstimateService;
    name: string;
    description: string;
    imageUrl: string;
  }[] = [
    {
      id: "seminar",
      name: "세미나실 이용",
      description: "워크샵, 회의 등을 위한 공간을 예약합니다.",
      imageUrl: "/images/meeting/sub_visual.png",
    },
    {
      id: "room",
      name: "객실 이용",
      description: "편안한 숙박을 위한 객실을 예약합니다.",
      imageUrl: "/images/contents/twin_img01.jpg",
    },
  ];

  return (
    <Box>
      <VStack mb={10} gap={2}>
        <Heading size="xl" as="h2">
          어떤 서비스를 이용하시겠어요?
        </Heading>
        <Text fontSize="lg" color="gray.600">
          원하는 서비스를 선택하세요. (중복 선택 가능)
        </Text>
      </VStack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={8}>
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          return (
            <Box
              key={service.id}
              p={0}
              borderWidth="2px"
              borderRadius="lg"
              borderColor={isSelected ? "#2E3192" : "gray.200"}
              onClick={() => toggleService(service.id)}
              position="relative"
              transition="all 0.2s"
              overflow="hidden"
              cursor="pointer"
              _hover={{
                borderColor: isSelected ? "#2E3192" : "gray.300",
                transform: "translateY(-4px)",
                shadow: "lg",
              }}
            >
              <Image
                src={service.imageUrl}
                alt={service.name}
                width="100%"
                height="200px"
                objectFit="cover"
              />
              <HStack justify="space-between" p={6}>
                <Box>
                  <Heading size="md" mb={1}>
                    {service.name}
                  </Heading>
                  <Text color="gray.600">{service.description}</Text>
                </Box>
                <Box>
                  {isSelected && (
                    <Check
                      size={32}
                      color="white"
                      style={{
                        backgroundColor: "#2E3192",
                        borderRadius: "50%",
                        padding: "4px",
                      }}
                    />
                  )}
                </Box>
              </HStack>
            </Box>
          );
        })}
      </SimpleGrid>
      <Button
        w="full"
        size="lg"
        variant="subtle"
        colorPalette="blue"
        onClick={handleNext}
        disabled={selectedServices.length === 0}
      >
        다음
      </Button>
    </Box>
  );
};
