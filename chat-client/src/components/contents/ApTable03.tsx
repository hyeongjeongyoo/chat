"use client";

import { Box, Table, VisuallyHidden } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TableColumn {
  header?: string;
  content?: string | ReactNode;
  rowSpan?: number;
  colSpan?: number;
  width?: string;
  style?: React.CSSProperties;
}

interface TableRow {
  columns: TableColumn[];
  style?: React.CSSProperties;
  isHeader?: boolean;
}

interface ApTable03Props {
  rows: TableRow[];
  tableStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
  className?: string;
  visuallyHiddenText?: string;
}

export default function ApTable03({
  rows,
  tableStyle,
  headerStyle,
  cellStyle,
  className,
  visuallyHiddenText,
}: ApTable03Props) {
  const headerRows = rows.filter((row) => row.isHeader);
  const bodyRows = rows.filter((row) => !row.isHeader);

  return (
    <Box className="ap-table-box">
      {visuallyHiddenText && (
        <VisuallyHidden>{visuallyHiddenText}</VisuallyHidden>
      )}
      <Table.Root
        className={className}
        style={{
          border: "none",
          borderTop: "2px solid #101010",
          ...tableStyle,
        }}
      >
        <Table.Header>
          {headerRows.map((row, rowIndex) => (
            <Table.Row key={`header-row-${rowIndex}`} style={row.style}>
              {row.columns.map((column, colIndex) => (
                <Table.ColumnHeader
                  key={`header-cell-${rowIndex}-${colIndex}`}
                  rowSpan={column.rowSpan}
                  colSpan={column.colSpan}
                  scope="col"
                  width={column.width}
                  py={5}
                  px={1}
                  color={"#333"}
                  fontSize={{ base: "sm", md: "lg", lg: "xl" }}
                  fontWeight={"regular"}
                  style={{
                    border: "none",
                    borderLeft: "1px solid #d9e1e2",
                    borderBottom: "1px solid #d9e1e2",
                    background: "#e9f2f3",
                    textAlign: "center",
                    ...headerStyle,
                    ...column.style,
                  }}
                >
                  {column.header}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {bodyRows.map((row, rowIndex) => (
            <Table.Row key={`body-row-${rowIndex}`} style={row.style}>
              {row.columns.map((column, colIndex) => (
                <Table.Cell
                  key={`body-cell-${rowIndex}-${colIndex}`}
                  rowSpan={column.rowSpan}
                  colSpan={column.colSpan}
                  py={5}
                  px={1}
                  color={"#555"}
                  fontSize={{ base: "sm", md: "lg", lg: "xl" }}
                  fontWeight={"light"}
                  style={{
                    border: "none",
                    borderBottom: "1px solid #d2d2d2",
                    textAlign: "center",
                    ...cellStyle,
                    ...column.style,
                  }}
                >
                  {typeof column.content === "string" ? (
                    <div dangerouslySetInnerHTML={{ __html: column.content }} />
                  ) : (
                    column.content
                  )}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
