"use client";

import { CCTVGridSection } from "@/app/cms/dashboard/components/CCTVSection";
import { EquipmentSection } from "@/app/cms/dashboard/components/EquipmentSection";
import { MonitoringSection } from "@/app/cms/dashboard/components/MonitoringSection";
import { StatisticsSection } from "@/app/cms/dashboard/components/StatisticsSection";
import { GridSection } from "@/components/ui/grid-section";

import { Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";

export default function DashboardPage() {
  const colors = useColors();

  // 홈페이지 스타일에 맞는 색상 적용
  const bg = useColorModeValue(colors.bg, colors.darkBg);

  const dashboardLayout = [
    {
      id: "monitoring",
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      title: "LED 상태 모니터링",
      subtitle: "실시간 LED 상태 정보",
    },
    {
      id: "cctv",
      x: 6,
      y: 0,
      w: 6,
      h: 4,
      title: "CCTV 모니터링",
      subtitle: "실시간 현장 영상",
      headerRight: (
        <Text fontSize="xs" color={colors.text.secondary}>
          Camera #1
        </Text>
      ),
    },
    {
      id: "equipment",
      x: 0,
      y: 4,
      w: 6,
      h: 4,
      title: "장비 상태",
      subtitle: "실시간 장비 상태 정보",
    },
    {
      id: "statistics",
      x: 6,
      y: 4,
      w: 6,
      h: 4,
      title: "시간별 통계",
      subtitle: "24시간 동안의 데이터 분포",
    },
  ];

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <GridSection initialLayout={dashboardLayout}>
        <MonitoringSection />
        <CCTVGridSection />
        <EquipmentSection />
        <StatisticsSection />
      </GridSection>
    </Box>
  );
}
