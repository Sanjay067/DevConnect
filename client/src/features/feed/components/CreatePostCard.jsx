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
            <div className="w-full rounded-2xl p-5 bg-white border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        {currentUser?.profilePicture ? (
                            <img
                                src={resolveProfilePicture(currentUser.profilePicture)}
                                alt={currentUser?.name || "Me"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-yellow-500"></div>
                        )}
                    </div>
                    <button
                        onClick={handleNavigate}
                        className="flex-1 text-left bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-full px-5 py-2.5 text-gray-500 text-sm font-medium transition-colors"
                    >
                        Showcase a new project...
                    </button>
                </div>

                <div className="flex items-center gap-6 pt-3 mt-3 border-t border-gray-50 text-gray-500 text-xs font-semibold">
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <i className="fa-regular fa-image text-blue-500 text-sm"></i>
                        Media
                    </button>
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-green-600 transition-colors">
                        <i className="fa-solid fa-code text-green-500 text-sm"></i>
                        Tech Stack
                    </button>
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <i className="fa-solid fa-link text-indigo-500 text-sm"></i>
                        Links
                    </button>
                    <button onClick={handleNavigate} className="flex items-center gap-2 hover:text-yellow-600 transition-colors ml-auto">
                        <i className="fa-regular fa-handshake text-yellow-500 text-sm"></i>
                        Looking for Contributors
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreatePostCard;
