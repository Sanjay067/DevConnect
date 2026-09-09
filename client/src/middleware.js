import { NextResponse } from "next/server";

const PUBLIC_ASSETS = /\.(png|jpg|jpeg|svg|gif|ico|css|js|woff2?|map|json)$/i;

export const middleware = (request) => {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internal assets
  if (
    PUBLIC_ASSETS.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = request.cookies.get("is_authenticated")?.value === "true";
  const isLoggedIn = Boolean(accessToken || isAuthenticated);

  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPage = pathname === "/";
  const isPrefetch =
    request.headers.get("x-middleware-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";

  // If user is not logged in and tries to access protected pages
  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // If user is logged in, redirect away from auth page to feed (skip prefetch)
  if (isLoggedIn && isAuthPage && !isPrefetch) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Redirect logged-in users from landing page to feed (skip prefetch)
  if (isLoggedIn && isPublicPage && !isPrefetch) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};