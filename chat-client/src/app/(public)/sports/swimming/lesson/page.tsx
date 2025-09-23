"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import ContentsHeading from "@/components/layout/ContentsHeading";

// import { SwimmingLessonList } from "@/components/swimming/SwimmingLessonList"; // 컴포넌트 누락으로 임시 주석처리
// import { SwimmingGuide } from "@/components/swimming/SwimmingGuide"; // 컴포넌트 누락으로 임시 주석처리

export default function SwimmingLessonPage() {
  return (
    <PageContainer>
      <ContentsHeading title="수영 강습" /> {/* Updated title for clarity */}
    </PageContainer>
  );
}
