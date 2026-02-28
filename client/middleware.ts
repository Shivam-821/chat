import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("chat_token")?.value;
  const path = request.nextUrl.pathname;

  // dont allow a person with token to go to the signin and signup page
  if (token && (path === "/signin" || path === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/signin", "/signup"],
};
