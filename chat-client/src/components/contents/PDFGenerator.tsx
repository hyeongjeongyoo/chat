"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Box, Button } from "@chakra-ui/react";

interface PDFGeneratorProps {
  children: React.ReactNode;
  filename?: string;
}

// PDF 생성 함수를 외부에서 사용할 수 있도록 export
export const generatePDFFromElement = async (
  element: HTMLElement,
  filename: string = "견적서.pdf"
) => {
  try {
    // HTML을 캔버스로 변환
    const canvas = await html2canvas(element, {
      scale: 2, // 고해상도
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: element.scrollWidth,
      height: element.scrollHeight,
      logging: false, // 로그 비활성화
    });

    // 캔버스를 이미지로 변환
    const imgData = canvas.toDataURL("image/png");

    // PDF 생성
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 너비 (mm)
    const pageHeight = 295; // A4 높이 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // 첫 페이지 추가
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 여러 페이지가 필요한 경우 추가 페이지 생성
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // PDF 다운로드
    pdf.save(filename);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    alert("PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};

export default function PDFGenerator({
  children,
  filename = "견적서.pdf",
}: PDFGeneratorProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    try {
      if (!contentRef.current) return;
      await generatePDFFromElement(contentRef.current, filename);
    } catch (error) {
      console.error("PDF 생성 중 오류 발생:", error);
      alert("PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <div
        ref={contentRef}
        style={{ backgroundColor: "white", padding: "20px" }}
      >
        {children}
      </div>
      <Box mt={4} textAlign="center">
        <Button
          onClick={generatePDF}
          bg="#2E3192"
          color="white"
          fontWeight="bold"
          px={6}
          py={3}
          borderRadius="md"
          _hover={{ bg: "#1B2066" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ marginRight: "8px" }}
          >
            <path
              d="M13 8V2H3V18H13V12H17V8H13ZM11 16H5V4H11V8H15V16H11Z"
              fill="currentColor"
            />
          </svg>
          PDF 다운로드
        </Button>
      </Box>
    </div>
  );
}
 