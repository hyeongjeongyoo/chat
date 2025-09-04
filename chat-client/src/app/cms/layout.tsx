"use client";

import React from "react";
import { CMSLayoutClient } from "./CMSLayoutClient";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <CMSLayoutClient>{children}</CMSLayoutClient>;
}
