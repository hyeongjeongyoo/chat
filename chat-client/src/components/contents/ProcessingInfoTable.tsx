"use client";

import {
  Box,
  Text,
  Grid,
  GridItem,
  useBreakpointValue,
} from "@chakra-ui/react";

interface ProcessingInfoTableProps {
  title: string;
  headers: string[];
  data: (string | null)[][];
}

const ProcessingInfoTable = ({
  title,
  headers,
  data,
}: ProcessingInfoTableProps) => {
  const numColumns = headers.length;
  let templateColumns: string;
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (numColumns === 5) {
    templateColumns = "3fr 4fr 3fr 3fr 2fr"; // 예시 비율
  } else if (numColumns === 4) {
    templateColumns = "2fr 5fr 5fr 2fr"; // 예시 비율
  } else {
    templateColumns = `repeat(${numColumns}, 1fr)`;
  }

  return (
    <Box>
      <Text mb={4} fontSize={{ base: "14px", xl: "18px" }}>
        {title}
      </Text>
      <Grid
        templateColumns={templateColumns}
        border="1px solid"
        borderColor="gray.200"
        borderTop="3px solid"
        borderTopColor="blue.500"
        tableLayout={isMobile ? "auto" : "fixed"}
      >
        {headers.map((header, index) => (
          <GridItem
            key={index}
            textAlign="center"
            py={3}
            bg="gray.50"
            fontWeight="bold"
            borderBottom="1px solid"
            borderColor="gray.200"
            borderRight={index < numColumns - 1 ? "1px solid" : "none"}
            borderRightColor="gray.200"
            fontSize={{ base: "14px", md: "md" }}
          >
            {header}
          </GridItem>
        ))}
        {data.map((row, rowIndex) =>
          row.map((cell, cellIndex) => {
            if (cell === null) {
              return null;
            }

            let rowSpan = 1;
            for (let i = rowIndex + 1; i < data.length; i++) {
              if (data[i][cellIndex] === null) {
                rowSpan++;
              } else {
                break;
              }
            }

            return (
              <GridItem
                key={`${rowIndex}-${cellIndex}`}
                rowSpan={rowSpan}
                colStart={cellIndex + 1}
                textAlign="center"
                py={4}
                borderBottom="1px solid"
                borderColor="gray.200"
                borderRight={cellIndex < numColumns - 1 ? "1px solid" : "none"}
                borderRightColor="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
                whiteSpace="pre-line"
                fontSize={{ base: "14px", md: "md" }}
              >
                {cell}
              </GridItem>
            );
          })
        )}
      </Grid>
    </Box>
  );
};

export default ProcessingInfoTable;
