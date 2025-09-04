"use client";

import { Menu } from "@/types/api";
import { memo, ReactNode } from "react";
import Layout from "./Layout";
import MainContentArea from "./MainContentArea";

interface MainProps {
  menus: Menu[];
  isPreview?: boolean;
  children: ReactNode;
  currentPage: string;
}

export const Main = memo(
  ({ menus, isPreview = false, children, currentPage }: MainProps) => {
    return (
      <Layout currentPage={currentPage} isPreview={isPreview} menus={menus}>
        <MainContentArea>{children}</MainContentArea>
      </Layout>
    );
  }
);

Main.displayName = "Main";
export default Main;
