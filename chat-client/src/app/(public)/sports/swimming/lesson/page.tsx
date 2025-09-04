"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import ContentsHeading from "@/components/layout/ContentsHeading";

import { SwimmingLessonList } from "@/components/swimming/SwimmingLessonList";
import { SwimmingGuide } from "@/components/swimming/SwimmingGuide";

export default function SwimmingLessonPage() {
  return (
    <PageContainer>
      <ContentsHeading title="수영 강습" /> {/* Updated title for clarity */}
      <SwimmingGuide />
      <SwimmingLessonList />
    </PageContainer>
  );
}
