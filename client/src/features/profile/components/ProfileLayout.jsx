"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useProfile, useToggleFollow, useUserPosts } from "@/features/profile/hooks/useProfile";
import PostCard from "@/features/feed/components/PostCard";
import { resolveProfilePicture, resolveMediaSrc } from "@/shared/lib/imageHelpers";
import { getTechIconClass } from "@/shared/lib/techIcons";
import EditProfileModal from "./EditProfileModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBanner } from "@/services/userService";
import { deletePost, toggleFeaturePost } from "@/services/postService";

// Helper to get first image from post content (same logic as PostCard)
const getFirstMarkdownImage = (text) => {
    if (!text) return null;
    const match = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : null;
};

// ── Skeleton Loader ──────────────────────────────────────────────────────────
function ProfileSkeleton() {
    return (
        <div className="min-h-screen animate-pulse pb-20" style={{ background: "var(--bg)" }}>
            <div className="h-48 w-full bg-zinc-800/50" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-16">
                <div className="flex flex-col gap-4">
                    <div className="w-32 h-32 rounded-full border-4 border-zinc-950 bg-zinc-800" />
                    <div className="flex justify-between items-start">
                        <div className="space-y-3">
                            <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
                            <div className="h-4 w-32 bg-zinc-800 rounded" />
                        </div>
                        <div className="flex gap-3">
                            <div className="w-24 h-10 bg-zinc-800 rounded-lg" />
                            <div className="w-24 h-10 bg-zinc-800 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Layout Component ────────────────────────────────────────────────────
export default function ProfileLayout({ userId, isOwnProfile }) {
    const queryClient = useQueryClient();
    const { data: profileWrapper, isLoading: profileLoading } = useProfile(userId);
    const profile = profileWrapper?.profile; 
    const user = profile?.userId || profileWrapper?.user; 
    const isFollowing = profile?.isFollowing || false;

    const { data: posts, isLoading: postsLoading } = useUserPosts(userId);
    const { mutate: toggleFollow } = useToggleFollow(userId, isFollowing);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
        },
    });

    const featureMutation = useMutation({
        mutationFn: toggleFeaturePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        },
    });

    const bannerMutation = useMutation({
        mutationFn: (file) => {
            const formData = new FormData();
            formData.append("banner", file);
            return updateBanner(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        },
    });

    const handleBannerUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            bannerMutation.mutate(file);
        }
    };

    // Compute Featured Projects dynamically (custom featured toggle)
    const featuredProjects = useMemo(() => {
        if (!posts || posts.length === 0) return [];
        return posts.filter(p => p.isFeatured === true);
    }, [posts]);

    // Feed projects (all other posts)
    const feedProjects = useMemo(() => {
        if (!posts) return [];
        return posts.filter(p => !p.isFeatured);
    }, [posts]);

    if (profileLoading) return <ProfileSkeleton />;

    if (!user) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-zinc-500">
                <i className="fa-solid fa-user-xmark text-4xl mb-3 text-zinc-700"></i>
                <p>User not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 pt-4 md:pt-8" style={{ background: "var(--bg)" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                
                {/* ── Profile Header ── */}
                <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800/80 shadow-xl overflow-hidden mb-8 backdrop-blur-sm">
                    {/* Cover Banner */}
                    <div className="h-48 w-full relative group/banner border-b border-zinc-800 bg-zinc-950 overflow-hidden">
                        {profile?.bannerPicture ? (
                            <img src={profile.bannerPicture} alt="Profile Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-zinc-950">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent"></div>
                            </div>
                        )}
                        
                        {/* Change Banner overlay for owner */}
                        {isOwnProfile && (
                            <label className="absolute right-4 bottom-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 cursor-pointer transition-all border border-zinc-800 opacity-0 group-hover/banner:opacity-100 backdrop-blur-sm shadow-md">
                                <i className="fa-solid fa-camera"></i>
                                {bannerMutation.isPending ? "Uploading..." : "Change Banner"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBannerUpload}
                                    disabled={bannerMutation.isPending}
                                />
                            </label>
                        )}
                    </div>

                    {/* Profile Identity and Bio */}
                    <div className="relative z-10 px-4 sm:px-6 pb-6">

                        {/* Avatar floats over banner; buttons sit beside it on mobile */}
                        <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
                            {/* Avatar */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-2xl shrink-0">
                                {user.profilePicture ? (
                                    <img src={resolveProfilePicture(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800" />
                                )}
                            </div>

                            {/* Action Buttons — right of avatar */}
                            <div className="flex items-center gap-2 pb-1">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 border border-zinc-700/50 shadow-md cursor-pointer"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                        <span className="hidden sm:inline">Edit Profile</span>
                                        <span className="sm:hidden">Edit</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => toggleFollow()}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                                                isFollowing 
                                                    ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                                    : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                                            }`}
                                        >
                                            {isFollowing ? (
                                                <><i className="fa-solid fa-user-check mr-1"></i>Following</>
                                            ) : (
                                                <><i className="fa-solid fa-plus mr-1"></i>Follow</>
                                            )}
                                        </button>
                                        <Link 
                                            href={`/messages?peer=${user._id}`}
                                            className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-all flex items-center gap-1.5 shadow-md"
                                        >
                                            <i className="fa-regular fa-comment-dots"></i>
                                            <span className="hidden sm:inline">Message</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Meta and Description Info */}
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
                                {user.name}
                                <i className="fa-solid fa-circle-check text-emerald-500 text-base sm:text-lg"></i>
                            </h1>
                            <p className="text-xs text-zinc-500 font-semibold mt-0.5">@{user.username}</p>
                            <p className="text-sm font-bold text-emerald-400 mt-1.5">{profile?.headline || "Developer"}</p>
                            
                            {/* Short Bio Block */}
                            {profile?.bio && (
                                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mt-3 whitespace-pre-wrap select-text">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Location / Meta row */}
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-500 font-semibold">
                                {profile?.location && (
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-solid fa-location-dot text-zinc-600"></i> {profile.location}
                                    </span>
                                )}
                                {profile?.socialLinks?.portfolio && (
                                    <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                                        <i className="fa-solid fa-globe text-zinc-600"></i> Website
                                    </a>
                                )}
                            </div>

                            {/* Stats — flex with equal spacing, no overflow */}
                            <div className="flex items-center mt-5 pt-4 border-t border-zinc-900">
                                <div className="flex-1 text-center">
                                    <div className="text-sm font-extrabold text-zinc-100">{posts?.length || 0}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Projects</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-800" />
                                <div className="flex-1 text-center">
                                    <div className="text-sm font-extrabold text-zinc-100">{profile?.followersCount || 0}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Followers</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-800" />
                                <div className="flex-1 text-center">
                                    <div className="text-sm font-extrabold text-zinc-100">{profile?.followingCount || 0}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Following</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Two-Column Main Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* ── LEFT COLUMN: Pinned + All Projects ── */}
                    <div className="lg:col-span-2 space-y-10">
                        
                        {/* 1. Featured / Pinned Projects */}
                        {featuredProjects.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <i className="fa-regular fa-star text-emerald-500 text-sm"></i>
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
                                                const firstMediaItem = post.media.find(m => m.type === 'image');
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
                                                                className="w-8 h-8 rounded-lg hover:bg-zinc-850 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-zinc-250 flex items-center justify-center cursor-pointer transition-all bg-zinc-950/20 backdrop-blur-sm"
                                                            >
                                                                <i className="fa-solid fa-ellipsis-vertical"></i>
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
                                                                            <i className="fa-regular fa-pen-to-square"></i>
                                                                            Edit Project
                                                                        </Link>
                                                                        
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveDropdownId(null);
                                                                                featureMutation.mutate(post._id);
                                                                            }}
                                                                            disabled={featureMutation.isPending}
                                                                            className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                                                                        >
                                                                            <i className="fa-regular fa-star"></i>
                                                                            {post.isFeatured ? "Unfeature" : "Feature to top"}
                                                                        </button>

                                                                        <div className="h-px bg-zinc-900 my-1" />

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveDropdownId(null);
                                                                                if (window.confirm("Are you sure you want to delete this project?")) {
                                                                                    deleteMutation.mutate(post._id);
                                                                                }
                                                                            }}
                                                                            disabled={deleteMutation.isPending}
                                                                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                                                                        >
                                                                            <i className="fa-regular fa-trash-can"></i>
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
                                                                <img src={coverImg} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
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
                                                                        <i className={`${getTechIconClass(tech)} text-[9px]`}></i>
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                                {post.techStack.length > 3 && (
                                                                    <span className="text-[9px] text-zinc-600 font-semibold self-center ml-1">+{post.techStack.length - 3} more</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Card Footer Actions */}
                                                    <div className="pt-4 border-t border-zinc-850 mt-5 flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3.5 text-[11px] text-zinc-500">
                                                                <span className="flex items-center gap-1"><i className="fa-solid fa-heart text-xs text-emerald-500/80"></i> {post.likeCount || 0}</span>
                                                                <span className="flex items-center gap-1"><i className="fa-regular fa-comment text-xs"></i> {post.commentCount || 0}</span>
                                                            </div>
                                                            <Link href={`/posts/${post._id}`} className="text-zinc-400 hover:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors">
                                                                View Project
                                                                <i className="fa-solid fa-arrow-right text-[10px]"></i>
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
                                                                        className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 bg-zinc-950/20 hover:bg-zinc-800/30 rounded-lg py-1.5 text-[10px] font-bold transition-all cursor-pointer"
                                                                    >
                                                                        <i className={link.label === "Github" ? "fa-brands fa-github text-xs" : "fa-solid fa-globe text-xs"}></i>
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
                        )}

                        {/* 2. All Showcases / Feed */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fa-solid fa-code-branch text-emerald-500 text-sm"></i>
                                <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">All Showcases</h2>
                            </div>

                            <div className="space-y-4">
                                {postsLoading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : feedProjects.length > 0 ? (
                                    feedProjects.map((post) => <PostCard key={post._id} post={post} showMenu={isOwnProfile} />)
                                ) : featuredProjects.length > 0 ? (
                                    <p className="text-zinc-500 text-xs text-center py-8">All other showcases are featured above.</p>
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                                        <p className="text-zinc-500 text-xs">No other showcases published.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── RIGHT COLUMN: Sidebar about, skills, education ── */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                        
                        {/* About Professional Card */}
                        <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                                <i className="fa-regular fa-address-card text-emerald-500"></i> About
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Current Position</span>
                                    <p className="text-sm font-semibold text-zinc-200 mt-0.5">{profile?.currentPosition || "Not specified"}</p>
                                </div>
                                {profile?.location && (
                                    <div>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Location</span>
                                        <p className="text-sm font-semibold text-zinc-200 mt-0.5">{profile.location}</p>
                                    </div>
                                )}
                                
                                {/* Social Web Presence */}
                                <div className="pt-2 border-t border-zinc-900">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Web Presence</span>
                                    <div className="flex flex-col gap-2 mt-2">
                                        {profile?.socialLinks?.github && (
                                            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors">
                                                <i className="fa-brands fa-github text-sm"></i> GitHub Profile
                                            </a>
                                        )}
                                        {profile?.socialLinks?.linkedin && (
                                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors">
                                                <i className="fa-brands fa-linkedin text-sm"></i> LinkedIn Profile
                                            </a>
                                        )}
                                        {profile?.socialLinks?.portfolio && (
                                            <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors">
                                                <i className="fa-solid fa-link text-sm"></i> Portfolio Site
                                            </a>
                                        )}
                                        {!profile?.socialLinks?.github && !profile?.socialLinks?.linkedin && !profile?.socialLinks?.portfolio && (
                                            <p className="text-zinc-600 text-xs italic">No social profiles linked</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Technical Stack / Skills Card */}
                        <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                                <i className="fa-solid fa-screwdriver-wrench text-emerald-500"></i> Skills & Stack
                            </h3>
                            {profile?.skills && profile.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-emerald-500/20 transition-colors">
                                            <i className={`${getTechIconClass(skill)} text-xs text-zinc-400`}></i>
                                            <span className="text-xs font-medium text-zinc-300">{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-xs">No stack specified yet.</p>
                            )}
                        </section>

                        {/* Interests Card */}
                        {user.interests && user.interests.length > 0 && (
                            <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                                    <i className="fa-regular fa-compass text-emerald-500"></i> Interests
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.interests.map((interest, idx) => (
                                        <span key={idx} className="bg-zinc-950/40 text-zinc-400 border border-zinc-850 px-2.5 py-1 rounded-md text-xs font-medium capitalize">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education history timeline */}
                        {profile?.education && profile.education.length > 0 && (
                            <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                                    <i className="fa-solid fa-graduation-cap text-emerald-500"></i> Education
                                </h3>
                                <div className="space-y-4">
                                    {profile.education.map((edu, idx) => (
                                        <div key={idx} className="border-l border-zinc-850 pl-3.5 relative py-0.5">
                                            <div className="absolute w-2 h-2 rounded-full bg-emerald-500 -left-1 top-1.5 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                            <p className="text-xs font-bold text-zinc-200">{edu.school || "School"}</p>
                                            <p className="text-[11px] text-zinc-400 mt-0.5">{edu.degree} in {edu.fieldOfStudy}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditProfileModal
                key={`${isEditModalOpen}-${profile?._id || "profile"}`}
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                initialData={profile} 
                userId={userId} 
            />
        </div>
    );
}
