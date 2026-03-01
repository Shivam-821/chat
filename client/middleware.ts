import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("chat_token")?.value;
  const path = request.nextUrl.pathname;

  if (token && (path === "/signin" || path === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token) {
    const allowedPaths = ["/", "/chat", "/signin", "/signup"];
    if (!allowedPaths.includes(path)) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
