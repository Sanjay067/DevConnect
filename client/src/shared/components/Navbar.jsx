"use client";

import React from "react";
import Link from "next/link";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter, usePathname } from "next/navigation";

function Navbar() {
    const logoutMutation = useLogout();
    const router = useRouter();
    const pathname = usePathname();

    const logoutHandler = () => {
        logoutMutation.mutate(null, {
            onSuccess: () => router.push("/")
        })
    }

    // Hide Navbar completely on post editor pages to maximize writing space
    const isPostEditor = pathname?.startsWith("/posts/create") || pathname?.match(/^\/posts\/[^/]+\/edit/);
    if (isPostEditor) return null;

    const isHomeActive = pathname === "/feed" || pathname?.startsWith("/posts");
    const isNetworkActive = pathname === "/network";
    const isMessagesActive = pathname === "/messages";
    const isProfileActive = pathname === "/profile";

    return (
        <div
            className="sticky top-4 z-50 mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3.5 shadow-xl max-w-5xl mx-auto transition-all duration-300 hover:border-zinc-700/50"
            style={{ boxShadow: "var(--shadow-premium)" }}
        >
            <div className="flex w-full items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">

                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <Link href="/feed">
                        <div className="flex items-center gap-2 group">
                            <i className="fa-regular fa-compass text-base text-emerald-500 transition-transform duration-300 group-hover:rotate-45"></i>
                            <h2 className="text-sm font-bold tracking-tight text-zinc-100">DevConnect</h2>
                        </div>
                    </Link>

                    {/* Search */}
                    <div className="relative flex items-center">
                        <i className="fa-solid fa-search pointer-events-none absolute left-3 text-[10px] text-zinc-500"></i>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="h-9 w-[52vw] rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 py-2 pr-3 pl-9 text-xs outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 sm:w-44 md:w-56"
                            style={{ color: "var(--text)" }}
                        />
                    </div>
                </div>

                {/* Mobile Logout */}
                <button
                    type="button"
                    className="flex w-9 h-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors md:hidden"
                    onClick={logoutHandler}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket text-sm" />
                </button>

                {/* Center Navigation */}
                <div className="hidden items-center justify-center gap-1 md:flex md:gap-3">
                    <Link href="/feed">
                        <div className={`flex min-w-16 flex-col items-center px-2 pt-2 pb-1 transition-colors cursor-pointer ${isHomeActive ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-200'}`}>
                            <i className="fa-solid fa-house text-xs"></i>
                            <h4 className="text-[10px] font-medium mt-1">Home</h4>
                            <div className={`h-0.5 w-5 mt-1 rounded-full transition-all duration-300 ${isHomeActive ? 'bg-emerald-500 opacity-100 scale-x-100' : 'bg-transparent opacity-0 scale-x-0'}`} />
                        </div>
                    </Link>

                    <Link href="/network">
                        <div className={`flex min-w-16 flex-col items-center px-2 pt-2 pb-1 transition-colors cursor-pointer ${isNetworkActive ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-200'}`}>
                            <i className="fa-solid fa-network-wired text-xs"></i>
                            <h4 className="text-[10px] font-medium mt-1">Network</h4>
                            <div className={`h-0.5 w-5 mt-1 rounded-full transition-all duration-300 ${isNetworkActive ? 'bg-emerald-500 opacity-100 scale-x-100' : 'bg-transparent opacity-0 scale-x-0'}`} />
                        </div>
                    </Link>

                    <Link href="/messages">
                        <div className={`flex min-w-16 flex-col items-center px-2 pt-2 pb-1 transition-colors cursor-pointer ${isMessagesActive ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-200'}`}>
                            <i className="fa-regular fa-comment-dots text-xs"></i>
                            <h4 className="text-[10px] font-medium mt-1">Messages</h4>
                            <div className={`h-0.5 w-5 mt-1 rounded-full transition-all duration-300 ${isMessagesActive ? 'bg-emerald-500 opacity-100 scale-x-100' : 'bg-transparent opacity-0 scale-x-0'}`} />
                        </div>
                    </Link>

                    <Link href="/profile">
                        <div className={`flex min-w-16 flex-col items-center px-2 pt-2 pb-1 transition-colors cursor-pointer ${isProfileActive ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-200'}`}>
                            <i className="fa-solid fa-circle-user text-xs"></i>
                            <h4 className="text-[10px] font-medium mt-1">Profile</h4>
                            <div className={`h-0.5 w-5 mt-1 rounded-full transition-all duration-300 ${isProfileActive ? 'bg-emerald-500 opacity-100 scale-x-100' : 'bg-transparent opacity-0 scale-x-0'}`} />
                        </div>
                    </Link>
                </div>

                {/* Right Section */}
                <div className="hidden items-center justify-end gap-2 md:flex">
                    <button
                        type="button"
                        onClick={logoutHandler}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-xs font-semibold cursor-pointer"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Navbar;