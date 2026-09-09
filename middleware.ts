import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("canetrace_session")?.value;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/admin/login");

  // Public form routes: /form, /f/[slug], public APIs, pincode lookup
  const isPublicRoute =
    pathname === "/form" ||
    pathname.startsWith("/f/") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/location/") ||
    pathname.startsWith("/api/auth/");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/farmers") ||
    pathname.startsWith("/cultivations") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/forms") ||
    pathname.startsWith("/form-builder") ||
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
    "/admin/:path*",
    "/dashboard/:path*",
    "/farmers/:path*",
    "/cultivations/:path*",
    "/reports/:path*",
    "/forms/:path*",
    "/form-builder/:path*",
    "/settings/:path*",
  ],
};

