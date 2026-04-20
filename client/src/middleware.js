import React from 'react'
import { NextResponse } from "next/server";

export const middleware = (request) => {
    const accessToken = request.cookies.get("accessToken")?.value;

    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith("/auth");

    if (!accessToken && !isAuthPage) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (accessToken && isAuthPage) {
        return NextResponse.redirect(new URL("/feed", request.url));
    }

    return NextResponse.next();

}


export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};