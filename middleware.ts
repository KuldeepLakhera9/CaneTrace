import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("canetrace_session")?.value;

  const isAuthRoute = pathname.startsWith("/login");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/farmers") ||
    pathname.startsWith("/cultivations") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  // If user has no session and tries to access a protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already authenticated and visits /login
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/farmers/:path*",
    "/cultivations/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
