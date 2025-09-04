"use client";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { LessonManager } from "./components/LessonManager";

export default function SwimmingAdminPage() {
  return (
    <>
      <LessonManager />
      <Toaster />
    </>
  );
}
