"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

function CreatePostCard() {
    const router = useRouter();
    const currentUser = useSelector((state) => state.auth.user);

    const handleNavigate = () => {
        router.push("/posts/create");
    };

    return (
        <div className="w-full max-w-2xl mx-auto my-4 shrink-0">
            <div
                className="w-full rounded-2xl p-5 border border-zinc-800 border-t-2 "
                style={{
                    background: "var(--surface)",

                }}
            >
                <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-800">
                        {currentUser?.profilePicture ? (
                            <img
                                src={resolveProfilePicture(currentUser.profilePicture)}
                                alt={currentUser?.name || "Me"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-900/60 to-zinc-900"></div>
                        )}
                    </div>

                    {/* Input trigger */}
                    <button
                        onClick={handleNavigate}
                        className="flex-1 text-left border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 text-xs font-normal transition-all outline-none hover:border-zinc-700 hover:text-zinc-300 focus:ring-1 focus:ring-emerald-500/20 cursor-pointer"
                        style={{ background: "#0c0c0e" }}
                    >
                        What&apos;s on your mind{currentUser?.name ? `, ${currentUser.name}` : ''}?
                    </button>
                </div>

                {/* Action strip */}
                <div className="flex items-center gap-6 pt-3.5 mt-3.5 border-t border-zinc-800/70 text-zinc-500 text-[11px] font-medium">
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-zinc-200 transition-colors cursor-pointer">
                        <i className="fa-regular fa-image text-emerald-500 text-xs"></i>
                        Media
                    </button>
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-zinc-200 transition-colors cursor-pointer">
                        <i className="fa-solid fa-code text-emerald-500 text-xs"></i>
                        Tech Stack
                    </button>
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-zinc-200 transition-colors cursor-pointer">
                        <i className="fa-solid fa-link text-emerald-500 text-xs"></i>
                        Links
                    </button>
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-zinc-200 transition-colors ml-auto cursor-pointer">
                        <i className="fa-regular fa-handshake text-emerald-500 text-xs"></i>
                        Looking for Contributors
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreatePostCard;
