"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  NativeSelect,
  Flex,
  For,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import {
  DownloadIcon,
  UsersIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ListChecksIcon,
  BriefcaseIcon,
  CreditCardIcon,
  UserPlusIcon,
} from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { StatisticDisplayCard } from "./statistics/StatisticDisplayCard";
import dayjs from "dayjs";

interface MonthlyStatsDto {
  year: number;
  month: number;
  revenue: number;
  enrollments: number;
  lockerUsageCount: number;
  totalLockers?: number;
  refundAmount: number;
  newUserCount: number;
  renewalUserCount: number;
}

interface AggregatedStats {
  totalRevenue: number;
  totalEnrollments: number;
  averageLockerUsagePercentage?: number;
  totalRefundAmount: number;
  totalNewUsers: number;
  totalRenewalUsers: number;
  renewalRate?: number;
  periodLabel: string;
}

const statisticsQueryKeys = {
  all: (year: string, month: string) =>
    ["adminStatistics", year, month] as const,
};

const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return "-";
  return (
    new Intl.NumberFormat("ko-KR", {
      notation: "compact",
      compactDisplay: "short",
    }).format(amount) + "원"
  );
};

const formatNumber = (num: number | undefined) => {
  if (num === undefined) return "-";
  return new Intl.NumberFormat("ko-KR").format(num);
};

