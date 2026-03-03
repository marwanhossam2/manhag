import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    if (
      request.nextUrl.pathname.startsWith("/student") ||
      request.nextUrl.pathname.startsWith("/teacher")
    ) {
      return NextResponse.redirect(new URL("/api/auth/signin", request.url));
    }
  }

  if (token) {
    if (request.nextUrl.pathname.startsWith("/student") && token.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/teacher") && token.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*"],
};
