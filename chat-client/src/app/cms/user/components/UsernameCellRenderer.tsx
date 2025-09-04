"use client";

import React from "react";
import NextLink from "next/link";
import { ICellRendererParams } from "ag-grid-community";
import { Box, HStack, IconButton, Text, Link } from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import { UserEnrollmentHistoryDto } from "@/types/api";

interface UsernameCellRendererParams
  extends ICellRendererParams<UserEnrollmentHistoryDto> {
  onUsernameClick: (user: UserEnrollmentHistoryDto) => void;
}

export const UsernameCellRenderer = (params: UsernameCellRendererParams) => {
  const { data, onUsernameClick } = params;

  if (!data) {
    return null;
  }

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUsernameClick(data);
  };

  return (
    <HStack
      w="full"
      h="full"
      justify="space-between"
      align="center"
      gap={0.5}
      cursor="pointer"
      _hover={{ textDecoration: "underline", color: "blue.500" }}
      onClick={handleUsernameClick}
    >
      <Text fontWeight="medium">{data.username}</Text>
      <ExternalLink size={14} />
    </HStack>
  );
};
