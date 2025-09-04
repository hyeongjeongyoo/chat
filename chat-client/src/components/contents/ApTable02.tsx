"use client";

import { Box, Table, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TableColumn {
  header: string;
  content: string | ReactNode | null;
  rowSpan?: number;
}

interface TableRow {
  columns: TableColumn[];
}

interface ApTable02Props {
  rows: TableRow[];
}

export default function ApTable02({ rows }: ApTable02Props) {
  // 반응형 폰트 크기 설정
  const headerFontSize = useBreakpointValue({
    base: "md", // sm 이하: 2단계 줄임 (3xl -> xl)
    md: "xl", // sm: 1단계 줄임 (3xl -> 2xl)
    lg: "3xl", // lg: 원래 크기 (3xl)
  });

  const bodyFontSize = useBreakpointValue({
    base: "sm", // sm 이하: 2단계 줄임 (2xl -> lg)
    md: "lg", // sm: 1단계 줄임 (2xl -> xl)
    lg: "2xl", // lg: 원래 크기 (2xl)
  });

  return (
    <Box className="ap-table-box">
      <Table.Root borderRadius="20px" overflow="hidden">
        <Table.Header>
          <Table.Row
            backgroundColor="#F7F8FB"
            fontSize={headerFontSize}
            fontWeight="semibold"
          >
            {rows[0]?.columns.map((column, index) => (
              <Table.ColumnHeader
                key={`header-${index}`}
                borderBottom="0"
                py={{ base: 2, md: 4, lg: 7 }}
                textAlign="center"
              >
                {column.header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, rowIndex) => (
            <Table.Row
              key={`row-${rowIndex}`}
              fontSize={bodyFontSize}
              fontWeight="medium"
            >
              {row.columns.map((column, colIndex) => {
                if (column.content === null) {
                  return null;
                }
                return (
                  <Table.Cell
                    key={`cell-${rowIndex}-${colIndex}`}
                    borderBottom="0"
                    py={{ base: 1, md: 3, lg: 5 }}
                    textAlign="center"
                    rowSpan={column.rowSpan}
                    verticalAlign="middle"
                  >
                    {column.content}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
