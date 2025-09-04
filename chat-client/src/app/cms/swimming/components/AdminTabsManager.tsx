"use client";

import React from "react";
import { Box, Heading, Tabs } from "@chakra-ui/react";
import { EnrollmentManagementTab } from "./tabs/EnrollmentManagementTab";
import { CancellationRefundTab } from "./tabs/CancellationRefundTab";
import { PaymentHistoryTab } from "./tabs/PaymentHistoryTab";

interface AdminTabsManagerProps {
  activeLessonId?: number | null;
  selectedYear: string;
  selectedMonth: string;
}

export function AdminTabsManager({
  activeLessonId,
  selectedYear,
  selectedMonth,
}: AdminTabsManagerProps) {
  return (
    <Box position="relative" h="full" display="flex" flexDirection="column">
      <Tabs.Root defaultValue="enrollments" h="full">
        <Box
          position="sticky"
          top="-15px"
          bg="white"
          zIndex="sticky"
          borderBottom="1px"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.700" }}
        >
          <Tabs.List>
            <Tabs.Trigger value="enrollments">
              <Heading size="sm">신청자 관리</Heading>
            </Tabs.Trigger>
            <Tabs.Trigger value="cancellations">
              <Heading size="sm">취소/환불 관리</Heading>
            </Tabs.Trigger>
            <Tabs.Trigger value="payments">
              <Heading size="sm">결제 내역 관리</Heading>
            </Tabs.Trigger>
          </Tabs.List>
        </Box>

        <Box flex="1" overflow="auto">
          <Tabs.Content value="enrollments">
            <EnrollmentManagementTab
              lessonIdFilter={activeLessonId}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </Tabs.Content>
          <Tabs.Content value="cancellations">
            <CancellationRefundTab
              lessonIdFilter={activeLessonId}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </Tabs.Content>
          <Tabs.Content value="payments">
            <PaymentHistoryTab
              lessonIdFilter={activeLessonId}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}
