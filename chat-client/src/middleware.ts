import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_KEY } from "@/lib/auth-utils";

export const config = {
  matcher: ["/cms/:path*"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;

  // 로그인 페이지는 인증 체크를 하지 않음
  if (pathname === "/cms/login") {
    // 토큰이 있는 상태에서 로그인 페이지 접근 시 메뉴 페이지로 리다이렉트
    if (token) {
      return NextResponse.redirect(new URL("/cms/menu", request.url));
    }
    return NextResponse.next();
  }

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    const url = new URL("/cms/login", request.url);
    // 원래 가려던 경로를 쿼리 파라미터로 추가
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
