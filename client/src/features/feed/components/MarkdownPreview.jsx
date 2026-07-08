import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { renderMarkdown } from "../utils/markdownParser";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

function MarkdownPreview({ markdown, title, shortDescription, githubUrl, liveUrl }) {
    const currentUser = useSelector((state) => state.auth.user);

    const renderedHtml = useMemo(() => renderMarkdown(markdown), [markdown]);

    // Extract @[tech] mentions for live badge preview
    const techStack = useMemo(() => {
        const results = [];
        const regex = /@\[([^\]]+)\]/g;
        let match;
        while ((match = regex.exec(markdown)) !== null) {
            const name = match[1].trim();
            if (name && !results.includes(name)) results.push(name);
        }
        return results;
    }, [markdown]);

    const hasContent = title || shortDescription || renderedHtml;

    if (!hasContent) {
        return (
            <div className="flex h-full items-center justify-center select-none"
                style={{ background: "#111113" }}>
                <div className="text-center">
                    <i className="fa-regular fa-eye text-zinc-700 text-3xl mb-3 block"></i>
                    <p className="text-zinc-600 text-xs">Your post preview will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto" style={{ background: "#111113" }}>
            {/* Panel label */}
            <div className="flex items-center gap-1.5 px-5 pt-4 pb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Live Preview</span>
            </div>

            {/* PostCard-style preview */}
            <div className="mx-4 mb-6 rounded-2xl border border-zinc-800 overflow-hidden"
                style={{
                    background: "var(--surface)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 24px rgba(0,0,0,0.5)",
                }}>

                {/* Author row */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-zinc-800/50">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-zinc-800 shrink-0">
                        {currentUser?.profilePicture ? (
                            <img
                                src={resolveProfilePicture(currentUser.profilePicture)}
                                alt={currentUser?.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-100 leading-snug">
                            {currentUser?.name || "Your Name"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            @{currentUser?.username || "username"}
                            <span className="mx-1.5 text-zinc-700">•</span>
                            Just now
                        </p>
                    </div>
                </div>

                {/* Title + description */}
                <div className="px-5 pt-4">
                    {title ? (
                        <h2 className="text-xl font-extrabold text-zinc-50 tracking-tight leading-snug">
                            {title}
                        </h2>
                    ) : (
                        <h2 className="text-xl font-extrabold text-zinc-700 tracking-tight italic">
                            Project title...
                        </h2>
                    )}
                    {shortDescription && (
                        <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                            {shortDescription}
                        </p>
                    )}
                </div>

                {/* Rendered markdown body */}
                {renderedHtml && (
                    <div
                        className="px-5 pt-3 pb-2 text-sm text-zinc-300 leading-relaxed overflow-x-auto select-text"
                        dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
                )}



                {/* Links */}
                {(githubUrl || liveUrl) && (
                    <div className="flex items-center gap-2 px-5 pb-4 pt-1">
                        {githubUrl && (
                            <span className="flex items-center gap-1.5 border border-zinc-800 text-zinc-400 bg-zinc-950/40 rounded-lg px-3 py-1.5 text-xs font-semibold">
                                <i className="fa-brands fa-github text-sm"></i> GitHub
                            </span>
                        )}
                        {liveUrl && (
                            <span className="flex items-center gap-1.5 border border-zinc-800 text-zinc-400 bg-zinc-950/40 rounded-lg px-3 py-1.5 text-xs font-semibold">
                                <i className="fa-solid fa-globe text-sm"></i> Live Demo
                            </span>
                        )}
                    </div>
                )}

                {/* Footer skeleton */}
                <div className="flex items-center gap-5 px-5 py-3 border-t border-zinc-800 text-zinc-600">
                    <span className="flex items-center gap-1.5 text-xs">
                        <i className="fa-regular fa-star text-sm"></i> 0
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                        <i className="fa-regular fa-comment text-sm"></i> 0
                    </span>
                </div>
            </div>
        </div>
    );
}

export default MarkdownPreview;
