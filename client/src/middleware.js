import { NextResponse } from "next/server";

const PUBLIC_ASSETS = /\.(png|jpg|jpeg|svg|gif|ico|css|js|woff2?|map|json)$/i;

export const middleware = (request) => {
    const accessToken = request.cookies.get("accessToken")?.value;
    const isAuthenticated = request.cookies.get("is_authenticated")?.value === "true";
    const isLoggedIn = accessToken || isAuthenticated;

    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith("/auth");
    const isPublicPage = pathname === "/";
    const isPublicAsset = PUBLIC_ASSETS.test(pathname);

    if (isPublicAsset) {
        return NextResponse.next();
    }

    if (!isLoggedIn && !isAuthPage && !isPublicPage) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/feed", request.url));
    }

    // Redirect logged-in users from the landing page to the feed
    if (isLoggedIn && isPublicPage) {
        return NextResponse.redirect(new URL("/feed", request.url));
    }

    return NextResponse.next();

}


export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};