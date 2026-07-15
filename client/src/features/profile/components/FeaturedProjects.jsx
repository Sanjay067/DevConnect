import React, { useState } from "react";
import Link from "next/link";
import { resolveMediaSrc } from "@/shared/lib/imageHelpers";
import { getTechIconClass } from "@/shared/lib/techIcons";

// Helper to get first image from post content (same logic as PostCard)
const getFirstMarkdownImage = (text) => {
  if (!text) return null;
  const match = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
};

export default function FeaturedProjects({
  featuredProjects,
  isOwnProfile,
  postsLoading,
  isDeletePending,
  isFeaturePending,
  onDeletePost,
  onToggleFeaturePost,
}) {
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  if (featuredProjects.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <i className="fa-regular fa-star text-emerald-500 text-sm" aria-hidden="true"></i>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">Featured Projects</h2>
      </div>

      {postsLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredProjects.map((post) => {
            const markdownText = post.content?.blocks?.[0]?.data?.text || "";
            let coverImg = getFirstMarkdownImage(markdownText);
            if (!coverImg && post.media && post.media.length > 0) {
              const firstMediaItem = post.media.find((m) => m.type === "image");
              if (firstMediaItem) coverImg = resolveMediaSrc(firstMediaItem);
            }

            return (
              <div
                key={post._id}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700/60 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between min-h-[340px]"
              >
                {isOwnProfile && (
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      type="button"
                      onClick={() => setActiveDropdownId(activeDropdownId === post._id ? null : post._id)}
                      className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-855 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-all"
                    >
                      <i className="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
                    </button>

                    {activeDropdownId === post._id && (
                      <>
                        <div
                          className="fixed inset-0 z-30 cursor-default"
                          onClick={() => setActiveDropdownId(null)}
                        />
                        <div className="absolute right-0 mt-1 z-40 min-w-[150px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                          <Link
                            href={`/posts/${post._id}/edit`}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <i className="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                            Edit Project
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdownId(null);
                              onToggleFeaturePost(post._id);
                            }}
                            disabled={isFeaturePending}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                          >
                            <i className="fa-regular fa-star" aria-hidden="true"></i>
                            {post.isFeatured ? "Unfeature" : "Feature to top"}
                          </button>

                          <div className="h-px bg-zinc-900 my-1" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdownId(null);
                              if (window.confirm("Are you sure you want to delete this project?")) {
                                onDeletePost(post._id);
                              }
                            }}
                            disabled={isDeletePending}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                          >
                            <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div>
                  {/* Cover image or gradient placeholder */}
                  {coverImg ? (
                    <div className="h-36 w-full rounded-xl overflow-hidden mb-4 border border-zinc-850">
                      <img src={coverImg} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500 animate-in fade-in" />
                    </div>
                  ) : (
                    <div className="h-36 w-full rounded-xl mb-4 bg-gradient-to-br from-zinc-850 to-zinc-950 flex items-center justify-center border border-zinc-850 p-4 overflow-hidden relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent"></div>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center truncate">{post.title}</span>
                    </div>
                  )}

                  <h3 className="text-base font-extrabold text-zinc-100 group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1">{post.title}</h3>
                  {post.shortDescription && (
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">{post.shortDescription}</p>
                  )}

                  {/* Stack badges */}
                  {post.techStack && post.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {post.techStack.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="bg-zinc-950 border border-zinc-850 text-zinc-500 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 capitalize">
                          <i className={`${getTechIconClass(tech)} text-[9px]`} aria-hidden="true"></i>
                          {tech}
                        </span>
                      ))}
                      {post.techStack.length > 3 && (
                        <span className="text-[9px] text-zinc-650 font-semibold self-center ml-1">+{post.techStack.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-zinc-850 mt-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5 text-[11px] text-zinc-505">
                      <span className="flex items-center gap-1"><i className="fa-solid fa-star text-xs text-amber-500" aria-hidden="true"></i> {post.likeCount || 0}</span>
                      <span className="flex items-center gap-1"><i className="fa-regular fa-comment text-xs" aria-hidden="true"></i> {post.commentCount || 0}</span>
                    </div>
                    <Link href={`/posts/${post._id}`} className="text-zinc-400 hover:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors">
                      View Project
                      <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
                    </Link>
                  </div>

                  {/* GitHub / Demo Buttons */}
                  {post.links && post.links.length > 0 && (
                    <div className="flex gap-2">
                      {post.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-205 bg-zinc-950/20 hover:bg-zinc-800/30 rounded-lg py-1.5 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          <i className={link.label === "Github" ? "fa-brands fa-github text-xs" : "fa-solid fa-globe text-xs"} aria-hidden="true"></i>
                          {link.label === "Github" ? "GitHub" : "Live Demo"}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
