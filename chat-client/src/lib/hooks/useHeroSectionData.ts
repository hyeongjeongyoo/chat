import { usePathname } from "next/navigation";
import { heroSectionData } from "@/lib/constants/heroSectionData";
import { useState, useEffect } from "react";

function getBasePath(currentPath: string): string {
  // 더 이상 경로를 자르지 않고 현재 경로를 그대로 사용
  return currentPath;
}

export function useHeroSectionData(boardUrl?: string) {
  const pathname = usePathname();
  const [data, setData] = useState(() => {
    const originalPath = boardUrl || pathname;
    const keyPath = getBasePath(originalPath);

    return heroSectionData[keyPath];
  });

  useEffect(() => {
    const originalPath = boardUrl || pathname;
    const keyPath = getBasePath(originalPath);

    const newData = heroSectionData[keyPath];

    setData(newData);
  }, [boardUrl, pathname]);

  return data;
}
