"use client";

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter, usePathname } from "next/navigation";

function Navbar() {
    const currentUser = useSelector((state) => state.auth.user);
    const logoutMutation = useLogout();
    const router = useRouter();
    const pathname = usePathname();

    const [query, setQuery] = React.useState("");
    const [isScrolling, setIsScrolling] = React.useState(false);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            setQuery(params.get("q") || "");
        }
    }, [pathname]);

    React.useEffect(() => {
        let scrollTimeout;
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    const logoutHandler = () => {
        logoutMutation.mutate(null, {
            onSuccess: () => {
                document.cookie = "is_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                router.push("/");
            }
        });
    };

    // Hide Navbar completely on post editor pages to maximize writing space
    const isPostEditor = pathname?.startsWith("/posts/create") || pathname?.match(/^\/posts\/[^/]+\/edit/);
    if (isPostEditor) return null;

    const isHomeActive = pathname === "/feed" || pathname?.startsWith("/posts");
    const isNetworkActive = pathname === "/network";
    const isMessagesActive = pathname === "/messages";
    const isProfileActive = pathname?.startsWith("/profile");

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (typeof window !== "undefined") {
            if (pathname !== "/network") {
                router.push(`/network?q=${encodeURIComponent(val)}`);
            } else {
                const url = val.trim() ? `/network?q=${encodeURIComponent(val)}` : "/network";
                router.replace(url);
            }
        }
    };

    return (
        <>
            {/* ── Mobile Top Header Bar ── */}
            <div className="md:hidden sticky top-0 z-50 flex items-center justify-between gap-3 bg-zinc-950/90 border-b border-zinc-900 px-4 py-3 shrink-0 backdrop-blur-md">
                <Link href="/feed" className="group">
                    <div className="flex items-center gap-1.5">
                        <i className="fa-regular fa-compass text-emerald-500 text-base transition-transform duration-300 group-hover:rotate-45"></i>
                        <span className="font-extrabold text-sm tracking-tight text-zinc-100">devConnect</span>
                    </div>
                </Link>
                <div className="relative flex-1 max-w-[200px]">
                    <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500"></i>
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearchChange}
                        placeholder="Search..."
                        className="w-full h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder-zinc-500 py-1 pr-2.5 pl-7 text-[11px] outline-none focus:border-emerald-500/50"
                        style={{ color: "var(--text)" }}
                    />
                </div>
                <button
                    type="button"
                    onClick={logoutHandler}
                    className="w-8 h-8 rounded-lg border border-zinc-850 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer text-xs transition-colors"
                >
                    <i className="fa-solid fa-arrow-right-from-bracket" />
                </button>
            </div>

            {/* ── Desktop Top Sticky Navbar ── */}
            <div
                className="hidden md:block sticky top-4 z-50 mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3.5 shadow-xl max-w-5xl mx-auto transition-all duration-300 hover:border-zinc-700/50"
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
                                value={query}
                                onChange={handleSearchChange}
                                placeholder="Search users..."
                                className="h-9 w-44 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 py-2 pr-3 pl-9 text-xs outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 md:w-56"
                                style={{ color: "var(--text)" }}
                            />
                        </div>
                    </div>

                    {/* Center Navigation */}
                    <div className="flex items-center justify-center gap-3">
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
                    <div className="flex items-center justify-end gap-2">
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

            {/* ── Mobile Bottom Floating Tab Bar (Hides on Scroll) ── */}
            <div
                className={`fixed bottom-4 left-4 right-4 z-50 md:hidden bg-zinc-950/95 border border-zinc-850/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md max-w-sm mx-auto transition-all duration-300 ${
                    isScrolling ? "translate-y-[calc(100%+24px)] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                }`}
                style={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)" }}
            >
                <div className="flex items-center justify-around">
                    <Link href="/feed" className="flex-1">
                        <div className={`flex flex-col items-center py-1 transition-colors ${isHomeActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            <i className="fa-solid fa-house text-base"></i>
                            <span className="text-[9px] font-semibold mt-1">Home</span>
                        </div>
                    </Link>
                    <Link href="/network" className="flex-1">
                        <div className={`flex flex-col items-center py-1 transition-colors ${isNetworkActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            <i className="fa-solid fa-network-wired text-base"></i>
                            <span className="text-[9px] font-semibold mt-1">Network</span>
                        </div>
                    </Link>
                    <Link href="/messages" className="flex-1">
                        <div className={`flex flex-col items-center py-1 transition-colors ${isMessagesActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            <i className="fa-regular fa-comment-dots text-base"></i>
                            <span className="text-[9px] font-semibold mt-1">Chat</span>
                        </div>
                    </Link>
                    <Link href="/profile" className="flex-1">
                        <div className={`flex flex-col items-center py-1 transition-colors ${isProfileActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            <i className="fa-solid fa-circle-user text-base"></i>
                            <span className="text-[9px] font-semibold mt-1">Profile</span>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default Navbar;