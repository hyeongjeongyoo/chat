import Router from "next/router";
import { toaster } from "@/components/ui/toaster";

interface ApiError extends Error {
  status?: number;
  isNoDataAuthError?: boolean; // Custom flag for "no data but treat as auth error"
}

/**
 * A Higher-Order Function that wraps an API call function to provide
 * global error handling for authentication failures, redirecting to /login.
 *
 * @param apiCall The API function to wrap. This function should throw an error
 *                with a 'status' property (e.g., 401) for auth failures.
 * @returns A new function that, when called, executes the apiCall and handles errors.
 */
export function withAuthRedirect<T extends (...args: any[]) => Promise<any>>(
  apiCall: T
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
  return async (
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>> | null> => {
    try {
      // The wrapped apiCall is responsible for its own logic, including throwing
      // a custom ApiError with status 401 if a 200 OK response means "no data for auth".
      return await apiCall(...args);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("[withAuthRedirect] API Error caught:", apiError);

      if (apiError.status === 401) {
        let description = "로그인이 필요합니다. 로그인 페이지로 이동합니다.";
        if (apiError.isNoDataAuthError) {
          description =
            "사용자 정보를 확인할 수 없습니다. 로그인 페이지로 이동합니다.";
        }

        toaster.create({
          title: "인증 오류",
          description: description,
          type: "warning",
          duration: 3000, // Reduced duration slightly for faster UX
        });

        // Capture the current path to redirect back after login
        const currentPath = Router.asPath; // asPath includes query parameters
        const loginUrl = `/login?redirectUrl=${encodeURIComponent(
          currentPath
        )}`;

        try {
          // It's important that Router.push completes before null is returned,
          // but in practice, the redirect will take over.
          await Router.push(loginUrl);
        } catch (redirectError) {
          console.error(
            "[withAuthRedirect] Error during Router.push:",
            redirectError
          );
          // Fallback to simple /login if constructing redirectUrl fails for some reason
          // though encodeURIComponent should make it safe.
          try {
            await Router.push("/login");
          } catch (fallbackRedirectError) {
            console.error(
              "[withAuthRedirect] Error during fallback Router.push to /login:",
              fallbackRedirectError
            );
          }
        }
        return null; // Prevent further execution of the original call context
      }

      // For other errors, re-throw them so they can be handled locally if needed
      // Optional: Generic toaster for other non-auth errors
      // toaster.create({
      //   title: "요청 실패",
      //   description: apiError.message || "알 수 없는 오류가 발생했습니다.",
      //   type: "error",
      // });
      throw apiError;
    }
  };
}
