"use client";

import { Box, Table } from "@chakra-ui/react";

interface TableRow {
  header: string;
  content: string | React.ReactNode;
}

interface ApTable01Props {
  rows: TableRow[];
}

export default function ApTable01({ rows }: ApTable01Props) {
  return (
    <Box className="ap-table-box">
      <Table.Root className="ap-table01" borderTop="2px solid #05140E">
        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row key={index}>
              <Table.ColumnHeader
                py={5}
                color="#2E3192"
                fontSize={{ base: "md", md: "lg", lg: "xl" }}
                fontWeight="bold"
              >
                {row.header}
              </Table.ColumnHeader>
              <Table.Cell
                py={5}
                color="#4B4B4B"
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                fontWeight="medium"
              >
                {row.content}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
