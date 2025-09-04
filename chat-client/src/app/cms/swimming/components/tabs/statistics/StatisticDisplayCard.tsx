"use client";

import React from "react";
import { Box, Text, Flex, Card, Icon } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

interface StatisticDisplayCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType; // Accepts any component, e.g., Lucide icon components
  iconProps?: React.SVGProps<SVGSVGElement> & { size?: number | string }; // For passing size, color to icon
  iconContainerBgColor?: string;
  valueColor?: string;
  unit?: string;
}

export const StatisticDisplayCard: React.FC<StatisticDisplayCardProps> = ({
  label,
  value,
  icon: IconComponent,
  iconProps = { size: 18 }, // Default size for the icon
  iconContainerBgColor = "gray.100",
  valueColor,
  unit = "",
}) => {
  const colors = useColors();
  const finalValueColor = valueColor || colors.text.primary;
  const iconColorToUse = iconProps?.color || colors.text.primary;
  const iconSize = iconProps?.size || 18;

  return (
    <Card.Root size="sm" flex={1}>
      <Card.Body p={1}>
        <Flex align="center" gap={3}>
          {IconComponent && (
            <Box p={2} borderRadius="md" bg={iconContainerBgColor}>
              <Icon
                as={IconComponent}
                color={iconColorToUse}
                boxSize={`${iconSize}px`}
              />
            </Box>
          )}
          <Box>
            <Text fontSize="xs" color={colors.text.secondary}>
              {label}
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={finalValueColor}>
              {value}
              {unit && (
                <Text as="span" fontSize="md" ml={1}>
                  {unit}
                </Text>
              )}
            </Text>
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};
