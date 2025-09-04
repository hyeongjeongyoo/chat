"use client";

import { Grid, GridItem, Text } from "@chakra-ui/react";
import React from "react";

const PrivacyOfficerTable = () => {
  const headers = ["구분", "직책/부서명", "성명", "연락처"];
  const officerData = {
    title: "개인정보 보호책임자",
    rows: [
      {
        position: "경영지원실장",
        name: "김재정",
        contact: "051-810-1240\n012djm@bmc.busan.kr",
      },
    ],
  };

  const departmentData = {
    title: "개인정보보호 담당부서",
    rows: [
      {
        position: "경영지원실",
        name: "안쾌현",
        contact: "051-810-1297\nrkskwk@bmc.busan.kr",
      },
    ],
  };

  const Cell = ({
    children,
    isHeader = false,
  }: {
    children: React.ReactNode;
    isHeader?: boolean;
  }) => (
    <GridItem
      py={3}
      px={2}
      bg={isHeader ? "gray.50" : "white"}
      fontWeight={isHeader ? "bold" : "normal"}
      borderBottom="1px solid"
      borderColor="gray.200"
      borderRight="1px solid"
      borderRightColor="gray.200"
      display="flex"
      alignItems="center"
      justifyContent="center"
      whiteSpace="pre-wrap"
    >
      {children}
    </GridItem>
  );

  return (
    <Grid
      templateColumns="repeat(4, 1fr)"
      border="1px solid"
      borderColor="gray.200"
      borderTop="3px solid"
      borderTopColor="blue.500"
      mt={4}
      fontSize={{ base: "14px", md: "md" }}
      textAlign="center"
    >
      {headers.map((header) => (
        <Cell key={header} isHeader>
          {header}
        </Cell>
      ))}

      {/* 개인정보 보호책임자 */}
      <GridItem
        p={4}
        rowSpan={officerData.rows.length}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        {officerData.title}
      </GridItem>
      {officerData.rows.map((row, index) => (
        <React.Fragment key={`officer-row-${index}`}>
          <Cell>{row.position}</Cell>
          <Cell>{row.name}</Cell>
          <Cell>{row.contact}</Cell>
        </React.Fragment>
      ))}

      {/* 개인정보보호 담당부서 */}
      <GridItem
        p={4}
        rowSpan={departmentData.rows.length}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        {departmentData.title}
      </GridItem>
      {departmentData.rows.map((row, index) => (
        <React.Fragment key={`dept-row-${index}`}>
          <Cell>{row.position}</Cell>
          <Cell>{row.name}</Cell>
          <Cell>{row.contact}</Cell>
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default PrivacyOfficerTable;
 