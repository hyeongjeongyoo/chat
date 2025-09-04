"use client";

import {
  Box,
  chakra,
  Collapsible,
  Heading,
  Mark,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState, ReactNode } from "react";

// Collapsible 항목 컴포넌트
interface CollapsibleItemProps {
  itemKey: string;
  number: string;
  title: string;
  content: ReactNode;
  openItemKey: string | null;
  onOpenChange: (itemKey: string) => (details: { open: boolean }) => void;
}

const CollapsibleItem = ({
  itemKey,
  number,
  title,
  content,
  openItemKey,
  onOpenChange,
}: CollapsibleItemProps) => {
  const isOpen = openItemKey === itemKey;
  // 반응형 폰트사이즈
  const numberSize = useBreakpointValue({ base: "lg", md: "2xl", lg: "4xl" });
  const titleSize = useBreakpointValue({ base: "lg", md: "xl", lg: "2xl" });

  return (
    <Collapsible.Root
      borderBottom="1px solid #9E9C9C"
      open={isOpen}
      onOpenChange={onOpenChange(itemKey)}
    >
      <Collapsible.Trigger w="100%" textAlign="left">
        <Text
          display="flex"
          alignItems="center"
          gap={{ base: "20px", md: "40px", lg: "100px" }}
          w="100%"
          maxW="1400px"
          margin="0 auto"
          py={{ base: 3, md: 4, lg: 5 }}
          color="#393939"
          fontSize={titleSize}
          fontWeight="medium"
        >
          <Mark color="#EFEFF1" fontSize={numberSize} fontWeight="extrabold">
            {number}
          </Mark>
          {title}
          <chakra.svg
            xmlns="http://www.w3.org/2000/svg"
            width={{ base: "16px", md: "24px", lg: "32px" }}
            height={{ base: "16px", md: "24px", lg: "32px" }}
            viewBox="0 0 80 81"
            fill="none"
            ml="auto"
            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
            transition="transform 0.3s ease, fill 0.3s ease"
            color={isOpen ? "#FAB20B" : "#2E3192"}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.332 30.4993L39.9987 57.166L66.6654 30.4993L59.9987 23.8327L39.9987 43.8327L19.9987 23.8327L13.332 30.4993Z"
              fill="currentColor"
            />
          </chakra.svg>
        </Text>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box
          w="100%"
          maxW="1400px"
          margin="0 auto"
          py={{ base: 2, md: 3, lg: 7 }}
          pl={{ base: "0", md: "40px", lg: "60px" }}
        >
          <Box
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            alignItems={{ base: "center", md: "flex-start" }}
            gap={{ base: 4, md: 6, lg: 8 }}
          >
            {content}
          </Box>
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

// 리스트 아이템 인터페이스
export interface ListItem {
  title: string;
  content: ReactNode;
  id?: string;
  number?: string;
}

// ListStyle01 컴포넌트 props 인터페이스
export interface ListStyle01Props {
  title: string;
  items: ListItem[];
}

// 스타일이 적용된 텍스트 컴포넌트
export const StyledText = ({ children }: { children: ReactNode }) => {
  const textSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });
  return (
    <Text color="#393939" fontSize={textSize} flex="1" textAlign="justify">
      {children}
    </Text>
  );
};

function ListStyle01({ title, items }: ListStyle01Props) {
  // 현재 열린 항목의 키를 저장하는 상태
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);

  // onOpenChange 핸들러 함수 - 한 번에 하나의 항목만 열리도록 수정
  const handleOpenChange =
    (itemKey: string) => (details: { open: boolean }) => {
      if (details.open) {
        // 항목이 열리면 해당 항목의 키를 저장
        setOpenItemKey(itemKey);
      } else {
        // 항목이 닫히면 열린 항목 키를 null로 설정
        setOpenItemKey(null);
      }
    };

  // 반응형 타이틀 폰트사이즈
  const headingSize = useBreakpointValue({ base: "2xl", md: "3xl", lg: "5xl" });

  return (
    <Box
      className="room-info-box"
      mt={{ base: "80px", md: "120px", lg: "180px" }}
    >
      <Heading
        as="h4"
        mb={{ base: "30px", md: "40px", lg: "60px" }}
        color="#393939"
        fontSize={headingSize}
        fontWeight="bold"
        lineHeight="1"
      >
        {title}
      </Heading>
      <Box className="facility-info-list" borderTop="1px solid #393939">
        {items.map((item, index) => (
          <CollapsibleItem
            key={`item${index + 1}`}
            itemKey={`item${index + 1}`}
            number={`${index + 1}`}
            title={item.title}
            content={item.content}
            openItemKey={openItemKey}
            onOpenChange={handleOpenChange}
          />
        ))}
      </Box>
    </Box>
  );
}

// StyledText 컴포넌트를 ListStyle01의 정적 속성으로 추가
ListStyle01.StyledText = StyledText;

export default ListStyle01;
