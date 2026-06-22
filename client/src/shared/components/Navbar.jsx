"use client";

import React from "react";
import Link from "next/link";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter } from "next/navigation";

function Navbar() {
    const logoutMutation = useLogout();
    const router = useRouter();

    const logoutHandler = () => {
        logoutMutation.mutate(null, {
            onSuccess: () => router.push("/")
        })
    }
    return (
        <div
            className="sticky top-0 z-50 mb-5 rounded-2xl border px-3 py-2 shadow-sm sm:px-4 md:px-6"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
            <div className="flex w-full items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">

                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <Link href="/feed">
                        <div className="flex items-center gap-2">
                            <i
                                className="fa-regular fa-compass"
                                style={{ color: "var(--accent)" }}
                            ></i>
                            <h2 className="text-lg font-semibold sm:text-xl">DevConnect</h2>
                        </div>
                    </Link>

                    {/* Search */}
                    <div className="relative flex items-center">
                        <i
                            className="fa-solid fa-search pointer-events-none absolute left-2 text-sm"
                            style={{ color: "var(--text-muted)" }}
                        ></i>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="h-9 w-[52vw] rounded-xl border py-2 pr-3 pl-9 text-sm outline-none transition-all sm:w-44 md:w-56"
                            style={{
                                background: "var(--surface-soft)",
                                borderColor: "var(--border)",
                            }}
                        />
                    </div>
                </div>

                {/* Mobile Logout */}
                <button
                    type="button"
                    className="flex items-center justify-center rounded-full border text-base md:hidden"
                    style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-soft)",
                        color: "var(--text-muted)",
                    }}
                    onClick={logoutHandler}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket" />
                </button>

                {/* Center Navigation */}
                <div className="hidden items-center justify-center gap-1 md:flex md:gap-3">
                    <Link href="/feed">
                        <div className="flex min-w-16 flex-col items-center px-2 py-2">
                            <i className="fa-solid fa-house"></i>
                            <h4 className="text-xs sm:text-sm">Home</h4>
                        </div>
                    </Link>

                    <Link href="/network">
                        <div className="flex min-w-16 flex-col items-center px-2 py-2">
                            <i className="fa-solid fa-network-wired"></i>
                            <h4 className="text-xs sm:text-sm">Network</h4>
                        </div>
                    </Link>

                    <Link href="/messages">
                        <div className="flex min-w-16 flex-col items-center px-2 py-2">
                            <i className="fa-regular fa-comment-dots"></i>
                            <h4 className="text-xs sm:text-sm">Messages</h4>
                        </div>
                    </Link>

                    <Link href="/profile">
                        <div className="flex min-w-16 flex-col items-center px-2 py-2">
                            <i className="fa-solid fa-circle-user"></i>
                            <h4 className="text-xs sm:text-sm">Profile</h4>
                        </div>
                    </Link>
                </div>

                {/* Right Section */}
                <div className="me-10 hidden items-center justify-end gap-2 md:flex">
                    <button
                        type="button"
                        className="rounded-full border px-3 py-2 text-sm font-medium"
                        style={{
                            borderColor: "var(--border)",
                            background: "var(--surface-soft)",
                            color: "var(--text)",
                        }}
                    >
                        <i className="fa-solid fa-moon text-lg"></i>
                    </button>

                    <div className="flex min-w-16 flex-col items-center px-2 py-2" type="button" onClick={logoutHandler}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <h4 className="text-xs sm:text-sm">Logout</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;