export const StatisticsTab: React.FC = () => {
  const colors = useColors();
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState(dayjs().year().toString());
  const [selectedMonth, setSelectedMonth] = useState("all");

  const years = useMemo(() => {
    const currentYear = dayjs().year();
    return [
      currentYear.toString(),
      (currentYear - 1).toString(),
      (currentYear - 2).toString(),
    ];
  }, []);

  const months = [
    { value: "all", label: "전체" },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString().padStart(2, "0"),
      label: `${i + 1}월`,
    })),
  ];

  const {
    data: apiStats,
    isLoading,
    error,
  } = useQuery<MonthlyStatsDto[], Error, AggregatedStats>({
    queryKey: statisticsQueryKeys.all(selectedYear, selectedMonth),
    queryFn: async () => {
      const params: any = { year: parseInt(selectedYear) };
      if (selectedMonth !== "all") {
        params.month = parseInt(selectedMonth);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockData: MonthlyStatsDto[] = [
        {
          year: 2024,
          month: 1,
          revenue: 15400000,
          enrollments: 240,
          lockerUsageCount: 85,
          totalLockers: 150,
          refundAmount: 1200000,
          newUserCount: 150,
          renewalUserCount: 90,
        },
        {
          year: 2024,
          month: 2,
          revenue: 14800000,
          enrollments: 230,
          lockerUsageCount: 82,
          totalLockers: 150,
          refundAmount: 800000,
          newUserCount: 140,
          renewalUserCount: 90,
        },
        {
          year: 2023,
          month: 12,
          revenue: 16200000,
          enrollments: 260,
          lockerUsageCount: 88,
          totalLockers: 160,
          refundAmount: 1500000,
          newUserCount: 165,
          renewalUserCount: 95,
        },
      ];
      let filteredMock = mockData.filter(
        (d) => d.year.toString() === selectedYear
      );
      if (selectedMonth !== "all") {
        filteredMock = filteredMock.filter(
          (d) => d.month.toString().padStart(2, "0") === selectedMonth
        );
      }
      return filteredMock;
    },
    select: (data: MonthlyStatsDto[]): AggregatedStats => {
      const totals = data.reduce(
        (acc, stat) => ({
          revenue: acc.revenue + stat.revenue,
          enrollments: acc.enrollments + stat.enrollments,
          lockerUsageCount: acc.lockerUsageCount + (stat.lockerUsageCount || 0),
          totalLockers: acc.totalLockers + (stat.totalLockers || 0),
          refundAmount: acc.refundAmount + stat.refundAmount,
          newUserCount: acc.newUserCount + stat.newUserCount,
          renewalUserCount: acc.renewalUserCount + stat.renewalUserCount,
        }),
        {
          revenue: 0,
          enrollments: 0,
          lockerUsageCount: 0,
          totalLockers: 0,
          refundAmount: 0,
          newUserCount: 0,
          renewalUserCount: 0,
        }
      );

      const periodLabel =
        selectedMonth === "all"
          ? `${selectedYear}년 전체`
          : `${selectedYear}년 ${selectedMonth}월`;
      const avgLockerUsagePercentage =
        totals.totalLockers > 0 && totals.lockerUsageCount > 0
          ? (totals.lockerUsageCount / totals.totalLockers) * 100
          : undefined;
      const renewalRate =
        totals.newUserCount + totals.renewalUserCount > 0
          ? (totals.renewalUserCount /
              (totals.newUserCount + totals.renewalUserCount)) *
            100
          : undefined;

      return {
        totalRevenue: totals.revenue,
        totalEnrollments: totals.enrollments,
        averageLockerUsagePercentage: avgLockerUsagePercentage,
        totalRefundAmount: totals.refundAmount,
        totalNewUsers: totals.newUserCount,
        totalRenewalUsers: totals.renewalUserCount,
        renewalRate: renewalRate,
        periodLabel: periodLabel,
      };
    },
  });

  const handleExportData = () => {
    toaster.info({
      title: "엑셀 다운로드 준비 중... (구현 필요)",
    });
  };

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Flex gap={3} mb={4} align="center" wrap="wrap">
        <NativeSelect.Root size="sm" maxW="100px">
          <NativeSelect.Field
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <For each={years}>
              {(year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              )}
            </For>
          </NativeSelect.Field>
        </NativeSelect.Root>
        <NativeSelect.Root size="sm" maxW="100px">
          <NativeSelect.Field
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <For each={months}>
              {(month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              )}
            </For>
          </NativeSelect.Field>
        </NativeSelect.Root>
        <Button size="xs" variant="outline" onClick={handleExportData}>
          <DownloadIcon size={12} />
          엑셀 다운로드
        </Button>
      </Flex>

      {isLoading && (
        <Flex justify="center" align="center" flex={1}>
          <Spinner size="xl" />
        </Flex>
      )}

      {error && (
        <Flex direction="column" justify="center" align="center" flex={1}>
          <Text color="red.500" mb={2}>
            통계 데이터 로딩 실패: {error.message}
          </Text>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: statisticsQueryKeys.all(selectedYear, selectedMonth),
              })
            }
          >
            재시도
          </Button>
        </Flex>
      )}

      {apiStats && !isLoading && !error && (
        <Box flex={1} overflowY="auto">
          <Heading size="md" mb={2}>
            {apiStats.periodLabel} 주요 지표
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} mb={6}>
            <StatisticDisplayCard
              label="총 매출"
              value={formatCurrency(apiStats.totalRevenue)}
              icon={DollarSignIcon}
              iconContainerBgColor="blue.50"
              iconProps={{ color: colors.primary.default, size: 20 }}
              valueColor={colors.primary.default}
            />
            <StatisticDisplayCard
              label="총 신청자 수"
              value={formatNumber(apiStats.totalEnrollments)}
              unit="명"
              icon={ListChecksIcon}
              iconContainerBgColor="blue.50"
              iconProps={{ color: "blue.800", size: 20 }}
              valueColor="blue.600"
            />
            <StatisticDisplayCard
              label="신규 회원"
              value={formatNumber(apiStats.totalNewUsers)}
              unit="명"
              icon={UserPlusIcon}
              iconContainerBgColor="green.50"
              iconProps={{ color: "green.600", size: 20 }}
              valueColor="green.600"
            />
            <StatisticDisplayCard
              label="재등록 회원"
              value={formatNumber(apiStats.totalRenewalUsers)}
              unit="명"
              icon={UsersIcon}
              iconContainerBgColor="teal.50"
              iconProps={{ color: "teal.600", size: 20 }}
              valueColor="teal.600"
            />
            <StatisticDisplayCard
              label="재등록율"
              value={
                apiStats.renewalRate !== undefined
                  ? apiStats.renewalRate.toFixed(1)
                  : "-"
              }
              unit="%"
              icon={TrendingUpIcon}
              iconContainerBgColor="orange.50"
              iconProps={{ color: "orange.600", size: 20 }}
              valueColor="orange.600"
            />
            <StatisticDisplayCard
              label="사물함 사용률"
              value={
                apiStats.averageLockerUsagePercentage !== undefined
                  ? apiStats.averageLockerUsagePercentage.toFixed(1)
                  : "-"
              }
              unit="%"
              icon={BriefcaseIcon}
              iconContainerBgColor="purple.50"
              iconProps={{ color: "purple.600", size: 20 }}
              valueColor="purple.600"
            />
            <StatisticDisplayCard
              label="총 환불액"
              value={formatCurrency(apiStats.totalRefundAmount)}
              icon={CreditCardIcon}
              iconContainerBgColor="red.50"
              iconProps={{ color: "red.600", size: 20 }}
              valueColor="red.600"
            />
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};
