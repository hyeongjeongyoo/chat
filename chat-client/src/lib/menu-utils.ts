import { Menu } from "@/types/api";
import { publicApi } from "./api/client"; // Assuming publicApi is correctly exported and configured

// 가정: API 응답 구조 인터페이스
interface PublicMenusApiResponse {
  data: Menu[];
  status: number; // 혹은 API 응답에 따라 다른 필드들
  message?: string;
}

/**
 * Finds a menu item by its URL path, prioritizing non-FOLDER types.
 * This is a server-side utility.
 *
 * @param pathname The URL path to search for (e.g., "/reference/press").
 * @returns The matched non-FOLDER Menu object or null if not found.
 */
export async function findMenuByPath(pathname: string): Promise<Menu | null> {
  try {
    const apiResponse = await publicApi.get<PublicMenusApiResponse>(
      "/cms/menu/public"
    );
    const allMenus: Menu[] = apiResponse.data.data;

    if (!allMenus || allMenus.length === 0) {
      console.warn("[findMenuByPath] No menus fetched or menu list is empty.");
      return null;
    }

    const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const pathWithoutSlash = pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

    // 1. Exact match for non-FOLDER types
    const exactNonFolderMatch = allMenus.find((menu) => {
      if (menu.type === "FOLDER") return false; // Explicitly skip FOLDER types
      const menuUrl = menu.url?.trim();
      return (
        menuUrl === pathname ||
        menuUrl === normalizedPath ||
        menuUrl === pathWithoutSlash
      );
    });

    if (exactNonFolderMatch) {
      return exactNonFolderMatch;
    }

    // 2. If no exact non-FOLDER match, try partial match for non-FOLDER types
    // Filter out FOLDER types first
    const nonFolderMenus = allMenus.filter((menu) => menu.type !== "FOLDER");

    const partialMatches = nonFolderMenus.filter((menu) => {
      const menuUrl = menu.url?.trim();
      if (!menuUrl) return false;
      // Ensure menuUrl is a base path.
      return (
        pathname.startsWith(menuUrl) &&
        (pathname === menuUrl ||
          pathname.startsWith(`${menuUrl}/`) ||
          menuUrl.endsWith("/"))
      );
    });

    if (partialMatches.length > 0) {
      // Sort by URL length descending to get the most specific match
      partialMatches.sort(
        (a, b) => (b.url?.trim().length || 0) - (a.url?.trim().length || 0)
      );
      const bestPartialMatch = partialMatches[0];
      return bestPartialMatch;
    }

    // Fallback: If only a FOLDER matched exactly (and was skipped), log that.
    const exactFolderMatch = allMenus.find((menu) => {
      if (menu.type !== "FOLDER") return false;
      const menuUrl = menu.url?.trim();
      return (
        menuUrl === pathname ||
        menuUrl === normalizedPath ||
        menuUrl === pathWithoutSlash
      );
    });
    if (exactFolderMatch) {
      console.warn(
        `[findMenuByPath] Only an exact FOLDER match was found for ${pathname} and subsequently ignored:`,
        exactFolderMatch
      );
    }

    console.warn(
      `[findMenuByPath] No suitable non-FOLDER menu found for path: ${pathname}`
    );
    return null;
  } catch (error) {
    console.error(
      `[findMenuByPath] Error fetching or processing menus for path ${pathname}:`,
      error
    );
    return null;
  }
}
